'use server';

import { revalidatePath } from 'next/navigation';
import { db } from './db/db';
import { buyers, buyerHistory } from './db/schema';
import { buyerFormSchema } from './validations';
import { requireAuth } from './auth';

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