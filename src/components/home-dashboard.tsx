import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Mail, Star, MessageSquare, PlusCircle, Settings } from "lucide-react";

import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/profile.functions";
import { getConnectedAccounts, getUnreadEmails, getCalendarEvents } from "@/lib/integrations.functions";
import { getGoals } from "@/lib/goals.functions";

function formatDateTime(d: Date) {
  // Produce: "Monday, July 14 · 10:42 AM"
  const datePart = d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timePart = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

export function HomeDashboard({ name }: { name: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nav = useNavigate();
  const profileFn = useServerFn(getProfile);
  const accountsFn = useServerFn(getConnectedAccounts);
  const emailsFn = useServerFn(getUnreadEmails);

  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => profileFn({ data: undefined }) });
  const accountsQ = useQuery({ queryKey: ["connected-accounts"], queryFn: () => accountsFn({ data: undefined }) });
  const emailsQ = useQuery({ queryKey: ["unread-emails"], queryFn: () => emailsFn({ data: undefined }) });
  const calQ = useQuery({ queryKey: ["calendar-events"], queryFn: () => getCalendarEvents({ data: undefined }) });
  const goalsQ = useQuery({ queryKey: ["goals"], queryFn: () => getGoals({ data: undefined }) });

  const gmail = (accountsQ.data ?? []).find((a: any) => a.account_type === "gmail");
  const cal = (accountsQ.data ?? []).find((a: any) => a.account_type === "google_calendar");

  const goals = (goalsQ.data ?? []) as Array<{ id: string; title: string; progress: number; is_active: boolean }>;

  const focusAreas = (profileQ.data?.focus_areas as string[]) ?? [];

  const rotatingThoughts = [
    "Small consistent actions beat occasional intense motivation.",
    "Prioritize the few things that move the needle.",
    "A clear plan makes decisions easier.",
  ];
  const thought = useMemo(() => rotatingThoughts[Math.floor(Date.now() / 1000 / 10) % rotatingThoughts.length], []);

  return (
    <div className="space-y-4">
      {/* 0. Header */}
      <div className="rounded-2xl border border-border bg-card/90 p-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-semibold" style={{ color: "var(--brass)" }}>{`${formatGreeting(now)}, ${name}.`}</h1>
          <div className="text-sm text-muted-foreground">{formatDateTime(now)}</div>
        </div>
      </div>

      {/* Cards stack */}
      <div className="space-y-3">
        {/* 1. Calendar card */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-brass/10 flex items-center justify-center text-brass"><Calendar className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--brass)" }}>Your calendar</div>
                <div className="text-xs text-muted-foreground">{cal ? "Connected" : "Not connected"}</div>
              </div>
            </div>
            <div>
              {cal ? (
                <Link to="/calendar" className="text-brass">View calendar</Link>
              ) : (
                <Link to="/settings" className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: "var(--brass)", color: "white" }}>Connect</Link>
              )}
            </div>
          </div>
          {!cal && (
            <div className="mt-3 text-sm text-muted-foreground">Connect your calendar so I can see what your day looks like.</div>
          )}
          {cal && (
            <div className="mt-3 text-sm">
              {calQ.data?.events?.length ? (
                <ul className="list-disc pl-4 text-sm text-muted-foreground">
                  {calQ.data.events.map((e: any) => (
                    <li key={e.id} className="py-1">{e.summary} — {new Date(e.start).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No events today.</div>
              )}
            </div>
          )}
        </div>

        {/* 2. Important emails */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-brass/10 flex items-center justify-center text-brass"><Mail className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--brass)" }}>Important emails</div>
                <div className="text-xs text-muted-foreground">{gmail ? "Gmail connected" : "Not connected"}</div>
              </div>
            </div>
            <div>
              {gmail ? (
                <Link to="/assistant" className="text-brass">View</Link>
              ) : (
                <Link to="/settings" className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: "var(--brass)", color: "white" }}>Connect</Link>
              )}
            </div>
          </div>
          {!gmail && (
            <div className="mt-3 text-sm text-muted-foreground">Connect Gmail so I can flag what actually matters.</div>
          )}
          {gmail && (
            <div className="mt-3 text-sm">
              {(emailsQ.data?.emails ?? []).slice(0,3).map((e: any, i: number) => (
                <div key={i} className="py-1 text-xs text-muted-foreground">• {e.subject ?? e.snippet ?? "(no subject)"}</div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Goals in progress */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-brass/10 flex items-center justify-center text-brass"><TargetIcon /></div>
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--brass)" }}>Goals in progress</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {goals.length > 0 ? (
              <ul className="list-disc pl-4">
                {goals.map((g) => (
                  <li key={g.id} className="py-1">{g.title} — {g.progress}%</li>
                ))}
              </ul>
            ) : (
              <div>No active goals yet — add one whenever you're ready.</div>
            )}
          </div>
        </div>

        {/* 4. Top priorities */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-brass/10 flex items-center justify-center text-brass"><Star className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--brass)" }}>Top priorities</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {focusAreas.length > 0 ? (
              <ul className="list-disc pl-4">
                {focusAreas.map((f: string, i: number) => <li key={i} className="py-1">{f}</li>)}
              </ul>
            ) : (
              <div>No priorities set yet.</div>
            )}
          </div>
        </div>

        {/* 5. Thought for today */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-sm font-medium" style={{ color: "var(--brass)" }}>A thought for today</div>
          <div className="mt-2 text-sm italic text-muted-foreground">{thought}</div>
        </div>

        {/* 6. Quick actions row */}
        <div className="flex gap-3">
          <button
            onClick={() => nav({ to: "/assistant" })}
            className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{ border: "1px solid var(--border)" }}
          >
            <MessageSquare className="h-4 w-4 text-brass" /> Ask me2.0
          </button>
          <button
            onClick={() => nav({ to: "/memory" })}
            className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{ border: "1px solid var(--border)" }}
          >
            <PlusCircle className="h-4 w-4 text-brass" /> New goal
          </button>
          <button
            onClick={() => nav({ to: "/calendar" })}
            className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{ border: "1px solid var(--border)" }}
          >
            <Calendar className="h-4 w-4 text-brass" /> See week
          </button>
          <button
            onClick={() => nav({ to: "/settings" })}
            className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{ border: "1px solid var(--border)" }}
          >
            <Settings className="h-4 w-4 text-brass" /> Connections
          </button>
        </div>
      </div>
    </div>
  );
}

function formatGreeting(d: Date) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDaypart(d: Date) {
  const h = d.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function renderGoalWithProgress(g: string) {
  const m = g.match(/(.*)\s+[-–—]\s*(\d+)%?$/);
  if (m) {
    const title = m[1].trim();
    const pct = m[2];
    return <>{title} — {pct}%</>;
  }
  // fallback: show with 0%
  return <>{g} — 0%</>;
}

function TargetIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brass"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5"/></svg>;
}

export default HomeDashboard;
