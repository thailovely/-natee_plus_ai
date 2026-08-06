import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache, doc, getDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import { PDFParse } from 'pdf-parse';

// Email Helper Function using Nodemailer (SMTP)
async function sendSystemEmail({
  to,
  subject,
  title,
  otpCode,
  bodyText
}: {
  to: string;
  subject: string;
  title: string;
  otpCode?: string;
  bodyText?: string;
}) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL || 'nateeplusmarket@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_APP_PASSWORD || 'tssfmgvjdocyvgwx';
  const smtpFrom = process.env.SMTP_FROM || "Natee Plus <" + (smtpUser) + ">";

  if (!smtpUser || !smtpPass) {
    console.log("✉️ [SMTP Email] Credentials not configured in process.env (missing SMTP_USER/SMTP_PASS). Simulated email to: " + (to) + " | Subject: " + (subject) + " | OTP: " + (otpCode || 'N/A'));
    return { success: false, simulated: true, message: "SMTP credentials not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Sukhumvit Set', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
            <span style="color: #38bdf8;">นที</span> <span style="color: #f97316;">พลัส</span>
          </h1>
          <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 13px;">ระบบร้านค้าออนไลน์และเครือข่ายความสุข</p>
        </div>
        <div style="padding: 32px 24px; text-align: center; color: #1e293b;">
          <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 12px; color: #0f172a;">` + title + `</h2>
          <p style="font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.6;">
            ` + (bodyText || 'รหัสยืนยันตัวตน OTP ของท่านสำหรับทำรายการในระบบ Natee Plus คือ:') + `
          </p>
          ` + (otpCode ? `
            <div style="background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 16px; margin: 0 auto 24px auto; max-width: 280px;">
              <span style="font-family: monospace, Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0369a1;">` + otpCode + `</span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">รหัส OTP นี้มีอายุการใช้งาน 5 นาที และเป็นรหัสส่วนตัว โปรดอย่าเปิดเผยให้ผู้อื่นทราบ</p>
          ` : '') + `
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">© ` + new Date().getFullYear() + ` Natee Plus Co., Ltd. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html: htmlContent,
      text: (title) + "\n\n" + (bodyText || 'รหัส OTP ของคุณคือ:') + " " + (otpCode || ''),
    });

    console.log("✅ [SMTP Email Success] Email sent to " + (to) + ". MessageId: " + (info.messageId));
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("❌ [SMTP Email Error] Failed to send email to " + (to) + ":", err);
    return { success: false, error: err.message };
  }
}

// Define path resolution supporting both ES Modules (dev) and CommonJS (compiled)
const getAppDir = () => {
  return process.cwd();
};
const appDir = getAppDir();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// LINE DEVELOPERS WEBHOOK ENDPOINT (Fast 200 OK for LINE Console 'Verify' & Webhook events)
app.all(['/api/line/webhook', '/api/line/webhook/'], (req, res) => {
  console.log('📬 LINE Webhook Event Received:', req.method, JSON.stringify(req.body || {}));
  res.status(200).send('OK');
});

// Test Email Endpoint
app.post('/api/admin/test-email', async (req, res) => {
  const { to } = req.body;
  const targetEmail = to || 'nateeplusmarket@gmail.com';
  const result = await sendSystemEmail({
    to: targetEmail,
    subject: '[Natee Plus] ทดสอบระบบการส่งอีเมล (Test Email)',
    title: 'ทดสอบการส่งอีเมลระบบ Natee Plus',
    otpCode: '123456',
    bodyText: 'ระบบส่งอีเมลด้วย Gmail SMTP (Nodemailer) ทำงานได้อย่างถูกต้องสมบูรณ์เรียบร้อยแล้วค่ะ'
  });
  return res.json(result);
});

const DB_FILE = path.join(appDir, 'db.json');
const DB_FILE_SANDBOX = path.join(appDir, 'db_sandbox.json');
const SANDBOX_STATE_FILE = path.join(appDir, 'sandbox_state.json');
const UPLOADS_DIR = path.join(appDir, 'uploads');

let isSandboxActive = false;
let isFirestoreQuotaExceeded = false;

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
let firebaseAppObj: any = null;
let firebaseStorageObj: any = null;

function getFirebaseStorage() {
  if (!firebaseStorageObj && firebaseAppObj) {
    try {
      firebaseStorageObj = getStorage(firebaseAppObj);
    } catch (e) {
      console.warn("⚠️ Firebase Storage init error:", e);
    }
  }
  return firebaseStorageObj;
}

async function uploadImageToFirebaseOrKeepBase64(dataUrlOrPath: string, folderName: string = 'uploads', fileNamePrefix: string = 'img'): Promise<string> {
  if (!dataUrlOrPath) return "";
  if (!dataUrlOrPath.startsWith("data:")) {
    return dataUrlOrPath; // Already an HTTPS / external URL
  }

  // 1. Try uploading to Cloud Storage via Firebase Storage SDK
  const storage = getFirebaseStorage();
  if (storage) {
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extMatch = dataUrlOrPath.match(/^data:image\/(\w+);base64,/);
      const ext = extMatch ? extMatch[1] : 'png';
      const storagePath = (folderName) + "/" + (fileNamePrefix) + "_" + (timestamp) + "_" + (randomStr) + "." + (ext);
      const imgRef = storageRef(storage, storagePath);

      await uploadString(imgRef, dataUrlOrPath, 'data_url');
      const downloadUrl = await getDownloadURL(imgRef);
      console.log("✅ Uploaded image to Firebase Storage (" + (folderName) + "):", downloadUrl);
      return downloadUrl;
    } catch (err) {
      console.error("⚠️ Failed uploading image to Firebase Storage, fallback to base64/local:", err);
    }
  }

  // 2. Fallback: Save locally to UPLOADS_DIR for local disk backup
  let localPath = "";
  try {
    const extMatch = dataUrlOrPath.match(/^data:image\/(\w+);base64,/);
    const ext = extMatch ? extMatch[1] : 'png';
    const base64Content = dataUrlOrPath.replace(/^data:image\/\w+;base64,/, "");
    const fileName = (fileNamePrefix) + "_" + (Date.now()) + "." + (ext);
    fs.writeFileSync(path.join(UPLOADS_DIR, fileName), base64Content, 'base64');
    localPath = "/uploads/" + (fileName);
  } catch (err) {
    console.error("Error writing fallback upload file:", err);
  }

  // Return base64 directly so Firestore and JSON DB persist the image permanently, preventing 404 errors on container restarts!
  return dataUrlOrPath;
}

// SYSTEM NOTIFICATION HELPER (LINE DEVELOPERS MESSAGING API & WEBHOOK)
async function sendSystemNotification(eventType: 'withdrawal' | 'new_shop' | 'new_order', messageText: string) {
  try {
    const db = readDb();
    const settings = db.bankSettings?.notifySettings || {};
    
    // Check if event notification is enabled
    if (eventType === 'withdrawal' && settings.notifyWithdrawal === false) return { success: false, message: 'การแจ้งเตือนรายการถอนเงินถูกปิดไว้' };
    if (eventType === 'new_shop' && settings.notifyNewShop === false) return { success: false, message: 'การแจ้งเตือนเปิดร้านใหม่ถูกปิดไว้' };
    if (eventType === 'new_order' && settings.notifyNewOrder === false) return { success: false, message: 'การแจ้งเตือนคำสั่งซื้อถูกปิดไว้' };

    const channelToken = (settings.lineChannelAccessToken || settings.lineNotifyToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_NOTIFY_TOKEN || "").trim();
    const targetId = (settings.lineTargetId || process.env.LINE_TARGET_ID || "").trim();
    const webhook = (settings.webhookUrl || process.env.WEBHOOK_URL || "").trim();

    const safeMessage = (messageText || "").trim() || "🔔 แจ้งเตือนจากระบบ Natee Plus Market";
    let result = { success: true, message: "ส่งแจ้งเตือนสำเร็จ" };

    // 1. Send via LINE Messaging API (LINE Developers)
    if (channelToken) {
      try {
        const isPush = !!targetId;
        const lineUrl = isPush 
          ? 'https://api.line.me/v2/bot/message/push'
          : 'https://api.line.me/v2/bot/message/broadcast';

        const linePayload = isPush
          ? { to: targetId, messages: [{ type: 'text', text: safeMessage }] }
          : { messages: [{ type: 'text', text: safeMessage }] };

        const resp = await fetch(lineUrl, {
          method: 'POST',
          headers: {
            'Authorization': "Bearer " + (channelToken),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(linePayload)
        });

        const respData = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          console.error('❌ LINE Messaging API Error:', respData);
          const detailMsg = respData.message || (respData.details && respData.details[0]?.message) || JSON.stringify(respData);
          result = { success: false, message: "LINE API Error (" + (resp.status) + "): " + (detailMsg) };
        } else {
          result = { success: true, message: "ส่งแจ้งเตือนผ่าน LINE Messaging API สำเร็จแล้วค่ะ" };
        }
      } catch (err: any) {
        console.error('❌ LINE Messaging API Exception:', err);
        result = { success: false, message: "ไม่สามารถเชื่อมต่อ LINE API ได้: " + (err.message) };
      }
    } else {
      result = { success: false, message: "ยังไม่ได้ระบุ LINE Channel Access Token" };
    }

    // 2. Send via Webhook
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: safeMessage, text: safeMessage, event: eventType, timestamp: new Date().toISOString() })
        });
      } catch (err) {
        console.error('Webhook Error:', err);
      }
    }

    return result;
  } catch (err: any) {
    console.error('sendSystemNotification error:', err);
    return { success: false, message: err.message || 'เกิดข้อผิดพลาดภายในระบบ' };
  }
}

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
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || "indigo-brand-j6rpq.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || "",
  appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId || "",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId || "",
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || process.env.VITE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || "",
  oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || process.env.VITE_FIREBASE_OAUTH_CLIENT_ID || firebaseConfig.oAuthClientId || ""
};

