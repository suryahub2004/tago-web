"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Loader2, User, Search, Package, Watch, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Listen for cmd+k or /
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: results, isLoading } = useQuery({
    queryKey: ["admin", "search", query],
    queryFn: async () => {
      if (!query) return null;
      const res = await axios.get(`/admin/search?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    enabled: query.length > 1,
  });

  const onSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search users, orders, devices..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && <div className="p-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
        {!isLoading && query && (!results || Object.values(results).every((arr: any) => arr.length === 0)) && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        
        {results?.users?.length > 0 && (
          <CommandGroup heading="Users">
            {results.users.map((user: any) => (
              <CommandItem key={user.id} onSelect={() => onSelect(`/users`)}>
                <User className="mr-2 h-4 w-4" />
                <span>{user.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{user.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.devices?.length > 0 && (
          <CommandGroup heading="Devices">
            {results.devices.map((device: any) => (
              <CommandItem key={device.id} onSelect={() => onSelect(`/devices`)}>
                <Watch className="mr-2 h-4 w-4" />
                <span>{device.deviceSerial}</span>
                <span className="ml-2 text-xs text-muted-foreground">{device.deviceType}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.orders?.length > 0 && (
          <CommandGroup heading="Orders">
            {results.orders.map((order: any) => (
              <CommandItem key={order.id} onSelect={() => onSelect(`/shop`)}>
                <Package className="mr-2 h-4 w-4" />
                <span>Order #{order.id.slice(0, 8)}</span>
                <span className="ml-2 text-xs text-muted-foreground">{order.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
