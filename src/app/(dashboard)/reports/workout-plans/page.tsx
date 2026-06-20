"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Activity, ListOrdered, CalendarCheck } from "lucide-react";

export default function WorkoutPlansReportPage() {
  const { data: statsRes, isLoading: loadingStats } = useQuery({
    queryKey: ["admin", "workout-stats"],
    queryFn: async () => {
      const res = await axios.get("/workout/admin/stats");
      return res.data?.data || res.data;
    },
  });

  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ["admin", "workout-plans"],
    queryFn: async () => {
      const res = await axios.get("/workout/admin/plans");
      return res.data?.data || res.data;
    },
  });

  const plans = plansRes?.data || [];
  const isLoading = loadingStats || loadingPlans;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Workout Plans</h2>
          <p className="text-muted-foreground mt-1">Analytics on user workout plans and engagement.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 flex flex-col justify-between border-border bg-card shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Plans</p>
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <ListOrdered className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{statsRes?.totalPlans || 0}</h3>
          </div>
        </Card>
        
        <Card className="p-6 flex flex-col justify-between border-border bg-card shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Plans</p>
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{statsRes?.activePlans || 0}</h3>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between border-border bg-card shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Logs</p>
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{statsRes?.totalLogs || 0}</h3>
          </div>
        </Card>
      </div>

      <Card className="flex-1 overflow-hidden border-border bg-card shadow-sm flex flex-col">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <Table>
              <TableHeader className="bg-muted/40 dark:bg-zinc-900/50 sticky top-0">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold py-4">User</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Plan Name</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Goal</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Duration</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan: any) => (
                  <TableRow key={plan.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium py-4 text-slate-900 dark:text-zinc-100">
                      {plan.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {plan.name}
                      {plan.isAiGenerated && <Badge variant="outline" className="ml-2 text-xs">AI</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.goal}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.durationWeeks} weeks
                    </TableCell>
                    <TableCell>
                      <Badge className={plan.isActive ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-slate-500/10 text-slate-600 border-slate-500/20"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