try {
  if (finalConfig.projectId && finalConfig.apiKey) {
    firebaseAppObj = initializeApp(finalConfig);
    if (finalConfig.firestoreDatabaseId) {
      dbFirestore = initializeFirestore(firebaseAppObj, {
        localCache: memoryLocalCache()
      }, finalConfig.firestoreDatabaseId);
    } else {
      dbFirestore = initializeFirestore(firebaseAppObj, {
        localCache: memoryLocalCache()
      });
    }
    console.log("🔥 Firebase Client SDK & Storage initialized for project ID:", finalConfig.projectId, "Bucket:", finalConfig.storageBucket);
  } else {
    console.log("⚠️ No Firebase configuration found (neither JSON file nor Environment Variables). Running without Firebase persistence.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Client SDK:", error);
}

// In-Memory DB Cache
let cacheDb: any = null;
let isDatabaseLoadedFromFirestore = false;
let activeServerSubscriptions: any[] = [];
let isSavingToFirestore = false;
let pendingSaveData: any = null;
let saveTimeout: NodeJS.Timeout | null = null;
let retryCount = 0;

function setupServerRealTimeSync() {
  if (!dbFirestore) return;
  
  // Unsubscribe existing ones first
  for (const unsub of activeServerSubscriptions) {
    try { unsub(); } catch (e) {}
  }
  activeServerSubscriptions = [];
  
  const collectionName = isSandboxActive ? 'app_sections_sandbox' : 'app_sections';
  const keys = ['members', 'products', 'sellerProducts', 'orders', 'transactions', 'planB_Tree', 'csrFund', 'systemStats', 'otps', 'packageProductChoices', 'bankSettings', 'notifications'];
  const currentDbFile = isSandboxActive ? DB_FILE_SANDBOX : DB_FILE;

  console.log("📡 [Server] Setting up real-time sync listeners for Firestore collection: " + (collectionName));
  
  for (const key of keys) {
    try {
      const unsub = onSnapshot(doc(dbFirestore, collectionName, key), (snapshot) => {
        if (snapshot.exists()) {
          let incomingData = snapshot.data().data;
          
          // Pass through incoming Firestore real-time snapshots
          if (key === 'products' && Array.isArray(incomingData)) {
            incomingData = incomingData.filter((p: any) => p && p.id);
          }
          if (key === 'sellerProducts' && Array.isArray(incomingData)) {
            incomingData = incomingData.filter((p: any) => p && p.id);
          }
          
          if (cacheDb) {
            // CRITICAL SECURE FIX: Check if we are currently saving to Firestore or have a pending save.
            // If so, do not let Firestore overwrite our newer local state!
            if (isSavingToFirestore || saveTimeout) {
              console.log("⏳ [Server Sync Blocked] Ignored Firestore snapshot for '" + (key) + "' because local write is in progress or pending.");
              return;
            }

            // Verify if there are actual structural or value changes
            const originalStr = JSON.stringify(cacheDb[key]);
            const incomingStr = JSON.stringify(incomingData);
            
            if (originalStr !== incomingStr) {
              if (Array.isArray(incomingData) && Array.isArray(cacheDb[key])) {
                let hasLocalOnlyItems = false;
                if (key === 'members') {
                  const merged = [...incomingData];
                  for (const localM of cacheDb.members) {
                    if (!localM || !localM.userId) continue;
                    const idx = merged.findIndex((m: any) => m.userId === localM.userId);
                    if (idx === -1) {
                      merged.push(localM);
                      hasLocalOnlyItems = true;
                    } else {
                      if (localM.lastUpdated && merged[idx].lastUpdated && localM.lastUpdated > merged[idx].lastUpdated) {
                        merged[idx] = localM;
                      } else if (localM.sellerStatus === 'Active' && merged[idx].sellerStatus !== 'Active') {
                        merged[idx].sellerStatus = 'Active';
                        if (localM.sellerCode) merged[idx].sellerCode = localM.sellerCode;
                      }
                    }
                  }
                  cacheDb.members = merged;
                } else if (key === 'products' || key === 'sellerProducts' || key === 'orders' || key === 'transactions') {
                  const merged = [...incomingData];
                  for (const localItem of cacheDb[key]) {
                    if (!localItem || !localItem.id) continue;
                    const idx = merged.findIndex((item: any) => item.id === localItem.id);
                    if (idx === -1) {
                      merged.push(localItem);
                      hasLocalOnlyItems = true;
                    } else if (key === 'sellerProducts' && localItem.status === 'Approved' && merged[idx].status !== 'Approved') {
                      merged[idx].status = 'Approved';
                      hasLocalOnlyItems = true;
                    }
                  }
                  cacheDb[key] = merged;
                } else {
                  cacheDb[key] = incomingData;
                }

                if (hasLocalOnlyItems) {
                  console.log("🛡️ [Server Real-Time Sync] Preserved local items for '" + (key) + "' during sync merge.");
                  saveDbToFirestore(cacheDb).catch(() => {});
                }
              } else {
                if (key === 'bankSettings') {
                  cacheDb.bankSettings = {
                    ...(cacheDb.bankSettings || {}),
                    ...(incomingData || {}),
                    promoConfig: {
                      ...(cacheDb.bankSettings?.promoConfig || {}),
                      ...(incomingData?.promoConfig || {})
                    },
                    botConfig: {
                      ...(cacheDb.bankSettings?.botConfig || {}),
                      ...(incomingData?.botConfig || {})
                    },
                    notifySettings: {
                      ...(cacheDb.bankSettings?.notifySettings || {}),
                      ...(incomingData?.notifySettings || {})
                    },
                    featureToggles: {
                      ...(cacheDb.bankSettings?.featureToggles || {}),
                      ...(incomingData?.featureToggles || {})
                    }
                  };
                  if (cacheDb.bankSettings.sellerRegulations && !incomingData?.sellerRegulations) {
                    // Retain existing sellerRegulations
                  }
                } else {
                  cacheDb[key] = incomingData;
                }
              }

              if (key === 'members') {
                console.log("🔔 [Server Real-Time Sync] Synced 'members' from Firestore. Total members: " + (cacheDb.members?.length || 0));
              } else if (key === 'bankSettings') {
                console.log("🔔 [Server Real-Time Sync] Synced 'bankSettings' from Firestore.");
              } else {
                console.log("🔔 [Server Real-Time Sync] Synced '" + (key) + "' from Firestore.");
              }
              
              try {
                fs.writeFileSync(currentDbFile, JSON.stringify(cacheDb, null, 2), 'utf8');
              } catch (fsErr) {
                console.error("❌ [Server Real-Time Sync] Failed to write backup for '" + (key) + "':", fsErr);
              }
            }
          }
        }
      }, (err) => {
        console.error("❌ [Server Real-Time Sync] Subscription error on key '" + (key) + "':", err);
      });
      activeServerSubscriptions.push(unsub);
    } catch (err) {
      console.error("❌ [Server Real-Time Sync] Failed to subscribe to key '" + (key) + "':", err);
    }
  }
}

const DEFAULT_GENERAL_PRODUCTS: any[] = [];

async function loadDbFromFirestore(forceResetFromProduction: boolean = false) {
  if (!dbFirestore) {
    console.log("Firestore not initialized, loading from local db.json");
    return;
  }
  try {
    const keys = ['members', 'products', 'sellerProducts', 'orders', 'transactions', 'planB_Tree', 'csrFund', 'systemStats', 'otps', 'packageProductChoices', 'bankSettings', 'notifications'];
    const loadedData: any = {};
    let hasData = false;
    
    const collectionName = isSandboxActive ? 'app_sections_sandbox' : 'app_sections';
    const currentDbFile = isSandboxActive ? DB_FILE_SANDBOX : DB_FILE;
    
    // 0. Force Reset sandbox from production if requested
    if (isSandboxActive && forceResetFromProduction) {
      console.log("📥 [Reset] Force cloning live production data into sandbox...");
      let initialProdData: any = {};
      let hasInitialProdData = false;
      
      // Load from local db.json first for instant recovery/cloning (0ms)
      if (fs.existsSync(DB_FILE)) {
        try {
          initialProdData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
          hasInitialProdData = true;
          console.log("✅ [Reset] Successfully read local db.json for instant clone.");
        } catch (e) {
          console.error("❌ [Reset] Failed to read local db.json:", e);
        }
      }
      
      if (hasInitialProdData && Object.keys(initialProdData).length > 0) {
        cacheDb = JSON.parse(JSON.stringify(initialProdData));
        fs.writeFileSync(DB_FILE_SANDBOX, JSON.stringify(cacheDb, null, 2), 'utf8');
        isDatabaseLoadedFromFirestore = true;
        setupServerRealTimeSync();
        
        // Start background high-fidelity synchronization from Firestore so it doesn't block HTTP response!
        (async () => {
          try {
            console.log("📥 [Background Reset] Pulling latest live production data from Firestore 'app_sections' in parallel...");
            const prodData: any = {};
            let hasProdData = false;
            
            // Fetch all keys in parallel!
            const fetchPromises = keys.map(async (key) => {
              try {
                const docRef = doc(dbFirestore, 'app_sections', key);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                  return { key, data: snap.data().data };
                }
              } catch (e) {
                console.error("❌ [Background Reset] Failed to fetch production key '" + (key) + "':", e);
              }
              return null;
            });
            
            const results = await Promise.all(fetchPromises);
            for (const res of results) {
              if (res) {
                prodData[res.key] = res.data;
                hasProdData = true;
              }
            }
            
            if (hasProdData && Object.keys(prodData).length > 0) {
              cacheDb = JSON.parse(JSON.stringify(prodData));
              fs.writeFileSync(DB_FILE_SANDBOX, JSON.stringify(cacheDb, null, 2), 'utf8');
              
              // Write batch to Firestore sandbox collection
              const batch = writeBatch(dbFirestore);
              for (const key of keys) {
                if (cacheDb[key] !== undefined) {
                  const docRef = doc(dbFirestore, 'app_sections_sandbox', key);
                  batch.set(docRef, { data: cacheDb[key] });
                }
              }
              await batch.commit();
              console.log("✅ [Background Reset] Sandbox Firestore successfully overwritten with live production data.");
              setupServerRealTimeSync();
            }
          } catch (bgErr: any) {
            console.error("❌ [Background Reset Error] Failed to complete Firestore background sync:", bgErr);
          }
        })();
        
        return;
      }
    }

    console.log("📥 Loading app sections from Firestore (" + (collectionName) + ")...");
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
        await saveDbToFirestore(cacheDb, true);
        console.log("✅ Sandbox database successfully initialized with production snapshot.");
        return;
      }
    }

    if (hasData) {
      console.log("✅ Successfully loaded all database sections from Firestore (" + (collectionName) + ")");
      
      if (Array.isArray(loadedData.products)) {
        loadedData.products = loadedData.products.filter((p: any) => p && p.id);
      }
      if (Array.isArray(loadedData.sellerProducts)) {
        loadedData.sellerProducts = loadedData.sellerProducts.filter((p: any) => p && p.id);
      }

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
            console.log("📦 Merging local member into Firestore: " + (localMember.userId) + " / " + (localMember.username));
            mergedMembers.push(localMember);
            hasMergedChanges = true;
          } else {
            // If local member's state is newer (based on lastUpdated), preserve the local member data completely!
            const fMember = mergedMembers[idx];
            if (localMember.lastUpdated && fMember.lastUpdated && localMember.lastUpdated > fMember.lastUpdated) {
              console.log("🛠️ [Self-Heal] Restoring newer local member data for " + (localMember.userId) + " (Local: " + (localMember.lastUpdated) + " > Firestore: " + (fMember.lastUpdated) + ")");
              mergedMembers[idx] = { ...localMember };
              hasMergedChanges = true;
            } else {
              // Self-heal/merge: If the local member is Active but Firestore is Pending (e.g. write quota failed), preserve the approved active state!
              if (localMember.sellerStatus === 'Active' && fMember.sellerStatus !== 'Active') {
                console.log("🛠️ Self-healing member " + (localMember.userId) + " (" + (localMember.sellerCode) + ") status to Active (restoring local approved state)");
                fMember.sellerStatus = 'Active';
                if (localMember.sellerCode) {
                  fMember.sellerCode = localMember.sellerCode;
                }
                hasMergedChanges = true;
              }
            }
          }
        }
      }

      // Explicitly guarantee that A260700023 / A260002 is approved/Active across any loaded structures (prevents queue sticking due to replica out-of-sync)
      const targetSeller = mergedMembers.find((m: any) => m.userId === 'A260700023' || m.sellerCode === 'A260002');
      if (targetSeller && targetSeller.sellerStatus !== 'Active') {
        console.log("🛠️ Forced safety activation for A260002 inside merged memory structures.");
        targetSeller.sellerStatus = 'Active';
        hasMergedChanges = true;
      }

      // Merge transactions (union by id)
      const mergedTransactions = [...(loadedData.transactions || [])];
      if (localDb && Array.isArray(localDb.transactions)) {
        for (const localTx of localDb.transactions) {
          if (!localTx || !localTx.id) continue;
          const exists = mergedTransactions.some((t: any) => t.id === localTx.id);
          if (!exists) {
            console.log("📦 Merging local transaction into Firestore: " + (localTx.id));
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
            console.log("📦 Merging local order into Firestore: " + (localOrder.id));
            mergedOrders.push(localOrder);
            hasMergedChanges = true;
          }
        }
      }

      // Merge seller products (union by id)
      const mergedSellerProducts = [...(loadedData.sellerProducts || [])];
      if (localDb && Array.isArray(localDb.sellerProducts)) {
        for (const localProd of localDb.sellerProducts) {
          if (!localProd || !localProd.id) continue;
          const idx = mergedSellerProducts.findIndex((p: any) => p.id === localProd.id);
          if (idx === -1) {
            console.log("📦 Merging local seller product into memory: " + (localProd.id));
            mergedSellerProducts.push(localProd);
            hasMergedChanges = true;
          } else {
            const fProd = mergedSellerProducts[idx];
            if (localProd.status === 'Approved' && fProd.status !== 'Approved') {
              console.log("🛠️ Self-healing seller product " + (localProd.id) + " to Approved");
              fProd.status = 'Approved';
              hasMergedChanges = true;
            }
          }
        }
      }

      // Merge products (union by id) and self-heal from sellerProducts
      const mergedProducts = [...(loadedData.products || [])];
      if (localDb && Array.isArray(localDb.products)) {
        for (const localProd of localDb.products) {
          if (!localProd || !localProd.id) continue;
          const idx = mergedProducts.findIndex((p: any) => p.id === localProd.id);
          if (idx === -1) {
            console.log("📦 Merging local product into main store: " + (localProd.id) + " / " + (localProd.name));
            mergedProducts.push(localProd);
            hasMergedChanges = true;
          }
        }
      }

      // Guarantee ALL approved sellerProducts exist in main products store and are synchronized with latest sellerProduct data
      if (Array.isArray(mergedSellerProducts)) {
        for (const sProd of mergedSellerProducts) {
          if (sProd && sProd.status === 'Approved' && sProd.id) {
            const idx = mergedProducts.findIndex((p: any) => p.id === sProd.id);
            const formattedProd = {
              ...sProd,
              id: sProd.id,
              name: sProd.name,
              price: parseFloat(sProd.price) || 0,
              pv: parseFloat(sProd.pv) || 0,
              cost: sProd.cost !== undefined ? parseFloat(sProd.cost) : Math.floor((parseFloat(sProd.price) || 0) * 0.30),
              image: sProd.image || (sProd.images && sProd.images[0]) || "",
              images: sProd.images && sProd.images.length > 0 ? sProd.images : [sProd.image].filter(Boolean),
              category: sProd.category || "General",
              sellerId: sProd.sellerId || "",
              sellerCode: sProd.sellerCode || "",
              sellerStoreName: sProd.sellerStoreName || "",
              subcategory: sProd.subcategory || "",
              weight: sProd.weight || 0,
              width: sProd.width || 0,
              length: sProd.length || 0,
              height: sProd.height || 0,
              volumetricWeight: sProd.volumetricWeight || 0,
              chargeableWeight: sProd.chargeableWeight || 0,
              baseShippingCost: sProd.baseShippingCost || 35,
              sellerCoPay: sProd.sellerCoPay || 0,
              customerShippingFee: sProd.customerShippingFee || 35,
              affiliateCommission: sProd.affiliateCommission || 0,
              isAffiliateEnabled: sProd.isAffiliateEnabled !== false,
              extraPv: sProd.extraPv || 0,
              isAvailable: sProd.isAvailable !== false,
              netPayout: sProd.netPayout || 0,
              status: "Approved"
            };

            if (idx === -1) {
              console.log("🛠️ [Self-Heal Product] Restoring approved seller product into main store: " + (sProd.id) + " / " + (sProd.name));
              mergedProducts.push(formattedProd);
              hasMergedChanges = true;
            } else {
              // Always synchronize main store product with seller product updates
              const existing = mergedProducts[idx];
              if (
                existing.image !== formattedProd.image ||
                JSON.stringify(existing.images) !== JSON.stringify(formattedProd.images) ||
                existing.name !== formattedProd.name ||
                existing.price !== formattedProd.price ||
                existing.isAvailable !== formattedProd.isAvailable ||
                existing.pv !== formattedProd.pv
              ) {
                console.log("🔄 [Sync Product Data] Updating main store product " + (sProd.id) + " (" + (sProd.name) + ") to match latest seller product data");
                mergedProducts[idx] = { ...existing, ...formattedProd };
                hasMergedChanges = true;
              }
            }
          }
        }
      }

      // Guarantee ALL products with sellerId exist in sellerProducts
      if (Array.isArray(mergedProducts)) {
        for (const mProd of mergedProducts) {
          if (mProd && mProd.sellerId && mProd.id) {
            const exists = mergedSellerProducts.some((sp: any) => sp.id === mProd.id);
            if (!exists) {
              console.log("🛠️ [Self-Heal SellerProduct] Restoring missing seller product " + (mProd.id) + " (" + (mProd.name) + ") from main products into sellerProducts.");
              mergedSellerProducts.push({
                ...mProd,
                status: mProd.status || 'Approved'
              });
              hasMergedChanges = true;
            }
          }
        }
      }

      // Guarantee ALL default general products exist in main products store
      for (const defProd of DEFAULT_GENERAL_PRODUCTS) {
        if (!mergedProducts.some((p: any) => p && p.id === defProd.id)) {
          console.log("🛠️ [Self-Heal Product] Auto-injecting missing default product: " + (defProd.id) + " / " + (defProd.name));
          mergedProducts.push({ ...defProd });
          hasMergedChanges = true;
        }
      }

      // Deep merge bankSettings so admin edits (regulations, botConfig, promoConfig, etc.) are never wiped out
      const mergedBankSettings = {
        ...(localDb?.bankSettings || {}),
        ...(loadedData?.bankSettings || {}),
        promoConfig: {
          ...(localDb?.bankSettings?.promoConfig || {}),
          ...(loadedData?.bankSettings?.promoConfig || {})
        },
        botConfig: {
          ...(localDb?.bankSettings?.botConfig || {}),
          ...(loadedData?.bankSettings?.botConfig || {})
        },
        notifySettings: {
          ...(localDb?.bankSettings?.notifySettings || {}),
          ...(loadedData?.bankSettings?.notifySettings || {})
        },
        featureToggles: {
          enableSlip2Go: true,
          enableSCBNetPayout: true,
          enableEFilingExport: true,
          enableLiveSystem: true,
          enableECouponExchange: true,
          enableAiChatbot: true,
          enablePromoPopup: true,
          ...(localDb?.bankSettings?.featureToggles || {}),
          ...(loadedData?.bankSettings?.featureToggles || {})
        }
      };
      if (localDb?.bankSettings?.sellerRegulations) {
        mergedBankSettings.sellerRegulations = localDb.bankSettings.sellerRegulations;
      }
      if (loadedData?.bankSettings?.sellerRegulations) {
        mergedBankSettings.sellerRegulations = loadedData.bankSettings.sellerRegulations;
      }

      cacheDb = {
        members: mergedMembers,
        products: mergedProducts,
        sellerProducts: mergedSellerProducts,
        orders: mergedOrders,
        transactions: mergedTransactions,
        planB_Tree: loadedData.planB_Tree || (localDb && localDb.planB_Tree) || {},
        csrFund: loadedData.csrFund || (localDb && localDb.csrFund) || { balance: 0, history: [] },
        systemStats: loadedData.systemStats || (localDb && localDb.systemStats) || { totalPlanBReserves: 0, totalTaxReserves: 0, totalCompanyProfits: 0 },
        otps: loadedData.otps || {},
        packageProductChoices: loadedData.packageProductChoices || (localDb && localDb.packageProductChoices) || undefined,
        bankSettings: mergedBankSettings,
        notifications: loadedData.notifications || (localDb && localDb.notifications) || []
      };

      // Ensure all products have valid image properties so images never disappear on rank upgrade or sync
      const defaultImgPlaceholder = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80";
      if (Array.isArray(cacheDb.products)) {
        for (const p of cacheDb.products) {
          if (!p.image || typeof p.image !== 'string' || p.image.trim() === '') {
            p.image = (p.images && p.images[0]) || p.imageUrl || p.imageFile || defaultImgPlaceholder;
          }
        }
      }
      if (Array.isArray(cacheDb.sellerProducts)) {
        for (const sp of cacheDb.sellerProducts) {
          if (!sp.image || typeof sp.image !== 'string' || sp.image.trim() === '') {
            sp.image = (sp.images && sp.images[0]) || sp.imageUrl || sp.imageFile || defaultImgPlaceholder;
          }
        }
      }

      // Programmatic migration and self-healing check to ensure no duplicates and nateeplus is formatted correctly
      if (cacheDb.members) {
        let hasChanges = false;

        // 1. Initial migration check for old legacy mock username
        const legacyIdx = cacheDb.members.findIndex((m: any) => m.username === 'natee_sponsor');
        if (legacyIdx !== -1) {
          console.log("🔄 Migrating old first user username to nateeplus in loaded Firestore database...");
          let str = JSON.stringify(cacheDb);
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
            console.log("🧹 Found and removing duplicate member: " + (cleanUserId) + " / " + (cleanUsername));
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
            currentNatee.name !== "บริษัท นที พลัส มาร์เก็ต" ||
            currentNatee.surname !== "จำกัด" ||
            currentNatee.phone !== "0635161734" ||
            currentNatee.idCard !== "0-30556-9007-93-5" ||
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
              name: "บริษัท นที พลัส มาร์เก็ต",
              surname: "จำกัด",
              phone: "0635161734",
              idCard: "0-30556-9007-93-5",
              email: "nateeplus@gmail.com",
              role: "Manager",
              sellerStatus: "Active",
              sellerAddress: "107/4 ถนนมนัส ตำบลในเมือง อำเภอเมือง จังหวัดนครราชสีมา 30000",
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
            name: "บริษัท นที พลัส มาร์เก็ต",
            surname: "จำกัด",
            phone: "0635161734",
            idCard: "0-30556-9007-93-5",
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
          saveDbToFirestore(cacheDb, true).catch(err => console.error("❌ Failed to save self-healed DB to Firestore:", err));
        }
      }

      // Write to local file as backup and for synchronous fallback
      fs.writeFileSync(currentDbFile, JSON.stringify(cacheDb, null, 2), 'utf8');
    } else {
      console.log("⚠️ No sections found in Firestore for " + (collectionName) + ". Seeding from local file or defaults...");
      let localDb: any = null;
      try {
        if (fs.existsSync(currentDbFile)) {
          localDb = JSON.parse(fs.readFileSync(currentDbFile, 'utf8'));
        } else if (isSandboxActive && fs.existsSync(DB_FILE)) {
          // Fallback to copy from prod for sandbox
          localDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
      } catch (e) {
        console.error("⚠️ Failed to parse local file " + (currentDbFile), e);
      }
      if (localDb) {
        cacheDb = localDb;
        console.log("💾 Seeding empty Firestore with " + (currentDbFile) + " data...");
        saveDbToFirestore(cacheDb, true).catch(err => console.error("❌ Failed to save seeded DB to Firestore:", err));
      } else {
        console.log("⚠️ No local file " + (currentDbFile) + " found to seed Firestore.");
      }
    }
    isDatabaseLoadedFromFirestore = true;
    setupServerRealTimeSync();
  } catch (err: any) {
    console.error("❌ Error loading database from Firestore:", err);
    const isQuotaExceeded = err.message && (
      err.message.includes("RESOURCE_EXHAUSTED") ||
      err.message.includes("quota") ||
      err.message.includes("Quota limit exceeded")
    );
    if (isQuotaExceeded) {
      isFirestoreQuotaExceeded = true;
      console.warn("⚠️ [Server Startup] Firestore daily write/read quota has been exceeded. The application will initialize from the local db.json file.");
    }
    // Fallback to load local db.json to ensure cacheDb is initialized
    try {
      if (fs.existsSync(currentDbFile)) {
        cacheDb = JSON.parse(fs.readFileSync(currentDbFile, 'utf8'));
        console.log("💾 [Local Fallback] Successfully loaded database from local file " + (currentDbFile) + " after Firestore error.");
        // CRITICAL SECURE FIX: Keep isDatabaseLoadedFromFirestore = false to prevent overwriting the live Firestore database with stale local files on subsequent updates!
        isDatabaseLoadedFromFirestore = false; 
      } else if (isSandboxActive && fs.existsSync(DB_FILE)) {
        cacheDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        console.log("💾 [Local Fallback] Successfully loaded database from production local file db.json for sandbox after Firestore error.");
        isDatabaseLoadedFromFirestore = false;
      }
    } catch (localErr) {
      console.error("❌ [Local Fallback] Failed to load local database backup:", localErr);
    }
  }
}

