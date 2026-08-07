import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, memoryLocalCache } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const dbFirestore = initializeFirestore(app, {
  localCache: memoryLocalCache()
}, firebaseConfig.firestoreDatabaseId);

const TARGET_USER_ID = 'A260700015';

function resetDatabaseInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping.`);
    return null;
  }
  
  console.log(`Processing file: ${filePath}`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const db = JSON.parse(raw);
  
  // 1. Reset members list
  if (Array.isArray(db.members)) {
    const userToReset = db.members.find(m => m.userId === TARGET_USER_ID || m.username === 'anantsin');
    if (userToReset) {
      console.log(`Found member ${TARGET_USER_ID} in ${filePath}. Resetting values...`);
      userToReset.rank = "Member";
      userToReset.balanceECash = 100.26;
      userToReset.balanceEMoney = 0;
      userToReset.balanceECoupon = 0;
      userToReset.balanceEShare = 0;
      userToReset.eligibleRights = 0;
      userToReset.planBPoints = 0;
      userToReset.parentId = "";
      userToReset.side = "";
      userToReset.selectedPackageId = "";
      userToReset.selectedPackageItems = [];
      userToReset.totalEarnings = 0;
      userToReset.totalEMoneyEarnedSoFar = 0;
      userToReset.totalCouponsEarned = 0;
      userToReset.lastUpdated = Date.now();
    } else {
      console.log(`Member ${TARGET_USER_ID} not found in ${filePath}.`);
    }
  }

  // 2. Filter transactions (Keep only their deposit of 100.26 and related system credit, remove any other)
  if (Array.isArray(db.transactions)) {
    const originalLength = db.transactions.length;
    db.transactions = db.transactions.filter(tx => {
      if (tx.userId !== TARGET_USER_ID) return true;
      // Keep only their specific deposit request DEP_N80M3M5OF and approval DEP_APR_671BYU47D
      const isApprovedDeposit = tx.id === 'DEP_N80M3M5OF' || tx.id === 'DEP_APR_671BYU47D';
      if (isApprovedDeposit) {
        console.log(`Keeping approved deposit transaction ${tx.id} for user ${TARGET_USER_ID}.`);
        return true;
      }
      console.log(`Filtering out transaction ${tx.id} for user ${TARGET_USER_ID}.`);
      return false;
    });
    console.log(`Filtered transactions in ${filePath}: ${originalLength} -> ${db.transactions.length}`);
  }

  // 3. Filter orders (Remove all orders for this user)
  if (Array.isArray(db.orders)) {
    const originalOrdersLength = db.orders.length;
    db.orders = db.orders.filter(order => {
      if (order.userId === TARGET_USER_ID) {
        console.log(`Filtering out order ${order.id} for user ${TARGET_USER_ID}.`);
        return false;
      }
      return true;
    });
    console.log(`Filtered orders in ${filePath}: ${originalOrdersLength} -> ${db.orders.length}`);
  }

  fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Successfully saved updated ${filePath} to disk.`);
  return db;
}

async function syncToFirestore(dbData, collectionName) {
  if (!dbData) return;
  console.log(`Syncing database segments to Firestore under collection: ${collectionName}`);
  
  const keys = ['members', 'transactions', 'orders'];
  for (const key of keys) {
    const docRef = doc(dbFirestore, collectionName, key);
    console.log(`Uploading segment '${key}' to doc: ${collectionName}/${key}...`);
    await setDoc(docRef, { data: dbData[key] });
  }
  console.log(`Finished Firestore sync for: ${collectionName}`);
}

async function run() {
  try {
    // Reset Production db
    const prodDb = resetDatabaseInFile('db.json');
    if (prodDb) {
      await syncToFirestore(prodDb, 'app_sections');
    }

    // Reset Sandbox db
    const sandboxDb = resetDatabaseInFile('db_sandbox.json');
    if (sandboxDb) {
      await syncToFirestore(sandboxDb, 'app_sections_sandbox');
    }
    
    console.log("🌟 RESET COMPLETED SUCCESSFULLY ON DISK AND FIRESTORE!");
  } catch (e) {
    console.error("Error running reset script:", e);
  }
}

run();
