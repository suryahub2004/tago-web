import { Card } from "@/components/ui/card";
import { useFleetHealth } from "@/hooks/useFleetHealth";
import { Cpu, ArrowUpCircle, BatteryWarning, WifiOff, Loader2 } from "lucide-react";

export function FleetHealthCards() {
  const { data: health, isLoading } = useFleetHealth();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 h-32">
        <Card className="flex items-center justify-center bg-card border-border"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></Card>
        <Card className="flex items-center justify-center bg-card border-border"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></Card>
        <Card className="flex items-center justify-center bg-card border-border"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></Card>
        <Card className="flex items-center justify-center bg-card border-border"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></Card>
      </div>
    );
  }

  if (!health) return null;

  // Assuming ring firmware is the primary one shown, or just show aggregate adoption
  const latestRingFirmware = health.latestVersions['SMART_RING'] || 'N/A';
  const ringAdoption = health.firmwareAdoption?.find((a: any) => a.deviceType === 'SMART_RING' && a.isLatest)?.adoptionRate || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 flex flex-col justify-between border-border bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Firmware Rollout</p>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Cpu className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-3xl font-bold tracking-tight text-foreground">v{latestRingFirmware}</h3>
          <p className="text-sm text-muted-foreground mt-1">Current ring release</p>
        </div>
      </Card>
      
      <Card className="p-6 flex flex-col justify-between border-border bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Update Adoption</p>
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <ArrowUpCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{ringAdoption}%</h3>
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              Ring users
            </p>
          </div>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${ringAdoption}%` }}></div>
          </div>
        </div>
      </Card>

      <Card className="p-6 flex flex-col justify-between border-border bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Battery</p>
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <BatteryWarning className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{health.lowBattery.percent}%</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {health.lowBattery.count} devices &lt; 20%
            </p>
          </div>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div className="h-full bg-red-500 transition-all" style={{ width: `${health.lowBattery.percent}%` }}></div>
          </div>
        </div>
      </Card>

      <Card className="p-6 flex flex-col justify-between border-border bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Offline &gt; 48h</p>
          <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <WifiOff className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{health.offline.percent}%</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {health.offline.count} devices churned
            </p>
          </div>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${health.offline.percent}%` }}></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
