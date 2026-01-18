import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

interface GoogleCalendarState {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

// Google Calendar API configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export function useGoogleCalendar() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<GoogleCalendarState>({
    isConnected: false,
    isLoading: false,
    isSyncing: false,
    error: null
  });

  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize Google Identity Services
  const initializeGoogleAuth = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured');
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google) {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.access_token) {
              setAccessToken(response.access_token);
              setState(prev => ({ ...prev, isConnected: true }));
              toast({
                title: 'Connected',
                description: 'Successfully connected to Google Calendar'
              });
            }
          },
        });
        setTokenClient(client);
      }
    };
    document.head.appendChild(script);
  }, [toast]);

  // Connect to Google Calendar
  const connect = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      toast({
        title: 'Configuration Required',
        description: 'Google Calendar integration requires API credentials. Please contact support.',
        variant: 'destructive'
      });
      return;
    }

    if (!tokenClient) {
      initializeGoogleAuth();
      // Try again after initialization
      setTimeout(() => {
        if ((window as any).google) {
          const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: (response: any) => {
              if (response.access_token) {
                setAccessToken(response.access_token);
                setState(prev => ({ ...prev, isConnected: true }));
              }
            },
          });
          client.requestAccessToken();
        }
      }, 1000);
    } else {
      tokenClient.requestAccessToken();
    }
  }, [tokenClient, initializeGoogleAuth, toast]);

  // Disconnect from Google Calendar
  const disconnect = useCallback(() => {
    if (accessToken && (window as any).google) {
      (window as any).google.accounts.oauth2.revoke(accessToken);
    }
    setAccessToken(null);
    setState(prev => ({ ...prev, isConnected: false }));
    toast({
      title: 'Disconnected',
      description: 'Google Calendar has been disconnected'
    });
  }, [accessToken, toast]);

  // Fetch events from Google Calendar
  const fetchEvents = useCallback(async (timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> => {
    if (!accessToken) {
      throw new Error('Not connected to Google Calendar');
    }

    setState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin.toISOString()}&` +
        `timeMax=${timeMax.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      setState(prev => ({ ...prev, isSyncing: false }));
      return data.items || [];
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to fetch events'
      }));
      throw error;
    }
  }, [accessToken]);

  // Import events into local database
  const importEvents = useCallback(async (events: CalendarEvent[]) => {
    if (!user) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const eventsToInsert = events.map(event => {
        const startDateTime = event.start.dateTime || event.start.date || new Date().toISOString();
        const endDateTime = event.end.dateTime || event.end.date || startDateTime;
        
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        return {
          user_id: user.id,
          title: event.summary || 'Untitled Event',
          event_date: startDate.toISOString().split('T')[0],
          start_time: startDate.toTimeString().slice(0, 5),
          end_time: endDate.toTimeString().slice(0, 5),
          recurrence_type: 'one_time',
          is_completed: false
        };
      });

      const { error } = await supabase
        .from('events')
        .insert(eventsToInsert);

      if (error) throw error;

      toast({
        title: 'Events Imported',
        description: `Successfully imported ${events.length} events from Google Calendar`
      });

      setState(prev => ({ ...prev, isSyncing: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to import events'
      }));
      toast({
        title: 'Import Failed',
        description: 'Failed to import events from Google Calendar',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast]);

  // Sync events for the current week
  const syncCurrentWeek = useCallback(async () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    try {
      const events = await fetchEvents(startOfWeek, endOfWeek);
      if (events.length > 0) {
        await importEvents(events);
      } else {
        toast({
          title: 'No Events Found',
          description: 'No events to import for this week'
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }, [fetchEvents, importEvents, toast]);

  return {
    ...state,
    connect,
    disconnect,
    fetchEvents,
    importEvents,
    syncCurrentWeek,
    isConfigured: !!GOOGLE_CLIENT_ID
  };
}