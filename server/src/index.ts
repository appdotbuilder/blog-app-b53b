import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createAuthorInputSchema,
  updateAuthorInputSchema,
  getAuthorByIdInputSchema,
  deleteAuthorInputSchema,
  createPostInputSchema,
  updatePostInputSchema,
  getPostByIdInputSchema,
  deletePostInputSchema
} from './schema';

// Import handlers
import { createAuthor } from './handlers/create_author';
import { getAuthors } from './handlers/get_authors';
import { getAuthorById } from './handlers/get_author_by_id';
import { updateAuthor } from './handlers/update_author';
import { deleteAuthor } from './handlers/delete_author';
import { createPost } from './handlers/create_post';
import { getPosts } from './handlers/get_posts';
import { getPostById } from './handlers/get_post_by_id';
import { updatePost } from './handlers/update_post';
import { deletePost } from './handlers/delete_post';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Author routes
  createAuthor: publicProcedure
    .input(createAuthorInputSchema)
    .mutation(({ input }) => createAuthor(input)),

  getAuthors: publicProcedure
    .query(() => getAuthors()),

  getAuthorById: publicProcedure
    .input(getAuthorByIdInputSchema)
    .query(({ input }) => getAuthorById(input)),

  updateAuthor: publicProcedure
    .input(updateAuthorInputSchema)
    .mutation(({ input }) => updateAuthor(input)),

  deleteAuthor: publicProcedure
    .input(deleteAuthorInputSchema)
    .mutation(({ input }) => deleteAuthor(input)),

  // Post routes
  createPost: publicProcedure
    .input(createPostInputSchema)
    .mutation(({ input }) => createPost(input)),

  getPosts: publicProcedure
    .query(() => getPosts()),

  getPostById: publicProcedure
    .input(getPostByIdInputSchema)
    .query(({ input }) => getPostById(input)),

  updatePost: publicProcedure
    .input(updatePostInputSchema)
    .mutation(({ input }) => updatePost(input)),

  deletePost: publicProcedure
    .input(deletePostInputSchema)
    .mutation(({ input }) => deletePost(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();