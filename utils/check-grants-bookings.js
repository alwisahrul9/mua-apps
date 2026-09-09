import { Client } from 'pg';
import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  await client.connect();
  const res = await client.query("SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'bookings';");
  console.log(res.rows);

  await client.end();
}
main();
