const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.qpzhehhjzniegbcpzqqt:hsnXscjF8CKpkIT3@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'users';
  `);
  console.table(res.rows);
  await client.end();
}

checkSchema().catch(console.error);
