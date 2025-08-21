import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { authorsTable } from '../db/schema';
import { type CreateAuthorInput } from '../schema';
import { createAuthor } from '../handlers/create_author';
import { eq } from 'drizzle-orm';

// Test input
const testInput: CreateAuthorInput = {
  name: 'Test Author'
};

describe('createAuthor', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an author', async () => {
    const result = await createAuthor(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Author');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save author to database', async () => {
    const result = await createAuthor(testInput);

    // Query using proper drizzle syntax
    const authors = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, result.id))
      .execute();

    expect(authors).toHaveLength(1);
    expect(authors[0].name).toEqual('Test Author');
    expect(authors[0].id).toEqual(result.id);
    expect(authors[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple authors with different names', async () => {
    const author1 = await createAuthor({ name: 'Author One' });
    const author2 = await createAuthor({ name: 'Author Two' });

    // Check different IDs
    expect(author1.id).not.toEqual(author2.id);
    expect(author1.name).toEqual('Author One');
    expect(author2.name).toEqual('Author Two');

    // Verify both exist in database
    const allAuthors = await db.select()
      .from(authorsTable)
      .execute();

    expect(allAuthors).toHaveLength(2);
    const names = allAuthors.map(a => a.name).sort();
    expect(names).toEqual(['Author One', 'Author Two']);
  });

  it('should handle author names with special characters', async () => {
    const specialInput: CreateAuthorInput = {
      name: "John O'Connor & Smith-Wilson"
    };

    const result = await createAuthor(specialInput);

    expect(result.name).toEqual("John O'Connor & Smith-Wilson");
    
    // Verify in database
    const authors = await db.select()
      .from(authorsTable)
      .where(eq(authorsTable.id, result.id))
      .execute();

    expect(authors[0].name).toEqual("John O'Connor & Smith-Wilson");
  });

  it('should create author with long name', async () => {
    const longName = 'A'.repeat(255); // Long but reasonable name
    const longInput: CreateAuthorInput = {
      name: longName
    };

    const result = await createAuthor(longInput);

    expect(result.name).toEqual(longName);
    expect(result.name).toHaveLength(255);
  });
});