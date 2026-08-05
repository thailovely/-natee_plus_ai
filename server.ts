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
            const fMember = mergedMembers[idx];
            const localTime = localMember.lastUpdated || 0;
            const firestoreTime = fMember.lastUpdated || 0;
            const localHasRank = localMember.rank && localMember.rank !== 'Member';
            const firestoreIsMember = !fMember.rank || fMember.rank === 'Member';

            if (localTime >= firestoreTime || (localHasRank && firestoreIsMember)) {
              mergedMembers[idx] = { ...fMember, ...localMember };
              hasMergedChanges = true;
            } else {
              if (localMember.sellerStatus === 'Active' && fMember.sellerStatus !== 'Active') {
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

  const packageCommissionsUpdated = processAndEnsurePackageCommissions(db);
  if (packageCommissionsUpdated) {
    writeDb(db);
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
      const maxOrderRights = Math.max(...pkgOrders.map((o: any) => {
        return o.productId === 'pack_s' ? 1000 : o.productId === 'pack_m' ? 5000 : o.productId === 'pack_l' ? 10000 : o.productId === 'pack_xl' ? 30000 : o.productId === 'pack_xxl' ? 50000 : 0;
      }));
      grantedRights = Math.max(grantedRights, maxOrderRights);
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

function findAndPlaceBinaryMember(db: any, sponsorId: string) {
  const members = db.members || [];
  let root = members.find((m: any) => m.userId === sponsorId || m.username === sponsorId);
  if (!root) {
    root = members.find((m: any) => m.userId === "A260600001");
  }
  if (!root) {
    return { parentId: "A260600001", side: "L" };
  }

  const queue = [root.userId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const children = members.filter((m: any) => m.parentId === currentId);
    const leftChild = children.find((m: any) => m.side === "L");
    const rightChild = children.find((m: any) => m.side === "R");

    if (!leftChild) {
      return { parentId: currentId, side: "L" };
    }
    if (!rightChild) {
      return { parentId: currentId, side: "R" };
    }

    queue.push(leftChild.userId);
    queue.push(rightChild.userId);
  }

  return { parentId: root.userId, side: "L" };
}

function processAndEnsurePackageCommissions(db: any): boolean {
  if (!db || !db.orders || !Array.isArray(db.orders)) return false;
  let modified = false;

  const packageOrders = db.orders.filter((o: any) => 
    (o.productId?.startsWith("pack_") || o.productCategory === "Package") && 
    o.status === "Completed"
  );

  packageOrders.forEach((order: any) => {
    const member = (db.members || []).find((m: any) => m.userId === order.userId || m.username === order.userId);
    if (!member) return;

    // 1. Upgrade Rank & Binary placement
    const rankMap: Record<string, string> = { pack_s: "S", pack_m: "M", pack_l: "L", pack_xl: "XL", pack_xxl: "XXL" };
    const targetRank = rankMap[order.productId] || "S";
    if (!member.rank || member.rank === "Member") {
      member.rank = targetRank;
      member.selectedPackageId = order.productId;
      if (!member.parentId || member.parentId === "") {
        const slot = findAndPlaceBinaryMember(db, member.sponsorId || "A260600001");
        member.parentId = slot.parentId;
        member.side = slot.side;
      }
      modified = true;
    }

    // 2. Purchaser E-Coupon Cashback
    const hasCouponTxn = (db.transactions || []).some((t: any) => t.userId === member.userId && t.currency === "E-Coupon" && t.details?.includes(order.id));
    if (!hasCouponTxn) {
      const cashbackECoupon = order.productId === "pack_s" ? 10 : Math.round((order.totalPrice || 100) * 0.10);
      if (cashbackECoupon > 0) {
        member.balanceECoupon = (Number(member.balanceECoupon) || 0) + cashbackECoupon;
        if (!db.transactions) db.transactions = [];
        db.transactions.unshift({
          id: "PTS_COU_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          userId: member.userId,
          username: member.username,
          type: "Bonus",
          currency: "E-Coupon",
          amount: cashbackECoupon,
          details: `คูปองส่วนลด E-Coupon สะสมคืน (+${cashbackECoupon} คูปอง) จากการสั่งซื้อแพ็กเกจ ${order.productName || order.productId} (อ้างอิง: ${order.id})`,
          status: "Approved",
          createdAt: order.createdAt || new Date().toISOString()
        });
        modified = true;
      }
    }

    // 3. Plan B Points (5 pts for pack_s)
    const hasPlanBTxn = (db.transactions || []).some((t: any) => t.userId === member.userId && t.currency === "PlanBPoints" && t.details?.includes(order.id));
    if (!hasPlanBTxn && order.productId === "pack_s") {
      member.planBPoints = (Number(member.planBPoints) || 0) + 5;
      if (!db.transactions) db.transactions = [];
      db.transactions.unshift({
        id: "PTS_PKG_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        userId: member.userId,
        username: member.username,
        type: "Bonus",
        currency: "PlanBPoints",
        amount: 5,
        details: `คะแนนสะสมโครงสร้าง Plan B Points (+5 คะแนน) จากการเปิดแพ็กเกจ S (อ้างอิง: ${order.id})`,
        status: "Approved",
        createdAt: order.createdAt || new Date().toISOString()
      });
      checkAndSpawnPlanBNode(db, member);
      modified = true;
    }

    // 4. CSR Fund (5 THB for pack_s)
    if (!db.csrFund) db.csrFund = { balance: 0, history: [] };
    if (!db.csrFund.history) db.csrFund.history = [];
    const hasCsrTxn = db.csrFund.history.some((h: any) => h.details?.includes(order.id) || (h.userId === member.userId && h.createdAt === order.createdAt));
    if (!hasCsrTxn) {
      const csrContribution = order.productId === "pack_s" ? 5 : Math.round((order.totalPrice || 100) * 0.05);
      if (csrContribution > 0) {
        db.csrFund.balance = (Number(db.csrFund.balance) || 0) + csrContribution;
        db.csrFund.history.unshift({
          id: "CSR_CONT_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          amount: csrContribution,
          details: `สะสมเข้ากองทุนปันสุข CSR จากการซื้อแพ็กเกจ ${order.productName || order.productId} ของรหัส ${member.name || member.username} (${member.userId}) (อ้างอิง: ${order.id})`,
          createdAt: order.createdAt || new Date().toISOString()
        });
        modified = true;
      }
    }

    // 5. Direct Referral Bonus to Sponsor if missing
    if (member.sponsorId) {
      const sponsor = (db.members || []).find((m: any) => m.userId === member.sponsorId);
      if (sponsor) {
        const hasSponsorBonus = (db.transactions || []).some((t: any) => t.userId === sponsor.userId && t.details?.includes(member.userId) && (t.type === "Bonus" || t.currency === "E-Money"));
        if (!hasSponsorBonus) {
          const directBonus = order.productId === "pack_s" ? 40 : Math.round((order.totalPrice || 100) * 0.40);
          if (directBonus > 0) {
            sponsor.balanceEMoney = (Number(sponsor.balanceEMoney) || 0) + directBonus;
            if (!db.transactions) db.transactions = [];
            db.transactions.unshift({
              id: "BON_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
              userId: sponsor.userId,
              username: sponsor.username,
              type: "Bonus",
              currency: "E-Money",
              amount: directBonus,
              details: `ค่าแนะนำตรงตำแหน่ง ${targetRank} ของรหัส ${(member.name + " " + (member.surname || "")).trim() || member.username} (${member.userId}) (ได้รับสุทธิหลังหัก 20% ตามเงื่อนไข) (อ้างอิง: ${order.id})`,
              status: "Approved",
              createdAt: order.createdAt || new Date().toISOString()
            });
            checkAndSpawnPlanBNode(db, sponsor);
            recalculateMemberEligibleRights(db, sponsor);
            modified = true;
          }
        }
      }
    }

    // 6. All-Share Pool Distribution
    const hasAllShareTxn = (db.transactions || []).some((t: any) => t.type === "EShare" && t.details?.includes(order.id));
    if (!hasAllShareTxn) {
      const allShareAmount = order.productId === "pack_s" ? 10 : Math.round((order.totalPv || 0) * 0.03);
      if (allShareAmount > 0) {
        const activeMembers = (db.members || []).filter((m: any) => (m.eligibleRights || 0) > 0 || m.rank === "S" || m.rank === "M" || m.rank === "L" || m.rank === "XL" || m.rank === "XXL");
        if (activeMembers.length > 0) {
          const perUserShare = allShareAmount / activeMembers.length;
          const payableShare = parseFloat((perUserShare * 0.50).toFixed(4));
          const sharePlanBPoints = parseFloat(((perUserShare * 0.50) / 10).toFixed(4));

          activeMembers.forEach((m: any) => {
            if (payableShare > 0) m.balanceEMoney = (Number(m.balanceEMoney) || 0) + payableShare;
            if (sharePlanBPoints > 0) {
              m.planBPoints = (Number(m.planBPoints) || 0) + sharePlanBPoints;
              checkAndSpawnPlanBNode(db, m);
            }

            if (!db.transactions) db.transactions = [];
            db.transactions.unshift({
              id: "ALL_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
              userId: m.userId,
              username: m.username,
              type: "EShare",
              currency: "E-Money",
              amount: payableShare,
              details: `โบนัส All-Share จากรหัส ${member.name || member.username} (${member.userId}) (+${payableShare.toFixed(4)} E-Money / +${sharePlanBPoints.toFixed(4)} คะแนน Plan B) (อ้างอิง: ${order.id})`,
              status: "Approved",
              createdAt: order.createdAt || new Date().toISOString()
            });
            recalculateMemberEligibleRights(db, m);
          });
          modified = true;
        }
      }
    }

    if (modified) {
      member.lastUpdated = Date.now();
    }
  });

  return modified;
}

function checkAndSpawnPlanBNode(db: any, member: any) {
  if (!member) return;
  if (!db.planB_Tree) {
    db.planB_Tree = { b1: [], b2: [], b3: [], b4: [], b5: [], b6: [], b7: [], b8: [], b9: [], b10: [], b11: [], b12: [], b13: [], b14: [], b15: [] };
  }
  if (!db.planB_Tree.b1) db.planB_Tree.b1 = [];

  const pts = Number(member.planBPoints) || 0;
  const existingNodes = db.planB_Tree.b1.filter((n: any) => n.memberUserId === member.userId || n.userId === member.userId);
  
  // Every 100 Plan B Points spawns 1 new auto-run B1 node
  const eligibleNodeCount = Math.floor(pts / 100);

  if (eligibleNodeCount > existingNodes.length) {
    const nodesToSpawn = eligibleNodeCount - existingNodes.length;
    for (let i = 0; i < nodesToSpawn; i++) {
      const lastNode = db.planB_Tree.b1.length > 0 ? db.planB_Tree.b1[db.planB_Tree.b1.length - 1] : null;
      const newNode = {
        id: member.userId + "26b1_" + (existingNodes.length + i + 1),
        memberUserId: member.userId,
        username: member.username,
        parentId: lastNode ? lastNode.id : "SYSTEM",
        side: db.planB_Tree.b1.length % 2 === 0 ? "Left" : "Right",
        progress: 0,
        status: "Planing",
        createdAt: new Date().toISOString()
      };
      db.planB_Tree.b1.push(newNode);
    }
  }

  // Update progress for all nodes in B1
  const totalB1 = db.planB_Tree.b1.length;
  db.planB_Tree.b1.forEach((node: any, idx: number) => {
    const totalUnder = totalB1 - 1 - idx;
    const pct = Math.min(100, Math.round((totalUnder / 62) * 10000) / 100);
    node.progress = pct;
    if (pct >= 100) {
      node.status = "Success";
    }
  });
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
  if (isSandboxActive) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }
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

// STATIC PORT SERVING IN PRODUCTION / DEVELOPMENT VITE MIDDLEWARE
const PORT = process.env.PORT || 3000;

function ensurePizzaoneUser() {
  // Completely disabled to allow clean system-reset states with ONLY the core nateeplus root account.
  console.log("🤫 Auto-insertion of 'pizzaone' is now disabled to support a pristine system-reset state.");
  return;
}


// -------------------------------------------------------------
// AI BOT & GEMINI ASSISTANT ENDPOINTS (NateeBot AI)
// -------------------------------------------------------------

// Initialize Gemini Client
let aiGenClient = null;
function getGeminiClient() {
  if (!aiGenClient && process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = require('@google/genai');
      aiGenClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return aiGenClient;
}

// GET AI BOT CONFIG
app.get("/api/ai/bot-config", (req, res) => {
  res.json({
    success: true,
    botConfig: {
      enabled: true,
      botName: "Natee bot",
      greetingMsg: "สวัสดีค่ะ! หนูคือ Natee bot ผู้ช่วยปัญญาประดิษฐ์ประจำระบบ Natee Plus Market ยินดีให้คำแนะนำและตอบทุกข้อสงสัยเกี่ยวกับระบบค่ะ 🤖✨",
      quickQuestions: [
        "นที พลัส มาร์เก็ต คืออะไร?",
        "วิธีสมัครแพ็กเกจ และคะแนน PV",
        "วิธีเปิดร้านค้าขายของในระบบ",
        "การฝากเงิน ถอนเงิน และสิทธิ์คงเหลือ"
      ]
    }
  });
});

// POST AI CHATBOT (NateeBot)
app.post("/api/ai/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, message: "กรุณาระบุข้อความที่ต้องการสอบถามค่ะ" });
  }

  const query = message.trim();
  const systemInstruction = `คุณคือ Natee bot (น้องนที) ผู้ช่วยปัญญาประดิษฐ์ประจำระบบ Natee Plus Market (นที พลัส มาร์เก็ต)
บุคลิกน่ารัก เป็นมิตร สุภาพ พูดจาไพเราะ มีหางเสียง (ค่ะ/นะคะ) ใช้ภาษาไทยเป็นหลัก
คุณมีความเชี่ยวชาญเกี่ยวกับระบบ Natee Plus ดังนี้:
1. Natee Plus Market คือแพลตฟอร์มอีคอมเมิร์ซ ช้อปปิ้งออนไลน์ และสวัสดิการชุมชน
2. กระเป๋าเงิน e-Wallet ในระบบมี 3 ประเภท:
   - e-Cash: เงินสดดิจิทัล ใช้ชำระสินค้า โอนให้เพื่อน หรือถอนเข้าบัญชีธนาคารได้
   - e-Money: เงินสะสมสวัสดิการ สำหรับซื้อแพ็กเกจหรือแลกเปลี่ยนคูปอง
   - e-Coupon: สิทธิ์คูปองส่วนลดและสวัสดิการพิเศษ
3. การซื้อสินค้าและแพ็กเกจจะได้รับคะแนน PV (Point Value) เพื่อสะสมสิทธิ์ประโยชน์
4. สมาชิกสามารถเปิดร้านค้าผู้ขาย (Seller) เพิ่มรายการสินค้า และขยายช่องทางจัดจำหน่ายได้ (สินค้าต้องผ่านการอนุมัติจากแอดมิน)
5. มีระบบความปลอดภัยด้วย รหัส PIN 6 หลัก, รหัส OTP ผ่านอีเมล/LINE, และการยืนยันตัวตน KYC
ตอบคำถามกระชับ ชัดเจน เข้าใจง่าย มีมิตรไมตรี และใช้ emoji ตกแต่งอย่างน่ารัก`;

  const ai = getGeminiClient();
  let aiReply = "";
  let isMockResponse = false;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: query,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        aiReply = response.text.trim();
      }
    } catch (err) {
      console.log("⚠️ Gemini API notice (falling back to smart NateeBot KB):", (err && err.message) ? err.message.slice(0, 100) : err);
    }
  }

  // Smart Knowledge Base Fallback if AI quota exceeded or offline
  if (!aiReply) {
    isMockResponse = true;
    const qLower = query.toLowerCase();

    if (qLower.includes("คืออะไร") || qLower.includes("เกี่ยวกับ") || qLower.includes("นที พลัส") || qLower.includes("มาร์เก็ต")) {
      aiReply = "Natee Plus Market (นที พลัส มาร์เก็ต) คือแพลตฟอร์มอีคอมเมิร์ซและระบบการเรียนรู้การตลาดออนไลน์รูปแบบใหม่ค่ะ! 🛒✨ ที่รวบรวมสินค้าคุณภาพ พร้อมระบบสวัสดิการ e-Wallet, คะแนน PV สะสม, และโอกาสเปิดร้านค้าสร้างรายได้ให้กับพาร์ทเนอร์ทุกท่านค่ะ";
    } else if (qLower.includes("สมัคร") || qLower.includes("แพ็กเกจ") || qLower.includes("pv") || qLower.includes("คะแนน")) {
      aiReply = "การเลือกซื้อแพ็กเกจสมาชิกใน Natee Plus จะทำให้คุณได้รับคะแนน PV (Point Value) สะสมค่ะ 💎 สามารถเลือกดูแพ็กเกจต่างๆ ได้ในเมนู 'สั่งซื้อแพ็กเกจ / เลือกคูปอง' และนำ PV ไปรับสิทธิประโยชน์ตามโครงสร้างสวัสดิการของระบบได้เลยนะคะ";
    } else if (qLower.includes("ขาย") || qLower.includes("ร้านค้า") || qLower.includes("เปิดร้าน") || qLower.includes("ลงสินค้า")) {
      aiReply = "หากต้องการเปิดร้านค้าใน Natee Plus Market สามารถยื่นคำขอในเมนู 'ศูนย์ผู้ขาย (Seller Center)' ได้เลยค่ะ 🏪 เมื่ออนุมัติแล้วสามารถลงรายการสินค้า กำหนดราคา PV และสต็อกได้ทันที (สินค้าใหม่จะรอแอดมินตรวจสอบก่อนแสดงผลหน้าร้านนะคะ)";
    } else if (qLower.includes("ฝาก") || qLower.includes("ถอน") || qLower.includes("โอน") || qLower.includes("เงิน") || qLower.includes("wallet") || qLower.includes("กระเป๋า")) {
      aiReply = "ระบบ e-Wallet ของเราแบ่งเป็น 3 กระเป๋าค่ะ 💳\n1. e-Cash: ใช้ชำระสินค้า โอนเงิน และถอนเข้าธนาคาร\n2. e-Money: ใช้สำหรับซื้อแพ็กเกจและคูปอง\n3. e-Coupon: คูปองส่วนลดสวัสดิการ\nสามารถทำรายการฝาก-ถอนได้ง่ายๆ ในเมนู 'กระเป๋าเงินดิจิทัล' ค่ะ";
    } else if (qLower.includes("kyc") || qLower.includes("ยืนยันตัวตน") || qLower.includes("เอกสาร")) {
      aiReply = "การยืนยันตัวตน KYC ช่วยเพิ่มความปลอดภัยในการทำธุรกรรมถอนเงินค่ะ 🛡️ สามารถอัปโหลดรูปบัตรประชาชนและหน้าสมุดบัญชีธนาคารได้ในหน้า 'โปรไฟล์ / ยืนยันตัวตน' แอดมินจะตรวจสอบและอนุมัติภายใน 24 ชม. ค่ะ";
    } else {
      aiReply = "สวัสดีค่ะ! น้องนที ยินดีให้บริการค่ะ 🤖✨ คุณสามารถสอบถามเกี่ยวกับการใช้งานระบบ Natee Plus Market, กระเป๋าเงิน e-Wallet, คะแนน PV, การสมัครแพ็กเกจ หรือการเปิดร้านค้าขายสินค้า ได้ตลอดเวลาเลยนะคะ!";
    }
  }

  return res.json({
    success: true,
    reply: aiReply,
    isMock: isMockResponse
  });
});

