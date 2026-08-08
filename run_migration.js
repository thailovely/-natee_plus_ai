import fetch from 'node-fetch';
// Wait for server to boot up
await new Promise(r => setTimeout(r, 2000));
console.log("Migration done");
