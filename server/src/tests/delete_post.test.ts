import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { postsTable, authorsTable } from '../db/schema';
import { type DeletePostInput } from '../schema';
import { deletePost } from '../handlers/delete_post';
import { eq } from 'drizzle-orm';

describe('deletePost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing post', async () => {
    // Create test author first (required for foreign key)
    const authorResult = await db.insert(authorsTable)
      .values({
        name: 'Test Author'
      })
      .returning()
      .execute();

    const author = authorResult[0];

    // Create test post
    const postResult = await db.insert(postsTable)
      .values({
        title: 'Test Post',
        content: 'Test content for deletion',
        author_id: author.id
      })
      .returning()
      .execute();

    const post = postResult[0];

    const input: DeletePostInput = {
      id: post.id
    };

    // Delete the post
    const result = await deletePost(input);

    expect(result.success).toBe(true);

    // Verify post is deleted from database
    const deletedPosts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, post.id))
      .execute();

    expect(deletedPosts).toHaveLength(0);
  });

  it('should throw error when post does not exist', async () => {
    const input: DeletePostInput = {
      id: 99999 // Non-existent ID
    };

    await expect(deletePost(input)).rejects.toThrow(/Post with id 99999 not found/i);
  });

  it('should not affect other posts when deleting one post', async () => {
    // Create test author
    const authorResult = await db.insert(authorsTable)
      .values({
        name: 'Test Author'
      })
      .returning()
      .execute();

    const author = authorResult[0];

    // Create multiple test posts
    const post1Result = await db.insert(postsTable)
      .values({
        title: 'Post 1',
        content: 'Content for post 1',
        author_id: author.id
      })
      .returning()
      .execute();

    const post2Result = await db.insert(postsTable)
      .values({
        title: 'Post 2',
        content: 'Content for post 2',
        author_id: author.id
      })
      .returning()
      .execute();

    const post1 = post1Result[0];
    const post2 = post2Result[0];

    const input: DeletePostInput = {
      id: post1.id
    };

    // Delete first post
    const result = await deletePost(input);

    expect(result.success).toBe(true);

    // Verify first post is deleted
    const deletedPosts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, post1.id))
      .execute();

    expect(deletedPosts).toHaveLength(0);

    // Verify second post still exists
    const remainingPosts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, post2.id))
      .execute();

    expect(remainingPosts).toHaveLength(1);
    expect(remainingPosts[0].title).toEqual('Post 2');
  });

  it('should handle deletion of posts with different authors', async () => {
    // Create multiple authors
    const author1Result = await db.insert(authorsTable)
      .values({
        name: 'Author 1'
      })
      .returning()
      .execute();

    const author2Result = await db.insert(authorsTable)
      .values({
        name: 'Author 2'
      })
      .returning()
      .execute();

    const author1 = author1Result[0];
    const author2 = author2Result[0];

    // Create posts for different authors
    const post1Result = await db.insert(postsTable)
      .values({
        title: 'Post by Author 1',
        content: 'Content by author 1',
        author_id: author1.id
      })
      .returning()
      .execute();

    const post2Result = await db.insert(postsTable)
      .values({
        title: 'Post by Author 2',
        content: 'Content by author 2',
        author_id: author2.id
      })
      .returning()
      .execute();

    const post1 = post1Result[0];
    const post2 = post2Result[0];

    // Delete post from author 1
    const input: DeletePostInput = {
      id: post1.id
    };

    const result = await deletePost(input);

    expect(result.success).toBe(true);

    // Verify correct post was deleted
    const deletedPosts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, post1.id))
      .execute();

    expect(deletedPosts).toHaveLength(0);

    // Verify other post still exists
    const remainingPosts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, post2.id))
      .execute();

    expect(remainingPosts).toHaveLength(1);
    expect(remainingPosts[0].author_id).toEqual(author2.id);
  });
});