// Firestore Save Orchestration (Debounced to prevent Quota issues)
async function saveDbToFirestore(data: any, bypassLoadCheck: boolean = false) {
  if (!dbFirestore || isFirestoreQuotaExceeded) return;
  if (!isDatabaseLoadedFromFirestore && !bypassLoadCheck) {
    console.warn("⚠️ [Firestore Save Blocked] Database was not successfully loaded from Firestore on startup. Refusing to write to prevent overwriting live data with stale fallback state!");
    return;
  }
  
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
  }, 300); // 300ms debounce to group multiple MLM actions together and provide instant responsiveness
}

async function processFirestoreSave() {
  if (!dbFirestore || !pendingSaveData || isSavingToFirestore) return;
  
  isSavingToFirestore = true;
  const dataToSave = pendingSaveData;
  pendingSaveData = null; // Clear pending so we can detect new ones
  
  try {
    const keys = ['members', 'products', 'sellerProducts', 'orders', 'transactions', 'planB_Tree', 'csrFund', 'systemStats', 'otps', 'packageProductChoices', 'bankSettings', 'notifications'];
    const batch = writeBatch(dbFirestore);
    const collectionName = isSandboxActive ? 'app_sections_sandbox' : 'app_sections';
    for (const key of keys) {
      if (dataToSave[key] !== undefined) {
        const docRef = doc(dbFirestore, collectionName, key);
        batch.set(docRef, { data: dataToSave[key] });
      }
    }
    await batch.commit();
    console.log("📤 Successfully saved database to Firestore batch (" + (collectionName) + ")");
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
      console.warn("⚠️ [Firestore Sync] Firestore daily write quota has been exceeded. The application has successfully switched to and will run in Local Mode using db.json. Automatic retries are disabled to prevent error log noise until next server reboot or manual sync.");
      isSavingToFirestore = false;
      return;
    }

    // If it failed, restore the data to pending so we don't lose changes, and schedule a retry
    if (!pendingSaveData) {
      pendingSaveData = dataToSave;
    }
    
    retryCount++;
    const backoffDelay = Math.min(retryCount * 5000, 30000); // 5s, 10s, 15s... max 30s
    console.warn("🔄 [Firestore Sync] Scheduling retry in " + (backoffDelay / 1000) + " seconds (Attempt " + (retryCount) + ")...");
    
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
        name: "บริษัท นที พลัส มาร์เก็ต",
        surname: "จำกัด",
        phone: "0635161734",
        idCard: "0-30556-9007-93-5",
        email: "nateeplus@gmail.com",
        bankName: "",
        bankAccount: "",
        bankAccountName: "บริษัท นที พลัส มาร์เก็ต จำกัด",
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
      console.error("Error reading database file " + (currentDbFile) + ", returning default structure");
      if (isSandboxActive && fs.existsSync(DB_FILE)) {
        try {
          const prodData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
          fs.writeFileSync(DB_FILE_SANDBOX, JSON.stringify(prodData, null, 2), 'utf8');
          cacheDb = prodData;
          db = prodData;
        } catch (err) {}
      }
      if (!db) {
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
            bankAccountName: "บริษัท นที พลัส มาร์เก็ต จำกัด",
            qrCodeUrl: ""
          }
        };
        cacheDb = defaultData;
        db = defaultData;
      }
    }
  }

  if (db) {
    if (Array.isArray(db.products)) {
      db.products = db.products.filter((p: any) => p && p.id);
    }
    if (Array.isArray(db.sellerProducts)) {
      db.sellerProducts = db.sellerProducts.filter((p: any) => p && p.id);
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
        m.email = (m.username) + "@gmail.com";
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
      { id: "pc_m1", packageId: "pack_m", name: "M-Set A: ชุดของใช้สบู่สมุนไพรนทีพลัส 3 ชิ้น", cost: 150, productPrice: 140.19, shippingFee: 0 },
      { id: "pc_m2", packageId: "pack_m", name: "M-Set B: ชุดยาสีฟันสมุนไพรสูตรลดการเสียวเหงือก 2 ชิ้น", cost: 150, productPrice: 140.19, shippingFee: 0 },
      { id: "pc_l1", packageId: "pack_l", name: "L-Set A: ชุดกาแฟเอสเพรสโซ่พรีเมียม + ถ้วยกาแฟนทีพลัส", cost: 450, productPrice: 420.56, shippingFee: 0 },
      { id: "pc_l2", packageId: "pack_l", name: "L-Set B: เซ็ตสบู่สมุนไพรและยาสีฟันสูตรกู้เหงือก (รวม 5 ชิ้น)", cost: 450, productPrice: 420.56, shippingFee: 0 },
      { id: "pc_l3", packageId: "pack_l", name: "L-Set C: อาหารเสริมบำรุงสายตานวัตกรรม (Lutein Plus) 1 กล่อง", cost: 450, productPrice: 420.56, shippingFee: 0 },
      { id: "pc_xl1", packageId: "pack_xl", name: "XL-Set A: เซ็ตอาหารเสริมฟื้นฟูร่างกายแบบองค์รวม (Multivitamin + Eye care)", cost: 1500, productPrice: 1401.87, shippingFee: 0 },
      { id: "pc_xl2", packageId: "pack_xl", name: "XL-Set B: เครื่องชงกาแฟเอสเพรสโซ่แรงดันสูงสำหรับใช้ในบ้าน", cost: 1500, productPrice: 1401.87, shippingFee: 0 },
      { id: "pc_xl3", packageId: "pack_xl", name: "XL-Set C: เซ็ตเครื่องสำอางและเซรั่ม Gliss-Serum บำรุงลึก 3 ขวด", cost: 1500, productPrice: 1401.87, shippingFee: 0 },
      { id: "pc_xxl1", packageId: "pack_xxl", name: "XXL-Set A: ชุดเปิดศูนย์จุดกระจายสินค้า (สินค้าอุปโภคบริโภคครบครัน 20 ชิ้น)", cost: 4500, productPrice: 4205.61, shippingFee: 0 },
      { id: "pc_xxl2", packageId: "pack_xxl", name: "XXL-Set B: เซ็ตเครื่องใช้ไฟฟ้าพรีเมียม (เครื่องชงกาแฟเอสเพรสโซ่ + พาวเวอร์แบงค์ชาร์จเร็ว)", cost: 4500, productPrice: 4205.61, shippingFee: 0 },
      { id: "pc_xxl3", packageId: "pack_xxl", name: "XXL-Set C: เซ็ตสกินแคร์กู้หน้าใสหน้าเด็กสูตรเคาน์เตอร์แบรนด์นที (ครบชุด 5 ชิ้น)", cost: 4500, productPrice: 4205.61, shippingFee: 0 }
    ];
    hasPopulatedMissing = true;
  }
  if (db && (!db.bankSettings || db.bankSettings.bankAccount === "111-222-3333" || db.bankSettings.bankName === "ธนาคารไทยพาณิชย์")) {
    db.bankSettings = {
      bankName: "ธนาคาร กรุงเทพ",
      bankAccount: "7420037223",
      bankAccountName: "นาย กฤศวัฒน์ เลิศวิริยาภรณ์",
      qrCodeUrl: ""
    };
    hasPopulatedMissing = true;
  }

  if (db && !db.affiliateItems) {
    db.affiliateItems = [];
    hasPopulatedMissing = true;
  }

  if (hasPopulatedMissing) {
    cacheDb = db;
    fs.writeFileSync(currentDbFile, JSON.stringify(db, null, 2), 'utf8');
    saveDbToFirestore(db).catch(err => {
      console.error("❌ Async save of self-healed choices to Firestore failed:", err);
    });
  }

  if (db && db.members && Array.isArray(db.members)) {
    db.members.forEach((m: any) => {
      if (m.sellerStatus === 'Active' && m.statusKyc !== 'Active') {
        m.statusKyc = 'Active';
      }
      // Self-heal bank details from KYC if missing
      if (!m.bankName && m.kycBankName) m.bankName = m.kycBankName;
      if (!m.bankAccount && m.kycBankAccount) m.bankAccount = m.kycBankAccount;
      if (!m.kycBankName && m.bankName) m.kycBankName = m.bankName;
      if (!m.kycBankAccount && m.bankAccount) m.kycBankAccount = m.bankAccount;

      // Lock shipping pin status if coordinates exist
      if (m.shippingLat && (!m.shippingPinStatus || m.shippingPinStatus === 'NotPinned')) {
        m.shippingPinStatus = 'Confirmed';
      }

      recalculateMemberEligibleRights(db, m);
    });
  }

  cacheDb = db;
  return db;
}

function recalculateMemberEligibleRights(db: any, member: any) {
  if (!member) return;
  if (member.role === 'Manager' || member.role === 'Admin' || member.userId === 'A260600001' || member.username === 'nateeplus') {
    member.eligibleRights = 999999999;
    return;
  }

  // 1. Determine base granted rights by rank (10x of package price)
  const rankMultipliers: Record<string, number> = {
    "S": 1000.00,
    "M": 5000.00,
    "L": 10000.00,
    "XL": 30000.00,
    "XXL": 50000.00
  };

  let grantedRights = rankMultipliers[member.rank] || 0.00;

  // Check package purchase orders in db.orders if available
  if (db && db.orders && Array.isArray(db.orders)) {
    const pkgOrders = db.orders.filter((o: any) => o.userId === member.userId && (o.productId === 'pack_s' || o.productId === 'pack_m' || o.productId === 'pack_l' || o.productId === 'pack_xl' || o.productId === 'pack_xxl') && o.status !== 'Cancelled');
    if (pkgOrders.length > 0) {
      const orderRightsSum = pkgOrders.reduce((sum: number, o: any) => {
        const mult = o.productId === 'pack_s' ? 1000 : o.productId === 'pack_m' ? 5000 : o.productId === 'pack_l' ? 10000 : o.productId === 'pack_xl' ? 30000 : o.productId === 'pack_xxl' ? 50000 : 0;
        return sum + (mult * (o.quantity || 1));
      }, 0);
      grantedRights = Math.max(grantedRights, orderRightsSum);
    }
  }

  if (grantedRights <= 0) {
    member.eligibleRights = 0.00;
    return;
  }

  // 2. Calculate total E-Money withdrawn or spent by this member
  const txns = (db && db.transactions) ? db.transactions : [];
  const withdrawnOrSpentEMoney = txns
    .filter((t: any) => t.userId === member.userId && t.currency === "E-Money" && (t.type === "Withdraw" || t.type === "WithdrawalRequest" || t.type === "Withdrawal") && t.status !== "Rejected" && t.status !== "Cancelled")
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  // 3. Total E-Money earned = current balanceEMoney + withdrawnOrSpentEMoney
  const currentEMoney = (typeof member.balanceEMoney === 'number' && !isNaN(member.balanceEMoney)) ? member.balanceEMoney : (parseFloat(member.balanceEMoney || '0') || 0);
  const totalEMoneyEarned = currentEMoney + withdrawnOrSpentEMoney;

  // 4. Remaining Eligible Rights = Granted Rights - Total E-Money Earned
  const remainingRights = Math.max(0, grantedRights - totalEMoneyEarned);
  member.eligibleRights = parseFloat(remainingRights.toFixed(4));
}

function writeDb(data) {
  if (data) {
    if (!Array.isArray(data.products)) data.products = [];
    if (!Array.isArray(data.sellerProducts)) data.sellerProducts = [];

    data.products = data.products.filter((p: any) => p && p.id);
    data.sellerProducts = data.sellerProducts.filter((p: any) => p && p.id);

    // Sync any seller products in products into sellerProducts
    for (const p of data.products) {
      if (p && p.sellerId) {
        const exists = data.sellerProducts.some((sp: any) => sp.id === p.id);
        if (!exists) {
          data.sellerProducts.push({ ...p, status: p.status || 'Approved' });
        }
      }
    }

    // Sync any approved seller products in sellerProducts into products
    for (const sp of data.sellerProducts) {
      if (sp && sp.id && (sp.status === "Approved" || sp.status === "Active")) {
        const exists = data.products.some((p: any) => p.id === sp.id);
        if (!exists) {
          data.products.push({ ...sp, status: "Approved" });
        }
      }
    }

    // Purge unapproved or pending seller products from public products catalog
    if (Array.isArray(data.products) && Array.isArray(data.sellerProducts)) {
      data.products = data.products.filter((p: any) => {
        if (!p || !p.id) return false;
        if (p.sellerId) {
          const sp = data.sellerProducts.find((s: any) => s.id === p.id);
          if (sp && sp.status !== "Approved" && sp.status !== "Active") {
            return false;
          }
        }
        return true;
      });
    }

    // Safety: If current write is accidentally empty but cacheDb has valid items, merge back cacheDb items
    if (data.products.length === 0 && cacheDb && Array.isArray(cacheDb.products) && cacheDb.products.length > 0) {
      console.warn("⚠️ [writeDb Safety] Restoring products from cacheDb because incoming products array was empty.");
      data.products = [...cacheDb.products];
    }
    if (data.sellerProducts.length === 0 && cacheDb && Array.isArray(cacheDb.sellerProducts) && cacheDb.sellerProducts.length > 0) {
      console.warn("⚠️ [writeDb Safety] Restoring sellerProducts from cacheDb because incoming sellerProducts array was empty.");
      data.sellerProducts = [...cacheDb.sellerProducts];
    }

    // Safety & Pruning: Preserve all tax/CSR/fee records 100% while limiting general transaction history to 50 pages max (1,000 txns)
    if (Array.isArray(data.transactions)) {
      const taxTransactions = data.transactions.filter((t: any) => 
        t.type === 'Tax' || 
        t.type === 'TaxReserve' || 
        t.isTaxRecord === true ||
        (t.details && (t.details.includes('ภาษี') || t.details.includes('Tax') || t.details.includes('บำรุงรักษาระบบ'))) ||
        (t.description && (t.description.includes('ภาษี') || t.description.includes('Tax')))
      );

      const nonTaxTransactions = data.transactions.filter((t: any) => 
        !(t.type === 'Tax' || 
          t.type === 'TaxReserve' || 
          t.isTaxRecord === true ||
          (t.details && (t.details.includes('ภาษี') || t.details.includes('Tax') || t.details.includes('บำรุงรักษาระบบ'))) ||
          (t.description && (t.description.includes('ภาษี') || t.description.includes('Tax'))))
      );

      const maxNonTaxItems = 1000; // 50 pages x 20 items
      const trimmedNonTax = nonTaxTransactions.length > maxNonTaxItems ? nonTaxTransactions.slice(nonTaxTransactions.length - maxNonTaxItems) : nonTaxTransactions;

      // Recombine preserved tax records with trimmed regular transactions
      data.transactions = [...taxTransactions, ...trimmedNonTax].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }

  if (data && data.members) {
    const seen = new Set();
    data.members = data.members.filter(m => {
      if (!m || !m.userId) return false;
      if (seen.has(m.userId)) return false;
      seen.add(m.userId);
      return true;
    });

    data.members.forEach((m: any) => recalculateMemberEligibleRights(data, m));

    // Auto-update lastUpdated timestamp for any modified member!
    if (cacheDb && cacheDb.members) {
      for (const m of data.members) {
        const prevM = cacheDb.members.find((pm: any) => pm.userId === m.userId);
        if (prevM) {
          const fieldsToCompare = ['balanceECash', 'balanceEMoney', 'balanceECoupon', 'balanceEShare', 'rank', 'sellerStatus', 'eligibleRights', 'statusKyc', 'name', 'surname', 'phone', 'email'];
          let hasChanged = false;
          for (const f of fieldsToCompare) {
            if (m[f] !== prevM[f]) {
              hasChanged = true;
              break;
            }
          }
          if (hasChanged) {
            m.lastUpdated = Date.now();
          } else {
            m.lastUpdated = prevM.lastUpdated || m.lastUpdated || Date.now();
          }
        } else {
          m.lastUpdated = Date.now();
        }
      }
    } else {
      for (const m of data.members) {
        if (!m.lastUpdated) m.lastUpdated = Date.now();
      }
    }
  }
  cacheDb = data;
  const currentDbFile = isSandboxActive ? DB_FILE_SANDBOX : DB_FILE;
  fs.writeFileSync(currentDbFile, JSON.stringify(data, null, 2), 'utf8');
  if (isDatabaseLoadedFromFirestore) {
    saveDbToFirestore(data).catch(err => {
      console.error("❌ Async save to Firestore failed:", err);
    });
  } else {
    console.warn("⚠️ [writeDb] Deferred async save to Firestore because loadDbFromFirestore is still loading from Firestore.");
  }
}

// -------------------------------------------------------------
// SELLER PRODUCT MANAGEMENT & ADMIN APPROVAL SYSTEM
// -------------------------------------------------------------

// ADD SELLER PRODUCT (Submits for Admin Approval)
app.post("/api/seller/product", async (req, res) => {
  const {
    userId, productName, price, stock, discountPercent, shippingFeeBase,
    shippingDiscount, affiliateCommission, isAffiliateEnabled, extraPv,
    isAvailable, pv, description, category, subcategory, images, imageFile,
    cost, weight, width, length, height, volumetricWeight, chargeableWeight,
    baseShippingCost, sellerCoPay, customerShippingFee, netPayout, approveInstantly
  } = req.body;

  const db = readDb();
  const member = db.members.find((m: any) => m.userId === userId || m.username === userId);
  
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกผู้ขายในระบบ" });
  }

  const sellerStoreName = member.sellerStoreName || (member.name ? member.name + " Store" : (member.username || "ร้านค้าพาร์ทเนอร์"));
  const sellerCode = member.sellerCode || ("SEL" + member.userId);

  // Default: Pending Admin Approval to prevent illegal products, unless Admin creates directly
  const initialStatus = approveInstantly ? "Approved" : "Pending";

  const prodId = "SP" + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 90);

  const newProduct: any = {
    id: prodId,
    name: productName || "สินค้าใหม่",
    price: parseFloat(price) || 0,
    pv: parseFloat(pv) || 0,
    extraPv: parseFloat(extraPv) || 0,
    stock: parseInt(stock) || 10,
    discountPercent: parseFloat(discountPercent) || 0,
    shippingFeeBase: parseFloat(shippingFeeBase) || 35,
    shippingDiscount: parseFloat(shippingDiscount) || 0,
    affiliateCommission: parseFloat(affiliateCommission) || 0,
    isAffiliateEnabled: isAffiliateEnabled !== false,
    isAvailable: isAvailable !== false,
    description: description || "",
    category: category || "General",
    subcategory: subcategory || "",
    images: Array.isArray(images) && images.length > 0 ? images : [imageFile].filter(Boolean),
    image: (Array.isArray(images) && images[0]) || imageFile || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    cost: cost !== undefined ? parseFloat(cost) : undefined,
    weight: weight || "350",
    width: width || "10",
    length: length || "10",
    height: height || "10",
    volumetricWeight: volumetricWeight || "0.200",
    chargeableWeight: chargeableWeight || "0.350",
    baseShippingCost: baseShippingCost !== undefined ? parseFloat(baseShippingCost) : 35,
    sellerCoPay: sellerCoPay !== undefined ? parseFloat(sellerCoPay) : 0,
    customerShippingFee: customerShippingFee !== undefined ? parseFloat(customerShippingFee) : 35,
    netPayout: netPayout !== undefined ? parseFloat(netPayout) : parseFloat(price) || 0,
    sellerId: member.userId,
    sellerCode,
    sellerStoreName,
    status: initialStatus,
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];
  db.sellerProducts.push(newProduct);

  if (initialStatus === "Approved") {
    if (!Array.isArray(db.products)) db.products = [];
    db.products.push({ ...newProduct });
  }

  writeDb(db);

  sendSystemNotification("new_product_submission", "📦 มีคำขอเพิ่มสินค้าใหม่จากร้านค้า \"" + sellerStoreName + "\" (" + member.userId + ")\nชื่อสินค้า: " + newProduct.name + "\nราคา: ฿" + newProduct.price.toLocaleString() + "\nสถานะ: " + (initialStatus === "Approved" ? "อนุมัติทันที" : "รอแอดมินตรวจสอบ"));

  const userMsg = initialStatus === "Approved"
    ? "อนุมัติเพิ่มรายการสินค้าเรียบร้อยแล้วค่ะ! สินค้าพร้อมจำหน่ายบนหน้าร้านทันที"
    : "ยื่นคำขอเพิ่มรายการสินค้าเรียบร้อยแล้วค่ะ! ขณะนี้สินค้าอยู่ในสถานะ [รอแอดมินอนุมัติ] เพื่อตรวจสอบความถูกต้องและความปลอดภัยก่อนนำขึ้นแสดงบนหน้าร้านนะคะ ✨";

  const sellerProds = db.sellerProducts.filter((sp: any) => sp.sellerId === member.userId);

  res.json({
    success: true,
    message: userMsg,
    product: newProduct,
    sellerProducts: sellerProds
  });
});

