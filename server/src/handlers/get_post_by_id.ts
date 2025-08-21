import { db } from '../db';
import { postsTable, authorsTable } from '../db/schema';
import { type GetPostByIdInput, type PostWithAuthor } from '../schema';
import { eq } from 'drizzle-orm';

export async function getPostById(input: GetPostByIdInput): Promise<PostWithAuthor | null> {
  try {
    // Query post with author data using join
    const results = await db.select()
      .from(postsTable)
      .innerJoin(authorsTable, eq(postsTable.author_id, authorsTable.id))
      .where(eq(postsTable.id, input.id))
      .execute();

    // Return null if no post found
    if (results.length === 0) {
      return null;
    }

    // Extract data from joined result structure
    const result = results[0];
    return {
      id: result.posts.id,
      title: result.posts.title,
      content: result.posts.content,
      author_id: result.posts.author_id,
      created_at: result.posts.created_at,
      updated_at: result.posts.updated_at,
      author: {
        id: result.authors.id,
        name: result.authors.name,
        created_at: result.authors.created_at
      }
    };
  } catch (error) {
    console.error('Failed to get post by ID:', error);
    throw error;
  }
}