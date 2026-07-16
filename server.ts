import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache, doc, getDoc, writeBatch } from 'firebase/firestore';

// Define path resolution supporting both ES Modules (dev) and CommonJS (compiled)
const getAppDir = () => {
  return process.cwd();
};
const appDir = getAppDir();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DB_FILE = path.join(appDir, 'db.json');
const DB_FILE_SANDBOX = path.join(appDir, 'db_sandbox.json');
const SANDBOX_STATE_FILE = path.join(appDir, 'sandbox_state.json');
const UPLOADS_DIR = path.join(appDir, 'uploads');

let isSandboxActive = false;

// Load sandbox state at boot
try {
  if (fs.existsSync(SANDBOX_STATE_FILE)) {
    const sandboxState = JSON.parse(fs.readFileSync(SANDBOX_STATE_FILE, 'utf8'));
    isSandboxActive = !!sandboxState.active;
    console.log("⚙️ Sandbox state loaded from file. Active:", isSandboxActive);
  }
} catch (e) {
  console.error("Failed to parse sandbox_state.json", e);
}

// Initialize Firebase Client SDK for server-side persistence with in-memory cache
let dbFirestore: any = null;
let firebaseConfig: any = null;

try {
  const firebaseConfigPath = path.join(appDir, 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  }
} catch (e) {
  console.error("⚠️ Failed to load firebase-applet-config.json", e);
}

// Fallback/Override with Environment Variables for App Hosting
if (!firebaseConfig) {
  firebaseConfig = {};
}

const finalConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || "",
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || "",
  appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId || "",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId || "",
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || process.env.VITE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || "",
  oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || process.env.VITE_FIREBASE_OAUTH_CLIENT_ID || firebaseConfig.oAuthClientId || ""
};

try {
  if (finalConfig.projectId && finalConfig.apiKey) {
    const firebaseApp = initializeApp(finalConfig);
    if (finalConfig.firestoreDatabaseId) {
      dbFirestore = initializeFirestore(firebaseApp, {
        localCache: memoryLocalCache()
      }, finalConfig.firestoreDatabaseId);
    } else {
      dbFirestore = initializeFirestore(firebaseApp, {
        localCache: memoryLocalCache()
      });
    }
    console.log("🔥 Firebase Client SDK initialized with memoryLocalCache for project ID:", finalConfig.projectId);
  } else {
    console.log("⚠️ No Firebase configuration found (neither JSON file nor Environment Variables). Running without Firebase persistence.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Client SDK:", error);
}

// In-Memory DB Cache
let cacheDb: any = null;

async function loadDbFromFirestore() {
  if (!dbFirestore) {
    console.log("Firestore not initialized, loading from local db.json");
    return;
  }
  try {
    const keys = ['members', 'products', 'sellerProducts', 'orders', 'transactions', 'planB_Tree', 'csrFund', 'systemStats', 'otps', 'packageProductChoices', 'bankSettings'];
    const loadedData: any = {};
    let hasData = false;
    
    const collectionName = isSandboxActive ? 'app_sections_sandbox' : 'app_sections';
    const currentDbFile = isSandboxActive ? DB_FILE_SANDBOX : DB_FILE;
    
    console.log(`📥 Loading app sections from Firestore (${collectionName})...`);
    for (const key of keys) {
      const docRef = doc(dbFirestore, collectionName, key);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        loadedData[key] = snap.data().data;
        hasData = true;
      }
    }
    
    if (!hasData && isSandboxActive) {
      console.log("🛠️ Sandbox database empty in Firestore. Copying production database to initialize sandbox...");
      let prodData: any = null;
      if (fs.existsSync(DB_FILE)) {
        try {
          prodData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } catch (e) {}
      }
      if (prodData) {
        cacheDb = JSON.parse(JSON.stringify(prodData));
        fs.writeFileSync(DB_FILE_SANDBOX, JSON.stringify(cacheDb, null, 2), 'utf8');
        await saveDbToFirestore(cacheDb);
        console.log("✅ Sandbox database successfully initialized with production snapshot.");
        return;
      }
    }

    if (hasData) {
      console.log(`✅ Successfully loaded all database sections from Firestore (${collectionName})`);
      
      // Load local db.json for safe merging of any unsaved members or transactions
      let localDb: any = null;
      try {
        if (fs.existsSync(currentDbFile)) {
          localDb = JSON.parse(fs.readFileSync(currentDbFile, 'utf8'));
        }
      } catch (e) {
        console.error("⚠️ Failed to parse local db.json for backup/merge", e);
      }

      // Merge members (union by userId)
      const mergedMembers = [...(loadedData.members || [])];
      let hasMergedChanges = false;
      if (localDb && Array.isArray(localDb.members)) {
        for (const localMember of localDb.members) {
          if (!localMember || !localMember.userId) continue;
          const idx = mergedMembers.findIndex((m: any) => m.userId === localMember.userId);
          if (idx === -1) {
            console.log(`📦 Merging local member into Firestore: ${localMember.userId} / ${localMember.username}`);
            mergedMembers.push(localMember);
            hasMergedChanges = true;
          } else {
            // If exists, compare critical fields (like rank, status, balances) and if they are different, let local override to prevent stale overwrite on upload
            const firestoreMember = mergedMembers[idx];
            let memberUpdated = false;
            
            if (localMember.rank && localMember.rank !== firestoreMember.rank) {
              console.log(`🔄 Updating member ${localMember.userId} rank from Firestore "${firestoreMember.rank}" to local "${localMember.rank}"`);
              firestoreMember.rank = localMember.rank;
              memberUpdated = true;
            }
            if (localMember.role && localMember.role !== firestoreMember.role) {
              firestoreMember.role = localMember.role;
              memberUpdated = true;
            }
            if (localMember.sellerStatus && localMember.sellerStatus !== firestoreMember.sellerStatus) {
              firestoreMember.sellerStatus = localMember.sellerStatus;
              memberUpdated = true;
            }
            if (localMember.balanceECash !== undefined && localMember.balanceECash !== firestoreMember.balanceECash) {
              firestoreMember.balanceECash = localMember.balanceECash;
              memberUpdated = true;
            }
            if (localMember.balanceEMoney !== undefined && localMember.balanceEMoney !== firestoreMember.balanceEMoney) {
              firestoreMember.balanceEMoney = localMember.balanceEMoney;
              memberUpdated = true;
            }
            if (localMember.balanceECoupon !== undefined && localMember.balanceECoupon !== firestoreMember.balanceECoupon) {
              firestoreMember.balanceECoupon = localMember.balanceECoupon;
              memberUpdated = true;
            }
            
            if (memberUpdated) {
              hasMergedChanges = true;
            }
          }
        }
      }

      // Merge transactions (union by id)
      const mergedTransactions = [...(loadedData.transactions || [])];
      if (localDb && Array.isArray(localDb.transactions)) {
        for (const localTx of localDb.transactions) {
          if (!localTx || !localTx.id) continue;
          const exists = mergedTransactions.some((t: any) => t.id === localTx.id);
          if (!exists) {
            console.log(`📦 Merging local transaction into Firestore: ${localTx.id}`);
            mergedTransactions.push(localTx);
            hasMergedChanges = true;
          }
        }
      }

      // Merge orders (union by id)
      const mergedOrders = [...(loadedData.orders || [])];
      if (localDb && Array.isArray(localDb.orders)) {
        for (const localOrder of localDb.orders) {
          if (!localOrder || !localOrder.id) continue;
          const exists = mergedOrders.some((o: any) => o.id === localOrder.id);
          if (!exists) {
            console.log(`📦 Merging local order into Firestore: ${localOrder.id}`);
            mergedOrders.push(localOrder);
            hasMergedChanges = true;
          }
        }
      }

      cacheDb = {
        members: mergedMembers,
        products: loadedData.products || [],
        sellerProducts: loadedData.sellerProducts || [],
        orders: mergedOrders,
        transactions: mergedTransactions,
        planB_Tree: loadedData.planB_Tree || (localDb && localDb.planB_Tree) || {},
        csrFund: loadedData.csrFund || (localDb && localDb.csrFund) || { balance: 0, history: [] },
        systemStats: loadedData.systemStats || (localDb && localDb.systemStats) || { totalPlanBReserves: 0, totalTaxReserves: 0, totalCompanyProfits: 0 },
        otps: loadedData.otps || {},
        packageProductChoices: loadedData.packageProductChoices || undefined,
        bankSettings: loadedData.bankSettings || undefined
      };

      // Programmatic migration and self-healing check to ensure no duplicates and nateeplus is formatted correctly
      if (cacheDb.members) {
        let hasChanges = false;

        // 1. Initial migration check for old IDs or usernames
        const legacyIdx = cacheDb.members.findIndex((m: any) => m.userId === 'A260700001' || m.username === 'natee_sponsor');
        if (legacyIdx !== -1) {
          console.log("🔄 Migrating old first user to nateeplus in loaded Firestore database...");
          let str = JSON.stringify(cacheDb);
          str = str.replace(/A260700001/g, 'A260600001');
          str = str.replace(/natee_sponsor/g, 'nateeplus');
          cacheDb = JSON.parse(str);
          hasChanges = true;
        }

        // 2. Clear duplicates from database
        const seenUserIds = new Set<string>();
        const seenUsernames = new Set<string>();
        const uniqueMembers: any[] = [];

        for (const m of cacheDb.members) {
          if (!m || !m.userId || !m.username) continue;
          
          const cleanUserId = m.userId.trim();
          const cleanUsername = m.username.trim();

          if (seenUserIds.has(cleanUserId) || seenUsernames.has(cleanUsername)) {
            hasChanges = true;
            console.log(`🧹 Found and removing duplicate member: ${cleanUserId} / ${cleanUsername}`);
            continue;
          }

          seenUserIds.add(cleanUserId);
          seenUsernames.add(cleanUsername);
          uniqueMembers.push(m);
        }

        cacheDb.members = uniqueMembers;

        // 3. Ensure master/sponsor user nateeplus is exactly configured as requested
        const nateeIndex = cacheDb.members.findIndex((m: any) => m.userId === 'A260600001' || m.username === 'nateeplus');
        if (nateeIndex !== -1) {
          const currentNatee = cacheDb.members[nateeIndex];
          // Check if any critical property is different or outdated
          if (
            currentNatee.name !== "บริษัท นที พลัส" ||
            currentNatee.surname !== "จำกัด" ||
            currentNatee.phone !== "0635161734" ||
            currentNatee.idCard !== "1233445566778" ||
            currentNatee.password !== "@Tt12345678" ||
            currentNatee.pin !== "123456" ||
            currentNatee.role !== "Manager" ||
            currentNatee.rank !== "XXL"
          ) {
            console.log("⚙️ Self-healing master user properties for nateeplus...");
            cacheDb.members[nateeIndex] = {
              ...currentNatee,
              userId: "A260600001",
              username: "nateeplus",
              password: "@Tt12345678",
              pin: "123456",
              name: "บริษัท นที พลัส",
              surname: "จำกัด",
              phone: "0635161734",
              idCard: "1233445566778",
              email: "nateeplus@gmail.com",
              role: "Manager",
              sellerStatus: "Active",
              rank: "XXL",
              eligibleRights: 999999999
            };
            hasChanges = true;
          }
        } else {
          console.log("⚙️ Master user nateeplus not found in database. Seeding master user...");
          cacheDb.members.push({
            userId: "A260600001",
            username: "nateeplus",
            password: "@Tt12345678",
            pin: "123456",
            name: "บริษัท นที พลัส",
            surname: "จำกัด",
            phone: "0635161734",
            idCard: "1233445566778",
            email: "nateeplus@gmail.com",
            role: "Manager",
            sellerStatus: "Active",
            rank: "XXL",
            eligibleRights: 999999999,
            sellerCode: "A260001",
            sellerRating: 100,
            sellerProducts: 0,
            planBPoints: 0,
            registrationDate: new Date().toISOString()
          });
          hasChanges = true;
        }

        // 4. Save back to Firestore and local backup immediately if changes occurred
        if (hasChanges || hasMergedChanges) {
          console.log("💾 Saving cleaned and self-healed database to Firestore...");
          saveDbToFirestore(cacheDb).catch(err => console.error("❌ Failed to save self-healed DB to Firestore:", err));
        }
      }

      // Write to local file as backup and for synchronous fallback
      fs.writeFileSync(currentDbFile, JSON.stringify(cacheDb, null, 2), 'utf8');
    } else {
      console.log(`⚠️ No sections found in Firestore for ${collectionName}. Seeding from local file or defaults...`);
      let localDb: any = null;
      try {
        if (fs.existsSync(currentDbFile)) {
          localDb = JSON.parse(fs.readFileSync(currentDbFile, 'utf8'));
        } else if (isSandboxActive && fs.existsSync(DB_FILE)) {
          // Fallback to copy from prod for sandbox
          localDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
      } catch (e) {
        console.error(`⚠️ Failed to parse local file ${currentDbFile}`, e);
      }
      if (localDb) {
        cacheDb = localDb;
        console.log(`💾 Seeding empty Firestore with ${currentDbFile} data...`);
        saveDbToFirestore(cacheDb).catch(err => console.error("❌ Failed to save seeded DB to Firestore:", err));
      } else {
        console.log(`⚠️ No local file ${currentDbFile} found to seed Firestore.`);
      }
    }
  } catch (err) {
    console.error("❌ Error loading database from Firestore:", err);
  }
}

let isSavingToFirestore = false;
let isFirestoreQuotaExceeded = false;
let pendingSaveData: any = null;
let saveTimeout: NodeJS.Timeout | null = null;
let retryCount = 0;

async function saveDbToFirestore(data: any) {
  if (!dbFirestore || isFirestoreQuotaExceeded) return;
  
  // Store the latest data to be saved
  pendingSaveData = data;
  
  // If we are already saving, the pendingSaveData has been updated, so we can return.
  // It will be processed when the current save finishes.
  if (isSavingToFirestore) {
    return;
  }
  
  // Debounce the actual save to group rapid successive writes (e.g. within MLM transactions)
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    saveTimeout = null;
    await processFirestoreSave();
  }, 3000); // 3 seconds debounce to group multiple MLM actions together
}