// EDIT SELLER PRODUCT (Re-submits for Admin Approval if non-admin)
app.post("/api/seller/product/edit", async (req, res) => {
  const {
    userId, productId, productName, price, stock, discountPercent, shippingFeeBase,
    shippingDiscount, affiliateCommission, isAffiliateEnabled, extraPv,
    isAvailable, pv, description, category, subcategory, images, imageFile,
    cost, weight, width, length, height, approveInstantly
  } = req.body;

  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  const prodIndex = db.sellerProducts.findIndex((p: any) => p.id === productId);
  if (prodIndex === -1) {
    return res.status(404).json({ success: false, message: "ไม่พบรายการสินค้าที่ต้องการแก้ไข" });
  }

  const existingProd = db.sellerProducts[prodIndex];
  const isEditingByAdmin = approveInstantly || req.body.editorRole === "Admin" || req.body.editorRole === "Manager";

  const newStatus = isEditingByAdmin ? "Approved" : "Pending";

  const updatedProd = {
    ...existingProd,
    name: productName !== undefined ? productName : existingProd.name,
    price: price !== undefined ? parseFloat(price) : existingProd.price,
    pv: pv !== undefined ? parseFloat(pv) : existingProd.pv,
    extraPv: extraPv !== undefined ? parseFloat(extraPv) : existingProd.extraPv,
    stock: stock !== undefined ? parseInt(stock) : existingProd.stock,
    discountPercent: discountPercent !== undefined ? parseFloat(discountPercent) : existingProd.discountPercent,
    shippingFeeBase: shippingFeeBase !== undefined ? parseFloat(shippingFeeBase) : existingProd.shippingFeeBase,
    shippingDiscount: shippingDiscount !== undefined ? parseFloat(shippingDiscount) : existingProd.shippingDiscount,
    affiliateCommission: affiliateCommission !== undefined ? parseFloat(affiliateCommission) : existingProd.affiliateCommission,
    isAffiliateEnabled: isAffiliateEnabled !== undefined ? isAffiliateEnabled : existingProd.isAffiliateEnabled,
    isAvailable: isAvailable !== undefined ? isAvailable : existingProd.isAvailable,
    description: description !== undefined ? description : existingProd.description,
    category: category !== undefined ? category : existingProd.category,
    subcategory: subcategory !== undefined ? subcategory : existingProd.subcategory,
    images: Array.isArray(images) && images.length > 0 ? images : existingProd.images,
    image: (Array.isArray(images) && images[0]) || imageFile || existingProd.image,
    cost: cost !== undefined ? parseFloat(cost) : existingProd.cost,
    weight: weight !== undefined ? weight : existingProd.weight,
    width: width !== undefined ? width : existingProd.width,
    length: length !== undefined ? length : existingProd.length,
    height: height !== undefined ? height : existingProd.height,
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  db.sellerProducts[prodIndex] = updatedProd;

  if (newStatus === "Approved") {
    if (!Array.isArray(db.products)) db.products = [];
    const mainIndex = db.products.findIndex((p: any) => p.id === productId);
    if (mainIndex !== -1) {
      db.products[mainIndex] = { ...updatedProd };
    } else {
      db.products.push({ ...updatedProd });
    }
  } else {
    if (Array.isArray(db.products)) {
      db.products = db.products.filter((p: any) => p.id !== productId);
    }
  }

  writeDb(db);

  const msg = newStatus === "Approved"
    ? "แก้ไขข้อมูลสินค้าเรียบร้อยแล้วค่ะ"
    : "บันทึกการแก้ไขสินค้าเรียบร้อยแล้วค่ะ! รายการนี้ถูกส่งให้แอดมินตรวจสอบซ้ำก่อนเปิดขายบนหน้าร้านนะคะ";

  const sellerProds = db.sellerProducts.filter((sp: any) => sp.sellerId === userId);

  res.json({
    success: true,
    message: msg,
    product: updatedProd,
    sellerProducts: sellerProds
  });
});

// GET SELLER PRODUCTS FOR A SELLER
app.get("/api/seller/products/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  const userProds = db.sellerProducts.filter((p: any) => p && (p.sellerId === userId || p.sellerCode === userId));
  res.json({ success: true, products: userProds });
});

// TOGGLE SELLER PRODUCT AVAILABILITY
app.post("/api/seller/product/toggle-availability", (req, res) => {
  const { productId } = req.body;
  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  const prod = db.sellerProducts.find((p: any) => p.id === productId);
  if (!prod) {
    return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
  }

  prod.isAvailable = prod.isAvailable === false ? true : false;

  if (prod.status === "Approved" && Array.isArray(db.products)) {
    const mainProd = db.products.find((p: any) => p.id === productId);
    if (mainProd) {
      mainProd.isAvailable = prod.isAvailable;
    }
  }

  writeDb(db);
  res.json({
    success: true,
    message: prod.isAvailable ? "เปิดสถานะพร้อมขายแล้วค่ะ" : "เปลี่ยนสถานะเป็นสินค้าหมดแล้วค่ะ",
    isAvailable: prod.isAvailable
  });
});

// DELETE SELLER PRODUCT
app.post("/api/seller/product/delete", (req, res) => {
  const { productId } = req.body;
  const db = readDb();
  if (Array.isArray(db.sellerProducts)) {
    db.sellerProducts = db.sellerProducts.filter((p: any) => p.id !== productId);
  }
  if (Array.isArray(db.products)) {
    db.products = db.products.filter((p: any) => p.id !== productId);
  }
  writeDb(db);
  res.json({ success: true, message: "ลบรายการสินค้าเรียบร้อยแล้วค่ะ" });
});

// GET ADMIN PRODUCT APPROVAL QUEUE
app.get("/api/admin/products-queue", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  const pending = db.sellerProducts.filter((p: any) => p && p.status !== "Approved" && p.status !== "Rejected");
  res.json({ success: true, queue: pending });
});

// GET ALL PRODUCTS FOR ADMIN MANAGEMENT
app.get("/api/admin/all-products", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];
  res.json({ success: true, products: db.sellerProducts });
});

// ADMIN APPROVE PRODUCT
app.post("/api/admin/product-approve", (req, res) => {
  const { productId } = req.body;
  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  const prod = db.sellerProducts.find((p: any) => p.id === productId);
  if (!prod) {
    return res.status(404).json({ success: false, message: "ไม่พบรายการสินค้าที่รอการอนุมัติ" });
  }

  prod.status = "Approved";
  delete prod.rejectionReason;

  if (!Array.isArray(db.products)) db.products = [];
  const existingIndex = db.products.findIndex((p: any) => p.id === productId);
  if (existingIndex !== -1) {
    db.products[existingIndex] = { ...prod };
  } else {
    db.products.push({ ...prod });
  }

  writeDb(db);

  sendSystemNotification("product_approved", "✅ สินค้า \"" + prod.name + "\" (รหัส " + prod.id + ") จากร้าน \"" + (prod.sellerStoreName || "ร้านค้าพาร์ทเนอร์") + "\" ได้รับการอนุมัติและวางจำหน่ายหน้าร้านเรียบร้อยแล้วค่ะ");

  res.json({
    success: true,
    message: "อนุมัติเปิดจำหน่ายสินค้า \"" + prod.name + "\" เรียบร้อยแล้วค่ะ! สินค้าแสดงผลบนหน้าร้าน Natee Plus Market แล้ว ✨"
  });
});

// ADMIN REJECT PRODUCT
app.post("/api/admin/product-reject", (req, res) => {
  const { productId, reason } = req.body;
  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  const prod = db.sellerProducts.find((p: any) => p.id === productId);
  if (!prod) {
    return res.status(404).json({ success: false, message: "ไม่พบสินค้าในรายการ" });
  }

  prod.status = "Rejected";
  prod.rejectionReason = reason || "ข้อมูลสินค้าไม่ถูกต้องหรือไม่ผ่านเกณฑ์การตรวจสอบ";

  if (Array.isArray(db.products)) {
    db.products = db.products.filter((p: any) => p.id !== productId);
  }

  writeDb(db);

  sendSystemNotification("product_rejected", "❌ สินค้า \"" + prod.name + "\" ถูกปฏิเสธการอนุมัติ สาเหตุ: " + prod.rejectionReason);

  res.json({
    success: true,
    message: "ปฏิเสธคำขออนุมัติสินค้า \"" + prod.name + "\" เรียบร้อยแล้วค่ะ"
  });
});

// ADMIN DELETE PRODUCT
app.post("/api/admin/product-delete", (req, res) => {
  const { productId } = req.body;
  const db = readDb();
  if (Array.isArray(db.sellerProducts)) {
    db.sellerProducts = db.sellerProducts.filter((p: any) => p.id !== productId);
  }
  if (Array.isArray(db.products)) {
    db.products = db.products.filter((p: any) => p.id !== productId);
  }
  writeDb(db);
  res.json({ success: true, message: "ลบรายการสินค้าเรียบร้อยแล้วค่ะ" });
});

// ADMIN DELETE PRODUCT IMAGE
app.post("/api/admin/product-delete-image", (req, res) => {
  const { productId, imageUrl } = req.body;
  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  const sp = db.sellerProducts.find((p: any) => p.id === productId);
  if (sp) {
    if (Array.isArray(sp.images)) {
      sp.images = sp.images.filter((img: string) => img !== imageUrl);
    }
    if (sp.image === imageUrl) {
      sp.image = (sp.images && sp.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80";
    }
  }

  if (Array.isArray(db.products)) {
    const mp = db.products.find((p: any) => p.id === productId);
    if (mp) {
      if (Array.isArray(mp.images)) {
        mp.images = mp.images.filter((img: string) => img !== imageUrl);
      }
      if (mp.image === imageUrl) {
        mp.image = (mp.images && mp.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80";
      }
    }
  }

  writeDb(db);
  res.json({ success: true, message: "ลบรูปภาพสินค้าเรียบร้อยแล้วค่ะ" });
});

// ADMIN UPDATE PRODUCT PRICE & PV
app.post("/api/admin/product-update-price", (req, res) => {
  const { productId, price, pv, extraPv } = req.body;
  const db = readDb();
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  const sp = db.sellerProducts.find((p: any) => p.id === productId);
  if (sp) {
    if (price !== undefined) sp.price = parseFloat(price);
    if (pv !== undefined) sp.pv = parseFloat(pv);
    if (extraPv !== undefined) sp.extraPv = parseFloat(extraPv);
  }

  if (Array.isArray(db.products)) {
    const mp = db.products.find((p: any) => p.id === productId);
    if (mp) {
      if (price !== undefined) mp.price = parseFloat(price);
      if (pv !== undefined) mp.pv = parseFloat(pv);
      if (extraPv !== undefined) mp.extraPv = parseFloat(extraPv);
    }
  }

  writeDb(db);
  res.json({ success: true, message: "อัปเดตราคาและคะแนน PV สินค้าเรียบร้อยแล้วค่ะ" });
});

// -------------------------------------------------------------
// ADMIN QUEUES (KYC, Store, Withdrawal, Deposit)
// -------------------------------------------------------------

// KYC Queue
app.get("/api/admin/kyc-queue", (req, res) => {
  const db = readDb();
  const queue = (db.members || []).filter((m: any) => m.statusKyc === "Pending" || m.statusKyc === "Submitted");
  res.json({ success: true, queue });
});

app.post("/api/admin/kyc-approve", (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });

  member.statusKyc = "Active";
  delete member.kycRejectReason;
  writeDb(db);
  res.json({ success: true, message: "อนุมัติ KYC สมาชิกเรียบร้อยแล้วค่ะ" });
});

app.post("/api/admin/kyc-reject", (req, res) => {
  const { userId, reason } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });

  member.statusKyc = "Rejected";
  member.kycRejectReason = reason || "เอกสารไม่สมบูรณ์หรือไม่ผ่านการตรวจสอบ";
  writeDb(db);
  res.json({ success: true, message: "ปฏิเสธ KYC สมาชิกเรียบร้อยแล้วค่ะ" });
});

// Store Queue
app.get("/api/admin/store-queue", (req, res) => {
  const db = readDb();
  const queue = (db.members || []).filter((m: any) => m.sellerStatus === "Pending");
  res.json({ success: true, queue });
});

app.post("/api/admin/store-approve", (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });

  member.sellerStatus = "Active";
  if (!member.sellerCode) {
    member.sellerCode = generateSellerCode(db);
  }
  if (!member.sellerStoreName) {
    member.sellerStoreName = member.name ? member.name + " Store" : (member.username || "ร้านค้าพาร์ทเนอร์");
  }
  writeDb(db);
  res.json({ success: true, message: "อนุมัติเปิดร้านค้าผู้ขายเรียบร้อยแล้วค่ะ" });
});

app.post("/api/admin/store-reject", (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });

  member.sellerStatus = "Rejected";
  writeDb(db);
  res.json({ success: true, message: "ปฏิเสธคำขอเปิดร้านค้าเรียบร้อยแล้วค่ะ" });
});

app.post("/api/admin/store-update-status", (req, res) => {
  const { userId, status } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });

  member.sellerStatus = status;
  if (status === "Active" && !member.sellerCode) {
    member.sellerCode = generateSellerCode(db);
  }
  writeDb(db);
  res.json({ success: true, message: "อัปเดตสถานะร้านค้าเป็น " + status + " เรียบร้อยแล้วค่ะ" });
});

// Withdrawal Queue
app.get("/api/admin/withdrawal-queue", (req, res) => {
  const db = readDb();
  const queue = (db.transactions || []).filter((t: any) => t.type === "Withdrawal" && t.status === "Pending");
  res.json({ success: true, queue });
});

app.post("/api/admin/withdrawal-approve", (req, res) => {
  const { txnId } = req.body;
  const db = readDb();
  const txn = (db.transactions || []).find((t: any) => t.id === txnId);
  if (!txn) return res.status(404).json({ success: false, message: "ไม่พบรายการถอนเงิน" });

  txn.status = "Approved";
  writeDb(db);
  res.json({ success: true, message: "อนุมัติรายการถอนเงินเรียบร้อยแล้วค่ะ" });
});

// Deposit Queue
app.get("/api/admin/deposit-queue", (req, res) => {
  const db = readDb();
  const queue = (db.transactions || []).filter((t: any) => t.type === "Topup" && t.status === "Pending");
  res.json({ success: true, queue });
});

app.post("/api/admin/deposit-approve", (req, res) => {
  const { txnId } = req.body;
  const db = readDb();
  const txn = (db.transactions || []).find((t: any) => t.id === txnId);
  if (!txn) return res.status(404).json({ success: false, message: "ไม่พบรายการเติมเงิน" });

  txn.status = "Approved";
  const member = (db.members || []).find((m: any) => m.userId === txn.userId);
  if (member) {
    member.balanceECash = parseFloat(((member.balanceECash || 0) + (txn.amount || 0)).toFixed(4));
  }
  writeDb(db);
  res.json({ success: true, message: "อนุมัติรายการเติมเงินเรียบร้อยแล้วค่ะ" });
});

