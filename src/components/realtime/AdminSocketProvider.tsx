"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useAdminSocket } from '../../hooks/useAdminSocket';
import { LiveFeedToast } from './LiveFeedToast';
import { Toaster, toast } from 'sonner';
import { useQueryClient } from "@tanstack/react-query";
import { UserRegisteredEvent, OrderCreatedEvent, AlertTriggeredEvent } from '../../types';

interface AdminSocketContextValue {
  isConnected: boolean;
}

const AdminSocketContext = createContext<AdminSocketContextValue>({ isConnected: false });

export const useAdminSocketContext = () => useContext(AdminSocketContext);

export const AdminSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket, isConnected } = useAdminSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const onNewUser = (payload: UserRegisteredEvent) => {
      LiveFeedToast.newUser(payload);
      // Refresh users table so the new user appears immediately
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    };

    const onNewOrder = (payload: OrderCreatedEvent) => {
      LiveFeedToast.newOrder(payload);
      // Refresh orders kanban and overview stats
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    };

    const onCriticalAlert = (payload: AlertTriggeredEvent) => {
      LiveFeedToast.criticalAlert(payload);
      // Refresh alerts table and the notification bell
      queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications-bell"] });
    };

    const onNewWorkoutPlan = (payload: any) => LiveFeedToast.newWorkoutPlan(payload);
    const onWorkoutLogged = (payload: any) => LiveFeedToast.workoutLogged(payload);
    const onMeditationCompleted = (payload: any) => LiveFeedToast.meditationCompleted(payload);
    const onNewAiInsight = (payload: any) => LiveFeedToast.newAiInsight(payload);

    const onOrderUpdated = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.info(`Order updated`);
    };

    const onDeviceUpdated = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "devices"] });
    };

    // stats_refresh is emitted by the backend after vitals/user/order events are
    // processed by Kafka. Re-fetching overview ensures the dashboard cards stay live.
    const onStatsRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    };

    socket.on('new_user', onNewUser);
    socket.on('order_updated', onOrderUpdated);
    socket.on('device_updated', onDeviceUpdated);
    socket.on('new_order', onNewOrder);
    socket.on('critical_alert', onCriticalAlert);
    socket.on('new_workout_plan', onNewWorkoutPlan);
    socket.on('workout_logged', onWorkoutLogged);
    socket.on('meditation_completed', onMeditationCompleted);
    socket.on('new_ai_insight', onNewAiInsight);
    socket.on('stats_refresh', onStatsRefresh);

    return () => {
      socket.off('new_user', onNewUser);
      socket.off('new_order', onNewOrder);
      socket.off('order_updated', onOrderUpdated);
      socket.off('device_updated', onDeviceUpdated);
      socket.off('critical_alert', onCriticalAlert);
      socket.off('new_workout_plan', onNewWorkoutPlan);
      socket.off('workout_logged', onWorkoutLogged);
      socket.off('meditation_completed', onMeditationCompleted);
      socket.off('new_ai_insight', onNewAiInsight);
      socket.off('stats_refresh', onStatsRefresh);
    };
  }, [socket]);

  return (
    <AdminSocketContext.Provider value={{ isConnected }}>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </AdminSocketContext.Provider>
  );
};
