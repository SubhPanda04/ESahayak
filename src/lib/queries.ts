import { db } from './db/db';
import { buyers } from './db/schema';
import { sql, and, or, ilike, eq, desc, asc } from 'drizzle-orm';

export interface BuyersFilters {
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  search?: string;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getBuyers(filters: BuyersFilters = {}, userId: string) {
  const {
    city,
    propertyType,
    status,
    timeline,
    search,
    page = 1,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
  } = filters;

  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const whereConditions = [eq(buyers.ownerId, userId)];

  if (city) {
    whereConditions.push(eq(buyers.city, city));
  }
  if (propertyType) {
    whereConditions.push(eq(buyers.propertyType, propertyType));
  }
  if (status) {
    whereConditions.push(eq(buyers.status, status));
  }
  if (timeline) {
    whereConditions.push(eq(buyers.timeline, timeline));
  }
  if (search) {
    whereConditions.push(
      or(
        ilike(buyers.fullName, `%${search}%`),
        ilike(buyers.phone, `%${search}%`),
        ilike(buyers.email, `%${search}%`)
      )
    );
  }

  const orderBy = sortOrder === 'asc' ? asc(buyers[sortBy as keyof typeof buyers]) : desc(buyers[sortBy as keyof typeof buyers]);

  const buyersList = await db
    .select()
    .from(buyers)
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(buyers)
    .where(and(...whereConditions));

  return {
    buyers: buyersList,
    totalCount: totalCount[0].count,
    totalPages: Math.ceil(totalCount[0].count / pageSize),
    currentPage: page,
  };
}