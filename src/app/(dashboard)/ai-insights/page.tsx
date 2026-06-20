"use client";

import { useState } from "react";
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
import { Loader2, Brain, CheckCircle2, TrendingUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AiInsightsPage() {
  const [category, setCategory] = useState<string>("all");

  const { data: insightsRes, isLoading } = useQuery({
    queryKey: ["admin", "ai-insights", category],
    queryFn: async () => {
      const url = category === "all" ? "/ai-coach/admin/list" : `/ai-coach/admin/list?category=${category}`;
      const res = await axios.get(url);
      return res.data?.data ? res.data : { data: res.data, total: 0 };
    },
  });

  const insights = insightsRes?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">AI Insights Log</h2>
          <p className="text-muted-foreground mt-1">Monitor AI-generated health recommendations provided to users.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={category} onValueChange={(val) => val && setCategory(val)}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sleep">Sleep</SelectItem>
              <SelectItem value="heart">Heart</SelectItem>
              <SelectItem value="activity">Activity</SelectItem>
              <SelectItem value="recovery">Recovery</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 flex flex-col justify-between border-border bg-card shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Insights</p>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Brain className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{insightsRes?.total || 0}</h3>
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% this week
            </p>
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
                  <TableHead className="text-muted-foreground font-semibold">Category</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Title</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Priority</TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-center">Quality</TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-center">Votes</TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-center">Clicks</TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-right">Generated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights.map((insight: any) => (
                  <TableRow key={insight.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium py-4 text-slate-900 dark:text-zinc-100">
                      {insight.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{insight.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {insight.iconEmoji} {insight.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        insight.priority === 'high' ? "bg-red-500/10 text-red-600 border-red-500/20" : 
                        insight.priority === 'medium' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                        "bg-green-500/10 text-green-600 border-green-500/20"
                      }>
                        {insight.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {insight.qualityScore !== undefined ? (
                        <span className={insight.qualityScore > 70 ? "text-green-500" : insight.qualityScore < 30 && insight.qualityScore > 0 ? "text-red-500" : "text-amber-500"}>
                          {insight.qualityScore}%
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      <span className="text-green-500">{insight.thumbsUp || 0}</span> / <span className="text-red-500">{insight.thumbsDown || 0}</span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {insight.clicks || 0}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(insight.createdAt).toLocaleDateString()}
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
