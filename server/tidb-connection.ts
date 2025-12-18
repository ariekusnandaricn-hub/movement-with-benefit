import mysql from "mysql2/promise";
import { SslOptions } from "mysql2";

const tidbConfig: any = {
  host: "gateway02.us-east-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "2yPcPSHh6ofcfAh.root",
  password: "jv5b8KdHYu0n7Kz05iiX",
  database: "Ko8NLcnSXauBiwynympRDu",
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;

export async function getTidbPool() {
  if (!pool) {
    pool = mysql.createPool(tidbConfig);
  }
  return pool;
}

export async function getParticipantCountFromTidb() {
  try {
    const pool = await getTidbPool();
    const connection = await pool.getConnection();
    
    // Query to count registrations
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM registrations"
    );
    
    connection.release();
    
    const result = rows as any[];
    return result[0]?.count || 0;
  } catch (error) {
    console.error("Error fetching participant count from TiDB:", error);
    return 0;
  }
}

export async function closeTidbPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
