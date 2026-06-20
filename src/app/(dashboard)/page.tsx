"use client";

import { useAdminOverview } from "@/hooks/useAdminStats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Watch, Activity, BellRing, TrendingUp, AlertTriangle, Brain, Dumbbell, Package, DollarSign, CreditCard } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function DashboardOverview() {
  const [range, setRange] = React.useState("30d");
  const { data, isLoading, error } = useAdminOverview(range);

  if (isLoading || (!data && !error)) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <Activity className="h-10 w-10 text-primary mb-4 animate-bounce" />
        <p className="text-muted-foreground font-medium">Loading premium dashboard...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex h-full items-center justify-center text-destructive">
      <div className="flex flex-col items-center">
        <AlertTriangle className="h-10 w-10 mb-4" />
        <p className="font-medium text-lg">Stats unavailable — check API connection</p>
      </div>
    </div>
  );

  const stats = [
    {
      title: "Total Users",
      value: data?.totalUsers || 0,
      icon: Users,
      description: "Active platform users",
      trend: `${data?.usersToday || 0} in range`
    },
    {
      title: "Active Devices",
      value: data?.totalDevices || 0,
      icon: Watch,
      description: "Total registered devices",
      trend: `${data?.activeDevicesLast24h || 0} active 24h`
    },
    {
      title: "Today's Vitals",
      value: data?.vitalsRecordedToday || 0,
      icon: Activity,
      description: "Measurements taken today",
      trend: "Live sync active"
    },
    {
      title: "Active Alerts",
      value: data?.activeAlerts || 0,
      icon: BellRing,
      description: "Unacknowledged health alerts",
      trend: "Requires attention",
      alert: data?.activeAlerts > 0
    },
    {
      title: "AI Coaching",
      value: data?.aiInsightsToday || 0,
      icon: Brain,
      description: "AI Insights generated today",
      trend: "Model processing active"
    },
    {
      title: "Workouts Logged",
      value: data?.workoutsThisWeek || 0,
      icon: Dumbbell,
      description: "Workouts logged this week",
      trend: "Real-time updates"
    },
    {
      title: "Total Revenue",
      value: `$${(data?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Lifetime sales revenue",
      trend: `+$${(data?.revenueToday || 0).toLocaleString()} in range`
    },
    {
      title: "Conversion Rate",
      value: `${data?.conversionRate || 0}%`,
      icon: CreditCard,
      description: "Users to Paid Orders",
      trend: `$${(data?.avgOrderValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} AOV`
    },
  ];

  // Real data from backend
  const chartData = data?.chartData || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Real-time telemetry and platform metrics.
          </p>
        </div>
        <Tabs value={range} onValueChange={setRange} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-800 group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 dark:opacity-10 dark:group-hover:opacity-20 transition-opacity">
              <stat.icon className="h-24 w-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                {stat.alert ? null : <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
                <span className={stat.alert ? "text-destructive font-medium" : "text-green-500 font-medium"}>
                  {stat.trend}
                </span>
                <span className="ml-2 text-muted-foreground/60">{stat.description}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900 dark:text-white">Platform Growth (30 Days)</CardTitle>
            <CardDescription>Daily active users and vitals synchronization volume.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--tooltip-bg)', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '12px', 
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-border bg-card shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between text-slate-900 dark:text-white">
              Recent Health Alerts
              <Badge variant="destructive" className="animate-pulse">Live Feed</Badge>
            </CardTitle>
            <CardDescription>Critical anomalies detected across the fleet in real-time.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {data?.recentAlerts?.length > 0 ? data.recentAlerts.map((alert: any, i: number) => (
                <div key={i} className="flex items-center p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/80 transition-colors">
                  <div className={`p-2 rounded-full mr-4 ${alert.severity === 'CRITICAL' ? 'bg-destructive/20 text-destructive' : 'bg-orange-500/20 text-orange-500'}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">{alert.alertType}</p>
                    <p className="text-xs text-muted-foreground">{alert.user?.name || 'Unknown User'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'default'} className={alert.severity === 'HIGH' ? 'bg-orange-500' : ''}>
                      {alert.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center p-4 text-muted-foreground text-sm">No recent alerts found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
