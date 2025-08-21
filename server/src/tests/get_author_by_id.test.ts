import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { authorsTable } from '../db/schema';
import { type GetAuthorByIdInput } from '../schema';
import { getAuthorById } from '../handlers/get_author_by_id';

describe('getAuthorById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return an author when found', async () => {
    // Create a test author
    const insertResult = await db.insert(authorsTable)
      .values({ name: 'Test Author' })
      .returning()
      .execute();

    const testAuthor = insertResult[0];
    
    const input: GetAuthorByIdInput = {
      id: testAuthor.id
    };

    const result = await getAuthorById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testAuthor.id);
    expect(result!.name).toEqual('Test Author');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when author not found', async () => {
    const input: GetAuthorByIdInput = {
      id: 99999 // Non-existent ID
    };

    const result = await getAuthorById(input);

    expect(result).toBeNull();
  });

  it('should return the correct author when multiple authors exist', async () => {
    // Create multiple authors
    const author1Result = await db.insert(authorsTable)
      .values({ name: 'First Author' })
      .returning()
      .execute();

    const author2Result = await db.insert(authorsTable)
      .values({ name: 'Second Author' })
      .returning()
      .execute();

    const author3Result = await db.insert(authorsTable)
      .values({ name: 'Third Author' })
      .returning()
      .execute();

    // Query for the second author
    const input: GetAuthorByIdInput = {
      id: author2Result[0].id
    };

    const result = await getAuthorById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(author2Result[0].id);
    expect(result!.name).toEqual('Second Author');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should handle negative ID gracefully', async () => {
    const input: GetAuthorByIdInput = {
      id: -1
    };

    const result = await getAuthorById(input);

    expect(result).toBeNull();
  });

  it('should handle zero ID gracefully', async () => {
    const input: GetAuthorByIdInput = {
      id: 0
    };

    const result = await getAuthorById(input);

    expect(result).toBeNull();
  });
});