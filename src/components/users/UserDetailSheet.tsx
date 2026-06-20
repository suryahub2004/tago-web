import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Watch, Heart, BrainCircuit, Activity, Waves } from "lucide-react";
import { useUserReadiness } from "@/hooks/useUserReadiness";
import { useUserApiUsage } from "@/hooks/useUserApiUsage";
import { useUserFullProfile } from "@/hooks/useUserFullProfile";
import { useUserWorkoutLogs } from "@/hooks/useUserWorkoutLogs";
import { useUserMeditationSessions } from "@/hooks/useUserMeditationSessions";
import { useUserInsights } from "@/hooks/useUserInsights";
import { formatDistanceToNow } from "date-fns";

export function UserDetailSheet({ user, onClose }: { user: any; onClose: () => void }) {
  const { data: readinessData } = useUserReadiness(user?.id);
  const { data: apiUsage } = useUserApiUsage(user?.id);
  const { data: fullProfile } = useUserFullProfile(user?.id);
  const { data: workouts } = useUserWorkoutLogs(user?.id);
  const { data: meditations } = useUserMeditationSessions(user?.id);
  const { data: insights } = useUserInsights(user?.id);

  const vitals = fullProfile?.vitals;
  const devices = fullProfile?.devices || [];

  return (
    <Sheet open={!!user} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-card border-l-border sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white">User Details</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Detailed metrics, activity, and devices for {user?.name}.
          </SheetDescription>
        </SheetHeader>
        
        {user && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/40 p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="workout">Workout</TabsTrigger>
              <TabsTrigger value="meditation">Meditate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Information</h4>
                <div className="bg-muted/40 dark:bg-zinc-900/30 rounded-xl p-4 border border-border/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">{user.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium text-primary">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {apiUsage && (
                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">API Calls (last hour)</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">24h total: {apiUsage.total24h?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          apiUsage.lastHour > 1000 ? "text-red-600 dark:text-red-400" :
                          apiUsage.lastHour > 500 ? "text-amber-500" :
                          "text-slate-900 dark:text-zinc-100"
                        }`}>
                          {apiUsage.lastHour?.toLocaleString() || 0}
                        </span>
                        {apiUsage.lastHour > 1000 && (
                          <Badge variant="destructive" className="h-5 text-[10px] px-1.5">High traffic</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Latest Vitals</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 dark:bg-zinc-900/30 border border-border/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground mb-1 uppercase">Heart Rate</span>
                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">{vitals?.heartRate ?? '--'} <span className="text-sm font-normal text-muted-foreground">bpm</span></span>
                  </div>
                  <div className="bg-muted/40 dark:bg-zinc-900/30 border border-border/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground mb-1 uppercase">HRV</span>
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{vitals?.hrv ?? '--'} <span className="text-sm font-normal text-muted-foreground">ms</span></span>
                  </div>
                  <div className="bg-muted/40 dark:bg-zinc-900/30 border border-border/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground mb-1 uppercase">SpO2</span>
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">{vitals?.spO2 ?? '--'} <span className="text-sm font-normal text-muted-foreground">%</span></span>
                  </div>
                  <div className="bg-muted/40 dark:bg-zinc-900/30 border border-border/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground mb-1 uppercase">Readiness</span>
                    {readinessData ? (
                      <>
                        <span className={`text-3xl font-bold ${
                          readinessData.score >= 80 ? "text-green-600 dark:text-green-400" :
                          readinessData.score >= 60 ? "text-yellow-500" :
                          readinessData.score >= 40 ? "text-orange-500" :
                          "text-red-600 dark:text-red-400"
                        }`}>
                          {readinessData.score} <span className="text-sm font-normal text-muted-foreground">/100</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-1">
                          Computed {formatDistanceToNow(new Date(readinessData.computedAt), { addSuffix: true })}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground mt-2">No score</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Devices</h4>
                {devices.length === 0 ? (
                  <div className="bg-muted/40 rounded-xl p-4 border border-border/50 text-center text-muted-foreground">No paired devices.</div>
                ) : (
                  <div className="space-y-3">
                    {devices.map((device: any) => (
                      <div key={device.id} className="bg-muted/40 dark:bg-zinc-900/30 rounded-xl p-4 border border-border/50 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 text-primary">
                            <Watch className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold leading-none text-slate-900 dark:text-zinc-100">{device.deviceName || device.deviceType}</p>
                            <p className="text-xs text-muted-foreground mt-1">ID: {device.deviceSerial}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={device.batteryLevel && device.batteryLevel > 20 ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}>
                          {device.batteryLevel ?? '--'}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0 focus-visible:outline-none focus-visible:ring-0 space-y-4">
              {insights && insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight: any) => (
                    <div key={insight.id} className="bg-muted/40 rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <BrainCircuit className="w-4 h-4 text-primary" />
                        <h5 className="font-medium text-slate-900 dark:text-zinc-100">{insight.category} Insight</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(insight.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/40 rounded-xl p-4 border border-border/50 text-center text-muted-foreground py-8">
                  <p>No AI Insights generated yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="workout" className="mt-0 focus-visible:outline-none focus-visible:ring-0 space-y-4">
              {workouts && workouts.length > 0 ? (
                <div className="space-y-3">
                  {workouts.map((w: any) => (
                    <div key={w.id} className="bg-muted/40 rounded-xl p-4 border border-border/50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-orange-500" />
                          <h5 className="font-medium text-slate-900 dark:text-zinc-100">Workout Log</h5>
                        </div>
                        <Badge variant="outline">{w.completed ? 'Completed' : 'Partial'}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Duration: {w.durationMinutes} min</p>
                        <p>Calories: {w.caloriesBurned} kcal</p>
                        <p>Avg HR: {w.avgHeartRate} bpm</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(w.date).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/40 rounded-xl p-4 border border-border/50 text-center text-muted-foreground py-8">
                  <p>No workout logs available.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="meditation" className="mt-0 focus-visible:outline-none focus-visible:ring-0 space-y-4">
              {meditations && meditations.data && meditations.data.length > 0 ? (
                <div className="space-y-3">
                  {meditations.data.map((m: any) => (
                    <div key={m.id} className="bg-muted/40 rounded-xl p-4 border border-border/50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Waves className="w-4 h-4 text-blue-500" />
                          <h5 className="font-medium text-slate-900 dark:text-zinc-100">Meditation Session</h5>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Type: {m.type}</p>
                        <p>Duration: {m.durationMinutes} min</p>
                        <p>Completed: {m.completed ? 'Yes' : 'No'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(m.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/40 rounded-xl p-4 border border-border/50 text-center text-muted-foreground py-8">
                  <p>No meditation sessions available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
