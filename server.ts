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
  const smtpFrom = process.env.SMTP_FROM || `Natee Plus <${smtpUser}>`;

  if (!smtpUser || !smtpPass) {
    console.log(`✉️ [SMTP Email] Credentials not configured in process.env (missing SMTP_USER/SMTP_PASS). Simulated email to: ${to} | Subject: ${subject} | OTP: ${otpCode || 'N/A'}`);
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
          <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 12px; color: #0f172a;">${title}</h2>
          <p style="font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.6;">
            ${bodyText || 'รหัสยืนยันตัวตน OTP ของท่านสำหรับทำรายการในระบบ Natee Plus คือ:'}
          </p>
          ${otpCode ? `
            <div style="background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 16px; margin: 0 auto 24px auto; max-width: 280px;">
              <span style="font-family: monospace, Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0369a1;">${otpCode}</span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">รหัส OTP นี้มีอายุการใช้งาน 5 นาที และเป็นรหัสส่วนตัว โปรดอย่าเปิดเผยให้ผู้อื่นทราบ</p>
          ` : ''}
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Natee Plus Co., Ltd. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html: htmlContent,
      text: `${title}\n\n${bodyText || 'รหัส OTP ของคุณคือ:'} ${otpCode || ''}`,
    });

    console.log(`✅ [SMTP Email Success] Email sent to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`❌ [SMTP Email Error] Failed to send email to ${to}:`, err);
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
      const storagePath = `${folderName}/${fileNamePrefix}_${timestamp}_${randomStr}.${ext}`;
      const imgRef = storageRef(storage, storagePath);

      await uploadString(imgRef, dataUrlOrPath, 'data_url');
      const downloadUrl = await getDownloadURL(imgRef);
      console.log(`✅ Uploaded image to Firebase Storage (${folderName}):`, downloadUrl);
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
    const fileName = `${fileNamePrefix}_${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, fileName), base64Content, 'base64');
    localPath = `/uploads/${fileName}`;
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
            'Authorization': `Bearer ${channelToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(linePayload)
        });

        const respData = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          console.error('❌ LINE Messaging API Error:', respData);
          const detailMsg = respData.message || (respData.details && respData.details[0]?.message) || JSON.stringify(respData);
          result = { success: false, message: `LINE API Error (${resp.status}): ${detailMsg}` };
        } else {
          result = { success: true, message: "ส่งแจ้งเตือนผ่าน LINE Messaging API สำเร็จแล้วค่ะ" };
        }
      } catch (err: any) {
        console.error('❌ LINE Messaging API Exception:', err);
        result = { success: false, message: `ไม่สามารถเชื่อมต่อ LINE API ได้: ${err.message}` };
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

  console.log(`📡 [Server] Setting up real-time sync listeners for Firestore collection: ${collectionName}`);
  
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
              console.log(`⏳ [Server Sync Blocked] Ignored Firestore snapshot for '${key}' because local write is in progress or pending.`);
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
                  if (key === 'products' && !merged.some((p: any) => p && p.category !== 'Package')) {
                    for (const defProd of DEFAULT_GENERAL_PRODUCTS) {
                      if (!merged.some((p: any) => p && p.id === defProd.id)) {
                        merged.push({ ...defProd });
                        hasLocalOnlyItems = true;
                      }
                    }
                  }
                  cacheDb[key] = merged;
                } else {
                  cacheDb[key] = incomingData;
                }

                if (hasLocalOnlyItems) {
                  console.log(`🛡️ [Server Real-Time Sync] Preserved local items for '${key}' during sync merge.`);
                  saveDbToFirestore(cacheDb).catch(() => {});
                }
              } else {
                cacheDb[key] = incomingData;
              }

              if (key === 'members') {
                console.log(`🔔 [Server Real-Time Sync] Synced 'members' from Firestore. Total members: ${cacheDb.members?.length || 0}`);
              } else if (key === 'bankSettings') {
                console.log(`🔔 [Server Real-Time Sync] Synced 'bankSettings' from Firestore.`);
              } else {
                console.log(`🔔 [Server Real-Time Sync] Synced '${key}' from Firestore.`);
              }
              
              try {
                fs.writeFileSync(currentDbFile, JSON.stringify(cacheDb, null, 2), 'utf8');
              } catch (fsErr) {
                console.error(`❌ [Server Real-Time Sync] Failed to write backup for '${key}':`, fsErr);
              }
            }
          }
        }
      }, (err) => {
        console.error(`❌ [Server Real-Time Sync] Subscription error on key '${key}':`, err);
      });
      activeServerSubscriptions.push(unsub);
    } catch (err) {
      console.error(`❌ [Server Real-Time Sync] Failed to subscribe to key '${key}':`, err);
    }
  }
}

const DEFAULT_GENERAL_PRODUCTS = [
  {
    id: "shopee_elec_01",
    name: "🔋 พาวเวอร์แบงค์ชาร์จเร็ว Ultra-Charge 20000mAh",
    price: 690,
    pv: 345,
    cost: 200,
    image: "https://images.unsplash.com/photo-1609592424085-f55a02f3a61d?auto=format&fit=crop&q=80&w=300",
    description: "พาวเวอร์แบงค์ดีไซน์บางเฉียบ รองรับระบบชาร์จไว 22.5W มีหน้าจอ LED บอกเปอร์เซ็นต์แบต ปลอดภัยพกพาสะดวกผ่านเกณฑ์ขึ้นเครื่องบิน มั่นใจตลอดทริปเดินทางของคุณ",
    shortDescription: "พาวเวอร์แบงค์ชาร์จเร็วความจุสูง 20000mAh มีหน้าจอ LED",
    category: "Electronics",
    status: "Approved",
    isAvailable: true
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
    category: "Fashion",
    status: "Approved",
    isAvailable: true
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
    category: "Beauty",
    status: "Approved",
    isAvailable: true
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
    category: "Home",
    status: "Approved",
    isAvailable: true
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
    category: "Food",
    status: "Approved",
    isAvailable: true
  }
];

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
                console.error(`❌ [Background Reset] Failed to fetch production key '${key}':`, e);
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
        await saveDbToFirestore(cacheDb, true);
        console.log("✅ Sandbox database successfully initialized with production snapshot.");
        return;
      }
    }

    if (hasData) {
      console.log(`✅ Successfully loaded all database sections from Firestore (${collectionName})`);
      
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
      let hasMergedChanges = hasFilteredGhostProducts;

      if (localDb && Array.isArray(localDb.members)) {
        for (const localMember of localDb.members) {
          if (!localMember || !localMember.userId) continue;
          const idx = mergedMembers.findIndex((m: any) => m.userId === localMember.userId);
          if (idx === -1) {
            console.log(`📦 Merging local member into Firestore: ${localMember.userId} / ${localMember.username}`);
            mergedMembers.push(localMember);
            hasMergedChanges = true;
          } else {
            // If local member's state is newer (based on lastUpdated), preserve the local member data completely!
            const fMember = mergedMembers[idx];
            if (localMember.lastUpdated && fMember.lastUpdated && localMember.lastUpdated > fMember.lastUpdated) {
              console.log(`🛠️ [Self-Heal] Restoring newer local member data for ${localMember.userId} (Local: ${localMember.lastUpdated} > Firestore: ${fMember.lastUpdated})`);
              mergedMembers[idx] = { ...localMember };
              hasMergedChanges = true;
            } else {
              // Self-heal/merge: If the local member is Active but Firestore is Pending (e.g. write quota failed), preserve the approved active state!
              if (localMember.sellerStatus === 'Active' && fMember.sellerStatus !== 'Active') {
                console.log(`🛠️ Self-healing member ${localMember.userId} (${localMember.sellerCode}) status to Active (restoring local approved state)`);
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
        console.log(`🛠️ Forced safety activation for A260002 inside merged memory structures.`);
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

      // Merge seller products (union by id)
      const mergedSellerProducts = [...(loadedData.sellerProducts || [])];
      if (localDb && Array.isArray(localDb.sellerProducts)) {
        for (const localProd of localDb.sellerProducts) {
          if (!localProd || !localProd.id) continue;
          const idx = mergedSellerProducts.findIndex((p: any) => p.id === localProd.id);
          if (idx === -1) {
            console.log(`📦 Merging local seller product into memory: ${localProd.id}`);
            mergedSellerProducts.push(localProd);
            hasMergedChanges = true;
          } else {
            const fProd = mergedSellerProducts[idx];
            if (localProd.status === 'Approved' && fProd.status !== 'Approved') {
              console.log(`🛠️ Self-healing seller product ${localProd.id} to Approved`);
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
            console.log(`📦 Merging local product into main store: ${localProd.id} / ${localProd.name}`);
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
              console.log(`🛠️ [Self-Heal Product] Restoring approved seller product into main store: ${sProd.id} / ${sProd.name}`);
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
                console.log(`🔄 [Sync Product Data] Updating main store product ${sProd.id} (${sProd.name}) to match latest seller product data`);
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
              console.log(`🛠️ [Self-Heal SellerProduct] Restoring missing seller product ${mProd.id} (${mProd.name}) from main products into sellerProducts.`);
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
          console.log(`🛠️ [Self-Heal Product] Auto-injecting missing default product: ${defProd.id} / ${defProd.name}`);
          mergedProducts.push({ ...defProd });
          hasMergedChanges = true;
        }
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
        bankSettings: loadedData.bankSettings || (localDb && localDb.bankSettings) || undefined,
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
            currentNatee.name !== "บริษัท นที พลัส มาร์เก็ต" ||
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
              name: "บริษัท นที พลัส มาร์เก็ต",
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
            name: "บริษัท นที พลัส มาร์เก็ต",
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
          saveDbToFirestore(cacheDb, true).catch(err => console.error("❌ Failed to save self-healed DB to Firestore:", err));
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
        saveDbToFirestore(cacheDb, true).catch(err => console.error("❌ Failed to save seeded DB to Firestore:", err));
      } else {
        console.log(`⚠️ No local file ${currentDbFile} found to seed Firestore.`);
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
        console.log(`💾 [Local Fallback] Successfully loaded database from local file ${currentDbFile} after Firestore error.`);
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
        name: "บริษัท นที พลัส มาร์เก็ต",
        surname: "จำกัด",
        phone: "0635161734",
        idCard: "1233445566778",
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

    // Safety: If current write is accidentally empty but cacheDb has valid items, merge back cacheDb items
    if (data.products.length === 0 && cacheDb && Array.isArray(cacheDb.products) && cacheDb.products.length > 0) {
      console.warn("⚠️ [writeDb Safety] Restoring products from cacheDb because incoming products array was empty.");
      data.products = [...cacheDb.products];
    }
    if (data.sellerProducts.length === 0 && cacheDb && Array.isArray(cacheDb.sellerProducts) && cacheDb.sellerProducts.length > 0) {
      console.warn("⚠️ [writeDb Safety] Restoring sellerProducts from cacheDb because incoming sellerProducts array was empty.");
      data.sellerProducts = [...cacheDb.sellerProducts];
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
      
      // Deduct only net E-Money (80% of commission) from parent's eligible income rights
      const prospectiveNet = commissionAmount * 0.80;
      const actualNet = isManagerOrAdmin ? prospectiveNet : Math.min(prospectiveNet, parentRights);
      const actualPayout = isManagerOrAdmin ? commissionAmount : parseFloat((actualNet / 0.80).toFixed(4));
      
      if (actualPayout > 0) {
        if (!isManagerOrAdmin) {
          parent.eligibleRights = parseFloat(Math.max(0, parent.eligibleRights - actualNet).toFixed(4));
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
        const currentCsrBal = (typeof db.csrFund?.balance === 'number' && !isNaN(db.csrFund.balance)) ? db.csrFund.balance : 0;
        db.csrFund.balance = parseFloat((currentCsrBal + csrAllocation).toFixed(4));
        db.csrFund.history.push({
          id: "CSR_TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          username: parent.username || parent.userId || "สมาชิก",
          name: (parent.name && parent.surname) ? `${parent.name} ${parent.surname}` : (parent.name || parent.username || "ผู้ใหญ่ใจดี"),
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
          amount: parseFloat(netECash.toFixed(4)),
          currency: "E-Money",
          details: `คอมมิชชันผังไบนารี ชั้นที่ ${level} (จ่ายจริงลำดับที่ ${paidLayersCount + 1}) จากการสั่งซื้อของรหัส ${buyerId}`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });

        if (netCoupon > 0) {
          db.transactions.push({
            id: "COUP_COMM_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            userId: parent.userId,
            type: "Bonus",
            amount: parseFloat(netCoupon.toFixed(4)),
            currency: "E-Coupon",
            details: `โบนัส E-Coupon (10% หักเข้าคูปอง) จากคอมมิชชันผังไบนารี ชั้นที่ ${level} รหัส ${buyerId}`,
            status: "Approved",
            createdAt: new Date().toISOString()
          });
        }
        
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
  
  // Deduct only net E-Money (80% of grossAmount) from eligible income rights
  const prospectiveNet = grossAmount * 0.80;
  const actualNet = isManagerOrAdmin ? prospectiveNet : Math.min(prospectiveNet, currentRights);
  const actualPayout = isManagerOrAdmin ? grossAmount : parseFloat((actualNet / 0.80).toFixed(4));
  
  if (actualPayout > 0) {
    if (!isManagerOrAdmin) {
      recipient.eligibleRights = parseFloat(Math.max(0, recipient.eligibleRights - actualNet).toFixed(4));
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
    const currentCsrBal = (typeof db.csrFund?.balance === 'number' && !isNaN(db.csrFund.balance)) ? db.csrFund.balance : 0;
    db.csrFund.balance = parseFloat((currentCsrBal + csrAllocation).toFixed(4));
    db.csrFund.history.push({
      id: "CSR_TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      username: recipient.username || recipient.userId || "สมาชิก",
      name: (recipient.name && recipient.surname) ? `${recipient.name} ${recipient.surname}` : (recipient.name || recipient.username || "ผู้ใหญ่ใจดี"),
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

    if (netCoupon > 0) {
      db.transactions.push({
        id: "COUP_BON_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userId: recipient.userId,
        type: "Bonus",
        amount: parseFloat(netCoupon.toFixed(4)),
        currency: "E-Coupon",
        details: `โบนัส E-Coupon (หักเข้าคูปอง 10%) จาก${detailsText}`,
        status: "Approved",
        createdAt: new Date().toISOString()
      });
    }
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
        const currentCsrBal = (typeof db.csrFund?.balance === 'number' && !isNaN(db.csrFund.balance)) ? db.csrFund.balance : 0;
        db.csrFund.balance = parseFloat((currentCsrBal + totalCsrAllocation).toFixed(4));
        db.csrFund.history.push({
          id: "CSR_TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          username: parentMember.username || parentMember.userId || "สมาชิก",
          name: (parentMember.name && parentMember.surname) ? `${parentMember.name} ${parentMember.surname}` : (parentMember.name || parentMember.username || "ผู้ใหญ่ใจดี"),
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

        if (netCoupon > 0) {
          db.transactions.push({
            id: `COUP_PLANB${tierNum}_` + Math.random().toString(36).substr(2, 9).toUpperCase(),
            userId: parentMember.userId,
            type: "Bonus",
            amount: parseFloat(netCoupon.toFixed(4)),
            currency: "E-Coupon",
            details: `โบนัส E-Coupon จากระบบ Plan B${tierNum} สำเร็จลูป`,
            status: "Approved",
            createdAt: new Date().toISOString()
          });
        }
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
    password: password || "Natee!234",
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
    defaultPassword: password || "Natee!234",
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
  const { phone, userId } = req.body;
  const db = readDb();
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.json({ success: false, isFormatError: true, message: "เบอร์โทรศัพท์ต้องครบ 10 หลัก (ตัวเลข)" });
  }
  const existingPhone = db.members.find(m => m.phone === phone && m.userId !== userId);
  if (existingPhone) {
    res.json({ success: false, message: "เบอร์โทรศัพท์นี้ถูกใช้สมัครสมาชิกแล้ว" });
  } else {
    res.json({ success: true, message: "เบอร์โทรศัพท์นี้สามารถใช้งานได้" });
  }
});

// CHECK EMAIL DUPLICATE
app.post('/api/auth/check-email', (req, res) => {
  const { email, userId } = req.body;
  const db = readDb();
  if (!email || !email.includes('@')) {
    return res.json({ success: false, isFormatError: true, message: "อีเมลต้องมีเครื่องหมาย @ ในข้อความ" });
  }
  const existingEmail = db.members.find(m => m.email && m.email.toLowerCase() === email.toLowerCase().trim() && m.userId !== userId);
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

  // CHECK MAINTENANCE MODE: Only Admin/Manager can login when active
  const isMaintenance = db.bankSettings?.maintenanceMode === true;
  const isAdminOrManager = member.role === 'Admin' || member.role === 'Manager' || member.role?.toLowerCase() === 'admin' || member.role?.toLowerCase() === 'manager';

  if (isMaintenance && !isAdminOrManager) {
    return res.status(403).json({
      success: false,
      message: "ขณะนี้ระบบอยู่ระหว่างการอัปเดต อนุญาตเฉพาะสิทธิ์ผู้ดูแลระบบ (Admin/Manager) เข้าสู่ระบบเท่านั้นค่ะ"
    });
  }
  
  const isDefaultPass = member.password === "Natee!234" || member.password === "Natt!234" || member.password === "Netee!234";
  const forceFirstLogin = member.firstLogin ?? (member.passwordReset || isDefaultPass);

  res.json({
    success: true,
    userId: member.userId,
    username: member.username,
    name: member.name,
    surname: member.surname,
    phone: member.phone,
    rank: member.rank,
    role: member.role,
    firstLogin: forceFirstLogin,
    passwordReset: member.passwordReset || forceFirstLogin
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
    if (newPassword === "Natee!234" || newPassword === "Natt!234" || newPassword === "Netee!234") {
      return res.status(400).json({ success: false, message: "ห้ามใช้รหัสผ่านเริ่มต้นระบบเพื่อความปลอดภัยค่ะ" });
    }
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNum = /[0-9]/.test(newPassword);
    const hasSpec = /[^A-Za-z0-9]/.test(newPassword);
    const isEng = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]*$/.test(newPassword);
    
    if (newPassword.length < 6 || !hasUpper || !hasLower || !hasNum || !hasSpec || !isEng) {
      return res.status(400).json({ 
        success: false, 
        message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร ประกอบด้วยตัวอักษรใหญ่ (A-Z), ตัวเล็ก (a-z), ตัวเลข (0-9) และอักขระพิเศษ (เช่น @, #, $, !)" 
      });
    }
    member.password = newPassword;
  }
  
  if (!newPin || newPin.length !== 6 || !/^\d+$/.test(newPin)) {
    return res.status(400).json({ success: false, message: "รหัส PIN ต้องเป็นตัวเลข 6 หลักเท่านั้น" });
  }
  
  member.pin = newPin;
  member.firstLogin = false;
  member.passwordReset = false;
  
  writeDb(db);
  res.json({ success: true, message: "ตั้งค่ารหัสผ่านใหม่และรหัส PIN เรียบร้อยแล้ว!" });
});

// SEND OTP FOR REGISTER
app.post('/api/auth/send-register-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: "กรุณาระบุอีเมลที่ถูกต้องค่ะ" });
  }

  // Trigger SMTP email sending
  sendSystemEmail({
    to: email,
    subject: '[Natee Plus] รหัส OTP สำหรับสมัครสมาชิกใหม่',
    title: 'รหัส OTP ยืนยันสมัครสมาชิก',
    otpCode: otp,
    bodyText: 'ท่านได้ทำการขอรหัส OTP เพื่อยืนยันการสมัครสมาชิกใหม่ในระบบ Natee Plus'
  }).catch(err => console.error("Async email error:", err));

  res.json({
    success: true,
    message: `ส่งรหัส OTP ไปยังอีเมล ${email} เรียบร้อยแล้วค่ะ`,
    otpSimulated: otp
  });
});

// REQUEST PASSWORD RESET (OTP Request via Email)
app.post('/api/auth/forgot', async (req, res) => {
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
  
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) {
    db.otps = {};
  }
  db.otps[member.userId] = otpCode;
  
  writeDb(db);
  
  // Trigger SMTP email sending
  sendSystemEmail({
    to: member.email,
    subject: '[Natee Plus] รหัส OTP สำหรับรีเซ็ตรหัสผ่าน',
    title: 'รหัส OTP รีเซ็ตรหัสผ่าน',
    otpCode: otpCode,
    bodyText: `เรียนคุณ ${member.name || member.username}\nท่านได้ทำการขอรหัส OTP เพื่อทำการรีเซ็ตรหัสผ่านในระบบ Natee Plus`
  }).catch(err => console.error("Async email error:", err));

  res.json({
    success: true,
    otpSimulated: otpCode,
    email: member.email,
    message: `ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล ${member.email} ของท่านเรียบร้อยแล้วค่ะ`
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
  member.password = "Natee!234";
  member.passwordReset = true;
  member.firstLogin = false;
  
  // Clear the used OTP
  delete db.otps[member.userId];
  
  writeDb(db);
  
  res.json({
    success: true,
    message: "ยืนยันรหัส OTP ถูกต้อง! ระบบได้ทำการกำหนดรหัสผ่านชั่วคราวของท่านเป็น Natee!234 เรียบร้อยแล้ว (ท่านจะต้องเปลี่ยนรหัสผ่านใหม่ทันทีเมื่อล็อกอินเข้าระบบ)"
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
  
  // Self-heal bank details from KYC if missing on member
  let hasSelfHealed = false;
  if (!member.bankName && member.kycBankName) {
    member.bankName = member.kycBankName;
    hasSelfHealed = true;
  }
  if (!member.bankAccount && member.kycBankAccount) {
    member.bankAccount = member.kycBankAccount;
    hasSelfHealed = true;
  }
  if (hasSelfHealed) {
    writeDb(db);
  }

  // Return safe profile summary data
  res.json({
    success: true,
    isSandboxActive: isSandboxActive,
    isFirestoreQuotaExceeded: isFirestoreQuotaExceeded || !isDatabaseLoadedFromFirestore,
    profile: {
      userId: member.userId,
      username: member.username,
      name: member.name,
      surname: member.surname,
      phone: member.phone,
      idCard: member.idCard,
      bankName: member.bankName || member.kycBankName || "",
      bankAccount: member.bankAccount || member.kycBankAccount || "",
      bankAccountName: member.bankAccountName || `${member.name || ''} ${member.surname || ''}`.trim(),
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
      kycAddress: member.kycAddress || "",
      kycImgUrl: member.kycImgUrl || "",
      kycBookUrl: member.kycBookUrl || "",
      kycRejectReason: member.kycRejectReason || "",
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
      selectedPackageItems: member.selectedPackageItems || [],
      shippingLat: member.shippingLat || null,
      shippingLng: member.shippingLng || null,
      shippingPinStatus: member.shippingPinStatus || (member.shippingLat ? 'Confirmed' : 'NotPinned'),
      pendingShippingLat: member.pendingShippingLat || null,
      pendingShippingLng: member.pendingShippingLng || null,
      warehouseAddress: member.warehouseAddress || "",
      warehouseHouseNo: member.warehouseHouseNo || "",
      warehouseMoo: member.warehouseMoo || "",
      warehouseRoad: member.warehouseRoad || "",
      warehouseProvince: member.warehouseProvince || "",
      warehouseDistrict: member.warehouseDistrict || "",
      warehouseSubdistrict: member.warehouseSubdistrict || "",
      warehouseZipcode: member.warehouseZipcode || "",
      lastUpdated: member.lastUpdated || Date.now()
    }
  });
});

// SUBMIT KYC
app.post('/api/member/kyc', async (req, res) => {
  const { userId, idCardFile, bankBookFile, address, beneficiary, relation, bankName, bankAccount, bankAccountName } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  }
  
  // Save file to Firebase Storage or base64/local fallback
  let idCardUrl = "";
  let bankBookUrl = "";
  
  try {
    if (idCardFile && idCardFile.startsWith("data:")) {
      idCardUrl = await uploadImageToFirebaseOrKeepBase64(idCardFile, 'kyc', `kyc_id_${userId}`);
    } else if (idCardFile) {
      idCardUrl = idCardFile;
    }
    
    if (bankBookFile && bankBookFile.startsWith("data:")) {
      bankBookUrl = await uploadImageToFirebaseOrKeepBase64(bankBookFile, 'kyc', `kyc_bank_${userId}`);
    } else if (bankBookFile) {
      bankBookUrl = bankBookFile;
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
app.post('/api/member/topup', async (req, res) => {
  const { userId, amount, transferAmount, transferDate, slipFile, qrCode } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  let slipImgUrl = "";
  try {
    if (slipFile && slipFile.startsWith("data:")) {
      slipImgUrl = await uploadImageToFirebaseOrKeepBase64(slipFile, 'slips', `slip_topup_${userId}`);
    } else if (slipFile) {
      slipImgUrl = slipFile;
    }
  } catch (err) {
    console.error("Error saving slip", err);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกเอกสารรูปภาพสลิป" });
  }

  let isAutoApproved = false;
  let autoApproveMessage = "";
  let slipRef = "";
  let verifiedAmount = parseFloat(transferAmount);
  let debugApiResult = "";

  if (qrCode) {
    try {
      console.log(`[SlipOK] Verifying QR Code: ${qrCode.substring(0, 40)}...`);
      debugApiResult = "กำลังเรียก API...";
      const apiResponse = await fetch('https://connect.slip2go.com/api/verify-slip/qr-code/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer zK5fmJRcipAaYORrhuqxN4XqOrSyq+wCy92gsFBag94='
        },
        body: JSON.stringify({
          payload: {
            qrCode: qrCode
          }
        })
      });

      if (apiResponse.ok) {
        const resJson = await apiResponse.json();
        console.log("[SlipOK] Response JSON:", JSON.stringify(resJson, null, 2));

        if (resJson.success || (resJson.data && resJson.data.success !== false) || resJson.code === "200000") {
          const payload = resJson.data || resJson;
          
          const slipAmount = parseFloat(payload.amount);
          
          // Parse receiver name from possible nested paths
          const receiverName = (
            payload.receiver?.account?.name ||
            payload.receiver?.displayName ||
            payload.receiver?.name ||
            ""
          ).toString();
          
          // Parse receiver account from possible nested paths
          let receiverAccount = "";
          if (payload.receiver?.account) {
            if (typeof payload.receiver.account === "object") {
              receiverAccount = (
                payload.receiver.account.bank?.account ||
                payload.receiver.account.value ||
                payload.receiver.account.no ||
                JSON.stringify(payload.receiver.account)
              ).toString();
            } else {
              receiverAccount = payload.receiver.account.toString();
            }
          }

          slipRef = payload.transRef || payload.ref || payload.transactionId || `REF_${Date.now()}`;

          console.log(`[SlipOK] Parsed details: Amount=${slipAmount}, ReceiverName=${receiverName}, ReceiverAccount=${receiverAccount}, Ref=${slipRef}`);

          // Anti-fraud: Check duplication
          const isDuplicate = db.transactions?.some(t => t.slipRef === slipRef && t.status === "Approved");
          if (isDuplicate) {
            return res.status(400).json({ success: false, message: "สลิปโอนเงินนี้เคยถูกใช้งานและอนุมัติในระบบไปแล้ว ไม่สามารถใช้ซ้ำได้ค่ะ" });
          }

          // Recipient verification (either matches Bank settings or นาย กฤศวัฒน์ / บริษัท นที พลัส)
          const targetAccount = db.bankSettings?.bankAccount || "7420037223";
          const targetAccountName = db.bankSettings?.bankAccountName || "นาย กฤศวัฒน์ เลิศวิริยาภรณ์";
          
          const cleanString = (str: string) => str.replace(/[^0-9]/g, '');
          const cleanTargetAcc = cleanString(targetAccount);
          const cleanSlipAcc = cleanString(receiverAccount);

          const isCorrectReceiver = 
            receiverName.includes("กฤศวัฒน์") || 
            receiverName.toLowerCase().includes("krisawat") ||
            receiverName.includes("นที") || 
            receiverName.toLowerCase().includes("natee") ||
            (cleanSlipAcc.length > 0 && cleanTargetAcc.includes(cleanSlipAcc)) ||
            (cleanTargetAcc.length > 0 && cleanSlipAcc.includes(cleanTargetAcc));

          if (isCorrectReceiver && slipAmount > 0) {
            isAutoApproved = true;
            verifiedAmount = slipAmount;
            member.balanceECash = parseFloat((member.balanceECash + slipAmount).toFixed(2));
            autoApproveMessage = `✓ ระบบอัตโนมัติ (SlipOK) ตรวจสอบสำเร็จ! สลิปมียอดเงินจริง ฿${slipAmount.toLocaleString()} ตรงตามเงื่อนไข ระบบจึงเติมเงิน E-Cash ให้คุณทันทีแล้วค่ะ ⚡`;
          } else {
            debugApiResult = `ไม่ผ่านเงื่อนไขผู้รับโอน (ผู้รับในสลิป: ${receiverName || 'ไม่ระบุ'}, บัญชี: ${receiverAccount || 'ไม่ระบุ'}, ยอดเงิน: ฿${slipAmount || 0})`;
            console.warn(`[SlipOK] Verification failed matching receiver. Receiver in slip: ${receiverName} / Account: ${receiverAccount}`);
          }
        } else {
          debugApiResult = `API แจ้งว่าไม่สำเร็จ (ข้อความ: ${resJson.message || resJson.error || 'ไม่มีรายละเอียด'})`;
        }
      } else {
        const errText = await apiResponse.text().catch(() => "");
        debugApiResult = `HTTP Error Status: ${apiResponse.status} (รายละเอียด: ${errText.substring(0, 100)})`;
        console.error("[SlipOK] API HTTP Error Status:", apiResponse.status);
      }
    } catch (apiErr: any) {
      debugApiResult = `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${apiErr.message || apiErr}`;
      console.error("[SlipOK] Exception raised during request:", apiErr);
    }
  } else {
    debugApiResult = "ไม่พบรหัสสแกน QR Code บนสลิป (สแกนจากสลิปไม่สำเร็จ)";
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
    transferAmount: verifiedAmount,
    transferDate: transferDate,
    slipImgUrl: slipImgUrl,
    currency: "E-Cash",
    details: isAutoApproved 
      ? `เติมเงิน E-Cash สำเร็จโดยอัตโนมัติ (ระบบตรวจสอบสลิป SlipOK เรียบร้อย • อ้างอิง: ${slipRef})`
      : `แจ้งเติมเงิน E-Cash ยอดแจ้งโอน ฿${parseFloat(transferAmount).toLocaleString()} (จากยอดขอคำนวณ ฿${parseFloat(amount).toLocaleString()}) [ผลการตรวจสอบอัตโนมัติ: ${debugApiResult}]`,
    status: isAutoApproved ? "Approved" : "Pending",
    slipRef: slipRef || undefined,
    approvedAt: isAutoApproved ? new Date().toISOString() : undefined,
    approvedBy: isAutoApproved ? "System (Auto-SlipOK)" : undefined,
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  
  res.json({ 
    success: true, 
    isAutoApproved,
    message: isAutoApproved 
      ? autoApproveMessage 
      : "ส่งคำขอเติมเงินและหลักฐานสลิปเรียบร้อยแล้วค่ะ รอแอดมินอนุมัติ", 
    txnId 
  });
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
  const { receiverPhoneOrUser, senderId, query } = req.body;
  const target = (receiverPhoneOrUser || query || '').toString().trim();
  const db = readDb();
  
  if (!target) {
    return res.status(400).json({ success: false, message: "กรุณาระบุรหัสผู้ใช้ เบอร์โทรศัพท์ หรือ Username ผู้รับ" });
  }
  
  const receiver = db.members.find(m => 
    m.phone === target || 
    (m.username && m.username.toLowerCase() === target.toLowerCase()) || 
    m.userId === target
  );
  if (!receiver) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกผู้รับปลายทาง กรุณาตรวจสอบเบอร์โทรหรือไอดีอีกครั้งค่ะ" });
  }
  
  if (senderId && receiver.userId === senderId) {
    return res.status(400).json({ success: false, message: "ไม่สามารถทำรายการโดยใช้บัญชีตนเองเป็นผู้รับได้ค่ะ" });
  }
  
  const recipientData = {
    userId: receiver.userId,
    name: `${receiver.name || ''} ${receiver.surname || ''}`.trim() || receiver.username || receiver.userId,
    phone: receiver.phone,
    username: receiver.username
  };

  res.json({
    success: true,
    recipient: recipientData,
    member: recipientData
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
  if (amt < 200) {
    return res.status(400).json({ success: false, message: "การถอนเงินขั้นต่ำต้องเป็น 200 บาทขึ้นไปค่ะ" });
  }
  if ((member.balanceEMoney || 0) < 200) {
    return res.status(400).json({ success: false, message: "การถอนเงินเข้าธนาคาร ต้องมียอดเงินใน E-Money ขั้นต่ำ 200 บาทขึ้นไปค่ะ" });
  }
  if ((member.balanceEMoney || 0) < amt) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Money ของคุณไม่เพียงพอสำหรับการถอนเงิน" });
  }
  
  // Deductions: 15% System reserve + 5% Tax (3% Withholding tax + 2%) = 20% Total deduction
  // Plus fixed transaction transfer fee of 25 Baht
  // Internal breakdown of 15% system reserve:
  // - 5% goes to E-Coupon (added to member's balanceECoupon)
  // - 5% goes to All-Share pool (distributed via processEShareDistribution)
  // - 5% goes to Company profit (added to db.systemStats.totalCompanyProfits)
  const systemReserve = amt * 0.15; // 15% หักเข้าระบบ
  const couponPart = amt * 0.05; // 5% ไปที่ คูปอง
  const allSharePart = amt * 0.05; // 5% ไปที่ All-Share
  const companyPart = amt * 0.05; // 5% เป็นของบริษัท

  const withholdingTax = amt * 0.05; // 5% ภาษี (3% หัก ณ ที่จ่าย + 2%)
  const totalDeduction20 = amt * 0.20; // หัก 20%
  const afterDeductionAmount = amt - totalDeduction20; // 160 บาทสำหรับยอด 200
  const transferFee = 25; // ค่าธรรมเนียมการโอน 25 บาท
  const netReceived = Math.max(0, afterDeductionAmount - transferFee); // 135 บาทสำหรับยอด 200
  
  // Deduct full withdrawal amount from member E-Money
  member.balanceEMoney = parseFloat(((member.balanceEMoney || 0) - amt).toFixed(4));
  
  // 1. Credit 5% coupon to member balanceECoupon
  member.balanceECoupon = parseFloat(((member.balanceECoupon || 0) + couponPart).toFixed(4));
  
  // Create E-Coupon transaction record
  db.transactions.push({
    id: "CPN_WITH_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Deposit",
    amount: couponPart,
    currency: "E-Coupon",
    details: `รับ E-Coupon 5% จากการหักค่าบริการถอนเงิน (฿${couponPart.toFixed(2)})`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  // 2. Distribute 5% to All-Share pool
  processEShareDistribution(db, allSharePart, member.userId);

  // 3. Record main withdrawal request transaction
  db.transactions.push({
    id: "WITH_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "WithdrawalRequest",
    amount: amt,
    autoReserve: systemReserve,
    couponPart: couponPart,
    allSharePart: allSharePart,
    companyFee: companyPart,
    taxableAmount: afterDeductionAmount,
    withholdingTax: withholdingTax,
    transferFee: transferFee,
    netAmount: netReceived,
    currency: "E-Money",
    details: `ถอนเงินออกบัญชีธนาคาร ${member.bankName} เลขที่ ${member.bankAccount}`,
    status: "Pending", // Pending Admin approval
    createdAt: new Date().toISOString()
  });
  
  if (!db.systemStats.totalTaxReserves) db.systemStats.totalTaxReserves = 0;
  if (!db.systemStats.totalCompanyProfits) db.systemStats.totalCompanyProfits = 0;
  db.systemStats.totalTaxReserves = parseFloat((db.systemStats.totalTaxReserves + withholdingTax).toFixed(4));
  db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits + companyPart + transferFee).toFixed(4));
  
  writeDb(db);
  sendSystemNotification('withdrawal', `💸 มีคำขอถอนเงิน e-Money ใหม่!\nสมาชิก: ${member.name || ''} (${member.userId})\nยอดถอน: ฿${amt.toLocaleString('th-TH')}\nยอดโอนสุทธิ: ฿${netReceived.toLocaleString('th-TH')}\nธนาคาร: ${member.bankName || '-'} (${member.bankAccount || '-'})`);
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

// REQUEST CHANGE EMAIL OTP
app.post('/api/member/request-email-otp', async (req, res) => {
  const { userId, newEmail } = req.body;
  const db = readDb();
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  const oldEmail = member.email;
  if (!oldEmail || !oldEmail.includes('@')) {
    return res.status(400).json({ success: false, message: "ไม่พบบัญชีอีเมลเดิมของสมาชิกในการรับ OTP" });
  }

  if (newEmail) {
    const existingEmail = db.members.find(m => m.email && m.email.toLowerCase() === newEmail.toLowerCase().trim() && m.userId !== userId);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "อีเมลใหม่นี้มีผู้ใช้งานแล้วในระบบ" });
    }
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) db.otps = {};
  db.otps['CHANGE_EMAIL_' + userId] = otpCode;
  writeDb(db);

  try {
    await sendSystemEmail({
      to: oldEmail,
      subject: '[NaTee Plus] รหัส OTP ยืนยันการเปลี่ยนอีเมลสมาชิก',
      title: 'รหัส OTP ยืนยันการเปลี่ยนแปลงอีเมล',
      otpCode: otpCode,
      bodyText: `ท่านได้ยื่นขอเปลี่ยนอีเมลจาก ${oldEmail} เป็น ${newEmail || 'อีเมลใหม่'}\nกรุณานำรหัส OTP นี้ไปกรอกในระบบเพื่อยืนยันการเปลี่ยนอีเมล`
    });
  } catch (err) {
    console.error('Failed to send change email OTP email:', err);
  }

  res.json({
    success: true,
    otpSimulated: otpCode,
    message: `ส่งรหัส OTP 6 หลักไปยังอีเมลเดิม (${oldEmail}) เรียบร้อยแล้วค่ะ`
  });
});

// UPDATE MEMBER PROFILE BY MEMBER THEMSELF
app.post('/api/member/update-profile', (req, res) => {
  const { userId, username, email, phone, bankName, bankAccount, bankAccountName, idAddress, shippingAddress, useSameAddress, emailOtp } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  // If username changed, check if it already exists
  if (username && username.toLowerCase().trim() !== member.username.toLowerCase()) {
    const existing = db.members.find(m => m.username.toLowerCase() === username.toLowerCase().trim() && m.userId !== userId);
    if (existing) {
      return res.status(400).json({ success: false, message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });
    }
    member.username = username.toLowerCase().trim();
  }

  // Update bank account info (unlocked for editing)
  if (bankName !== undefined && typeof bankName === 'string') {
    member.bankName = bankName.trim();
    member.kycBankName = bankName.trim();
  }
  if (bankAccount !== undefined && typeof bankAccount === 'string') {
    member.bankAccount = bankAccount.trim();
    member.kycBankAccount = bankAccount.trim();
  }
  if (bankAccountName !== undefined && typeof bankAccountName === 'string') {
    member.bankAccountName = bankAccountName.trim();
  }

  // Update phone with duplicate check
  if (phone !== undefined) {
    const cleanPhone = phone.replace(/\D/g, '').trim();
    if (cleanPhone !== member.phone) {
      const existingPhone = db.members.find(m => m.phone === cleanPhone && m.userId !== member.userId);
      if (existingPhone) {
        return res.status(400).json({ success: false, message: "เบอร์โทรศัพท์นี้ถูกใช้สมัครสมาชิกแล้วในระบบ" });
      }
    }
    member.phone = cleanPhone;
  }

  // Update email with OTP verification if changed
  if (email !== undefined && email.toLowerCase().trim() !== (member.email || '').toLowerCase().trim()) {
    const cleanNewEmail = email.toLowerCase().trim();
    const existingEmail = db.members.find(m => m.email && m.email.toLowerCase() === cleanNewEmail && m.userId !== member.userId);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "อีเมลใหม่นี้ถูกใช้งานแล้วในระบบ" });
    }

    const activeOtp = db.otps ? db.otps['CHANGE_EMAIL_' + userId] : null;
    if (!emailOtp || emailOtp.trim() !== activeOtp) {
      return res.status(400).json({
        success: false,
        message: "รหัส OTP ยืนยันการเปลี่ยนอีเมลไม่ถูกต้อง กรุณาตรวจสอบหรือกดขอรับรหัส OTP อีกครั้งค่ะ"
      });
    }

    delete db.otps['CHANGE_EMAIL_' + userId];
    member.email = cleanNewEmail;
  }

  // Update address info safely
  if (idAddress && typeof idAddress === 'object') {
    // Lock ID address if KYC is Active
    if (member.statusKyc !== 'Active' || !member.idAddress || !member.idAddress.province) {
      member.idAddress = {
        ...(member.idAddress || {}),
        ...idAddress
      };
    }
  }

  if (shippingAddress && typeof shippingAddress === 'object') {
    const hasShippingFields = Object.values(shippingAddress).some(val => Boolean(val && String(val).trim()));
    if (hasShippingFields) {
      member.shippingAddress = {
        ...(member.shippingAddress || {}),
        ...shippingAddress
      };
    }
  }

  if (useSameAddress !== undefined) member.useSameAddress = useSameAddress;

  // Note: member.name and member.surname are NOT updated here to satisfy "แก้ชื่อ สกุลไม่ได้"

  writeDb(db);
  res.json({ success: true, message: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ", profile: member });
});

// UPDATE SHIPPING MAP PIN POSITION AND WAREHOUSE ADDRESS BY MEMBER
app.post('/api/member/update-shipping-pin', (req, res) => {
  const { userId, lat, lng, warehouseAddress, warehouseHouseNo, warehouseMoo, warehouseRoad, warehouseProvince, warehouseDistrict, warehouseSubdistrict, warehouseZipcode } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });
  }

  const latitude = lat ? parseFloat(lat) : null;
  const longitude = lng ? parseFloat(lng) : null;

  if (warehouseAddress !== undefined) member.warehouseAddress = warehouseAddress;
  if (warehouseHouseNo !== undefined) member.warehouseHouseNo = warehouseHouseNo;
  if (warehouseMoo !== undefined) member.warehouseMoo = warehouseMoo;
  if (warehouseRoad !== undefined) member.warehouseRoad = warehouseRoad;
  if (warehouseProvince !== undefined) member.warehouseProvince = warehouseProvince;
  if (warehouseDistrict !== undefined) member.warehouseDistrict = warehouseDistrict;
  if (warehouseSubdistrict !== undefined) member.warehouseSubdistrict = warehouseSubdistrict;
  if (warehouseZipcode !== undefined) member.warehouseZipcode = warehouseZipcode;

  if (!member.shippingPinStatus || member.shippingPinStatus === 'NotPinned' || !member.shippingLat) {
    member.shippingLat = latitude;
    member.shippingLng = longitude;
    member.shippingPinStatus = 'Confirmed';
    writeDb(db);
    return res.json({ 
      success: true, 
      message: "ปักหมุดพิกัดและบันทึกข้อมูลคลังสินค้าสำเร็จเรียบร้อยแล้วค่ะ!", 
      profile: member 
    });
  } else {
    // Already has a pin, so this is an EDIT
    member.pendingShippingLat = latitude;
    member.pendingShippingLng = longitude;
    member.shippingPinStatus = 'PendingApproval';
    writeDb(db);
    return res.json({ 
      success: true, 
      message: "ส่งคำขอแก้ไขหมุดพิกัดคลังสินค้าเรียบร้อยแล้วค่ะ! อยู่ระหว่างรอแอดมินอนุมัติการแก้ไข", 
      profile: member 
    });
  }
});

// ADMIN BROADCAST NOTIFICATION TO BELL DROPDOWN
app.post('/api/admin/broadcast-notification', (req, res) => {
  const { title, message, target } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อความแจ้งเตือน" });
  }

  const db = readDb();
  if (!Array.isArray(db.notifications)) {
    db.notifications = [];
  }

  const targetGroup = target === 'sellers' ? 'sellers' : 'all';

  const newNotif = {
    id: 'NOTIF_' + Date.now(),
    title: title || (targetGroup === 'sellers' ? "🏪 ประกาศถึงร้านค้าพันธมิตร" : "📢 ประกาศจากระบบ Natee Plus"),
    message: message.trim(),
    target: targetGroup,
    createdAt: new Date().toISOString(),
    sender: "Admin"
  };

  db.notifications.unshift(newNotif);
  if (db.notifications.length > 50) {
    db.notifications = db.notifications.slice(0, 50);
  }

  writeDb(db);
  const targetLabel = targetGroup === 'sellers' ? "กระดิ่งร้านค้าพันธมิตร" : "กระดิ่งสมาชิกทุกคน (ทั้งระบบ)";
  res.json({ success: true, message: `ส่งข้อความสั้นไปยัง${targetLabel}เรียบร้อยแล้วค่ะ! 🔔`, notification: newNotif });
});

// GET PUBLIC/SYSTEM BROADCAST NOTIFICATIONS
app.get('/api/notifications', (req, res) => {
  const db = readDb();
  const sortedNotifs = (db.notifications || []).slice().sort((a: any, b: any) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  res.json({ success: true, notifications: sortedNotifs });
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

  if (newPassword === "Natee!234" || newPassword === "Natt!234" || newPassword === "Netee!234") {
    return res.status(400).json({ success: false, message: "ห้ามใช้รหัสผ่านเริ่มต้นระบบเพื่อความปลอดภัยค่ะ" });
  }

  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNum = /[0-9]/.test(newPassword);
  const hasSpec = /[^A-Za-z0-9]/.test(newPassword);
  const isEng = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]*$/.test(newPassword);

  if (newPassword.length < 6 || !hasUpper || !hasLower || !hasNum || !hasSpec || !isEng) {
    return res.status(400).json({ 
      success: false, 
      message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร ประกอบด้วยตัวอักษรใหญ่ (A-Z), ตัวเล็ก (a-z), ตัวเลข (0-9) และอักขระพิเศษ (เช่น @, #, $, !)" 
    });
  }

  member.password = newPassword;
  writeDb(db);
  res.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้วค่ะ" });
});

// SEND TRANSACTION OTP
app.post('/api/member/send-transaction-otp', async (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) db.otps = {};
  db.otps[userId] = otpCode;
  
  writeDb(db);

  if (member.email && member.email.includes('@')) {
    sendSystemEmail({
      to: member.email,
      subject: '[Natee Plus] รหัส OTP ยืนยันการทำธุรกรรม',
      title: 'รหัส OTP ยืนยันธุรกรรมทางการเงิน',
      otpCode: otpCode,
      bodyText: `เรียนคุณ ${member.name || member.username}\nท่านได้ทำการขอรหัส OTP เพื่อยืนยันการทำธุรกรรมทางการเงินในระบบ Natee Plus`
    }).catch(err => console.error("Async email error:", err));
  }

  res.json({ 
    success: true, 
    otp: otpCode,
    message: `ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล ${member.email || 'ของท่าน'} เรียบร้อยแล้วค่ะ` 
  });
});

// SEND PIN CHANGE OTP
app.post('/api/member/send-pin-otp', async (req, res) => {
  const { userId, email, otp } = req.body;
  const db = readDb();
  
  if (!db.otps) db.otps = {};
  db.otps[userId] = otp;
  
  writeDb(db);

  const recipientEmail = email || db.members.find(m => m.userId === userId)?.email;
  if (recipientEmail && recipientEmail.includes('@')) {
    sendSystemEmail({
      to: recipientEmail,
      subject: '[Natee Plus] รหัส OTP เปลี่ยนรหัส PIN',
      title: 'รหัส OTP ยืนยันเปลี่ยนรหัส PIN',
      otpCode: otp,
      bodyText: 'ท่านได้ทำการขอรหัส OTP เพื่อยืนยันการตั้งค่าหรือเปลี่ยนรหัส PIN ในระบบ Natee Plus'
    }).catch(err => console.error("Async email error:", err));
  }

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
  const { 
    id, 
    packageId, 
    name, 
    cost, 
    productPrice, 
    shippingFee,
    packagePrice,
    salesVat,
    productCost,
    hasVat,
    inputVat,
    productCostWithVat,
    packagingCost,
    vatPayable,
    totalExpense,
    remaining,
    pvPayout,
    isActive
  } = req.body;
  const db = readDb();
  
  if (!packageId || !name) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  
  const choiceId = id || "PC_" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const parsedCost = cost !== undefined && cost !== "" ? parseFloat(cost) : 0;
  const parsedProductPrice = productPrice !== undefined && productPrice !== "" ? parseFloat(productPrice) : 0;
  const parsedShippingFee = shippingFee !== undefined && shippingFee !== "" ? parseFloat(shippingFee) : 0;
  
  if (!db.packageProductChoices) {
    db.packageProductChoices = [];
  }
  
  // Find existing choice if editing to preserve or set isActive status
  const existingChoice = db.packageProductChoices.find(c => c.id === choiceId);
  const finalIsActive = isActive !== undefined ? !!isActive : (existingChoice ? existingChoice.isActive !== false : true);

  const choiceData = { 
    id: choiceId, 
    packageId, 
    name, 
    cost: parsedCost,
    productPrice: parsedProductPrice,
    shippingFee: parsedShippingFee,
    packagePrice: packagePrice !== undefined ? parseFloat(packagePrice) : 0,
    salesVat: salesVat !== undefined ? parseFloat(salesVat) : 0,
    productCost: productCost !== undefined ? parseFloat(productCost) : 0,
    hasVat: !!hasVat,
    inputVat: inputVat !== undefined ? parseFloat(inputVat) : 0,
    productCostWithVat: productCostWithVat !== undefined ? parseFloat(productCostWithVat) : 0,
    packagingCost: packagingCost !== undefined ? parseFloat(packagingCost) : 0,
    vatPayable: vatPayable !== undefined ? parseFloat(vatPayable) : 0,
    totalExpense: totalExpense !== undefined ? parseFloat(totalExpense) : 0,
    remaining: remaining !== undefined ? parseFloat(remaining) : 0,
    pvPayout: pvPayout !== undefined ? parseFloat(pvPayout) : 0,
    isActive: finalIsActive
  };
  
  const existingIndex = db.packageProductChoices.findIndex(c => c.id === choiceId);
  if (existingIndex >= 0) {
    db.packageProductChoices[existingIndex] = choiceData;
  } else {
    db.packageProductChoices.push(choiceData);
  }
  
  writeDb(db);
  res.json({ success: true, message: "บันทึกตัวเลือกแพ็กเกจสินค้าสำเร็จ", packageProductChoices: db.packageProductChoices });
});

// TOGGLE ACTIVE STATUS OF PACKAGE CHOICE (Admin only)
app.post('/api/admin/package-choices/:id/toggle', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  if (!db.packageProductChoices) {
    db.packageProductChoices = [];
  }
  const choiceIndex = db.packageProductChoices.findIndex(c => c.id === id);
  if (choiceIndex >= 0) {
    const current = db.packageProductChoices[choiceIndex].isActive !== false;
    db.packageProductChoices[choiceIndex].isActive = !current;
    writeDb(db);
    return res.json({ success: true, message: `เปลี่ยนสถานะเป็น ${!current ? 'เปิดให้สมาชิกเลือก' : 'ปิดการแสดงผลสำเร็จ'}`, packageProductChoices: db.packageProductChoices });
  }
  res.status(404).json({ success: false, message: "ไม่พบข้อมูลตัวเลือกแพ็กเกจสินค้า" });
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
  const { userId, productId, quantity, shippingAddress, selectedChoiceId, ref, affiliateReferrerId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  const product = db.products.find(p => p.id === productId) || db.sellerProducts?.find(sp => sp.id === productId);
  if (!product) return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
  
  // Validate Security Deposit for seller if general product
  const sellerId = (product as any).sellerId || db.sellerProducts?.find((sp: any) => sp.id === product.id)?.sellerId || null;
  if (sellerId && product.category !== "Package") {
    const sellerDepositStats = getSellerDepositStats(db, sellerId);
    if (sellerDepositStats.securityDeposit > 0 && sellerDepositStats.salesLimitRemaining < (product.price * (parseInt(quantity) || 1))) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถสั่งซื้อได้เนื่องจากร้านค้านี้มียอดขายรอดำเนินการจัดส่งเต็มวงเงินประกันความเสี่ยง (฿${sellerDepositStats.activeUnfulfilledSales.toLocaleString()} / วงเงินประกัน ฿${sellerDepositStats.securityDeposit.toLocaleString()}) กรุณาแจ้งร้านค้าฝากเงินประกันเพิ่มค่ะ`
      });
    }
  }

  // If product is a package, validate selection
  const isPackage = product.category === "Package";
  const currentRank = member.rank || "Member";
  
  const qty = parseInt(quantity) || 1;
  const totalPrice = product.price * qty;
  const totalPv = product.pv * qty;
  
  // 1. For packages M and above, force choosing a package set option
  if (isPackage && productId !== "pack_s") {
    if (!selectedChoiceId) {
      return res.status(400).json({ success: false, message: "กรุณาเลือกชุดเซ็ตสินค้าของแพ็กเกจเพื่อทำรายการสั่งซื้อค่ะ" });
    }
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
  
  // Calculate Shipping Fee (Stepped structure e.g. 35 + 17.50 + 8.75...)
  const baseShippingFee = parseFloat(product.customerShippingFee || product.baseShippingCost || 35);
  let orderShippingFee = baseShippingFee;
  if (qty > 1) {
    for (let i = 2; i <= qty; i++) {
      orderShippingFee += baseShippingFee / Math.pow(2, i - 1);
    }
  }
  orderShippingFee = parseFloat(orderShippingFee.toFixed(2));

  // 100% Shipping Refund to seller + 3% Withholding Tax Deduction
  const shippingWithholdingTax = parseFloat((orderShippingFee * 0.03).toFixed(2));
  const shippingRefundNet = parseFloat((orderShippingFee - shippingWithholdingTax).toFixed(2));

  // Affiliate & Commission Calculations
  const referrerId = ref || affiliateReferrerId || null;
  let affiliateCommissionAmount = 0;

  if (referrerId && product.affiliateCommission) {
    affiliateCommissionAmount = parseFloat((totalPrice * (parseFloat(product.affiliateCommission) / 100)).toFixed(2));
  }

  // Calculate Net Seller Payout:
  const vatAmount = parseFloat((totalPrice * 7 / 107).toFixed(4));
  const companyGp = parseFloat((totalPrice * 0.20).toFixed(4));
  const netProductPayout = parseFloat((totalPrice - vatAmount - companyGp - affiliateCommissionAmount).toFixed(4));
  const sellerPayoutAmount = parseFloat((netProductPayout + shippingRefundNet).toFixed(2));

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
    shippingFee: orderShippingFee,
    shippingFeeRefund: orderShippingFee,
    shippingWithholdingTax: shippingWithholdingTax,
    affiliateCommissionAmount,
    affiliateReferrerId: referrerId,
    sellerPayoutAmount,
    shippingAddress: shippingAddress || member.kycAddress || "ไม่มีที่อยู่ผู้จัดส่ง",
    status: productId === "pack_s" ? "Completed" : "Processing",
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
    const currentCsrBal = (typeof db.csrFund?.balance === 'number' && !isNaN(db.csrFund.balance)) ? db.csrFund.balance : 0;
    db.csrFund.balance = parseFloat((currentCsrBal + 5.00).toFixed(4));
    db.csrFund.history.push({
      id: "CSR_TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      username: member.username || member.userId || "สมาชิก",
      name: (member.name && member.surname) ? `${member.name} ${member.surname}` : (member.name || member.username || "ผู้ใหญ่ใจดี"),
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
    
    // 2. PV Allocation & Affiliate Rules
    const buyerRank = member.rank || "Member";
    const isBuyerSOrAbove = buyerRank !== "Member" && buyerRank !== "";
    
    let pvBeneficiaryId = member.userId;

    if (referrerId) {
      // ORDER VIA AFFILIATE SHARE LINK
      const referrerMember = db.members.find((m: any) => m.userId === referrerId);
      const referrerRank = referrerMember?.rank || "Member";
      const isReferrerSOrAbove = referrerRank !== "Member" && referrerRank !== "";

      // Pay Affiliate Commission to referrer (if set and available)
      if (referrerMember && affiliateCommissionAmount > 0) {
        referrerMember.balanceECash = parseFloat(((referrerMember.balanceECash || 0) + affiliateCommissionAmount).toFixed(4));
        db.transactions.push({
          id: "AFF_COMM_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: referrerMember.userId,
          type: "Deposit",
          amount: affiliateCommissionAmount,
          currency: "E-Cash",
          details: `รับค่าคอมมิชชั่น Affiliate จากการแชร์สินค้า ${product.name} (บิลสั่งซื้อโดย ${member.userId})`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
      }

      if (isReferrerSOrAbove) {
        // Rule A: Referrer is rank S or higher -> PV belongs to Referrer!
        pvBeneficiaryId = referrerMember.userId;
        referrerMember.personalPV = parseFloat(((referrerMember.personalPV || 0) + totalPv).toFixed(4));
        db.transactions.push({
          id: "PV_AFF_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: referrerMember.userId,
          type: "Bonus",
          amount: totalPv,
          currency: "PV",
          details: `รับ PV จำนวน ${totalPv} PV จากการปักตะกร้าแชร์สินค้า ${product.name} (ผู้แชร์มีตำแหน่ง S ขึ้นไป)`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
      } else {
        // Referrer is Member (not S yet). PV goes to Seller!
        const sellerMember = db.members.find((m: any) => m.userId === sellerId);
        const sellerRank = sellerMember?.rank || "Member";
        const isSellerSOrAbove = sellerRank !== "Member" && sellerRank !== "";

        if (sellerMember && isSellerSOrAbove) {
          // Rule B: Seller is rank S or higher -> PV belongs to Seller!
          pvBeneficiaryId = sellerMember.userId;
          sellerMember.personalPV = parseFloat(((sellerMember.personalPV || 0) + totalPv).toFixed(4));
          db.transactions.push({
            id: "PV_SELLER_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            userId: sellerMember.userId,
            type: "Bonus",
            amount: totalPv,
            currency: "PV",
            details: `รับ PV จำนวน ${totalPv} PV จากยอดขายสินค้า ${product.name} (เนื่องจากผู้แชร์เป็น Member)`,
            status: "Approved",
            createdAt: new Date().toISOString()
          });
        } else if (sellerMember) {
          // Rule C: Seller is also Member (not S yet) -> PV bounces up to Seller's Sponsor!
          const sellerSponsor = db.members.find((m: any) => m.userId === sellerMember.sponsorId);
          if (sellerSponsor) {
            pvBeneficiaryId = sellerSponsor.userId;
            sellerSponsor.personalPV = parseFloat(((sellerSponsor.personalPV || 0) + totalPv).toFixed(4));
            db.transactions.push({
              id: "PV_SPONSOR_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
              userId: sellerSponsor.userId,
              type: "Bonus",
              amount: totalPv,
              currency: "PV",
              details: `รับ PV จำนวน ${totalPv} PV โบนัสส่งต่อ จากร้านค้าสายงาน ${sellerMember.userId} (เนื่องจากเจ้าของร้านยังไม่อยู่ในตำแหน่ง S)`,
              status: "Approved",
              createdAt: new Date().toISOString()
            });
          } else {
            pvBeneficiaryId = "A260600001";
          }
        } else {
          pvBeneficiaryId = "A260600001";
        }
      }
    } else {
      // STANDARD DIRECT PURCHASE (NO AFFILIATE LINK)
      if (isBuyerSOrAbove) {
        member.personalPV = parseFloat(((member.personalPV || 0) + totalPv).toFixed(4));
        pvBeneficiaryId = member.userId;
      } else {
        if (sponsor) {
          sponsor.personalPV = parseFloat(((sponsor.personalPV || 0) + totalPv).toFixed(4));
          pvBeneficiaryId = sponsor.userId;
          db.transactions.push({
            id: "PV_XFER_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            userId: sponsor.userId,
            type: "Bonus",
            amount: totalPv,
            currency: "PV",
            details: `รับ PV จำนวน ${totalPv} PV จากการสั่งซื้อสินค้าของสมาชิกสายงานรหัส ${member.userId} (ผู้ซื้อมีตำแหน่ง Member)`,
            status: "Approved",
            createdAt: new Date().toISOString()
          });
        } else {
          pvBeneficiaryId = "A260600001";
        }
      }
    }

    // If coupons were used, split the PV into coupon PV (held) and cash PV (processed immediately)
    if (!isPackage && couponUsed > 0) {
      const couponProportion = couponUsed / totalPrice;
      const couponPv = totalPv * couponProportion;
      const cashPv = totalPv - couponPv;
      
      if (couponPv > 0) {
        if (!db.pendingCouponPV) db.pendingCouponPV = [];
        db.pendingCouponPV.push({
          id: "PEND_PV_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          buyerId: pvBeneficiaryId,
          pvAmount: parseFloat(couponPv.toFixed(4)),
          orderId: orderId,
          createdAt: new Date().toISOString(),
          status: "Pending"
        });
        
        // Log transaction for pending coupon PV
        db.transactions.push({
          id: "COUP_PV_HOLD_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: pvBeneficiaryId,
          type: "Bonus",
          amount: parseFloat(couponPv.toFixed(4)),
          currency: "PV",
          details: `ยอด PV จากคูปองจำนวน ${couponPv.toFixed(2)} PV พักไว้คำนวณรอบตัดจ่าย`,
          status: "Approved",
          createdAt: new Date().toISOString()
        });
      }
      
      if (cashPv > 0) {
        calculateBinaryCommissions(db, pvBeneficiaryId, cashPv, orderId);
      }
    } else {
      // Direct cash/package payment: process full PV immediately
      calculateBinaryCommissions(db, pvBeneficiaryId, totalPv, orderId);
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
  sendSystemNotification('new_order', `🛒 มีคำสั่งซื้อสินค้าใหม่!\nเลขที่: ${orderId}\nผู้ซื้อ: ${member.name || ''} (${member.userId})\nสินค้า: ${product.name} (x${qty})\nราคารวม: ฿${totalPrice.toLocaleString('th-TH')}`);
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

// SEARCH MEMBERS UNDER DOWNLINE (By Name, Username, or last 3+ digits of User ID)
app.get('/api/mlm/search-downline', (req, res) => {
  const callerId = req.query.callerId as string;
  const q = ((req.query.query as string) || '').trim().toLowerCase();

  if (!q) {
    return res.json({ success: true, results: [] });
  }

  const db = readDb();
  const caller = db.members.find((m: any) => m.userId === callerId);
  const isAdminOrManager = caller && (caller.role === 'Admin' || caller.role === 'Manager');

  let candidateMembers: any[] = [];

  if (isAdminOrManager || !callerId) {
    candidateMembers = db.members || [];
  } else {
    // Find all downlines of callerId in both binary tree and sponsor tree
    const downlineIds = new Set<string>();
    downlineIds.add(callerId);

    let queue = [callerId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = db.members.filter((m: any) => 
        (m.parentId === current || m.sponsorId === current) && !downlineIds.has(m.userId)
      );
      for (const child of children) {
        downlineIds.add(child.userId);
        queue.push(child.userId);
      }
    }

    candidateMembers = db.members.filter((m: any) => downlineIds.has(m.userId));
  }

  // Filter candidate members matching the query
  const matches = candidateMembers.filter((m: any) => {
    const uId = (m.userId || '').toLowerCase();
    const uName = (m.username || '').toLowerCase();
    const fName = (m.name || '').toLowerCase();
    const lName = (m.surname || '').toLowerCase();
    const fullName = `${fName} ${lName}`.trim();

    return uId.includes(q) ||
           uId.endsWith(q) ||
           uName.includes(q) ||
           fName.includes(q) ||
           lName.includes(q) ||
           fullName.includes(q);
  }).slice(0, 20);

  res.json({
    success: true,
    results: matches.map((m: any) => ({
      userId: m.userId,
      username: m.username,
      name: m.name,
      surname: m.surname,
      rank: m.rank,
      sponsorId: m.sponsorId,
      parentId: m.parentId,
      side: m.side
    }))
  });
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

// Generate unique running Seller Code: A260001, A260002... up to A269999, then B260001...
function generateSellerCode(db: any) {
  const now = new Date();
  const yearSuffix = now.getFullYear().toString().substring(2); // e.g. "26"
  let activeAlpha = 'A';
  
  while (true) {
    const prefix = activeAlpha + yearSuffix;
    const codesOfThisPrefix = db.members
      .map((m: any) => m.sellerCode)
      .filter((code: any) => code && code.startsWith(prefix) && code.length === prefix.length + 4);
      
    let maxNum = 0;
    for (const code of codesOfThisPrefix) {
      const numStr = code.substring(prefix.length);
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    
    if (maxNum < 9999) {
      const nextNum = maxNum + 1;
      const paddedNum = ("0000" + nextNum).slice(-4);
      return prefix + paddedNum;
    } else {
      // This letter suffix is full (e.g. A269999 reached), increment alphabet to B, C...
      const charCode = activeAlpha.charCodeAt(0);
      activeAlpha = String.fromCharCode(charCode + 1);
    }
  }
}

// 1. Seller Login API (logs in with existing username and password)
app.post('/api/seller/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน" });
  }
  
  const member = db.members.find((m: any) => {
    const uMatch = m.username && (typeof m.username === 'string') && m.username.toLowerCase() === username.toLowerCase();
    const idMatch = m.userId && (typeof m.userId === 'string') && m.userId.toLowerCase() === username.toLowerCase();
    const codeMatch = m.sellerCode && (typeof m.sellerCode === 'string') && m.sellerCode.toLowerCase() === username.toLowerCase();
    return uMatch || idMatch || codeMatch;
  });
  
  if (!member || member.password !== password) {
    return res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
  }

  if (member.statusKyc !== 'Active' && member.role !== 'Admin' && member.role !== 'Manager') {
    return res.status(403).json({ success: false, message: "บัญชีของคุณยังไม่ได้ผ่านการอนุมัติยืนยันตัวตน (KYC) กรุณายื่นเอกสารและรอการอนุมัติ KYC ในระบบก่อนเข้าใช้งานพอร์ทัลร้านค้านะคะ" });
  }

  if (!member.sellerStatus || member.sellerStatus !== 'Active') {
    // Auto-approve in test environment, sandbox mode, for admin/manager, or pending requests
    if (isSandboxActive || member.role === 'Admin' || member.role === 'Manager' || member.username === 'nateeplus' || member.userId === 'A260600001' || member.userId === 'A260700001' || member.sellerStatus === 'Pending') {
      member.sellerStatus = 'Active';
      if (!member.sellerCode) {
        member.sellerCode = 'SEL' + Math.floor(10000 + Math.random() * 90000);
      }
      if (!member.sellerStoreName) {
        member.sellerStoreName = member.name ? `${member.name} Store` : (member.username || 'ร้านค้าพาร์ทเนอร์');
      }
      writeDb(db);
    } else {
      return res.status(403).json({ success: false, message: "บัญชีของคุณยังไม่ได้ผ่านการสมัครหรืออนุมัติเปิดร้านค้าในระบบ กรุณาลงทะเบียนสมัครใหม่ หรือติดต่อแอดมินเพื่ออนุมัติร้านค้าก่อนเข้าสู่ระบบนะคะ" });
    }
  }
  
  res.json({ success: true, member });
});

// 2. Request OTP for Seller Registration
app.post('/api/seller/send-otp', async (req, res) => {
  const { username } = req.body;
  const db = readDb();
  
  if (!username) {
    return res.status(400).json({ success: false, message: "กรุณาระบุชื่อผู้ใช้งาน" });
  }
  
  const member = db.members.find((m: any) => 
    m.username.toLowerCase() === username.toLowerCase() || m.userId === username
  );
  
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกในระบบ" });
  }
  
  if (member.statusKyc !== "Active" && member.role !== 'Admin' && member.role !== 'Manager') {
    return res.status(400).json({ success: false, message: "ท่านต้องผ่านการอนุมัติยืนยันตัวตน (KYC) ก่อนสมัครเปิดร้านค้าค่ะ กรุณายื่นเอกสารและรอการอนุมัติ KYC ในเมนูโปรไฟล์ก่อนนะคะ" });
  }
  
  if (!member.email || !member.email.includes('@')) {
    return res.status(400).json({ success: false, message: "สมาชิกท่านนี้ยังไม่ได้กรอกอีเมลที่ถูกต้องในระบบประวัติ ไม่สามารถรับ OTP ได้ค่ะ" });
  }
  
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) {
    db.otps = {};
  }
  db.otps[member.userId] = otpCode;
  writeDb(db);

  sendSystemEmail({
    to: member.email,
    subject: '[Natee Plus] รหัส OTP สำหรับลงทะเบียนร้านค้า',
    title: 'รหัส OTP ยืนยันการสมัครเปิดร้านค้า',
    otpCode: otpCode,
    bodyText: `เรียนคุณ ${member.name || member.username}\nท่านได้ทำการขอรหัส OTP เพื่อยืนยันการเปิดร้านค้าในระบบ Natee Plus`
  }).catch(err => console.error("Async email error:", err));
  
  res.json({
    success: true,
    otpSimulated: otpCode,
    email: member.email,
    message: `ระบบได้ส่งรหัส OTP ไปยังอีเมล ${member.email} เรียบร้อยแล้วค่ะ`
  });
});

// Request OTP for Seller Warehouse & Location Pin update
app.post('/api/seller/send-warehouse-otp', async (req, res) => {
  const { userId, username } = req.body;
  const db = readDb();
  
  const searchKey = userId || username;
  if (!searchKey) {
    return res.status(400).json({ success: false, message: "กรุณาระบุรหัสสมาชิกหรือชื่อผู้ใช้งาน" });
  }
  
  const member = db.members.find((m: any) => 
    m.userId === searchKey || (m.username && m.username.toLowerCase() === searchKey.toLowerCase())
  );
  
  if (!member) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกในระบบ" });
  }
  
  if (!member.email || !member.email.includes('@')) {
    return res.status(400).json({ success: false, message: "สมาชิกท่านนี้ยังไม่ได้ระบุอีเมลที่ถูกต้องในระบบ ไม่สามารถรับ OTP ได้ค่ะ" });
  }
  
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) {
    db.otps = {};
  }
  db.otps[member.userId] = otpCode;
  writeDb(db);

  sendSystemEmail({
    to: member.email,
    subject: '[Natee Plus] รหัส OTP สำหรับบันทึกและล็อกพิกัดคลังสินค้า',
    title: 'รหัส OTP ยืนยันการแก้ไขพิกัดคลังสินค้า',
    otpCode: otpCode,
    bodyText: `เรียนคุณ ${member.name || member.username}\nท่านได้ทำการขอรหัส OTP เพื่อยืนยันการเปลี่ยนแปลงพิกัดแผนที่และที่อยู่จัดส่งคลังสินค้าปลายทางในระบบ Natee Plus`
  }).catch(err => console.error("Async email error:", err));
  
  res.json({
    success: true,
    otpSimulated: otpCode,
    email: member.email,
    message: `ระบบได้ส่งรหัส OTP สำหรับล็อกพิกัดคลังสินค้าไปยังอีเมล ${member.email} เรียบร้อยแล้วค่ะ`
  });
});

// Confirm Seller Warehouse Update with Email OTP
app.post('/api/seller/update-warehouse', (req, res) => {
  const { userId, sellerAddress, warehouseLat, warehouseLng, sellerLine, otp } = req.body;
  const db = readDb();
  
  if (!userId || !sellerAddress || !otp) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลที่อยู่คลังสินค้าและรหัส OTP ให้ครบถ้วนค่ะ" });
  }
  
  const member = db.members.find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกในระบบ" });

  const savedOtp = db.otps ? db.otps[member.userId] : null;
  if (!savedOtp || savedOtp !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบรหัสจากอีเมลหรือกดขอรับรหัสอีกครั้งค่ะ" });
  }

  const parsedLat = warehouseLat ? parseFloat(warehouseLat) : (member.warehouseLat || 13.7563);
  const parsedLng = warehouseLng ? parseFloat(warehouseLng) : (member.warehouseLng || 100.5018);

  member.sellerAddress = sellerAddress;
  if (sellerLine !== undefined) member.sellerLine = sellerLine;
  member.warehouseLat = parsedLat;
  member.warehouseLng = parsedLng;
  member.lat = parsedLat;
  member.lng = parsedLng;

  delete db.otps[member.userId];
  writeDb(db);

  res.json({
    success: true,
    message: "📍 บันทึกข้อมูลร้านค้าและล็อกพิกัดคลังสินค้าปลายทางเรียบร้อยแล้วค่ะ! ข้อมูลอัพเดทไปยังระบบเรียบร้อย",
    member
  });
});

// 3. Confirm Seller Application with OTP and transaction PIN
app.post('/api/seller/apply-with-otp', (req, res) => {
  const { username, storeName, storeAddress, warehouseLat, warehouseLng, sellerLine, otp, pin } = req.body;
  const db = readDb();
  
  if (!username || !storeName || !storeAddress || !otp || !pin) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลและรหัสยืนยันต่าง ๆ ให้ครบถ้วนค่ะ" });
  }
  
  const member = db.members.find((m: any) => 
    m.username.toLowerCase() === username.toLowerCase() || m.userId === username
  );
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกในระบบ" });

  // A0. Validate KYC Status (Must be active KYC)
  if (member.statusKyc !== "Active" && member.role !== 'Admin' && member.role !== 'Manager') {
    return res.status(400).json({ 
      success: false, 
      message: "สำหรับการสมัครเปิดบัญชีร้านค้า Natee Plus Partner ท่านต้องผ่านการอนุมัติยืนยันตัวตน (KYC) ให้เรียบร้อยก่อนนะคะ กรุณายื่นเอกสาร KYC ในเมนูโปรไฟล์ให้ได้รับการอนุมัติก่อนค่ะ" 
    });
  }
  
  // A. Validate Rank (Member status/Rank Member or S/M/L/XL/XXL allowed)
  const allowedRanks = ["Member", "S", "M", "L", "XL", "XXL"];
  if (!member.rank || !allowedRanks.includes(member.rank)) {
    return res.status(400).json({ 
      success: false, 
      message: "สำหรับการสมัครเปิดบัญชีร้านค้า Natee Plus Partner ท่านต้องมีตำแหน่งสมาชิกตั้งแต่ระดับ Member ขึ้นไปเท่านั้นค่ะ" 
    });
  }
  
  // B. Validate Store Name Special Characters
  const specialCharRegex = /[^\u0E00-\u0E7Fa-zA-Z0-9\s\-]/;
  if (specialCharRegex.test(storeName)) {
    return res.status(400).json({
      success: false,
      message: "ชื่อร้านค้าต้องไม่มีสัญลักษณ์หรือเครื่องหมายพิเศษใด ๆ ค่ะ (อนุญาตเฉพาะ ตัวอักษรไทย อังกฤษ ตัวเลข ช่องว่าง และขีดกลางเท่านั้น)"
    });
  }
  
  // C. Validate Store Name Uniqueness
  const isDuplicate = db.members.some((m: any) => 
    m.sellerStoreName && 
    m.sellerStoreName.trim().toLowerCase() === storeName.trim().toLowerCase() &&
    m.userId !== member.userId
  );
  if (isDuplicate) {
    return res.status(400).json({
      success: false,
      message: "ชื่อร้านค้านี้มีผู้ใช้งานแล้วในระบบ กรุณาเลือกใช้ชื่ออื่นในการเปิดร้านค้านะคะ"
    });
  }
  
  // D. Validate OTP
  const savedOtp = db.otps ? db.otps[member.userId] : null;
  if (!savedOtp || savedOtp !== otp) {
    return res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบหรือส่งคำขอรหัสอีกครั้งค่ะ" });
  }
  
  // E. Validate Transaction PIN
  if (member.pin !== pin) {
    return res.status(400).json({ success: false, message: "รหัสธุรกรรม (PIN) ไม่ถูกต้อง กรุณากรอกใหมู่อีกครั้ง" });
  }
  
  // All checks passed! Apply with unique code
  const code = generateSellerCode(db);
  
  member.sellerStatus = "Pending"; // Pending admin approval
  member.sellerCode = code;
  member.sellerStoreName = storeName;
  member.sellerAddress = storeAddress;
  if (sellerLine !== undefined) member.sellerLine = sellerLine;
  member.warehouseLat = warehouseLat ? parseFloat(warehouseLat) : null;
  member.warehouseLng = warehouseLng ? parseFloat(warehouseLng) : null;
  member.sellerFirstLoginShown = false; // reset for the approved welcome popup
  
  // Clean OTP
  delete db.otps[member.userId];
  
  writeDb(db);
  sendSystemNotification('new_shop', `🏪 มีร้านค้าใหม่ลงทะเบียนขออนุมัติ!\nชื่อร้าน: ${storeName}\nผู้สมัคร: ${member.name || ''} (${member.userId})\nรหัสร้านค้า: ${code}`);
  res.json({ 
    success: true, 
    code,
    message: "ข้อมูลของท่านสมบูรณ์ระบบความปลอดภัยเรียบร้อย การขอเปิดร้านค้าอยู่ระหว่างการขออนุมัติโดยแอดมินค่ะ" 
  });
});

// Legacy Seller Apply endpoint for backward compatibility
app.post('/api/seller/apply', (req, res) => {
  const { userId, storeName, storeAddress, warehouseLat, warehouseLng } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  const allowedRanks = ["Member", "S", "M", "L", "XL", "XXL"];
  if (!member.rank || !allowedRanks.includes(member.rank)) {
    return res.status(400).json({ 
      success: false, 
      message: "สำหรับการสมัครเปิดบัญชีร้านค้า Natee Plus Partner ท่านต้องมีตำแหน่งสมาชิกตั้งแต่ระดับ Member ขึ้นไปเท่านั้นค่ะ" 
    });
  }

  // Validate Store Name Special Characters
  const specialCharRegex = /[^\u0E00-\u0E7Fa-zA-Z0-9\s\-]/;
  if (specialCharRegex.test(storeName)) {
    return res.status(400).json({
      success: false,
      message: "ชื่อร้านค้าต้องไม่มีสัญลักษณ์หรือเครื่องหมายพิเศษใด ๆ ค่ะ"
    });
  }
  
  // Validate Store Name Uniqueness
  const isDuplicate = db.members.some((m: any) => 
    m.sellerStoreName && 
    m.sellerStoreName.trim().toLowerCase() === storeName.trim().toLowerCase() &&
    m.userId !== member.userId
  );
  if (isDuplicate) {
    return res.status(400).json({
      success: false,
      message: "ชื่อร้านค้านี้มีผู้ใช้งานแล้วในระบบ"
    });
  }

  const code = generateSellerCode(db);
  
  member.sellerStatus = "Pending";
  member.sellerCode = code;
  member.sellerStoreName = storeName;
  member.sellerAddress = storeAddress;
  member.warehouseLat = warehouseLat ? parseFloat(warehouseLat) : null;
  member.warehouseLng = warehouseLng ? parseFloat(warehouseLng) : null;
  member.sellerFirstLoginShown = false;
  
  writeDb(db);
  res.json({ success: true, message: "ยื่นใบสมัครเปิดร้านค้าออนไลน์สำเร็จ! รหัสร้านค้าของคุณคือ " + code });
});

// Mark that Seller welcome popup has been shown once
app.post('/api/seller/mark-first-login', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  member.sellerFirstLoginShown = true;
  writeDb(db);
  res.json({ success: true, message: "บันทึกสถานะการยินดีต้อนรับเรียบร้อยแล้วค่ะ" });
});

// Get Seller Regulations text
app.get('/api/seller/regulations', (req, res) => {
  const db = readDb();
  const latestOfficialRegulations = `กฎระเบียบและข้อบังคับ Natee Plus Partner

1. ผู้สมัครร้านค้าสามารถเข้าร่วมเป็น Partner ได้ตั้งแต่ตำแหน่ง Member ขึ้นไป (หรือตามที่ผู้ดูแลระบบอนุมัติเป็นกรณีพิเศษ)
2. ร้านค้าต้องระบุข้อมูลชื่อร้านและที่ตั้งคลังสินค้าจริงเพื่อใช้ในการบริการจัดการและรับส่งคืนสินค้า
3. ห้ามตั้งชื่อร้านค้าที่ซ้ำกับแบรนด์อื่น หรือมีอักขระพิเศษ (@, #, $, %, ^, &, *)
4. สินค้าที่จำหน่ายในร้านต้องเป็นสินค้าที่ถูกต้องตามกฎหมาย และไม่ละเมิดลิขสิทธิ์
5. การหักค่าธรรมเนียมระบบ (GP) จะคำนวณที่อัตรา 20% ของราคาก่อนภาษี โดย 50% ของ GP จะถูกนำไปคำนวนเป็น PV ของท่าน
6. ปฏิบัติตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) อย่างเคร่งครัด
7. สมาชิกทั่วไปที่ยังไม่ได้ลงทะเบียนเปิดร้านค้าจะไม่เห็นหมุดแผนที่คลังสินค้า และเมื่อได้รับการอนุมัติร้านค้าและยืนยันปักหมุดแล้ว หมุดแผนที่คลังสินค้าจะแสดงในหน้าหลักพอร์ทัลร้านค้า (Partner Portal)
8. หมุดตำแหน่งคลังสินค้าและพิกัดจัดส่งจะถูกล็อกเป็นภาพนิ่งเมื่อยืนยันเรียบร้อยแล้ว หากต้องการย้ายหรือแก้ไขพิกัด ต้องยื่นขออนุมัติปรับเปลี่ยนพิกัดกับทางแอดมินระบบ`;

  if (!db.bankSettings) db.bankSettings = {};
  db.bankSettings.sellerRegulations = latestOfficialRegulations;
  writeDb(db);

  res.json({ success: true, regulations: latestOfficialRegulations });
});

// Save Seller Regulations text (Admin with Manager/Admin role only)
app.post('/api/seller/regulations', (req, res) => {
  const { regulations, editorId } = req.body;
  const db = readDb();
  
  if (editorId) {
    const editor = db.members.find((m: any) => m.userId === editorId);
    if (!editor || (editor.role !== 'Admin' && editor.role !== 'Manager')) {
      return res.status(403).json({ success: false, message: "ขออภัยค่ะ เฉพาะแอดมินหรือผู้จัดการระบบที่มีสิทธิ์แก้ไขกฎระเบียบนี้" });
    }
  }
  
  if (!db.bankSettings) {
    db.bankSettings = {
      bankName: "ธนาคารไทยพาณิชย์",
      bankAccount: "111-222-3333",
      bankAccountName: "บริษัท นที พลัส มาร์เก็ต จำกัด",
      qrCodeUrl: ""
    };
  }
  
  db.bankSettings.sellerRegulations = regulations;
  writeDb(db);
  res.json({ success: true, message: "บันทึกกฎระเบียบและข้อบังคับร้านค้าเรียบร้อยแล้วค่ะ", regulations });
});

// Admin Update Seller Profile Directly
app.post('/api/admin/seller-update-profile', (req, res) => {
  const { userId, sellerCode, sellerStoreName, storeName, sellerStatus, name, surname, phone, email, rank, role, sellerAddress, storeAddress, warehouseLat, warehouseLng, sellerLine } = req.body;
  const db = readDb();
  
  const member = db.members.find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิกร้านค้าคนนี้" });
  
  const targetStoreName = sellerStoreName || storeName;
  const targetAddress = sellerAddress || storeAddress;

  // Validate duplicate store name if changed
  if (targetStoreName && targetStoreName.trim().toLowerCase() !== (member.sellerStoreName || '').trim().toLowerCase()) {
    const isDuplicate = db.members.some((m: any) => 
      m.sellerStoreName && 
      m.sellerStoreName.trim().toLowerCase() === targetStoreName.trim().toLowerCase() &&
      m.userId !== userId
    );
    if (isDuplicate) {
      return res.status(400).json({ success: false, message: "ชื่อร้านค้านี้มีผู้อื่นใช้งานแล้วในระบบ กรุณาใช้ชื่ออื่นค่ะ" });
    }
    
    const specialCharRegex = /[^\u0E00-\u0E7Fa-zA-Z0-9\s\-]/;
    if (specialCharRegex.test(targetStoreName)) {
      return res.status(400).json({ success: false, message: "ชื่อร้านค้าต้องไม่มีเครื่องหมายหรือสัญลักษณ์พิเศษใด ๆ ค่ะ" });
    }
  }

  // Edit fields
  if (sellerCode !== undefined) member.sellerCode = sellerCode;
  if (targetStoreName !== undefined) member.sellerStoreName = targetStoreName;
  if (targetAddress !== undefined) member.sellerAddress = targetAddress;
  if (sellerLine !== undefined) member.sellerLine = sellerLine;
  if (warehouseLat !== undefined && warehouseLat !== null) {
    const pLat = parseFloat(warehouseLat);
    member.warehouseLat = pLat;
    member.lat = pLat;
  }
  if (warehouseLng !== undefined && warehouseLng !== null) {
    const pLng = parseFloat(warehouseLng);
    member.warehouseLng = pLng;
    member.lng = pLng;
  }
  if (sellerStatus !== undefined) member.sellerStatus = sellerStatus;
  if (name !== undefined) member.name = name;
  if (surname !== undefined) member.surname = surname;
  if (phone !== undefined) member.phone = phone;
  if (email !== undefined) member.email = email;
  if (rank !== undefined) member.rank = rank;
  if (role !== undefined) member.role = role;
  
  writeDb(db);
  res.json({ success: true, message: "ปรับปรุงข้อมูลสมาชิกร้านค้าเรียบร้อยแล้วค่ะ", member });
});

// RESET SELLER STATUS FOR RE-APPLY
app.post('/api/seller/reset-status', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  member.sellerStatus = "NotApplied";
  member.sellerFirstLoginShown = false;
  writeDb(db);
  res.json({ success: true, message: "รีเซ็ตสถานะการสมัครเรียบร้อย สามารถกรอกข้อมูลยื่นใบสมัครใหม่ได้ทันทีค่ะ" });
});

// ADD PRODUCT
app.post('/api/seller/product', async (req, res) => {
  const { 
    userId, productName, price, pv, imageFile, images, description, shortDescription, category, cost,
    subcategory, weight, width, length, height, volumetricWeight, chargeableWeight,
    baseShippingCost, sellerCoPay, customerShippingFee, netPayout, approveInstantly,
    discountPercent, shippingFeeBase, shippingDiscount, affiliateCommission, isAffiliateEnabled, extraPv, isAvailable
  } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member || member.sellerStatus !== "Active") {
    return res.status(403).json({ success: false, message: "เฉพาะผู้ขายที่ผ่านการอนุมัติร้านค้าเท่านั้นที่เพิ่มสินค้าได้" });
  }
  
  const sellerCode = member.sellerCode || ("S" + (member.userId || "000000").slice(-6).toUpperCase());
  let seq = (db.sellerProducts || []).filter((p: any) => p.sellerId === userId).length + 1;
  let newProductId = `${sellerCode}-P${seq.toString().padStart(3, '0')}`;
  while (
    (db.sellerProducts || []).some((p: any) => p.id === newProductId) || 
    (db.products || []).some((p: any) => p.id === newProductId)
  ) {
    seq++;
    newProductId = `${sellerCode}-P${seq.toString().padStart(3, '0')}`;
  }

  let processedImages: string[] = [];
  if (Array.isArray(images) && images.length > 0) {
    for (let i = 0; i < Math.min(5, images.length); i++) {
      const img = images[i];
      if (typeof img === 'string' && img.trim()) {
        if (img.startsWith("data:")) {
          try {
            const uploadedUrl = await uploadImageToFirebaseOrKeepBase64(img, 'products', `${newProductId}_img_${i}_${Date.now()}`);
            processedImages.push(uploadedUrl);
          } catch (e) {
            console.error(e);
          }
        } else {
          processedImages.push(img.trim());
        }
      }
    }
  }

  if (processedImages.length === 0 && imageFile && typeof imageFile === 'string' && imageFile.startsWith("data:")) {
    try {
      const uploadedUrl = await uploadImageToFirebaseOrKeepBase64(imageFile, 'products', `${newProductId}_img_0_${Date.now()}`);
      processedImages.push(uploadedUrl);
    } catch (e) {
      console.error(e);
    }
  } else if (processedImages.length === 0 && imageFile && typeof imageFile === 'string') {
    processedImages.push(imageFile);
  }

  if (processedImages.length === 0) {
    processedImages.push("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300");
  }

  const primaryImage = processedImages[0];
  const priceVal = parseFloat(price) || 0;
  const costVal = cost !== undefined && cost !== "" ? parseFloat(cost) : Math.floor(priceVal * 0.30);

  // Validate Security Deposit Listing Cap (10x rule)
  const depositStats = getSellerDepositStats(db, userId);
  const addedListingValue = priceVal * 10; // estimate listing impact
  if (depositStats.securityDeposit > 0 && (depositStats.currentListingValue + addedListingValue) > depositStats.maxListingCap) {
    return res.status(400).json({
      success: false,
      message: `ไม่สามารถเพิ่มสินค้าได้ เนื่องจากมูลค่าสินค้าเกินวงเงินประกัน 10 เท่า (เงินประกันปัจจุบัน ฿${depositStats.securityDeposit.toLocaleString()} วางขายได้ไม่เกิน ฿${depositStats.maxListingCap.toLocaleString()}) กรุณาเพิ่มเงินประกันในเมนูร้านค้าค่ะ`
    });
  }

  const isApproved = !!approveInstantly || member?.role === 'Admin' || userId === 'admin' || (typeof userId === 'string' && userId.startsWith('admin_'));

  const newProduct = {
    id: newProductId,
    sellerId: userId,
    sellerCode: member.sellerCode,
    sellerStoreName: member.sellerStoreName,
    name: productName,
    price: priceVal,
    pv: parseFloat(pv) || 0,
    cost: costVal,
    image: primaryImage,
    images: processedImages,
    description,
    shortDescription: shortDescription || "",
    category,
    status: isApproved ? "Approved" : "Pending", // Pending Admin approval unless approvedInstantly or active seller
    subcategory: subcategory || "",
    weight: parseFloat(weight) || 0,
    width: parseFloat(width) || 0,
    length: parseFloat(length) || 0,
    height: parseFloat(height) || 0,
    volumetricWeight: parseFloat(volumetricWeight) || 0,
    chargeableWeight: parseFloat(chargeableWeight) || 0,
    baseShippingCost: parseFloat(baseShippingCost) || 35,
    shippingFeeBase: parseFloat(shippingFeeBase) || 35,
    sellerCoPay: parseFloat(sellerCoPay) || 0,
    customerShippingFee: parseFloat(customerShippingFee) || 35,
    discountPercent: parseFloat(discountPercent) || 0,
    shippingDiscount: parseFloat(shippingDiscount) || 0,
    affiliateCommission: parseFloat(affiliateCommission) || 0,
    isAffiliateEnabled: isAffiliateEnabled !== false && isAffiliateEnabled !== 'false',
    extraPv: parseFloat(extraPv) || 0,
    isAvailable: isAvailable !== false && isAvailable !== 'false',
    netPayout: parseFloat(netPayout) || 0
  };
  
  db.sellerProducts.push(newProduct);

  if (isApproved) {
    db.products.push({
      ...newProduct,
      status: "Approved"
    });
  }

  writeDb(db);
  
  res.json({ 
    success: true, 
    message: isApproved 
      ? "เพิ่มรายการสินค้าลงร้านค้าและอนุมัติขึ้นแสดงหน้าร้านทันทีสำเร็จ! ✨" 
      : "เพิ่มสินค้าเข้าร้านค้าสำเร็จ! อยู่ระหว่างรอแอดมินตรวจสอบก่อนแสดงผลบนช็อป" 
  });
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

// CLEAR SELLER SALES HISTORY, ORDERS, AND PRODUCT VIEWS (RESTRICTED TO ADMIN/MANAGER ONLY FOR ACCOUNTING COMPLIANCE)
app.post('/api/seller/clear-history', (req, res) => {
  const { userId, sellerId, requesterUserId, editorUserId } = req.body;
  const targetId = userId || sellerId;
  const adminId = requesterUserId || editorUserId;

  if (!targetId) {
    return res.status(400).json({ success: false, message: "กรุณาระบุรหัสผู้ขายหรือร้านค้า" });
  }

  const db = readDb();

  // Strict check: Only Admin or Manager can perform clear history to maintain audit trail and accounting integrity
  if (adminId) {
    const requester = db.members?.find((m: any) => m.userId === adminId || m.username === adminId);
    const roleUpper = (requester?.role || '').toUpperCase();
    const isAllowed = roleUpper === 'ADMIN' || roleUpper === 'MANAGER' || requester?.username === 'admin' || requester?.userId === 'A260600001';
    if (!isAllowed) {
      return res.status(403).json({ 
        success: false, 
        message: "🚫 ไม่อนุญาตให้สมาชิกลบประวัติเอง เพื่อป้องกันปัญหาบัญชีและภาษี (เฉพาะ Admin/Manager เท่านั้นที่ดำเนินการได้)" 
      });
    }
  } else {
    return res.status(403).json({ 
      success: false, 
      message: "🚫 ไม่อนุญาตให้สมาชิกลบประวัติเอง เพื่อความถูกต้องของระบบบัญชีและภาษี (เฉพาะ Admin เท่านั้น)" 
    });
  }

  // 1. Clear seller orders from db.orders
  if (Array.isArray(db.orders)) {
    db.orders = db.orders.filter((o: any) => o.sellerId !== targetId && o.shopId !== targetId);
  }

  // 2. Reset product view counts and soldCounts for seller's products
  if (Array.isArray(db.sellerProducts)) {
    db.sellerProducts.forEach((p: any) => {
      if (p.sellerId === targetId) {
        p.views = 0;
        p.soldCount = 0;
        p.sales = 0;
      }
    });
  }

  if (Array.isArray(db.products)) {
    db.products.forEach((p: any) => {
      if (p.sellerId === targetId) {
        p.views = 0;
        p.soldCount = 0;
        p.sales = 0;
      }
    });
  }

  // 3. Clear seller reviews
  if (Array.isArray(db.reviews)) {
    db.reviews = db.reviews.filter((r: any) => r.sellerId !== targetId && r.shopId !== targetId);
  }

  // 4. Reset store views/sales on member record if present
  const member = db.members?.find((m: any) => m.userId === targetId);
  if (member) {
    member.storeViews = 0;
    member.storeSales = 0;
    member.storeTotalOrders = 0;
  }

  writeDb(db);

  res.json({
    success: true,
    message: "ลบประวัติการขายสินค้า การเข้าชม และออเดอร์ของร้านค้า โดยแอดมินสำเร็จแล้วค่ะ! ✨"
  });
});

// SELLER UPDATE ORDER TRACKING (Includes 15-day cutoff date calculation)
app.post('/api/seller/order-ship', (req, res) => {
  const { orderId, sellerId, trackingCompany, trackingNo, shippingNote } = req.body;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลการสั่งซื้อ" });
  
  if (order.sellerId !== sellerId) {
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์จัดการบิลสั่งซื้อนี้" });
  }
  
  const shipDate = new Date();
  const cutoffDate = new Date(shipDate);
  cutoffDate.setDate(cutoffDate.getDate() + 15);

  order.status = "Completed";
  order.shippedAt = shipDate.toISOString();
  order.payoutCutoffDate = cutoffDate.toISOString();
  order.payoutStatus = order.payoutStatus || "PendingCutoff";
  order.trackingCompany = trackingCompany || "";
  order.trackingNo = trackingNo || "";
  order.shippingNote = shippingNote || "";
  
  writeDb(db);
  res.json({ success: true, message: `บันทึกข้อมูลจัดส่งเรียบร้อยแล้ว! กำหนดวันตัดรอบโอนเงินคือ ${cutoffDate.toLocaleDateString('th-TH')}` });
});

// CUSTOMER CONFIRM RECEIVED (START 15-DAY ESCROW PAYOUT COUNTDOWN)
app.post('/api/order/confirm-received', (req, res) => {
  const { orderId, userId } = req.body;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลคำสั่งซื้อ" });

  if (order.userId !== userId && order.buyerId !== userId) {
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ทำรายการในบิลสั่งซื้อนี้" });
  }

  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() + 15);

  order.status = "Completed";
  order.receivedAt = now.toISOString();
  order.escrowStatus = "ESCROW_15_DAYS_HOLD";
  order.payoutCutoffDate = cutoffDate.toISOString();
  order.payoutStatus = "PendingCutoff";

  writeDb(db);
  res.json({
    success: true,
    message: `ยืนยันได้รับสินค้าเรียบร้อยแล้ว! ระบบเข้าสู่ระยะเวลารับประกัน 15 วัน (กำหนดปล่อยเงินให้ร้านค้า: ${cutoffDate.toLocaleDateString('th-TH')})`,
    order
  });
});

// CUSTOMER SUBMIT PRODUCT REVIEW & SELLER RATING
app.post('/api/order/review', (req, res) => {
  const { orderId, userId, rating, comment } = req.body;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลคำสั่งซื้อ" });

  if (order.userId !== userId && order.buyerId !== userId) {
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์รีวิวคำสั่งซื้อนี้" });
  }

  const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const reviewObj = {
    rating: numRating,
    comment: comment || "",
    reviewedAt: new Date().toISOString(),
    buyerName: order.userName || order.buyerName || "ลูกค้าผู้สั่งซื้อ"
  };

  order.review = reviewObj;

  // Record in global reviews for seller ratings
  if (!db.reviews) db.reviews = [];
  db.reviews.push({
    id: `REV_${Date.now()}`,
    orderId,
    sellerId: order.sellerId || order.shopId,
    productId: order.productId,
    productName: order.productName,
    rating: numRating,
    comment: comment || "",
    buyerName: reviewObj.buyerName,
    createdAt: reviewObj.reviewedAt
  });

  writeDb(db);
  res.json({ success: true, message: "บันทึกคะแนนดาวและรีวิวสินค้าเรียบร้อยแล้วค่ะ ⭐", review: reviewObj });
});

// CUSTOMER DISPUTE / RETURN PRODUCT (PAUSE ESCROW PAYOUT)
app.post('/api/order/dispute', (req, res) => {
  const { orderId, userId, reason } = req.body;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลคำสั่งซื้อ" });

  if (order.userId !== userId && order.buyerId !== userId) {
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ทำรายการในบิลสั่งซื้อนี้" });
  }

  order.escrowStatus = "DISPUTED_PAUSED";
  order.payoutStatus = "DisputedHold";
  order.disputedAt = new Date().toISOString();
  order.disputeReason = reason || "ยื่นเรื่องขอคืนสินค้า / ระงับการโอนเงินให้ร้านค้า";

  writeDb(db);
  res.json({
    success: true,
    message: "ยื่นเรื่องแจ้งปัญหาสินค้าสำเร็จ! ระบบยุติการโอนเงินให้ร้านค้าชั่วคราว เจ้าหน้าที่จะติดต่อกลับเพื่อตรวจสอบค่ะ",
    order
  });
});

// HELPER TO PROCESS ESCROW PAYOUTS WHEN 15-DAY HOLD EXPIRES
function processEscrowPayouts(db: any) {
  const now = new Date();
  let processedCount = 0;
  if (!db.orders) return { processedCount: 0 };
  if (!db.ledger) db.ledger = [];

  for (const order of db.orders) {
    if (
      (order.payoutStatus === "PendingCutoff" || order.escrowStatus === "ESCROW_15_DAYS_HOLD") &&
      order.escrowStatus !== "DISPUTED_PAUSED" &&
      order.escrowStatus !== "REFUNDED_BUYER" &&
      order.payoutStatus !== "Completed" &&
      order.payoutStatus !== "Refunded"
    ) {
      if (order.payoutCutoffDate) {
        const cutoff = new Date(order.payoutCutoffDate);
        if (now >= cutoff) {
          order.escrowStatus = "RELEASED_PAID";
          order.payoutStatus = "Completed";
          order.releasedAt = now.toISOString();

          const payoutAmount = order.sellerPayoutAmount || order.totalAmount || order.totalPrice || 0;
          const sellerUserId = order.sellerId || order.shopOwnerId;

          if (sellerUserId && db.members) {
            const sellerMember = db.members.find((m: any) => m.userId === sellerUserId || m.sellerStoreName === order.sellerName);
            if (sellerMember) {
              sellerMember.balanceECash = (sellerMember.balanceECash || 0) + payoutAmount;
              sellerMember.totalRevenue = (sellerMember.totalRevenue || 0) + payoutAmount;
            }
          }

          db.ledger.push({
            id: `LEDGER_ESCROW_${Date.now()}_${order.id}`,
            timestamp: now.toISOString(),
            type: "ESCROW_RELEASE",
            orderId: order.id,
            sellerId: sellerUserId || "STORE",
            amount: payoutAmount,
            description: `ปลดล็อกโอนเงินโอนครบกำหนดประกัน 15 วัน ให้ร้านค้า บิล #${order.id}`,
            status: "Success"
          });

          processedCount++;
        }
      }
    }
  }
  return { processedCount };
}

// API: TRIGGER AUTO-PROCESS ESCROW PAYOUTS
app.post('/api/order/process-escrow-payouts', (req, res) => {
  const db = readDb();
  const result = processEscrowPayouts(db);
  if (result.processedCount > 0) {
    writeDb(db);
  }
  res.json({
    success: true,
    message: `ประมวลผลระบบโอนเงินพักประกัน 15 วันเรียบร้อยแล้ว (ปลดล็อกโอนสำเร็จ ${result.processedCount} รายการ)`,
    processedCount: result.processedCount
  });
});

// ==========================================
// SELLER SECURITY DEPOSIT & AFFILIATE APIS
// ==========================================

// Helper: Get seller security deposit & active limit stats
function getSellerDepositStats(db: any, sellerUserId: string) {
  const member = db.members.find((m: any) => m.userId === sellerUserId);
  const deposit = parseFloat(member?.securityDeposit || 0);
  const maxListingCap = deposit * 10; // 10x listing multiplier rule

  // Calculate current total listed value in store
  const sellerProds = (db.sellerProducts || []).filter((p: any) => p.sellerId === sellerUserId && p.isAvailable !== false);
  const currentListingValue = sellerProds.reduce((sum: number, p: any) => {
    const pPrice = parseFloat(p.price) || 0;
    const pStock = p.stock !== undefined ? parseFloat(p.stock) : 100;
    return sum + (pPrice * Math.min(pStock, 50)); // capped calculation for listing value active
  }, 0);

  // Calculate active unfulfilled order sales (Processing orders)
  const activeUnfulfilledSales = (db.orders || [])
    .filter((o: any) => o.sellerId === sellerUserId && (o.status === 'Processing' || o.status === 'Paid'))
    .reduce((sum: number, o: any) => sum + (parseFloat(o.totalPrice || o.price) || 0), 0);

  return {
    securityDeposit: deposit,
    maxListingCap,
    currentListingValue,
    activeUnfulfilledSales,
    salesLimitRemaining: Math.max(0, deposit - activeUnfulfilledSales),
    canListMore: currentListingValue < maxListingCap || deposit === 0
  };
}

// GET SELLER SECURITY DEPOSIT STATS
app.get('/api/seller/security-deposit/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const stats = getSellerDepositStats(db, userId);
  res.json({ success: true, stats });
});

