'use client';

import {
  Suspense,
  lazy,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Dynamic imports for heavy components
const DailyTokenUsageChart = lazy(
  () => import('./components/DailyTokenUsageChart'),
);

// Simple fallback loading components
const ChartSkeleton = () => (
  <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-md" />
);

const CardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-2" />
      <div className="h-4 w-48 bg-gray-100 animate-pulse rounded" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
    </CardContent>
  </Card>
);

// Memoized UI components for better performance
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
    type="button"
    className={`px-4 py-2 ${active ? 'border-b-2 border-blue-500' : ''}`}
    onClick={onClick}
  >
    {value}
  </button>
);

// Memoized to prevent unnecessary re-renders
const TabsContent = ({
  value,
  activeTab,
  children,
}: { value: string; activeTab: string; children: React.ReactNode }) => {
  const isActive = value === activeTab;
  return useMemo(
    () => <div className={isActive ? 'block' : 'hidden'}>{children}</div>,
    [isActive, children],
  );
};

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

// API data fetcher with caching
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');

  // Use SWR for data fetching with caching, revalidation, and error handling
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: StatsData;
  }>(
    status === 'authenticated' && session?.user?.role === 'admin'
      ? '/api/admin/stats'
      : null,
    fetcher,
    {
      revalidateOnFocus: false, // Only revalidate explicitly or on interval
      refreshInterval: 60000, // Refresh every minute
      dedupingInterval: 10000, // Dedupe similar requests within 10s
    },
  );

  // Optimize tab switching
  const setActiveTabCallback = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Memoize stats data to avoid unnecessary recalculations
  const stats = useMemo(() => data?.data || null, [data]);

  if (status === 'loading' || (!stats && isLoading)) {
    return (
      <div className="container p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="mt-6">
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">Error loading dashboard data</p>
          <Button className="mt-2" onClick={() => mutate()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <TabsList>
          <TabsTrigger
            value="Overview"
            active={activeTab === 'overview'}
            onClick={() => setActiveTabCallback('overview')}
          />
          <TabsTrigger
            value="Users"
            active={activeTab === 'users'}
            onClick={() => setActiveTabCallback('users')}
          />
          <TabsTrigger
            value="Prompts"
            active={activeTab === 'prompts'}
            onClick={() => setActiveTabCallback('prompts')}
          />
          <TabsTrigger
            value="Settings"
            active={activeTab === 'settings'}
            onClick={() => setActiveTabCallback('settings')}
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
                <Suspense fallback={<ChartSkeleton />}>
                  <DailyTokenUsageChart data={stats.dailyStats} />
                </Suspense>
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
