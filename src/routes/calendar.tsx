import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Clock4, ArrowRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getCalendarEvents } from "@/lib/integrations.functions";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — me2.0" },
      { name: "description", content: "View your upcoming schedule and events in me2.0." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const getCalendarEventsFn = useServerFn(getCalendarEvents);
  const calendarQ = useQuery({
    queryKey: ["calendar-events"],
    queryFn: () => getCalendarEventsFn({ data: undefined }),
  });

  const events = useMemo(() => calendarQ.data?.events ?? [], [calendarQ.data]);
  const hasEvents = events.length > 0;
  const error = calendarQ.data?.error ?? null;

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card/95 p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brass/15 text-brass">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your upcoming events and schedule are ready when your calendar is connected.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-background/80 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock4 className="h-4 w-4 text-brass" />
              <span>Today’s events</span>
            </div>
            {calendarQ.isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading calendar events…</p>
            ) : error ? (
              <p className="mt-3 text-sm text-muted-foreground">{error}</p>
            ) : !hasEvents ? (
              <p className="mt-3 text-sm text-muted-foreground">No events found for today. Connect your Google Calendar to bring your schedule into me2.0.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {events.slice(0, 8).map((event: any) => (
                  <div key={event.id} className="rounded-2xl border border-border bg-card p-3">
                    <div className="font-medium text-foreground">{event.summary}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{formatEventTime(event.start, event.end)}{event.location ? ` · ${event.location}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card/90 p-5">
            <p className="text-sm text-muted-foreground">A connected calendar helps me2.0 surface your schedule, prep for meetings, and suggest better time blocks.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground transition hover:border-brass hover:bg-brass/10 hover:text-brass"
          >
            <ArrowRight className="h-4 w-4" /> {error || !hasEvents ? "Connect Calendar" : "Manage calendar"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatEventTime(start: string, end: string) {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
    return `${startDate.toLocaleTimeString(undefined, timeOptions)} — ${endDate.toLocaleTimeString(undefined, timeOptions)}`;
  } catch {
    return "Time not available";
  }
}
