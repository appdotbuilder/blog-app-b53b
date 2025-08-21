import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { postsTable, authorsTable } from '../db/schema';
import { type CreatePostInput } from '../schema';
import { createPost } from '../handlers/create_post';
import { eq } from 'drizzle-orm';

// Test inputs
const testAuthorInput = {
  name: 'Test Author'
};

const testPostInput: CreatePostInput = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content with meaningful text.',
  author_id: 1 // Will be set dynamically in tests
};

describe('createPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a post with valid author_id', async () => {
    // Create author first
    const authorResult = await db.insert(authorsTable)
      .values(testAuthorInput)
      .returning()
      .execute();
    
    const author = authorResult[0];
    const postInput = { ...testPostInput, author_id: author.id };

    const result = await createPost(postInput);

    // Basic field validation
    expect(result.title).toEqual('Test Blog Post');
    expect(result.content).toEqual(testPostInput.content);
    expect(result.author_id).toEqual(author.id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save post to database correctly', async () => {
    // Create author first
    const authorResult = await db.insert(authorsTable)
      .values(testAuthorInput)
      .returning()
      .execute();
    
    const author = authorResult[0];
    const postInput = { ...testPostInput, author_id: author.id };

    const result = await createPost(postInput);

    // Query database to verify post was saved
    const posts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, result.id))
      .execute();

    expect(posts).toHaveLength(1);
    expect(posts[0].title).toEqual('Test Blog Post');
    expect(posts[0].content).toEqual(testPostInput.content);
    expect(posts[0].author_id).toEqual(author.id);
    expect(posts[0].created_at).toBeInstanceOf(Date);
    expect(posts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when author_id does not exist', async () => {
    const invalidPostInput = { ...testPostInput, author_id: 999 };

    await expect(createPost(invalidPostInput)).rejects.toThrow(/Author with id 999 not found/i);
  });

  it('should create multiple posts for the same author', async () => {
    // Create author first
    const authorResult = await db.insert(authorsTable)
      .values(testAuthorInput)
      .returning()
      .execute();
    
    const author = authorResult[0];

    // Create first post
    const firstPostInput = { 
      title: 'First Post',
      content: 'Content of the first post',
      author_id: author.id 
    };
    const firstResult = await createPost(firstPostInput);

    // Create second post
    const secondPostInput = { 
      title: 'Second Post',
      content: 'Content of the second post',
      author_id: author.id 
    };
    const secondResult = await createPost(secondPostInput);

    // Verify both posts exist
    expect(firstResult.id).not.toEqual(secondResult.id);
    expect(firstResult.author_id).toEqual(author.id);
    expect(secondResult.author_id).toEqual(author.id);

    // Query database to verify both posts were saved
    const posts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.author_id, author.id))
      .execute();

    expect(posts).toHaveLength(2);
    expect(posts.map(p => p.title)).toContain('First Post');
    expect(posts.map(p => p.title)).toContain('Second Post');
  });

  it('should handle posts with long content', async () => {
    // Create author first
    const authorResult = await db.insert(authorsTable)
      .values(testAuthorInput)
      .returning()
      .execute();
    
    const author = authorResult[0];
    
    const longContent = 'A'.repeat(5000); // Very long content
    const longPostInput = {
      title: 'Post with Long Content',
      content: longContent,
      author_id: author.id
    };

    const result = await createPost(longPostInput);

    expect(result.content).toEqual(longContent);
    expect(result.content.length).toEqual(5000);

    // Verify in database
    const posts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, result.id))
      .execute();

    expect(posts[0].content.length).toEqual(5000);
  });
});