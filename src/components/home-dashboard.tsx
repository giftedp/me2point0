import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Mail, Star, CheckCircle, Bolt, Grid, MessageSquare } from "lucide-react";

import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/profile.functions";
import { getConnectedAccounts, getUnreadEmails } from "@/lib/integrations.functions";

function formatDateTime(d: Date) {
  return d.toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function HomeDashboard({ name }: { name: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const profileFn = useServerFn(getProfile);
  const accountsFn = useServerFn(getConnectedAccounts);
  const emailsFn = useServerFn(getUnreadEmails);

  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => profileFn({ data: undefined }) });
  const accountsQ = useQuery({ queryKey: ["connected-accounts"], queryFn: () => accountsFn({ data: undefined }) });
  const emailsQ = useQuery({ queryKey: ["unread-emails"], queryFn: () => emailsFn({ data: undefined }) });

  const gmail = (accountsQ.data ?? []).find((a: any) => a.account_type === "gmail");
  const cal = (accountsQ.data ?? []).find((a: any) => a.account_type === "google_calendar");

  const topGoalsRaw = profileQ.data?.top_goals ?? "";
  const goals = topGoalsRaw ? topGoalsRaw.split(/\n+/).map((s: string) => s.trim()).filter(Boolean) : [];

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
      <div className="rounded-2xl border border-border bg-card/90 p-4" style={{ backgroundColor: "transparent" }}>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">{formatGreeting(now)},</div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-display font-semibold" style={{ color: "var(--brass)" }}>{`Good ${getDaypart(now)}, ${name}.`}</h2>
            <div className="text-sm text-muted-foreground">{formatDateTime(now)}</div>
          </div>
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
                <div className="text-sm text-muted-foreground">You have calendar connected — view in <Link to="/calendar" className="text-brass">Calendar</Link>.</div>
              ) : (
                <Link to="/settings" className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: "var(--brass)", color: "white" }}>Connect</Link>
              )}
            </div>
          </div>
          {cal && (
            <div className="mt-3 text-sm text-muted-foreground">Today's events are available in Calendar.</div>
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
                {goals.map((g: string, idx: number) => (
                  <li key={idx} className="py-1">{renderGoalWithProgress(g)}</li>
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
          <Link to="/assistant" className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm text-center" style={{ backgroundColor: "transparent" }}>
            Ask me2.0
          </Link>
          <Link to="/memory" className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm text-center">New goal</Link>
          <Link to="/calendar" className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm text-center">See week</Link>
          <Link to="/settings" className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm text-center">Connections</Link>
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
