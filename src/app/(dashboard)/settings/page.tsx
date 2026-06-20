"use client";

import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, KeyRound, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();

  const handleSave = () => {
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and system preferences.</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="bg-muted border border-border rounded-xl p-1">
          <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-slate-600 dark:text-zinc-400">
            <User className="h-4 w-4 mr-2" />
            My Account
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-slate-600 dark:text-zinc-400">
            <Shield className="h-4 w-4 mr-2" />
            System Config
          </TabsTrigger>
          <TabsTrigger value="admins" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-slate-600 dark:text-zinc-400">
            <KeyRound className="h-4 w-4 mr-2" />
            Admin Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-zinc-100 font-bold">Profile Information</CardTitle>
              <CardDescription>Update your personal information and email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input defaultValue={session?.user?.name || "Super Admin"} className="max-w-md" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={session?.user?.email || "admin@tago.io"} className="max-w-md" disabled />
              </div>
              <Button onClick={handleSave} className="mt-4"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-zinc-100 font-bold">System Configuration</CardTitle>
              <CardDescription>Manage global platform settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">System configuration is currently managed via environment variables.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-zinc-100 font-bold">Admin Users</CardTitle>
              <CardDescription>Manage who has access to the superadmin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Feature coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
