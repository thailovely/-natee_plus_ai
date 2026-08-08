import fetch from 'node-fetch';

async function run() {
  try {
    console.log("Fetching current DB state...");
    const stateRes = await fetch('http://localhost:3000/api/sync-state');
    const state = await stateRes.json();
    
    if (!state.success) {
      console.error("Failed to fetch state:", state);
      return;
    }
    
    let dbString = JSON.stringify(state.data);
    
    console.log(`Found ${dbString.split('A260700006').length - 1} occurrences of A260700006`);
    
    // Replace all occurrences
    dbString = dbString.replace(/A260700006/g, 'A260700001');
    
    const newDbData = JSON.parse(dbString);
    
    console.log("Sending updated DB to import-db...");
    const importRes = await fetch('http://localhost:3000/api/admin/import-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbData: newDbData })
    });
    
    const importResult = await importRes.json();
    console.log("Result:", importResult);
    
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
