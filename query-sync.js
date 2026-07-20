import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc, memoryLocalCache } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
}, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    console.log("Checking app_sections/members...");
    const docRef = doc(db, 'app_sections', 'members');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const members = snap.data().data || [];
      console.log(`Found ${members.length} members in Firestore`);
      
      const foundS = members.filter(m => m.userId && (m.userId.includes("260700025") || m.userId.includes("26070025")));
      console.log("Search 260700025 or 26070025 in members:", JSON.stringify(foundS, null, 2));
      
      const sorted = [...members].sort((a,b) => (b.userId || '').localeCompare(a.userId || ''));
      console.log("Last 5 registered members:");
      console.log(JSON.stringify(sorted.slice(0, 5).map(m => ({ userId: m.userId, username: m.username, name: m.name, rank: m.rank, sponsorId: m.sponsorId })), null, 2));
    } else {
      console.log("app_sections/members does not exist in Firestore!");
    }

    console.log("Checking app_sections/transactions...");
    const txDocRef = doc(db, 'app_sections', 'transactions');
    const txSnap = await getDoc(txDocRef);
    if (txSnap.exists()) {
      const txs = txSnap.data().data || [];
      console.log(`Found ${txs.length} transactions in Firestore`);
      console.log("Last 10 transactions in Firestore:");
      txs.slice(-10).forEach(tx => {
        console.log(`ID: ${tx.id}, User: ${tx.userId}, Type: ${tx.type}, Amt: ${tx.amount || tx.transferAmount}, Status: ${tx.status}, Details: ${tx.details}`);
      });
    }

  } catch (e) {
    console.error("Error in script:", e);
  } finally {
    process.exit(0);
  }
}

run();
