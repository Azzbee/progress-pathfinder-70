import AppLayout from '@/components/layout/AppLayout';

export default function Discipline() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="heading-serif text-3xl text-primary matrix-glow mb-2">
          DISCIPLINE_ANALYSIS
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          // Deep dive into your performance metrics
        </p>

        <div className="border border-primary/30 p-8 text-center">
          <p className="text-muted-foreground">
            // ANALYSIS_MODULE_LOADING...
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Detailed discipline analysis coming soon.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
