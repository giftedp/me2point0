import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MessageSquare, PlusCircle, Settings, Plus, ArrowRight } from "lucide-react";

import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/profile.functions";
import { getGoals, createGoal } from "@/lib/goals.functions";

function ProgressRing({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-terracotta-soft" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-terracotta"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
        {pct}%
      </span>
    </div>
  );
}

export function HomeDashboard({ name }: { name: string }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const profileFn = useServerFn(getProfile);
  const goalsFn = useServerFn(getGoals);
  const createGoalFn = useServerFn(createGoal);

  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => profileFn({ data: undefined }) });
  const goalsQ = useQuery({ queryKey: ["goals"], queryFn: () => goalsFn({ data: undefined }) });

  const goals = (goalsQ.data ?? []) as Array<{ id: string; title: string; progress: number; is_active: boolean }>;
  const focusAreas = (profileQ.data?.focus_areas as string[]) ?? [];

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const addGoal = useMutation({
    mutationFn: (t: string) => createGoalFn({ data: { title: t } }),
    onSuccess: () => {
      setTitle("");
      setAdding(false);
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const insights = [
    "Small consistent actions beat occasional intense motivation.",
    "Prioritise the few things that actually move the needle today.",
    "A clear plan makes every decision easier.",
  ];
  const insight = useMemo(() => insights[Math.floor(Date.now() / 1000 / 30) % insights.length], []);

  const quickActions = [
    { label: "Ask me2.0", icon: MessageSquare, to: "/assistant" as const },
    { label: "New goal", icon: PlusCircle, onClick: () => setAdding(true) },
    { label: "See week", icon: Calendar, to: "/calendar" as const },
    { label: "Connections", icon: Settings, to: "/settings" as const },
  ];

  return (
    <div className="space-y-8 pt-4">
      {/* Greeting */}
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {greeting()}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{name}</h1>
      </header>

      {/* Insight card */}
      <section className="rounded-3xl bg-terracotta-soft p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">Today's insight</p>
        <p className="mt-2 text-base leading-relaxed text-foreground sm:text-lg">{insight}</p>
        <button
          type="button"
          onClick={() => nav({ to: "/assistant" })}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:opacity-80"
        >
          Talk it through <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              type="button"
              onClick={() => (a.to ? nav({ to: a.to }) : a.onClick?.())}
              className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card px-3 py-4 text-center transition-colors hover:bg-secondary"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta-soft text-terracotta">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">{a.label}</span>
            </button>
          );
        })}
      </section>

      {/* Goals */}
      <section className="space-y-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              What matters most
            </p>
            <h2 className="truncate text-2xl font-semibold tracking-tight text-foreground">Your goals</h2>
          </div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-terracotta-foreground shadow-soft hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add goal
          </button>
        </div>

        {adding && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) addGoal.mutate(title.trim());
            }}
            className="flex gap-2 rounded-3xl border border-border bg-card p-3"
          >
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              className="min-w-0 flex-1 rounded-2xl bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={addGoal.isPending || !title.trim()}
              className="shrink-0 rounded-2xl bg-terracotta px-4 py-2 text-sm font-medium text-terracotta-foreground disabled:opacity-50"
            >
              Save
            </button>
          </form>
        )}

        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
              No goals yet — add the first thing that matters most.
            </div>
          ) : (
            goals.map((g, i) => (
              <article
                key={g.id}
                className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 sm:p-5"
              >
                <ProgressRing value={g.progress ?? 0} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                    {focusAreas[i % Math.max(focusAreas.length, 1)] ?? "Focus"}
                  </p>
                  <h3 className="truncate text-base font-semibold text-foreground">{g.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {g.progress >= 100 ? "Complete — nice work." : `${100 - (g.progress ?? 0)}% to go`}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default HomeDashboard;
