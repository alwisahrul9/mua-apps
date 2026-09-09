import { Client } from 'pg';
import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    // Alter publication for supabase_realtime
    await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE notifications;");
    console.log("Realtime enabled for table: notifications");
  } catch (error) {
    if (error.code === '42704') {
      console.log("Table 'notifications' does not exist yet. Please run this after database migration.");
    } else {
      console.error("Error setting up realtime:", error);
    }
  } finally {
    await client.end();
  }
}

main();
