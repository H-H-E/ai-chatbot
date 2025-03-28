"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "@/components/user-management"
import { CustomPrompts } from "@/components/custom-prompts"
import { UsageStatistics } from "@/components/usage-statistics"
import { ModeToggle } from "@/components/mode-toggle"
import { Users, MessageSquare, BarChart3 } from "lucide-react"

export function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-primary-foreground font-bold">PP</span>
            </div>
            <h1 className="text-xl font-semibold">Poiesis Pete Admin</h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6 md:py-8">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">User Management</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Custom Prompts</span>
                <span className="sm:hidden">Prompts</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Usage Statistics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            <TabsContent value="prompts">
              <CustomPrompts />
            </TabsContent>
            <TabsContent value="stats">
              <UsageStatistics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