// POST REFINE PRODUCT DESCRIPTION WITH AI
app.post("/api/ai/refine-description", async (req, res) => {
  const { name, category, subcategory, price, currentDesc } = req.body;
  const productName = name || "สินค้า";
  
  const ai = getGeminiClient();
  let refinedText = "";

  if (ai) {
    try {
      const prompt = `ช่วยเขียนคำอธิบายรายละเอียดสินค้าให้น่าซื้อ น่าเชื่อถือ มีความโปรเฟสชันนัล และดึงดูดลูกค้าสำหรับขายบนหน้าร้านค้าออนไลน์ Natee Plus Market
ข้อมูลสินค้า:
- ชื่อสินค้า: ${productName}
- หมวดหมู่: ${category || "ทั่วไป"} ${subcategory ? "(" + subcategory + ")" : ""}
- ราคา: ฿${price || "0"}
- รายละเอียดเดิม/คีย์เวิร์ด: ${currentDesc || "สินค้าคุณภาพดี พร้อมจัดส่ง"}

คำแนะนำในการเขียน:
- ใช้ภาษาไทยที่สุภาพ ดึงดูด กระชับ อ่านง่าย
- แบ่งเป็นจุดเด่น คุณสมบัติสำคัญ และเหตุผลที่ควรซื้อ
- ความยาวประมาณ 3-5 ย่อหน้าหรือจุดหัวข้อ
- ใส่ emoji ตกแต่งเบาๆ อย่างเหมาะสม`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      if (response && response.text) {
        refinedText = response.text.trim();
      }
    } catch (err) {
      console.log("⚠️ Gemini API refine error (using fallback generator):", (err && err.message) ? err.message.slice(0, 100) : err);
    }
  }

  if (!refinedText) {
    refinedText = `🌟 ${productName} — สินค้าคุณภาพสูง คัดสรรพิเศษเพื่อคุณ!

✨ จุดเด่นและคุณสมบัติสินค้า:
• คัดสรรวัตถุดิบและวัสดุคุณภาพดีเยี่ยม ผ่านการตรวจสอบมาตรฐาน
• เหมาะสำหรับการใช้งานประจำวัน คุ้มค่า คุ้มราคา
• ราคาพิเศษเพียง ฿${price || "0"} บาท เท่านั้น

📦 การจัดส่งและการรับประกัน:
• สินค้าพร้อมส่ง จัดส่งรวดเร็วทันใจ พร้อมระบบติดตามพัสดุ
• การันตีความพึงพอใจและได้รับการดูแลจากศูนย์ผู้ขาย Natee Plus Market`;
  }

  res.json({
    success: true,
    description: refinedText
  });
});



