import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Sparkle } from "lucide-react";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant — me2.0" },
      { name: "description", content: "Ask your AI assistant anything in me2.0." },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/95 p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brass/15 text-brass">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Assistant</h1>
            <p className="mt-1 text-sm text-muted-foreground">Chat with me2.0 and get instant help with tasks, decisions, and ideas.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-background/80 p-5">
            <p className="text-sm text-foreground/80">The assistant is ready. Send a message from the home composer or continue here once you have an active session.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card/90 p-5">
              <h2 className="text-lg font-semibold text-foreground">Quick prompts</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Summarize my day and next steps.</li>
                <li>• Draft a message for stakeholders.</li>
                <li>• Help me plan tomorrow's priorities.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-border bg-card/90 p-5">
              <h2 className="text-lg font-semibold text-foreground">Need inspiration?</h2>
              <p className="mt-3 text-sm text-muted-foreground">Ask the assistant for productivity, emails, meetings, or goal planning with a single click.</p>
            </div>
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
