import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar as CalendarIcon, Clock4, ArrowRight } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/95 p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brass/15 text-brass">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
            <p className="mt-1 text-sm text-muted-foreground">Keep your day in view and connect events from your calendar.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background/80 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock4 className="h-4 w-4 text-brass" />
              <span>Next event</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">No calendar data connected yet. Connect Google Calendar in Settings to see events here.</p>
          </div>
          <div className="rounded-3xl border border-border bg-background/80 p-5">
            <p className="text-sm text-muted-foreground">This page will show your upcoming meetings, deadlines, and time blocks in a clean weekly view.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground transition hover:border-brass hover:bg-brass/10 hover:text-brass"
          >
            <ArrowRight className="h-4 w-4" /> Connect Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
