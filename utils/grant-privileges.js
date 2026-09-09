import { Client } from 'pg';
import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    // Grant permissions to supabase API roles
    await client.query("GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notifications TO anon, authenticated, service_role;");
    console.log("Granted privileges on notifications table to anon and authenticated roles.");
    
    // Also do it for bookings just in case
    await client.query("GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bookings TO anon, authenticated, service_role;");
    
  } catch (error) {
    console.error("Error setting up privileges:", error);
  } finally {
    await client.end();
  }
}

main();
