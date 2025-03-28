import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UsageStats } from '@/components/admin/usage-stats';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Usage Statistics</h2>
          <div className="bg-card rounded-lg border p-6">
            <UsageStats />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">
              User management features coming soon...
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">
              System settings features coming soon...
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
