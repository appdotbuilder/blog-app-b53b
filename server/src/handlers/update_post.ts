import { db } from '../db';
import { postsTable, authorsTable } from '../db/schema';
import { type UpdatePostInput, type Post } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePost = async (input: UpdatePostInput): Promise<Post> => {
  try {
    // First, check if the post exists
    const existingPost = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, input.id))
      .execute();

    if (existingPost.length === 0) {
      throw new Error(`Post with ID ${input.id} not found`);
    }

    // If author_id is being updated, validate that the new author exists
    if (input.author_id !== undefined) {
      const authorExists = await db.select()
        .from(authorsTable)
        .where(eq(authorsTable.id, input.author_id))
        .execute();

      if (authorExists.length === 0) {
        throw new Error(`Author with ID ${input.author_id} not found`);
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date(), // Always update the timestamp
    };

    if (input.title !== undefined) {
      updateData['title'] = input.title;
    }

    if (input.content !== undefined) {
      updateData['content'] = input.content;
    }

    if (input.author_id !== undefined) {
      updateData['author_id'] = input.author_id;
    }

    // Update the post
    const result = await db.update(postsTable)
      .set(updateData)
      .where(eq(postsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Post update failed:', error);
    throw error;
  }
};