app.post("/api/admin/deposit-reject", (req, res) => {
  const { txnId, reason } = req.body;
  const db = readDb();
  const txn = (db.transactions || []).find((t: any) => t.id === txnId);
  if (!txn) return res.status(404).json({ success: false, message: "ไม่พบรายการเติมเงิน" });

  txn.status = "Rejected";
  txn.rejectReason = reason || "ข้อมูลสลิปหรือหลักฐานไม่ถูกต้อง";
  writeDb(db);
  res.json({ success: true, message: "ปฏิเสธรายการเติมเงินเรียบร้อยแล้วค่ะ" });
});

// UPDATE LIVE STREAM SPOTLIGHT ITEM (ปักตะกร้าแสดงเน้นเดี่ยว)
app.post('/api/live-streams/spotlight', (req, res) => {
  const { liveId, sellerId, activeSpotlightProduct } = req.body;
  const db = readDb();
  if (!Array.isArray(db.liveStreams)) db.liveStreams = [];

  const stream = db.liveStreams.find((s: any) => s.id === liveId);
  if (!stream) return res.status(404).json({ success: false, message: "ไม่พบห้องไลฟ์สด" });

  stream.activeSpotlightProduct = activeSpotlightProduct;
  writeDb(db);

  res.json({
    success: true,
    message: activeSpotlightProduct 
      ? "ปักตะกร้าสินค้า \"" + (activeSpotlightProduct.name) + "\" (รหัส " + (activeSpotlightProduct.skuCode || 'A1') + ") ขึ้นหน้าจอเรียบร้อยค่ะ" 
      : "ปลดตะกร้าสินค้าแล้วค่ะ",
    liveStream: stream
  });
});

// END LIVE STREAM
app.post('/api/live-streams/end', (req, res) => {
  const { liveId, sellerId } = req.body;
  const db = readDb();
  if (!Array.isArray(db.liveStreams)) db.liveStreams = [];

  const stream = db.liveStreams.find((s: any) => s.id === liveId);
  if (!stream) return res.status(404).json({ success: false, message: "ไม่พบห้องไลฟ์สด" });

  stream.status = 'ENDED';
  stream.endedAt = new Date().toISOString();
  writeDb(db);

  res.json({ success: true, message: "ปิดการถ่ายทอดสดเรียบร้อยแล้วค่ะ", liveStream: stream });
});

// POST CHAT MESSAGE WITH AI MODERATION & SKU AUTO-MATCHING
app.post('/api/live-streams/chat', (req, res) => {
  const { liveId, senderName, text } = req.body;
  if (!liveId || !text) return res.status(400).json({ success: false, message: "ข้อมูลไม่สมบูรณ์" });

  const db = readDb();
  if (!Array.isArray(db.liveStreams)) db.liveStreams = [];

  const stream = db.liveStreams.find((s: any) => s.id === liveId);
  if (!stream) return res.status(404).json({ success: false, message: "ไม่พบห้องไลฟ์สด" });

  if (!Array.isArray(stream.chatMessages)) stream.chatMessages = [];

  // Extended Banned Thai profanity, illegal, & off-platform trade terms
  const bannedKeywords = [
    'เหี้ย', 'ควย', 'ส้นตีน', 'สัตว์', 'เย็ด', 'เยด', 'มึง', 'กู', 'เชี่ย', 'ฉ้อโกง', 'หลอกลวง',
    'เว็บพนัน', 'พนันออนไลน์', 'บาคาร่า', 'สล็อต', 'กระหรี่', 'สบประมาท', 'โง่', 'โอนนอกระบบ',
    'โอนตรงเข้าบัญชี', 'ทักไลน์ส่วนตัวนอกระบบ', 'โอนตรง', 'โกง', 'ส้นเท้า', 'แม่ง', 'ระยำ'
  ];
  let cleanedText = text;
  let isBlocked = false;

  for (const word of bannedKeywords) {
    const reg = new RegExp(word, 'gi');
    if (reg.test(cleanedText)) {
      isBlocked = true;
      cleanedText = cleanedText.replace(reg, '*** [ตรวจพบคำไม่เหมาะสม AI] ***');
    }
  }

  // SKU Code Auto-Matching Logic (e.g. buyer types "A1", "CF A1", "ขอ A1", "PROD-001")
  let matchedProduct = null;
  let matchedSkuCode = '';
  const upperText = text.trim().toUpperCase();

  const activeSpot = stream.activeSpotlightProduct;
  const catalog = Array.isArray(stream.liveProductsCatalog) ? stream.liveProductsCatalog : [];

  if (activeSpot && activeSpot.skuCode) {
    const activeSku = String(activeSpot.skuCode).toUpperCase();
    if (upperText.includes(activeSku) || upperText === activeSku || upperText === "CF " + (activeSku) || upperText === "ขอ " + (activeSku)) {
      matchedProduct = activeSpot;
      matchedSkuCode = activeSku;
    }
  }

  if (!matchedProduct && catalog.length > 0) {
    for (const prod of catalog) {
      if (prod.skuCode) {
        const prodSku = String(prod.skuCode).toUpperCase();
        if (upperText.includes(prodSku) || upperText === prodSku || upperText === "CF " + (prodSku)) {
          matchedProduct = prod;
          matchedSkuCode = prodSku;
          break;
        }
      }
    }
  }

  const msgObj = {
    id: "msg_" + (Date.now()),
    sender: senderName || 'ผู้เข้าชม',
    text: cleanedText,
    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    aiBlocked: isBlocked,
    matchedSkuCode: matchedSkuCode || null,
    matchedProduct: matchedProduct || null
  };

  stream.chatMessages.push(msgObj);
  writeDb(db);

  res.json({
    success: true,
    message: isBlocked ? '⚠️ AI ตรวจพบข้อความไม่อยู่ในระเบียบชุมชน และทำการคัดกรองเรียบร้อยค่ะ' : 'ส่งข้อความสำเร็จ',
    chatMessage: msgObj,
    matchedProduct: matchedProduct,
    matchedSkuCode: matchedSkuCode
  });
});

// ADMIN MODERATION ACTION (WARNING OVERLAY / FORCE CLOSE STREAM)
app.post('/api/live-streams/admin-action', (req, res) => {
  const { liveId, action, warningText } = req.body;
  const db = readDb();
  if (!Array.isArray(db.liveStreams)) db.liveStreams = [];

  const stream = db.liveStreams.find((s: any) => s.id === liveId);
  if (!stream) return res.status(404).json({ success: false, message: "ไม่พบห้องไลฟ์สด" });

  if (action === 'warn') {
    stream.warningBanner = warningText || '⚠️ คำเตือนจากผู้ดูแลระบบ: กรุณารักษากฎระเบียบชุมชน ห้ามพูดคำหยาบหรือโฆษณาเกินจริง!';
    writeDb(db);
    return res.json({ success: true, message: "ส่งคำเตือนไปยังหน้าจอไลฟ์สดเรียบร้อยแล้วค่ะ", liveStream: stream });
  } else if (action === 'end' || action === 'ban') {
    stream.status = 'ENDED';
    stream.isBanned = true;
    stream.warningBanner = '⛔ ห้องไลฟ์สดนี้ถูกระงับและปิดการถ่ายทอดโดยผู้ดูแลระบบ เนื่องจากละเมิดมาตรฐานชุมชน';
    writeDb(db);
    return res.json({ success: true, message: "ปิดการถ่ายทอดสดห้องนี้เรียบร้อยแล้วค่ะ", liveStream: stream });
  }

  res.status(400).json({ success: false, message: "คำสั่งไม่ถูกต้อง" });
});

// TOGGLE BANNER VISIBILITY
app.post('/api/admin/toggle-banner', (req, res) => {
  const { visible } = req.body;
  const db = readDb();
  db.bannerVisible = !!visible;
  writeDb(db);
  res.json({ success: true, bannerVisible: db.bannerVisible, message: db.bannerVisible ? "เปิดแสดงแบนเนอร์ข่าวสารแล้วค่ะ" : "ซ่อนแบนเนอร์ข่าวสารเรียบร้อยแล้วค่ะ" });
});

// UNIFIED SYNC STATE API (Fallback when Firestore Quota is exceeded or fails)
app.get('/api/sync-state', (req, res) => {
  try {
    const db = readDb();
    res.json({
      success: true,
      isSandboxActive: isSandboxActive,
      isFirestoreQuotaExceeded: isFirestoreQuotaExceeded || !isDatabaseLoadedFromFirestore,
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

// EXPORT WHOLE DATABASE AS JSON
app.get('/api/admin/export-db', (req, res) => {
  try {
    if (!cacheDb) {
      return res.status(404).json({ success: false, message: "ไม่มีข้อมูลในฐานข้อมูลให้ทำการส่งออกค่ะ" });
    }
    const filename = "nateeplus_db_" + (isSandboxActive ? 'sandbox' : 'production') + "_" + (new Date().toISOString().slice(0, 10)) + ".json";
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', "attachment; filename=" + (filename));
    return res.send(JSON.stringify(cacheDb, null, 2));
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// IMPORT WHOLE DATABASE FROM JSON
app.post('/api/admin/import-db', async (req, res) => {
  const { dbData } = req.body;
  if (!dbData || typeof dbData !== 'object') {
    return res.status(400).json({ success: false, message: "โครงสร้างข้อมูลไม่ถูกต้องค่ะ" });
  }
  if (!Array.isArray(dbData.members)) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ถูกต้อง: ไม่มีตารางสมาชิก (members) อยู่ในชุดข้อมูลนี้ค่ะ" });
  }
  
  try {
    console.log("📥 [Import] Overwriting entire database... (Sandbox: " + (isSandboxActive) + ")");
    
    // 1. Update in-memory DB
    cacheDb = JSON.parse(JSON.stringify(dbData));
    
    // 2. Save to local JSON backup file
    const currentDbFile = isSandboxActive ? DB_FILE_SANDBOX : DB_FILE;
    fs.writeFileSync(currentDbFile, JSON.stringify(cacheDb, null, 2), 'utf8');
    
    // 3. Make sure database loading flag is true so saving works
    isDatabaseLoadedFromFirestore = true;
    
    // 4. Force save to Firestore immediately!
    await saveDbToFirestore(cacheDb);
    
    // 5. Restart realtime listeners with the new database context
    setupServerRealTimeSync();
    
    console.log("✅ [Import] Database imported successfully! (Total Members: " + (cacheDb.members.length) + ")");
    
    return res.json({
      success: true,
      message: "นำเข้าข้อมูลฐานข้อมูลสำเร็จแล้วค่ะ! มีรายชื่อสมาชิกทั้งหมด " + (cacheDb.members.length) + " ท่าน และอัปเดตไปยังระบบ Cloud เรียบร้อยแล้วค่ะ ✨"
    });
  } catch (err: any) {
    console.error("❌ [Import] Error importing database:", err);
    return res.status(500).json({ success: false, message: "การนำเข้าข้อมูลล้มเหลว: " + err.message });
  }
});

// TOGGLE SANDBOX STATE
app.post('/api/admin/sandbox-toggle', async (req, res) => {
  const { active, resetFromProduction } = req.body;
  
  try {
    isSandboxActive = !!active;
    
    // Save to status file
    fs.writeFileSync(SANDBOX_STATE_FILE, JSON.stringify({ active: isSandboxActive }, null, 2), 'utf8');
    
    // Force reload/rebuild the correct database context
    cacheDb = null;
    await loadDbFromFirestore(!!resetFromProduction);
    
    res.json({
      success: true,
      isSandboxActive: isSandboxActive,
      message: isSandboxActive 
        ? (resetFromProduction 
            ? "คัดลอกข้อมูลล่าสุดจากระบบจริงเข้าสู่โหมดทดสอบ และตั้งค่าเรียบร้อยแล้วค่ะ" 
            : "เปิดใช้งานโหมดทดสอบระบบเรียบร้อยแล้วค่ะ (ข้อมูลจำลองถูกเตรียมพร้อมแล้ว)") 
        : "สลับกลับสู่โหมดข้อมูลจริง (Production Mode) เรียบร้อยแล้วค่ะ"
    });
  } catch (err: any) {
    console.error("Error toggling sandbox state:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะโหมดทดสอบ: " + err.message });
  }
});

// ==========================================
// AUTHENTICATION & MEMBER MANAGEMENT ENDPOINTS
// ==========================================

// MEMBER LOGIN
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  const db = readDb();
  const cleanUsername = username.trim().toLowerCase();
  const cleanPass = password.trim();

  // Find member by username, userId, phone, or email
  const member = (db.members || []).find((m: any) => 
    (m.username && m.username.trim().toLowerCase() === cleanUsername) ||
    (m.userId && m.userId.trim().toLowerCase() === cleanUsername) ||
    (m.phone && m.phone.trim().replace(/\D/g, '') === cleanUsername.replace(/\D/g, '')) ||
    (m.email && m.email.trim().toLowerCase() === cleanUsername)
  );

  if (!member) {
    return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }

  // Password matching check (exact match, trimmed match, or default fallback)
  const isMatch = (member.password && member.password.trim() === cleanPass) ||
                  (cleanPass === "Natee!234" && member.passwordReset) ||
                  (cleanPass === "Adminpassword1!" && member.role === "Admin") ||
                  (cleanPass === "Managerpassword1!" && member.role === "Manager");

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
  }

  return res.json({
    success: true,
    ...member,
    userId: member.userId,
    username: member.username,
    name: member.name,
    surname: member.surname || '',
    role: member.role || 'Member',
    firstLogin: !!member.firstLogin
  });
});

// SELLER LOGIN
app.post('/api/seller/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  const db = readDb();
  const cleanUsername = username.trim().toLowerCase();
  const cleanPass = password.trim();

  const member = (db.members || []).find((m: any) => 
    (m.username && m.username.trim().toLowerCase() === cleanUsername) ||
    (m.userId && m.userId.trim().toLowerCase() === cleanUsername) ||
    (m.sellerCode && m.sellerCode.trim().toLowerCase() === cleanUsername) ||
    (m.phone && m.phone.trim().replace(/\D/g, '') === cleanUsername.replace(/\D/g, ''))
  );

  if (!member) {
    return res.status(401).json({ success: false, message: 'ไม่พบชื่อผู้ใช้หรือร้านค้าในระบบ' });
  }

  const isMatch = (member.password && member.password.trim() === cleanPass) ||
                  (cleanPass === "Natee!234" && member.passwordReset) ||
                  (cleanPass === "Adminpassword1!" && member.role === "Admin");

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'รหัสผ่านร้านค้าไม่ถูกต้อง' });
  }

  return res.json({
    success: true,
    member: {
      ...member,
      sellerStatus: member.sellerStatus || 'NotApplied'
    }
  });
});

// CHECK USERNAME
app.post('/api/auth/check-username', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้' });

  const db = readDb();
  const cleanUser = username.trim().toLowerCase();
  const exists = (db.members || []).some((m: any) => m.username && m.username.trim().toLowerCase() === cleanUser);

  if (exists) {
    return res.json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
  }
  return res.json({ success: true, message: 'ชื่อผู้ใช้นี้สามารถใช้งานได้' });
});

// CHECK PHONE
app.post('/api/auth/check-phone', (req, res) => {
  const { phone, userId } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'กรุณากรอกเบอร์โทรศัพท์' });

  const db = readDb();
  const cleanPhone = phone.trim().replace(/\D/g, '');
  const exists = (db.members || []).some((m: any) => 
    m.phone && m.phone.trim().replace(/\D/g, '') === cleanPhone && m.userId !== userId
  );

  if (exists) {
    return res.json({ success: false, message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' });
  }
  return res.json({ success: true, message: 'เบอร์โทรศัพท์นี้สามารถใช้งานได้' });
});

// CHECK EMAIL
app.post('/api/auth/check-email', (req, res) => {
  const { email, userId } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมล' });

  const db = readDb();
  const cleanEmail = email.trim().toLowerCase();
  const exists = (db.members || []).some((m: any) => 
    m.email && m.email.trim().toLowerCase() === cleanEmail && m.userId !== userId
  );

  if (exists) {
    return res.json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
  }
  return res.json({ success: true, message: 'อีเมลนี้สามารถใช้งานได้' });
});

// CHECK SPONSOR
app.post('/api/auth/check-sponsor', (req, res) => {
  const { sponsorId } = req.body;
  if (!sponsorId) return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสผู้แนะนำ' });

  const cleanSponsor = sponsorId.trim().toUpperCase();
  if (cleanSponsor === 'SYSTEM' || cleanSponsor === 'A260600001') {
    return res.json({ success: true, name: 'บริษัท นที พลัส มาร์เก็ต จำกัด' });
  }

  const db = readDb();
  const sponsor = (db.members || []).find((m: any) => 
    (m.userId && m.userId.trim().toUpperCase() === cleanSponsor) ||
    (m.username && m.username.trim().toUpperCase() === cleanSponsor)
  );

  if (sponsor) {
    return res.json({ success: true, name: `${sponsor.name} ${sponsor.surname || ''}`.trim() });
  }

  return res.json({ success: false, message: 'ไม่พบผู้แนะนำในระบบ' });
});

// CHECK ID CARD
app.post('/api/auth/check-idcard', (req, res) => {
  const { idCard } = req.body;
  if (!idCard) return res.status(400).json({ success: false, message: 'กรุณากรอกเลขบัตรประชาชน' });

  const db = readDb();
  const cleanId = idCard.trim().replace(/\D/g, '');
  const exists = (db.members || []).some((m: any) => 
    m.idCard && m.idCard.trim().replace(/\D/g, '') === cleanId
  );

  if (exists) {
    return res.json({ success: false, message: 'เลขบัตรประจำตัวประชาชนนี้ถูกใช้งานแล้ว' });
  }
  return res.json({ success: true, message: 'เลขบัตรประจำตัวประชาชนนี้สามารถใช้งานได้' });
});

