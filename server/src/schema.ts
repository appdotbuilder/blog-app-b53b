import { z } from 'zod';

// Author schema
export const authorSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type Author = z.infer<typeof authorSchema>;

// Input schema for creating authors
export const createAuthorInputSchema = z.object({
  name: z.string().min(1, 'Author name is required')
});

export type CreateAuthorInput = z.infer<typeof createAuthorInputSchema>;

// Input schema for updating authors
export const updateAuthorInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Author name is required').optional()
});

export type UpdateAuthorInput = z.infer<typeof updateAuthorInputSchema>;

// Post schema
export const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  author_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Post = z.infer<typeof postSchema>;

// Post with author schema for joined queries
export const postWithAuthorSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  author_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  author: authorSchema
});

export type PostWithAuthor = z.infer<typeof postWithAuthorSchema>;

// Input schema for creating posts
export const createPostInputSchema = z.object({
  title: z.string().min(1, 'Post title is required'),
  content: z.string().min(1, 'Post content is required'),
  author_id: z.number()
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

// Input schema for updating posts
export const updatePostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Post title is required').optional(),
  content: z.string().min(1, 'Post content is required').optional(),
  author_id: z.number().optional()
});

export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

// Input schema for getting a single post by ID
export const getPostByIdInputSchema = z.object({
  id: z.number()
});

export type GetPostByIdInput = z.infer<typeof getPostByIdInputSchema>;

// Input schema for getting an author by ID
export const getAuthorByIdInputSchema = z.object({
  id: z.number()
});

export type GetAuthorByIdInput = z.infer<typeof getAuthorByIdInputSchema>;

// Input schema for deleting a post
export const deletePostInputSchema = z.object({
  id: z.number()
});

export type DeletePostInput = z.infer<typeof deletePostInputSchema>;

// Input schema for deleting an author
export const deleteAuthorInputSchema = z.object({
  id: z.number()
});

export type DeleteAuthorInput = z.infer<typeof deleteAuthorInputSchema>;