async function processFirestoreSave() {
  if (!dbFirestore || !pendingSaveData || isSavingToFirestore) return;
  
  isSavingToFirestore = true;
  const dataToSave = pendingSaveData;
  pendingSaveData = null; // Clear pending so we can detect new ones
  
  try {
    const keys = ['members', 'products', 'sellerProducts', 'orders', 'transactions', 'planB_Tree', 'csrFund', 'systemStats', 'otps', 'packageProductChoices', 'bankSettings'];
    const batch = writeBatch(dbFirestore);
    const collectionName = isSandboxActive ? 'app_sections_sandbox' : 'app_sections';
    for (const key of keys) {
      if (dataToSave[key] !== undefined) {
        const docRef = doc(dbFirestore, collectionName, key);
        batch.set(docRef, { data: dataToSave[key] });
      }
    }
    await batch.commit();
    console.log(`📤 Successfully saved database to Firestore batch (${collectionName})`);
    retryCount = 0; // Reset retry count on success
    isFirestoreQuotaExceeded = false;
  } catch (err: any) {
    console.error("❌ Error saving database to Firestore:", err);
    
    const isQuotaExhausted = err.message && (
      err.message.includes("RESOURCE_EXHAUSTED") || 
      err.message.includes("quota") || 
      err.message.includes("Quota limit exceeded")
    );

    if (isQuotaExhausted) {
      isFirestoreQuotaExceeded = true;
      console.warn("⚠️ [Firestore Sync] Firestore daily write quota has been exceeded. The application will continue running seamlessly in Local Mode using db.json! Retries are suspended for 15 minutes to preserve resources.");
      if (!pendingSaveData) {
        pendingSaveData = dataToSave;
      }
      setTimeout(() => {
        isSavingToFirestore = false;
        processFirestoreSave();
      }, 15 * 60 * 1000); // 15 minutes backoff for quota exhaustion
      return;
    }

    // If it failed, restore the data to pending so we don't lose changes, and schedule a retry
    if (!pendingSaveData) {
      pendingSaveData = dataToSave;
    }
    
    retryCount++;
    const backoffDelay = Math.min(retryCount * 5000, 30000); // 5s, 10s, 15s... max 30s
    console.warn(`🔄 [Firestore Sync] Scheduling retry in ${backoffDelay / 1000} seconds (Attempt ${retryCount})...`);
    
    setTimeout(() => {
      isSavingToFirestore = false;
      processFirestoreSave();
    }, backoffDelay);
    return; // Exit early so we don't reset isSavingToFirestore prematurely
  }
  
  isSavingToFirestore = false;
  // If another update came in while we were saving, process it now after a slight delay
  if (pendingSaveData) {
    console.log("🔄 [Firestore Sync] Running queued save to Firestore in 1 second...");
    setTimeout(() => {
      processFirestoreSave();
    }, 1000);
  }
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Initialize Database structure
function initDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (data.members && data.products) return; // DB is already initialized
    } catch (e) {
      console.error("Error reading db.json, re-initializing", e);
    }
  }

  const defaultDb = {
    members: [
      {
        userId: "A260600001",
        username: "nateeplus",
        password: "@Tt12345678",
        pin: "123456",
        name: "บริษัท นที พลัส",
        surname: "จำกัด",
        phone: "0635161734",
        idCard: "1233445566778",
        email: "nateeplus@gmail.com",
        bankName: "",
        bankAccount: "",
        bankAccountName: "บริษัท นที พลัส จำกัด",
        sponsorId: "SYSTEM",
        parentId: "SYSTEM",
        side: "Left",
        rank: "XXL",
        statusKyc: "Active",
        kycImgUrl: "",
        kycBookUrl: "",
        kycBeneficiary: "",
        kycRelation: "",
        balanceECash: 15000.00,
        balanceEMoney: 0.00,
        balanceECoupon: 5000.00,
        balanceEShare: 0.00,
        eligibleRights: 999999999,
        firstLogin: false,
        passwordReset: false,
        createdAt: "2026-07-08T13:44:08.918Z",
        role: "Manager",
        sellerStatus: "Active",
        sellerCode: "A260001",
        sellerRating: 100.00,
        sellerProducts: 0
      },
      {
        userId: "ADMIN01",
        username: "admin",
        password: "Adminpassword1!",
        pin: "111111",
        name: "แอดมิน",
        surname: "หลังบ้าน",
        phone: "0800000001",
        idCard: "0000000000001",
        bankName: "ธนาคารกรุงเทพ",
        bankAccount: "0000000000",
        bankAccountName: "แอดมิน นทีพลัส",
        sponsorId: "SYSTEM",
        parentId: "SYSTEM",
        side: "Left",
        rank: "XXL",
        statusKyc: "Active",
        kycImgUrl: "",
        kycBookUrl: "",
        balanceECash: 0.00,
        balanceEMoney: 0.00,
        balanceECoupon: 0.00,
        balanceEShare: 0.00,
        eligibleRights: 50000.00,
        firstLogin: false,
        passwordReset: false,
        createdAt: new Date().toISOString(),
        role: "Admin",
        sellerStatus: "NotApplied"
      },
      {
        userId: "MGR01",
        username: "manager",
        password: "Managerpassword1!",
        pin: "222222",
        name: "ผู้จัดการ",
        surname: "กุญแจคู่",
        phone: "0800000002",
        idCard: "0000000000002",
        bankName: "ธนาคารไทยพาณิชย์",
        bankAccount: "1111111111",
        bankAccountName: "ผู้จัดการ นทีพลัส",
        sponsorId: "SYSTEM",
        parentId: "SYSTEM",
        side: "Left",
        rank: "XXL",
        statusKyc: "Active",
        kycImgUrl: "",
        kycBookUrl: "",
        balanceECash: 0.00,
        balanceEMoney: 0.00,
        balanceECoupon: 0.00,
        balanceEShare: 0.00,
        eligibleRights: 50000.00,
        firstLogin: false,
        passwordReset: false,
        createdAt: new Date().toISOString(),
        role: "Manager",
        sellerStatus: "NotApplied"
      }
    ],
    products: [
      {
        id: "pack_s",
        name: "S - สมัครเปิดร้านค้าออนไลน์",
        price: 100,
        pv: 0,
        cost: 0,
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=300",
        description: "สิทธิ์เปิดร้านค้าออนไลน์ นทีพลัส พร้อมรับสิทธิ์แนะนำสมาชิกและโบนัสเบื้องต้น",
        shortDescription: "แพ็กเกจเริ่มสมัครธุรกิจและเปิดสิทธิ์ร้านค้านทีพลัส S",
        category: "Package"
      },
      {
        id: "pack_m",
        name: "M - ชุดสินค้าทดลองครอบครัวประหยัด",
        price: 500,
        pv: 250,
        cost: 150,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300",
        description: "สินค้าอุปโภคบริโภคระดับพรีเมียม สบู่สมุนไพรและยาสีฟันนทีพลัส 1 ชุด",
        shortDescription: "ยาสีฟันสมุนไพรและของใช้ครอบครัวชุดประหยัด",
        category: "Package"
      },
      {
        id: "pack_l",
        name: "L - ชุดดูแลสุขภาพแบบองค์รวม",
        price: 1000,
        pv: 500,
        cost: 300,
        image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=300",
        description: "อาหารเสริมสกัดจากนวัตกรรมธรรมชาติ ช่วยฟื้นฟูระบบภูมิคุ้มกัน",
        shortDescription: "เซ็ทผลิตภัณฑ์ดูแลสุขภาพและเพิ่มภูมิคุ้มกันชั้นเยี่ยม",
        category: "Package"
      },
      {
        id: "pack_xl",
        name: "XL - ชุดนักขยายธุรกิจ นทีพลัส มั่งคั่ง",
        price: 3000,
        pv: 1500,
        cost: 900,
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300",
        description: "แพ็กเกจสินค้าอุปโภคบริโภคขนาดใหญ่ เหมาะสำหรับการเริ่มขยายสาขา",
        shortDescription: "ชุดผลิตภัณฑ์สินค้าอุปโภคบริโภคเพื่อเริ่มขยายธุรกิจนที",
        category: "Package"
      },
      {
        id: "pack_xxl",
        name: "XXL - ชุดผู้ประกอบการ นที ปันสุข ไร้ขีดจำกัด",
        price: 5000,
        pv: 2500,
        cost: 1500,
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=300",
        description: "สิทธิ์รับรายได้สูงสุด 20 ชั้น และสินค้าครบวงจรสำหรับเปิดจุดกระจายสินค้า",
        shortDescription: "แพ็กเกจ VIP สูงสุด รับรายได้เต็มพิกัด พร้อมคลังสินค้าพกพา",
        category: "Package"
      },
      {
        id: "shopee_elec_01",
        name: "🔋 พาวเวอร์แบงค์ชาร์จเร็ว Ultra-Charge 20000mAh",
        price: 690,
        pv: 345,
        cost: 200,
        image: "https://images.unsplash.com/photo-1609592424085-f55a02f3a61d?auto=format&fit=crop&q=80&w=300",
        description: "พาวเวอร์แบงค์ดีไซน์บางเฉียบ รองรับระบบชาร์จไว 22.5W มีหน้าจอ LED บอกเปอร์เซ็นต์แบต ปลอดภัยพกพาสะดวกผ่านเกณฑ์ขึ้นเครื่องบิน มั่นใจตลอดทริปเดินทางของคุณ",
        shortDescription: "พาวเวอร์แบงค์ชาร์จเร็วความจุสูง 20000mAh มีหน้าจอ LED",
        category: "Electronics"
      },
      {
        id: "shopee_fashion_01",
        name: "🧥 เสื้อคาร์ดิแกนสไตล์มินิมอลเกาหลี Soft-Cotton",
        price: 390,
        pv: 195,
        cost: 120,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
        description: "เสื้อคาร์ดิแกนถักอย่างดีจากเส้นใยฝ้ายพรีเมียม ผ้านุ่ม ใส่สบาย ระบายอากาศได้ยอดเยี่ยม เหมาะสำหรับใส่เที่ยว ใส่ทำงานออฟฟิศ หรือใส่ในห้องแอร์เย็นๆ",
        shortDescription: "เสื้อกันหนาวคาร์ดิแกนถักผ้าฝ้าย สไตล์มินิมอลเกาหลี นุ่มอุ่นสบาย",
        category: "Fashion"
      },
      {
        id: "shopee_beauty_01",
        name: "🧴 เซรั่มกู้หน้าใสหน้าเด็กไฮยาลูรอนเข้มข้น Gliss-Serum",
        price: 890,
        pv: 445,
        cost: 260,
        image: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=300",
        description: "เซรั่มบำรุงผิวหน้าสูตรล้ำลึก อุดมด้วยไฮยาลูรอนิก 8 โมเลกุล และวิตามินบี 3 ช่วยลดเลือนริ้วรอย จุดด่างดำ กระชับรูขุมขน เผยผิวโกลว์กระจ่างใสเปล่งปลั่งใน 7 วัน",
        shortDescription: "เซรั่มบำรุงล้ำลึก เพื่อผิวหน้าขาวกระจ่างใส ไร้สิว ฝ้า กระ",
        category: "Beauty"
      },
      {
        id: "shopee_home_01",
        name: "☕ เครื่องชงกาแฟเอสเพรสโซ่แรงดันสูง Espresso Home-Cafe",
        price: 2490,
        pv: 1245,
        cost: 750,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=300",
        description: "เครื่องชงกาแฟระบบแรงดัน 20 บาร์ ให้ฟองครีมม่าหนานุ่มหอมกรุ่น ปรับสตรีมฟองนมได้ตามใจชอบ เหมาะสำหรับคอกาแฟสดทำเองได้ง่ายๆ ที่บ้าน",
        shortDescription: "เครื่องชงกาแฟสดแรงดัน 20 บาร์ ครีมม่าโฟมแน่นหนานุ่มแบบคาเฟ่",
        category: "Home"
      },
      {
        id: "shopee_food_01",
        name: "🍜 เซ็ทบะหมี่แห้งทรงเครื่องพรีเมียม นทีพลัสราเมน (10 ซอง)",
        price: 250,
        pv: 125,
        cost: 75,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=300",
        description: "บะหมี่เส้นสดอบแห้งไม่ทอดน้ำมัน ปรุงรสด้วยซอสสูตรลับนที รสชาติกลมกล่อมเผ็ดจัดจ้าน อร่อยฟินระดับภัตตาคาร พร้อมด้วยผักอบแห้งและเห็ดหอมจุใจ",
        shortDescription: "บะหมี่เส้นสดอบแห้งพรีเมียม อร่อยเข้มข้น ไม่ทอดน้ำมัน สุขภาพดี",
        category: "Food"
      }
    ],
    sellerProducts: [],
    orders: [],
    transactions: [
      {
        id: "TXN001",
        userId: "A260600001",
        type: "Deposit",
        amount: 15000.00,
        currency: "E-Cash",
        details: "เติมเงินเข้ากระเป๋าเริ่มต้นระบบ",
        status: "Approved",
        createdAt: new Date().toISOString()
      },
      {
        id: "TXN002",
        userId: "A260600001",
        type: "Deposit",
        amount: 5000.00,
        currency: "E-Coupon",
        details: "โบนัสคูปองเริ่มต้นระบบ",
        status: "Approved",
        createdAt: new Date().toISOString()
      }
    ],
    planB_Tree: {
      b1: [],
      b2: [],
      b3: [],
      b4: [],
      b5: [],
      b6: [],
      b7: [],
      b8: [],
      b9: [],
      b10: [],
      b11: [],
      b12: [],
      b13: [],
      b14: [],
      b15: []
    },
    csrFund: {
      balance: 10500.25,
      history: [
        {
          id: "CSR001",
          username: "นที ปันสุข",
          userId: "A260600001",
          amount: 500.00,
          type: "Donation",
          details: "สมทบกองทุนจากการซื้อแพ็กเกจ",
          createdAt: new Date().toISOString()
        }
      ]
    },
    systemStats: {
      totalPlanBReserves: 2500.00,
      totalTaxReserves: 150.00,
      totalCompanyProfits: 4500.00
    },
    otps: {}
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf8');
}

initDb();

function readDb() {
  let db: any;
  const currentDbFile = isSandboxActive ? DB_FILE_SANDBOX : DB_FILE;
  if (cacheDb) {
    db = cacheDb;
  } else {
    try {
      db = JSON.parse(fs.readFileSync(currentDbFile, 'utf8'));
    } catch (e) {
      console.error(`Error reading database file ${currentDbFile}, returning default structure`);
      if (isSandboxActive && fs.existsSync(DB_FILE)) {
        try {
          const prodData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
          fs.writeFileSync(DB_FILE_SANDBOX, JSON.stringify(prodData, null, 2), 'utf8');
          cacheDb = prodData;
          return prodData;
        } catch (err) {}
      }
      const defaultData = {
        members: [],
        products: [],
        sellerProducts: [],
        orders: [],
        transactions: [],
        planB_Tree: {},
        csrFund: { balance: 0, history: [] },
        systemStats: { totalPlanBReserves: 0, totalTaxReserves: 0, totalCompanyProfits: 0 },
        otps: {},
        packageProductChoices: [],
        bankSettings: {
          bankName: "ธนาคารไทยพาณิชย์",
          bankAccount: "111-222-3333",
          bankAccountName: "บริษัท นที พลัส จำกัด",
          qrCodeUrl: ""
        }
      };
      cacheDb = defaultData;
      return defaultData;
    }
  }

  let migratedEMoney = false;
  if (db && db.members) {
    const seen = new Set();
    db.members = db.members.filter((m: any) => {
      if (!m || !m.userId) return false;
      if (seen.has(m.userId)) return false;
      seen.add(m.userId);
      return true;
    });
    db.members.forEach((m: any) => {
      if (!m.email) {
        m.email = `${m.username}@gmail.com`;
      }
      // Migrate old database fields from M-* to E-* dynamically for backward-compatibility
      // Correctly migrate old balanceMCash to separate E-Money and E-Cash wallets:
      // E-Money gets the whole Baht part (accumulated income), and E-Cash gets the fractional part (satang).
      if (m.balanceMCash !== undefined) {
        const originalMCash = Number(m.balanceMCash);
        const wholePart = Math.floor(originalMCash);
        const fractionalPart = parseFloat((originalMCash % 1).toFixed(6));
        
        // Correct duplicate values from earlier migrations
        if (m.balanceECash === originalMCash || m.balanceECash === undefined) {
          m.balanceECash = fractionalPart;
          migratedEMoney = true;
        }
        if (m.balanceEMoney === originalMCash || m.balanceEMoney === undefined || m.balanceEMoney === 0) {
          m.balanceEMoney = wholePart;
          migratedEMoney = true;
        }
      }

      if (m.balanceMCoupon !== undefined && m.balanceECoupon === undefined) {
        m.balanceECoupon = m.balanceMCoupon;
      }
      if (m.balanceAllShare !== undefined && m.balanceEShare === undefined) {
        m.balanceEShare = m.balanceAllShare;
      }
    });
    if (migratedEMoney) {
      console.log("💰 [Self-Healing] Successfully migrated old earnings balance into E-Money for active members.");
    }
  }

  if (db && db.transactions) {
    db.transactions.forEach((t: any) => {
      if (t.currency === "M-Cash") t.currency = "E-Cash";
      if (t.currency === "M-Coupon") t.currency = "E-Coupon";
      if (t.currency === "AllShare" || t.currency === "M-Share" || t.currency === "All-Share") t.currency = "E-Share";
      if (t.type === "AllShare") t.type = "EShare";
    });
  }

  let hasPopulatedMissing = false;
  if (typeof migratedEMoney !== 'undefined' && migratedEMoney) {
    hasPopulatedMissing = true;
  }
  if (db && !db.packageProductChoices) {
    db.packageProductChoices = [
      { id: "pc_m1", packageId: "pack_m", name: "M-Set A: ชุดของใช้สบู่สมุนไพรนทีพลัส 3 ชิ้น" },
      { id: "pc_m2", packageId: "pack_m", name: "M-Set B: ชุดยาสีฟันสมุนไพรสูตรลดการเสียวเหงือก 2 ชิ้น" },
      { id: "pc_l1", packageId: "pack_l", name: "L-Set A: ชุดกาแฟเอสเพรสโซ่พรีเมียม + ถ้วยกาแฟนทีพลัส" },
      { id: "pc_l2", packageId: "pack_l", name: "L-Set B: เซ็ตสบู่สมุนไพรและยาสีฟันสูตรกู้เหงือก (รวม 5 ชิ้น)" },
      { id: "pc_l3", packageId: "pack_l", name: "L-Set C: อาหารเสริมบำรุงสายตานวัตกรรม (Lutein Plus) 1 กล่อง" },
      { id: "pc_xl1", packageId: "pack_xl", name: "XL-Set A: เซ็ตอาหารเสริมฟื้นฟูร่างกายแบบองค์รวม (Multivitamin + Eye care)" },
      { id: "pc_xl2", packageId: "pack_xl", name: "XL-Set B: เครื่องชงกาแฟเอสเพรสโซ่แรงดันสูงสำหรับใช้ในบ้าน" },
      { id: "pc_xl3", packageId: "pack_xl", name: "XL-Set C: เซ็ตเครื่องสำอางและเซรั่ม Gliss-Serum บำรุงลึก 3 ขวด" },
      { id: "pc_xxl1", packageId: "pack_xxl", name: "XXL-Set A: ชุดเปิดศูนย์จุดกระจายสินค้า (สินค้าอุปโภคบริโภคครบครัน 20 ชิ้น)" },
      { id: "pc_xxl2", packageId: "pack_xxl", name: "XXL-Set B: เซ็ตเครื่องใช้ไฟฟ้าพรีเมียม (เครื่องชงกาแฟเอสเพรสโซ่ + พาวเวอร์แบงค์ชาร์จเร็ว)" },
      { id: "pc_xxl3", packageId: "pack_xxl", name: "XXL-Set C: เซ็ตสกินแคร์กู้หน้าใสหน้าเด็กสูตรเคาน์เตอร์แบรนด์นที (ครบชุด 5 ชิ้น)" }
    ];
    hasPopulatedMissing = true;
  }
  if (db && !db.bankSettings) {
    db.bankSettings = {
      bankName: "ธนาคารไทยพาณิชย์",
      bankAccount: "111-222-3333",
      bankAccountName: "บริษัท นที พลัส จำกัด",
      qrCodeUrl: ""
    };
    hasPopulatedMissing = true;
  }

  if (hasPopulatedMissing) {
    cacheDb = db;
    fs.writeFileSync(currentDbFile, JSON.stringify(db, null, 2), 'utf8');
    saveDbToFirestore(db).catch(err => {
      console.error("❌ Async save of self-healed choices to Firestore failed:", err);
    });
  }

  cacheDb = db;
  return db;
}

function writeDb(data) {
  if (data && data.members) {
    const seen = new Set();
    data.members = data.members.filter(m => {
      if (!m || !m.userId) return false;
      if (seen.has(m.userId)) return false;
      seen.add(m.userId);
      return true;
    });
  }
  cacheDb = data;
  const currentDbFile = isSandboxActive ? DB_FILE_SANDBOX : DB_FILE;
  fs.writeFileSync(currentDbFile, JSON.stringify(data, null, 2), 'utf8');
  saveDbToFirestore(data).catch(err => {
    console.error("❌ Async save to Firestore failed:", err);
  });
}

// -------------------------------------------------------------
// HELPER FUNCTIONS FOR MEMBERSHIP AND MLM ALGORITHMS
// -------------------------------------------------------------

// Generate unique Member ID: A260600001 format
function generateMemberID(db) {
  const now = new Date();
  const yearSuffix = now.getFullYear().toString().substring(2);
  const monthStr = ("0" + (now.getMonth() + 1)).slice(-2);
  
  let currentPrefix = "A" + yearSuffix + monthStr;
  let currentAlpha = 'A';
  
  while (true) {
    const matchingIds = db.members
      .map(m => m.userId)
      .filter(id => id.startsWith(currentAlpha + yearSuffix + monthStr));
      
    let maxNum = 0;
    for (const id of matchingIds) {
      const numStr = id.substring(5);
      const num = parseInt(numStr, 10);
      if (num > maxNum) maxNum = num;
    }
    
    if (maxNum < 99999) {
      const nextNum = maxNum + 1;
      const paddedNum = ("00000" + nextNum).slice(-5);
      return currentAlpha + yearSuffix + monthStr + paddedNum;
    } else {
      // Current letter is full (e.g. A99999 reached), advance to B
      const charCode = currentAlpha.charCodeAt(0);
      currentAlpha = String.fromCharCode(charCode + 1);
      currentPrefix = currentAlpha + yearSuffix + monthStr;
    }
  }
}

// Find first active binary ancestor who has been placed in the binary tree
function findFirstActiveBinaryAncestor(db, sponsorId) {
  let currentId = sponsorId;
  const visited = new Set();
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const member = db.members.find(m => m.userId === currentId || m.username === currentId);
    if (!member) break;
    
    if (member.userId === "A260600001" || (member.parentId && member.parentId !== "")) {
      return member.userId;
    }
    
    currentId = member.sponsorId;
  }
  
  return "A260600001";
}

// Auto-place member in Binary Tree (Find deepest available slot in Sponsor's downline)
function getEmptySlot(db, startNodeId = "A260600001") {
  let currentLevel = [startNodeId];
  
  while (currentLevel.length > 0) {
    // First check all left slots for this level
    for (let nodeId of currentLevel) {
      let left = db.members.find(m => m.parentId === nodeId && m.side === "Left");
      if (!left) return { parentId: nodeId, side: "Left" };
    }
    // Then check all right slots for this level
    for (let nodeId of currentLevel) {
      let right = db.members.find(m => m.parentId === nodeId && m.side === "Right");
      if (!right) return { parentId: nodeId, side: "Right" };
    }
    
    // Move to next level: all left children first, then all right children
    let nextLevel = [];
    for (let nodeId of currentLevel) {
      let left = db.members.find(m => m.parentId === nodeId && m.side === "Left");
      if (left) nextLevel.push(left.userId);
    }
    for (let nodeId of currentLevel) {
      let right = db.members.find(m => m.parentId === nodeId && m.side === "Right");
      if (right) nextLevel.push(right.userId);
    }
    currentLevel = nextLevel;
  }
  return { parentId: "A260600001", side: "Left" }; // Default
}

function findAndPlaceBinaryMember(db, sponsorId) {
  const activeSponsorId = findFirstActiveBinaryAncestor(db, sponsorId);
  return getEmptySlot(db, activeSponsorId);
}