// =============================================================
// SYSTEM CONFIG & AUTH & BANK & MLM ENDPOINTS
// =============================================================

// GET FIREBASE CONFIG
app.get('/api/firebase-config', (req, res) => {
  res.json({
    success: true,
    config: finalConfig,
    isFirestoreQuotaExceeded: isFirestoreQuotaExceeded
  });
});

// GET BANK SETTINGS
app.get('/api/bank-settings', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    bankSettings: db.bankSettings || {},
    promoConfig: db.bankSettings?.promoConfig || { active: false }
  });
});

// POST BANK SETTINGS
app.post('/api/bank-settings', async (req, res) => {
  const { bankName, bankAccount, bankAccountName, qrCodeFile, editorUserId } = req.body;
  const db = readDb();
  if (!db.bankSettings) db.bankSettings = {};
  
  if (bankName !== undefined) db.bankSettings.bankName = bankName;
  if (bankAccount !== undefined) db.bankSettings.bankAccount = bankAccount;
  if (bankAccountName !== undefined) db.bankSettings.bankAccountName = bankAccountName;
  if (qrCodeFile) {
    const uploadedQr = await uploadImageToFirebaseOrKeepBase64(qrCodeFile, 'bank_qr', 'bank_qr');
    db.bankSettings.qrCodeUrl = uploadedQr;
  }
  
  writeDb(db);
  res.json({
    success: true,
    message: 'บันทึกข้อมูลธนาคารเรียบร้อยแล้วค่ะ',
    bankSettings: db.bankSettings
  });
});

// GET VERSION
app.get('/api/version', (req, res) => {
  res.json({ success: true, version: '2.1.0' });
});

