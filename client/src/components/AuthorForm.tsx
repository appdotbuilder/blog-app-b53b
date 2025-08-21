import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Sparkles } from 'lucide-react';

interface AuthorFormProps {
  onSubmit: (data: { name: string }) => Promise<boolean>;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export function AuthorForm({ onSubmit, isLoading = false, onSuccess }: AuthorFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    const success = await onSubmit({ name: name.trim() });

    if (success) {
      setName('');
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Author Name *
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Enter the author's full name..."
          className="text-lg"
          required
        />
        <p className="text-xs text-gray-500">
          This name will be displayed on all posts by this author
        </p>
      </div>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-purple-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Welcome a new writer!
              </h4>
              <p className="text-sm text-purple-700">
                Authors can create and manage their own blog posts
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim()}
              className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
            >
              {isLoading ? (
                'Adding...'
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Author
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}