// Low-up commission calculation for Binary Tree Plan A (20 layers)
function calculateBinaryCommissions(db, buyerId, pvAmount, orderId) {
  const buyer = db.members.find(m => m.userId === buyerId);
  if (!buyer) return;
  
  let currentParentId = buyer.parentId;
  let level = 1; // Absolute tree distance
  let paidLayersCount = 0; // Number of actual payouts made
  const maxPaidLayers = 20;
  
  while (currentParentId && currentParentId !== "SYSTEM" && paidLayersCount < maxPaidLayers) {
    const parent = db.members.find(m => m.userId === currentParentId);
    if (!parent) break;
    
    // Check if parent qualifies for this layer's payment based on their rank and absolute tree level
    let qualifies = false;
    const parentRank = parent.rank || "S";
    
    if (parentRank === "S" && level <= 1) qualifies = true;
    else if (parentRank === "M" && level <= 5) qualifies = true;
    else if (parentRank === "L" && level <= 10) qualifies = true;
    else if (parentRank === "XL" && level <= 15) qualifies = true;
    else if (parentRank === "XXL" && level <= 20) qualifies = true;
    
    // Check if the parent's income limits (eligibleRights) are already empty
    const isManagerOrAdmin = parent.role === 'Manager' || parent.role === 'Admin';
    const parentRights = isManagerOrAdmin ? 999999999 : (parent.eligibleRights || 0);
    if (!isManagerOrAdmin && parentRights <= 0) {
      qualifies = false; // "Low-up" bypass - skip the member whose rights are exhausted
    }
    
    if (qualifies) {
      // Income = 2.5% of PV (1 PV = 1 Baht in commission calculations)
      const commissionAmount = pvAmount * 0.025;
      
      // Deduct from parent's eligible income rights
      const actualPayout = isManagerOrAdmin ? commissionAmount : Math.min(commissionAmount, parentRights);
      if (actualPayout > 0) {
        if (!isManagerOrAdmin) {
          parent.eligibleRights = Math.max(0, parent.eligibleRights - actualPayout);
        }
        
        // Split actual payout immediately according to 20% flat deduction rule:
        // - 10% to E-Coupon
        // - 3% to E-Share
        // - 5% to Plan B (used as point accumulation)
        // - 1% to CSR Fund (โครงการปันสุข)
        // - 1% to Company Profit
        // - Remainder (80%) is paid to E-Cash
        
        const couponAllocation = actualPayout * 0.10;
        const allShareAllocation = actualPayout * 0.03;
        const planBAllocation = actualPayout * 0.05;
        const csrAllocation = actualPayout * 0.01;
        const companyAllocation = actualPayout * 0.01;
        
        const netECash = actualPayout * 0.80; // This goes to E-Money
        
        const netCoupon = couponAllocation * 0.90;
        const couponToAllShare = couponAllocation * 0.10;
        
        // Update balances
        parent.balanceEMoney = parseFloat(((parent.balanceEMoney || 0) + netECash).toFixed(4));
        parent.balanceECoupon = parseFloat((parent.balanceECoupon + netCoupon).toFixed(4));
        
        // Accumulate Plan B point
        parent.planBPoints = parseFloat(((parent.planBPoints || 0) + planBAllocation).toFixed(4));
        
        // Update global/admin stats
        db.systemStats.totalPlanBReserves = parseFloat((db.systemStats.totalPlanBReserves + planBAllocation).toFixed(4));
        db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits + companyAllocation).toFixed(4));
        
        // Add CSR Allocation
        db.csrFund.balance = parseFloat((db.csrFund.balance + csrAllocation).toFixed(4));
        db.csrFund.history.push({
          id: "CSR_TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          username: parent.name + " " + parent.surname,
          userId: parent.userId,
          amount: parseFloat(csrAllocation.toFixed(4)),
          type: "Donation",
          details: `หักกองทุนปันสุข 1% จากคอมมิชชันรหัส ${buyerId} บิล ${orderId}`,
          createdAt: new Date().toISOString()
        });
        
        // Process E-Share Allocation
        processEShareDistribution(db, allShareAllocation + couponToAllShare, buyerId);
        
        // Check Plan B threshold (100 Points) to spawn child nodes in Plan B1 tree
        checkAndSpawnPlanBNodes(db, parent.userId);
        
        // Record individual transaction log
        db.transactions.push({
          id: "COMM_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: parent.userId,
          type: "Bonus",
          amount: parseFloat(actualPayout.toFixed(4)),
          currency: "E-Money",
          details: `คอมมิชชันผังไบนารี ชั้นที่ ${level} (จ่ายจริงลำดับที่ ${paidLayersCount + 1}) จากการสั่งซื้อของรหัส ${buyerId}`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
        
        paidLayersCount++;
      }
    }
    
    // Traverse upwards
    currentParentId = parent.parentId;
    level++;
  }
}

// E-Share immediate distribution to all active eligible members (All-Share)
function processEShareDistribution(db, amount, triggerMemberId, excludeTriggerId = false) {
  if (amount <= 0) return;
  
  // Eligible members are active members in XXL position, or who have eligibleRights > 0 (everyone except those with no rights)
  const eligibleMembers = db.members.filter(m => 
    (m.eligibleRights || 0) > 0 && 
    (!excludeTriggerId || m.userId !== triggerMemberId)
  );
  if (eligibleMembers.length === 0) return;
  
  const sharePerMember = amount / eligibleMembers.length;
  const eMoneyPart = sharePerMember * 0.50; // Pays into E-Money
  const planBPart = sharePerMember * 0.50; // Accumulates as direct Plan B point value
  
  if (!db.transactions) db.transactions = [];

  eligibleMembers.forEach(member => {
    member.balanceEMoney = parseFloat(((member.balanceEMoney || 0) + eMoneyPart).toFixed(6));
    member.planBPoints = parseFloat(((member.planBPoints || 0) + planBPart).toFixed(6));
    member.balanceEShare = parseFloat(((member.balanceEShare || 0) + sharePerMember).toFixed(6));
    
    // Log transaction
    db.transactions.push({
      id: "ALL_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: member.userId,
      type: "EShare",
      amount: eMoneyPart,
      currency: "E-Money",
      description: `โบนัส All-Share จากรหัส ${triggerMemberId} (+${eMoneyPart.toFixed(4)} E-Money / +${planBPart.toFixed(4)} คะแนน Plan B)`,
      createdAt: new Date().toISOString()
    });

    // Check Plan B trigger
    checkAndSpawnPlanBNodes(db, member.userId);
  });
}

// Unified helper to distribute any E-Cash/E-Money income with flat 20% deduction and split allocation
function distributeECashWithDeduction(db, recipient, grossAmount, detailsText, triggerUserId) {
  if (grossAmount <= 0) return 0;
  
  const isManagerOrAdmin = recipient.role === 'Manager' || recipient.role === 'Admin';
  const currentRights = isManagerOrAdmin ? 999999999 : (recipient.eligibleRights || 0);
  const actualPayout = isManagerOrAdmin ? grossAmount : Math.min(grossAmount, currentRights);
  
  if (actualPayout > 0) {
    if (!isManagerOrAdmin) {
      recipient.eligibleRights = Math.max(0, recipient.eligibleRights - actualPayout);
    }
    
    // Split actual payout immediately according to 20% flat deduction rule:
    // - 10% to E-Coupon
    // - 3% to E-Share (All-Share)
    // - 5% to Plan B (used as point accumulation)
    // - 1% to CSR Fund (โครงการปันสุข)
    // - 1% to Company Profit
    // - Remainder (80%) is paid to E-Money
    const netEMoney = actualPayout * 0.80;
    const couponAllocation = actualPayout * 0.10;
    const allShareAllocation = actualPayout * 0.03;
    const planBAllocation = actualPayout * 0.05;
    const csrAllocation = actualPayout * 0.01;
    const companyAllocation = actualPayout * 0.01;
    
    const netCoupon = couponAllocation * 0.90;
    const couponToAllShare = couponAllocation * 0.10;
    
    // Update balances
    recipient.balanceEMoney = parseFloat(((recipient.balanceEMoney || 0) + netEMoney).toFixed(4));
    recipient.balanceECoupon = parseFloat(((recipient.balanceECoupon || 0) + netCoupon).toFixed(4));
    recipient.planBPoints = parseFloat(((recipient.planBPoints || 0) + planBAllocation).toFixed(4));
    
    // Update global/admin stats
    db.systemStats.totalPlanBReserves = parseFloat((db.systemStats.totalPlanBReserves + planBAllocation).toFixed(4));
    db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits + companyAllocation).toFixed(4));
    
    // Add CSR Allocation
    db.csrFund.balance = parseFloat((db.csrFund.balance + csrAllocation).toFixed(4));
    db.csrFund.history.push({
      id: "CSR_TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      username: recipient.name + " " + recipient.surname,
      userId: recipient.userId,
      amount: parseFloat(csrAllocation.toFixed(4)),
      type: "Donation",
      details: `หักกองทุนปันสุข 1% จาก${detailsText}`,
      createdAt: new Date().toISOString()
    });
    
    // Process E-Share Allocation (including withheld E-Coupon 10% that goes to All-Share)
    processEShareDistribution(db, allShareAllocation + couponToAllShare, triggerUserId);
    
    // Check Plan B threshold (100 Points) to spawn child nodes in Plan B1 tree
    checkAndSpawnPlanBNodes(db, recipient.userId);
    
    // Record individual transaction log
    db.transactions.push({
      id: "BON_DED_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: recipient.userId,
      type: "Bonus",
      amount: parseFloat(netEMoney.toFixed(4)),
      currency: "E-Money",
      details: `${detailsText} (ได้รับสุทธิเข้ากระเป๋า E-Money หลังหัก 20% ตามเงื่อนไข)`,
      status: "Approved",
      createdAt: new Date().toISOString()
    });
  }
  return actualPayout;
}

// Spawn child nodes in Global Single Tree for Plan B
function checkAndSpawnPlanBNodes(db, userId) {
  const member = db.members.find(m => m.userId === userId);
  if (!member) return;
  
  // Only members of rank M, L, XL, XXL can enter Plan B (Member and S cannot enter Plan B)
  const rankPriority = { "Member": 0, "S": 1, "M": 2, "L": 3, "XL": 4, "XXL": 5 };
  const currentRank = member.rank || "Member";
  if ((rankPriority[currentRank] || 0) < 2) {
    return; // Rank S or Member cannot enter Plan B
  }

  const points = member.planBPoints || 0;
  if (points >= 100) {
    const defaultCycles = Math.floor(points / 100);
    member.planBPoints = 0; // Cut to 0 and start over as requested by the user
    
    // Spawn custom Plan B1 sub-nodes
    for (let c = 0; c < defaultCycles; c++) {
      const year = new Date().getFullYear().toString().substring(2);
      const codeIndex = db.planB_Tree.b1.length + 1;
      const b1NodeCode = `${year}b1aa${("00000" + codeIndex).slice(-5)}`;
      const spawnedB1NodeId = `${member.userId}${b1NodeCode}`;
      
      // Determine auto-placement position in Global Single Tree B1
      let parentId = "SYSTEM";
      let side = "Left";
      
      if (db.planB_Tree.b1.length > 0) {
        // Place using breadth-first auto-fill under global root (b1[0])
        const rootNode = db.planB_Tree.b1[0];
        let queue = [rootNode.id];
        let placed = false;
        
        while (queue.length > 0 && !placed) {
          let currId = queue.shift();
          const leftChild = db.planB_Tree.b1.find(n => n.parentId === currId && n.side === "Left");
          const rightChild = db.planB_Tree.b1.find(n => n.parentId === currId && n.side === "Right");
          
          if (!leftChild) {
            parentId = currId;
            side = "Left";
            placed = true;
          } else if (!rightChild) {
            parentId = currId;
            side = "Right";
            placed = true;
          } else {
            queue.push(leftChild.id);
            queue.push(rightChild.id);
          }
        }
      }
      
      const newB1Node = {
        id: spawnedB1NodeId,
        memberUserId: member.userId,
        parentId: parentId,
        side: side,
        status: "Planing", // Planing until 8 layers filled
        progress: 0, // 0-100% representation
        createdAt: new Date().toISOString()
      };
      
      db.planB_Tree.b1.push(newB1Node);
      
      // Run calculations for Plan B1 layered commissions (upwards traversal)
      processPlanBGenericUpwardPayments(db, 1, spawnedB1NodeId);
    }
  }
}

// B1-B15 Commission Upward Traversal payment details helper using dynamic recursive calculation from B1 = 840
function getPlanBDetailsForTier(tierNum: number) {
  let nodeValue = 100.00;
  let totalPayout = 840.00; // Tier 1 total payout is 840 Baht
  let partsCount = 6;
  let partValue = totalPayout / partsCount; // 140 Baht
  
  if (tierNum > 1) {
    for (let t = 2; t <= tierNum; t++) {
      nodeValue = partValue; // nodeValue of next tier is the partValue of previous tier
      totalPayout = 62 * (nodeValue / 5); // 62 codes under 5 layers
      partsCount = t === 15 ? 5 : 6;
      partValue = totalPayout / partsCount;
    }
  }

  const eCashGross = partValue;
  const eCashNet = eCashGross * 0.80;
  
  return {
    nodeValue,
    totalPayout,
    partsCount,
    partValue,
    eCashGross,
    eCashNet,
    coupon: partValue,
    spawnReserve: tierNum === 15 ? 0 : partValue,
    allShare: partValue,
    csr: partValue,
    company: partValue
  };
}

// B1 is now calculated exactly like B2-B10 via processPlanBGenericUpwardPayments with tierNum=1.
// Therefore, the 8-layer processPlanB1UpwardPayments function is deprecated and replaced by the unified 5-layer generic logic.

// Unified generic Plan B node spawning for tiers B1-B10
function spawnPlanBNode(db, tierNum, userId, value) {
  const tierKey = `b${tierNum}`;
  if (!db.planB_Tree[tierKey]) {
    db.planB_Tree[tierKey] = [];
  }
  
  let parentId = "SYSTEM";
  let side = "Left";
  
  const treeList = db.planB_Tree[tierKey];
  
  if (treeList.length > 0) {
    const rootNode = treeList[0];
    let queue = [rootNode.id];
    let placed = false;
    
    while (queue.length > 0 && !placed) {
      let currId = queue.shift();
      const leftChild = treeList.find(n => n.parentId === currId && n.side === "Left");
      const rightChild = treeList.find(n => n.parentId === currId && n.side === "Right");
      
      if (!leftChild) {
        parentId = currId;
        side = "Left";
        placed = true;
      } else if (!rightChild) {
        parentId = currId;
        side = "Right";
        placed = true;
      } else {
        queue.push(leftChild.id);
        queue.push(rightChild.id);
      }
    }
  }
  
  const nodeCode = `b${tierNum}_${treeList.length + 1}`;
  const spawnedNodeId = `${userId}_${nodeCode}`;
  
  treeList.push({
    id: spawnedNodeId,
    memberUserId: userId,
    parentId: parentId,
    side: side,
    status: "Planing",
    progress: 0,
    value: value, // Store node value
    createdAt: new Date().toISOString()
  });
  
  // Call generic upward payment calculation for this tier
  processPlanBGenericUpwardPayments(db, tierNum, spawnedNodeId);
}

// B1-B10 Commission Upward Traversal payment
function processPlanBGenericUpwardPayments(db, tierNum, nodeId) {
  const tierKey = `b${tierNum}`;
  const treeList = db.planB_Tree[tierKey];
  if (!treeList) return;
  
  const node = treeList.find(n => n.id === nodeId);
  if (!node) return;
  
  let currentParentId = node.parentId;
  let level = 1;
  const maxLayers = 5; // B1-B10 are calculated at 5 layers
  
  while (currentParentId && currentParentId !== "SYSTEM" && level <= maxLayers) {
    const parentNode = treeList.find(n => n.id === currentParentId);
    if (!parentNode) break;
    
    // Check how many child nodes exist under parentNode's sub-tree
    const subTreeNodesCount = countSubTreeNodes(treeList, parentNode.id, maxLayers);
    const totalTargetNodesFor5Layers = 62; // Sum of 2 + 4 + 8 + 16 + 32 = 62
    
    parentNode.progress = Math.min(100, Math.floor((subTreeNodesCount / totalTargetNodesFor5Layers) * 100));
    const isFullyCompleted = parentNode.progress >= 100;
    
    if (isFullyCompleted && parentNode.status === "Planing") {
      parentNode.status = "Success";
      
      const details = getPlanBDetailsForTier(tierNum);
      
      const parentMember = db.members.find(m => m.userId === parentNode.memberUserId);
      if (parentMember) {
        // Calculate 20% flat deduction details on the gross E-Cash amount
        const eCashGross = details.eCashGross;
        const netEMoney = details.eCashNet; // 80% of eCashGross (goes to E-Money)
        
        const eCashCoupon = eCashGross * 0.10;
        const eCashEShare = eCashGross * 0.03;
        const eCashPlanB = eCashGross * 0.05;
        const eCashCSR = eCashGross * 0.01;
        const eCashCompany = eCashGross * 0.01;

        const grossCoupon = details.coupon + eCashCoupon;
        const netCoupon = grossCoupon * 0.90;
        const couponToAllShare = grossCoupon * 0.10;

        // Apply payouts:
        // Net E-Money goes to member's E-Money wallet
        parentMember.balanceEMoney = parseFloat(((parentMember.balanceEMoney || 0) + netEMoney).toFixed(4));
        
        // Coupon portion (direct coupon + 10% from E-Cash deduction - 10% withhold to All-Share) goes to member's Coupon wallet
        parentMember.balanceECoupon = parseFloat((parentMember.balanceECoupon + netCoupon).toFixed(4));
        
        // 5% Plan B point deduction accumulates back to member's Plan B points
        parentMember.planBPoints = parseFloat(((parentMember.planBPoints || 0) + eCashPlanB).toFixed(4));
        
        // Update global/admin stats:
        // Company portion (direct company profit + 1% from E-Cash deduction)
        db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits + details.company + eCashCompany).toFixed(4));
        
        // Plan B point deduction reserves
        db.systemStats.totalPlanBReserves = parseFloat((db.systemStats.totalPlanBReserves + eCashPlanB).toFixed(4));
        
        // CSR allocation (direct CSR + 1% from E-Cash deduction)
        const totalCsrAllocation = details.csr + eCashCSR;
        db.csrFund.balance = parseFloat((db.csrFund.balance + totalCsrAllocation).toFixed(4));
        db.csrFund.history.push({
          id: "CSR_TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          username: parentMember.name + " " + parentMember.surname,
          userId: parentMember.userId,
          amount: parseFloat(totalCsrAllocation.toFixed(4)),
          type: "Donation",
          details: `หักกองทุนปันสุขจากโบนัสสำเร็จลูป Plan B${tierNum} (ปันสุขรายชั้น ฿${details.csr.toFixed(2)} + หัก 1% E-Cash ฿${eCashCSR.toFixed(2)})`,
          createdAt: new Date().toISOString()
        });
        
        // E-Share distribution (direct E-Share + 3% from E-Cash deduction + 10% coupon withhold)
        const totalEShareAllocation = details.allShare + eCashEShare + couponToAllShare;
        processEShareDistribution(db, totalEShareAllocation, parentMember.userId);
        
        // Check Plan B threshold trigger for the recipient
        checkAndSpawnPlanBNodes(db, parentMember.userId);
        
        // Spawn supplemental code in next level B(tierNum + 1)
        if (tierNum < 15) {
          spawnPlanBNode(db, tierNum + 1, parentMember.userId, details.spawnReserve);
        }
        
        // Log transaction
        db.transactions.push({
          id: `PLANB${tierNum}_` + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: parentMember.userId,
          type: "Bonus",
          amount: parseFloat(netEMoney.toFixed(4)),
          currency: "E-Money",
          details: `โบนัสพิเศษระบบ Plan B${tierNum} สำเร็จลูป (เต็ม 5 ชั้น จ่ายสุทธิเข้ากระเป๋า E-Money หลังหัก 20%)`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
      }
    }
    
    currentParentId = parentNode.parentId;
    level++;
  }
}

// Subtree node count helper
function countSubTreeNodes(tree, rootId, maxDepth) {
  let count = 0;
  let queue = [{ id: rootId, depth: 0 }];
  
  while (queue.length > 0) {
    let curr = queue.shift();
    if (!curr) continue;
    
    if (curr.depth > 0 && curr.depth <= maxDepth) {
      count++;
    }
    
    if (curr.depth < maxDepth) {
      const children = tree.filter(n => n.parentId === curr.id);
      children.forEach(c => queue.push({ id: c.id, depth: curr.depth + 1 }));
    }
  }
  return count;
}

// -------------------------------------------------------------
// REST API ROUTE HANDLERS
// -------------------------------------------------------------

// REGISTER
app.post('/api/auth/register', (req, res) => {
  const { 
    username, name, surname, phone, idCard, bankName, bankAccount, sponsorId, password, 
    kycBeneficiary, kycRelation, email, idAddress, shippingAddress, useSameAddress,
    selectedPackageId, selectedPackageItems
  } = req.body;
  const db = readDb();
  
  // Validation checks
  if (!idCard || !/^\d{13}$/.test(idCard)) {
    return res.status(400).json({ success: false, message: "เลขบัตรประจำตัวประชาชนต้องครบ 13 หลัก และเป็นตัวเลขเท่านั้นค่ะ" });
  }

  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "เบอร์โทรศัพท์ต้องครบ 10 หลัก และเป็นตัวเลขเท่านั้นค่ะ" });
  }

  if (email && !email.includes('@')) {
    return res.status(400).json({ success: false, message: "อีเมลต้องมีเครื่องหมาย @ ในข้อความด้วยค่ะ" });
  }

  const existingUser = db.members.find(m => m.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ success: false, message: "ชื่อผู้ใช้ (Username) นี้ถูกใช้ไปแล้ว" });
  }
  
  const existingPhone = db.members.find(m => m.phone === phone);
  if (existingPhone) {
    return res.status(400).json({ success: false, message: "เบอร์โทรศัพท์นี้ถูกใช้สมัครสมาชิกแล้ว" });
  }
  
  const existingIdCard = db.members.find(m => m.idCard === idCard);
  if (existingIdCard) {
    return res.status(400).json({ success: false, message: "เลขบัตรประจำตัวประชาชนนี้มีอยู่ในระบบแล้ว" });
  }

  // Verify sponsor
  const sponsor = db.members.find(m => m.userId === sponsorId || m.username === sponsorId);
  if (!sponsor) {
    return res.status(400).json({ success: false, message: "ไม่พบผู้แนะนำนี้ในระบบกรุณาตรวจสอบรหัสแนะนำ" });
  }
  
  const verifiedSponsorId = sponsor.userId;
  const newUserId = generateMemberID(db);
  
  const newMember = {
    userId: newUserId,
    username: username.toLowerCase().trim(),
    email: email || `${username.toLowerCase().trim()}@gmail.com`,
    password: password || "Netee!234",
    pin: "000000", // Default pin code
    name,
    surname,
    phone,
    idCard,
    bankName: bankName || "",
    bankAccount: bankAccount || "",
    bankAccountName: `${name} ${surname}`,
    sponsorId: verifiedSponsorId,
    parentId: "", // Standard Member does not enter the binary tree until they buy a package
    side: "",     // Standard Member does not enter the binary tree until they buy a package
    rank: "Member", // Initially signed up as Member
    idAddress: idAddress || { province: "", district: "", subdistrict: "", zipcode: "", details: "" },
    shippingAddress: shippingAddress || { province: "", district: "", subdistrict: "", zipcode: "", details: "" },
    useSameAddress: useSameAddress !== undefined ? useSameAddress : false,
    statusKyc: "NotSubmitted",
    kycImgUrl: "",
    kycBookUrl: "",
    kycBeneficiary: kycBeneficiary || "",
    kycRelation: kycRelation || "",
    balanceECash: 0.00,
    balanceECoupon: 0.00,
    balanceEShare: 0.00,
    eligibleRights: 0.00, // No rights until package purchased
    planBPoints: 0,
    firstLogin: true,
    passwordReset: false,
    createdAt: new Date().toISOString(),
    role: "Member",
    sellerStatus: "NotApplied",
    selectedPackageId: selectedPackageId || "pack_s",
    selectedPackageItems: selectedPackageItems || []
  };
  
  db.members.push(newMember);
  writeDb(db);
  
  res.json({
    success: true,
    message: "สมัครสมาชิกสำเร็จเรียบร้อย!",
    userId: newUserId,
    username: username,
    defaultPassword: password || "Netee!234",
    sponsorName: `${sponsor.name} ${sponsor.surname}`
  });
});

