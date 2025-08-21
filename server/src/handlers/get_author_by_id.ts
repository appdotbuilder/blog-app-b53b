import { db } from '../db';
import { authorsTable } from '../db/schema';
import { type GetAuthorByIdInput, type Author } from '../schema';
import { eq } from 'drizzle-orm';

export async function getAuthorById(input: GetAuthorByIdInput): Promise<Author | null> {
  try {
    const result = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, input.id))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Get author by ID failed:', error);
    throw error;
  }
}