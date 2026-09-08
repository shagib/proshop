import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

 
const sql = neon(process.env.DATABASE_URL);

async function createTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_handle TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_email TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title TEXT,
        body TEXT NOT NULL,
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('Reviews table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}
 
createTable();