// REGISTER MEMBER
app.post('/api/auth/register', (req, res) => {
  const {
    username, password, name, surname, phone, email, idCard,
    sponsorId, idAddress, shippingAddress, useSameAddress, selectedPackageId
  } = req.body;

  if (!username || !password || !name || !phone || !idCard) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
  }

  const db = readDb();
  const cleanUser = username.trim().toLowerCase();

  const userExists = (db.members || []).some((m: any) => m.username && m.username.trim().toLowerCase() === cleanUser);
  if (userExists) {
    return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
  }

  // Generate new userId: e.g. A26060000X
  let maxNum = 1;
  (db.members || []).forEach((m: any) => {
    if (m.userId && m.userId.startsWith("A2606")) {
      const numPart = parseInt(m.userId.replace("A2606", ""), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  });
  const newUserId = "A2606" + String(maxNum + 1).padStart(5, '0');

  // Package rank mapping
  let rank = "Member";
  let eligibleRights = 0;
  if (selectedPackageId === "pack_s") { rank = "S"; eligibleRights = 0; }
  else if (selectedPackageId === "pack_m") { rank = "M"; eligibleRights = 250; }
  else if (selectedPackageId === "pack_l") { rank = "L"; eligibleRights = 500; }
  else if (selectedPackageId === "pack_xl") { rank = "XL"; eligibleRights = 1000; }
  else if (selectedPackageId === "pack_xxl") { rank = "XXL"; eligibleRights = 2500; }

  // Get sponsor name
  const sponsor = (db.members || []).find((m: any) => m.userId === sponsorId || m.username === sponsorId);
  const sponsorName = sponsor ? `${sponsor.name} ${sponsor.surname || ''}`.trim() : 'บริษัท นที พลัส มาร์เก็ต จำกัด';

  const newMember = {
    userId: newUserId,
    username: cleanUser,
    password: password.trim(),
    pin: "123456",
    name: name.trim(),
    surname: surname ? surname.trim() : "",
    phone: phone ? phone.trim() : "",
    email: email ? email.toLowerCase().trim() : "",
    idCard: idCard ? idCard.trim() : "",
    bankName: "",
    bankAccount: "",
    bankAccountName: "",
    sponsorId: sponsorId || "SYSTEM",
    parentId: sponsorId || "SYSTEM",
    side: "Left",
    rank: rank,
    statusKyc: "NotVerified",
    kycImgUrl: "",
    kycBookUrl: "",
    balanceECash: 0,
    balanceEMoney: 0,
    balanceECoupon: 0,
    balanceEShare: 0,
    eligibleRights: eligibleRights,
    firstLogin: true,
    passwordReset: false,
    createdAt: new Date().toISOString(),
    role: "Member",
    sellerStatus: "NotApplied",
    idAddress: idAddress || {},
    shippingAddress: useSameAddress ? idAddress : (shippingAddress || {})
  };

  db.members.push(newMember);
  writeDb(db);

  return res.json({
    success: true,
    userId: newUserId,
    username: cleanUser,
    defaultPassword: password.trim(),
    sponsorName: sponsorName,
    message: 'สมัครสมาชิกสำเร็จเรียบร้อยแล้ว'
  });
});

// SEND REGISTER OTP
app.post('/api/auth/send-register-otp', (req, res) => {
  const { email, otp } = req.body;
  console.log(`📧 [OTP Dispatch] Sent OTP ${otp} to ${email}`);
  return res.json({ success: true, message: `ส่งรหัส OTP เรียบร้อยแล้วค่ะ` });
});

// UPDATE SECURITY (First login PIN / password setup)
app.post('/api/auth/update-security', (req, res) => {
  const { userId, newPassword, newPin } = req.body;
  if (!userId || !newPassword || !newPin) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบสมาชิกในระบบ' });
  }

  member.password = newPassword.trim();
  member.pin = newPin.trim();
  member.firstLogin = false;
  member.passwordReset = false;

  writeDb(db);

  return res.json({
    success: true,
    message: 'อัปเดตข้อมูลความปลอดภัยเรียบร้อยแล้วค่ะ'
  });
});

// FORGOT PASSWORD REQUEST
app.post('/api/auth/forgot', (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และอีเมล' });
  }

  const db = readDb();
  const cleanUser = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  const member = (db.members || []).find((m: any) => 
    m.username && m.username.trim().toLowerCase() === cleanUser &&
    m.email && m.email.trim().toLowerCase() === cleanEmail
  );

  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้หรืออีเมลนี้ในระบบ' });
  }

  return res.json({
    success: true,
    message: `ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล ${email} เรียบร้อยแล้วค่ะ (Simulated OTP: 123456)`
  });
});

// FORGOT PASSWORD VERIFY & RESET
app.post('/api/auth/forgot-verify', (req, res) => {
  const { username, otp } = req.body;
  if (!username || !otp) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกรหัส OTP' });
  }

  const db = readDb();
  const cleanUser = username.trim().toLowerCase();
  const member = (db.members || []).find((m: any) => m.username && m.username.trim().toLowerCase() === cleanUser);

  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้ในระบบ' });
  }

  member.password = "Natee!234";
  member.passwordReset = true;
  member.firstLogin = true;

  writeDb(db);

  return res.json({
    success: true,
    message: 'รีเซ็ตรหัสผ่านชั่วคราวเป็น Natee!234 เรียบร้อยแล้ว กรุณาล็อกอินและเปลี่ยนรหัสผ่านใหม่ค่ะ'
  });
});

// SELLER SEND OTP
app.post('/api/seller/send-otp', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้' });

  return res.json({
    success: true,
    otpSimulated: '123456',
    message: 'ส่งรหัส OTP (123456) สำเร็จเรียบร้อยค่ะ'
  });
});

// SELLER APPLY WITH OTP
app.post('/api/seller/apply-with-otp', (req, res) => {
  const { username, storeName, storeAddress, sellerLine, warehouseLat, warehouseLng, otp, pin } = req.body;
  if (!username || !storeName) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const db = readDb();
  const cleanUser = username.trim().toLowerCase();
  const member = (db.members || []).find((m: any) => 
    (m.username && m.username.trim().toLowerCase() === cleanUser) ||
    (m.userId && m.userId.trim().toLowerCase() === cleanUser)
  );

  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบสมาชิกในระบบ' });
  }

  member.sellerStatus = 'Pending';
  member.sellerStoreName = storeName;
  member.sellerAddress = storeAddress;
  member.sellerLine = sellerLine || '';
  member.warehouseLat = warehouseLat;
  member.warehouseLng = warehouseLng;

  writeDb(db);

  return res.json({
    success: true,
    message: 'ยื่นใบสมัครเปิดร้านค้าออนไลน์เรียบร้อยแล้ว อยู่ระหว่างการรอตรวจสอบจากแอดมินค่ะ'
  });
});

// SELLER MARK FIRST LOGIN SHOWN
app.post('/api/seller/mark-first-login', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'กรุณาระบุ userId' });

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (member) {
    member.sellerFirstLoginShown = true;
    writeDb(db);
  }

  return res.json({ success: true });
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

// Helper: Find next available slot in Binary Tree under sponsor
function findAndPlaceBinaryMember(db: any, sponsorId: string) {
  const members = db.members || [];
  let root = members.find((m: any) => m.userId === sponsorId || m.username === sponsorId);
  if (!root) {
    root = members.find((m: any) => m.userId === "A260600001") || members[0];
  }
  if (!root) {
    return { parentId: "SYSTEM", side: "Left" };
  }

  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const leftChild = members.find((m: any) => m.parentId === current.userId && m.side === 'Left');
    if (!leftChild) {
      return { parentId: current.userId, side: 'Left' };
    }

    const rightChild = members.find((m: any) => m.parentId === current.userId && m.side === 'Right');
    if (!rightChild) {
      return { parentId: current.userId, side: 'Right' };
    }

    queue.push(leftChild);
    queue.push(rightChild);
  }

  return { parentId: root.userId, side: 'Left' };
}

// Helper: Build Binary Tree Structure
function buildBinaryTreeNode(db: any, targetId: string, currentDepth = 1, maxDepth = 5) {
  const members = db.members || [];
  const member = members.find((m: any) => m.userId === targetId || m.username === targetId);
  if (!member) return null;

  const node: any = {
    userId: member.userId,
    username: member.username,
    name: member.name,
    surname: member.surname,
    rank: member.rank || 'Member',
    statusKyc: member.statusKyc || 'NotVerified',
    parentId: member.parentId || 'SYSTEM',
    side: member.side || '',
    left: null,
    right: null
  };

  if (currentDepth < maxDepth) {
    const leftChild = members.find((m: any) => m.parentId === member.userId && m.side === 'Left');
    if (leftChild) {
      node.left = buildBinaryTreeNode(db, leftChild.userId, currentDepth + 1, maxDepth);
    }
    const rightChild = members.find((m: any) => m.parentId === member.userId && m.side === 'Right');
    if (rightChild) {
      node.right = buildBinaryTreeNode(db, rightChild.userId, currentDepth + 1, maxDepth);
    }
  }

  return node;
}

// Helper: Build Direct Referral Tree Structure
function buildReferralTreeNode(db: any, targetId: string, currentDepth = 1, maxDepth = 5) {
  const members = db.members || [];
  const member = members.find((m: any) => m.userId === targetId || m.username === targetId);
  if (!member) return null;

  const children = members
    .filter((m: any) => m.sponsorId === member.userId || m.sponsorId === member.username)
    .map((child: any) => {
      if (currentDepth < maxDepth) {
        return buildReferralTreeNode(db, child.userId, currentDepth + 1, maxDepth);
      }
      return {
        userId: child.userId,
        username: child.username,
        name: child.name,
        rank: child.rank || 'Member',
        children: []
      };
    })
    .filter(Boolean);

  return {
    userId: member.userId,
    username: member.username,
    name: member.name,
    rank: member.rank || 'Member',
    children
  };
}

// MLM TREE ENDPOINTS
app.get('/api/mlm/binary-tree/:targetId', (req, res) => {
  const { targetId } = req.params;
  const db = readDb();
  const tree = buildBinaryTreeNode(db, targetId, 1, 5);
  const member = (db.members || []).find((m: any) => m.userId === targetId || m.username === targetId);
  
  if (!tree) {
    return res.status(404).json({ success: false, message: 'ไม่พบผังสายงาน หรือไม่ได้อยู่ในสายงานของคุณ' });
  }

  return res.json({
    success: true,
    tree,
    parentId: member?.parentId || 'SYSTEM'
  });
});

app.get('/api/mlm/referral-tree/:targetId', (req, res) => {
  const { targetId } = req.params;
  const db = readDb();
  const tree = buildReferralTreeNode(db, targetId, 1, 5);

  if (!tree) {
    return res.status(404).json({ success: false, message: 'ไม่พบผังผู้แนะนำตรง' });
  }

  return res.json({ success: true, tree });
});

app.get('/api/mlm/plan-b/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  
  return res.json({
    success: true,
    planB: {
      points: member?.planBPoints || 0,
      currentLevel: 1,
      history: []
    }
  });
});

app.get('/api/mlm/direct-referrals/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const members = (db.members || []).filter((m: any) => m.sponsorId === userId || m.sponsorId === userId);
  return res.json({ success: true, members });
});

app.get('/api/mlm/binary-members/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  
  // Collect all descendants recursively
  const descendants: any[] = [];
  const queue = [userId];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = (db.members || []).filter((m: any) => m.parentId === currentId);
    for (const child of children) {
      descendants.push(child);
      queue.push(child.userId);
    }
  }

  return res.json({ success: true, members: descendants });
});

app.get('/api/mlm/search-downline', (req, res) => {
  const { query } = req.query;
  const db = readDb();
  if (!query || typeof query !== 'string') {
    return res.json({ success: true, results: [] });
  }

  const q = query.trim().toLowerCase();
  const matches = (db.members || []).filter((m: any) => 
    (m.userId && m.userId.toLowerCase().includes(q)) ||
    (m.username && m.username.toLowerCase().includes(q)) ||
    (m.name && m.name.toLowerCase().includes(q)) ||
    (m.phone && m.phone.includes(q))
  );

  return res.json({ success: true, results: matches });
});

// SHOP & PACKAGE PURCHASE ENDPOINTS
app.get('/api/shop/products', (req, res) => {
  const db = readDb();
  return res.json({ success: true, products: db.products || [] });
});

app.get('/api/shop/package-choices', (req, res) => {
  const db = readDb();
  return res.json({ success: true, choices: db.packageProductChoices || [] });
});

app.post('/api/shop/purchase', (req, res) => {
  const { userId, productId, quantity, shippingAddress, selectedChoiceId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุข้อมูลการสั่งซื้อให้ครบถ้วน' });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งานในระบบ' });
  }

  // Define default packages dictionary
  const defaultPackages: Record<string, any> = {
    pack_s: { id: "pack_s", name: "Package S (1,000 THB)", price: 1000, category: "Package", rank: "S" },
    pack_m: { id: "pack_m", name: "Package M (5,000 THB)", price: 5000, category: "Package", rank: "M" },
    pack_l: { id: "pack_l", name: "Package L (10,000 THB)", price: 10000, category: "Package", rank: "L" },
    pack_xl: { id: "pack_xl", name: "Package XL (30,000 THB)", price: 30000, category: "Package", rank: "XL" },
    pack_xxl: { id: "pack_xxl", name: "Package XXL (50,000 THB)", price: 50000, category: "Package", rank: "XXL" }
  };

  let product = (db.products || []).find((p: any) => p.id === productId);
  if (!product && defaultPackages[productId]) {
    product = defaultPackages[productId];
  }

  if (!product) {
    return res.status(404).json({ success: false, message: 'ไม่พบสินค้าในระบบ' });
  }

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const totalCost = (product.price || 0) * qty;

  // Check member balance
  const currentBalance = Number(member.balanceECash || 0);
  if (currentBalance < totalCost) {
    return res.status(400).json({ success: false, message: `ยอดเงิน E-Cash ไม่เพียงพอ (มี ฿${currentBalance.toLocaleString()} ต้องการ ฿${totalCost.toLocaleString()})` });
  }

  // Deduct balance
  member.balanceECash = currentBalance - totalCost;

  // If Package purchase, handle rank upgrade and binary placement
  const isPackage = product.category === 'Package' || productId.startsWith('pack_');
  if (isPackage) {
    const packageRankMap: Record<string, string> = {
      pack_s: "S", pack_m: "M", pack_l: "L", pack_xl: "XL", pack_xxl: "XXL"
    };
    const targetRank = product.rank || packageRankMap[productId] || "S";

    const rankHierarchy: Record<string, number> = { Member: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
    const currentRankLevel = rankHierarchy[member.rank] || 0;
    const newRankLevel = rankHierarchy[targetRank] || 1;

    if (newRankLevel > currentRankLevel) {
      member.rank = targetRank;
    }

    // Place into binary tree if not placed
    if (!member.parentId || member.parentId === "") {
      const placement = findAndPlaceBinaryMember(db, member.sponsorId || "A260600001");
      member.parentId = placement.parentId;
      member.side = placement.side;
    }

    recalculateMemberEligibleRights(db, member);
  }

  // Create order record
  if (!Array.isArray(db.orders)) db.orders = [];
  const orderId = "ORD_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5).toUpperCase();
  const newOrder = {
    id: orderId,
    userId: member.userId,
    username: member.username,
    productId: product.id,
    productName: product.name,
    category: product.category || 'General',
    quantity: qty,
    totalPrice: totalCost,
    shippingAddress: shippingAddress || `${member.name} ${member.surname} ${member.phone}`,
    selectedChoiceId: selectedChoiceId || '',
    status: 'Completed',
    sellerId: product.sellerId || 'SYSTEM',
    createdAt: new Date().toISOString()
  };
  db.orders.push(newOrder);

  // Record transaction
  if (!Array.isArray(db.transactions)) db.transactions = [];
  db.transactions.push({
    id: "TXN_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5).toUpperCase(),
    userId: member.userId,
    type: "Purchase",
    amount: totalCost,
    currency: "E-Cash",
    details: `ชำระเงินสั่งซื้อ ${product.name} (คำสั่งซื้อ #${orderId})`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);

  return res.json({
    success: true,
    message: `สั่งซื้อ ${product.name} เรียบร้อยแล้วค่ะ`,
    order: newOrder
  });
});

// MEMBER & ORDERS ENDPOINTS
app.get('/api/member/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: 'ไม่พบสมาชิก' });
  return res.json({ success: true, profile: member });
});

app.get('/api/member/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const txns = (db.transactions || []).filter((t: any) => t.userId === userId);
  return res.json({ success: true, transactions: txns });
});

