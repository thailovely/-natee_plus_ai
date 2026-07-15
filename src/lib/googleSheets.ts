import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, type User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleSheetsAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleSheets = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sheets Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogleSheets = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface MemberExportData {
  userId: string;
  username: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  rank: string;
  role: string;
  balanceMCash: number;
  balanceMCoupon: number;
  totalEarnings: number;
  totalCouponsEarned: number;
  sponsorId: string;
  createdAt: string;
}

export const exportMembersToGoogleSheets = async (
  members: MemberExportData[],
  accessToken: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  // 1. Create a new Google Spreadsheet
  const formattedDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `NateePlus - รายชื่อสมาชิก (${formattedDate})`,
      },
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`สร้าง Google Sheet ไม่สำเร็จ: ${errText}`);
  }

  const spreadsheet = await createResponse.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl;
  const firstSheetTitle = spreadsheet.sheets?.[0]?.properties?.title || 'Sheet1';

  // 2. Format the members data into rows
  const headers = [
    'วันที่สมัคร',
    'รหัสสมาชิก (userId)',
    'Username',
    'ชื่อ - นามสกุล',
    'เบอร์โทรศัพท์',
    'อีเมล',
    'ตำแหน่งธุรกิจ (Rank)',
    'บทบาทสิทธิ์ (Role)',
    'ยอดเงิน M-Cash คงเหลือ (฿)',
    'คูปอง M-Coupon คงเหลือ (฿)',
    'รายได้สะสม M-Cash (฿)',
    'คูปองสะสม M-Coupon (฿)',
    'รหัสผู้แนะนำ (SponsorId)'
  ];

  const rows = members.map(m => {
    let dateStr = '-';
    if (m.createdAt) {
      try {
        dateStr = new Date(m.createdAt).toLocaleString('th-TH');
      } catch {
        dateStr = m.createdAt;
      }
    }

    return [
      dateStr,
      m.userId || '',
      m.username || '',
      `${m.name || ''} ${m.surname || ''}`.trim(),
      m.phone || '',
      m.email || '',
      m.rank || 'S',
      m.role || 'Member',
      m.balanceMCash || 0,
      m.balanceMCoupon || 0,
      m.totalEarnings || 0,
      m.totalCouponsEarned || 0,
      m.sponsorId || ''
    ];
  });

  // 3. Write data to the dynamic sheet title range
  const range = `${firstSheetTitle}!A1`;
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [headers, ...rows],
      }),
    }
  );

  if (!writeResponse.ok) {
    const errText = await writeResponse.text();
    throw new Error(`บันทึกข้อมูลสมาชิกลง Google Sheet ไม่สำเร็จ: ${errText}`);
  }

  return { spreadsheetId, spreadsheetUrl };
};
