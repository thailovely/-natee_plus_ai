import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  userId: text('user_id').unique(), // e.g. A260600001
  username: text('username'),
  name: text('name'),
  surname: text('surname'),
  phone: text('phone'),
  email: text('email'),
  role: text('role').default('Member'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  pv: integer('pv'),
  stock: integer('stock'),
  category: text('category'),
  qrCodeUrl: text('qr_code_url'),
  createdAt: timestamp('created_at').defaultNow(),
});
