import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Sparkle, PlusCircle } from "lucide-react";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory — me2.0" },
      { name: "description", content: "Save and review your goals, notes, and memory entries in me2.0." },
    ],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/95 p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brass/15 text-brass">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Memory</h1>
            <p className="mt-1 text-sm text-muted-foreground">Capture goals, ideas, and quick notes that me2.0 can help you remember.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-background/80 p-5">
            <p className="text-sm text-muted-foreground">No memory entries yet. Create your first goal or note and keep your most important tasks top of mind.</p>
          </div>
          <div className="rounded-3xl border border-border bg-background/80 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <PlusCircle className="h-4 w-4 text-brass" />
              <span>New goal</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Add a new goal on the home dashboard or in Settings to start tracking progress.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground transition hover:border-brass hover:bg-brass/10 hover:text-brass"
          >
            <Sparkle className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
