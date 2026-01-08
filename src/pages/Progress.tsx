import AppLayout from '@/components/layout/AppLayout';

export default function Progress() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="heading-serif text-3xl text-primary matrix-glow mb-2">
          PROGRESS_METRICS
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          // Visualize your goal completion over time
        </p>

        <div className="border border-primary/30 p-8 text-center">
          <p className="text-muted-foreground">
            // CHARTS_MODULE_LOADING...
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Progress visualization with charts coming soon.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
