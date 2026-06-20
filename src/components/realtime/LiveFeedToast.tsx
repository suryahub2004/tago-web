import { toast } from 'sonner';
import { UserRegisteredEvent, OrderCreatedEvent, AlertTriggeredEvent } from '../../types';

export const LiveFeedToast = {
  newUser: (payload: UserRegisteredEvent) => {
    toast.success(`New user: ${payload.name} signed up`, {
      description: `Role: ${payload.role}`,
    });
  },

  newOrder: (payload: OrderCreatedEvent) => {
    toast.info(`New order: ${payload.userName} placed a $${payload.totalAmount} order`, {
      description: `${payload.itemCount} items`,
    });
  },

  criticalAlert: (payload: AlertTriggeredEvent) => {
    toast.error(`⚠️ ${payload.userName}: ${payload.message}`, {
      description: `Severity: ${payload.severity} | Metric: ${payload.alertType}`,
      duration: Number.POSITIVE_INFINITY, // keep until dismissed
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to alerts page or specific user
          window.location.href = '/alerts';
        },
      },
    });
  },

  newWorkoutPlan: (payload: any) => {
    toast.success(`New workout plan created for ${payload.userId}`);
  },

  workoutLogged: (payload: any) => {
    toast.info(`Workout logged by ${payload.userId}`, {
      description: `Duration: ${payload.durationMins} mins | Strain: ${payload.strainScore}`,
    });
  },

  meditationCompleted: (payload: any) => {
    toast.info(`Meditation completed by ${payload.userId}`, {
      description: `Duration: ${payload.durationMins} mins | HRV Delta: +${payload.hrvDelta}ms`,
    });
  },

  newAiInsight: (payload: any) => {
    toast.info(`New AI Insight generated for ${payload.userId}`, {
      description: `Category: ${payload.category}`,
    });
  }
};
