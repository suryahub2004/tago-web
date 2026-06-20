"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Users, Watch, ShoppingCart, Bell } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useState } from "react";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (type: string, endpoint: string) => {
    try {
      setDownloading(type);
      toast.info(`Exporting ${type} report...`);
      
      const response = await api.get(`/admin/reports/${endpoint}`, {
        responseType: 'blob', // Important for file downloads
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      // Create a link element, set its href to the blob URL, and trigger a download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${type.toLowerCase()}-report.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} report downloaded successfully.`);
    } catch (error) {
      console.error(`Error downloading ${type} report:`, error);
      toast.error(`Failed to export ${type} report.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">System Reports</h1>
        <p className="text-muted-foreground mt-2">Export data from Tago for offline analysis.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-zinc-100 font-bold"><Users className="mr-2 h-5 w-5 text-primary" /> Users Report</CardTitle>
            <CardDescription>Export all users and their health profile summary.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => handleExport("Users", "users")}
              disabled={downloading === "Users"}
            >
              <Download className="mr-2 h-4 w-4" /> 
              {downloading === "Users" ? "Downloading..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-zinc-100 font-bold"><Watch className="mr-2 h-5 w-5 text-primary" /> Devices Report</CardTitle>
            <CardDescription>Export all registered devices and battery stats.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => handleExport("Devices", "devices")}
              disabled={downloading === "Devices"}
            >
              <Download className="mr-2 h-4 w-4" /> 
              {downloading === "Devices" ? "Downloading..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-zinc-100 font-bold"><ShoppingCart className="mr-2 h-5 w-5 text-primary" /> Revenue Report</CardTitle>
            <CardDescription>Export all orders and itemized breakdown.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => handleExport("Revenue", "revenue")}
              disabled={downloading === "Revenue"}
            >
              <Download className="mr-2 h-4 w-4" /> 
              {downloading === "Revenue" ? "Downloading..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-zinc-100 font-bold"><Bell className="mr-2 h-5 w-5 text-primary" /> Alerts Report</CardTitle>
            <CardDescription>Export all triggered alerts and statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => handleExport("Alerts", "alerts")}
              disabled={downloading === "Alerts"}
            >
              <Download className="mr-2 h-4 w-4" /> 
              {downloading === "Alerts" ? "Downloading..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
