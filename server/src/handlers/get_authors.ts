import { db } from '../db';
import { authorsTable } from '../db/schema';
import { type Author } from '../schema';

export const getAuthors = async (): Promise<Author[]> => {
  try {
    const results = await db.select()
      .from(authorsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch authors:', error);
    throw error;
  }
};