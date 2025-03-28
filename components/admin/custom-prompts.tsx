import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface CustomPrompt {
  id: string;
  userId: string;
  promptText: string;
  name: string | null;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
}

export function CustomPrompts() {
  const {
    data: prompts,
    isLoading,
    mutate,
  } = useSWR<CustomPrompt[]>('/api/admin/prompts');
  const { data: users } = useSWR<User[]>('/api/admin/users');
  const [isCreating, setIsCreating] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    userId: '',
    promptText: '',
    name: '',
  });

  const handleCreatePrompt = async () => {
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrompt),
      });

      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }

      await mutate();
      setIsCreating(false);
      setNewPrompt({ userId: '', promptText: '', name: '' });
      toast.success('Prompt created successfully');
    } catch (error) {
      toast.error('Failed to create prompt');
      console.error('Error creating prompt:', error);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      await mutate();
      toast.success('Prompt deleted successfully');
    } catch (error) {
      toast.error('Failed to delete prompt');
      console.error('Error deleting prompt:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Custom Prompts</h3>
        <Button onClick={() => setIsCreating(true)}>Create New Prompt</Button>
      </div>

      {isCreating && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <label htmlFor="user-select" className="text-sm font-medium">
              User
            </label>
            <Select
              value={newPrompt.userId}
              onValueChange={(value) =>
                setNewPrompt({ ...newPrompt, userId: value })
              }
            >
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="prompt-name" className="text-sm font-medium">
              Name (optional)
            </label>
            <Input
              id="prompt-name"
              value={newPrompt.name}
              onChange={(e) =>
                setNewPrompt({ ...newPrompt, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prompt-text" className="text-sm font-medium">
              Prompt Text
            </label>
            <Textarea
              id="prompt-text"
              value={newPrompt.promptText}
              onChange={(e) =>
                setNewPrompt({ ...newPrompt, promptText: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewPrompt({ userId: '', promptText: '', name: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePrompt}>Create Prompt</Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Prompt Text</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts?.map((prompt) => {
            const user = users?.find((u) => u.id === prompt.userId);
            return (
              <TableRow key={prompt.id}>
                <TableCell>{user?.email}</TableCell>
                <TableCell>{prompt.name || 'Unnamed'}</TableCell>
                <TableCell className="max-w-md truncate">
                  {prompt.promptText}
                </TableCell>
                <TableCell>
                  {new Date(prompt.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePrompt(prompt.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
