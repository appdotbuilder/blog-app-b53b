import { db } from '../db';
import { postsTable, authorsTable } from '../db/schema';
import { type CreatePostInput, type Post } from '../schema';
import { eq } from 'drizzle-orm';

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  try {
    // First, validate that the author exists
    const existingAuthor = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, input.author_id))
      .execute();

    if (existingAuthor.length === 0) {
      throw new Error(`Author with id ${input.author_id} not found`);
    }

    // Insert post record
    const result = await db.insert(postsTable)
      .values({
        title: input.title,
        content: input.content,
        author_id: input.author_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Post creation failed:', error);
    throw error;
  }
};