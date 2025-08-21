import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { authorsTable, postsTable } from '../db/schema';
import { type GetPostByIdInput } from '../schema';
import { getPostById } from '../handlers/get_post_by_id';

describe('getPostById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return post with author when post exists', async () => {
    // Create test author first
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
        content: 'This is test content',
        author_id: author.id
      })
      .returning()
      .execute();

    const post = postResult[0];

    // Test the handler
    const input: GetPostByIdInput = {
      id: post.id
    };

    const result = await getPostById(input);

    // Verify post data
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(post.id);
    expect(result!.title).toEqual('Test Post');
    expect(result!.content).toEqual('This is test content');
    expect(result!.author_id).toEqual(author.id);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);

    // Verify author data is included
    expect(result!.author).toBeDefined();
    expect(result!.author.id).toEqual(author.id);
    expect(result!.author.name).toEqual('Test Author');
    expect(result!.author.created_at).toBeInstanceOf(Date);
  });

  it('should return null when post does not exist', async () => {
    const input: GetPostByIdInput = {
      id: 999999 // Non-existent ID
    };

    const result = await getPostById(input);

    expect(result).toBeNull();
  });

  it('should handle posts with different authors correctly', async () => {
    // Create multiple authors
    const author1Result = await db.insert(authorsTable)
      .values({
        name: 'Author One'
      })
      .returning()
      .execute();

    const author2Result = await db.insert(authorsTable)
      .values({
        name: 'Author Two'
      })
      .returning()
      .execute();

    const author1 = author1Result[0];
    const author2 = author2Result[0];

    // Create posts for different authors
    const post1Result = await db.insert(postsTable)
      .values({
        title: 'Post by Author One',
        content: 'Content by first author',
        author_id: author1.id
      })
      .returning()
      .execute();

    const post2Result = await db.insert(postsTable)
      .values({
        title: 'Post by Author Two',
        content: 'Content by second author',
        author_id: author2.id
      })
      .returning()
      .execute();

    const post1 = post1Result[0];
    const post2 = post2Result[0];

    // Test first post
    const result1 = await getPostById({ id: post1.id });
    expect(result1).not.toBeNull();
    expect(result1!.title).toEqual('Post by Author One');
    expect(result1!.author.name).toEqual('Author One');
    expect(result1!.author.id).toEqual(author1.id);

    // Test second post
    const result2 = await getPostById({ id: post2.id });
    expect(result2).not.toBeNull();
    expect(result2!.title).toEqual('Post by Author Two');
    expect(result2!.author.name).toEqual('Author Two');
    expect(result2!.author.id).toEqual(author2.id);
  });

  it('should preserve all timestamp fields correctly', async () => {
    // Create author
    const authorResult = await db.insert(authorsTable)
      .values({
        name: 'Time Test Author'
      })
      .returning()
      .execute();

    const author = authorResult[0];

    // Create post
    const postResult = await db.insert(postsTable)
      .values({
        title: 'Time Test Post',
        content: 'Testing timestamp handling',
        author_id: author.id
      })
      .returning()
      .execute();

    const post = postResult[0];

    // Get post via handler
    const result = await getPostById({ id: post.id });

    expect(result).not.toBeNull();
    
    // Verify all timestamp fields are Date objects
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.author.created_at).toBeInstanceOf(Date);

    // Verify timestamps match what was created
    expect(result!.created_at.getTime()).toEqual(post.created_at.getTime());
    expect(result!.updated_at.getTime()).toEqual(post.updated_at.getTime());
    expect(result!.author.created_at.getTime()).toEqual(author.created_at.getTime());
  });
});