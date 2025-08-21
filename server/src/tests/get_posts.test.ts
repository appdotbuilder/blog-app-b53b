import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { postsTable, authorsTable } from '../db/schema';
import { getPosts } from '../handlers/get_posts';

describe('getPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no posts exist', async () => {
    const result = await getPosts();
    
    expect(result).toEqual([]);
  });

  it('should return posts with author information', async () => {
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

    // Get posts with authors
    const result = await getPosts();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: post.id,
      title: 'Test Post',
      content: 'This is test content',
      author_id: author.id,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      author: {
        id: author.id,
        name: 'Test Author',
        created_at: expect.any(Date)
      }
    });
  });

  it('should return multiple posts with their respective authors', async () => {
    // Create first author and post
    const author1Result = await db.insert(authorsTable)
      .values({
        name: 'First Author'
      })
      .returning()
      .execute();
    
    const author1 = author1Result[0];

    await db.insert(postsTable)
      .values({
        title: 'First Post',
        content: 'First post content',
        author_id: author1.id
      })
      .execute();

    // Create second author and post
    const author2Result = await db.insert(authorsTable)
      .values({
        name: 'Second Author'
      })
      .returning()
      .execute();
    
    const author2 = author2Result[0];

    await db.insert(postsTable)
      .values({
        title: 'Second Post',
        content: 'Second post content',
        author_id: author2.id
      })
      .execute();

    // Get all posts
    const result = await getPosts();

    expect(result).toHaveLength(2);
    
    // Check that both posts are returned with correct author information
    const firstPost = result.find(p => p.title === 'First Post');
    const secondPost = result.find(p => p.title === 'Second Post');

    expect(firstPost).toBeDefined();
    expect(firstPost?.author.name).toEqual('First Author');
    expect(firstPost?.author_id).toEqual(author1.id);
    
    expect(secondPost).toBeDefined();
    expect(secondPost?.author.name).toEqual('Second Author');
    expect(secondPost?.author_id).toEqual(author2.id);
  });

  it('should handle posts with same author correctly', async () => {
    // Create one author
    const authorResult = await db.insert(authorsTable)
      .values({
        name: 'Single Author'
      })
      .returning()
      .execute();
    
    const author = authorResult[0];

    // Create two posts by same author
    await db.insert(postsTable)
      .values({
        title: 'First Post by Author',
        content: 'First content',
        author_id: author.id
      })
      .execute();

    await db.insert(postsTable)
      .values({
        title: 'Second Post by Author',
        content: 'Second content',
        author_id: author.id
      })
      .execute();

    // Get all posts
    const result = await getPosts();

    expect(result).toHaveLength(2);
    
    // Both posts should have the same author information
    result.forEach(post => {
      expect(post.author.id).toEqual(author.id);
      expect(post.author.name).toEqual('Single Author');
      expect(post.author_id).toEqual(author.id);
    });
  });

  it('should verify posts are saved in database correctly', async () => {
    // Create author and post through handler flow
    const authorResult = await db.insert(authorsTable)
      .values({
        name: 'Database Test Author'
      })
      .returning()
      .execute();

    const author = authorResult[0];

    await db.insert(postsTable)
      .values({
        title: 'Database Test Post',
        content: 'Testing database persistence',
        author_id: author.id
      })
      .execute();

    // Verify data exists in database directly
    const postsFromDB = await db.select()
      .from(postsTable)
      .execute();

    expect(postsFromDB).toHaveLength(1);
    expect(postsFromDB[0].title).toEqual('Database Test Post');

    // Verify handler returns the same data
    const handlerResult = await getPosts();

    expect(handlerResult).toHaveLength(1);
    expect(handlerResult[0].title).toEqual('Database Test Post');
    expect(handlerResult[0].author.name).toEqual('Database Test Author');
  });
});