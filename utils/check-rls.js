import { Client } from 'pg';
import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  await client.connect();
  const res = await client.query("SELECT relname, relrowsecurity, relreplident FROM pg_class WHERE relname = 'notifications';");
  console.log(res.rows);

  await client.end();
}
main();
