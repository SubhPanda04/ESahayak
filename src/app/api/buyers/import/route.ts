import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { buyers, buyerHistory } from '@/lib/db/schema';
import { buyerFormSchema } from '@/lib/validations';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { buyers: buyersData } = await request.json();

    if (!Array.isArray(buyersData) || buyersData.length === 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Validate all buyers
    const validBuyers = [];
    for (const buyerData of buyersData) {
      const result = buyerFormSchema.safeParse(buyerData);
      if (result.success) {
        validBuyers.push(result.data);
      }
    }

    if (validBuyers.length === 0) {
      return NextResponse.json({ error: 'No valid buyers to import' }, { status: 400 });
    }

    // Insert in transaction
    await db.transaction(async (tx) => {
      for (const buyerData of validBuyers) {
        const newBuyer = await tx.insert(buyers).values({
          ...buyerData,
          email: buyerData.email || undefined,
          bhk: buyerData.bhk || undefined,
          budgetMin: buyerData.budgetMin || undefined,
          budgetMax: buyerData.budgetMax || undefined,
          notes: buyerData.notes || undefined,
          tags: buyerData.tags || undefined,
          ownerId: userId,
        }).returning();

        // Create history entry
        await tx.insert(buyerHistory).values({
          buyerId: newBuyer[0].id,
          changedBy: userId,
          diff: { action: 'imported', data: buyerData },
        });
      }
    });

    return NextResponse.json({ success: true, imported: validBuyers.length });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}