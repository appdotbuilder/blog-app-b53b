import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, User, FileText, Calendar } from 'lucide-react';
import type { Author, PostWithAuthor } from '../../../server/src/schema';

interface AuthorListProps {
  authors: Author[];
  posts: PostWithAuthor[];
  onDelete: (id: number) => Promise<boolean>;
}

export function AuthorList({ authors, posts, onDelete }: AuthorListProps) {
  const [deletingAuthor, setDeletingAuthor] = useState<number | null>(null);

  const handleDelete = async (authorId: number) => {
    setDeletingAuthor(authorId);
    try {
      await onDelete(authorId);
    } finally {
      setDeletingAuthor(null);
    }
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAuthorPostCount = (authorId: number) => {
    return posts.filter(post => post.author_id === authorId).length;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getAuthorPosts = (authorId: number) => {
    return posts.filter(post => post.author_id === authorId);
  };

  return (
    <div className="grid gap-4">
      {authors.map((author: Author) => {
        const authorPosts = getAuthorPosts(author.id);
        const postCount = authorPosts.length;
        
        return (
          <Card key={author.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg bg-purple-100 text-purple-700 font-semibold">
                      {getAuthorInitials(author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{author.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {formatDate(author.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{postCount}</div>
                    <div className="text-xs text-gray-500">Posts</div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        disabled={deletingAuthor === author.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Author</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete author "{author.name}"? 
                          {postCount > 0 && (
                            <span className="block mt-2 text-red-600 font-medium">
                              ⚠️ This will also delete {postCount} post{postCount > 1 ? 's' : ''} by this author.
                            </span>
                          )}
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(author.id)}
                          disabled={deletingAuthor === author.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deletingAuthor === author.id ? 'Deleting...' : 'Delete Author'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            {postCount > 0 && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Recent Posts by {author.name}
                  </h4>
                  <div className="space-y-2">
                    {authorPosts.slice(0, 3).map((post: PostWithAuthor) => (
                      <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{post.title}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {post.content.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {formatDate(post.created_at)}
                        </div>
                      </div>
                    ))}
                    {postCount > 3 && (
                      <div className="text-center pt-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          +{postCount - 3} more posts
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
            
            {postCount === 0 && (
              <CardContent className="pt-0">
                <div className="border-t pt-4 text-center text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No posts yet</p>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}