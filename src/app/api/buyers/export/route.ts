import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { buyers, cityEnum, propertyTypeEnum, statusEnum, timelineEnum } from '@/lib/db/schema';
import { and, eq, ilike, or } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') as typeof cityEnum[number] | undefined;
    const propertyType = searchParams.get('propertyType') as typeof propertyTypeEnum[number] | undefined;
    const status = searchParams.get('status') as typeof statusEnum[number] | undefined;
    const timeline = searchParams.get('timeline') as typeof timelineEnum[number] | undefined;
    const search = searchParams.get('search') || undefined;

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
          or(
            ilike(buyers.phone, `%${search}%`),
            ilike(buyers.email, `%${search}%`)
          )
        )
      );
    }

    const buyersData = await db
      .select({
        fullName: buyers.fullName,
        email: buyers.email,
        phone: buyers.phone,
        city: buyers.city,
        propertyType: buyers.propertyType,
        bhk: buyers.bhk,
        purpose: buyers.purpose,
        budgetMin: buyers.budgetMin,
        budgetMax: buyers.budgetMax,
        timeline: buyers.timeline,
        source: buyers.source,
        notes: buyers.notes,
        tags: buyers.tags,
        status: buyers.status,
      })
      .from(buyers)
      .where(and(...whereConditions));

    // Generate CSV
    const csvData = buyersData.map(buyer => ({
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || '',
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || '',
      budgetMax: buyer.budgetMax || '',
      timeline: buyer.timeline,
      source: buyer.source,
      notes: buyer.notes || '',
      tags: buyer.tags ? buyer.tags.join(',') : '',
      status: buyer.status,
    }));

    const csvHeaders = [
      'fullName',
      'email',
      'phone',
      'city',
      'propertyType',
      'bhk',
      'purpose',
      'budgetMin',
      'budgetMax',
      'timeline',
      'source',
      'notes',
      'tags',
      'status',
    ];

    const csvRows = csvData.map(row =>
      csvHeaders.map(header => `"${(row as Record<string, unknown>)[header]}"`).join(',')
    );

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="buyers_export.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}