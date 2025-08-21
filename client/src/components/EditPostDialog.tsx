import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, User } from 'lucide-react';
import type { PostWithAuthor, Author } from '../../../server/src/schema';

interface EditPostDialogProps {
  post: PostWithAuthor;
  authors: Author[];
  open: boolean;
  onClose: () => void;
  onSave: (id: number, data: { title?: string; content?: string; author_id?: number }) => Promise<boolean>;
}

export function EditPostDialog({ post, authors, open, onClose, onSave }: EditPostDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author_id: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        author_id: post.author_id.toString()
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.author_id) {
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(post.id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author_id: parseInt(formData.author_id)
      });
      
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  const hasChanges = 
    formData.title !== post.title ||
    formData.content !== post.content ||
    parseInt(formData.author_id) !== post.author_id;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-blue-600" />
            Edit Post
          </DialogTitle>
          <DialogDescription>
            Make changes to your blog post. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-medium">
              Post Title *
            </Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter post title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-author" className="text-sm font-medium">
              Author *
            </Label>
            <Select 
              value={formData.author_id} 
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, author_id: value }))}
              required
            >
              <SelectTrigger id="edit-author">
                <SelectValue placeholder="Select an author" />
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

          <div className="space-y-2 flex-1 flex flex-col">
            <Label htmlFor="edit-content" className="text-sm font-medium">
              Content *
            </Label>
            <Textarea
              id="edit-content"
              value={formData.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData(prev => ({ ...prev, content: e.target.value }))
              }
              placeholder="Write your blog post content..."
              className="flex-1 resize-none min-h-[200px]"
              required
            />
            <p className="text-xs text-gray-500">
              {formData.content.length} characters
            </p>
          </div>

          <DialogFooter className="flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-500">
                {hasChanges ? (
                  <span className="text-amber-600 font-medium">• Unsaved changes</span>
                ) : (
                  <span className="text-green-600">• No changes</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving || !formData.title.trim() || !formData.content.trim() || !formData.author_id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}