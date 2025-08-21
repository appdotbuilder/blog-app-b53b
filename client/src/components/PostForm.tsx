import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Send, User } from 'lucide-react';
import type { Author } from '../../../server/src/schema';

interface PostFormProps {
  authors: Author[];
  onSubmit: (data: { title: string; content: string; author_id: number }) => Promise<boolean>;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export function PostForm({ authors, onSubmit, isLoading = false, onSuccess }: PostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.author_id) {
      return;
    }

    const success = await onSubmit({
      title: formData.title.trim(),
      content: formData.content.trim(),
      author_id: parseInt(formData.author_id)
    });

    if (success) {
      setFormData({
        title: '',
        content: '',
        author_id: ''
      });
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Post Title *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter an engaging title for your post..."
          className="text-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author" className="text-sm font-medium">
          Author *
        </Label>
        <Select 
          value={formData.author_id} 
          onValueChange={(value: string) => setFormData(prev => ({ ...prev, author_id: value }))}
          required
        >
          <SelectTrigger id="author">
            <SelectValue placeholder="Select an author for this post" />
          </SelectTrigger>
          <SelectContent>
            {authors.map((author: Author) => (
              <SelectItem key={author.id} value={author.id.toString()}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {author.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium">
          Content *
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData(prev => ({ ...prev, content: e.target.value }))
          }
          placeholder="Write your blog post content here... Share your thoughts, insights, and stories!"
          className="min-h-[200px] resize-none"
          required
        />
        <p className="text-xs text-gray-500">
          {formData.content.length} characters
        </p>
      </div>

      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Ready to publish?</h4>
              <p className="text-sm text-gray-600">
                Your post will be visible to all readers once published
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !formData.author_id}
              className="bg-green-600 hover:bg-green-700 min-w-[120px]"
            >
              {isLoading ? (
                'Publishing...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Post
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}