import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { authorsTable, postsTable } from '../db/schema';
import { type DeleteAuthorInput } from '../schema';
import { deleteAuthor } from '../handlers/delete_author';
import { eq } from 'drizzle-orm';

describe('deleteAuthor', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an author successfully', async () => {
    // Create a test author
    const authorResult = await db.insert(authorsTable)
      .values({
        name: 'Test Author'
      })
      .returning()
      .execute();

    const testInput: DeleteAuthorInput = {
      id: authorResult[0].id
    };

    const result = await deleteAuthor(testInput);

    expect(result.success).toBe(true);

    // Verify author was deleted
    const authors = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, testInput.id))
      .execute();

    expect(authors).toHaveLength(0);
  });

  it('should cascade delete author posts', async () => {
    // Create a test author
    const authorResult = await db.insert(authorsTable)
      .values({
        name: 'Test Author with Posts'
      })
      .returning()
      .execute();

    const authorId = authorResult[0].id;

    // Create posts for the author
    await db.insert(postsTable)
      .values([
        {
          title: 'First Post',
          content: 'Content of first post',
          author_id: authorId
        },
        {
          title: 'Second Post',
          content: 'Content of second post',
          author_id: authorId
        }
      ])
      .execute();

    // Verify posts exist before deletion
    const postsBefore = await db.select()
      .from(postsTable)
      .where(eq(postsTable.author_id, authorId))
      .execute();

    expect(postsBefore).toHaveLength(2);

    const testInput: DeleteAuthorInput = {
      id: authorId
    };

    const result = await deleteAuthor(testInput);

    expect(result.success).toBe(true);

    // Verify author was deleted
    const authors = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, authorId))
      .execute();

    expect(authors).toHaveLength(0);

    // Verify posts were cascade deleted
    const postsAfter = await db.select()
      .from(postsTable)
      .where(eq(postsTable.author_id, authorId))
      .execute();

    expect(postsAfter).toHaveLength(0);
  });

  it('should throw error when author does not exist', async () => {
    const testInput: DeleteAuthorInput = {
      id: 999 // Non-existent author ID
    };

    await expect(deleteAuthor(testInput)).rejects.toThrow(/Author with id 999 not found/i);
  });

  it('should not affect other authors and their posts', async () => {
    // Create two test authors
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

    const author1Id = author1Result[0].id;
    const author2Id = author2Result[0].id;

    // Create posts for both authors
    await db.insert(postsTable)
      .values([
        {
          title: 'Author 1 Post',
          content: 'Content by author 1',
          author_id: author1Id
        },
        {
          title: 'Author 2 Post',
          content: 'Content by author 2',
          author_id: author2Id
        }
      ])
      .execute();

    const testInput: DeleteAuthorInput = {
      id: author1Id
    };

    const result = await deleteAuthor(testInput);

    expect(result.success).toBe(true);

    // Verify author 1 was deleted
    const author1Check = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, author1Id))
      .execute();

    expect(author1Check).toHaveLength(0);

    // Verify author 2 still exists
    const author2Check = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, author2Id))
      .execute();

    expect(author2Check).toHaveLength(1);
    expect(author2Check[0].name).toBe('Author Two');

    // Verify author 1's posts were deleted
    const author1Posts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.author_id, author1Id))
      .execute();

    expect(author1Posts).toHaveLength(0);

    // Verify author 2's posts still exist
    const author2Posts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.author_id, author2Id))
      .execute();

    expect(author2Posts).toHaveLength(1);
    expect(author2Posts[0].title).toBe('Author 2 Post');
  });
});