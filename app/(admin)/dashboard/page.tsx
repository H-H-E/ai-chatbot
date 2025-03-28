import { UsageStats } from '@/components/admin/usage-stats';
import { UserManagement } from '@/components/admin/user-management';
import { CustomPrompts } from '@/components/admin/custom-prompts';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, custom prompts, and view usage statistics.
        </p>
      </div>

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
            <UserManagement />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Custom Prompts</h2>
          <div className="bg-card rounded-lg border p-6">
            <CustomPrompts />
          </div>
        </section>
      </div>
    </div>
  );
}
