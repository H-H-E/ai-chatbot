'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

// Use simple divs for tabs since we don't have the UI components
const TabsList = ({ children }: { children: React.ReactNode }) => (
  <div className="flex space-x-2 mb-4 border-b">{children}</div>
);

const TabsTrigger = ({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    className={`px-4 py-2 ${active ? 'border-b-2 border-blue-500' : ''}`}
    onClick={onClick}
  >
    {value}
  </button>
);

const TabsContent = ({
  value,
  activeTab,
  children,
}: {
  value: string;
  activeTab: string;
  children: React.ReactNode;
}) => (
  <div className={value === activeTab ? 'block' : 'hidden'}>{children}</div>
);

type StatsData = {
  dailyStats?: Array<{
    date: string;
    totalTokens: number;
  }>;
  modelStats?: Array<any>;
  totals?: {
    totalTokens: number;
  };
  topUsers?: Array<any>;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        redirect('/');
      } else {
        fetchStats();
      }
    } else if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="container p-8">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="container p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <TabsList>
          <TabsTrigger
            value="Overview"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabsTrigger
            value="Users"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <TabsTrigger
            value="Prompts"
            active={activeTab === 'prompts'}
            onClick={() => setActiveTab('prompts')}
          />
          <TabsTrigger
            value="Settings"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </TabsList>

        <TabsContent value="overview" activeTab={activeTab}>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Token Usage</CardTitle>
                <CardDescription>
                  Total tokens used in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.totals?.totalTokens?.toLocaleString() || 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>
                  Users with activity in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.topUsers?.length || 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Models Used</CardTitle>
                <CardDescription>Distribution of model usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.modelStats?.length || 'N/A'} models
                </div>
              </CardContent>
            </Card>
          </div>

          {stats?.dailyStats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Daily Token Usage</CardTitle>
                <CardDescription>
                  Token usage over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date: string) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date: string) =>
                        new Date(date).toLocaleDateString()
                      }
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        'Tokens',
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="totalTokens"
                      fill="#8884d8"
                      name="Total Tokens"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This section will contain user management functionality.
              </p>
              <Button>Add User</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Custom Prompts</CardTitle>
              <CardDescription>Manage system and user prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This section will contain prompt management functionality.
              </p>
              <Button>Create System Prompt</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure global and user-specific settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This section will contain settings functionality.
              </p>
              <Button>Update Default Limits</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
}
