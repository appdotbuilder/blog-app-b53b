import { db } from '../db';
import { postsTable, authorsTable } from '../db/schema';
import { type PostWithAuthor } from '../schema';
import { eq } from 'drizzle-orm';

export const getPosts = async (): Promise<PostWithAuthor[]> => {
  try {
    // Join posts with authors to include author information
    const results = await db.select()
      .from(postsTable)
      .innerJoin(authorsTable, eq(postsTable.author_id, authorsTable.id))
      .execute();

    // Map the joined results to the expected PostWithAuthor format
    return results.map(result => ({
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
    }));
  } catch (error) {
    console.error('Getting posts failed:', error);
    throw error;
  }
};