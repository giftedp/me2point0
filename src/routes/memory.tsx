import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Sparkle, PlusCircle, Plus, CheckCircle2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createGoal, getGoals, updateGoal } from "@/lib/goals.functions";

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
  const qc = useQueryClient();
  const getGoalsFn = useServerFn(getGoals);
  const createGoalFn = useServerFn(createGoal);
  const updateGoalFn = useServerFn(updateGoal);

  const goalsQ = useQuery({
    queryKey: ["memory-goals"],
    queryFn: () => getGoalsFn({ data: undefined }),
  });

  const createMutation = useMutation({
    mutationFn: async (title: string) => createGoalFn({ data: { title } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["memory-goals"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => updateGoalFn({ data: { id, progress: 100, is_active: false } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["memory-goals"] });
    },
  });

  const [title, setTitle] = useState("");

  const goals = useMemo(() => goalsQ.data ?? [], [goalsQ.data]);

  async function handleCreateGoal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || createMutation.isPending) return;
    setTitle("");
    await createMutation.mutateAsync(trimmed);
  }

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card/95 p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brass/15 text-brass">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Memory</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track goals, progress, and notes that me2.0 can use to keep you on course.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-background/80 p-5">
            {goalsQ.isPending ? (
              <p className="text-sm text-muted-foreground">Loading your goals…</p>
            ) : goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">You don't have any goals yet. Add one below and check progress over time.</p>
            ) : (
              <div className="space-y-3">
                {goals.map((goal: any) => (
                  <div key={goal.id} className="rounded-3xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-foreground">{goal.title}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Progress: {goal.progress}%</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => completeMutation.mutate(goal.id)}
                        disabled={completeMutation.isPending || goal.progress === 100}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4 text-brass" /> Complete
                      </button>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-brass" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className="rounded-3xl border border-border bg-card/90 p-5" onSubmit={handleCreateGoal}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <label htmlFor="new-goal" className="text-sm font-medium text-foreground">
                  New goal
                </label>
                <input
                  id="new-goal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add a goal to remember what matters most"
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brass focus:ring-2 focus:ring-brass/10"
                />
              </div>
              <button
                type="submit"
                disabled={!title.trim() || createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-full bg-brass px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" /> Add goal
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Goals you add here can be referenced across me2.0 to keep your tasks aligned.</p>
          </form>
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
