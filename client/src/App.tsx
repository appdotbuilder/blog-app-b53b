import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PostForm } from '@/components/PostForm';
import { AuthorForm } from '@/components/AuthorForm';
import { PostCard } from '@/components/PostCard';
import { AuthorList } from '@/components/AuthorList';
import { EditPostDialog } from '@/components/EditPostDialog';
import { PlusCircle, Users, FileText, BookOpen } from 'lucide-react';
import type { PostWithAuthor, Author, Post } from '../../server/src/schema';

function App() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);
  const [activeTab, setActiveTab] = useState('posts');

  const loadPosts = useCallback(async () => {
    try {
      const result = await trpc.getPosts.query();
      setPosts(result);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  }, []);

  const loadAuthors = useCallback(async () => {
    try {
      const result = await trpc.getAuthors.query();
      setAuthors(result);
    } catch (error) {
      console.error('Failed to load authors:', error);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadAuthors();
  }, [loadPosts, loadAuthors]);

  const handleCreatePost = async (postData: { title: string; content: string; author_id: number }) => {
    setIsLoading(true);
    try {
      const newPost = await trpc.createPost.mutate(postData);
      // Transform the Post to PostWithAuthor by finding the author
      const author = authors.find(a => a.id === newPost.author_id);
      if (author) {
        const postWithAuthor: PostWithAuthor = {
          ...newPost,
          author
        };
        setPosts((prev: PostWithAuthor[]) => [postWithAuthor, ...prev]);
      }
      return true;
    } catch (error) {
      console.error('Failed to create post:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAuthor = async (authorData: { name: string }) => {
    setIsLoading(true);
    try {
      const newAuthor = await trpc.createAuthor.mutate(authorData);
      setAuthors((prev: Author[]) => [...prev, newAuthor]);
      return true;
    } catch (error) {
      console.error('Failed to create author:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = async (id: number, updateData: { title?: string; content?: string; author_id?: number }) => {
    try {
      const updatedPost = await trpc.updatePost.mutate({ id, ...updateData });
      // Update the post in the list by transforming to PostWithAuthor
      const author = authors.find(a => a.id === updatedPost.author_id);
      if (author) {
        const postWithAuthor: PostWithAuthor = {
          ...updatedPost,
          author
        };
        setPosts((prev: PostWithAuthor[]) => 
          prev.map(p => p.id === id ? postWithAuthor : p)
        );
      }
      setEditingPost(null);
      return true;
    } catch (error) {
      console.error('Failed to update post:', error);
      return false;
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await trpc.deletePost.mutate({ id });
      setPosts((prev: PostWithAuthor[]) => prev.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete post:', error);
      return false;
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    try {
      await trpc.deleteAuthor.mutate({ id });
      setAuthors((prev: Author[]) => prev.filter(a => a.id !== id));
      // Remove posts by this author
      setPosts((prev: PostWithAuthor[]) => prev.filter(p => p.author_id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete author:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📝 Blog Manager
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Create, manage, and explore blog posts and authors ✨
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="create-post" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Post
            </TabsTrigger>
            <TabsTrigger value="authors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Authors ({authors.length})
            </TabsTrigger>
            <TabsTrigger value="create-author" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Author
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  All Blog Posts
                </CardTitle>
                <CardDescription>
                  Browse and manage all blog posts in your collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No posts yet! 📰</p>
                    <p className="mb-4">Start by creating your first blog post</p>
                    <Button 
                      onClick={() => setActiveTab('create-post')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create First Post
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {posts.map((post: PostWithAuthor) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onEdit={() => setEditingPost(post)}
                        onDelete={() => handleDeletePost(post.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Post Tab */}
          <TabsContent value="create-post">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-green-600" />
                  Create New Blog Post
                </CardTitle>
                <CardDescription>
                  Share your thoughts and ideas with the world 🌟
                </CardDescription>
              </CardHeader>
              <CardContent>
                {authors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No authors available</p>
                    <p className="mb-4">You need to create an author first before creating posts</p>
                    <Button 
                      onClick={() => setActiveTab('create-author')}
                      variant="outline"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Author
                    </Button>
                  </div>
                ) : (
                  <PostForm
                    authors={authors}
                    onSubmit={handleCreatePost}
                    isLoading={isLoading}
                    onSuccess={() => setActiveTab('posts')}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authors Tab */}
          <TabsContent value="authors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  All Authors
                </CardTitle>
                <CardDescription>
                  Manage the talented writers behind the posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {authors.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No authors yet! 👥</p>
                    <p className="mb-4">Add the first author to get started</p>
                    <Button 
                      onClick={() => setActiveTab('create-author')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Author
                    </Button>
                  </div>
                ) : (
                  <AuthorList
                    authors={authors}
                    posts={posts}
                    onDelete={handleDeleteAuthor}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Author Tab */}
          <TabsContent value="create-author">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-green-600" />
                  Add New Author
                </CardTitle>
                <CardDescription>
                  Welcome a new writer to your blog community 🎉
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthorForm
                  onSubmit={handleCreateAuthor}
                  isLoading={isLoading}
                  onSuccess={() => setActiveTab('authors')}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Post Dialog */}
        {editingPost && (
          <EditPostDialog
            post={editingPost}
            authors={authors}
            open={!!editingPost}
            onClose={() => setEditingPost(null)}
            onSave={handleUpdatePost}
          />
        )}

        {/* Stats Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
              <p className="text-sm text-blue-700">Total Posts</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{authors.length}</p>
              <p className="text-sm text-purple-700">Authors</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">
                {posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + post.content.length, 0) / posts.length) : 0}
              </p>
              <p className="text-sm text-green-700">Avg. Content Length</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;