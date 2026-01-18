import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
}

export function usePushNotifications() {
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    permission: 'default',
    isLoading: false
  });

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    const permission = isSupported ? Notification.permission : 'default';
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
      isEnabled: permission === 'granted'
    }));
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser',
        variant: 'destructive'
      });
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isEnabled: permission === 'granted',
        isLoading: false
      }));

      if (permission === 'granted') {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications for events and goals'
        });
        
        // Register service worker for push notifications
        await registerServiceWorker();
        return true;
      } else if (permission === 'denied') {
        toast({
          title: 'Notifications Blocked',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive'
        });
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Error',
        description: 'Failed to enable notifications',
        variant: 'destructive'
      });
      return false;
    }
  }, [state.isSupported, toast]);

  // Register service worker
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  // Send a local notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!state.isEnabled) {
      console.warn('Notifications not enabled');
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [state.isEnabled]);

  // Schedule a notification for a specific time
  const scheduleNotification = useCallback((
    title: string,
    body: string,
    scheduledTime: Date,
    id?: string
  ) => {
    if (!state.isEnabled) return null;

    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.warn('Scheduled time is in the past');
      return null;
    }

    const timeoutId = setTimeout(() => {
      sendNotification(title, { body, tag: id });
    }, delay);

    return timeoutId;
  }, [state.isEnabled, sendNotification]);

  // Schedule reminder for an event (15 minutes before)
  const scheduleEventReminder = useCallback((
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventId: string
  ) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const reminderTime = new Date(eventDateTime.getTime() - 15 * 60 * 1000); // 15 mins before

    return scheduleNotification(
      'Upcoming Event',
      `${eventTitle} starts in 15 minutes`,
      reminderTime,
      `event-${eventId}`
    );
  }, [scheduleNotification]);

  // Schedule reminder for a goal deadline
  const scheduleGoalReminder = useCallback((
    goalTitle: string,
    targetDate: string,
    goalId: string
  ) => {
    const deadlineDate = new Date(targetDate);
    // Remind at 9 AM on the target date
    deadlineDate.setHours(9, 0, 0, 0);

    return scheduleNotification(
      'Goal Deadline',
      `Today is the deadline for: ${goalTitle}`,
      deadlineDate,
      `goal-${goalId}`
    );
  }, [scheduleNotification]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: false }));
    toast({
      title: 'Notifications Disabled',
      description: 'You will no longer receive push notifications'
    });
  }, [toast]);

  return {
    ...state,
    requestPermission,
    sendNotification,
    scheduleNotification,
    scheduleEventReminder,
    scheduleGoalReminder,
    disableNotifications
  };
}