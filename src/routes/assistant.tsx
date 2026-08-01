import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, RefreshCcw, Send, Sparkle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { clearHistory, getHistory, sendMessage } from "@/lib/chat.functions";

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
  const qc = useQueryClient();
  const getHistoryFn = useServerFn(getHistory);
  const sendMessageFn = useServerFn(sendMessage);
  const clearHistoryFn = useServerFn(clearHistory);

  const historyQ = useQuery({
    queryKey: ["assistant-history"],
    queryFn: () => getHistoryFn({ data: undefined }),
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => sendMessageFn({ data: { text } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["assistant-history"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => clearHistoryFn({ data: undefined }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["assistant-history"] });
    },
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => historyQ.data ?? [], [historyQ.data]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sendMutation.isSuccess]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate(text);
  }

  async function handleClear() {
    if (!confirm("Clear this conversation? me2.0 will forget the current chat history.")) return;
    await clearMutation.mutateAsync();
  }

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card/95 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brass/15 text-brass">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Assistant</h1>
              <p className="mt-1 text-sm text-muted-foreground">Ask me2.0 questions, get summaries, or brainstorm your next step.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground transition hover:border-brass hover:bg-brass/10 hover:text-brass"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <button
              type="button"
              onClick={handleClear}
              disabled={clearMutation.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-brass hover:bg-brass/10 hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw className="h-4 w-4" /> Clear
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-3xl border border-border bg-background/80 p-4 text-sm text-muted-foreground">
            {historyQ.isPending ? (
              "Loading messages..."
            ) : messages.length === 0 ? (
              "Start a conversation to see your chat history here. me2.0 will keep the context for your next question."
            ) : null}
          </div>

          <div className="min-h-[320px] overflow-hidden rounded-3xl border border-border bg-background/90">
            <div ref={scrollRef} className="max-h-[48rem] space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    "rounded-3xl border px-4 py-3 text-sm " +
                    (msg.role === "assistant"
                      ? "border-border bg-slate-950/5 text-foreground"
                      : "border-border/70 bg-brass/10 text-foreground")
                  }
                >
                  <div className="mb-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {msg.role === "assistant" ? "Assistant" : "You"}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-3xl border border-border bg-card/90 p-4" onSubmit={handleSubmit}>
            <label htmlFor="assistant-input" className="sr-only">
              Send a message to me2.0
            </label>
            <div className="space-y-3">
              <textarea
                id="assistant-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                placeholder="Ask me2.0 something..."
                className="w-full resize-none rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brass focus:ring-2 focus:ring-brass/10"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">Need ideas? Try: “Help me prioritize my day.”</div>
                <button
                  type="submit"
                  disabled={!input.trim() || sendMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-brass px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" /> {sendMutation.isPending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