// CHECK SPONSOR NAME
app.post('/api/auth/check-sponsor', (req, res) => {
  const { sponsorId } = req.body;
  const db = readDb();
  const sponsor = db.members.find(m => m.userId === sponsorId || m.username === sponsorId);
  if (sponsor) {
    res.json({ success: true, name: `${sponsor.name} ${sponsor.surname}` });
  } else {
    res.json({ success: false, message: "ไม่พบผู้แนะนำ" });
  }
});

// CHECK USERNAME AVAILABILITY
app.post('/api/auth/check-username', (req, res) => {
  const { username } = req.body;
  const db = readDb();
  const existingUser = db.members.find(m => m.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    res.json({ success: false, message: "ชื่อผู้ใช้นี้ไม่สามารถใช้ได้" });
  } else {
    res.json({ success: true, message: "ชื่อผู้ใช้นี้สามารถใช้งานได้" });
  }
});

// CHECK IDCARD DUPLICATE
app.post('/api/auth/check-idcard', (req, res) => {
  const { idCard } = req.body;
  const db = readDb();
  if (!idCard || !/^\d{13}$/.test(idCard)) {
    return res.json({ success: false, isFormatError: true, message: "เลขบัตรประจำตัวประชาชนต้องครบ 13 หลัก" });
  }
  const existingIdCard = db.members.find(m => m.idCard === idCard);
  if (existingIdCard) {
    res.json({ success: false, message: "เลขบัตรประจำตัวประชาชนนี้มีอยู่ในระบบแล้ว" });
  } else {
    res.json({ success: true, message: "เลขบัตรประจำตัวประชาชนนี้สามารถใช้งานได้" });
  }
});

// CHECK PHONE DUPLICATE
app.post('/api/auth/check-phone', (req, res) => {
  const { phone } = req.body;
  const db = readDb();
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.json({ success: false, isFormatError: true, message: "เบอร์โทรศัพท์ต้องครบ 10 หลัก" });
  }
  const existingPhone = db.members.find(m => m.phone === phone);
  if (existingPhone) {
    res.json({ success: false, message: "เบอร์โทรศัพท์นี้ถูกใช้สมัครสมาชิกแล้ว" });
  } else {
    res.json({ success: true, message: "เบอร์โทรศัพท์นี้สามารถใช้งานได้" });
  }
});

// CHECK EMAIL DUPLICATE
app.post('/api/auth/check-email', (req, res) => {
  const { email } = req.body;
  const db = readDb();
  if (!email || !email.includes('@')) {
    return res.json({ success: false, isFormatError: true, message: "อีเมลต้องมีเครื่องหมาย @ ในข้อความ" });
  }
  const existingEmail = db.members.find(m => m.email && m.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    res.json({ success: false, message: "อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว" });
  } else {
    res.json({ success: true, message: "อีเมลนี้สามารถใช้งานได้" });
  }
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.username.toLowerCase() === username.toLowerCase() || m.userId === username);
  if (!member) {
    return res.status(400).json({ success: false, message: "ไม่พบชื่อผู้ใช้นี้ในระบบ" });
  }
  
  if (member.password !== password) {
    return res.status(400).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
  }
  
  res.json({
    success: true,
    userId: member.userId,
    username: member.username,
    name: member.name,
    surname: member.surname,
    phone: member.phone,
    rank: member.rank,
    role: member.role,
    firstLogin: member.firstLogin,
    passwordReset: member.passwordReset
  });
});

// SECURITY FOR firstLogin
app.post('/api/auth/update-security', (req, res) => {
  const { userId, newPassword, newPin } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบรหัสสมาชิก" });
  }
  
  if (newPassword) {
    if (newPassword === "Netee!234") {
      return res.status(400).json({ success: false, message: "ห้ามใช้รหัสผ่านเริ่มต้นระบบเพื่อความปลอดภัย" });
    }
    member.password = newPassword;
  }
  
  if (!newPin || newPin.length !== 6 || !/^\d+$/.test(newPin)) {
    return res.status(400).json({ success: false, message: "รหัส PIN ต้องไม่ต่ำกว่า และ ไม่เกิน 6 หลัก และต้องเป็นตัวเลขเท่านัั้น" });
  }
  
  member.pin = newPin;
  member.firstLogin = false;
  member.passwordReset = false;
  
  writeDb(db);
  res.json({ success: true, message: "ตั้งค่ารหัส PIN เรียบร้อยแล้ว!" });
});

// SEND OTP FOR REGISTER
app.post('/api/auth/send-register-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: "กรุณาระบุอีเมลที่ถูกต้องค่ะ" });
  }
  res.json({
    success: true,
    message: `ส่งรหัส OTP ไปยังอีเมล ${email} สำเร็จเรียบร้อยแล้วค่ะ`,
    otpSimulated: otp
  });
});

// REQUEST PASSWORD RESET (OTP Request via Email)
app.post('/api/auth/forgot', (req, res) => {
  const { username, email } = req.body;
  const db = readDb();
  
  if (!username || !email) {
    return res.status(400).json({ success: false, message: "กรุณากรอกทั้งชื่อผู้ใช้และอีเมลเพื่อขอรับ OTP" });
  }

  const member = db.members.find(m => 
    (m.username.toLowerCase() === username.toLowerCase() || m.userId === username) &&
    m.email && m.email.toLowerCase() === email.toLowerCase()
  );
  
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกที่มีชื่อผู้ใช้และอีเมลนี้ในระบบ" });
  }
  
  // Simulate sending OTP to email
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) {
    db.otps = {};
  }
  db.otps[member.userId] = otpCode;
  
  writeDb(db);
  
  res.json({
    success: true,
    otpSimulated: otpCode,
    email: member.email,
    message: `ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล ${member.email} ของท่านแล้ว (รหัสจำลองสำหรับทดสอบคือ ${otpCode})`
  });
});

// VERIFY OTP AND GENERATE TEMPORARY PASSWORD
app.post('/api/auth/forgot-verify', (req, res) => {
  const { username, otp } = req.body;
  const db = readDb();
  
  if (!username || !otp) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  
  const member = db.members.find(m => m.username.toLowerCase() === username.toLowerCase() || m.userId === username);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกในระบบ" });
  }
  
  const savedOtp = db.otps ? db.otps[member.userId] : null;
  if (!savedOtp || savedOtp !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบและลองใหมู่อีกครั้ง" });
  }
  
  // Set to temporary default password and mandate password reset flag
  member.password = "Netee!234";
  member.passwordReset = true;
  member.firstLogin = false;
  
  // Clear the used OTP
  delete db.otps[member.userId];
  
  writeDb(db);
  
  res.json({
    success: true,
    message: "ยืนยันรหัส OTP ถูกต้อง! ระบบได้ทำการกำหนดรหัสผ่านชั่วคราวของท่านเป็น Netee!234 เรียบร้อยแล้ว (ท่านจะต้องเปลี่ยนรหัสผ่านใหม่ทันทีเมื่อล็อกอินเข้าระบบ)"
  });
});

// GET PROFILE / DASHBOARD STATE
app.get('/api/member/profile/:userId', (req, res) => {
  const { userId } = req.params; // Express param fallback
  const uId = req.params.userId || userId;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === uId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  const transactions = db.transactions || [];
  const totalEarnings = transactions
    .filter((t: any) => t.userId === member.userId && (!t.status || t.status === "Approved") && (t.currency === "E-Cash" || t.currency === "E-Money") && (t.type === "Bonus" || t.type === "EShare"))
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    
  const totalCouponsEarned = transactions
    .filter((t: any) => t.userId === member.userId && (!t.status || t.status === "Approved") && t.currency === "E-Coupon" && (t.amount || 0) > 0)
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  
  // Return safe profile summary data
  res.json({
    success: true,
    isSandboxActive: isSandboxActive,
    profile: {
      userId: member.userId,
      username: member.username,
      name: member.name,
      surname: member.surname,
      phone: member.phone,
      idCard: member.idCard,
      bankName: member.bankName,
      bankAccount: member.bankAccount,
      bankAccountName: member.bankAccountName,
      sponsorId: member.sponsorId,
      rank: member.rank,
      statusKyc: member.statusKyc,
      balanceECash: member.balanceECash,
      balanceEMoney: member.balanceEMoney || 0.00,
      balanceECoupon: member.balanceECoupon,
      balanceEShare: member.balanceEShare,
      totalEarnings: parseFloat(totalEarnings.toFixed(4)),
      totalCouponsEarned: parseFloat(totalCouponsEarned.toFixed(4)),
      eligibleRights: member.eligibleRights,
      planBPoints: member.planBPoints || 0,
      kycBeneficiary: member.kycBeneficiary || "",
      kycRelation: member.kycRelation || "",
      sellerStatus: member.sellerStatus || "NotApplied",
      sellerCode: member.sellerCode || "",
      role: member.role || "Member",
      createdAt: member.createdAt,
      email: member.email || "",
      idAddress: member.idAddress || { province: '', district: '', subdistrict: '', zipcode: '', details: '' },
      shippingAddress: member.shippingAddress || { province: '', district: '', subdistrict: '', zipcode: '', details: '' },
      useSameAddress: member.useSameAddress ?? false,
      selectedPackageId: member.selectedPackageId || "pack_s",
      selectedPackageItems: member.selectedPackageItems || []
    }
  });
});

// SUBMIT KYC
app.post('/api/member/kyc', (req, res) => {
  const { userId, idCardFile, bankBookFile, address, beneficiary, relation, bankName, bankAccount, bankAccountName } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  }
  
  // Save file locally or base64
  let idCardUrl = "";
  let bankBookUrl = "";
  
  try {
    if (idCardFile && idCardFile.startsWith("data:")) {
      const ext = idCardFile.split(';')[0].split('/')[1] || 'png';
      const base64Data = idCardFile.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `kyc_id_${userId}_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, fileName), base64Data, 'base64');
      idCardUrl = `/uploads/${fileName}`;
    }
    
    if (bankBookFile && bankBookFile.startsWith("data:")) {
      const ext = bankBookFile.split(';')[0].split('/')[1] || 'png';
      const base64Data = bankBookFile.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `kyc_bank_${userId}_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, fileName), base64Data, 'base64');
      bankBookUrl = `/uploads/${fileName}`;
    }
  } catch (err) {
    console.error("Error saving files", err);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกเอกสารรูปภาพ" });
  }
  
  member.statusKyc = "Pending";
  if (idCardUrl) member.kycImgUrl = idCardUrl;
  if (bankBookUrl) member.kycBookUrl = bankBookUrl;
  if (beneficiary) member.kycBeneficiary = beneficiary;
  if (relation) member.kycRelation = relation;
  if (address) member.kycAddress = address;
  if (bankName) member.bankName = bankName;
  if (bankAccount) member.bankAccount = bankAccount;
  if (bankAccountName) {
    member.bankAccountName = bankAccountName;
  } else if (bankName || bankAccount) {
    member.bankAccountName = `${member.name} ${member.surname}`;
  }
  
  writeDb(db);
  res.json({ success: true, message: "ส่งเอกสารยืนยันตัวตน (KYC) สำเร็จแล้ว อยู่ระหว่างตรวจสอบจากแอดมิน" });
});

