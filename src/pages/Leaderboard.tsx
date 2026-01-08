import AppLayout from '@/components/layout/AppLayout';

export default function Leaderboard() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="heading-serif text-3xl text-primary matrix-glow mb-2">
          LEADERBOARD
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          // Compete with the community
        </p>

        <div className="border border-primary/30 p-8 text-center">
          <p className="text-muted-foreground">
            // LEADERBOARD_MODULE_LOADING...
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Community leaderboards and rankings coming soon.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
