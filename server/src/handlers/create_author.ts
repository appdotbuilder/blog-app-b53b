import { db } from '../db';
import { authorsTable } from '../db/schema';
import { type CreateAuthorInput, type Author } from '../schema';

export const createAuthor = async (input: CreateAuthorInput): Promise<Author> => {
  try {
    // Insert author record
    const result = await db.insert(authorsTable)
      .values({
        name: input.name
      })
      .returning()
      .execute();

    // Return the created author
    const author = result[0];
    return author;
  } catch (error) {
    console.error('Author creation failed:', error);
    throw error;
  }
};