// BUY COUPON (EXCHANGE E-CASH TO E-COUPON)
app.post('/api/member/buy-coupon', (req, res) => {
  const { userId, amount, pin, otp } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  if (!db.otps || db.otps[userId] !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งานแล้วค่ะ" });
  }
  delete db.otps[userId];
  
  if (member.statusKyc !== "Active") {
    return res.status(400).json({ success: false, message: "กรุณาผ่านการยืนยันตัวตน (KYC) ให้สมบูรณ์ก่อนทำธุรกรรม" });
  }
  
  if (member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ธุรกรรม 6 หลักไม่ถูกต้อง" });
  }
  
  const amt = parseFloat(amount);
  if (member.balanceECash < amt) {
    return res.status(400).json({ success: false, message: "ยอดเงินคงเหลือในกระเป๋า E-Cash ไม่เพียงพอ" });
  }
  
  member.balanceECash = parseFloat((member.balanceECash - amt).toFixed(4));
  member.balanceECoupon = parseFloat((member.balanceECoupon + amt).toFixed(4));
  
  db.transactions.push({
    id: "COUP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Exchange",
    amount: amt,
    currency: "E-Coupon",
    details: "โอนย้าย E-Cash ซื้อคูปองช้อปปิ้ง",
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  res.json({
    success: true,
    message: "ซื้อคูปองช้อปปิ้งสำเร็จเรียบร้อย!",
    newECash: member.balanceECash,
    newECoupon: member.balanceECoupon
  });
});

// SUBMIT DEPOSIT/TOPUP REQUEST
app.post('/api/member/topup', (req, res) => {
  const { userId, amount, transferAmount, transferDate, slipFile } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  let slipImgUrl = "";
  try {
    if (slipFile && slipFile.startsWith("data:")) {
      const ext = slipFile.split(';')[0].split('/')[1] || 'png';
      const base64Data = slipFile.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `slip_topup_${userId}_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, fileName), base64Data, 'base64');
      slipImgUrl = `/uploads/${fileName}`;
    }
  } catch (err) {
    console.error("Error saving slip", err);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกเอกสารรูปภาพสลิป" });
  }

  const txnId = "DEP_" + Math.random().toString(36).substr(2, 9).toUpperCase();
  if (!db.transactions) db.transactions = [];
  
  db.transactions.push({
    id: txnId,
    userId: member.userId,
    username: member.username,
    name: `${member.name} ${member.surname}`,
    type: "Deposit",
    amount: parseFloat(amount),
    transferAmount: parseFloat(transferAmount),
    transferDate: transferDate,
    slipImgUrl: slipImgUrl,
    currency: "E-Cash",
    details: `แจ้งเติมเงิน E-Cash ยอดแจ้งโอน ฿${parseFloat(transferAmount).toLocaleString()} (จากยอดขอคำนวณ ฿${parseFloat(amount).toLocaleString()})`,
    status: "Pending",
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  res.json({ success: true, message: "ส่งคำขอเติมเงินและหลักฐานสลิปเรียบร้อยแล้วค่ะ รอแอดมินอนุมัติ", txnId });
});

// TRANSFER E-CASH TO OTHER MEMBER
app.post('/api/member/transfer-e-cash', (req, res) => {
  const { senderId, receiverPhoneOrUser, amount, pin, otp } = req.body;
  const db = readDb();
  
  const sender = db.members.find(m => m.userId === senderId);
  if (!sender) return res.status(404).json({ success: false, message: "ไม่พบผู้ส่ง" });
  
  if (!db.otps || db.otps[senderId] !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งานแล้วค่ะ" });
  }
  delete db.otps[senderId];
  
  if (sender.statusKyc !== "Active") {
    return res.status(400).json({ success: false, message: "กรุณาผ่านการยืนยันตัวตน (KYC) ให้สมบูรณ์ก่อนทำธุรกรรม" });
  }
  
  if (sender.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ธุรกรรม 6 หลักไม่ถูกต้อง" });
  }
  
  const receiver = db.members.find(m => m.phone === receiverPhoneOrUser || m.username.toLowerCase() === receiverPhoneOrUser.toLowerCase() || m.userId === receiverPhoneOrUser);
  if (!receiver) {
    return res.status(400).json({ success: false, message: "ไม่พบสมาชิกผู้รับปลายทาง กรุณาตรวจสอบเบอร์โทรหรือไอดีอีกครั้ง" });
  }
  
  if (sender.userId === receiver.userId) {
    return res.status(400).json({ success: false, message: "ไม่สามารถโอนเงินให้บัญชีตนเองได้" });
  }
  
  const amt = parseFloat(amount);
  if (sender.balanceECash < amt) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Cash ของคุณไม่เพียงพอ" });
  }
  
  sender.balanceECash = parseFloat((sender.balanceECash - amt).toFixed(4));
  receiver.balanceECash = parseFloat((receiver.balanceECash + amt).toFixed(4));
  
  db.transactions.push({
    id: "XFER_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: sender.userId,
    type: "Withdraw",
    amount: amt,
    currency: "E-Cash",
    details: `โอนเงินออกไปยังรหัส ${receiver.userId} (${receiver.name})`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  db.transactions.push({
    id: "RECV_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: receiver.userId,
    type: "Deposit",
    amount: amt,
    currency: "E-Cash",
    details: `รับโอนเงินเข้าจากรหัส ${sender.userId} (${sender.name})`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  res.json({
    success: true,
    message: `โอนเงินสำเร็จไปยัง ${receiver.name} ${receiver.surname} เรียบร้อยแล้วค่ะ!`,
    newECash: sender.balanceECash
  });
});

// VERIFY RECIPIENT
app.post('/api/member/verify-recipient', (req, res) => {
  const { receiverPhoneOrUser, senderId } = req.body;
  const db = readDb();
  
  const receiver = db.members.find(m => m.phone === receiverPhoneOrUser || m.username.toLowerCase() === receiverPhoneOrUser.toLowerCase() || m.userId === receiverPhoneOrUser);
  if (!receiver) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกผู้รับปลายทาง กรุณาตรวจสอบเบอร์โทรหรือไอดีอีกครั้งค่ะ" });
  }
  
  if (senderId && receiver.userId === senderId) {
    return res.status(400).json({ success: false, message: "ไม่สามารถทำรายการโดยใช้บัญชีตนเองเป็นผู้รับได้ค่ะ" });
  }
  
  res.json({
    success: true,
    recipient: {
      userId: receiver.userId,
      name: `${receiver.name} ${receiver.surname}`,
      phone: receiver.phone,
      username: receiver.username
    }
  });
});

// TRANSFER E-CASH TO E-MONEY (10% FEE: 5% ALL-SHARE, 5% COMPANY)
app.post('/api/member/transfer-ecash-to-emoney', (req, res) => {
  const { senderId, userId, amount, pin, otp } = req.body;
  const senderIdActual = senderId || userId;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === senderIdActual);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  if (!db.otps || db.otps[senderIdActual] !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งานแล้วค่ะ" });
  }
  delete db.otps[senderIdActual];
  
  if (member.statusKyc !== "Active") {
    return res.status(400).json({ success: false, message: "กรุณาผ่านการยืนยันตัวตน (KYC) ให้สมบูรณ์ก่อนทำธุรกรรม" });
  }
  
  if (member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ธุรกรรม 6 หลักไม่ถูกต้อง" });
  }
  
  const amt = parseFloat(amount);
  if (member.balanceECash < amt) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Cash ของคุณไม่เพียงพอ" });
  }
  
  const fee = amt * 0.10;
  const allSharePart = fee * 0.50; // 5% of amt
  const companyPart = fee * 0.50;  // 5% of amt
  const netAmount = amt - fee;      // 90% of amt
  
  member.balanceECash = parseFloat((member.balanceECash - amt).toFixed(4));
  member.balanceEMoney = parseFloat(((member.balanceEMoney || 0) + netAmount).toFixed(4));
  
  // Deduct/distribute fee
  db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits + companyPart).toFixed(4));
  processEShareDistribution(db, allSharePart, member.userId);
  
  // Log transaction
  db.transactions.push({
    id: "XEC_EM_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Withdraw",
    amount: amt,
    currency: "E-Cash",
    details: `โอนจาก E-Cash ไปยัง E-Money (ยอดโอน ฿${amt.toFixed(2)} • หักค่าบริการ 10% ฿${fee.toFixed(2)})`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  db.transactions.push({
    id: "DEC_EM_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Deposit",
    amount: netAmount,
    currency: "E-Money",
    details: `รับโอนจาก E-Cash (ยอดโอนสุทธิหลังหักค่าธรรมเนียม 10%)`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  res.json({
    success: true,
    message: `โอนเงินจาก E-Cash ไปยัง E-Money สำเร็จแล้วค่ะ! (ยอดรับสุทธิ ฿${netAmount.toFixed(2)})`,
    newECash: member.balanceECash,
    newEMoney: member.balanceEMoney
  });
});

// TRANSFER E-MONEY TO E-CASH (1:1, NO FEE)
app.post('/api/member/transfer-emoney-to-ecash', (req, res) => {
  const { senderId, userId, amount, pin, otp } = req.body;
  const senderIdActual = senderId || userId;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === senderIdActual);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  if (!db.otps || db.otps[senderIdActual] !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งานแล้วค่ะ" });
  }
  delete db.otps[senderIdActual];
  
  if (member.statusKyc !== "Active") {
    return res.status(400).json({ success: false, message: "กรุณาผ่านการยืนยันตัวตน (KYC) ให้สมบูรณ์ก่อนทำธุรกรรม" });
  }
  
  if (member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ธุรกรรม 6 หลักไม่ถูกต้อง" });
  }
  
  const amt = parseFloat(amount);
  if ((member.balanceEMoney || 0) < amt) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Money ของคุณไม่เพียงพอ" });
  }
  
  member.balanceEMoney = parseFloat(((member.balanceEMoney || 0) - amt).toFixed(4));
  member.balanceECash = parseFloat((member.balanceECash + amt).toFixed(4));
  
  db.transactions.push({
    id: "XEM_EC_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Withdraw",
    amount: amt,
    currency: "E-Money",
    details: `โอนจาก E-Money ไปยัง E-Cash`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  db.transactions.push({
    id: "DEM_EC_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Deposit",
    amount: amt,
    currency: "E-Cash",
    details: `รับโอนจาก E-Money สัดส่วน 1:1`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  res.json({
    success: true,
    message: "โอนเงินจาก E-Money ไปยัง E-Cash สำเร็จเรียบร้อยแล้วค่ะ!",
    newECash: member.balanceECash,
    newEMoney: member.balanceEMoney
  });
});

// TRANSFER E-MONEY TO E-COUPON (1:1, NO FEE)
app.post('/api/member/transfer-emoney-to-ecoupon', (req, res) => {
  const { senderId, userId, amount, pin, otp } = req.body;
  const senderIdActual = senderId || userId;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === senderIdActual);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  if (!db.otps || db.otps[senderIdActual] !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งานแล้วค่ะ" });
  }
  delete db.otps[senderIdActual];
  
  if (member.statusKyc !== "Active") {
    return res.status(400).json({ success: false, message: "กรุณาผ่านการยืนยันตัวตน (KYC) ให้สมบูรณ์ก่อนทำธุรกรรม" });
  }
  
  if (member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ธุรกรรม 6 หลักไม่ถูกต้อง" });
  }
  
  const amt = parseFloat(amount);
  if ((member.balanceEMoney || 0) < amt) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Money ของคุณไม่เพียงพอ" });
  }
  
  member.balanceEMoney = parseFloat(((member.balanceEMoney || 0) - amt).toFixed(4));
  member.balanceECoupon = parseFloat(((member.balanceECoupon || 0) + amt).toFixed(4));
  
  db.transactions.push({
    id: "XEM_CP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Withdraw",
    amount: amt,
    currency: "E-Money",
    details: `โอนเปลี่ยนเป็น E-Coupon`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  db.transactions.push({
    id: "DEM_CP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Deposit",
    amount: amt,
    currency: "E-Coupon",
    details: `ได้รับ E-Coupon จากการเปลี่ยนกระเป๋าเงิน E-Money`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  res.json({
    success: true,
    message: "โอนเงินจาก E-Money เปลี่ยนเป็น E-Coupon สำเร็จเรียบร้อยแล้วค่ะ!",
    newECoupon: member.balanceECoupon,
    newEMoney: member.balanceEMoney
  });
});

// WITHDRAW E-MONEY TO BANK
app.post('/api/member/withdraw', (req, res) => {
  const { userId, amount, pin, otp } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  if (!db.otps || db.otps[userId] !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งานแล้วค่ะ" });
  }
  delete db.otps[userId];
  
  if (member.statusKyc !== "Active") {
    return res.status(400).json({ success: false, message: "กรุณาผ่านการยืนยันตัวตน (KYC) ให้สมบูรณ์ก่อนทำธุรกรรม" });
  }
  
  if (member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ธุรกรรม 6 หลักไม่ถูกต้อง" });
  }
  
  const amt = parseFloat(amount);
  if (amt < 300) {
    return res.status(400).json({ success: false, message: "การถอนเงินขั้นต่ำต้องเป็น 300 บาทขึ้นไปค่ะ" });
  }
  if ((member.balanceEMoney || 0) < 300) {
    return res.status(400).json({ success: false, message: "การถอนเงินเข้าธนาคาร ต้องมียอดเงินใน E-Money ขั้นต่ำ 300 บาทขึ้นไปค่ะ" });
  }
  if ((member.balanceEMoney || 0) < amt) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Money ของคุณไม่เพียงพอสำหรับการถอนเงิน" });
  }
  
  // Deductions: 15% Platform charge, 5% withholding tax (based on remainder after 15%)
  const platformCharge = amt * 0.15;
  const taxableAmount = amt - platformCharge;
  const withholdingTax = taxableAmount * 0.05;
  const netReceived = amt - platformCharge - withholdingTax;
  
  member.balanceEMoney = parseFloat(((member.balanceEMoney || 0) - amt).toFixed(4));
  
  db.transactions.push({
    id: "WITH_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "WithdrawalRequest",
    amount: amt,
    netAmount: netReceived,
    currency: "E-Money",
    details: `ถอนเงินออกบัญชีธนาคาร ${member.bankName} เลขที่ ${member.bankAccount}`,
    status: "Pending", // Pending Admin approval
    createdAt: new Date().toISOString()
  });
  
  db.systemStats.totalTaxReserves = parseFloat((db.systemStats.totalTaxReserves + withholdingTax).toFixed(4));
  db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits + platformCharge).toFixed(4));
  
  writeDb(db);
  res.json({
    success: true,
    message: "ส่งคำถอนเงินสำเร็จ! เงินจะโอนเข้าบัญชีของคุณภายใน 48 ชั่วโมง",
    newEMoney: member.balanceEMoney,
    netReceived: parseFloat(netReceived.toFixed(2))
  });
});

// GET TRANSACTION LISTS
app.get('/api/member/transactions/:userId', (req, res) => {
  const uId = req.params.userId;
  const db = readDb();
  const txns = db.transactions.filter(t => t.userId === uId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, transactions: txns });
});

// GET MEMBER ORDERS
app.get('/api/member/orders/:userId', (req, res) => {
  const uId = req.params.userId;
  const db = readDb();
  if (!db.orders) db.orders = [];
  const memberOrders = db.orders.filter(o => o.userId === uId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, orders: memberOrders });
});

// GET DIRECT REFERRALS (Sponsor Tree)
app.get('/api/mlm/direct-referrals/:userId', (req, res) => {
  const rootId = req.params.userId;
  const db = readDb();
  const directReferrals = db.members.filter(m => m.sponsorId === rootId).map(m => ({
    userId: m.userId,
    sponsorId: m.sponsorId,
    username: m.username,
    name: `${m.name} ${m.surname}`,
    rank: m.rank,
    statusKyc: m.statusKyc,
    createdAt: m.createdAt,
    status: m.status || "Active"
  }));
  res.json({ success: true, members: directReferrals });
});

// GET ALL DESCENDANTS IN BINARY TREE (Plan A Descendants)
app.get('/api/mlm/binary-members/:userId', (req, res) => {
  const rootId = req.params.userId;
  const db = readDb();
  const descendants: any[] = [];
  const visited = new Set<string>();

  function traverse(nodeId) {
    if (!nodeId || visited.has(nodeId)) return;
    visited.add(nodeId);

    const children = db.members.filter(m => m.parentId === nodeId);
    for (const child of children) {
      descendants.push({
        userId: child.userId,
        sponsorId: child.sponsorId,
        username: child.username,
        name: `${child.name} ${child.surname}`,
        rank: child.rank,
        statusKyc: child.statusKyc,
        side: child.side,
        createdAt: child.createdAt,
        status: child.status || "Active"
      });
      traverse(child.userId);
    }
  }

  traverse(rootId);
  res.json({ success: true, members: descendants });
});

// UPDATE MEMBER PROFILE BY MEMBER THEMSELF
app.post('/api/member/update-profile', (req, res) => {
  const { userId, username, email, phone, bankName, bankAccount, idAddress, shippingAddress, useSameAddress } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  // If username changed, check if it already exists
  if (username && username.toLowerCase().trim() !== member.username.toLowerCase()) {
    const existing = db.members.find(m => m.username.toLowerCase() === username.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ success: false, message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });
    }
    member.username = username.toLowerCase().trim();
  }

  // Update bank account info
  if (bankName !== undefined) member.bankName = bankName;
  if (bankAccount !== undefined) member.bankAccount = bankAccount;

  // Update email and phone
  if (email !== undefined) member.email = email;
  if (phone !== undefined) {
    // Check if phone changed and if it exists
    if (phone !== member.phone) {
      const existingPhone = db.members.find(m => m.phone === phone);
      if (existingPhone) {
        return res.status(400).json({ success: false, message: "เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว" });
      }
    }
    member.phone = phone;
  }

  // Update address info
  if (idAddress !== undefined) member.idAddress = idAddress;
  if (shippingAddress !== undefined) member.shippingAddress = shippingAddress;
  if (useSameAddress !== undefined) member.useSameAddress = useSameAddress;

  // Note: member.name and member.surname are NOT updated here to satisfy "แก้ชื่อ สกุลไม่ได้"

  writeDb(db);
  res.json({ success: true, message: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ", profile: member });
});

// CHANGE PASSWORD BY MEMBER (Requires 6-digit PIN)
app.post('/api/member/change-password', (req, res) => {
  const { userId, currentPassword, newPassword, pin } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  if (member.password !== currentPassword) {
    return res.status(400).json({ success: false, message: "รหัสผ่านปัจจุบันไม่ถูกต้องค่ะ" });
  }

  if (member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัสธุรกรรม PIN ไม่ถูกต้องค่ะ" });
  }

  if (newPassword === "Netee!234") {
    return res.status(400).json({ success: false, message: "ห้ามใช้รหัสผ่านเริ่มต้นระบบเพื่อความปลอดภัย" });
  }

  member.password = newPassword;
  writeDb(db);
  res.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้วค่ะ" });
});

// SEND TRANSACTION OTP
app.post('/api/member/send-transaction-otp', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) db.otps = {};
  db.otps[userId] = otpCode;
  
  writeDb(db);
  res.json({ 
    success: true, 
    otp: otpCode,
    message: `ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล ${member.email} ของท่านเรียบร้อยแล้วค่ะ` 
  });
});

// SEND PIN CHANGE OTP
app.post('/api/member/send-pin-otp', (req, res) => {
  const { userId, email, otp } = req.body;
  const db = readDb();
  
  if (!db.otps) db.otps = {};
  db.otps[userId] = otp;
  
  writeDb(db);
  res.json({ success: true, message: "ส่งรหัส OTP เรียบร้อยแล้วค่ะ" });
});

// CHANGE PIN BY MEMBER
app.post('/api/member/change-pin', (req, res) => {
  const { userId, oldPin, newPin, confirmNewPin, otp } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  if (member.pin !== oldPin) {
    return res.status(400).json({ success: false, message: "รหัส PIN เดิมไม่ถูกต้องค่ะ" });
  }

  if (newPin !== confirmNewPin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ใหม่สองช่องไม่ตรงกันค่ะ" });
  }

  if (!newPin || newPin.length !== 6 || !/^\d+$/.test(newPin)) {
    return res.status(400).json({ success: false, message: "รหัส PIN ต้องเป็นตัวเลข 6 หลักเท่านั้นค่ะ" });
  }

  if (!db.otps || db.otps[userId] !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งานแล้วค่ะ" });
  }

  member.pin = newPin;
  // Clear OTP
  delete db.otps[userId];
  
  writeDb(db);
  res.json({ success: true, message: "เปลี่ยนรหัสธุรกรรม PIN 6 หลักสำเร็จเรียบร้อยแล้วค่ะ" });
});

// -------------------------------------------------------------
// SHOP / PRODUCTS AND COMMISSIONS
// -------------------------------------------------------------

// GET SHOP PRODUCTS
app.get('/api/shop/products', (req, res) => {
  const db = readDb();
  res.json({ success: true, products: db.products || [] });
});

// GET PACKAGE CHOICES
app.get('/api/shop/package-choices', (req, res) => {
  const db = readDb();
  res.json({ success: true, packageProductChoices: db.packageProductChoices || [] });
});

// ADD / EDIT PACKAGE CHOICE (Admin only)
app.post('/api/admin/package-choices', (req, res) => {
  const { id, packageId, name, cost } = req.body;
  const db = readDb();
  
  if (!packageId || !name) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  
  const choiceId = id || "PC_" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const parsedCost = cost !== undefined && cost !== "" ? parseFloat(cost) : 0;
  
  if (!db.packageProductChoices) {
    db.packageProductChoices = [];
  }
  
  const existingIndex = db.packageProductChoices.findIndex(c => c.id === choiceId);
  if (existingIndex >= 0) {
    db.packageProductChoices[existingIndex] = { id: choiceId, packageId, name, cost: parsedCost };
  } else {
    db.packageProductChoices.push({ id: choiceId, packageId, name, cost: parsedCost });
  }
  
  writeDb(db);
  res.json({ success: true, message: "บันทึกตัวเลือกแพ็กเกจสินค้าสำเร็จ", packageProductChoices: db.packageProductChoices });
});

// DELETE PACKAGE CHOICE (Admin only)
app.delete('/api/admin/package-choices/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  
  if (!db.packageProductChoices) {
    db.packageProductChoices = [];
  }
  
  db.packageProductChoices = db.packageProductChoices.filter(c => c.id !== id);
  writeDb(db);
  res.json({ success: true, message: "ลบตัวเลือกแพ็กเกจสินค้าสำเร็จ", packageProductChoices: db.packageProductChoices });
});

// BUY PACKAGE / SHOPPING
app.post('/api/shop/purchase', (req, res) => {
  const { userId, productId, quantity, shippingAddress, selectedChoiceId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
  
  // If user is "Member" (or has no rank), they can only buy packages
  const isPackage = product.category === "Package";
  const currentRank = member.rank || "Member";
  if (currentRank === "Member" && !isPackage) {
    return res.status(400).json({ success: false, message: "ท่านต้องทำการเลือกซื้อแพ็กเกจตำแหน่ง (S, M, L, XL, XXL) เพื่อเปิดสิทธิ์การทำรายการก่อนสั่งซื้อสินค้าทั่วไปค่ะ" });
  }
  
  const qty = parseInt(quantity) || 1;
  const totalPrice = product.price * qty;
  const totalPv = product.pv * qty;
  
  // 1. For packages M and above, force choosing a package set option
  if (isPackage && productId !== "pack_s") {
    if (!selectedChoiceId) {
      return res.status(400).json({ success: false, message: "กรุณาเลือกชุดเซ็ตสินค้าของแพ็กเกจเพื่อทำรายการสั่งซื้อค่ะ" });
    }
  }
  
  // 2. บังคับสมัครครั้งแรก ตำแหน่ง S เป็นค่าสมัครระบบร้านค้า (เช็คตำแหน่งล่าสุด ถ้าเป็น Member บังคับซื้อ S ก่อน)
  if (currentRank === "Member" && productId !== "pack_s") {
    return res.status(400).json({ 
      success: false, 
      message: "สำหรับการสั่งซื้อครั้งแรกเพื่อเปิดสิทธิ์ร้านค้า ท่านต้องสั่งซื้อสิทธิ์แพ็กเกจ S (100 บาท) ก่อนสั่งซื้อตำแหน่งอื่นหรือสินค้าทั่วไปค่ะ" 
    });
  }

  // 3. Perform pre-deduction check on balances to keep database transactions atomic and clean
  let couponUsed = 0;
  let eMoneyUsed = 0;
  let cashUsed = 0;

  if (isPackage) {
    if (member.balanceECash < totalPrice) {
      return res.status(400).json({ success: false, message: `ยอดเงิน E-Cash คงเหลือไม่พอสำหรับชำระเงินค่าแพ็กเกจ (ขาดอีก ${(totalPrice - member.balanceECash).toFixed(2)} บาท)` });
    }
    cashUsed = totalPrice;
  } else {
    couponUsed = Math.min(member.balanceECoupon || 0, totalPrice);
    let remaining = totalPrice - couponUsed;
    
    eMoneyUsed = Math.min(member.balanceEMoney || 0, remaining);
    remaining = remaining - eMoneyUsed;
    
    cashUsed = remaining;
    
    if (member.balanceECash < cashUsed) {
      return res.status(400).json({ 
        success: false, 
        message: `ยอดเงินคงเหลือไม่พอสำหรับชำระเงิน (ราคารวม ฿${totalPrice.toLocaleString()} • หัก E-Coupon ฿${couponUsed.toLocaleString()} • หัก E-Money ฿${eMoneyUsed.toLocaleString()} • ต้องใช้ E-Cash ชำระส่วนต่าง ฿${cashUsed.toLocaleString()} แต่มีเพียง ฿${member.balanceECash.toLocaleString()} • ขาดอีก ฿${(cashUsed - member.balanceECash).toFixed(2)})` 
      });
    }
  }

  // 4. All validations passed! Deduct the balances now.
  if (isPackage) {
    member.balanceECash = parseFloat((member.balanceECash - cashUsed).toFixed(4));
  } else {
    member.balanceECoupon = parseFloat(((member.balanceECoupon || 0) - couponUsed).toFixed(4));
    member.balanceEMoney = parseFloat(((member.balanceEMoney || 0) - eMoneyUsed).toFixed(4));
    member.balanceECash = parseFloat((member.balanceECash - cashUsed).toFixed(4));
  }
  
  // Upgrade Position Rank and top-up income quota ONLY based on package purchased (S, M, L, XL, XXL)
  if (isPackage) {
    let packageRank = "S";
    let maxEarningsMultiplier = 1000.00;
    
    if (productId === "pack_s") {
      packageRank = "S";
      maxEarningsMultiplier = 1000.00;
    } else if (productId === "pack_m") {
      packageRank = "M";
      maxEarningsMultiplier = 5000.00;
    } else if (productId === "pack_l") {
      packageRank = "L";
      maxEarningsMultiplier = 10000.00;
    } else if (productId === "pack_xl") {
      packageRank = "XL";
      maxEarningsMultiplier = 30000.00;
    } else if (productId === "pack_xxl") {
      packageRank = "XXL";
      maxEarningsMultiplier = 50000.00;
    }
    
    // Set rank only if it is higher than current
    const rankPriority = { "Member": 0, "S": 1, "M": 2, "L": 3, "XL": 4, "XXL": 5 };
    if (rankPriority[packageRank] > (rankPriority[currentRank] || 0)) {
      member.rank = packageRank;
    }
    
    // Auto-place in binary tree if not already placed and rank is now S or higher
    if (!member.parentId || member.parentId === "") {
      const binaryPlacement = findAndPlaceBinaryMember(db, member.sponsorId || "A260600001");
      member.parentId = binaryPlacement.parentId;
      member.side = binaryPlacement.side;
    }
    
    // Top-up income quota (10x of position cost)
    member.eligibleRights = (member.eligibleRights || 0) + maxEarningsMultiplier;
  }
  
  // Find selected package choice name
  let selectedChoiceName = "";
  if (selectedChoiceId) {
    const choice = db.packageProductChoices?.find(c => c.id === selectedChoiceId);
    if (choice) {
      selectedChoiceName = choice.name;
    }
  }
  
  // Record order
  const sellerId = (product as any).sellerId || db.sellerProducts?.find((sp: any) => sp.id === product.id)?.sellerId || null;
  const sellerCode = (product as any).sellerCode || db.sellerProducts?.find((sp: any) => sp.id === product.id)?.sellerCode || null;
  const sellerStoreName = (product as any).sellerStoreName || db.sellerProducts?.find((sp: any) => sp.id === product.id)?.sellerStoreName || null;

  const orderId = "ORD_" + Math.random().toString(36).substr(2, 9).toUpperCase();
  db.orders.push({
    id: orderId,
    userId: member.userId,
    productId: product.id,
    productName: product.name,
    selectedChoiceId: selectedChoiceId || null,
    selectedChoiceName: selectedChoiceName || null,
    price: product.price,
    quantity: qty,
    totalPrice: totalPrice,
    totalPv: totalPv,
    shippingAddress: shippingAddress || member.kycAddress || "ไม่มีที่อยู่ผู้จัดส่ง",
    status: productId === "pack_s" ? "Completed" : "Processing", // Will be marked as Completed by Admin
    sellerId,
    sellerCode,
    sellerStoreName,
    createdAt: new Date().toISOString()
  });
  
  // Log transaction
  if (isPackage) {
    db.transactions.push({
      id: "BUY_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: member.userId,
      type: "Withdraw",
      amount: totalPrice,
      currency: "E-Cash",
      details: `ชำระเงินซื้อแพ็กเกจ ${product.name}`,
      status: "Approved",
      createdAt: new Date().toISOString()
    });
  } else {
    if (couponUsed > 0) {
      db.transactions.push({
        id: "COUP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userId: member.userId,
        type: "Withdraw",
        amount: couponUsed,
        currency: "E-Coupon",
        details: `ชำระเงินซื้อสินค้าด้วย E-Coupon: ${product.name}`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }
    if (eMoneyUsed > 0) {
      db.transactions.push({
        id: "EMNY_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userId: member.userId,
        type: "Withdraw",
        amount: eMoneyUsed,
        currency: "E-Money",
        details: `ชำระเงินซื้อสินค้าด้วย E-Money (ระบบดึงอัตโนมัติ): ${product.name}`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }
    if (cashUsed > 0) {
      db.transactions.push({
        id: "CASH_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userId: member.userId,
        type: "Withdraw",
        amount: cashUsed,
        currency: "E-Cash",
        details: `ชำระเงินซื้อสินค้าด้วย E-Cash (ส่วนต่าง): ${product.name}`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Calculate Commissions:
  if (productId === "pack_s") {
    // S package special calculations:
    // 1. Direct referral (ค่าแนะนำ 50 บาท ให้ผู้แนะนำ ใน E-Cash ถูกหักตามเงื่อนไข)
    const sponsor = db.members.find(m => m.userId === member.sponsorId);
    let actualSponsorPayout = 0;
    if (sponsor) {
      const referralBonus = 50.00;
      actualSponsorPayout = distributeECashWithDeduction(db, sponsor, referralBonus, `ค่าแนะนำตรงตำแหน่ง S ของรหัส ${member.userId}`, member.userId);
    }

    // 2. Member's Coupon (เข้าคูปอง สมาชิก 10 บาท - หัก 10% เข้า All-Share)
    const rawCouponAward = 10.00;
    const netCouponAward = rawCouponAward * 0.90; // 9.00
    const couponToAllShare = rawCouponAward * 0.10; // 1.00

    member.balanceECoupon = parseFloat(((member.balanceECoupon || 0) + netCouponAward).toFixed(4));
    db.transactions.push({
      id: "COUP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: member.userId,
      type: "Deposit",
      amount: netCouponAward,
      currency: "E-Coupon",
      details: `โบนัส E-Coupon จากการสมัครตำแหน่ง S (หัก 10% เข้า All-Share)`,
      status: "Approved",
      createdAt: new Date().toISOString()
    });

    // 3. E-Share (เข้า E-Share 10 บาท + ส่วนที่หัก 1 บาท)
    processEShareDistribution(db, 10.00 + couponToAllShare, member.userId, true);

    // 4. CSR Fund (เข้ากองทุนปันสุข 5 บาท จ่ายในนามสมาชิก)
    db.csrFund.balance = parseFloat((db.csrFund.balance + 5.00).toFixed(4));
    db.csrFund.history.push({
      id: "CSR_TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      username: `${member.name} ${member.surname}`,
      userId: member.userId,
      amount: 5.00,
      type: "Donation",
      details: `เงินกองทุนปันสุข จ่ายในนามสมาชิกใหม่รหัส ${member.userId} จากการสมัครแพ็กเกจ S`,
      createdAt: new Date().toISOString()
    });

    // 5. Plan Points (เข้ายอดสะสม Plan 5 บาท ของสมาชิก)
    member.planBPoints = parseFloat(((member.planBPoints || 0) + 5.00).toFixed(4));
    db.transactions.push({
      id: "PLAN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: member.userId,
      type: "Bonus",
      amount: 5.00,
      currency: "PlanBPoints",
      details: `คะแนนสะสม Plan B จากการสมัครตำแหน่ง S`,
      status: "Approved",
      createdAt: new Date().toISOString()
    });

    // 6. VAT 7% and Company fee:
    // VAT 7%: 6.54 Baht, goes to tax reserves
    // Company operates: 13.46 Baht, goes to totalCompanyProfits. 
    // Plus any unpaid sponsor bonus if sponsor's rights were insufficient.
    const vatAmount = 6.54;
    const standardCompanyFee = 13.46;
    const unpaidSponsorBonus = 50.00 - actualSponsorPayout;
    const actualCompanyFee = standardCompanyFee + unpaidSponsorBonus;

    db.systemStats.totalTaxReserves = parseFloat((db.systemStats.totalTaxReserves + vatAmount).toFixed(4));
    db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits + actualCompanyFee).toFixed(4));

  } else {
    // Standard calculations for non-S packages and general products:
    // 1. Sponsor / Direct Referral Bonus (using our new deduction helper)
    const sponsor = db.members.find(m => m.userId === member.sponsorId);
    let actualSponsorPayout = 0;
    const referralBonus = totalPv * 0.50;
    
    if (sponsor) {
      actualSponsorPayout = distributeECashWithDeduction(
        db, 
        sponsor, 
        referralBonus, 
        `ค่าแนะนำตรงจากการสั่งซื้อสินค้า/แพ็กเกจ ${product.name} ของรหัส ${member.userId}`, 
        member.userId
      );
    }
    
    // 2. Binary Tree PV Commissions (20 layers, 2.5% per layer)
    // If coupons were used, split the PV into coupon PV (held) and cash PV (processed immediately)
    if (!isPackage && couponUsed > 0) {
      const couponProportion = couponUsed / totalPrice;
      const couponPv = totalPv * couponProportion;
      const cashPv = totalPv - couponPv;
      
      if (couponPv > 0) {
        if (!db.pendingCouponPV) db.pendingCouponPV = [];
        db.pendingCouponPV.push({
          id: "PEND_PV_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          buyerId: member.userId,
          pvAmount: parseFloat(couponPv.toFixed(4)),
          orderId: orderId,
          createdAt: new Date().toISOString(),
          status: "Pending"
        });
        
        // Log transaction for pending coupon PV
        db.transactions.push({
          id: "COUP_PV_HOLD_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: member.userId,
          type: "Bonus",
          amount: parseFloat(couponPv.toFixed(4)),
          currency: "PV",
          details: `ยอด PV จากคูปองจำนวน ${couponPv.toFixed(2)} PV พักไว้คำนวณรอบตัดจ่าย (ทุกวันที่ 10 หรือเมื่อแอดมินตัดยอด)`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
      }
      
      if (cashPv > 0) {
        calculateBinaryCommissions(db, member.userId, cashPv, orderId);
      }
    } else {
      // Direct cash/package payment: process full PV immediately
      calculateBinaryCommissions(db, member.userId, totalPv, orderId);
    }

    // 3. Company margin and tax calculations:
    // VAT 7% included in price:
    const vatAmount = parseFloat((totalPrice * 7 / 107).toFixed(4));
    
    // Product cost: use product's cost if specified, else default to 30% of price
    const productCostPerPiece = product.cost !== undefined ? product.cost : Math.floor(product.price * 0.30);
    const totalProductCost = parseFloat((productCostPerPiece * qty).toFixed(4));
    
    // Company margin/profit = Price - PV (commissions allocated) - VAT 7% - Cost
    // Plus any unpaid sponsor bonus if sponsor's rights were insufficient.
    const standardCompanyProfit = totalPrice - totalPv - vatAmount - totalProductCost;
    const unpaidSponsorBonus = referralBonus - actualSponsorPayout;
    const companyProfit = parseFloat((standardCompanyProfit + unpaidSponsorBonus).toFixed(4));
    
    db.systemStats.totalTaxReserves = parseFloat((db.systemStats.totalTaxReserves + vatAmount).toFixed(4));
    db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits + companyProfit).toFixed(4));
  }
  
  writeDb(db);
  res.json({
    success: true,
    message: "สั่งซื้อและชำระเงินเรียบร้อยแล้วค่ะ!",
    newECash: member.balanceECash,
    rank: member.rank,
    eligibleRights: member.eligibleRights
  });
});

// GET MLM BINARY PLAN A TREE
app.get('/api/mlm/binary-tree/:userId', (req, res) => {
  const rootId = req.params.userId;
  const callerId = req.query.callerId as string;
  const db = readDb();
  
  // Resolve target member
  let targetMember = db.members.find(m => m.userId === rootId || m.username === rootId);
  if (!targetMember) {
    targetMember = db.members.find(m => m.userId?.toUpperCase() === rootId.toUpperCase() || m.username?.toLowerCase() === rootId.toLowerCase());
  }
  
  if (!targetMember) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกในระบบค่ะ" });
  }
  
  const resolvedRootId = targetMember.userId;
  
  // Downline check for search restrictions
  if (callerId && callerId !== resolvedRootId) {
    const caller = db.members.find(m => m.userId === callerId);
    const isAdminOrManager = caller && (caller.role === 'Admin' || caller.role === 'Manager');
    if (!isAdminOrManager) {
      let isAllowed = false;
      let currentId = resolvedRootId;
      const visited = new Set();
      while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const m = db.members.find(x => x.userId === currentId);
        if (!m) break;
        if (m.parentId === callerId) {
          isAllowed = true;
          break;
        }
        currentId = m.parentId;
      }
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: "ค้นหาหรือดูได้เฉพาะสมาชิกภายใต้สายงานคุณเท่านั้นค่ะ" });
      }
    }
  }
  
  // Recursively build tree structure up to 5 levels
  function buildTree(nodeId, depth = 1) {
    const member = db.members.find(m => m.userId === nodeId);
    if (!member || depth > 5) return null;
    
    const leftChild = db.members.find(m => m.parentId === nodeId && m.side === "Left");
    const rightChild = db.members.find(m => m.parentId === nodeId && m.side === "Right");
    
    return {
      userId: member.userId,
      username: member.username,
      name: `${member.name} ${member.surname}`,
      rank: member.rank,
      statusKyc: member.statusKyc,
      side: member.side,
      status: member.status || "Active",
      left: leftChild ? buildTree(leftChild.userId, depth + 1) : null,
      right: rightChild ? buildTree(rightChild.userId, depth + 1) : null
    };
  }
  
  const tree = buildTree(resolvedRootId);
  if (!tree) return res.status(404).json({ success: false, message: "ไม่พบสายงาน" });
  
  res.json({ success: true, tree, parentId: targetMember.parentId || null });
});

// GET MLM REFERRAL SPONSOR TREE
app.get('/api/mlm/referral-tree/:userId', (req, res) => {
  const rootId = req.params.userId;
  const callerId = req.query.callerId as string;
  const db = readDb();
  
  // Resolve target member
  let targetMember = db.members.find(m => m.userId === rootId || m.username === rootId);
  if (!targetMember) {
    targetMember = db.members.find(m => m.userId?.toUpperCase() === rootId.toUpperCase() || m.username?.toLowerCase() === rootId.toLowerCase());
  }
  
  if (!targetMember) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกในระบบค่ะ" });
  }
  
  const resolvedRootId = targetMember.userId;
  
  // Downline check for search restrictions
  if (callerId && callerId !== resolvedRootId) {
    const caller = db.members.find(m => m.userId === callerId);
    const isAdminOrManager = caller && (caller.role === 'Admin' || caller.role === 'Manager');
    if (!isAdminOrManager) {
      let isAllowed = false;
      let currentId = resolvedRootId;
      const visited = new Set();
      while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const m = db.members.find(x => x.userId === currentId);
        if (!m) break;
        if (m.sponsorId === callerId) {
          isAllowed = true;
          break;
        }
        currentId = m.sponsorId;
      }
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: "ค้นหาหรือดูได้เฉพาะสมาชิกภายใต้สายงานแนะนำตรงของคุณเท่านั้นค่ะ" });
      }
    }
  }
  
  function buildReferralTree(nodeId, depth = 1) {
    const member = db.members.find(m => m.userId === nodeId);
    if (!member || depth > 5) return null;
    
    const recruits = db.members.filter(m => m.sponsorId === nodeId);
    
    return {
      userId: member.userId,
      username: member.username,
      name: `${member.name} ${member.surname}`,
      rank: member.rank,
      statusKyc: member.statusKyc,
      status: member.status || "Active",
      children: recruits.map(r => buildReferralTree(r.userId, depth + 1)).filter(Boolean)
    };
  }
  
  const tree = buildReferralTree(resolvedRootId);
  if (!tree) return res.status(404).json({ success: false, message: "ไม่พบสายงานแนะนำตรง" });
  
  res.json({ success: true, tree, parentId: targetMember.sponsorId || null });
});

// GET PLAN B LISTINGS
app.get('/api/mlm/plan-b/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  
  const planB: any = {
    points: db.members.find((m: any) => m.userId === userId)?.planBPoints || 0
  };

  // Populate b1 through b15 dynamically
  for (let i = 1; i <= 15; i++) {
    const tierKey = `b${i}`;
    const treeList = db.planB_Tree[tierKey] || [];
    planB[`b${i}Nodes`] = treeList.filter((n: any) => n.memberUserId === userId);
    planB[`globalB${i}Count`] = treeList.length;
  }
  
  res.json({
    success: true,
    planB
  });
});

// GET CSR FUND LOGS AND SCROLL FEED
app.get('/api/csr/feed', (req, res) => {
  const db = readDb();
  const history = db.csrFund.history.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
  res.json({
    success: true,
    balance: db.csrFund.balance,
    feed: history.map(h => ({
      name: h.username,
      amount: h.amount,
      createdAt: h.createdAt
    }))
  });
});

// -------------------------------------------------------------
// SELLER REGISTER AND SELLER CENTER
// -------------------------------------------------------------

app.post('/api/seller/apply', (req, res) => {
  const { userId, storeName, storeAddress, warehouseLat, warehouseLng } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  // 1. สมาชิกที่จะเปิดร้านค้าได้ต้องมีตำแหน่ง M ขึ้นไป
  const allowedRanks = ["M", "L", "XL", "XXL"];
  if (!member.rank || !allowedRanks.includes(member.rank)) {
    return res.status(400).json({ 
      success: false, 
      message: "สำหรับการสมัครเปิดบัญชีร้านค้า Natee Plus Seller Center ท่านต้องมีตำแหน่งสมาชิกตั้งแต่ระดับ M ขึ้นไปเท่านั้นค่ะ" 
    });
  }

  const sellerCodeNum = db.members.filter(m => m.sellerStatus === "Active").length + 1;
  const code = `A26${("0000" + sellerCodeNum).slice(-4)}`;
  
  member.sellerStatus = "Pending"; // Pending admin approval
  member.sellerCode = code;
  member.sellerStoreName = storeName;
  member.sellerAddress = storeAddress;
  member.warehouseLat = warehouseLat ? parseFloat(warehouseLat) : null;
  member.warehouseLng = warehouseLng ? parseFloat(warehouseLng) : null;
  
  writeDb(db);
  res.json({ success: true, message: "ยื่นใบสมัครเปิดร้านค้าออนไลน์สำเร็จ! รหัสร้านค้าของคุณคือ " + code });
});

// RESET SELLER STATUS FOR RE-APPLY
app.post('/api/seller/reset-status', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  member.sellerStatus = "NotApplied";
  writeDb(db);
  res.json({ success: true, message: "รีเซ็ตสถานะการสมัครเรียบร้อย สามารถกรอกข้อมูลยื่นใบสมัครใหม่ได้ทันทีค่ะ" });
});

// ADD PRODUCT
app.post('/api/seller/product', (req, res) => {
  const { userId, productName, price, pv, imageFile, description, shortDescription, category, cost } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member || member.sellerStatus !== "Active") {
    return res.status(403).json({ success: false, message: "เฉพาะผู้ขายที่ผ่านการอนุมัติร้านค้าเท่านั้นที่เพิ่มสินค้าได้" });
  }
  
  let imageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300";
  if (imageFile && imageFile.startsWith("data:")) {
    try {
      const ext = imageFile.split(';')[0].split('/')[1] || 'png';
      const base64Data = imageFile.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `prod_${userId}_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, fileName), base64Data, 'base64');
      imageUrl = `/uploads/${fileName}`;
    } catch (e) {
      console.error(e);
    }
  }
  
  const priceVal = parseFloat(price);
  const costVal = cost !== undefined && cost !== "" ? parseFloat(cost) : Math.floor(priceVal * 0.30);

  const newProduct = {
    id: "prod_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    sellerId: userId,
    sellerCode: member.sellerCode,
    sellerStoreName: member.sellerStoreName,
    name: productName,
    price: priceVal,
    pv: parseFloat(pv),
    cost: costVal,
    image: imageUrl,
    description,
    shortDescription: shortDescription || "",
    category,
    status: "Pending" // Pending Admin approval
  };
  
  db.sellerProducts.push(newProduct);
  writeDb(db);
  
  res.json({ success: true, message: "เพิ่มสินค้าเข้าร้านค้าสำเร็จ! อยู่ระหว่างรอแอดมินตรวจสอบก่อนแสดงผลบนช็อป" });
});

