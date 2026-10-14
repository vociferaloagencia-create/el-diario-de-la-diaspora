'use server';
import { revalidatePath } from 'next/cache';

export async function revalidateHomepage() {
  revalidatePath('/');
  revalidatePath('/comunidad');
}
