import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface UsageStat {
  id: string;
  userId: string;
  timestamp: string;
  tokensUsed: number;
  chatId: string | null;
  modelUsed: string | null;
}

interface User {
  id: string;
  email: string;
}

export function UsageStats() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const { data: stats, isLoading } = useSWR<UsageStat[]>(
    `/api/admin/usage?${new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(selectedUserId && { userId: selectedUserId }),
    })}`,
  );
  const { data: users } = useSWR<User[]>('/api/admin/users');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="start-date" className="text-sm font-medium">
            Start Date
          </label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="end-date" className="text-sm font-medium">
            End Date
          </label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="user-select" className="text-sm font-medium">
            User
          </label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger id="user-select">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All users</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Tokens Used</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Chat ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats?.map((stat) => {
            const user = users?.find((u) => u.id === stat.userId);
            return (
              <TableRow key={stat.id}>
                <TableCell>{user?.email}</TableCell>
                <TableCell>
                  {new Date(stat.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{stat.tokensUsed}</TableCell>
                <TableCell>{stat.modelUsed || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm">
                  {stat.chatId || 'N/A'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