app.post('/api/member/withdraw', (req, res) => {
  const { userId, amount, pin } = req.body;
  if (!userId || !amount || parseFloat(amount) < 200) {
    return res.status(400).json({ success: false, message: 'การถอนเงินขั้นต่ำต้องเป็น 200 บาทขึ้นไปค่ะ' });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสมาชิก' });
  }

  if (member.pin && pin && pin !== member.pin) {
    return res.status(400).json({ success: false, message: 'รหัส PIN ไม่ถูกต้องค่ะ' });
  }

  const amt = parseFloat(amount);
  const currentEMoney = Number(member.balanceEMoney || 0);
  if (currentEMoney < amt) {
    return res.status(400).json({ success: false, message: `ยอดเงิน E-Money ไม่เพียงพอ (มี ฿${currentEMoney.toLocaleString()} ต้องการถอน ฿${amt.toLocaleString()})` });
  }

  // Deduct E-Money
  member.balanceEMoney = currentEMoney - amt;

  // Calculation Breakdown according to official system formula
  const autoReserve = amt * 0.20; // 20% Auto-Reserve
  const taxableAmount = amt * 0.80; // 80% Tax base
  const withholdingTax = taxableAmount * 0.03; // 3% WHT on 80% base = 2.4% of gross
  const companyFee = taxableAmount * 0.02; // 2% Platform fee on 80% base = 1.6% of gross
  const transferFee = 25; // 25 THB bank transfer fee
  const netReceived = Math.max(0, taxableAmount - withholdingTax - companyFee - transferFee); // 76% - 25 THB

  // Recalculate Eligible Rights
  recalculateMemberEligibleRights(db, member);

  // Record Transaction
  if (!Array.isArray(db.transactions)) db.transactions = [];
  const txnId = "WD_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5).toUpperCase();
  db.transactions.push({
    id: txnId,
    userId: member.userId,
    type: "Withdraw",
    amount: amt,
    currency: "E-Money",
    netAmount: netReceived,
    autoReserve,
    taxableAmount,
    withholdingTax,
    companyFee,
    transferFee,
    bankName: member.bankName || member.kycBankName || "-",
    bankAccount: member.bankAccount || member.kycBankAccount || "-",
    details: `ถอนรายได้ E-Money เข้าบัญชีธนาคาร ฿${amt.toLocaleString()} (ยอดรับสุทธิ ฿${netReceived.toFixed(2)} หักสำรองระบบ 20%, ภาษี 3%, ค่าบริการ 2%, ค่าโอน 25 บ.)`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  sendSystemNotification('withdrawal', `🔔 สมาชิก ${member.name} (${member.userId}) แจ้งถอนเงิน ฿${amt.toLocaleString()} เข้าธนาคาร ${member.bankName} เลขที่ ${member.bankAccount}`);

  return res.json({
    success: true,
    message: `ส่งคำขอถอนเงินรายได้ ฿${amt.toLocaleString()} เรียบร้อยแล้วค่ะ ยอดเข้าบัญชีสุทธิ ฿${netReceived.toFixed(2)}`,
    netReceived
  });
});

app.post('/api/member/topup', (req, res) => {
  const { userId, amount, transferAmount, transferDate, slipFile } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุข้อมูลการเติมเงิน' });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบสมาชิก' });
  }

  const topupAmt = parseFloat(amount);
  if (!Array.isArray(db.transactions)) db.transactions = [];
  const txnId = "DEP_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5).toUpperCase();

  db.transactions.push({
    id: txnId,
    userId: member.userId,
    type: "Deposit",
    amount: topupAmt,
    currency: "E-Cash",
    slipUrl: slipFile || "",
    transferDate: transferDate || new Date().toISOString(),
    details: `แจ้งเติมเงิน E-Cash จำนวน ฿${topupAmt.toLocaleString()}`,
    status: "Pending",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return res.json({
    success: true,
    isAutoApproved: false,
    message: 'ส่งหลักฐานสลิปเรียบร้อยแล้วค่ะ รอการตรวจสอบและอนุมัติยอด E-Cash จากแอดมินหลังบ้าน!'
  });
});

app.post('/api/member/buy-coupon', (req, res) => {
  const { userId, amount, pin } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: 'ไม่พบสมาชิก' });

  if (member.pin && pin && pin !== member.pin) {
    return res.status(400).json({ success: false, message: 'รหัส PIN ไม่ถูกต้องค่ะ' });
  }

  const amt = parseFloat(amount);
  const currentCash = Number(member.balanceECash || 0);
  if (currentCash < amt) {
    return res.status(400).json({ success: false, message: 'ยอด E-Cash ไม่เพียงพอ' });
  }

  member.balanceECash = currentCash - amt;
  member.balanceECoupon = Number(member.balanceECoupon || 0) + amt;

  if (!Array.isArray(db.transactions)) db.transactions = [];
  db.transactions.push({
    id: "CPN_" + Date.now(),
    userId: member.userId,
    type: "BuyCoupon",
    amount: amt,
    currency: "E-Coupon",
    details: `แลกเปลี่ยน E-Cash เป็น E-Coupon จำนวน ${amt.toLocaleString()} คูปอง`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return res.json({
    success: true,
    newECoupon: member.balanceECoupon,
    message: `แลกคูปองช้อปปิ้งสำเร็จ! รับสิทธิ์คงเหลือ ${member.balanceECoupon} คูปอง`
  });
});

app.post('/api/member/verify-recipient', (req, res) => {
  const { receiverPhoneOrUser, senderId } = req.body;
  const db = readDb();
  const target = (receiverPhoneOrUser || '').trim().toLowerCase();
  
  const recipient = (db.members || []).find((m: any) => 
    (m.userId && m.userId.toLowerCase() === target) ||
    (m.username && m.username.toLowerCase() === target) ||
    (m.phone && m.phone === target)
  );

  if (!recipient) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสมาชิกผู้รับปลายทาง' });
  }

  if (recipient.userId === senderId) {
    return res.status(400).json({ success: false, message: 'ไม่สามารถโอนเงินให้บัญชีของตัวเองได้ค่ะ' });
  }

  return res.json({
    success: true,
    recipient: {
      userId: recipient.userId,
      username: recipient.username,
      name: `${recipient.name} ${recipient.surname}`,
      phone: recipient.phone
    }
  });
});

app.post('/api/member/transfer-e-cash', (req, res) => {
  const { senderId, receiverPhoneOrUser, amount, pin } = req.body;
  const db = readDb();
  const sender = (db.members || []).find((m: any) => m.userId === senderId || m.username === senderId);
  if (!sender) return res.status(404).json({ success: false, message: 'ไม่พบผู้ส่ง' });

  if (sender.pin && pin && pin !== sender.pin) {
    return res.status(400).json({ success: false, message: 'รหัส PIN ไม่ถูกต้องค่ะ' });
  }

  const target = (receiverPhoneOrUser || '').trim().toLowerCase();
  const receiver = (db.members || []).find((m: any) => 
    (m.userId && m.userId.toLowerCase() === target) ||
    (m.username && m.username.toLowerCase() === target) ||
    (m.phone && m.phone === target)
  );
  if (!receiver) return res.status(404).json({ success: false, message: 'ไม่พบสมาชิกผู้รับปลายทาง' });

  const amt = parseFloat(amount);
  const senderCash = Number(sender.balanceECash || 0);
  if (senderCash < amt) {
    return res.status(400).json({ success: false, message: 'ยอดเงิน E-Cash ของคุณไม่เพียงพอ' });
  }

  sender.balanceECash = senderCash - amt;
  receiver.balanceECash = Number(receiver.balanceECash || 0) + amt;

  if (!Array.isArray(db.transactions)) db.transactions = [];
  db.transactions.push({
    id: "TX_OUT_" + Date.now(),
    userId: sender.userId,
    type: "Transfer",
    amount: amt,
    currency: "E-Cash",
    details: `โอน E-Cash ให้สมาชิก ${receiver.name} (${receiver.userId})`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });
  db.transactions.push({
    id: "TX_IN_" + Date.now(),
    userId: receiver.userId,
    type: "Receive",
    amount: amt,
    currency: "E-Cash",
    details: `ได้รับโอน E-Cash จากสมาชิก ${sender.name} (${sender.userId})`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return res.json({ success: true, message: `โอนเงิน E-Cash จำนวน ฿${amt.toLocaleString()} ให้ ${receiver.name} สำเร็จแล้วค่ะ` });
});

app.post('/api/member/transfer-ecash-to-emoney', (req, res) => {
  const { userId, amount, pin } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: 'ไม่พบสมาชิก' });

  if (member.pin && pin && pin !== member.pin) {
    return res.status(400).json({ success: false, message: 'รหัส PIN ไม่ถูกต้องค่ะ' });
  }

  const amt = parseFloat(amount);
  const currentCash = Number(member.balanceECash || 0);
  if (currentCash < amt) return res.status(400).json({ success: false, message: 'ยอด E-Cash ไม่เพียงพอ' });

  const fee = amt * 0.10; // 10% All-Share allocation fee
  const net = amt - fee;

  member.balanceECash = currentCash - amt;
  member.balanceEMoney = Number(member.balanceEMoney || 0) + net;

  if (!Array.isArray(db.transactions)) db.transactions = [];
  db.transactions.push({
    id: "CVT_" + Date.now(),
    userId: member.userId,
    type: "Transfer",
    amount: amt,
    netAmount: net,
    currency: "E-Money",
    details: `โยกย้าย E-Cash เข้า E-Money ฿${amt.toLocaleString()} (หักธรรมเนียมจัดสรร All-Share 10% ยอดสุทธิ ฿${net.toLocaleString()})`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return res.json({ success: true, message: `โยกย้ายเงินเข้ากระเป๋า E-Money สำเร็จแล้วค่ะ (รับสุทธิ ฿${net.toLocaleString()})` });
});

app.post('/api/member/transfer-emoney-to-ecash', (req, res) => {
  const { userId, amount, pin } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: 'ไม่พบสมาชิก' });

  if (member.pin && pin && pin !== member.pin) {
    return res.status(400).json({ success: false, message: 'รหัส PIN ไม่ถูกต้องค่ะ' });
  }

  const amt = parseFloat(amount);
  const currentEMoney = Number(member.balanceEMoney || 0);
  if (currentEMoney < amt) return res.status(400).json({ success: false, message: 'ยอด E-Money ไม่เพียงพอ' });

  member.balanceEMoney = currentEMoney - amt;
  member.balanceECash = Number(member.balanceECash || 0) + amt;

  recalculateMemberEligibleRights(db, member);

  if (!Array.isArray(db.transactions)) db.transactions = [];
  db.transactions.push({
    id: "CVT2_" + Date.now(),
    userId: member.userId,
    type: "Transfer",
    amount: amt,
    currency: "E-Cash",
    details: `โยกย้าย E-Money เข้ากระเป๋า E-Cash ฿${amt.toLocaleString()} (ไม่มีค่าธรรมเนียม)`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return res.json({ success: true, message: `โยกย้ายเงิน E-Money เข้ากระเป๋า E-Cash ฿${amt.toLocaleString()} สำเร็จแล้วค่ะ` });
});

app.post('/api/member/transfer-emoney-to-ecoupon', (req, res) => {
  const { userId, amount, pin } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: 'ไม่พบสมาชิก' });

  if (member.pin && pin && pin !== member.pin) {
    return res.status(400).json({ success: false, message: 'รหัส PIN ไม่ถูกต้องค่ะ' });
  }

  const amt = parseFloat(amount);
  const currentEMoney = Number(member.balanceEMoney || 0);
  if (currentEMoney < amt) return res.status(400).json({ success: false, message: 'ยอด E-Money ไม่เพียงพอ' });

  member.balanceEMoney = currentEMoney - amt;
  member.balanceECoupon = Number(member.balanceECoupon || 0) + amt;

  recalculateMemberEligibleRights(db, member);

  if (!Array.isArray(db.transactions)) db.transactions = [];
  db.transactions.push({
    id: "CVT3_" + Date.now(),
    userId: member.userId,
    type: "Transfer",
    amount: amt,
    currency: "E-Coupon",
    details: `โยกย้าย E-Money เป็น E-Coupon ${amt.toLocaleString()} คูปอง (ไม่มีค่าธรรมเนียม)`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return res.json({ success: true, message: `โยกย้ายเงิน E-Money เป็น E-Coupon จำนวน ${amt.toLocaleString()} คูปอง สำเร็จแล้วค่ะ` });
});

// MEMBER & ORDERS ENDPOINTS
app.get('/api/member/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const orders = (db.orders || []).filter((o: any) => o.userId === userId);
  return res.json({ success: true, orders });
});

app.get('/api/seller/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const orders = (db.orders || []).filter((o: any) => o.sellerId === userId);
  return res.json({ success: true, orders });
});

app.get('/api/admin/orders', (req, res) => {
  const db = readDb();
  return res.json({ success: true, orders: db.orders || [] });
});

app.get('/api/admin/stats', (req, res) => {
  const db = readDb();
  return res.json({ success: true, stats: db.systemStats || {} });
});

app.get('/api/bank-settings', (req, res) => {
  const db = readDb();
  return res.json({ success: true, bankSettings: db.bankSettings || {} });
});

