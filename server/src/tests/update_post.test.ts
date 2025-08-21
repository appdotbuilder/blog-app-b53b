import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { postsTable, authorsTable } from '../db/schema';
import { type UpdatePostInput, type CreateAuthorInput } from '../schema';
import { updatePost } from '../handlers/update_post';
import { eq } from 'drizzle-orm';

describe('updatePost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create test author
  const createTestAuthor = async (name: string = 'Test Author') => {
    const result = await db.insert(authorsTable)
      .values({ name })
      .returning()
      .execute();
    return result[0];
  };

  // Helper function to create test post
  const createTestPost = async (authorId: number, title: string = 'Test Post', content: string = 'Test content') => {
    const result = await db.insert(postsTable)
      .values({
        title,
        content,
        author_id: authorId,
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should update post title', async () => {
    const author = await createTestAuthor();
    const post = await createTestPost(author.id);

    const updateInput: UpdatePostInput = {
      id: post.id,
      title: 'Updated Title'
    };

    const result = await updatePost(updateInput);

    expect(result.id).toEqual(post.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.content).toEqual(post.content); // Should remain unchanged
    expect(result.author_id).toEqual(post.author_id); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > post.updated_at).toBe(true);
  });

  it('should update post content', async () => {
    const author = await createTestAuthor();
    const post = await createTestPost(author.id);

    const updateInput: UpdatePostInput = {
      id: post.id,
      content: 'Updated content with more details'
    };

    const result = await updatePost(updateInput);

    expect(result.id).toEqual(post.id);
    expect(result.title).toEqual(post.title); // Should remain unchanged
    expect(result.content).toEqual('Updated content with more details');
    expect(result.author_id).toEqual(post.author_id); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > post.updated_at).toBe(true);
  });

  it('should update post author', async () => {
    const originalAuthor = await createTestAuthor('Original Author');
    const newAuthor = await createTestAuthor('New Author');
    const post = await createTestPost(originalAuthor.id);

    const updateInput: UpdatePostInput = {
      id: post.id,
      author_id: newAuthor.id
    };

    const result = await updatePost(updateInput);

    expect(result.id).toEqual(post.id);
    expect(result.title).toEqual(post.title); // Should remain unchanged
    expect(result.content).toEqual(post.content); // Should remain unchanged
    expect(result.author_id).toEqual(newAuthor.id);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > post.updated_at).toBe(true);
  });

  it('should update multiple fields at once', async () => {
    const originalAuthor = await createTestAuthor('Original Author');
    const newAuthor = await createTestAuthor('New Author');
    const post = await createTestPost(originalAuthor.id);

    const updateInput: UpdatePostInput = {
      id: post.id,
      title: 'Completely New Title',
      content: 'Completely new content with different information',
      author_id: newAuthor.id
    };

    const result = await updatePost(updateInput);

    expect(result.id).toEqual(post.id);
    expect(result.title).toEqual('Completely New Title');
    expect(result.content).toEqual('Completely new content with different information');
    expect(result.author_id).toEqual(newAuthor.id);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > post.updated_at).toBe(true);
  });

  it('should save updated post to database', async () => {
    const author = await createTestAuthor();
    const post = await createTestPost(author.id);

    const updateInput: UpdatePostInput = {
      id: post.id,
      title: 'Database Test Title',
      content: 'Database test content'
    };

    await updatePost(updateInput);

    // Verify the changes were saved to the database
    const savedPosts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, post.id))
      .execute();

    expect(savedPosts).toHaveLength(1);
    const savedPost = savedPosts[0];
    expect(savedPost.title).toEqual('Database Test Title');
    expect(savedPost.content).toEqual('Database test content');
    expect(savedPost.updated_at).toBeInstanceOf(Date);
    expect(savedPost.updated_at > post.updated_at).toBe(true);
  });

  it('should throw error when post does not exist', async () => {
    const updateInput: UpdatePostInput = {
      id: 999999, // Non-existent ID
      title: 'This should fail'
    };

    await expect(updatePost(updateInput)).rejects.toThrow(/post with id 999999 not found/i);
  });

  it('should throw error when new author does not exist', async () => {
    const author = await createTestAuthor();
    const post = await createTestPost(author.id);

    const updateInput: UpdatePostInput = {
      id: post.id,
      author_id: 999999 // Non-existent author ID
    };

    await expect(updatePost(updateInput)).rejects.toThrow(/author with id 999999 not found/i);
  });

  it('should update only timestamp when no fields provided', async () => {
    const author = await createTestAuthor();
    const post = await createTestPost(author.id);
    const originalTimestamp = post.updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1));

    const updateInput: UpdatePostInput = {
      id: post.id
      // No other fields provided
    };

    const result = await updatePost(updateInput);

    expect(result.id).toEqual(post.id);
    expect(result.title).toEqual(post.title); // Should remain unchanged
    expect(result.content).toEqual(post.content); // Should remain unchanged
    expect(result.author_id).toEqual(post.author_id); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > originalTimestamp).toBe(true);
  });
});