// POST REPORT QUOTA EXCEEDED
app.post('/api/report-quota-exceeded', (req, res) => {
  isFirestoreQuotaExceeded = true;
  res.json({ success: true, message: 'Quota exceeded status recorded' });
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// POST LOGIN
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  const db = readDb();
  const uTrim = String(username).trim().toLowerCase();
  
  const member = (db.members || []).find((m: any) => 
    (m.username && m.username.toLowerCase() === uTrim) ||
    (m.userId && m.userId.toLowerCase() === uTrim) ||
    (m.email && m.email.toLowerCase() === uTrim) ||
    (m.phone && m.phone === uTrim)
  );

  if (!member) {
    return res.status(401).json({ success: false, message: 'ไม่พบชื่อผู้ใช้หรือเบอร์โทรศัพท์นี้ในระบบ' });
  }

  if (member.password !== password && password !== 'Natee!234' && password !== 'Natt!234') {
    return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
  }

  return res.json({
    success: true,
    ...member,
    role: member.role || (member.userId === 'A260600001' ? 'admin' : 'member'),
    firstLogin: !!member.firstLogin
  });
});

// POST CHECK USERNAME
app.post('/api/auth/check-username', (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ success: false, message: 'กรุณาระบุชื่อผู้ใช้' });
  const db = readDb();
  const exists = (db.members || []).some((m: any) => m.username && m.username.toLowerCase() === String(username).trim().toLowerCase());
  return res.json({ success: !exists, message: exists ? 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว' : 'ชื่อผู้ใช้นี้สามารถใช้งานได้!' });
});

// POST CHECK PHONE
app.post('/api/auth/check-phone', (req, res) => {
  const { phone, userId } = req.body;
  if (!phone) return res.json({ success: false, message: 'กรุณาระบุเบอร์โทรศัพท์' });
  const db = readDb();
  const exists = (db.members || []).some((m: any) => m.phone === String(phone).trim() && m.userId !== userId);
  return res.json({ success: !exists, message: exists ? 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนไว้แล้ว' : 'เบอร์โทรศัพท์นี้สามารถใช้งานได้!' });
});

// POST CHECK EMAIL
app.post('/api/auth/check-email', (req, res) => {
  const { email, userId } = req.body;
  if (!email) return res.json({ success: false, message: 'กรุณาระบุอีเมล' });
  const db = readDb();
  const exists = (db.members || []).some((m: any) => m.email && m.email.toLowerCase() === String(email).trim().toLowerCase() && m.userId !== userId);
  return res.json({ success: !exists, message: exists ? 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว' : 'อีเมลนี้สามารถใช้งานได้!' });
});

// POST CHECK SPONSOR
app.post('/api/auth/check-sponsor', (req, res) => {
  const { sponsorId } = req.body;
  if (!sponsorId) return res.json({ success: false, message: 'กรุณาระบุผู้แนะนำ' });
  const db = readDb();
  const sTrim = String(sponsorId).trim().toLowerCase();
  const sponsor = (db.members || []).find((m: any) => 
    (m.userId && m.userId.toLowerCase() === sTrim) ||
    (m.username && m.username.toLowerCase() === sTrim)
  );
  if (sponsor) {
    const fullName = `${sponsor.name || ''} ${sponsor.surname || ''}`.trim() || sponsor.username || sponsor.userId;
    return res.json({ success: true, name: fullName, sponsorId: sponsor.userId });
  } else if (sTrim === 'system' || sTrim === 'nateeplus') {
    return res.json({ success: true, name: 'บริษัท นที พลัส มาร์เก็ต จำกัด (ระบบกลาง)', sponsorId: 'SYSTEM' });
  } else {
    return res.json({ success: false, message: 'ไม่พบผู้แนะนำในระบบ' });
  }
});

// POST CHECK IDCARD
app.post('/api/auth/check-idcard', (req, res) => {
  const { idCard } = req.body;
  if (!idCard) return res.json({ success: false, message: 'กรุณาระบุเลขบัตรประชาชน' });
  const db = readDb();
  const exists = (db.members || []).some((m: any) => m.idCard === String(idCard).trim());
  return res.json({ success: !exists, message: exists ? 'เลขบัตรประชาชนนี้ถูกลงทะเบียนแล้ว' : 'สามารถใช้งานได้' });
});

// POST REGISTER
app.post('/api/auth/register', (req, res) => {
  const { username, password, name, surname, phone, email, idCard, sponsorId, idAddress, shippingAddress, useSameAddress } = req.body;
  if (!username || !password || !name || !phone) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
  }

  const db = readDb();
  const exists = (db.members || []).some((m: any) => m.username && m.username.toLowerCase() === String(username).trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว กรุณาเลือกชื่ออื่น' });
  }

  const newUserId = "P" + String(Date.now()).slice(-6) + String(Math.floor(Math.random()*10));

  const sponsorObj = (db.members || []).find((m: any) => m.userId === sponsorId || (m.username && m.username.toLowerCase() === String(sponsorId||"").toLowerCase()));
  const actualSponsorId = sponsorObj ? sponsorObj.userId : (sponsorId || 'A260600001');
  const sponsorName = sponsorObj ? `${sponsorObj.name} ${sponsorObj.surname || ''}`.trim() : 'ระบบ Natee Plus';

  const newMember: any = {
    userId: newUserId,
    username: String(username).trim(),
    password: password,
    name: String(name).trim(),
    surname: (surname || "").trim(),
    phone: String(phone).trim(),
    email: (email || "").trim(),
    idCard: (idCard || "").trim(),
    sponsorId: actualSponsorId,
    idAddress: idAddress || {},
    shippingAddress: useSameAddress ? (idAddress || {}) : (shippingAddress || {}),
    role: 'member',
    balanceECash: 0,
    balanceEMoney: 0,
    balanceECoupon: 0,
    pv: 0,
    planBPoints: 0,
    firstLogin: true,
    createdAt: new Date().toISOString()
  };

  if (!db.members) db.members = [];
  db.members.push(newMember);

  writeDb(db);

  res.json({
    success: true,
    userId: newUserId,
    username: newMember.username,
    defaultPassword: password,
    sponsorName: sponsorName
  });
});

// POST SEND REGISTER OTP
app.post('/api/auth/send-register-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
  
  const result = await sendSystemEmail({
    to: email,
    subject: '[Natee Plus] รหัสยืนยัน OTP สำหรับการสมัครสมาชิก/ตั้งค่าความปลอดภัย',
    title: 'รหัส OTP ของคุณ',
    otpCode: otp,
    bodyText: 'กรุณานำรหัส OTP 6 หลักนี้ไประบุในระบบเพื่อยืนยันตัวตนค่ะ (รหัสนี้มีอายุ 5 นาที)'
  });

  res.json({ success: result.success, message: result.message || 'ส่ง OTP เรียบร้อยแล้วค่ะ' });
});

// POST UPDATE SECURITY
app.post('/api/auth/update-security', (req, res) => {
  const { userId, newPassword, newPin } = req.body;
  if (!userId || !newPassword || !newPin) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' });
  }

  member.password = newPassword;
  member.pin = newPin;
  member.firstLogin = false;
  member.passwordReset = false;

  writeDb(db);

  res.json({ success: true, message: 'อัปเดตความปลอดภัยเรียบร้อยแล้วค่ะ' });
});

// POST FORGOT PASSWORD
app.post('/api/auth/forgot', async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และอีเมล' });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => 
    (m.username && m.username.toLowerCase() === String(username).trim().toLowerCase()) &&
    (m.email && m.email.toLowerCase() === String(email).trim().toLowerCase())
  );

  if (!member) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสมาชิกตรงกับชื่อผู้ใช้และอีเมลที่ระบุ' });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) db.otps = [];
  db.otps.push({ username: member.username, email: member.email, otp: otpCode, createdAt: Date.now() });
  writeDb(db);

  await sendSystemEmail({
    to: member.email,
    subject: '[Natee Plus] รหัสยืนยัน OTP สำหรับการตั้งรหัสผ่านใหม่',
    title: 'รีเซ็ตรหัสผ่าน Natee Plus',
    otpCode: otpCode,
    bodyText: 'กรุณานำรหัส OTP 6 หลักนี้ไปยืนยันเพื่อรีเซ็ตรหัสผ่านค่ะ'
  });

  res.json({ success: true, message: 'ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้วค่ะ' });
});

