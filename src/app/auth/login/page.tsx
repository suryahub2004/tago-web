"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Activity, LockIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid credentials or unauthorized.");
      setLoading(false);
    } else {
      toast.success("Welcome to Tago Superadmin.");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 dark:bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border-border bg-card shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-white p-2 rounded-2xl shadow-lg shadow-primary/20 overflow-hidden h-16 w-16 flex items-center justify-center border border-slate-100">
              <img src="/logo.png" alt="Tago Logo" className="object-contain" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tago
          </CardTitle>
          <CardDescription className="text-muted-foreground/80 font-medium">
            Superadmin Authentication Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Admin Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@tago.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-border focus-visible:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Password
                </Label>
              </div>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-border focus-visible:ring-primary"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-md font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading}>
              {loading ? "Authenticating..." : (
                <span className="flex items-center justify-center">
                  Secure Sign In <LockIcon className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6 pb-2">
          <p className="text-xs text-muted-foreground/60 flex items-center">
            <LockIcon className="h-3 w-3 mr-1" /> End-to-end encrypted session
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
