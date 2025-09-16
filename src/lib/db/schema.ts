import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Enums
export const cityEnum = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'] as const;
export const propertyTypeEnum = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'] as const;
export const bhkEnum = ['1', '2', '3', '4', 'Studio'] as const;
export const purposeEnum = ['Buy', 'Rent'] as const;
export const timelineEnum = ['0-3m', '3-6m', '>6m', 'Exploring'] as const;
export const sourceEnum = ['Website', 'Referral', 'Walk-in', 'Call', 'Other'] as const;
export const statusEnum = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'] as const;

// Buyers table
export const buyers = sqliteTable('buyers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  city: text('city', { enum: cityEnum }).notNull(),
  propertyType: text('property_type', { enum: propertyTypeEnum }).notNull(),
  bhk: text('bhk', { enum: bhkEnum }),
  purpose: text('purpose', { enum: purposeEnum }).notNull(),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  timeline: text('timeline', { enum: timelineEnum }).notNull(),
  source: text('source', { enum: sourceEnum }).notNull(),
  status: text('status', { enum: statusEnum }).notNull().default('New'),
  notes: text('notes'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  ownerId: text('owner_id').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Buyer history table
export const buyerHistory = sqliteTable('buyer_history', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  buyerId: text('buyer_id').references(() => buyers.id).notNull(),
  changedBy: text('changed_by').notNull(),
  changedAt: integer('changed_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  diff: text('diff', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
});