// GET SELLER PRODUCTS
app.get('/api/seller/products/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const products = db.sellerProducts.filter(p => p.sellerId === userId);
  res.json({ success: true, products });
});

// GET SELLER ORDERS
app.get('/api/seller/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const orders = db.orders.filter((o: any) => o.sellerId === userId);
  res.json({ success: true, orders });
});

// SELLER UPDATE ORDER TRACKING
app.post('/api/seller/order-ship', (req, res) => {
  const { orderId, sellerId, trackingCompany, trackingNo, shippingNote } = req.body;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลการสั่งซื้อ" });
  
  if (order.sellerId !== sellerId) {
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์จัดการบิลสั่งซื้อนี้" });
  }
  
  order.status = "Completed";
  order.trackingCompany = trackingCompany || "";
  order.trackingNo = trackingNo || "";
  order.shippingNote = shippingNote || "";
  
  writeDb(db);
  res.json({ success: true, message: "บันทึกข้อมูลจัดส่งและจัดส่งสินค้าสำเร็จ!" });
});

// -------------------------------------------------------------
// ADMIN CONSOLE ENDPOINTS
// -------------------------------------------------------------

// GET Pending KYC
app.get('/api/admin/kyc-queue', (req, res) => {
  const db = readDb();
  const pendingKyc = db.members.filter(m => m.statusKyc === "Pending");
  res.json({ success: true, queue: pendingKyc });
});

