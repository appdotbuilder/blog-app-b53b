import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { authorsTable } from '../db/schema';
import { type UpdateAuthorInput } from '../schema';
import { updateAuthor } from '../handlers/update_author';
import { eq } from 'drizzle-orm';

describe('updateAuthor', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an existing author', async () => {
    // Create an author first
    const createdAuthor = await db.insert(authorsTable)
      .values({ name: 'Original Author' })
      .returning()
      .execute();

    const testInput: UpdateAuthorInput = {
      id: createdAuthor[0].id,
      name: 'Updated Author'
    };

    const result = await updateAuthor(testInput);

    // Verify the update worked
    expect(result.id).toEqual(createdAuthor[0].id);
    expect(result.name).toEqual('Updated Author');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated author to database', async () => {
    // Create an author first
    const createdAuthor = await db.insert(authorsTable)
      .values({ name: 'Original Author' })
      .returning()
      .execute();

    const testInput: UpdateAuthorInput = {
      id: createdAuthor[0].id,
      name: 'Updated Author'
    };

    await updateAuthor(testInput);

    // Query the database to verify the update was persisted
    const authors = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, createdAuthor[0].id))
      .execute();

    expect(authors).toHaveLength(1);
    expect(authors[0].name).toEqual('Updated Author');
    expect(authors[0].id).toEqual(createdAuthor[0].id);
    expect(authors[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle partial updates', async () => {
    // Create an author first
    const createdAuthor = await db.insert(authorsTable)
      .values({ name: 'Original Author' })
      .returning()
      .execute();

    // Update with only ID (no name provided)
    const testInput: UpdateAuthorInput = {
      id: createdAuthor[0].id
      // name is optional and not provided
    };

    const result = await updateAuthor(testInput);

    // Should return existing author unchanged
    expect(result.id).toEqual(createdAuthor[0].id);
    expect(result.name).toEqual('Original Author'); // Name should remain unchanged
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when author does not exist', async () => {
    const testInput: UpdateAuthorInput = {
      id: 999, // Non-existent ID
      name: 'Updated Author'
    };

    await expect(updateAuthor(testInput)).rejects.toThrow(/Author with id 999 not found/i);
  });

  it('should preserve created_at timestamp during update', async () => {
    // Create an author first
    const createdAuthor = await db.insert(authorsTable)
      .values({ name: 'Original Author' })
      .returning()
      .execute();

    const originalCreatedAt = createdAuthor[0].created_at;

    // Wait a bit to ensure timestamps would be different if created_at was being updated
    await new Promise(resolve => setTimeout(resolve, 10));

    const testInput: UpdateAuthorInput = {
      id: createdAuthor[0].id,
      name: 'Updated Author'
    };

    const result = await updateAuthor(testInput);

    // created_at should remain the same
    expect(result.created_at).toEqual(originalCreatedAt);
  });

  it('should update only the specified author', async () => {
    // Create multiple authors
    const author1 = await db.insert(authorsTable)
      .values({ name: 'Author One' })
      .returning()
      .execute();

    const author2 = await db.insert(authorsTable)
      .values({ name: 'Author Two' })
      .returning()
      .execute();

    // Update only the first author
    const testInput: UpdateAuthorInput = {
      id: author1[0].id,
      name: 'Updated Author One'
    };

    await updateAuthor(testInput);

    // Verify first author was updated
    const updatedAuthor1 = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, author1[0].id))
      .execute();

    expect(updatedAuthor1[0].name).toEqual('Updated Author One');

    // Verify second author was NOT updated
    const unchangedAuthor2 = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, author2[0].id))
      .execute();

    expect(unchangedAuthor2[0].name).toEqual('Author Two');
  });
});