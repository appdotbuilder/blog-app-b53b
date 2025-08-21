import { db } from '../db';
import { authorsTable } from '../db/schema';
import { type UpdateAuthorInput, type Author } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAuthor = async (input: UpdateAuthorInput): Promise<Author> => {
  try {
    // Check if author exists
    const existingAuthor = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, input.id))
      .execute();

    if (existingAuthor.length === 0) {
      throw new Error(`Author with id ${input.id} not found`);
    }

    // Build update values - only include fields that are provided
    const updateValues: Record<string, any> = {};
    if (input.name !== undefined) {
      updateValues['name'] = input.name;
    }

    // If no fields to update, return the existing author
    if (Object.keys(updateValues).length === 0) {
      return existingAuthor[0];
    }

    // Update the author
    const result = await db.update(authorsTable)
      .set(updateValues)
      .where(eq(authorsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Author update failed:', error);
    throw error;
  }
};