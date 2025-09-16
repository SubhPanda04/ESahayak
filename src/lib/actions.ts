'use server';

import { revalidatePath, redirect } from 'next/navigation';
import { db } from './db/db';
import { buyers, buyerHistory } from './db/schema';
import { buyerFormSchema } from './validations';
import { requireAuth } from './auth';
import { and, eq, sql } from 'drizzle-orm';

export async function createBuyer(formData: FormData) {
  const userId = await requireAuth();

  const data = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string || undefined,
    phone: formData.get('phone') as string,
    city: formData.get('city') as string,
    propertyType: formData.get('propertyType') as string,
    bhk: formData.get('bhk') as string || undefined,
    purpose: formData.get('purpose') as string,
    budgetMin: formData.get('budgetMin') ? parseInt(formData.get('budgetMin') as string) : undefined,
    budgetMax: formData.get('budgetMax') ? parseInt(formData.get('budgetMax') as string) : undefined,
    timeline: formData.get('timeline') as string,
    source: formData.get('source') as string,
    notes: formData.get('notes') as string || undefined,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
  };

  const result = buyerFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.format() };
  }

  try {
    const newBuyer = await db.insert(buyers).values({
      ...result.data,
      email: result.data.email || undefined,
      bhk: result.data.bhk || undefined,
      budgetMin: result.data.budgetMin || undefined,
      budgetMax: result.data.budgetMax || undefined,
      notes: result.data.notes || undefined,
      tags: result.data.tags || undefined,
      ownerId: userId,
    }).returning();

    // Create history entry
    await db.insert(buyerHistory).values({
      buyerId: newBuyer[0].id,
      changedBy: userId,
      diff: { action: 'created', data: result.data },
    });

    revalidatePath('/buyers');
    redirect('/buyers');
  } catch (error) {
    console.error('Error creating buyer:', error);
    return { success: false, errors: { general: 'Failed to create buyer' } };
  }
}

export async function updateBuyer(buyerId: string, formData: FormData) {
  const userId = await requireAuth();

  const data = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string || undefined,
    phone: formData.get('phone') as string,
    city: formData.get('city') as string,
    propertyType: formData.get('propertyType') as string,
    bhk: formData.get('bhk') as string || undefined,
    purpose: formData.get('purpose') as string,
    budgetMin: formData.get('budgetMin') ? parseInt(formData.get('budgetMin') as string) : undefined,
    budgetMax: formData.get('budgetMax') ? parseInt(formData.get('budgetMax') as string) : undefined,
    timeline: formData.get('timeline') as string,
    source: formData.get('source') as string,
    notes: formData.get('notes') as string || undefined,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
    updatedAt: parseInt(formData.get('updatedAt') as string),
  };

  const result = buyerFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.format() };
  }

  try {
    // Check concurrency
    const existing = await db
      .select()
      .from(buyers)
      .where(and(eq(buyers.id, buyerId), eq(buyers.ownerId, userId)))
      .limit(1);

    if (!existing.length) {
      return { success: false, errors: { general: 'Buyer not found' } };
    }

    if (existing[0].updatedAt !== result.data.updatedAt) {
      return { success: false, errors: { general: 'Record changed, please refresh and try again' } };
    }

    const oldData = existing[0];

    await db
      .update(buyers)
      .set({
        ...result.data,
        email: result.data.email || undefined,
        bhk: result.data.bhk || undefined,
        budgetMin: result.data.budgetMin || undefined,
        budgetMax: result.data.budgetMax || undefined,
        notes: result.data.notes || undefined,
        tags: result.data.tags || undefined,
        updatedAt: sql`(unixepoch())`,
      })
      .where(and(eq(buyers.id, buyerId), eq(buyers.ownerId, userId)));

    // Create history entry
    const changes: Record<string, { old: any; new: any }> = {};
    Object.keys(result.data).forEach(key => {
      if (key !== 'updatedAt' && (oldData as any)[key] !== (result.data as any)[key]) {
        changes[key] = { old: (oldData as any)[key], new: (result.data as any)[key] };
      }
    });

    if (Object.keys(changes).length > 0) {
      await db.insert(buyerHistory).values({
        buyerId,
        changedBy: userId,
        diff: changes,
      });
    }

    revalidatePath('/buyers');
    revalidatePath(`/buyers/${buyerId}`);
    redirect(`/buyers/${buyerId}`);
  } catch (error) {
    console.error('Error updating buyer:', error);
    return { success: false, errors: { general: 'Failed to update buyer' } };
  }
}