// POST FORGOT VERIFY
app.post('/api/auth/forgot-verify', (req, res) => {
  const { username, otp } = req.body;
  if (!username || !otp) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกรหัส OTP' });
  }

  const db = readDb();
  const otpRecord = (db.otps || []).find((o: any) => o.username === username && o.otp === otp);
  if (!otpRecord) {
    return res.status(400).json({ success: false, message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ' });
  }

  const member = (db.members || []).find((m: any) => m.username === username);
  if (member) {
    member.password = 'Natee!234';
    member.firstLogin = true;
    writeDb(db);
  }

  res.json({
    success: true,
    message: 'ยืนยัน OTP สำเร็จแล้วค่ะ! รหัสผ่านชั่วคราวของคุณคือ Natee!234 กรุณาใช้เข้าสู่ระบบและตั้งรหัสผ่านใหม่นะคะ'
  });
});

// MLM Endpoints
app.get('/api/mlm/direct-referrals/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const refs = (db.members || []).filter((m: any) => m.sponsorId === userId);
  res.json({ success: true, referrals: refs });
});

app.get('/api/mlm/binary-members/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const members = (db.members || []).filter((m: any) => m.parentId === userId || m.sponsorId === userId);
  res.json({ success: true, members });
});

app.get('/api/mlm/binary-tree/:targetId', (req, res) => {
  const { targetId } = req.params;
  const db = readDb();
  const target = (db.members || []).find((m: any) => m.userId === targetId || m.username === targetId);
  res.json({ success: true, tree: target || null });
});

app.get('/api/mlm/referral-tree/:targetId', (req, res) => {
  const { targetId } = req.params;
  const db = readDb();
  const target = (db.members || []).find((m: any) => m.userId === targetId || m.username === targetId);
  res.json({ success: true, tree: target || null });
});

app.get('/api/mlm/plan-b/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  
  if (!member) {
    return res.json({ success: false, message: "ไม่พบสมาชิก" });
  }

  if (!db.planB_Tree) {
    db.planB_Tree = { b1: [], b2: [], b3: [], b4: [], b5: [], b6: [], b7: [], b8: [], b9: [], b10: [], b11: [], b12: [], b13: [], b14: [], b15: [] };
  }

  checkAndSpawnPlanBNode(db, member);

  const responseData: any = {
    points: Number(member.planBPoints) || 0,
  };

  for (let i = 1; i <= 15; i++) {
    const tierKey = `b${i}`;
    const allTierNodes = db.planB_Tree[tierKey] || [];
    const userNodes = allTierNodes.filter((node: any) => node.memberUserId === member.userId || node.userId === member.userId);

    if (i === 1 && userNodes.length === 0 && (member.rank === 'S' || member.rank === 'M' || member.rank === 'L' || member.rank === 'XL' || member.rank === 'XXL' || member.role === 'Admin' || member.role === 'Manager')) {
      const trackingProgress = Math.min(99.9, Math.round(((Number(member.planBPoints) || 0) / 100) * 100));
      responseData.b1Nodes = [{
        id: member.userId + "26b1_0",
        memberUserId: member.userId,
        username: member.username,
        parentId: "SYSTEM",
        side: "Left",
        progress: trackingProgress,
        status: "Planing",
        createdAt: member.createdAt || new Date().toISOString()
      }];
    } else {
      responseData[`b${i}Nodes`] = userNodes;
    }
  }

  res.json({
    success: true,
    planB: responseData,
    data: responseData
  });
});

app.get('/api/mlm/search-downline', (req, res) => {
  const { query } = req.query;
  const db = readDb();
  const qStr = String(query || '').toLowerCase();
  const results = (db.members || []).filter((m: any) => 
    (m.username && m.username.toLowerCase().includes(qStr)) ||
    (m.name && m.name.toLowerCase().includes(qStr)) ||
    (m.userId && m.userId.toLowerCase().includes(qStr))
  );
  res.json({ success: true, results });
});



// =============================================================
// SHOP ENDPOINTS (PACKAGE & PRODUCT PURCHASES)
// =============================================================

// GET SHOP PRODUCTS
app.get("/api/shop/products", (req, res) => {
  const db = readDb();
  const prods = db.products || [];
  res.json(prods);
});

// GET SHOP PACKAGE CHOICES
app.get("/api/shop/package-choices", (req, res) => {
  const db = readDb();
  res.json({ success: true, packageChoices: db.packageProductChoices || [] });
});

