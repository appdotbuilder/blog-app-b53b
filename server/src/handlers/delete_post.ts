import { db } from '../db';
import { postsTable } from '../db/schema';
import { type DeletePostInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deletePost = async (input: DeletePostInput): Promise<{ success: boolean }> => {
  try {
    // First, check if the post exists
    const existingPost = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, input.id))
      .execute();

    if (existingPost.length === 0) {
      throw new Error(`Post with id ${input.id} not found`);
    }

    // Delete the post
    const result = await db.delete(postsTable)
      .where(eq(postsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Failed to delete post with id ${input.id}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Post deletion failed:', error);
    throw error;
  }
};