// DEPOSIT INTO SECURITY DEPOSIT (Transfers from Seller E-Cash)
app.post('/api/seller/security-deposit/deposit', (req, res) => {
  const { userId, amount } = req.body;
  const db = readDb();
  const depositAmount = parseFloat(amount);
  
  if (!depositAmount || depositAmount <= 0) {
    return res.status(400).json({ success: false, message: "กรุณาระบุจำนวนเงินประกันที่ถูกต้อง" });
  }

  const member = db.members.find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกร้านค้า" });

  if ((member.balanceECash || 0) < depositAmount) {
    return res.status(400).json({ success: false, message: "ยอดเงิน E-Cash ในกระเป๋าไม่เพียงพอสำหรับการโอนฝากเงินประกันร้านค้า" });
  }

  // Deduct E-Cash and add to securityDeposit
  member.balanceECash = parseFloat(((member.balanceECash || 0) - depositAmount).toFixed(4));
  member.securityDeposit = parseFloat(((member.securityDeposit || 0) + depositAmount).toFixed(4));

  db.transactions.push({
    id: "SEC_DEP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Withdraw",
    amount: depositAmount,
    currency: "E-Cash",
    details: `โอนฝากเงินประกันความเสี่ยงร้านค้า (Security Deposit) เพิ่มขึ้นเป็น ฿${member.securityDeposit.toLocaleString()}`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  const stats = getSellerDepositStats(db, userId);
  res.json({
    success: true,
    message: `ฝากเงินประกันสำเร็จ! ยอดเงินประกันสะสม ฿${member.securityDeposit.toLocaleString()} (ขยายวงเงินวางขายสินค้าเป็น ฿${stats.maxListingCap.toLocaleString()})`,
    stats,
    newECash: member.balanceECash
  });
});

// WITHDRAW SECURITY DEPOSIT (Transfers back to Seller E-Cash)
app.post('/api/seller/security-deposit/withdraw', (req, res) => {
  const { userId, amount } = req.body;
  const db = readDb();
  const withdrawAmount = parseFloat(amount);

  if (!withdrawAmount || withdrawAmount <= 0) {
    return res.status(400).json({ success: false, message: "กรุณาระบุจำนวนเงินที่ต้องการถอน" });
  }

  const member = db.members.find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิกร้านค้า" });

  const currentDeposit = member.securityDeposit || 0;
  if (currentDeposit < withdrawAmount) {
    return res.status(400).json({ success: false, message: "ยอดเงินประกันคงเหลือไม่เพียงพอสำหรับการถอน" });
  }

  const stats = getSellerDepositStats(db, userId);
  if (stats.activeUnfulfilledSales > (currentDeposit - withdrawAmount)) {
    return res.status(400).json({
      success: false,
      message: `ไม่สามารถถอนเงินประกันได้ เนื่องจากมียอดขายรอดำเนินการจัดส่ง ฿${stats.activeUnfulfilledSales.toLocaleString()} ค้างอยู่ (ต้องคงเงินประกันไว้เท่ากับยอดขายรอดำเนินการ)`
    });
  }

  member.securityDeposit = parseFloat((currentDeposit - withdrawAmount).toFixed(4));
  member.balanceECash = parseFloat(((member.balanceECash || 0) + withdrawAmount).toFixed(4));

  db.transactions.push({
    id: "SEC_WD_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    userId: member.userId,
    type: "Deposit",
    amount: withdrawAmount,
    currency: "E-Cash",
    details: `ถอนเงินประกันร้านค้ากลับเข้ากระเป๋า E-Cash คงเหลือเงินประกัน ฿${member.securityDeposit.toLocaleString()}`,
    status: "Approved",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  const newStats = getSellerDepositStats(db, userId);
  res.json({
    success: true,
    message: `ถอนเงินประกันคืนสำเร็จ ฿${withdrawAmount.toLocaleString()} ถอนกลับเข้ากระเป๋า E-Cash เรียบร้อยแล้วค่ะ`,
    stats: newStats,
    newECash: member.balanceECash
  });
});

// AFFILIATE BASKET APIS

// TOGGLE AFFILIATE BASKET (ปักตะกร้า / ถอดตะกร้า)
app.post('/api/affiliate/toggle-basket', (req, res) => {
  const { userId, productId } = req.body;
  const db = readDb();

  const member = db.members.find((m: any) => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });

  // Eligibility check: Must be Member role or higher, store approved, and KYC completed
  if (member.role === 'Visitor' || member.role === 'User') {
    return res.status(403).json({ success: false, message: "ผู้ปักตะกร้าแชร์สินค้าต้องเป็นสมาชิก (Member) ขึ้นไปค่ะ" });
  }

  if (member.kycStatus !== 'Approved') {
    return res.status(403).json({ success: false, message: "คุณต้องผ่านการยืนยันตัวตน KYC ก่อนจึงจะสามารถปักตะกร้าและแชร์สินค้าได้ค่ะ" });
  }

  if (member.sellerStatus !== 'Approved') {
    return res.status(403).json({ success: false, message: "คุณต้องอนุมัติเปิดร้านค้าผู้ขายให้เรียบร้อยก่อนจึงจะปักตะกร้าแชร์สินค้าได้ค่ะ" });
  }

  if (!db.affiliateItems) db.affiliateItems = [];

  const existingIdx = db.affiliateItems.findIndex((item: any) => item.userId === userId && item.productId === productId);
  let isBookmarked = false;

  if (existingIdx !== -1) {
    db.affiliateItems.splice(existingIdx, 1);
    isBookmarked = false;
  } else {
    db.affiliateItems.push({
      id: "AFF_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId,
      productId,
      createdAt: new Date().toISOString()
    });
    isBookmarked = true;
  }

  writeDb(db);
  res.json({
    success: true,
    isBookmarked,
    message: isBookmarked 
      ? "📌 ปักตะกร้าสินค้าสำเร็จ! คุณสามารถคัดลอกลิงค์แชร์เพื่อรับค่าคอมมิชชั่นได้ทันทีค่ะ" 
      : "ถอดสินค้าออกจากตะกร้า Affiliate เรียบร้อยแล้วค่ะ"
  });
});

// GET MY AFFILIATE BASKET
app.get('/api/affiliate/my-basket/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  if (!db.affiliateItems) db.affiliateItems = [];

  const myAffItems = db.affiliateItems.filter((item: any) => item.userId === userId);
  const myProductIds = myAffItems.map((item: any) => item.productId);

  const allProducts = [...(db.products || []), ...(db.sellerProducts || [])];
  const uniqueProductsMap = new Map();
  allProducts.forEach((p: any) => {
    if (myProductIds.includes(p.id) && !uniqueProductsMap.has(p.id)) {
      uniqueProductsMap.set(p.id, p);
    }
  });

  const productsList = Array.from(uniqueProductsMap.values());
  res.json({
    success: true,
    products: productsList,
    basketItems: myAffItems
  });
});

// GET ALL ESCROW & DISPUTED ORDERS FOR ADMIN / MANAGER
app.get('/api/admin/escrow-orders', (req, res) => {
  const db = readDb();
  const orders = db.orders || [];
  const escrowOrders = orders.filter((o: any) => o.escrowStatus || o.payoutCutoffDate || o.payoutStatus === 'PendingCutoff' || o.payoutStatus === 'DisputedHold');
  
  res.json({
    success: true,
    orders: escrowOrders,
    summary: {
      totalEscrow: escrowOrders.length,
      holding15Days: escrowOrders.filter((o: any) => o.escrowStatus === 'ESCROW_15_DAYS_HOLD').length,
      disputed: escrowOrders.filter((o: any) => o.escrowStatus === 'DISPUTED_PAUSED').length,
      released: escrowOrders.filter((o: any) => o.escrowStatus === 'RELEASED_PAID').length,
      refunded: escrowOrders.filter((o: any) => o.escrowStatus === 'REFUNDED_BUYER').length,
    }
  });
});

// ADMIN RESOLVE DISPUTE (RELEASE TO SELLER OR REFUND BUYER)
app.post('/api/admin/resolve-dispute', (req, res) => {
  const { orderId, action, notes } = req.body;
  const db = readDb();
  const order = (db.orders || []).find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลคำสั่งซื้อ" });

  if (!db.ledger) db.ledger = [];
  const now = new Date().toISOString();

  if (action === 'RELEASE_TO_SELLER') {
    order.escrowStatus = "RELEASED_PAID";
    order.payoutStatus = "Completed";
    order.disputeResolvedAt = now;
    order.adminResolveNotes = notes || "ผู้ดูแลระบบอนุมัติปล่อยเงินให้ร้านค้าตามปกติ";

    const payoutAmount = order.sellerPayoutAmount || order.totalAmount || order.totalPrice || 0;
    const sellerUserId = order.sellerId || order.shopOwnerId;

    if (sellerUserId && db.members) {
      const sellerMember = db.members.find((m: any) => m.userId === sellerUserId || m.sellerStoreName === order.sellerName);
      if (sellerMember) {
        sellerMember.balanceECash = (sellerMember.balanceECash || 0) + payoutAmount;
        sellerMember.totalRevenue = (sellerMember.totalRevenue || 0) + payoutAmount;
      }
    }

    db.ledger.push({
      id: `LEDGER_RESOLVE_${Date.now()}_${order.id}`,
      timestamp: now,
      type: "DISPUTE_RELEASE_SELLER",
      orderId: order.id,
      sellerId: sellerUserId || "STORE",
      amount: payoutAmount,
      description: `ผู้ดูแลระบบข้อยุติข้อพาท: โอนเงินให้ร้านค้า บิล #${order.id} (${notes || 'อนุมัติ'})`,
      status: "Success"
    });

    writeDb(db);
    return res.json({
      success: true,
      message: `อนุมัติปล่อยเงินโอน ฿${payoutAmount.toLocaleString()} บาท ให้แก่ร้านค้าเรียบร้อยแล้ว`,
      order
    });
  } else if (action === 'REFUND_TO_BUYER') {
    order.escrowStatus = "REFUNDED_BUYER";
    order.payoutStatus = "Refunded";
    order.disputeResolvedAt = now;
    order.adminResolveNotes = notes || "ผู้ดูแลระบบอนุมัติคืนเงินให้ผู้ซื้อเต็มจำนวน";

    const refundAmount = order.totalAmount || order.totalPrice || 0;
    const buyerUserId = order.userId || order.buyerId;

    if (buyerUserId && db.members) {
      const buyerMember = db.members.find((m: any) => m.userId === buyerUserId);
      if (buyerMember) {
        buyerMember.balanceECash = (buyerMember.balanceECash || 0) + refundAmount;
      }
    }

    db.ledger.push({
      id: `LEDGER_RESOLVE_REFUND_${Date.now()}_${order.id}`,
      timestamp: now,
      type: "DISPUTE_REFUND_BUYER",
      orderId: order.id,
      buyerId: buyerUserId,
      amount: refundAmount,
      description: `ผู้ดูแลระบบข้อยุติข้อพาท: คืนเงิน E-Cash ให้ผู้ซื้อ บิล #${order.id} (${notes || 'อนุมัติคืนเงิน'})`,
      status: "Success"
    });

    writeDb(db);
    return res.json({
      success: true,
      message: `อนุมัติคืนเงิน ฿${refundAmount.toLocaleString()} บาท เข้า E-Cash ของผู้ซื้อเรียบร้อยแล้ว`,
      order
    });
  } else {
    return res.status(400).json({ success: false, message: "Action ไม่ถูกต้อง" });
  }
});

// GET ORDER CHAT MESSAGES
app.get('/api/order/chat/:orderId', (req, res) => {
  const { orderId } = req.params;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลคำสั่งซื้อ" });

  if (!order.chatMessages) order.chatMessages = [];

  // Check 10-minute inactivity auto-end
  const now = Date.now();
  if (order.chatLastActivity && (now - order.chatLastActivity > 10 * 60 * 1000)) {
    order.chatEnded = true;
  }

  res.json({
    success: true,
    messages: order.chatMessages,
    chatEnded: !!order.chatEnded,
    lastActivity: order.chatLastActivity || null
  });
});

// SEND ORDER CHAT MESSAGE
app.post('/api/order/chat/send', (req, res) => {
  const { orderId, sender, text, imageUrl } = req.body;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลคำสั่งซื้อ" });

  if (!order.chatMessages) order.chatMessages = [];

  const now = Date.now();

  // If chat is ended by customer and sender is seller, reject
  if (order.chatEnded && sender === 'seller') {
    return res.status(400).json({ 
      success: false, 
      message: "ลูกค้าได้กดสิ้นสุดการสนทนาแล้ว ร้านค้าจะไม่สามารถส่งข้อความได้จนกว่าลูกค้าจะทักข้อความใหม่เข้ามาค่ะ" 
    });
  }

  // If sender is customer, automatically re-open chat session
  if (sender === 'customer') {
    order.chatEnded = false;
  }

  const newMsg = {
    id: "MSG_" + Math.random().toString(36).substr(2, 9),
    sender,
    text: text || '',
    imageUrl: imageUrl || null,
    createdAt: new Date().toISOString()
  };

  order.chatMessages.push(newMsg);
  order.chatLastActivity = now;

  writeDb(db);

  res.json({
    success: true,
    message: "ส่งข้อความสำเร็จ",
    chatMessages: order.chatMessages,
    chatEnded: !!order.chatEnded
  });
});

// END ORDER CHAT CONVERSATION (CUSTOMER ONLY)
app.post('/api/order/chat/end', (req, res) => {
  const { orderId, userId } = req.body;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return res.status(404).json({ success: false, message: "ไม่พบบิลคำสั่งซื้อ" });

  if (order.userId !== userId) {
    return res.status(403).json({ success: false, message: "เฉพาะลูกค้าผู้สั่งซื้อสินค้าเท่านั้นที่มีสิทธิ์กดสิ้นสุดการสนทนาค่ะ" });
  }

  order.chatEnded = true;
  order.chatLastActivity = Date.now();

  writeDb(db);

  res.json({
    success: true,
    message: "การสนทนาสิ้นสุดลงเรียบร้อยแล้วค่ะ",
    chatEnded: true
  });
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

  // Lock and preserve bank details from KYC submission
  if (!member.bankName && member.kycBankName) member.bankName = member.kycBankName;
  if (!member.bankAccount && member.kycBankAccount) member.bankAccount = member.kycBankAccount;
  if (member.bankName) member.kycBankName = member.bankName;
  if (member.bankAccount) member.kycBankAccount = member.bankAccount;

  // Lock shipping map pin status if coordinates exist
  if (member.shippingLat && (!member.shippingPinStatus || member.shippingPinStatus === 'NotPinned')) {
    member.shippingPinStatus = 'Confirmed';
  }

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

// APPROVE MEMBER SHIPPING PIN
app.post('/api/admin/approve-shipping-pin', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  if (member.pendingShippingLat && member.pendingShippingLng) {
    member.shippingLat = member.pendingShippingLat;
    member.shippingLng = member.pendingShippingLng;
  }
  member.pendingShippingLat = null;
  member.pendingShippingLng = null;
  member.shippingPinStatus = "Confirmed";
  
  writeDb(db);
  res.json({ success: true, message: `อนุมัติการแก้ไขพิกัดจัดส่งของสมาชิก ${member.name} ${member.surname} เรียบร้อยแล้วค่ะ` });
});

// REJECT MEMBER SHIPPING PIN
app.post('/api/admin/reject-shipping-pin', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบสมาชิก" });
  
  member.pendingShippingLat = null;
  member.pendingShippingLng = null;
  member.shippingPinStatus = "Confirmed"; // Revert/Keep their original/previous confirmed pin active
  
  writeDb(db);
  res.json({ success: true, message: `ปฏิเสธการแก้ไขพิกัดจัดส่ง เรียบร้อยแล้ว ระบบจะพับกลับไปใช้พิกัดปักหมุดเดิม` });
});

// GET PENDING SHIPPING PINS QUEUE
app.get('/api/admin/pending-shipping-pins', (req, res) => {
  const db = readDb();
  const queue = db.members.filter(m => m.shippingPinStatus === "PendingApproval");
  res.json({ success: true, queue });
});

// AI DESCRIPTION REFINE ENDPOINT
app.post('/api/ai/refine-description', async (req, res) => {
  const { text, productName } = req.body;
  const targetText = (text && text.trim()) ? text.trim() : (productName && productName.trim() ? `สรรพคุณและคุณประโยชน์ของ ${productName.trim()}` : "");

  if (!targetText) {
    return res.status(400).json({ success: false, message: "กรุณาระบุชื่อสินค้าหรือรายละเอียดสินค้าก่อนเพื่อให้ AI ช่วยเรียบเรียง" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not defined in environment variables. Falling back to simple simulated rewrite.");
    const mockRefined = `🌿 ${targetText.slice(0, 300)} ✨ ปลอดภัย ได้มาตรฐานนทีพลัส 💯% (ปรับปรุงสรรพคุณตามข้อกำหนดกฎหมายเรียบร้อยแล้วค่ะ)`;
    return res.json({ success: true, refinedText: mockRefined });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `คุณคือ AI ผู้ช่วยเขียนรายละเอียดสินค้าสำหรับร้านค้าบนระบบ Natee Plus
หน้าที่ของคุณคือ นำข้อมูลสินค้าหรือข้อความสรรพคุณสินค้าต่อไปนี้ มาเขียนและเรียบเรียงใหม่ให้น่าอ่าน มีการใช้อิโมจิเล็กน้อยเพิ่มความดึงดูด และที่สำคัญที่สุดคือ ต้องปรับเปลี่ยนถ้อยคำให้ถูกต้องตามเกณฑ์ของกฎหมายไทย (เช่น พระราชบัญญัติอาหาร พ.ศ. 2522, พระราชบัญญัติเครื่องสำอาง พ.ศ. 2558, สมุนไพร ฯลฯ)
- ต้องตัดหรือลดทอนคำอวดอ้างสรรพคุณเกินจริง คำโฆษณาต้องห้ามของ อย. (เช่น รักษาโรคหายขาด, ยาเทวดา, ดีที่สุดในโลก, ยับยั้งหรือป้องกันมะเร็ง, ขาวทันใจใน 3 วัน, ปลอดภัย 100%, เห็นผลทันที)
- ปรับเปลี่ยนคำเหล่านั้นให้เป็นคำที่สุภาพ น่าเชื่อถือ ปลอดภัย และถูกกฎหมาย เช่น ช่วยบำรุง, ช่วยดูแลผิวพรรณ, สนับสนุนการทำงานของร่างกาย, อ่อนโยนต่อผิว
- ความยาวของข้อความผลลัพธ์ห้ามเกิน 500 ตัวอักษรโดยเด็ดขาด
- ให้ส่งกลับเฉพาะข้อความที่ปรับปรุงเสร็จแล้วเท่านั้น ไม่ต้องมีคำเกริ่นนำหรือคำอธิบายใดๆ ทั้งสิ้น

ข้อมูลสินค้า: "${targetText}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const refinedText = response.text ? response.text.trim() : targetText;
    const finalRefinedText = refinedText.slice(0, 500);

    res.json({ success: true, refinedText: finalRefinedText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI: " + error.message });
  }
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
  member.statusKyc = "Active";
  if (!member.sellerCode) {
    member.sellerCode = generateSellerCode(db);
  }
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
  if (!prod) return res.status(404).json({ success: false, message: "ไม่พบสินค้าในรายการขออนุมัติ" });
  
  prod.status = "Approved";
  
  // Remove existing copy in db.products if any, to avoid duplicate
  db.products = db.products.filter(p => p.id !== productId);
  
  // Push clean copy to main store products
  const mainProduct = {
    ...prod,
    id: prod.id,
    name: prod.name,
    price: parseFloat(prod.price) || 0,
    pv: parseFloat(prod.pv) || 0,
    cost: prod.cost !== undefined ? parseFloat(prod.cost) : Math.floor((parseFloat(prod.price) || 0) * 0.30),
    image: prod.image || (prod.images && prod.images[0]) || "",
    images: prod.images && prod.images.length > 0 ? prod.images : [prod.image].filter(Boolean),
    description: prod.description || "",
    shortDescription: prod.shortDescription || "",
    category: prod.category || "General",
    subcategory: prod.subcategory || "",
    sellerId: prod.sellerId || "",
    sellerCode: prod.sellerCode || "",
    sellerStoreName: prod.sellerStoreName || "",
    status: "Approved",
    weight: parseFloat(prod.weight) || 0,
    width: parseFloat(prod.width) || 0,
    length: parseFloat(prod.length) || 0,
    height: parseFloat(prod.height) || 0,
    volumetricWeight: parseFloat(prod.volumetricWeight) || 0,
    chargeableWeight: parseFloat(prod.chargeableWeight) || 0,
    baseShippingCost: parseFloat(prod.baseShippingCost) || 35,
    shippingFeeBase: parseFloat(prod.shippingFeeBase) || 35,
    shippingDiscount: parseFloat(prod.shippingDiscount) || 0,
    discountPercent: parseFloat(prod.discountPercent) || 0,
    affiliateCommission: parseFloat(prod.affiliateCommission) || 0,
    isAffiliateEnabled: prod.isAffiliateEnabled !== false,
    extraPv: parseFloat(prod.extraPv) || 0,
    isAvailable: prod.isAvailable !== false,
    sellerCoPay: parseFloat(prod.sellerCoPay) || 0,
    customerShippingFee: parseFloat(prod.customerShippingFee) || 35,
    netPayout: parseFloat(prod.netPayout) || 0
  };

  db.products.push(mainProduct);
  
  writeDb(db);
  res.json({ success: true, message: `อนุมัติเปิดจำหน่ายสินค้า "${prod.name}" ของร้าน ${prod.sellerStoreName || ''} สำเร็จเรียบร้อยแล้ว!` });
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

// UPDATE STORE STATUS (Active / Rejected / Suspended / NotApplied)
app.post('/api/admin/store-update-status', (req, res) => {
  const { userId, status } = req.body;
  const db = readDb();
  const member = db.members.find(m => m.userId === userId);
  if (!member) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสมาชิก" });

  const validStatuses = ["Active", "Rejected", "Suspended", "NotApplied", "Pending"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "สถานะไม่ถูกต้อง" });
  }

  member.sellerStatus = status;

  if (status === "Active" && !member.sellerCode) {
    member.sellerCode = generateSellerCode(db);
  }

  // If set to NotApplied, we can clean up code or preserve it as a record
  if (status === "NotApplied") {
    // Optionally clean or keep
  }

  writeDb(db);

  let statusMsg = "";
  if (status === "Active") statusMsg = "อนุมัติร้านค้าเรียบร้อยแล้วค่ะ";
  else if (status === "Rejected") statusMsg = "ปฏิเสธการขออนุมัติร้านค้าเรียบร้อยแล้วค่ะ";
  else if (status === "Suspended") statusMsg = "ระงับการใช้งานร้านค้าชั่วคราวเรียบร้อยแล้วค่ะ";
  else if (status === "NotApplied") statusMsg = "ยกเลิกร้านค้ากลับสู่สถานะยังไม่สมัครเรียบร้อยแล้วค่ะ";
  else statusMsg = `เปลี่ยนสถานะร้านค้าเป็น ${status} เรียบร้อยแล้วค่ะ`;

  res.json({ success: true, message: statusMsg, sellerStatus: status });
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

// RESTORE ALL PRODUCTS & SELF-HEAL
app.post('/api/admin/restore-products', async (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.products)) db.products = [];
  if (!Array.isArray(db.sellerProducts)) db.sellerProducts = [];

  // 1. Re-inject default general products if missing
  for (const defProd of DEFAULT_GENERAL_PRODUCTS) {
    if (!db.products.some((p: any) => p && p.id === defProd.id)) {
      db.products.push({ ...defProd });
    }
  }

  // 2. Re-inject approved seller products into main store
  for (const sp of db.sellerProducts) {
    if (sp && sp.id && (sp.status === 'Approved' || sp.status === 'Active')) {
      const exists = db.products.some((p: any) => p && p.id === sp.id);
      if (!exists) {
        db.products.push({
          ...sp,
          status: 'Approved'
        });
      }
    }
  }

  // 3. Ensure sellerProducts contains all products that have sellerId
  for (const mp of db.products) {
    if (mp && mp.sellerId && mp.id) {
      if (!db.sellerProducts.some((sp: any) => sp && sp.id === mp.id)) {
        db.sellerProducts.push({
          ...mp,
          status: mp.status || 'Approved'
        });
      }
    }
  }

  writeDb(db);
  if (dbFirestore) {
    try {
      await saveDbToFirestore(db, true);
    } catch (e) {
      console.error("Failed to sync restored products to Firestore:", e);
    }
  }

  res.json({
    success: true,
    message: "ฟื้นฟูรายการสินค้าตัวอย่างและซิงค์สินค้าทั้งหมดกลับสู่ระบบเรียบร้อยแล้ว!",
    products: db.products,
    sellerProducts: db.sellerProducts
  });
});

// EDIT SELLER PRODUCT (Every edit forces re-approval unless admin override)
app.post('/api/seller/product/edit', async (req, res) => {
  const { 
    userId, productId, productName, price, discountPercent, shippingFeeBase, shippingDiscount, pv, imageFile, images, description, shortDescription, category, cost,
    subcategory, weight, width, length, height, volumetricWeight, chargeableWeight,
    baseShippingCost, sellerCoPay, customerShippingFee, netPayout, approveInstantly,
    affiliateCommission, isAffiliateEnabled, extraPv, isAvailable
  } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  const isAdmin = member?.role === 'Admin' || userId === 'admin' || (typeof userId === 'string' && userId.startsWith('admin_'));

  let prod = db.sellerProducts.find(p => String(p.id) === String(productId));
  if (!prod) {
    const mainProd = db.products.find(p => String(p.id) === String(productId));
    if (mainProd) {
      prod = mainProd;
      if (!db.sellerProducts.some(p => String(p.id) === String(productId))) {
        db.sellerProducts.push(mainProd);
      }
    }
  }

  if (!prod) return res.status(404).json({ success: false, message: "ไม่พบสินค้าชิ้นนี้ในระบบ" });

  if (!isAdmin && prod.sellerId && prod.sellerId !== userId && member?.userId !== prod.sellerId) {
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์แก้ไขสินค้าของร้านค้าอื่น" });
  }

  let processedImages: string[] = [];
  if (Array.isArray(images) && images.length > 0) {
    for (let i = 0; i < Math.min(5, images.length); i++) {
      const img = images[i];
      if (typeof img === 'string' && img.trim()) {
        if (img.startsWith("data:")) {
          try {
            const uploadedUrl = await uploadImageToFirebaseOrKeepBase64(img, 'products', `${productId}_img_${i}_${Date.now()}`);
            processedImages.push(uploadedUrl);
          } catch (e) {
            console.error(e);
          }
        } else {
          processedImages.push(img.trim());
        }
      }
    }
  }

  if (processedImages.length === 0 && imageFile && typeof imageFile === 'string' && imageFile.startsWith("data:")) {
    try {
      const uploadedUrl = await uploadImageToFirebaseOrKeepBase64(imageFile, 'products', `${productId}_img_0_${Date.now()}`);
      processedImages.push(uploadedUrl);
    } catch (e) {
      console.error(e);
    }
  } else if (processedImages.length === 0 && imageFile && typeof imageFile === 'string') {
    processedImages.push(imageFile);
  }

  if (processedImages.length === 0) {
    processedImages.push(prod.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300");
  }

  const primaryImage = processedImages[0];
  const priceVal = parseFloat(price);
  const costVal = cost !== undefined && cost !== "" ? parseFloat(cost) : Math.floor(priceVal * 0.30);
  
  // Update properties
  prod.name = productName;
  prod.price = priceVal;
  prod.discountPercent = parseFloat(discountPercent) || 0;
  prod.shippingFeeBase = parseFloat(shippingFeeBase) || parseFloat(baseShippingCost) || 35;
  prod.shippingDiscount = parseFloat(shippingDiscount) || parseFloat(sellerCoPay) || 0;
  prod.pv = parseFloat(pv) || 0;
  prod.cost = costVal;
  prod.image = primaryImage;
  prod.images = processedImages;
  prod.description = description;
  prod.shortDescription = shortDescription || "";
  prod.category = category || "General";
  
  prod.subcategory = subcategory || "";
  prod.weight = parseFloat(weight) || 0;
  prod.width = parseFloat(width) || 0;
  prod.length = parseFloat(length) || 0;
  prod.height = parseFloat(height) || 0;
  prod.volumetricWeight = parseFloat(volumetricWeight) || 0;
  prod.chargeableWeight = parseFloat(chargeableWeight) || 0;
  prod.baseShippingCost = prod.shippingFeeBase;
  prod.sellerCoPay = prod.shippingDiscount;
  prod.customerShippingFee = parseFloat(customerShippingFee) || 35;
  prod.affiliateCommission = parseFloat(affiliateCommission) || 0;
  prod.isAffiliateEnabled = isAffiliateEnabled !== false && isAffiliateEnabled !== 'false';
  prod.extraPv = parseFloat(extraPv) || 0;
  prod.isAvailable = isAvailable !== false && isAvailable !== 'false';
  prod.netPayout = parseFloat(netPayout) || 0;
  
  const isApproved = !!approveInstantly || isAdmin;

  if (isApproved) {
    prod.status = "Approved";
    if (prod.rejectReason) {
      delete prod.rejectReason;
    }
    // Update copy in main store products
    db.products = db.products.filter(p => String(p.id) !== String(productId));
    db.products.push({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      discountPercent: prod.discountPercent,
      shippingFeeBase: prod.shippingFeeBase,
      shippingDiscount: prod.shippingDiscount,
      pv: prod.pv,
      cost: prod.cost,
      image: prod.image,
      images: prod.images,
      description: prod.description,
      shortDescription: prod.shortDescription || "",
      category: prod.category || "General",
      sellerId: prod.sellerId,
      sellerCode: prod.sellerCode,
      sellerStoreName: prod.sellerStoreName,
      subcategory: prod.subcategory || "",
      weight: prod.weight || 0,
      width: prod.width || 0,
      length: prod.length || 0,
      height: prod.height || 0,
      volumetricWeight: prod.volumetricWeight || 0,
      chargeableWeight: prod.chargeableWeight || 0,
      baseShippingCost: prod.baseShippingCost || 35,
      sellerCoPay: prod.sellerCoPay || 0,
      customerShippingFee: prod.customerShippingFee || 35,
      affiliateCommission: prod.affiliateCommission || 0,
      isAffiliateEnabled: prod.isAffiliateEnabled !== false,
      extraPv: prod.extraPv || 0,
      isAvailable: prod.isAvailable !== false,
      netPayout: prod.netPayout || 0
    });
  } else {
    prod.status = "Pending";
    if (prod.rejectReason) {
      delete prod.rejectReason;
    }
    // Remove from main store until approved again
    db.products = db.products.filter(p => String(p.id) !== String(productId));
  }
  
  writeDb(db);
  res.json({ 
    success: true, 
    message: isApproved 
      ? "แอดมินใช้สิทธิ์แทรกแซง: แก้ไขข้อมูลและอนุมัติสินค้าทันทีสำเร็จ! ✨" 
      : "แก้ไขรายละเอียดสินค้าสำเร็จ! นำส่งให้แอดมินอนุมัติใหม่อีกครั้งเพื่อความโปร่งใสเรียบร้อยแล้วค่ะ" 
  });
});

// QUICK TOGGLE SELLER PRODUCT AVAILABILITY (IN STOCK / OUT OF STOCK)
app.post('/api/seller/product/toggle-availability', (req, res) => {
  const { productId, userId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  const isAdmin = member?.role === 'Admin' || userId === 'admin' || (typeof userId === 'string' && userId.startsWith('admin_'));

  let prod = db.sellerProducts.find(p => String(p.id) === String(productId));
  if (!prod) {
    const mainProd = db.products.find(p => String(p.id) === String(productId));
    if (mainProd) {
      prod = mainProd;
      if (!db.sellerProducts.some(p => String(p.id) === String(productId))) {
        db.sellerProducts.push(mainProd);
      }
    }
  }

  if (!prod) return res.status(404).json({ success: false, message: "ไม่พบสินค้าชิ้นนี้ในระบบ" });

  if (!isAdmin && prod.sellerId && prod.sellerId !== userId && member?.userId !== prod.sellerId) {
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์แก้ไขสินค้าของร้านค้าอื่น" });
  }

  // Toggle availability state
  const newAvailable = prod.isAvailable === false ? true : false;
  prod.isAvailable = newAvailable;

  // Also update in main store products
  const mainProd = db.products.find(p => String(p.id) === String(productId));
  if (mainProd) {
    mainProd.isAvailable = newAvailable;
  }

  writeDb(db);
  res.json({ 
    success: true, 
    isAvailable: newAvailable,
    message: newAvailable 
      ? `เปิดขายรายการสินค้า "${prod.name}" เรียบร้อยแล้วค่ะ 🟢` 
      : `ปิดรายการสินค้า "${prod.name}" (สินค้าหมด / หยุดขายชั่วคราว) เรียบร้อยแล้วค่ะ 🔴` 
  });
});

// ADMIN / SELLER DELETE PRODUCT
app.post('/api/admin/product-delete', (req, res) => {
  const { productId, userId } = req.body;
  const db = readDb();
  
  const member = db.members.find(m => m.userId === userId);
  const isAdmin = member?.role === 'Admin' || userId === 'admin' || (typeof userId === 'string' && userId.startsWith('admin_'));

  const prod = db.sellerProducts.find(p => p.id === productId);
  if (!prod) {
    const mainOnly = db.products.find(p => p.id === productId);
    if (!mainOnly) return res.status(404).json({ success: false, message: "ไม่พบสินค้าในระบบ" });
    if (!isAdmin && mainOnly.sellerId && mainOnly.sellerId !== userId && member?.userId !== mainOnly.sellerId) {
      return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ลบสินค้าของร้านค้าอื่น" });
    }
    db.products = db.products.filter(p => p.id !== productId);
    writeDb(db);
    return res.json({ success: true, message: `ลบสินค้า "${mainOnly.name}" ออกจากระบบเรียบร้อยแล้ว!` });
  }

  if (!isAdmin && prod.sellerId && prod.sellerId !== userId && member?.userId !== prod.sellerId) {
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ลบสินค้าของร้านค้าอื่น" });
  }

  db.sellerProducts = db.sellerProducts.filter(p => p.id !== productId);
  db.products = db.products.filter(p => p.id !== productId);

  writeDb(db);
  res.json({ success: true, message: `ลบสินค้า "${prod.name}" ออกจากร้านค้าและระบบเรียบร้อยแล้ว!` });
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
     const taxDeduct = txn.withholdingTax !== undefined ? txn.withholdingTax : ((txn.amount * 0.80) * 0.03);
     db.systemStats.totalTaxReserves = parseFloat((db.systemStats.totalTaxReserves - taxDeduct).toFixed(4));
  } else if (deductionType === 'Profit' && txn.netAmount) {
     const feeDeduct = txn.companyFee !== undefined ? txn.companyFee : ((txn.amount * 0.80) * 0.02);
     db.systemStats.totalCompanyProfits = parseFloat((db.systemStats.totalCompanyProfits - feeDeduct).toFixed(4));
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

// GET SYSTEM BANK SETTINGS FOR DEPOSIT & PROMO CONFIG
app.get('/api/bank-settings', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    bankSettings: db.bankSettings || {
      bankName: "ธนาคารไทยพาณิชย์",
      bankAccount: "111-222-3333",
      bankAccountName: "บริษัท นที พลัส มาร์เก็ต จำกัด",
      qrCodeUrl: ""
    },
    promoConfig: db.bankSettings?.promoConfig || {
      active: false,
      title: '🔥 โปรโมชั่นนาทีทอง มาร์เก็ตนทีพลัส',
      subtitle: 'ช้อปคุ้ม รับส่วนลดพิเศษและคะแนน PV สะสมเข้าบัญชีทันที!',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
      buttonText: 'ช้อปสินค้าราคาพิเศษทันที 🛍️',
      linkTab: 'shop'
    }
  });
});

// UPDATE SYSTEM BANK SETTINGS FOR DEPOSIT
app.post('/api/bank-settings', async (req, res) => {
  const { bankName, bankAccount, bankAccountName, qrCodeFile, editorUserId, remainingRightsMode, maintenanceMode } = req.body;
  const db = readDb();
  
  if (editorUserId) {
    const editor = db.members.find(m => m.userId === editorUserId);
    if (!editor || (editor.role !== 'Manager' && editor.role !== 'Admin')) {
      return res.status(403).json({ success: false, message: "ไม่มีสิทธิ์ในการแก้ไขตั้งค่าระบบ (เฉพาะสิทธิ์ Manager หรือ Admin เท่านั้น)" });
    }
  }

  let qrCodeUrl = db.bankSettings?.qrCodeUrl || "";
  if (qrCodeFile !== undefined) {
    try {
      if (qrCodeFile && qrCodeFile.startsWith("data:")) {
        qrCodeUrl = await uploadImageToFirebaseOrKeepBase64(qrCodeFile, 'bank', `bank_qr`);
      } else if (qrCodeFile === null || qrCodeFile === "") {
        qrCodeUrl = "";
      }
    } catch (err) {
      console.error("Error saving QR Code file:", err);
      return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกรูปภาพ QR Code" });
    }
  }

  db.bankSettings = {
    bankName: bankName !== undefined ? bankName : (db.bankSettings?.bankName || "ธนาคารไทยพาณิชย์"),
    bankAccount: bankAccount !== undefined ? bankAccount : (db.bankSettings?.bankAccount || "111-222-3333"),
    bankAccountName: bankAccountName !== undefined ? bankAccountName : (db.bankSettings?.bankAccountName || "บริษัท นที พลัส มาร์เก็ต จำกัด"),
    qrCodeUrl: qrCodeUrl,
    remainingRightsMode: remainingRightsMode !== undefined ? remainingRightsMode : (db.bankSettings?.remainingRightsMode || "1_channel"),
    maintenanceMode: maintenanceMode !== undefined ? !!maintenanceMode : (db.bankSettings?.maintenanceMode || false),
    sellerRegulations: db.bankSettings?.sellerRegulations,
    promoConfig: db.bankSettings?.promoConfig
  };

  writeDb(db);
  res.json({ success: true, message: "บันทึกข้อมูลการตั้งค่าระบบเรียบร้อยแล้วค่ะ", bankSettings: db.bankSettings });
});

// UPDATE PROMO POPUP CONFIG
app.post('/api/admin/promo-config', async (req, res) => {
  const { active, title, subtitle, imageUrl, buttonText, linkTab, imageFile, editorUserId } = req.body;
  const db = readDb();

  if (editorUserId) {
    const editor = db.members.find((m: any) => m.userId === editorUserId || m.username === editorUserId);
    const roleUpper = (editor?.role || '').toUpperCase();
    const isAllowed = roleUpper === 'ADMIN' || roleUpper === 'MANAGER' || editor?.username === 'admin' || editor?.userId === 'ADMIN001';
    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "ไม่มีสิทธิ์ในการแก้ไขตั้งค่าระบบ (เฉพาะสิทธิ์ Manager หรือ Admin เท่านั้น)" });
    }
  }

  let finalImgUrl = imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';
  if (imageFile && imageFile.startsWith("data:")) {
    try {
      finalImgUrl = await uploadImageToFirebaseOrKeepBase64(imageFile, 'promo', `promo_banner`);
    } catch (e) {
      console.error("Error saving promo image:", e);
    }
  }

  if (!db.bankSettings) {
    db.bankSettings = {
      bankName: "ธนาคารไทยพาณิชย์",
      bankAccount: "111-222-3333",
      bankAccountName: "บริษัท นที พลัส มาร์เก็ต จำกัด"
    };
  }

  db.bankSettings.promoConfig = {
    active: active !== undefined ? !!active : true,
    title: title || '🔥 โปรโมชั่นนาทีทอง มาร์เก็ตนทีพลัส',
    subtitle: subtitle || 'ช้อปคุ้ม รับส่วนลดพิเศษและคะแนน PV สะสมเข้าบัญชีทันที!',
    imageUrl: finalImgUrl,
    buttonText: buttonText || 'ช้อปสินค้าราคาพิเศษทันที 🛍️',
    linkTab: linkTab || 'shop'
  };

  writeDb(db);
  res.json({ success: true, message: "บันทึกข้อมูล Pop-Up โปรโมชั่นเรียบร้อยแล้วค่ะ", promoConfig: db.bankSettings.promoConfig });
});

// GET & SAVE LINE DEVELOPERS MESSAGING API & WEBHOOK SETTINGS
app.get('/api/admin/notify-settings', (req, res) => {
  const db = readDb();
  const settings = db.bankSettings?.notifySettings || {
    lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_NOTIFY_TOKEN || "",
    lineTargetId: process.env.LINE_TARGET_ID || "",
    lineNotifyToken: process.env.LINE_NOTIFY_TOKEN || "",
    webhookUrl: process.env.WEBHOOK_URL || "",
    notifyWithdrawal: true,
    notifyNewShop: true,
    notifyNewOrder: true
  };
  res.json({ success: true, settings });
});

app.post('/api/admin/notify-settings', (req, res) => {
  const { lineChannelAccessToken, lineTargetId, lineNotifyToken, webhookUrl, notifyWithdrawal, notifyNewShop, notifyNewOrder, editorUserId } = req.body;
  const db = readDb();

  if (editorUserId) {
    const editor = db.members.find(m => m.userId === editorUserId);
    if (!editor || (editor.role !== 'Manager' && editor.role !== 'Admin')) {
      return res.status(403).json({ success: false, message: "ไม่มีสิทธิ์ในการแก้ไขตั้งค่าระบบ (เฉพาะสิทธิ์ Manager หรือ Admin เท่านั้น)" });
    }
  }

  if (!db.bankSettings) {
    db.bankSettings = {
      bankName: "ธนาคารไทยพาณิชย์",
      bankAccount: "111-222-3333",
      bankAccountName: "บริษัท นที พลัส มาร์เก็ต จำกัด"
    };
  }

  db.bankSettings.notifySettings = {
    lineChannelAccessToken: lineChannelAccessToken !== undefined ? lineChannelAccessToken.trim() : (db.bankSettings.notifySettings?.lineChannelAccessToken || ""),
    lineTargetId: lineTargetId !== undefined ? lineTargetId.trim() : (db.bankSettings.notifySettings?.lineTargetId || ""),
    lineNotifyToken: lineNotifyToken !== undefined ? lineNotifyToken.trim() : (db.bankSettings.notifySettings?.lineNotifyToken || ""),
    webhookUrl: webhookUrl !== undefined ? webhookUrl.trim() : (db.bankSettings.notifySettings?.webhookUrl || ""),
    notifyWithdrawal: notifyWithdrawal !== undefined ? !!notifyWithdrawal : true,
    notifyNewShop: notifyNewShop !== undefined ? !!notifyNewShop : true,
    notifyNewOrder: notifyNewOrder !== undefined ? !!notifyNewOrder : true
  };

  writeDb(db);
  res.json({ success: true, message: "บันทึกการตั้งค่าระบบแจ้งเตือน LINE Developers เรียบร้อยแล้วค่ะ", settings: db.bankSettings.notifySettings });
});

// TEST SEND NOTIFICATION
app.post('/api/admin/test-notify', async (req, res) => {
  const { message } = req.body;
  const msg = (message || "").trim() || "🧪 ทดสอบการส่งแจ้งเตือนจากระบบ Natee Plus Market สำเร็จสมบูรณ์!";
  const resObj = await sendSystemNotification('withdrawal', msg);
  res.json(resObj);
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
    res.json({ success: true, config, isFirestoreQuotaExceeded: isFirestoreQuotaExceeded || !isDatabaseLoadedFromFirestore });
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

// GET LIVE STREAMS & BANNER STATUS
app.get('/api/live-streams', (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.liveStreams)) {
    db.liveStreams = [];
  } else {
    // Filter out legacy mock live streams so only actual user-created live streams appear
    db.liveStreams = db.liveStreams.filter((s: any) => s && !['live_001', 'live_002', 'live_003'].includes(s.id) && s.status === 'LIVE');
  }
  writeDb(db);

  res.json({
    success: true,
    bannerVisible: db.bannerVisible !== false,
    liveSystemEnabled: db.liveSystemEnabled !== false,
    liveStreams: db.liveStreams
  });
});

// ADMIN TOGGLE LIVE SYSTEM GLOBAL SWITCH
app.post('/api/admin/toggle-live-system', (req, res) => {
  const { enabled } = req.body;
  const db = readDb();
  db.liveSystemEnabled = !!enabled;
  writeDb(db);
  res.json({
    success: true,
    liveSystemEnabled: db.liveSystemEnabled,
    message: db.liveSystemEnabled ? "เปิดใช้งานระบบไลฟ์สดเรียบร้อยแล้วค่ะ" : "ปิดใช้งานระบบไลฟ์สดเรียบร้อยแล้วค่ะ"
  });
});

// CREATE / START LIVE STREAM
app.post('/api/live-streams/create', (req, res) => {
  const { sellerId, sellerStoreName, title, streamUrl, coverImage, pinnedProductIds } = req.body;
  if (!sellerId || !title) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วนค่ะ" });
  }

  const db = readDb();

  // Check Global Live System Master Switch
  if (db.liveSystemEnabled === false) {
    return res.status(403).json({
      success: false,
      message: "ระบบไลฟ์สดถูกปิดใช้งานชั่วคราวโดยผู้ดูแลระบบ (Admin) ค่ะ"
    });
  }
  if (!Array.isArray(db.members)) db.members = [];

  // Find seller member record
  const member = db.members.find((m: any) => m.userId === sellerId || m.id === sellerId || m.username === sellerId);
  
  // 1. Check Admin Approval Status (Must be Active seller or Admin/Manager)
  const isApprovedSeller = member ? (member.sellerStatus === 'Active' || member.role === 'Admin' || member.role === 'Manager') : false;
  if (!isApprovedSeller) {
    return res.status(403).json({
      success: false,
      message: `ท่านยังไม่ได้เป็นร้านค้าที่ผ่านการอนุมัติจาก Admin (สถานะปัจจุบัน: ${member?.sellerStatus || 'ยังไม่ได้เปิดร้านค้า'}) กรุณาสมัครเปิดร้านและรอแอดมินอนุมัติก่อนเปิดไลฟ์สดค่ะ`
    });
  }

  // 2. Check Valid Store Name
  const verifiedStoreName = member?.sellerStoreName || member?.storeName || (member?.role === 'Admin' || member?.role === 'Manager' ? 'ร้านค้าส่วนกลาง นทีพลัส มาร์เก็ต' : sellerStoreName);
  if (!verifiedStoreName || verifiedStoreName.trim() === '' || verifiedStoreName === 'ร้านค้าสมาชิก นทีพลัส' || verifiedStoreName === 'ร้านค้าพาร์ทเนอร์') {
    if (!member?.sellerStoreName && member?.role !== 'Admin' && member?.role !== 'Manager') {
      return res.status(400).json({
        success: false,
        message: "ไม่พบชื่อร้านค้าที่ได้รับการอนุมัติของคุณ กรุณาตั้งชื่อร้านค้าในหน้าโปรไฟล์และรับการอนุมัติจาก Admin ก่อนเริ่มไลฟ์สดค่ะ"
      });
    }
  }

  if (!Array.isArray(db.liveStreams)) db.liveStreams = [];

  const newLive = {
    id: `live_${Date.now()}`,
    sellerId: member?.userId || sellerId,
    sellerStoreName: verifiedStoreName || "ร้านค้าพาร์ทเนอร์นทีพลัส",
    sellerCode: member?.sellerCode || member?.userId || sellerId,
    title,
    streamUrl: streamUrl || "https://www.youtube.com/embed/jfKfPfyJRdk",
    coverImage: coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    status: "LIVE",
    viewersCount: Math.floor(15 + Math.random() * 50),
    pinnedProductIds: pinnedProductIds || [],
    createdAt: new Date().toISOString(),
    warningBanner: null,
    chatMessages: [
      { id: 'init', sender: 'ระบบอัตโนมัติ', text: `🔴 เริ่มต้นการถ่ายทอดสดโดยร้าน ${verifiedStoreName} ยินดีต้อนรับผู้เข้าชมทุกท่านค่ะ`, time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }), aiBlocked: false }
    ]
  };

  db.liveStreams.unshift(newLive);
  writeDb(db);
  res.json({ success: true, message: "เปิดห้องไลฟ์สดเรียบร้อยแล้วค่ะ!", liveStream: newLive });
});

// POST CHAT MESSAGE WITH AI MODERATION
app.post('/api/live-streams/chat', (req, res) => {
  const { liveId, senderName, text } = req.body;
  if (!liveId || !text) return res.status(400).json({ success: false, message: "ข้อมูลไม่สมบูรณ์" });

  const db = readDb();
  if (!Array.isArray(db.liveStreams)) db.liveStreams = [];

  const stream = db.liveStreams.find((s: any) => s.id === liveId);
  if (!stream) return res.status(404).json({ success: false, message: "ไม่พบห้องไลฟ์สด" });

  if (!Array.isArray(stream.chatMessages)) stream.chatMessages = [];

  // Banned Thai profanity & illegal terms
  const bannedKeywords = ['เหี้ย', 'ควย', 'ส้นตีน', 'สัตว์', 'เย็ด', 'เยด', 'มึง', 'กู', 'เชี่ย', 'ฉ้อโกง', 'หลอกลวง', 'เว็บพนัน', 'พนันออนไลน์', 'บาคาร่า', 'สล็อต', 'กระหรี่', 'สบประมาท', 'โง่'];
  let cleanedText = text;
  let isBlocked = false;

  for (const word of bannedKeywords) {
    const reg = new RegExp(word, 'gi');
    if (reg.test(cleanedText)) {
      isBlocked = true;
      cleanedText = cleanedText.replace(reg, '*** [ตรวจพบคำไม่เหมาะสม AI] ***');
    }
  }

  const msgObj = {
    id: `msg_${Date.now()}`,
    sender: senderName || 'ผู้เข้าชม',
    text: cleanedText,
    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    aiBlocked: isBlocked
  };

  stream.chatMessages.push(msgObj);
  writeDb(db);

  res.json({
    success: true,
    message: isBlocked ? '⚠️ AI ตรวจพบข้อความไม่อยู่ในระเบียบชุมชน และทำการคัดกรองเรียบร้อยค่ะ' : 'ส่งข้อความสำเร็จ',
    chatMessage: msgObj
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
    const filename = `nateeplus_db_${isSandboxActive ? 'sandbox' : 'production'}_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
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
    console.log(`📥 [Import] Overwriting entire database... (Sandbox: ${isSandboxActive})`);
    
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
    
    console.log(`✅ [Import] Database imported successfully! (Total Members: ${cacheDb.members.length})`);
    
    return res.json({
      success: true,
      message: `นำเข้าข้อมูลฐานข้อมูลสำเร็จแล้วค่ะ! มีรายชื่อสมาชิกทั้งหมด ${cacheDb.members.length} ท่าน และอัปเดตไปยังระบบ Cloud เรียบร้อยแล้วค่ะ ✨`
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
      bodyText: `แจ้งเตือนสิทธิ์ผู้จัดการ (Manager): แอดมิน ${admin.name || admin.username} ได้ขอรหัส OTP เพื่ออนุมัติรายการแก้ไขข้อมูลในระบบ`
    }).catch(err => console.error("Async email error:", err));
  }
  
  res.json({
    success: true,
    otpSimulated: otpCode,
    message: `ส่งรหัส OTP อนุมัติ 6 หลักไปยังอีเมลผู้จัดการ (${targetEmail || 'Manager'}) เรียบร้อยแล้วค่ะ`
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
  if (parentId !== undefined) member.parentId = parentId;
  if (side !== undefined) member.side = side;
  if (planBPoints !== undefined) member.planBPoints = Number(planBPoints);

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
        name: "บริษัท นที พลัส มาร์เก็ต",
        surname: "จำกัด",
        phone: "0635161734",
        idCard: "1233445566778",
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
        member.idCard = "1233445566778";
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
    
    console.log(`📁 Resolved dist path for static serving: ${distPath}`);
    app.use(express.static(distPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else if (filePath.includes('/assets/') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
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
    console.log(`NaTee Plus full-stack server is listening on port ${PORT}`);
  });
}

startServer();
