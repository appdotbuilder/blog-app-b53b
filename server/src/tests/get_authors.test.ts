import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { authorsTable } from '../db/schema';
import { type CreateAuthorInput } from '../schema';
import { getAuthors } from '../handlers/get_authors';

describe('getAuthors', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no authors exist', async () => {
    const result = await getAuthors();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('should return single author', async () => {
    // Create test author directly in database
    await db.insert(authorsTable)
      .values({
        name: 'John Doe'
      })
      .execute();

    const result = await getAuthors();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('John Doe');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return multiple authors in creation order', async () => {
    // Create multiple test authors
    const authorsData = [
      { name: 'Alice Smith' },
      { name: 'Bob Johnson' },
      { name: 'Carol Williams' }
    ];

    for (const authorData of authorsData) {
      await db.insert(authorsTable)
        .values(authorData)
        .execute();
    }

    const result = await getAuthors();

    expect(result).toHaveLength(3);
    
    // Verify all authors are returned
    const authorNames = result.map(author => author.name);
    expect(authorNames).toContain('Alice Smith');
    expect(authorNames).toContain('Bob Johnson');
    expect(authorNames).toContain('Carol Williams');

    // Verify all required fields are present
    result.forEach(author => {
      expect(author.id).toBeDefined();
      expect(typeof author.id).toBe('number');
      expect(author.name).toBeDefined();
      expect(typeof author.name).toBe('string');
      expect(author.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return authors with unique IDs', async () => {
    // Create test authors
    await db.insert(authorsTable)
      .values([
        { name: 'Author One' },
        { name: 'Author Two' },
        { name: 'Author Three' }
      ])
      .execute();

    const result = await getAuthors();

    expect(result).toHaveLength(3);

    // Verify all IDs are unique
    const ids = result.map(author => author.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds).toHaveLength(3);

    // Verify IDs are sequential (starting from 1)
    ids.sort((a, b) => a - b);
    expect(ids[0]).toBeGreaterThan(0);
    expect(ids[1]).toBe(ids[0] + 1);
    expect(ids[2]).toBe(ids[1] + 1);
  });

  it('should handle authors with special characters in names', async () => {
    const specialNames = [
      'Jean-Luc Picard',
      "O'Connor, Mary",
      'José María García',
      'Smith & Jones Co.',
      'Author with "quotes"'
    ];

    // Insert authors with special characters
    for (const name of specialNames) {
      await db.insert(authorsTable)
        .values({ name })
        .execute();
    }

    const result = await getAuthors();

    expect(result).toHaveLength(5);
    
    const resultNames = result.map(author => author.name);
    specialNames.forEach(name => {
      expect(resultNames).toContain(name);
    });
  });
});