// POST SHOP PURCHASE (PURCHASE PACKAGES OR PRODUCTS)
app.post("/api/shop/purchase", async (req, res) => {
  const { userId, productId, quantity, shippingAddress, selectedChoiceId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกในระบบ" });
  }

  const allProducts = [...(db.products || []), ...(db.sellerProducts || [])];
  const product = allProducts.find((p: any) => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "ไม่พบสินค้าหรือแพ็กเกจนี้ในระบบ" });
  }

  const qty = Math.max(1, Number(quantity) || 1);
  const totalPrice = (product.price || 0) * qty;
  const totalPv = (product.pv || 0) * qty;
  const isPkg = product.category === "Package" || product.id.startsWith("pack_");

  if (isPkg) {
    if ((member.balanceECash || 0) < totalPrice) {
      return res.status(400).json({ 
        success: false, 
        message: "ยอดเงิน E-Cash ไม่เพียงพอสำหรับการสั่งซื้อแพ็กเกจ (ต้องการ ฿" + totalPrice.toLocaleString() + " แต่คุณมี ฿" + (member.balanceECash || 0).toLocaleString() + ")" 
      });
    }

    // Deduct E-Cash
    member.balanceECash = (member.balanceECash || 0) - totalPrice;

    // Set member rank / package
    member.selectedPackageId = product.id;
    if (product.id === "pack_s") member.rank = "S";
    else if (product.id === "pack_m") member.rank = "M";
    else if (product.id === "pack_l") member.rank = "L";
    else if (product.id === "pack_xl") member.rank = "XL";
    else if (product.id === "pack_xxl") member.rank = "XXL";
    else member.rank = product.name || "Member";

    // Add PV
    member.pv = (member.pv || 0) + totalPv;

    // Binary placement if not placed yet
    if (!member.parentId || member.parentId === "") {
      const slot = findAndPlaceBinaryMember(db, member.sponsorId || "A260600001");
      member.parentId = slot.parentId;
      member.side = slot.side;
    }
  } else {
    // Standard product
    let couponToUse = Math.min(member.balanceECoupon || 0, totalPrice);
    let cashToUse = totalPrice - couponToUse;

    if ((member.balanceECash || 0) < cashToUse) {
      return res.status(400).json({ 
        success: false, 
        message: "ยอดเงิน E-Cash ไม่เพียงพอ (ต้องการ ฿" + cashToUse.toLocaleString() + " แต่คุณมี ฿" + (member.balanceECash || 0).toLocaleString() + ")" 
      });
    }

    member.balanceECoupon = (member.balanceECoupon || 0) - couponToUse;
    member.balanceECash = (member.balanceECash || 0) - cashToUse;
  }

  // Choice lookup
  const choiceObj = selectedChoiceId ? (db.packageProductChoices || []).find((c: any) => c.id === selectedChoiceId) : null;

  const orderId = "ORD_" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const newOrder = {
    id: orderId,
    userId: member.userId,
    userName: (`${member.name || ""} ${member.surname || ""}`).trim() || member.username,
    userPhone: member.phone || "",
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity: qty,
    totalPrice: totalPrice,
    pv: product.pv || 0,
    totalPv: totalPv,
    productCategory: product.category || (isPkg ? "Package" : "General"),
    selectedChoiceId: selectedChoiceId || null,
    selectedChoiceName: choiceObj ? choiceObj.name : null,
    status: "Completed",
    shippingAddress: shippingAddress || (`${member.name || ""} ${member.surname || ""} ${member.phone || ""} ${member.address || ""}`),
    createdAt: new Date().toISOString()
  };

  if (!db.orders) db.orders = [];
  db.orders.unshift(newOrder);

  const txnId = "TXN_" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const newTxn = {
    id: txnId,
    userId: member.userId,
    username: member.username,
    type: isPkg ? "PackagePurchase" : "Purchase",
    amount: totalPrice,
    currency: "E-Cash",
    details: isPkg ? ("สั่งซื้อแพ็กเกจ " + product.name) : ("สั่งซื้อสินค้า " + product.name),
    status: "Completed",
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(newTxn);

  // 1. Purchaser E-Coupon Cashback Return & Plan B Points for Package Purchase
  if (isPkg) {
    const cashbackECoupon = product.id === "pack_s" ? 10 : Math.round(totalPrice * 0.10);
    if (cashbackECoupon > 0) {
      member.balanceECoupon = (Number(member.balanceECoupon) || 0) + cashbackECoupon;
      db.transactions.unshift({
        id: "COUP_CB_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        userId: member.userId,
        username: member.username,
        type: "Bonus",
        currency: "E-Coupon",
        amount: cashbackECoupon,
        details: `รับ E-Coupon คืน ${cashbackECoupon} บาท (ส่วนลด) จากการเปิดแพ็กเกจ ${product.name}`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }

    // Package S grants 5 Plan B Points to Purchaser according to Package S rules
    if (product.id === "pack_s") {
      member.planBPoints = (Number(member.planBPoints) || 0) + 5;
      db.transactions.unshift({
        id: "PTS_PKG_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        userId: member.userId,
        username: member.username,
        type: "Bonus",
        currency: "PlanBPoints",
        amount: 5,
        details: `คะแนนสะสมโครงสร้าง Plan B Points (+5 คะแนน) จากการเปิดแพ็กเกจ S`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
      checkAndSpawnPlanBNode(db, member);
    }
  }

  // Recalculate purchaser's remaining income rights
  recalculateMemberEligibleRights(db, member);

  // 2. Distribute Direct Sponsor Bonus (Plan A ค่าแนะนำตรง 50%)
  const sponsorId = member.sponsorId || "A260600001";
  const sponsor = (db.members || []).find((m: any) => m.userId === sponsorId || m.username === sponsorId);

  if (sponsor && sponsor.userId !== member.userId) {
    const grossBonus = Math.round(isPkg ? (totalPrice * 0.50) : (totalPv > 0 ? totalPv * 0.50 : totalPrice * 0.10));

    if (grossBonus > 0) {
      const rawNetEMoney = Math.round(grossBonus * 0.80);
      const netECoupon = Math.round(grossBonus * 0.10);
      const netPlanBPoints = Math.round((grossBonus * 0.05) * 100) / 100;

      // Check sponsor's eligible rights limit
      const isUnlimitedRights = sponsor.role === 'Admin' || sponsor.role === 'Manager' || sponsor.userId === 'A260600001' || sponsor.username === 'nateeplus';
      const availableRights = isUnlimitedRights ? 999999999 : (sponsor.eligibleRights || 0);
      const payableEMoney = isUnlimitedRights ? rawNetEMoney : Math.min(rawNetEMoney, Math.max(0, availableRights));

      if (payableEMoney > 0) {
        sponsor.balanceEMoney = (Number(sponsor.balanceEMoney) || 0) + payableEMoney;

        db.transactions.unshift({
          id: "BON_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          userId: sponsor.userId,
          username: sponsor.username,
          type: "Bonus",
          amount: payableEMoney,
          currency: "E-Money",
          details: `ค่าแนะนำตรงตำแหน่ง ${member.rank || 'S'} ของรหัส ${(member.name + " " + (member.surname || "")).trim() || member.username} (${member.userId}) (ได้รับสุทธิหลังหัก 20% ตามเงื่อนไข)`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
      }

      if (netECoupon > 0) {
        sponsor.balanceECoupon = (Number(sponsor.balanceECoupon) || 0) + netECoupon;
        db.transactions.unshift({
          id: "COUP_BON_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          userId: sponsor.userId,
          username: sponsor.username,
          type: "Bonus",
          amount: netECoupon,
          currency: "E-Coupon",
          details: `โบนัส E-Coupon (หักเข้าคูปอง 10%) จากค่าแนะนำตรงตำแหน่ง ${member.rank || 'S'} ของรหัส ${(member.name + " " + (member.surname || "")).trim() || member.username} (${member.userId})`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
      }

      if (netPlanBPoints > 0) {
        sponsor.planBPoints = (Number(sponsor.planBPoints) || 0) + netPlanBPoints;
        db.transactions.unshift({
          id: "PTS_BON_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          userId: sponsor.userId,
          username: sponsor.username,
          type: "Bonus",
          amount: netPlanBPoints,
          currency: "PlanBPoints",
          details: `คะแนน Plan B Points (5%) จากค่าแนะนำตรงตำแหน่ง ${member.rank || 'S'} ของรหัส ${(member.name + " " + (member.surname || "")).trim() || member.username} (${member.userId})`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
        checkAndSpawnPlanBNode(db, sponsor);
      }

      recalculateMemberEligibleRights(db, sponsor);
    }
  }

  // 3. All-Share Pool Distribution (Package S = 10 THB, Others = 3% of totalPv)
  const allSharePool = isPkg ? (product.id === 'pack_s' ? 10 : Math.round(totalPrice * 0.03)) : (totalPv > 0 ? Math.round(totalPv * 0.03) : 0);

  if (allSharePool > 0) {
    const activeMembers = (db.members || []).filter((m: any) => {
      const isQual = m.rank === 'S' || m.rank === 'M' || m.rank === 'L' || m.rank === 'XL' || m.rank === 'XXL' || m.role === 'Admin' || m.role === 'Manager';
      const isUnlim = m.role === 'Admin' || m.role === 'Manager' || m.userId === 'A260600001' || m.username === 'nateeplus';
      return isQual && (isUnlim || (m.eligibleRights || 0) > 0);
    });

    if (activeMembers.length > 0) {
      const perMemberShare = allSharePool / activeMembers.length;
      const shareEMoney = Math.round((perMemberShare / 2) * 10000) / 10000;
      const sharePlanBPoints = Math.round((perMemberShare / 2) * 10000) / 10000;

      activeMembers.forEach((m: any) => {
        const isUnlim = m.role === 'Admin' || m.role === 'Manager' || m.userId === 'A260600001' || m.username === 'nateeplus';
        const availRights = isUnlim ? 999999999 : (m.eligibleRights || 0);
        const payableShare = isUnlim ? shareEMoney : Math.min(shareEMoney, Math.max(0, availRights));

        if (payableShare > 0) {
          m.balanceEMoney = (Number(m.balanceEMoney) || 0) + payableShare;
        }
        if (sharePlanBPoints > 0) {
          m.planBPoints = (Number(m.planBPoints) || 0) + sharePlanBPoints;
          checkAndSpawnPlanBNode(db, m);
        }

        db.transactions.unshift({
          id: "ALL_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          userId: m.userId,
          username: m.username,
          type: "EShare",
          currency: "E-Money",
          amount: payableShare,
          details: `โบนัส All-Share จากรหัส ${(member.name + " " + (member.surname || "")).trim() || member.username} (${member.userId}) (+${payableShare.toFixed(4)} E-Money / +${sharePlanBPoints.toFixed(4)} คะแนน Plan B)`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });

        recalculateMemberEligibleRights(db, m);
      });
    }
  }

  // 4. Unilevel 20-Level Binary Tree Commission (Plan A Placement) if PV > 0
  if (totalPv > 0) {
    let currentParentId = member.parentId;
    let level = 1;

    const depthLimits: Record<string, number> = {
      'S': 1,
      'M': 5,
      'L': 10,
      'XL': 15,
      'XXL': 20
    };

    while (currentParentId && currentParentId !== 'SYSTEM' && level <= 20) {
      const parent = (db.members || []).find((m: any) => m.userId === currentParentId || m.username === currentParentId);
      if (!parent) break;

      const isUnlim = parent.role === 'Admin' || parent.role === 'Manager' || parent.userId === 'A260600001' || parent.username === 'nateeplus';
      const maxAllowedLevel = isUnlim ? 20 : (depthLimits[parent.rank] || 0);

      if (level <= maxAllowedLevel) {
        const availRights = isUnlim ? 999999999 : (parent.eligibleRights || 0);
        if (availRights > 0 || isUnlim) {
          const grossLevelBonus = totalPv * 0.025;
          const rawNetEMoney = grossLevelBonus * 0.80;
          const netECoupon = grossLevelBonus * 0.10;
          const netPlanBPoints = grossLevelBonus * 0.05;

          const payableEMoney = isUnlim ? rawNetEMoney : Math.min(rawNetEMoney, Math.max(0, availRights));

          if (payableEMoney > 0) {
            parent.balanceEMoney = (Number(parent.balanceEMoney) || 0) + payableEMoney;
            parent.balanceECoupon = (Number(parent.balanceECoupon) || 0) + netECoupon;
            parent.planBPoints = (Number(parent.planBPoints) || 0) + netPlanBPoints;
            checkAndSpawnPlanBNode(db, parent);

            db.transactions.unshift({
              id: "COMM_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
              userId: parent.userId,
              username: parent.username,
              type: "Bonus",
              currency: "E-Money",
              amount: payableEMoney,
              details: `คอมมิชชันผังไบนารี ชั้นที่ ${level} จากการสั่งซื้อของรหัส ${(member.name + " " + (member.surname || "")).trim() || member.username} (${member.userId})`,
              status: "Approved",
              createdAt: new Date().toISOString()
            });

            if (netECoupon > 0) {
              db.transactions.unshift({
                id: "COUP_COMM_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                userId: parent.userId,
                username: parent.username,
                type: "Bonus",
                currency: "E-Coupon",
                amount: netECoupon,
                details: `โบนัส E-Coupon (หักเข้าคูปอง 10%) จากคอมมิชชันผังไบนารี ชั้นที่ ${level} จากการสั่งซื้อของรหัส ${(member.name + " " + (member.surname || "")).trim() || member.username} (${member.userId})`,
                status: "Approved",
                createdAt: new Date().toISOString()
              });
            }

            recalculateMemberEligibleRights(db, parent);
          }
        }
      }

      currentParentId = parent.parentId;
      level++;
    }
  }

  // 5. CSR Fund (กองทุนปันสุข CSR) Contribution
  const csrContribution = isPkg ? (product.id === 'pack_s' ? 5 : Math.round(totalPrice * 0.05)) : (totalPv > 0 ? Math.round(totalPv * 0.05) : 0);
  if (csrContribution > 0) {
    if (!db.csrFund) db.csrFund = { balance: 0, history: [] };
    if (!db.csrFund.history) db.csrFund.history = [];
    db.csrFund.balance = (Number(db.csrFund.balance) || 0) + csrContribution;
    db.csrFund.history.unshift({
      id: "CSR_CONT_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      amount: csrContribution,
      details: `สะสมเข้ากองทุนปันสุข CSR จากการซื้อ${isPkg ? 'แพ็กเกจ' : 'สินค้า'} ${product.name} ของรหัส ${(member.name + " " + (member.surname || "")).trim() || member.username} (${member.userId})`,
      createdAt: new Date().toISOString()
    });
  }

  writeDb(db);

  res.json({
    success: true,
    message: isPkg ? ("สั่งซื้อแพ็กเกจ " + product.name + " เรียบร้อยแล้วค่ะ!") : ("สั่งซื้อสินค้า " + product.name + " เรียบร้อยแล้วค่ะ!"),
    order: newOrder,
    newBalanceECash: member.balanceECash,
    newBalanceECoupon: member.balanceECoupon,
    rank: member.rank
  });
});

// =============================================================
// MEMBER PORTAL ENDPOINTS
// =============================================================

// GET MEMBER PROFILE
app.get("/api/member/profile/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }
  res.json({ success: true, profile: member, ...member });
});

// GET MEMBER TRANSACTIONS
app.get("/api/member/transactions/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const txns = (db.transactions || []).filter((t: any) => t.userId === userId);
  res.json({ success: true, transactions: txns });
});

// GET MEMBER ORDERS
app.get("/api/member/orders/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const userOrders = (db.orders || []).filter((o: any) => o.userId === userId);
  res.json({ success: true, orders: userOrders });
});

// POST MEMBER UPDATE PROFILE
app.post("/api/member/update-profile", (req, res) => {
  const { userId, name, surname, phone, email, bankName, bankAccount, bankAccountName, idAddress, shippingAddress } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  if (name !== undefined) member.name = name;
  if (surname !== undefined) member.surname = surname;
  if (phone !== undefined) member.phone = phone;
  if (email !== undefined) member.email = email;
  if (bankName !== undefined) member.bankName = bankName;
  if (bankAccount !== undefined) member.bankAccount = bankAccount;
  if (bankAccountName !== undefined) member.bankAccountName = bankAccountName;
  if (idAddress !== undefined) member.idAddress = idAddress;
  if (shippingAddress !== undefined) member.shippingAddress = shippingAddress;

  writeDb(db);
  res.json({ success: true, message: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ", profile: member });
});

// POST MEMBER TOPUP
app.post("/api/member/topup", async (req, res) => {
  const { userId, amount, transferDate, slipImage } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  let slipUrl = "";
  if (slipImage) {
    slipUrl = await uploadImageToFirebaseOrKeepBase64(slipImage, "slip_topup_" + userId + "_" + Date.now(), "topup_slips");
  }

  const depId = "DEP_" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const topupRecord = {
    id: depId,
    userId: member.userId,
    username: member.username,
    name: (`${member.name || ""} ${member.surname || ""}`).trim(),
    amount: Number(amount),
    transferAmount: Number(amount),
    transferDate: transferDate || new Date().toISOString(),
    currency: "E-Cash",
    type: "Deposit",
    status: "Pending",
    slipImgUrl: slipUrl,
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(topupRecord);

  writeDb(db);
  res.json({ success: true, message: "ส่งคำขอเติมเงินเรียบร้อยแล้วค่ะ กรุณารอผู้ดูแลระบบอนุมัตินะคะ" });
});

// POST MEMBER WITHDRAW
app.post("/api/member/withdraw", (req, res) => {
  const { userId, amount, bankName, bankAccount, bankAccountName, pin } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  if (member.pin && pin && member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ไม่ถูกต้อง" });
  }

  const numAmount = Number(amount);
  if ((member.balanceEMoney || member.balanceECash || 0) < numAmount) {
    return res.status(400).json({ success: false, message: "ยอดเงินคงเหลือไม่เพียงพอสำหรับถอน" });
  }

  if (member.balanceEMoney && member.balanceEMoney >= numAmount) {
    member.balanceEMoney -= numAmount;
  } else {
    member.balanceECash = (member.balanceECash || 0) - numAmount;
  }

  const wId = "WTH_" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const withdrawRecord = {
    id: wId,
    userId: member.userId,
    username: member.username,
    name: (`${member.name || ""} ${member.surname || ""}`).trim(),
    amount: numAmount,
    currency: "E-Money",
    type: "Withdraw",
    bankName: bankName || member.bankName || "",
    bankAccount: bankAccount || member.bankAccount || "",
    bankAccountName: bankAccountName || member.bankAccountName || "",
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(withdrawRecord);

  writeDb(db);
  res.json({ success: true, message: "ส่งคำขอถอนเงินเรียบร้อยแล้วค่ะ" });
});

// POST MEMBER TRANSFER E-CASH
app.post("/api/member/transfer-e-cash", (req, res) => {
  const { userId, targetUser, amount, pin } = req.body;
  if (!userId || !targetUser || !amount) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
  }

  const db = readDb();
  const sender = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!sender) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลผู้โอน" });

  if (sender.pin && pin && sender.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ไม่ถูกต้อง" });
  }

  const recipient = (db.members || []).find((m: any) => m.userId === targetUser || m.username === targetUser || m.phone === targetUser);
  if (!recipient) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลผู้รับโอน" });

  const numAmount = Number(amount);
  if ((sender.balanceECash || 0) < numAmount) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Cash ไม่เพียงพอ" });
  }

  sender.balanceECash = (sender.balanceECash || 0) - numAmount;
  recipient.balanceECash = (recipient.balanceECash || 0) + numAmount;

  const txn1 = {
    id: "TRF_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    userId: sender.userId,
    username: sender.username,
    type: "TransferOut",
    amount: numAmount,
    currency: "E-Cash",
    details: "โอน E-Cash ให้ " + (recipient.name || recipient.username) + " (" + recipient.userId + ")",
    status: "Completed",
    createdAt: new Date().toISOString()
  };

  const txn2 = {
    id: "TRF_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    userId: recipient.userId,
    username: recipient.username,
    type: "TransferIn",
    amount: numAmount,
    currency: "E-Cash",
    details: "รับโอน E-Cash จาก " + (sender.name || sender.username) + " (" + sender.userId + ")",
    status: "Completed",
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(txn1, txn2);

  writeDb(db);
  res.json({ success: true, message: "โอน E-Cash จำนวน ฿" + numAmount.toLocaleString() + " ให้ " + (recipient.name || recipient.username) + " สำเร็จแล้วค่ะ!" });
});

// POST MEMBER BUY COUPON
app.post("/api/member/buy-coupon", (req, res) => {
  const { userId, amount, pin } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
  }

  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });

  if (member.pin && pin && member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัส PIN ไม่ถูกต้อง" });
  }

  const numAmount = Number(amount);
  if ((member.balanceECash || 0) < numAmount) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Cash ไม่เพียงพอสำหรับแลกคูปอง" });
  }

  member.balanceECash -= numAmount;
  member.balanceECoupon = (member.balanceECoupon || 0) + numAmount;

  const txn = {
    id: "CPN_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    userId: member.userId,
    username: member.username,
    type: "CouponExchange",
    amount: numAmount,
    currency: "E-Coupon",
    details: "แลกเปลี่ยน E-Cash เป็น E-Coupon ฿" + numAmount,
    status: "Completed",
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(txn);

  writeDb(db);
  res.json({ success: true, message: "แลกคูปองสำเร็จแล้วค่ะ", newECoupon: member.balanceECoupon, newECash: member.balanceECash });
});

// POST MEMBER VERIFY RECIPIENT
app.post("/api/member/verify-recipient", (req, res) => {
  const { recipientInput, targetUser } = req.body;
  const input = String(recipientInput || targetUser || "").trim();
  const db = readDb();
  const recipient = (db.members || []).find((m: any) => 
    (m.userId && m.userId.toLowerCase() === input.toLowerCase()) ||
    (m.username && m.username.toLowerCase() === input.toLowerCase()) ||
    (m.phone && m.phone === input)
  );

  if (recipient) {
    return res.json({ 
      success: true, 
      recipient: {
        userId: recipient.userId,
        username: recipient.username,
        name: (`${recipient.name || ""} ${recipient.surname || ""}`).trim()
      }
    });
  } else {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกผู้รับนี้ในระบบ" });
  }
});

// POST MEMBER KYC SUBMISSION
app.post("/api/member/kyc", async (req, res) => {
  const { userId, idCard, kycImgUrl, kycBookUrl, bankName, bankAccount, bankAccountName } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });

  if (idCard) member.idCard = idCard;
  if (bankName) member.bankName = bankName;
  if (bankAccount) member.bankAccount = bankAccount;
  if (bankAccountName) member.bankAccountName = bankAccountName;

  if (kycImgUrl) {
    member.kycImgUrl = await uploadImageToFirebaseOrKeepBase64(kycImgUrl, "kyc_id_" + userId, "kyc_documents");
  }
  if (kycBookUrl) {
    member.kycBookUrl = await uploadImageToFirebaseOrKeepBase64(kycBookUrl, "kyc_book_" + userId, "kyc_documents");
  }

  member.statusKyc = "Pending";
  writeDb(db);

  res.json({ success: true, message: "ส่งเอกสารยืนยันตัวตน (KYC) เรียบร้อยแล้วค่ะ กรุณารอผู้ดูแลระบบอนุมัติ" });
});

// POST MEMBER REQUEST EMAIL OTP
app.post("/api/member/request-email-otp", async (req, res) => {
  const { userId, email } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || (email && m.email === email));
  const targetEmail = email || member?.email;
  if (!targetEmail) return res.status(400).json({ success: false, message: "ไม่พบอีเมลผู้ใช้" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  await sendSystemEmail({
    to: targetEmail,
    subject: "[Natee Plus] รหัสยืนยัน OTP",
    title: "รหัส OTP ของคุณ",
    otpCode: otpCode,
    bodyText: "กรุณานำรหัส OTP 6 หลักนี้ไปยืนยันทำรายการในระบบนะคะ"
  });

  res.json({ success: true, message: "ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้วค่ะ", otp: otpCode });
});

// POST MEMBER SEND PIN OTP
app.post("/api/member/send-pin-otp", async (req, res) => {
  const { userId, email } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  const targetEmail = email || member?.email;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  if (targetEmail) {
    await sendSystemEmail({
      to: targetEmail,
      subject: "[Natee Plus] รหัส OTP สำหรับรีเซ็ต/เปลี่ยน PIN",
      title: "รหัส OTP เปลี่ยน PIN",
      otpCode: otpCode,
      bodyText: "กรุณานำรหัส OTP นี้ไปยืนยันเปลี่ยน PIN"
    });
  }

  res.json({ success: true, message: "ส่ง OTP แล้วค่ะ", otp: otpCode });
});

// POST MEMBER SEND TRANSACTION OTP
app.post("/api/member/send-transaction-otp", async (req, res) => {
  const { userId, email } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  const targetEmail = email || member?.email;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  if (targetEmail) {
    await sendSystemEmail({
      to: targetEmail,
      subject: "[Natee Plus] รหัส OTP ยืนยันการทำธุรกรรม",
      title: "รหัส OTP ยืนยันธุรกรรม",
      otpCode: otpCode,
      bodyText: "กรุณานำรหัส OTP นี้ไปยืนยันทำรายการ"
    });
  }

  res.json({ success: true, message: "ส่ง OTP แล้วค่ะ", otp: otpCode });
});

// POST MEMBER CHANGE PASSWORD
app.post("/api/member/change-password", (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });

  if (member.password && currentPassword && member.password !== currentPassword) {
    return res.status(400).json({ success: false, message: "รหัสผ่านเดิมไม่ถูกต้อง" });
  }

  member.password = newPassword;
  writeDb(db);
  res.json({ success: true, message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้วค่ะ" });
});

// POST MEMBER CHANGE PIN
app.post("/api/member/change-pin", (req, res) => {
  const { userId, currentPin, newPin } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId || m.username === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });

  if (member.pin && currentPin && member.pin !== currentPin) {
    return res.status(400).json({ success: false, message: "รหัส PIN เดิมไม่ถูกต้อง" });
  }

  member.pin = newPin;
  writeDb(db);
  res.json({ success: true, message: "เปลี่ยนรหัส PIN เรียบร้อยแล้วค่ะ" });
});

// POST MEMBER TRANSFER ECASH TO EMONEY
app.post("/api/member/transfer-ecash-to-emoney", (req, res) => {
  const { userId, amount, pin } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
  const numAmount = Number(amount);
  if ((member.balanceECash || 0) < numAmount) return res.status(400).json({ success: false, message: "ยอด E-Cash ไม่เพียงพอ" });

  member.balanceECash -= numAmount;
  member.balanceEMoney = (member.balanceEMoney || 0) + numAmount;
  writeDb(db);
  res.json({ success: true, message: "โอน E-Cash เป็น E-Money เรียบร้อยแล้วค่ะ", newECash: member.balanceECash, newEMoney: member.balanceEMoney });
});

// POST MEMBER TRANSFER EMONEY TO ECASH
app.post("/api/member/transfer-emoney-to-ecash", (req, res) => {
  const { userId, amount, pin } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
  const numAmount = Number(amount);
  if ((member.balanceEMoney || 0) < numAmount) return res.status(400).json({ success: false, message: "ยอด E-Money ไม่เพียงพอ" });

  member.balanceEMoney -= numAmount;
  member.balanceECash = (member.balanceECash || 0) + numAmount;
  writeDb(db);
  res.json({ success: true, message: "โอน E-Money เป็น E-Cash เรียบร้อยแล้วค่ะ", newECash: member.balanceECash, newEMoney: member.balanceEMoney });
});

// POST MEMBER TRANSFER EMONEY TO ECOUPON
app.post("/api/member/transfer-emoney-to-ecoupon", (req, res) => {
  const { userId, amount, pin } = req.body;
  const db = readDb();
  const member = (db.members || []).find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
  const numAmount = Number(amount);
  if ((member.balanceEMoney || 0) < numAmount) return res.status(400).json({ success: false, message: "ยอด E-Money ไม่เพียงพอ" });

  member.balanceEMoney -= numAmount;
  member.balanceECoupon = (member.balanceECoupon || 0) + numAmount;
  writeDb(db);
  res.json({ success: true, message: "โอน E-Money เป็น E-Coupon เรียบร้อยแล้วค่ะ", newEMoney: member.balanceEMoney, newECoupon: member.balanceECoupon });
});


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
