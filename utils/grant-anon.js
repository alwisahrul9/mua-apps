import { Client } from 'pg';
import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await client.connect();
    await client.query("GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;");
    console.log("Granted SELECT to anon, authenticated, service_role on all public tables.");
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}
main();
