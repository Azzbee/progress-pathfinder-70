import AppLayout from '@/components/layout/AppLayout';

export default function Schedule() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="heading-serif text-3xl text-primary matrix-glow mb-2">
          SCHEDULE
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          // Weekly calendar and activity planning
        </p>

        <div className="border border-primary/30 p-8 text-center">
          <p className="text-muted-foreground">
            // CALENDAR_MODULE_LOADING...
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Schedule feature with Google Calendar sync coming soon.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
