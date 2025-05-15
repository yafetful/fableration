import db from './db.js';

async function main() {
  try {
    console.log('Querying events table...');
    const events = await db.all('SELECT * FROM events');
    console.log(JSON.stringify(events, null, 2));
    
    console.log('\nQuerying uploads in imageUrl...');
    const eventsWithUploads = await db.all("SELECT id, title, imageUrl FROM events WHERE imageUrl LIKE '%/uploads/%'");
    console.log(JSON.stringify(eventsWithUploads, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 