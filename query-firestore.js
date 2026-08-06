import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc, setDoc, memoryLocalCache } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
}, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const txDocRef = doc(db, 'app_sections', 'transactions');
    const txSnap = await getDoc(txDocRef);
    if (txSnap.exists()) {
      const data = txSnap.data();
      const txs = data.data || [];
      
      const memberId = "A260700019";
      const beforeCount = txs.length;
      
      // Filter out transactions for memberId on 2026-07-16
      const filteredTxs = txs.filter(tx => 
        !(tx.userId === memberId && (tx.date || tx.createdAt || '').startsWith('2026-07-16'))
      );
      
      console.log(`Original count: ${beforeCount}, New count: ${filteredTxs.length}`);
      
      if (beforeCount !== filteredTxs.length) {
        await setDoc(txDocRef, { ...data, data: filteredTxs });
        console.log("Updated transactions in Firestore. Removed items from 2026-07-16 for " + memberId);
      } else {
        console.log("No transactions to remove for " + memberId + " on 2026-07-16.");
      }
    }

  } catch (e) {
    console.error("Error in script:", e);
  }
}

run();
