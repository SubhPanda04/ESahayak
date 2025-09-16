import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value || null;
}

export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect('/login');
  }
  return userId;
}