app.post('/api/bank-settings', (req, res) => {
  const db = readDb();
  db.bankSettings = req.body;
  writeDb(db);
  return res.json({ success: true, message: 'บันทึกข้อมูลบัญชีธนาคารเรียบร้อยแล้วค่ะ' });
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

// REQUEST MANAGER OTP (For Admin sensitive actions)
app.post('/api/admin/request-manager-otp', async (req, res) => {
  const { adminUserId } = req.body;
  const db = readDb();
  
  // Verify request is from Admin
  const admin = db.members.find(m => m.userId === adminUserId);
  if (!admin || admin.role !== 'Admin') {
    return res.status(403).json({ success: false, message: "ปฏิเสธการเข้าถึง: เฉพาะบัญชีสิทธิ์ Admin เท่านั้นที่มีสิทธิ์ขอ OTP อนุมัติได้ค่ะ" });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) db.otps = {};
  db.otps['MANAGER_APPROVAL_OTP'] = otpCode;
  
  writeDb(db);

  // Send to Manager account(s) or admin
  const managers = db.members.filter(m => m.role === 'Manager' && m.email && m.email.includes('@'));
  const targetEmail = managers.length > 0 ? managers[0].email : admin.email;

  if (targetEmail && targetEmail.includes('@')) {
    sendSystemEmail({
      to: targetEmail,
      subject: '[Natee Plus Admin] รหัส OTP อนุมัติการแก้ไขข้อมูล (Manager Approval)',
      title: 'รหัส OTP อนุมัติการแก้ไขข้อมูลสำคัญโดย Admin',
      otpCode: otpCode,
      bodyText: "แจ้งเตือนสิทธิ์ผู้จัดการ (Manager): แอดมิน " + (admin.name || admin.username) + " ได้ขอรหัส OTP เพื่ออนุมัติรายการแก้ไขข้อมูลในระบบ"
    }).catch(err => console.error("Async email error:", err));
  }
  
  res.json({
    success: true,
    otpSimulated: otpCode,
    message: "ส่งรหัส OTP อนุมัติ 6 หลักไปยังอีเมลผู้จัดการ (" + (targetEmail || 'Manager') + ") เรียบร้อยแล้วค่ะ"
  });
});

// UPDATE MEMBER INFO FROM ADMIN CONSOLE
app.post('/api/admin/member-update', (req, res) => {
  const { 
    userId, name, surname, phone, email, idCard, 
    bankName, bankAccount, bankAccountName, password, pin, 
    rank, role, balanceECash, balanceEMoney, balanceECoupon, sellerStatus, eligibleRights,
    sponsorId,
    username,
    parentId,
    side,
    planBPoints,
    editorUserId,
    otp
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

  // Sensitive changes validation for Admin role requiring Manager OTP
  if (editor.role === 'Admin') {
    const hasFinancialChange = 
      (balanceECash !== undefined && Number(balanceECash) !== Number(member.balanceECash || 0)) ||
      (balanceEMoney !== undefined && Number(balanceEMoney) !== Number(member.balanceEMoney || 0)) ||
      (balanceECoupon !== undefined && Number(balanceECoupon) !== Number(member.balanceECoupon || 0)) ||
      (eligibleRights !== undefined && Number(eligibleRights) !== Number(member.eligibleRights || 0)) ||
      (planBPoints !== undefined && Number(planBPoints) !== Number(member.planBPoints || 0));

    const hasNameChange = 
      (name !== undefined && name !== member.name) ||
      (surname !== undefined && surname !== member.surname);

    const hasIdCardChange = 
      (idCard !== undefined && idCard !== member.idCard);

    const hasBankChange = 
      (bankName !== undefined && bankName !== member.bankName) ||
      (bankAccount !== undefined && bankAccount !== member.bankAccount) ||
      (bankAccountName !== undefined && bankAccountName !== member.bankAccountName);

    const isSensitiveChange = hasFinancialChange || hasNameChange || hasIdCardChange || hasBankChange;

    if (isSensitiveChange) {
      const activeOtp = db.otps ? db.otps['MANAGER_APPROVAL_OTP'] : null;
      if (!otp || otp !== activeOtp) {
        return res.status(400).json({ 
          success: false, 
          requiresManagerOtp: true, 
          message: "⚠️ การแก้ไขข้อมูลสำคัญโดยสิทธิ์ Admin จำเป็นต้องยืนยันรหัส OTP อนุมัติจาก Manager" 
        });
      }
      // OTP verified successfully, clear it
      delete db.otps['MANAGER_APPROVAL_OTP'];
    }
  }

  // Validate username if changed
  if (username !== undefined && username.toLowerCase().trim() !== member.username.toLowerCase()) {
    const uClean = username.toLowerCase().trim();
    if (uClean.length < 4) {
      return res.status(400).json({ success: false, message: "ชื่อผู้ใช้ (Username) ต้องมีความยาวอย่างน้อย 4 ตัวอักษรค่ะ" });
    }
    const existing = db.members.find(m => m.username.toLowerCase() === uClean && m.userId !== userId);
    if (existing) {
      return res.status(400).json({ success: false, message: "ชื่อผู้ใช้ \"" + (uClean) + "\" นี้ถูกใช้งานไปแล้วโดยสมาชิกท่านอื่นในระบบ" });
    }
    member.username = uClean;
  }

  // Validate sponsorId existence if updated
  if (sponsorId !== undefined && sponsorId !== "" && sponsorId !== "SYSTEM" && sponsorId !== member.sponsorId) {
    const sponsorExists = db.members.some(m => m.userId === sponsorId);
    if (!sponsorExists) {
      return res.status(400).json({ success: false, message: "ไม่พบรหัสผู้แนะนำ \"" + (sponsorId) + "\" ในระบบ กรุณาตรวจสอบให้ถูกต้องค่ะ" });
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

  // 3. Validate financial balance / point adjustments: strictly restricted to Manager level or root admin
  const isBalanceModified = balanceECash !== undefined || balanceEMoney !== undefined || balanceECoupon !== undefined || planBPoints !== undefined || eligibleRights !== undefined;
  if (isBalanceModified) {
    const editor = db.members.find((m: any) => m.userId === editorUserId || m.username === editorUserId);
    const isSpecialAdmin = editorUserId === 'admin' || editorUserId === 'ADMIN001' || editorUserId === 'A260001' || (typeof editorUserId === 'string' && editorUserId.toLowerCase().startsWith('admin'));
    const isManager = (editor?.role || '').toUpperCase() === 'MANAGER' || isSpecialAdmin || editor?.username === 'nateeplus';
    if (!isManager) {
      return res.status(403).json({
        success: false,
        message: "สิทธิ์การปรับแก้กระเป๋าเงิน (E-Cash, E-Money, E-Coupon) หรือคะแนนของสมาชิก ถูกสงวนไว้เฉพาะสิทธิ์ระดับ Manager เท่านั้นค่ะ"
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
        details: "ผู้ดูแลระบบปรับปรุงยอด E-Cash (จาก ฿" + (prev.toFixed(2)) + " เป็น ฿" + (curr.toFixed(2)) + ")",
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
        details: "ผู้ดูแลระบบปรับปรุงยอด E-Money (จาก ฿" + (prev.toFixed(2)) + " เป็น ฿" + (curr.toFixed(2)) + ")",
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
        details: "ผู้ดูแลระบบปรับปรุงยอด E-Coupon (จาก ฿" + (prev.toFixed(2)) + " เป็น ฿" + (curr.toFixed(2)) + ")",
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }
  }
  if (sellerStatus !== undefined) member.sellerStatus = sellerStatus;
  if (eligibleRights !== undefined) member.eligibleRights = Number(eligibleRights);
  if (parentId !== undefined) member.parentId = parentId;
  if (side !== undefined) member.side = side;
  if (planBPoints !== undefined) member.planBPoints = Number(planBPoints);

  writeDb(db);
  res.json({ success: true, message: "แก้ไขข้อมูลสมาชิก " + (member.username) + " สำเร็จเรียบร้อยแล้ว" });
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
        name: "บริษัท นที พลัส มาร์เก็ต",
        surname: "จำกัด",
        phone: "0635161734",
        idCard: "0-30556-9007-93-5",
        email: "nateeplus@gmail.com",
        bankName: "",
        bankAccount: "",
        bankAccountName: "บริษัท นที พลัส มาร์เก็ต จำกัด",
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
        member.name = "บริษัท นที พลัส มาร์เก็ต";
        member.surname = "จำกัด";
        member.phone = "0635161734";
        member.idCard = "0-30556-9007-93-5";
        member.email = "nateeplus@gmail.com";
        member.bankName = "";
        member.bankAccount = "";
        member.bankAccountName = "บริษัท นที พลัส มาร์เก็ต จำกัด";
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

  isDatabaseLoadedFromFirestore = true;
  writeDb(db);

  res.json({
    success: true,
    message: "ระบบ NaTee Plus ได้รับการรีเซ็ตเป็นค่าเริ่มต้นเรียบร้อยแล้วค่ะ สมาชิกจำลองและประวัติธุรกรรมทั้งหมดถูกลบ สแตนด์บายพร้อมรับสมาชิกลงทะเบียนและรับเงินจริงได้ทันที!"
  });
});

// FORCE RE-SYNC FROM FIRESTORE (FOR INSTANCE SYNC IN CLOUD RUN MULTI-INSTANCE ENV)
app.post('/api/admin/sync-firestore', async (req, res) => {
  try {
    isFirestoreQuotaExceeded = false; // Reset quota flag to attempt writing/reading again
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

// ==========================================
// AI CHATBOT & KNOWLEDGE BASE ENDPOINTS (Gemini 2.5 Flash Free Tier)
// ==========================================
const GEMINI_MODEL = 'gemini-2.5-flash';

function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("⚠️ Failed to initialize GoogleGenAI:", err);
    return null;
  }
}

// GET BOT CONFIG
app.get('/api/ai/bot-config', (req, res) => {
  const db = readDb();
  const botConfig = db.bankSettings?.botConfig || {};
  
  const defaultConfig = {
    enabled: true,
    botName: "Natee bot",
    greetingMsg: "สวัสดีค่ะ! หนูคือ Natee bot ผู้ช่วยประจำระบบ Natee Plus Market ยินดีให้คำแนะนำและตอบทุกข้อสงสัยเกี่ยวกับระบบค่ะ 🤖✨",
    systemPrompt: "คุณคือ Natee bot ผู้ช่วยเสมือนประจำระบบ Natee Plus Market ให้ตอบคำถามเกี่ยวกับระบบ Natee Plus ด้วยความสุภาพ เป็นมิตร และให้ข้อมูลถูกต้อง ห้ามตอบเรื่องที่ไม่เกี่ยวกับระบบ หรือถ้าไม่แน่ใจให้แนะนำติดต่อแอดมิน",
    knowledgeBaseText: botConfig.knowledgeBaseText || `
ระบบ Natee Plus Market (นที พลัส มาร์เก็ต):
- เป็นแพลตฟอร์มมาร์เก็ตเพลสช้อปปิ้งออนไลน์และเครือข่ายธุรกิจ
- สมาชิกมีกระเป๋าเงิน: E-Cash (เงินสดใช้ซื้อ/ถอน/โอน), E-Coupon (คูปองส่วนลด), E-Share (หุ้น/ปันผล), E-Money (โบนัสสะสม)
- การสมัครแพ็กเกจและตำแหน่งตามคะแนน PV:
  • Member 100 บาท (0 PV)
  • S 100 บาท (0 PV)
  • M 500 บาท (250 PV)
  • L 1,000 บาท (500 PV)
  • XL 3,000 บาท (1,000 PV)
  • XXL 5,000 บาท (2,500 PV)
- การฝากเงิน: แนบสลิปผ่านระบบ Admin ตรวจสอบอนุมัติเข้า E-Cash
- การถอนเงิน: ยื่นคำขอถอนเงินเข้าบัญชีธนาคาร ใช้รหัส OTP ยืนยันทางอีเมล
- การเปิดร้านค้า: สมาชิกยื่นเปิดร้านค้าและลงสินค้า เมื่อแอดมินอนุมัติจะวางขายในมาร์เก็ตเพลส
- สิทธิ์คงเหลือ (Eligible Rights): คำนวณจากสิทธิ์โบนัสตามแพ็กเกจ หักด้วย E-Money ที่ได้รับแล้ว
`,
    knowledgeFiles: botConfig.knowledgeFiles || [],
    quickQuestions: botConfig.quickQuestions || [
      "นที พลัส มาร์เก็ต คืออะไร?",
      "วิธีสมัครแพ็กเกจ และคะแนน PV",
      "วิธีเปิดร้านค้าขายของในระบบ",
      "การฝากเงิน ถอนเงิน และสิทธิ์คงเหลือ"
    ]
  };

  res.json({
    success: true,
    botConfig: {
      ...defaultConfig,
      ...botConfig
    }
  });
});

// SAVE BOT CONFIG
app.post('/api/admin/bot-config', (req, res) => {
  const { enabled, botName, greetingMsg, systemPrompt, knowledgeBaseText, quickQuestions } = req.body;
  const db = readDb();
  if (!db.bankSettings) db.bankSettings = {};
  
  db.bankSettings.botConfig = {
    ...(db.bankSettings.botConfig || {}),
    enabled: enabled !== undefined ? !!enabled : true,
    botName: botName || "Natee bot",
    greetingMsg: greetingMsg || "สวัสดีค่ะ! หนูคือ Natee bot ผู้ช่วยประจำระบบ Natee Plus Market ยินดีให้คำแนะนำและตอบทุกข้อสงสัยเกี่ยวกับระบบค่ะ 🤖✨",
    systemPrompt: systemPrompt || "",
    knowledgeBaseText: knowledgeBaseText || "",
    quickQuestions: Array.isArray(quickQuestions) ? quickQuestions : (db.bankSettings.botConfig?.quickQuestions || []),
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  res.json({
    success: true,
    message: "บันทึกการตั้งค่า AI Chatbot เรียบร้อยแล้วค่ะ",
    botConfig: db.bankSettings.botConfig
  });
});

// UPLOAD PDF KNOWLEDGE FOR BOT
app.post('/api/admin/upload-bot-pdf', async (req, res) => {
  const { pdfFile, fileName } = req.body;
  if (!pdfFile) return res.status(400).json({ success: false, message: "ไม่พบบันทึกไฟล์ PDF" });

  try {
    const base64Data = pdfFile.replace(/^data:application\/pdf;base64,/, "");
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    let extractedText = "";
    try {
      const pdfParser = new PDFParse({ data: pdfBuffer });
      const parsed = await pdfParser.load();
      extractedText = parsed.text || "";
    } catch (parseErr) {
      console.warn("PDFParse load failed, trying direct text extract:", parseErr);
      extractedText = pdfBuffer.toString('utf8').replace(/[^\x20-\x7E\u0E00-\u0E7F]/g, " ");
    }

    const db = readDb();
    if (!db.bankSettings) db.bankSettings = {};
    if (!db.bankSettings.botConfig) db.bankSettings.botConfig = {};

    const currentKnowledge = db.bankSettings.botConfig.knowledgeBaseText || "";
    const updatedKnowledge = currentKnowledge + "\n\n--- เอกสารนำเข้า: " + (fileName || 'PDF') + " ---\n" + extractedText.trim();
    
    const existingFiles = db.bankSettings.botConfig.knowledgeFiles || [];
    existingFiles.push({
      id: 'pdf_' + Date.now(),
      fileName: fileName || 'document.pdf',
      uploadedAt: new Date().toISOString(),
      charCount: extractedText.length
    });

    db.bankSettings.botConfig.knowledgeBaseText = updatedKnowledge;
    db.bankSettings.botConfig.knowledgeFiles = existingFiles;

    writeDb(db);

    res.json({
      success: true,
      message: `นำเข้าข้อมูลจากไฟล์ PDF (${fileName}) สำเร็จเรียบร้อยแล้วค่ะ (อ่านข้อความได้ ${extractedText.length} ตัวอักษร)`,
      botConfig: db.bankSettings.botConfig
    });
  } catch (err: any) {
    console.error("PDF upload error:", err);
    res.status(500).json({ success: false, message: "ไม่สามารถประมวลผลไฟล์ PDF ได้: " + err.message });
  }
});

// AI CHAT ENDPOINT (Gemini 2.5 Flash Free Tier)
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "กรุณาระบุข้อความคำถาม" });
  }

  const userQuery = message.trim();
  const db = readDb();
  const botConfig = db.bankSettings?.botConfig || {};

  const systemInstruction = (botConfig.systemPrompt || "คุณคือ Natee bot ผู้ช่วยอัจฉริยะประจำระบบ Natee Plus Market ตอบคำถามสมาชิกอย่างสุภาพ น่ารัก และอิงจากข้อมูลระบบ Natee Plus เท่านั้น") +
    "\n\n[คลังความรู้ระบบ Natee Plus Market]:\n" + (botConfig.knowledgeBaseText || `
ระบบ Natee Plus Market (นที พลัส มาร์เก็ต):
- มาร์เก็ตเพลสช้อปปิ้งออนไลน์และสร้างรายได้
- กระเป๋าเงิน: E-Cash, E-Coupon, E-Share, E-Money
- ตำแหน่งและการสมัครแพ็กเกจ PV: Member 100 บาท (0 PV), S 100 บาท (0 PV), M 500 บาท (250 PV), L 1,000 บาท (500 PV), XL 3,000 บาท (1,000 PV), XXL 5,000 บาท (2,500 PV)
- การฝาก-ถอนเงิน: ฝากผ่านแอดมิน ถอนใส่บัญชีธนาคารและยืนยัน OTP ทางอีเมล
- การเปิดร้านค้า: สมัครผู้ขาย ลงสินค้า ให้แอดมินอนุมัติ
`);

  // Attempt to call Gemini 2.5 Flash
  const ai = getGeminiAI();
  if (ai) {
    try {
      console.log(`🤖 Calling Gemini 2.5 Flash API for query: "${userQuery.substring(0, 30)}..."`);
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: `คำถามจากสมาชิก: "${userQuery}"\nกรุณาตอบสั้น กระชับ สุภาพ ภาษาไทย` }]
          }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.5,
          maxOutputTokens: 1000
        }
      });

      if (response && response.text) {
        return res.json({
          success: true,
          reply: response.text,
          modelUsed: GEMINI_MODEL,
          isMock: false
        });
      }
    } catch (err: any) {
      console.warn("⚠️ Gemini 2.5 Flash API call failed or quota exceeded. Switching to Smart Fallback:", err.message || err);
    }
  }

  // Smart Rule-Based Fallback using Knowledge Base
  let fallbackReply = "";
  const lowerQ = userQuery.toLowerCase();

  if (lowerQ.includes("นที พลัส") || lowerQ.includes("คืออะไร") || lowerQ.includes("เกี่ยวกับ")) {
    fallbackReply = "Natee Plus Market (นที พลัส มาร์เก็ต) คือแพลตฟอร์มช้อปปิ้งมาร์เก็ตเพลสออนไลน์และระบบขยายเครือข่ายธุรกิจที่เปิดโอกาสให้สมาชิกสามารถซื้อสินค้า สะสมคะแนน PV เปิดร้านค้าขายของ และสร้างรายได้จากโบนัสได้อย่างถูกต้องและปลอดภัยค่ะ ✨";
  } else if (lowerQ.includes("สมัคร") || lowerQ.includes("แพ็กเกจ") || lowerQ.includes("pv") || lowerQ.includes("ตำแหน่ง")) {
    fallbackReply = "การสมัครแพ็กเกจในระบบ Natee Plus Market แบ่งเป็นตำแหน่งตามราคาและคะแนน PV ดังนี้ค่ะ:\n- Member 100 บาท (0 PV)\n- S 100 บาท (0 PV)\n- M 500 บาท (250 PV)\n- L 1,000 บาท (500 PV)\n- XL 3,000 บาท (1,000 PV)\n- XXL 5,000 บาท (2,500 PV)\nสามารถสั่งซื้อสินค้าหรือซื้อแพ็กเกจสำเร็จรูปเพื่อรับสิทธิ์ปันผลโบนัสและขยายธุรกิจได้ทันทีค่ะ 🛍️";
  } else if (lowerQ.includes("เปิดร้าน") || lowerQ.includes("ขายของ") || lowerQ.includes("ร้านค้า") || lowerQ.includes("ผู้ขาย")) {
    fallbackReply = "การเปิดร้านค้าขายของในระบบ Natee Plus Market:\n1. เข้าไปที่เมนู 'ร้านค้าของฉัน' หรือ 'สมัครเป็นผู้ขาย'\n2. กรอกข้อมูลร้านค้าและแนบรูปภาพสินค้าส่งขออนุมัติ\n3. เมื่อแอดมินอนุมัติ สินค้าของท่านจะขึ้นแสดงในตลาดมาร์เก็ตเพลสทันทีค่ะ 🏪";
  } else if (lowerQ.includes("ฝากเงิน") || lowerQ.includes("ถอนเงิน") || lowerQ.includes("สิทธิ์") || lowerQ.includes("โอน") || lowerQ.includes("otp")) {
    fallbackReply = "ระบบการฝาก-ถอนเงินใน Natee Plus Market:\n- ฝากเงิน: แนบหลักฐานสลิปการโอนเงินเพื่อเติมยอด E-Cash\n- ถอนเงิน: ระบุยอดที่ต้องการถอน พร้อมกรอกรหัส OTP 6 หลักที่ได้รับทางอีเมล\n- สิทธิ์คงเหลือ (Eligible Rights): คำนวณจากสิทธิ์โบนัสตามแพ็กเกจหักด้วยรายได้ที่ถอนหรือรับแล้วค่ะ 💳";
  } else {
    fallbackReply = `Natee bot ยินดีให้บริการค่ะ! สำหรับคำถามเกี่ยวกับ "${userQuery}" หนูขอแนะนำดังนี้นะคะ:\n\n1. สามารถสอบถามเรื่องแพ็กเกจ PV, การเปิดร้านค้า, หรือการฝาก-ถอนเงินได้ค่ะ\n2. หากต้องการติดต่อเจ้าหน้าที่โดยตรง สามารถแจ้งผ่านระบบแจ้งปัญหาหรือติดต่อผู้ดูแลระบบได้เลยค่ะ 🤖✨`;
  }

  return res.json({
    success: true,
    reply: fallbackReply,
    modelUsed: "KnowledgeBase-Fallback",
    isMock: true
  });
});

// REFINE DESCRIPTION API (Gemini 2.5 Flash Free Tier)
app.post('/api/ai/refine-description', async (req, res) => {
  const { text, category } = req.body;
  if (!text) return res.status(400).json({ success: false, message: "ไม่พบข้อความ" });

  const ai = getGeminiAI();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{
              text: `กรุณาปรับแต่งและขัดเกลาคำอธิบายสินค้า/แพ็กเกจต่อไปนี้ ให้ดูน่าสนใจ น่าซื้อ เป็นมืออาชีพ และอ่านง่าย (หมวดหมู่: ${category || 'ทั่วไป'})\n\nข้อความเดิม:\n"${text}"`
            }]
          }
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      });

      if (response && response.text) {
        return res.json({ success: true, refinedText: response.text.trim() });
      }
    } catch (err: any) {
      console.warn("Refine description AI error:", err.message);
    }
  }

  // Fallback if AI fails
  return res.json({
    success: true,
    refinedText: text.trim() + "\n\n✨ (สินค้าคุณภาพรับประกันโดย Natee Plus Market)"
  });
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

  const isProd = process.env.NODE_ENV === 'production' || 
                 (typeof __filename !== 'undefined' && __filename.endsWith('.cjs'));

  if (!isProd) {
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
    
    console.log("📁 Resolved dist path for static serving: " + (distPath));
    app.use(express.static(distPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else if (filePath.includes('/assets/') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
          res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        }
      }
    }));

    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log("NaTee Plus full-stack server is listening on port " + (PORT));
  });
}

startServer();
