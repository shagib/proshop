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
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_handle TEXT NOT NULL,
        product_title TEXT NOT NULL,
        product_image TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (session_id, product_id)
      );
    `;
    console.log('Reviews and wishlist tables are ready.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}
 
createTable();