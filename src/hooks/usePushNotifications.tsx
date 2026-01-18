import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
  isPWA: boolean;
}

export function usePushNotifications() {
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    permission: 'default',
    isLoading: false,
    isPWA: false
  });

  // Check if running as PWA and if push notifications are supported
  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    const permission = isSupported ? Notification.permission : 'default';
    
    // Check if running as installed PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
      isEnabled: permission === 'granted',
      isPWA
    }));

    // Register service worker on load
    if (isSupported) {
      registerServiceWorker();
    }
  }, []);

  // Register service worker
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('[Push] Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
      return null;
    }
  };

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser. Try installing the app to your home screen.',
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
        // Ensure service worker is registered
        await registerServiceWorker();
        
        toast({
          title: 'Notifications Enabled',
          description: 'You\'ll receive reminders for events and goals on your phone'
        });
        
        // Send a test notification
        setTimeout(() => {
          sendNotification('DisciplineOS', {
            body: 'Push notifications are now active! 🎯',
            tag: 'welcome'
          });
        }, 1000);
        
        return true;
      } else if (permission === 'denied') {
        toast({
          title: 'Notifications Blocked',
          description: 'Please enable notifications in your browser or phone settings',
          variant: 'destructive'
        });
      }
      return false;
    } catch (error) {
      console.error('[Push] Error requesting permission:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Error',
        description: 'Failed to enable notifications',
        variant: 'destructive'
      });
      return false;
    }
  }, [state.isSupported, toast]);

  // Send a local notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!state.isEnabled) {
      console.warn('[Push] Notifications not enabled');
      return;
    }

    try {
      // Use service worker for better mobile support
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            requireInteraction: true,
            ...options
          });
        });
      } else {
        // Fallback to basic notification
        new Notification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options
        });
      }
    } catch (error) {
      console.error('[Push] Error sending notification:', error);
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
      console.warn('[Push] Scheduled time is in the past');
      return null;
    }

    // For mobile, use setTimeout (service worker will handle persistence)
    const timeoutId = setTimeout(() => {
      sendNotification(title, { 
        body, 
        tag: id,
        data: { url: '/schedule' }
      });
    }, delay);

    // Store in localStorage for persistence across page reloads
    try {
      const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
      scheduledNotifications.push({
        id,
        title,
        body,
        scheduledTime: scheduledTime.toISOString()
      });
      localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
    } catch (e) {
      console.error('[Push] Error storing scheduled notification:', e);
    }

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
      '⏰ Upcoming Event',
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
      '🎯 Goal Deadline Today',
      `Today is the deadline for: ${goalTitle}`,
      deadlineDate,
      `goal-${goalId}`
    );
  }, [scheduleNotification]);

  // Schedule daily motivation reminder
  const scheduleDailyReminder = useCallback((hour: number = 8, minute: number = 0) => {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    return scheduleNotification(
      '🌅 Good Morning!',
      'Check your goals and start your day with discipline',
      reminderTime,
      'daily-reminder'
    );
  }, [scheduleNotification]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: false }));
    localStorage.removeItem('scheduledNotifications');
    toast({
      title: 'Notifications Disabled',
      description: 'You will no longer receive push notifications'
    });
  }, [toast]);

  // Check and restore scheduled notifications on app load
  useEffect(() => {
    if (!state.isEnabled) return;

    try {
      const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
      const now = new Date();
      
      // Filter out past notifications and reschedule future ones
      const futureNotifications = scheduledNotifications.filter((n: any) => {
        const scheduledTime = new Date(n.scheduledTime);
        if (scheduledTime > now) {
          scheduleNotification(n.title, n.body, scheduledTime, n.id);
          return true;
        }
        return false;
      });
      
      localStorage.setItem('scheduledNotifications', JSON.stringify(futureNotifications));
    } catch (e) {
      console.error('[Push] Error restoring notifications:', e);
    }
  }, [state.isEnabled, scheduleNotification]);

  return {
    ...state,
    requestPermission,
    sendNotification,
    scheduleNotification,
    scheduleEventReminder,
    scheduleGoalReminder,
    scheduleDailyReminder,
    disableNotifications
  };
}