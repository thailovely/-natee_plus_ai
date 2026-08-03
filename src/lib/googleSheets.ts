import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, type User, type Auth } from 'firebase/auth';

let _auth: Auth | null = null;

const getFirebaseAuth = async (): Promise<Auth> => {
  if (_auth) return _auth;
  try {
    const res = await fetch('/api/firebase-config');
    const data = await res.json();
    if (data.success && data.config) {
      const app = getApps().length > 0 ? getApp() : initializeApp(data.config);
      _auth = getAuth(app);
      return _auth;
    }
    throw new Error("Unable to retrieve firebase-config");
  } catch (err) {
    console.error("Failed to dynamically fetch Firebase config for auth:", err);
    throw err;
  }
};

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
  let unsubscribe: (() => void) | null = null;
  
  getFirebaseAuth().then((auth) => {
    unsubscribe = onAuthStateChanged(auth, async (user) => {
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
  }).catch((err) => {
    console.error("Failed to init auth listener:", err);
    if (onAuthFailure) onAuthFailure();
  });

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
};

export const signInWithGoogleSheets = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const auth = await getFirebaseAuth();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('ไม่ได้รับ Access Token จากการเข้าสู่ระบบ Google');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sheets Sign In Error:', error);
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('เบราว์เซอร์บล็อกป๊อปอัพเข้าสู่ระบบ Google (กรุณากดอนุญาต Pop-up บนแถบ URL แล้วลองอีกครั้ง)');
    } else if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('หน้าต่างเข้าสู่ระบบ Google ถูกปิดก่อนดำเนินการสำเร็จ');
    } else if (error?.code === 'auth/unauthorized-domain') {
      throw new Error('โดเมนเว็บไซต์ยังไม่ได้เพิ่มใน Google Auth Authorized Domains (สามารถกดดาวน์โหลด CSV/Excel ด้านข้างแทนได้ทันที)');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogleSheets = async () => {
  try {
    const auth = await getFirebaseAuth();
    await auth.signOut();
  } catch (err) {
    console.error("Error signing out:", err);
  }
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
  balanceECash: number;
  balanceECoupon: number;
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
    'ยอดเงิน E-Cash คงเหลือ (฿)',
    'คูปอง E-Coupon คงเหลือ (฿)',
    'รายได้สะสม E-Cash (฿)',
    'คูปองสะสม E-Coupon (฿)',
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
      m.balanceECash || 0,
      m.balanceECoupon || 0,
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

export const downloadMembersCsv = (members: MemberExportData[]) => {
  const headers = [
    'วันที่สมัคร',
    'รหัสสมาชิก (userId)',
    'Username',
    'ชื่อ-นามสกุล',
    'เบอร์โทรศัพท์',
    'อีเมล',
    'ตำแหน่งธุรกิจ (Rank)',
    'บทบาทสิทธิ์ (Role)',
    'ยอดเงิน E-Cash คงเหลือ (฿)',
    'คูปอง E-Coupon คงเหลือ (฿)',
    'รายได้สะสม E-Cash (฿)',
    'คูปองสะสม E-Coupon (฿)',
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

    const cleanField = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;

    return [
      cleanField(dateStr),
      cleanField(m.userId),
      cleanField(m.username),
      cleanField(`${m.name || ''} ${m.surname || ''}`.trim()),
      cleanField(m.phone),
      cleanField(m.email),
      cleanField(m.rank),
      cleanField(m.role),
      m.balanceECash || 0,
      m.balanceECoupon || 0,
      m.totalEarnings || 0,
      m.totalCouponsEarned || 0,
      cleanField(m.sponsorId)
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NateePlus_Members_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