// APPROVE KYC
app.post('/api/admin/kyc-approve', (req, res) => {
  const { userId, adminId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  member.statusKyc = "Active";
  writeDb(db);
  res.json({ success: true, message: `อนุมัติเอกสารตัวตน (KYC) สมาชิก ${member.name} สำเร็จแล้ว` });
});

// REJECT KYC
app.post('/api/admin/kyc-reject', (req, res) => {
  const { userId, reason } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  member.statusKyc = "Rejected";
  member.kycRejectReason = reason;
  writeDb(db);
  res.json({ success: true, message: `ปฏิเสธเอกสารยืนยันตัวตน KYC เรียบร้อยแล้ว ระบบจะส่งเมลแจ้งเหตุผลให้ทราบ` });
});

// GET PENDING COUPON PV
app.get('/api/admin/pending-coupon-pv', (req, res) => {
  const db = readDb();
  const pending = db.pendingCouponPV || [];
  res.json({
    success: true,
    pending: pending.filter(p => p.status === "Pending"),
    history: pending.filter(p => p.status === "Completed")
  });
});

// PROCESS PENDING COUPON PV (Manual Cut-off)
app.post('/api/admin/process-pending-coupon-pv', (req, res) => {
  const db = readDb();
  if (!db.pendingCouponPV) db.pendingCouponPV = [];
  
  const pendingItems = db.pendingCouponPV.filter(item => item.status === "Pending");
  if (pendingItems.length === 0) {
    return res.json({ success: true, message: "ไม่มียอด PV ค้างคำนวณในระบบ", processedCount: 0, totalProcessedPv: 0 });
  }
  
  let totalProcessedPv = 0;
  pendingItems.forEach(item => {
    calculateBinaryCommissions(db, item.buyerId, item.pvAmount, item.orderId);
    item.status = "Completed";
    totalProcessedPv += item.pvAmount;
    
    // Add transaction log
    db.transactions.push({
      id: "COUP_PV_REL_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: item.buyerId,
      type: "Bonus",
      amount: parseFloat(item.pvAmount.toFixed(4)),
      currency: "PV",
      details: `คำนวณและจ่ายเงินปันผลจากยอด PV คูปองสะสมจำนวน ${item.pvAmount.toFixed(2)} PV เข้าแผนไบนารี่สำเร็จ`,
      status: "Approved",
      createdAt: new Date().toISOString()
    });
  });
  
  writeDb(db);
  res.json({
    success: true,
    message: `ประมวลผลคำนวณและตัดจ่าย PV จากคูปองเรียบร้อยแล้ว รวมทั้งหมด ${pendingItems.length} รายการ คิดเป็นยอด ${totalProcessedPv.toFixed(2)} PV`,
    processedCount: pendingItems.length,
    totalProcessedPv
  });
});

// GET SYSTEM AUDIT STATS
app.get('/api/admin/stats', (req, res) => {
  const db = readDb();
  const stats = db.systemStats;
  const csrBalance = db.csrFund.balance;
  
  // Total taxable transactions
  const totalECashHeld = db.members.reduce((acc, m) => acc + (m.balanceECash || 0), 0);
  const totalECouponHeld = db.members.reduce((acc, m) => acc + (m.balanceECoupon || 0), 0);
  
  res.json({
    success: true,
    stats: {
      planBReserves: stats.totalPlanBReserves,
      taxReserves: stats.totalTaxReserves,
      companyProfits: stats.totalCompanyProfits,
      csrBalance: csrBalance,
      memberECash: totalECashHeld,
      memberECoupon: totalECouponHeld,
      netProfits: parseFloat((stats.totalCompanyProfits * 0.85).toFixed(2)) // Net system profit
    }
  });
});

// WITHDRAW CSR WITH MANAGER OTP CHECK
app.post('/api/admin/csr-withdraw', (req, res) => {
  const { amount, purpose, managerOtp } = req.body;
  const db = readDb();
  
  const amt = parseFloat(amount);
  if (db.csrFund.balance < amt) {
    return res.status(400).json({ success: false, message: "ยอดเงินกองทุนปันสุขมีไม่เพียงพอ" });
  }
  
  // Simple check on simulated OTP
  if (managerOtp !== "123456") {
    return res.status(400).json({ success: false, message: "รหัสอนุมัติแบบความปลอดภัยกุญแจคู่ร่วม (Manager Approval Key) ไม่ถูกต้อง" });
  }
  
  db.csrFund.balance = parseFloat((db.csrFund.balance - amt).toFixed(4));
  db.csrFund.history.push({
    id: "CSR_WITH_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    username: "คณะบริหาร นที ปันสุข",
    userId: "SYSTEM_OUT",
    amount: amt,
    type: "Withdrawal",
    details: `ถอนเงินกองทุนปันสุขเพื่อการกุศล: ${purpose}`,
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  res.json({ success: true, message: `อนุมัติทำรายการถอนเงินกองทุนปันสุข ${amt.toLocaleString()} บาท ไปจัดกิจกรรม ${purpose} เรียบร้อยแล้ว!` });
});

// GET LIST OF PENDING STORE REGISTRATIONS
app.get('/api/admin/store-queue', (req, res) => {
  const db = readDb();
  const stores = db.members.filter(m => m.sellerStatus === "Pending");
  res.json({ success: true, queue: stores });
});

// APPROVE STORE
app.post('/api/admin/store-approve', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  
  member.sellerStatus = "Active";
  writeDb(db);
  res.json({ success: true, message: `เปิดใช้งานพอร์ทัลผู้จัดจำหน่ายรหัสร้านค้า ${member.sellerCode} ของคุณเสร็จสิ้น!` });
});

// GET SELLER PENDING PRODUCTS
app.get('/api/admin/products-queue', (req, res) => {
  const db = readDb();
  const prods = db.sellerProducts.filter(p => p.status === "Pending");
  res.json({ success: true, queue: prods });
});

// APPROVE SELLER PRODUCT
app.post('/api/admin/product-approve', (req, res) => {
  const { productId } = req.body;
  const db = readDb();
  const prod = db.sellerProducts.find(p => p.id === productId);
  if (!prod) return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
  
  prod.status = "Approved";
  
  // Remove existing copy in db.products if any, to avoid duplicate
  db.products = db.products.filter(p => p.id !== productId);
  
  // Push copy to main store products
  db.products.push({
    id: prod.id,
    name: prod.name,
    price: prod.price,
    pv: prod.pv,
    cost: prod.cost !== undefined ? prod.cost : Math.floor(prod.price * 0.30),
    image: prod.image,
    description: prod.description,
    shortDescription: prod.shortDescription || "",
    category: prod.category || "General",
    sellerCode: prod.sellerCode,
    sellerStoreName: prod.sellerStoreName
  });
  
  writeDb(db);
  res.json({ success: true, message: "อนุมัติเปิดจำหน่ายสินค้าร้านร่วมสำเร็จ!" });
});

// REJECT SELLER PRODUCT
app.post('/api/admin/product-reject', (req, res) => {
  const { productId, reason } = req.body;
  const db = readDb();
  const prod = db.sellerProducts.find(p => p.id === productId);
  if (!prod) return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
  
  prod.status = "Rejected";
  prod.rejectReason = reason || "ไม่ผ่านการอนุมัติเนื่องจากข้อมูลไม่ครบถ้วนหรือไม่เหมาะสม";
  
  // Remove from main store if exists
  db.products = db.products.filter(p => p.id !== productId);
  
  writeDb(db);
  res.json({ success: true, message: "ปฏิเสธการอนุมัติสินค้าชิ้นนี้เรียบร้อยแล้ว" });
});

// REJECT STORE APPLICATION
app.post('/api/admin/store-reject', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  
  member.sellerStatus = "Rejected";
  writeDb(db);
  res.json({ success: true, message: `ปฏิเสธการขอเปิดร้านร่วมเสร็จสิ้น` });
});

// ADMIN EDIT PRODUCT PRICE & DETAILS
app.post('/api/admin/product-update-price', (req, res) => {
  const { productId, price, pv, cost } = req.body;
  const db = readDb();
  const prod = db.sellerProducts.find(p => p.id === productId);
  if (!prod) return res.status(404).json({ success: false, message: "ไม่พบสินค้าในรายการทั้งหมด" });
  
  if (price !== undefined) prod.price = parseFloat(price);
  if (pv !== undefined) prod.pv = parseFloat(pv);
  if (cost !== undefined) prod.cost = parseFloat(cost);
  
  // Also update in main store (db.products) if it was approved
  const mainProd = db.products.find(p => p.id === productId);
  if (mainProd) {
    if (price !== undefined) mainProd.price = parseFloat(price);
    if (pv !== undefined) mainProd.pv = parseFloat(pv);
    if (cost !== undefined) mainProd.cost = parseFloat(cost);
  }
  
  writeDb(db);
  res.json({ success: true, message: "แก้ไขข้อมูลและราคาสินค้าเรียบร้อยแล้ว" });
});

// ADMIN DELETE PRODUCT IMAGE
app.post('/api/admin/product-delete-image', (req, res) => {
  const { productId } = req.body;
  const db = readDb();
  const prod = db.sellerProducts.find(p => p.id === productId);
  if (!prod) return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
  
  prod.image = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=200&q=80"; // standard placeholder
  
  // Also update in main store if approved
  const mainProd = db.products.find(p => p.id === productId);
  if (mainProd) {
    mainProd.image = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=200&q=80";
  }
  
  writeDb(db);
  res.json({ success: true, message: "ลบรูปภาพสินค้าและแทนที่ด้วยรูปเริ่มต้นเสร็จสิ้น" });
});

// GET ALL SELLER PRODUCTS FOR ADMIN
app.get('/api/admin/all-products', (req, res) => {
  const db = readDb();
  res.json({ success: true, products: db.sellerProducts || [] });
});

// EDIT SELLER PRODUCT (Every edit forces re-approval)
app.post('/api/seller/product/edit', (req, res) => {
  const { userId, productId, productName, price, pv, imageFile, description, shortDescription, category, cost } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member || member.sellerStatus !== "Active") {
    return res.status(403).json({ success: false, message: "เฉพาะผู้ขายที่ผ่านการอนุมัติร้านค้าเท่านั้นที่แก้ไขข้อมูลสินค้าได้" });
  }
  
  const prod = db.sellerProducts.find(p => p.id === productId && p.sellerId === userId);
  if (!prod) return res.status(404).json({ success: false, message: "ไม่พบสินค้าชิ้นนี้" });
  
  let imageUrl = prod.image;
  if (imageFile && imageFile.startsWith("data:")) {
    try {
      const ext = imageFile.split(';')[0].split('/')[1] || 'png';
      const base64Data = imageFile.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `prod_${userId}_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, fileName), base64Data, 'base64');
      imageUrl = `/uploads/${fileName}`;
    } catch (e) {
      console.error(e);
    }
  }
  
  const priceVal = parseFloat(price);
  const costVal = cost !== undefined && cost !== "" ? parseFloat(cost) : Math.floor(priceVal * 0.30);
  
  // Update properties
  prod.name = productName;
  prod.price = priceVal;
  prod.pv = parseFloat(pv);
  prod.cost = costVal;
  prod.image = imageUrl;
  prod.description = description;
  prod.shortDescription = shortDescription || "";
  prod.category = category || "General";
  
  // Every edit returns product to Pending (must re-approve)
  prod.status = "Pending";
  if (prod.rejectReason) {
    delete prod.rejectReason;
  }
  
  // Remove from main store until approved again
  db.products = db.products.filter(p => p.id !== productId);
  
  writeDb(db);
  res.json({ success: true, message: "แก้ไขรายละเอียดสินค้าสำเร็จ! นำส่งให้แอดมินอนุมัติใหม่อีกครั้งเพื่อความโปร่งใสเรียบร้อยแล้วค่ะ" });
});

// GET ALL ORDERS FOR ADMIN REPORT
app.get('/api/admin/orders', (req, res) => {
  const db = readDb();
  res.json({ success: true, orders: db.orders });
});

// COMPLETE ORDER
app.post('/api/admin/order-complete', (req, res) => {
  const { orderId, trackingCompany, trackingNo, shippingNote } = req.body;
  const db = readDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลการสั่งซื้อ" });
  
  order.status = "Completed";
  order.trackingCompany = trackingCompany || "";
  order.trackingNo = trackingNo || "";
  order.shippingNote = shippingNote || "";
  
  writeDb(db);
  res.json({ success: true, message: "ยืนยันการจัดส่งพัสดุและบันทึกข้อมูลการจัดส่งเรียบร้อยแล้ว!" });
});

// UPDATE ORDER TRACKING
app.post('/api/admin/order-update-tracking', (req, res) => {
  const { orderId, trackingCompany, trackingNo, shippingNote, status } = req.body;
  const db = readDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลการสั่งซื้อ" });
  
  if (status) order.status = status;
  order.trackingCompany = trackingCompany || "";
  order.trackingNo = trackingNo || "";
  order.shippingNote = shippingNote || "";
  
  writeDb(db);
  res.json({ success: true, message: "อัปเดตข้อมูลและสถานะการจัดส่งเรียบร้อยแล้ว!" });
});

// GET ALL WITHDRAWAL QUEUES FOR BANK TRANSFER
app.get('/api/admin/withdrawal-queue', (req, res) => {
  const db = readDb();
  const queues = db.transactions.filter(t => t.type === "WithdrawalRequest" && t.status === "Pending");
  res.json({ success: true, queue: queues });
});

// APPROVE WITHDRAWAL
app.post('/api/admin/withdrawal-approve', (req, res) => {
  const { txnId, deductionType } = req.body;
  const db = readDb();
  const txn = db.transactions.find(t => t.id === txnId);
  if (!txn) return res.status(404).json({ success: false, message: "ไม่พบรายการธุรกรรม" });
  
  txn.status = "Approved";
  txn.deductionType = deductionType; // Record deduction type
  
  // Deduct from system stats if applicable
  if (deductionType === 'Tax' && txn.netAmount) {
     db.systemStats.totalTaxReserves = parseFloat((db.systemStats.totalTaxReserves - (txn.amount - txn.netAmount)).toFixed(4));
  } else if (deductionType === 'Profit' && txn.netAmount) {
     db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits - txn.netAmount).toFixed(4));
  }
  
  writeDb(db);
  res.json({ success: true, message: "อนุมัติการสั่งถอนเรียบร้อยแล้ว" });
});

// GET ALL DEPOSIT QUEUES FOR SLIP VERIFICATION
app.get('/api/admin/deposit-queue', (req, res) => {
  const db = readDb();
  const queue = (db.transactions || []).filter(t => t.type === "Deposit" && t.status === "Pending");
  res.json({ success: true, queue });
});

// APPROVE DEPOSIT SLIP
app.post('/api/admin/deposit-approve', (req, res) => {
  const { txnId, approvedAmount } = req.body;
  const db = readDb();
  const txn = db.transactions.find(t => t.id === txnId);
  if (!txn) return res.status(404).json({ success: false, message: "ไม่พบรายการธุรกรรม" });
  
  txn.status = "Approved";
  
  const member = db.members.find(m => m.userId === txn.userId);
  if (member) {
    let creditAmt = txn.transferAmount || txn.amount || 0;
    if (approvedAmount !== undefined && approvedAmount !== null) {
      const parsedAmt = parseFloat(approvedAmount);
      if (!isNaN(parsedAmt) && parsedAmt >= 0) {
        creditAmt = parsedAmt;
      }
    }
    member.balanceECash = parseFloat(((member.balanceECash || 0) + creditAmt).toFixed(4));
    txn.details = `อนุมัติเติมเงิน E-Cash เข้าบัญชี ฿${creditAmt.toLocaleString()}`;
    
    // Add transaction history record for approval
    db.transactions.push({
      id: "DEP_APR_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: member.userId,
      type: "Deposit_System",
      amount: creditAmt,
      currency: "E-Cash",
      details: `ได้รับเครดิต E-Cash จากการอนุมัติสลิปโอนเงิน (รหัสธุรกรรมอ้างอิง: ${txnId})`,
      status: "Approved",
      createdAt: new Date().toISOString()
    });
  }
  
  writeDb(db);
  res.json({ success: true, message: "อนุมัติรายการเติมเงิน E-Cash เรียบร้อยแล้วค่ะ" });
});

// REJECT DEPOSIT SLIP
app.post('/api/admin/deposit-reject', (req, res) => {
  const { txnId, reason } = req.body;
  const db = readDb();
  const txn = db.transactions.find(t => t.id === txnId);
  if (!txn) return res.status(404).json({ success: false, message: "ไม่พบรายการธุรกรรม" });
  
  txn.status = "Rejected";
  txn.details = `ปฏิเสธการเติมเงิน E-Cash: ${reason || 'ข้อมูลหรือสลิปไม่ถูกต้อง'}`;
  
  writeDb(db);
  res.json({ success: true, message: "ปฏิเสธรายการเติมเงินเรียบร้อยแล้วค่ะ" });
});

// GET SYSTEM BANK SETTINGS FOR DEPOSIT
app.get('/api/bank-settings', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    bankSettings: db.bankSettings || {
      bankName: "ธนาคารไทยพาณิชย์",
      bankAccount: "111-222-3333",
      bankAccountName: "บริษัท นที พลัส จำกัด",
      qrCodeUrl: ""
    }
  });
});

// UPDATE SYSTEM BANK SETTINGS FOR DEPOSIT
app.post('/api/bank-settings', (req, res) => {
  const { bankName, bankAccount, bankAccountName, qrCodeFile, editorUserId } = req.body;
  const db = readDb();
  
  if (editorUserId) {
    const editor = db.members.find(m => m.userId === editorUserId);
    if (!editor || editor.role !== 'Manager') {
      return res.status(403).json({ success: false, message: "ไม่มีสิทธิ์ในการแก้ไขข้อมูลบัญชีธนาคาร (เฉพาะสิทธิ์ Manager เท่านั้น)" });
    }
  }

  let qrCodeUrl = db.bankSettings?.qrCodeUrl || "";
  try {
    if (qrCodeFile && qrCodeFile.startsWith("data:")) {
      const ext = qrCodeFile.split(';')[0].split('/')[1] || 'png';
      const base64Data = qrCodeFile.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `bank_qr_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, fileName), base64Data, 'base64');
      qrCodeUrl = `/uploads/${fileName}`;
    } else if (qrCodeFile === null || qrCodeFile === "") {
      qrCodeUrl = "";
    }
  } catch (err) {
    console.error("Error saving QR Code file:", err);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกรูปภาพ QR Code" });
  }

  db.bankSettings = {
    bankName: bankName || "",
    bankAccount: bankAccount || "",
    bankAccountName: bankAccountName || "",
    qrCodeUrl: qrCodeUrl
  };

  writeDb(db);
  res.json({ success: true, message: "บันทึกข้อมูลบัญชีธนาคารและ QR Code เรียบร้อยแล้วค่ะ", bankSettings: db.bankSettings });
});

// GET FIREBASE CLIENT CONFIG FOR REAL-TIME SYNC
app.get('/api/firebase-config', (req, res) => {
  let fileConfig: any = {};
  try {
    const firebaseConfigPath = path.join(appDir, 'firebase-applet-config.json');
    if (fs.existsSync(firebaseConfigPath)) {
      fileConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    }
  } catch (e) {
    console.error("⚠️ Failed to parse firebase-applet-config.json in API", e);
  }

  // Build config with priority: process.env (App Hosting environment) > firebase-applet-config.json (AI Studio environment)
  const config = {
    apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || fileConfig.apiKey || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || fileConfig.authDomain || "",
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || fileConfig.projectId || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || fileConfig.storageBucket || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId || "",
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || fileConfig.appId || "",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || fileConfig.measurementId || "",
    firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || process.env.VITE_FIRESTORE_DATABASE_ID || fileConfig.firestoreDatabaseId || "",
    oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || process.env.VITE_FIREBASE_OAUTH_CLIENT_ID || fileConfig.oAuthClientId || ""
  };

  if (config.projectId && config.apiKey) {
    res.json({ success: true, config, isFirestoreQuotaExceeded });
  } else {
    res.status(404).json({ success: false, message: 'Firebase configuration not found. Please set environment variables or config files.' });
  }
});

// Endpoint for client to report Firestore quota exceeded
app.post('/api/report-quota-exceeded', (req, res) => {
  isFirestoreQuotaExceeded = true;
  console.warn("⚠️ [Server] Client reported Firestore quota exceeded. Setting isFirestoreQuotaExceeded to true.");
  res.json({ success: true });
});

