"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Server, Radio, Network, CheckCircle2, XCircle, AlertCircle, List } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { format } from "date-fns";

function StatusIcon({ status }: { status: string }) {
  if (status === 'healthy') return <CheckCircle2 className="text-green-500 w-5 h-5" />;
  if (status === 'warning') return <AlertCircle className="text-yellow-500 w-5 h-5" />;
  return <XCircle className="text-red-500 w-5 h-5" />;
}

export default function SystemHealthPage() {
  const [page, setPage] = useState(1);
  const { data: health, isLoading } = useQuery({
    queryKey: ["admin", "health"],
    queryFn: async () => {
      const res = await axios.get("/admin/stats/health");
      return res.data;
    },
    refetchInterval: 5000,
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["admin", "kafka-audit", page],
    queryFn: async () => {
      const res = await axios.get(`/admin/kafka-audit?page=${page}&limit=50`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Activity className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">System Health</h2>
          <p className="text-muted-foreground mt-1">Real-time infrastructure monitoring.</p>
        </div>
        <Sheet>
          <SheetTrigger render={
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <List className="h-4 w-4 mr-2" />
              Kafka Audit Logs
            </Button>
          } />
          <SheetContent side="right" className="w-[800px] sm:w-[800px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Kafka Audit Logs</SheetTitle>
              <SheetDescription>View system-wide Kafka event emissions.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {auditLogs?.data?.map((log: any) => (
                <div key={log.id} className="p-4 border border-border rounded-xl bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {log.eventType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.producedAt), "MMM dd, yyyy HH:mm:ss")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                    <div>
                      <span className="text-muted-foreground">User:</span>{" "}
                      <span className="font-medium">{log.user?.name || log.userId}</span>
                    </div>
                    {log.deviceId && (
                      <div>
                        <span className="text-muted-foreground">Device:</span>{" "}
                        <span className="font-medium">{log.device?.deviceType || log.deviceId}</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Payload:</span>
                      <pre className="mt-1 p-2 bg-muted/50 rounded-md text-xs overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
              {auditLogs?.meta && (
                <div className="flex justify-between items-center py-4">
                  <Button 
                    variant="outline" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {auditLogs.meta.totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    disabled={page === auditLogs.meta.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {health?.api && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" /> API Server
              </CardTitle>
              <StatusIcon status={health.api.status} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.api.latency}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                p95: {health.api.p95Ms}ms | Uptime: {Math.floor(health.api.uptime / 3600)}h {Math.floor((health.api.uptime % 3600) / 60)}m
              </p>
            </CardContent>
          </Card>
        )}

        {health?.database && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" /> Database
              </CardTitle>
              <StatusIcon status={health.database.status} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.database.latency}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                Database Latency
              </p>
            </CardContent>
          </Card>
        )}

        {health?.redis && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4 text-red-500" /> Redis
              </CardTitle>
              <StatusIcon status={health.redis.status} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.redis.usedMemory}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Keys: {health.redis.totalKeys} | Clients: {health.redis.connectedClients}
              </p>
            </CardContent>
          </Card>
        )}

        {health?.kafka && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Network className="w-4 h-4 text-orange-500" /> Kafka
              </CardTitle>
              <StatusIcon status={health.kafka.status} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.kafka.activeBrokers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active Brokers | {health.kafka.partitions} partitions
              </p>
            </CardContent>
          </Card>
        )}

        {health?.websocket && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-500" /> WebSocket
              </CardTitle>
              <StatusIcon status={health.websocket.status} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.websocket.connectedAdmins}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Connected Admins
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {health?.kafka?.consumerGroups && (
        <Card className="border-border bg-card shadow-sm mt-6">
          <CardHeader>
            <CardTitle>Consumer Group Lag</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Lag</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...health.kafka.consumerGroups]
                  .sort((a, b) => b.lag - a.lag)
                  .map((cg: any) => (
                    <TableRow key={cg.groupId}>
                      <TableCell className="font-medium">
                        {cg.groupId.replace('sv-consumer-', '')}
                      </TableCell>
                      <TableCell>{cg.lag === -1 ? 'N/A' : cg.lag}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            cg.lag > 1000 ? 'border-red-500/20 bg-red-500/10 text-red-600' :
                            cg.lag > 100 ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-600' :
                            'border-green-500/20 bg-green-500/10 text-green-600'
                          }
                        >
                          {cg.lag > 1000 ? 'Critical' : cg.lag > 100 ? 'Lag detected' : 'Healthy'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
