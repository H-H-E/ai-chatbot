"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Calendar, Download, RefreshCw, Users, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export function UsageStatistics() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const handleFetchStatistics = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setHasData(true)
    }, 1500)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getDateRangeText = () => {
    if (!startDate || !endDate) return "Select a date range"
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Monitor token usage and user activity</CardDescription>
          </div>
          {hasData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download statistics as CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button
              onClick={handleFetchStatistics}
              disabled={isLoading || !startDate || !endDate}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Fetch Data
                </>
              )}
            </Button>
          </div>

          {hasData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {getDateRangeText()}
                </Badge>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview" className="text-xs px-3">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="users" className="text-xs px-3">
                      Users
                    </TabsTrigger>
                    <TabsTrigger value="tokens" className="text-xs px-3">
                      Tokens
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <TabsContent value="overview" className="m-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">127,340</div>
                      <div className="flex items-center pt-1">
                        <span className="text-xs text-emerald-500 font-medium">+15%</span>
                        <span className="text-xs text-muted-foreground ml-1">from previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <div className="flex items-center pt-1">
                        <span className="text-xs text-emerald-500 font-medium">+3</span>
                        <span className="text-xs text-muted-foreground ml-1">from previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Tokens Per User</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5,306</div>
                      <div className="flex items-center pt-1">
                        <span className="text-xs text-rose-500 font-medium">-2%</span>
                        <span className="text-xs text-muted-foreground ml-1">from previous period</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="md:col-span-2 lg:col-span-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Usage Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                          <div className="text-center space-y-2">
                            <p className="text-muted-foreground">Chart visualization would appear here</p>
                            <p className="text-xs text-muted-foreground">
                              Daily token usage from {formatDate(startDate)} to {formatDate(endDate)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="m-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Top Users by Token Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">User ranking chart would appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">User Activity Heatmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">Activity heatmap would appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tokens" className="m-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Token Usage by Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">Model usage breakdown would appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Token Cost Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">Cost analysis chart would appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          ) : (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-10">
                <div className="rounded-full bg-background p-3 mb-4">
                  <Zap className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="text-lg font-medium">No data to display</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a date range and click "Fetch Data" to view usage statistics for Poiesis Pete
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[120px] rounded-md" />
                <Skeleton className="h-[120px] rounded-md" />
                <Skeleton className="h-[120px] rounded-md" />
                <Skeleton className="h-[300px] md:col-span-2 lg:col-span-3 rounded-md" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