// UNIFIED SYNC STATE API (Fallback when Firestore Quota is exceeded or fails)
app.get('/api/sync-state', (req, res) => {
  try {
    const db = readDb();
    res.json({
      success: true,
      isSandboxActive: isSandboxActive,
      isFirestoreQuotaExceeded: isFirestoreQuotaExceeded,
      data: {
        members: db.members || [],
        products: db.products || [],
        sellerProducts: db.sellerProducts || [],
        orders: db.orders || [],
        transactions: db.transactions || [],
        planB_Tree: db.planB_Tree || {},
        csrFund: db.csrFund || { balance: 0, history: [] },
        systemStats: db.systemStats || { totalPlanBReserves: 0, totalTaxReserves: 0, totalCompanyProfits: 0 },
        packageProductChoices: db.packageProductChoices || [],
        bankSettings: db.bankSettings || null
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET SANDBOX STATE
app.get('/api/admin/sandbox-status', (req, res) => {
  res.json({
    success: true,
    isSandboxActive: isSandboxActive
  });
});

// TOGGLE SANDBOX STATE
app.post('/api/admin/sandbox-toggle', async (req, res) => {
  const { active, resetFromProduction } = req.body;
  
  try {
    const oldState = isSandboxActive;
    isSandboxActive = !!active;
    
    // Save to status file
    fs.writeFileSync(SANDBOX_STATE_FILE, JSON.stringify({ active: isSandboxActive }, null, 2), 'utf8');
    
    if (isSandboxActive) {
      if (resetFromProduction || !fs.existsSync(DB_FILE_SANDBOX)) {
        console.log("🔄 Resetting sandbox from production snapshot...");
        // Read production file directly
        let prodData: any = null;
        if (fs.existsSync(DB_FILE)) {
          prodData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
        
        if (prodData) {
          cacheDb = JSON.parse(JSON.stringify(prodData));
          fs.writeFileSync(DB_FILE_SANDBOX, JSON.stringify(cacheDb, null, 2), 'utf8');
          await saveDbToFirestore(cacheDb);
          console.log("✅ Sandbox database overwritten with production snapshot.");
        } else {
          // Initialize fresh sandbox database
          cacheDb = null;
          await loadDbFromFirestore();
        }
      } else {
        // Just switch cache to sandbox database by loading it
        cacheDb = null;
        await loadDbFromFirestore();
      }
    } else {
      // Switched off: reload production database
      cacheDb = null;
      await loadDbFromFirestore();
    }
    
    res.json({
      success: true,
      isSandboxActive: isSandboxActive,
      message: isSandboxActive 
        ? "เปิดใช้งานโหมดทดสอบระบบเรียบร้อยแล้วค่ะ (ข้อมูลจำลองถูกเตรียมพร้อมแล้ว)" 
        : "สลับกลับสู่โหมดข้อมูลจริง (Production Mode) เรียบร้อยแล้วค่ะ"
    });
  } catch (err: any) {
    console.error("Error toggling sandbox state:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะโหมดทดสอบ: " + err.message });
  }
});

// GET ALL MEMBERS FOR ADMIN MANAGEMENT
app.get('/api/admin/members', (req, res) => {
  const db = readDb();
  const members = db.members || [];
  const transactions = db.transactions || [];
  
  const enrichedMembers = members.map((member: any) => {
    // Sum of approved transaction amounts where currency is E-Money or E-Cash and type is Bonus or EShare
    const totalEarnings = transactions
      .filter((t: any) => t.userId === member.userId && (!t.status || t.status === "Approved") && (t.currency === "E-Money" || t.currency === "E-Cash") && (t.type === "Bonus" || t.type === "EShare"))
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      
    // Sum of all approved transactions where currency is E-Coupon and amount is positive (accumulated coupons)
    const totalCouponsEarned = transactions
      .filter((t: any) => t.userId === member.userId && (!t.status || t.status === "Approved") && t.currency === "E-Coupon" && (t.amount || 0) > 0)
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    return {
      ...member,
      totalEarnings: parseFloat(totalEarnings.toFixed(4)),
      totalCouponsEarned: parseFloat(totalCouponsEarned.toFixed(4))
    };
  });
  
  res.json({ success: true, members: enrichedMembers });
});

app.post('/api/admin/rebuild-binary-tree', (req, res) => {
  const { managerId } = req.body;
  const db = readDb();
  
  const manager = db.members.find(m => m.userId === managerId);
  console.log("Checking manager auth:", { managerId, managerFound: !!manager, role: manager?.role });
  if (!manager || (manager.role !== 'Manager' && manager.role !== 'Admin')) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  // 1. Reset all binary placements first, but preserve the root
  db.members.forEach(m => {
    if (m.userId !== "A260600001") { // Don't reset root
      m.parentId = "";
      m.side = "";
    }
  });
  
  // 2. Get all members and sort them by createdAt (Plan A members)
  const allMembers = db.members.filter(m => m.userId !== "A260600001").sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  // 3. Place them one by one
  allMembers.forEach(m => {
    if (m.rank && m.rank !== "Member") {
      const slot = findAndPlaceBinaryMember(db, m.sponsorId);
      m.parentId = slot.parentId;
      m.side = slot.side;
    } else {
      m.parentId = "";
      m.side = "";
    }
  });
  
  writeDb(db);
  res.json({ success: true, message: "จัดเรียงและซ่อมแซมผังสายงานโครงสร้างแผน A (Binary Tree) และซิงค์ลง Cloud Firestore เรียบร้อยแล้วค่ะ! สมาชิก S ขึ้นไปทั้งหมดเข้าผังอย่างสมบูรณ์แล้ว ✨" });
});

// Temporary endpoint to move a member
app.post('/api/admin/move-member', (req, res) => {
  const { userId, newParentId, newSide } = req.body;
  const db = readDb();
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
  
  member.parentId = newParentId;
  member.side = newSide;
  
  writeDb(db);
  res.json({ success: true, message: 'Member moved' });
});

app.delete('/api/admin/delete-member/:userId', (req, res) => {
  const { userId } = req.params;
  const { managerId } = req.body;
  
  const db = readDb();
  const manager = db.members.find(m => m.userId === managerId);
  console.log("Checking manager auth for delete:", { managerId, managerFound: !!manager, role: manager?.role });
  if (!manager || manager.role !== 'Manager') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  // Remove the member
  const memberIndex = db.members.findIndex(m => m.userId === userId);
  if (memberIndex === -1) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }

  // Prevent deleting the root
  if (userId === "A260600001") {
      return res.status(400).json({ success: false, message: 'Cannot delete root member' });
  }

  // Remove the member
  db.members.splice(memberIndex, 1);
  
  writeDb(db);
  res.json({ success: true, message: 'Member deleted' });
});

// UPDATE MEMBER INFO FROM ADMIN CONSOLE
app.post('/api/admin/member-update', (req, res) => {
  const { 
    userId, name, surname, phone, email, idCard, 
    bankName, bankAccount, bankAccountName, password, pin, 
    rank, role, balanceECash, balanceEMoney, balanceECoupon, sellerStatus, eligibleRights,
    sponsorId,
    username,
    editorUserId
  } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: "กรุณาระบุรหัสสมาชิก (userId)" });
  }

  const db = readDb();
  
  // Verify Editor is indeed Admin or Manager
  const editor = db.members.find(m => m.userId === editorUserId);
  if (!editor || (editor.role !== 'Admin' && editor.role !== 'Manager')) {
    return res.status(403).json({ success: false, message: "ปฏิเสธการเข้าถึง: เฉพาะบัญชีสิทธิ์ Manager หรือ Admin เท่านั้นที่มีสิทธิ์แก้ไขข้อมูลสมาชิกได้ค่ะ" });
  }

  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกที่ต้องการแก้ไข" });
  }

  // Validate username if changed
  if (username !== undefined && username.toLowerCase().trim() !== member.username.toLowerCase()) {
    const uClean = username.toLowerCase().trim();
    if (uClean.length < 4) {
      return res.status(400).json({ success: false, message: "ชื่อผู้ใช้ (Username) ต้องมีความยาวอย่างน้อย 4 ตัวอักษรค่ะ" });
    }
    const existing = db.members.find(m => m.username.toLowerCase() === uClean && m.userId !== userId);
    if (existing) {
      return res.status(400).json({ success: false, message: `ชื่อผู้ใช้ "${uClean}" นี้ถูกใช้งานไปแล้วโดยสมาชิกท่านอื่นในระบบ` });
    }
    member.username = uClean;
  }

  // Validate sponsorId existence if updated
  if (sponsorId !== undefined && sponsorId !== "" && sponsorId !== "SYSTEM" && sponsorId !== member.sponsorId) {
    const sponsorExists = db.members.some(m => m.userId === sponsorId);
    if (!sponsorExists) {
      return res.status(400).json({ success: false, message: `ไม่พบรหัสผู้แนะนำ "${sponsorId}" ในระบบ กรุณาตรวจสอบให้ถูกต้องค่ะ` });
    }
  }

  // 1. nateeplus must always be Manager & rank XXL & sellerStatus Active (Locked Permanently)
  if (member.username === "nateeplus" || member.userId === "A260600001") {
    if (role !== undefined && role !== "Manager") {
      return res.status(403).json({ success: false, message: "ไม่สามารถเปลี่ยนบทบาทของบัญชีผู้จัดตั้ง nateeplus ได้ค่ะ บัญชีนี้จะต้องมีสิทธิ์ระบบเป็น Manager ถาวรเท่านั้นค่ะ" });
    }
    if (rank !== undefined && rank !== "XXL") {
      return res.status(403).json({ success: false, message: "ไม่สามารถปรับลดตำแหน่งทางธุรกิจของบัญชีผู้จัดตั้ง nateeplus ได้ค่ะ บัญชีนี้จะต้องเป็นตำแหน่ง XXL ถาวรเท่านั้นเพื่อความปลอดภัยสูงสุด" });
    }
    if (sellerStatus !== undefined && sellerStatus !== "Active") {
      return res.status(403).json({ success: false, message: "ไม่สามารถปิดสถานะร้านค้าของบัญชีผู้จัดตั้ง nateeplus ได้ค่ะ สถานะร้านค้าต้องเป็น เปิดร้านแล้ว (Active) ถาวรเท่านั้นค่ะ" });
    }
  }

  // 2. Validate role changes hierarchy: Manager can appoint Manager/Admin, but Admin cannot appoint Manager
  if (role !== undefined && role !== member.role) {
    const editor = db.members.find(m => m.userId === editorUserId);
    const editorRole = editor ? editor.role : "Member";

    if (role === "Manager" && editorRole !== "Manager") {
      return res.status(403).json({ 
        success: false, 
        message: "สิทธิ์การแต่งตั้งตำแหน่งผู้บริหารสูงสุด (Manager) ถูกสงวนไว้สำหรับสิทธิ์ Manager เท่านั้นค่ะ เจ้าหน้าที่ Admin ไม่สามารถแต่งตั้งเองได้ค่ะ" 
      });
    }
    
    if (member.role === "Manager" && editorRole !== "Manager") {
      return res.status(403).json({
        success: false,
        message: "สิทธิ์การเปลี่ยนแปลงหรือถอดถอนผู้บริหารสูงสุด (Manager) ถูกสงวนไว้สำหรับสิทธิ์ Manager เท่านั้นค่ะ"
      });
    }
  }

  // Validate PIN if it's being updated
  if (pin !== undefined && pin !== "") {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ success: false, message: "รหัส PIN ต้องไม่ต่ำกว่า และ ไม่เกิน 6 หลัก และต้องเป็นตัวเลขเท่านัั้น" });
    }
    member.pin = pin;
  }

  // Update fields if provided
  if (name !== undefined) member.name = name;
  if (surname !== undefined) member.surname = surname;
  if (phone !== undefined) member.phone = phone;
  if (email !== undefined) member.email = email;
  if (idCard !== undefined) member.idCard = idCard;
  if (bankName !== undefined) member.bankName = bankName;
  if (bankAccount !== undefined) member.bankAccount = bankAccount;
  if (bankAccountName !== undefined) member.bankAccountName = bankAccountName;
  if (password !== undefined && password !== "") member.password = password;
  if (sponsorId !== undefined) member.sponsorId = sponsorId;
  if (rank !== undefined) {
    member.rank = rank;
    if (rank !== "Member" && (!member.parentId || member.parentId === "")) {
      const binaryPlacement = findAndPlaceBinaryMember(db, member.sponsorId || "A260600001");
      member.parentId = binaryPlacement.parentId;
      member.side = binaryPlacement.side;
    }
  }
  if (role !== undefined) member.role = role;
  if (balanceECash !== undefined) {
    const prev = Number(member.balanceECash || 0);
    const curr = Number(balanceECash);
    if (prev !== curr) {
      member.balanceECash = curr;
      db.transactions.push({
        id: "ADJ_CASH_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userId: member.userId,
        type: curr > prev ? "Deposit" : "Withdraw",
        amount: Math.abs(curr - prev),
        currency: "E-Cash",
        details: `ผู้ดูแลระบบปรับปรุงยอด E-Cash (จาก ฿${prev.toFixed(2)} เป็น ฿${curr.toFixed(2)})`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }
  }
  if (balanceEMoney !== undefined) {
    const prev = Number(member.balanceEMoney || 0);
    const curr = Number(balanceEMoney);
    if (prev !== curr) {
      member.balanceEMoney = curr;
      db.transactions.push({
        id: "ADJ_MNY_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userId: member.userId,
        type: curr > prev ? "Deposit" : "Withdraw",
        amount: Math.abs(curr - prev),
        currency: "E-Money",
        details: `ผู้ดูแลระบบปรับปรุงยอด E-Money (จาก ฿${prev.toFixed(2)} เป็น ฿${curr.toFixed(2)})`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }
  }
  if (balanceECoupon !== undefined) {
    const prev = Number(member.balanceECoupon || 0);
    const curr = Number(balanceECoupon);
    if (prev !== curr) {
      member.balanceECoupon = curr;
      db.transactions.push({
        id: "ADJ_COUP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userId: member.userId,
        type: curr > prev ? "Deposit" : "Withdraw",
        amount: Math.abs(curr - prev),
        currency: "E-Coupon",
        details: `ผู้ดูแลระบบปรับปรุงยอด E-Coupon (จาก ฿${prev.toFixed(2)} เป็น ฿${curr.toFixed(2)})`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }
  }
  if (sellerStatus !== undefined) member.sellerStatus = sellerStatus;
  if (eligibleRights !== undefined) member.eligibleRights = Number(eligibleRights);

  writeDb(db);
  res.json({ success: true, message: `แก้ไขข้อมูลสมาชิก ${member.username} สำเร็จเรียบร้อยแล้ว` });
});

// SYSTEM WIPE AND CLEAN SLATE RESET (Production Ready)
app.post('/api/admin/system-reset', (req, res) => {
  const db = readDb();
  
  // 1. Clear all members except the core nateeplus root account
  const allowedUserIds = ["A260600001"]; // nateeplus only
  
  // Filter members to keep only nateeplus
  db.members = (db.members || []).filter((m: any) => allowedUserIds.includes(m.userId));
  
  // If somehow nateeplus is missing, re-initialize it
  if (db.members.length === 0) {
    db.members = [
      {
        userId: "A260600001",
        username: "nateeplus",
        password: "@Tt12345678",
        pin: "123456",
        name: "บริษัท นที พลัส",
        surname: "จำกัด",
        phone: "0635161734",
        idCard: "1233445566778",
        email: "nateeplus@gmail.com",
        bankName: "",
        bankAccount: "",
        bankAccountName: "บริษัท นที พลัส จำกัด",
        sponsorId: "SYSTEM",
        parentId: "SYSTEM",
        side: "Left",
        rank: "XXL",
        statusKyc: "Active",
        kycImgUrl: "",
        kycBookUrl: "",
        kycBeneficiary: "",
        kycRelation: "",
        balanceECash: 15000.00,
        balanceECoupon: 5000.00,
        balanceEShare: 0.00,
        eligibleRights: 999999999,
        firstLogin: false,
        passwordReset: false,
        createdAt: "2026-07-08T13:44:08.918Z",
        role: "Manager",
        sellerStatus: "Active",
        sellerCode: "A260001",
        sellerRating: 100.00,
        sellerProducts: 0,
        planBPoints: 0
      }
    ];
  } else {
    // Reset nateeplus account to clean state
    db.members.forEach((member: any) => {
      if (member.userId === "A260600001" || member.username === "nateeplus") {
        member.userId = "A260600001";
        member.username = "nateeplus";
        member.password = "@Tt12345678";
        member.pin = "123456";
        member.name = "บริษัท นที พลัส";
        member.surname = "จำกัด";
        member.phone = "0635161734";
        member.idCard = "1233445566778";
        member.email = "nateeplus@gmail.com";
        member.bankName = "";
        member.bankAccount = "";
        member.bankAccountName = "บริษัท นที พลัส จำกัด";
        member.sponsorId = "SYSTEM";
        member.parentId = "SYSTEM";
        member.side = "Left";
        member.rank = "XXL";
        member.statusKyc = "Active";
        member.kycImgUrl = "";
        member.kycBookUrl = "";
        member.kycBeneficiary = "";
        member.kycRelation = "";
        member.balanceECash = 15000.00;
        member.balanceECoupon = 5000.00;
        member.balanceEShare = 0.00;
        member.eligibleRights = 999999999;
        member.firstLogin = false;
        member.passwordReset = false;
        member.createdAt = "2026-07-08T13:44:08.918Z";
        member.role = "Manager";
        member.sellerStatus = "Active";
        member.sellerCode = "A260001";
        member.sellerRating = 100.00;
        member.sellerProducts = 0;
        member.planBPoints = 0;
      }
    });
  }

  // 2. Clear all transaction logs
  db.transactions = [];

  // 3. Clear all orders
  db.orders = [];

  // 4. Clear seller product catalog uploads (keep standard/admin packages)
  db.sellerProducts = [];

  // 5. Clear MLM trees
  db.planB_Tree = {
    b1: [],
    b2: [],
    b3: [],
    b4: [],
    b5: [],
    b6: [],
    b7: [],
    b8: [],
    b9: [],
    b10: [],
    b11: [],
    b12: [],
    b13: [],
    b14: [],
    b15: []
  };

  // 6. Clear CSR balances and donation histories
  db.csrFund = {
    balance: 0.00,
    history: []
  };

  // 7. Clear pending coupon PV accumulation queue
  db.pendingCouponPV = [];

  // 8. Reset financial statistics ledger
  db.systemStats = {
    totalPlanBReserves: 0.00,
    totalTaxReserves: 0.00,
    totalCompanyProfits: 0.00
  };

  // 9. Clear verification codes OTP
  db.otps = {};

  writeDb(db);

  res.json({
    success: true,
    message: "ระบบ NaTee Plus ได้รับการรีเซ็ตเป็นค่าเริ่มต้นเรียบร้อยแล้วค่ะ สมาชิกจำลองและประวัติธุรกรรมทั้งหมดถูกลบ สแตนด์บายพร้อมรับสมาชิกลงทะเบียนและรับเงินจริงได้ทันที!"
  });
});

// FORCE RE-SYNC FROM FIRESTORE (FOR INSTANCE SYNC IN CLOUD RUN MULTI-INSTANCE ENV)
app.post('/api/admin/sync-firestore', async (req, res) => {
  try {
    await loadDbFromFirestore();
    res.json({
      success: true,
      message: "ซิงค์ข้อมูลเมมโมรี่ของเซิร์ฟเวอร์กับ Cloud Firestore ล่าสุดสำเร็จแล้วค่ะ! ข้อมูลทุกอย่างเป็นปัจจุบันเรียบร้อยแล้ว ✨"
    });
  } catch (error: any) {
    console.error("Error manual sync Firestore:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถซิงค์ข้อมูลกับ Firestore ได้: " + error.message
    });
  }
});

// STATIC PORT SERVING IN PRODUCTION / DEVELOPMENT VITE MIDDLEWARE
const PORT = process.env.PORT || 3000;

function ensurePizzaoneUser() {
  // Completely disabled to allow clean system-reset states with ONLY the core nateeplus root account.
  console.log("🤫 Auto-insertion of 'pizzaone' is now disabled to support a pristine system-reset state.");
  return;
}

async function startServer() {
  console.log("🚀 Booting NaTee Plus Full-Stack Server...");
  await loadDbFromFirestore();
  readDb(); // Ensure any missing sections like packageProductChoices or bankSettings are seeded and written to Firestore immediately!
  ensurePizzaoneUser();

  if (process.env.NODE_ENV !== 'production') {
    console.log("📦 Initializing Vite Development Middleware...");
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log("📁 Serving production build files from dist...");
    
    // Resolve distPath robustly to handle various execution environments (Firebase App Hosting, Cloud Run)
    let distPath = path.join(appDir, 'dist');
    if (typeof __dirname !== 'undefined') {
      const dirHtml = path.join(__dirname, 'index.html');
      if (fs.existsSync(dirHtml)) {
        distPath = __dirname;
      } else if (fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
        distPath = path.join(__dirname, 'dist');
      }
    } else {
      const cwdHtml = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(cwdHtml)) {
        distPath = process.cwd();
      }
    }
    
    console.log(`📁 Resolved dist path for static serving: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NaTee Plus full-stack server is listening on port ${PORT}`);
  });
}

startServer();
