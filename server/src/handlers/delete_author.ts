import { db } from '../db';
import { authorsTable, postsTable } from '../db/schema';
import { type DeleteAuthorInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteAuthor(input: DeleteAuthorInput): Promise<{ success: boolean }> {
  try {
    // Check if author exists
    const author = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, input.id))
      .execute();

    if (author.length === 0) {
      throw new Error(`Author with id ${input.id} not found`);
    }

    // Delete all posts by this author first (cascade deletion)
    await db.delete(postsTable)
      .where(eq(postsTable.author_id, input.id))
      .execute();

    // Delete the author
    await db.delete(authorsTable)
      .where(eq(authorsTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Author deletion failed:', error);
    throw error;
  }
}