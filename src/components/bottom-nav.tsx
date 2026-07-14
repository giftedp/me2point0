import { useNavigate } from "@tanstack/react-router";
import { Home, MessageSquare, Calendar, BookOpen, Settings } from "lucide-react";

export function BottomNav({ currentPath }: { currentPath?: string }) {
  const path = currentPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/assistant", label: "Assistant", icon: MessageSquare },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/memory", label: "Memory", icon: BookOpen },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const navigate = useNavigate();

  return (
    <nav className="pointer-events-auto fixed inset-x-0 bottom-4 z-30 flex justify-center">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-5">
        <div className="flex w-full items-center justify-between rounded-3xl border border-border bg-card/95 px-3 py-2 shadow-lift">
          {items.map((it) => {
            const Icon = it.icon as any;
            const active = path === it.to;
            return (
              <button
                key={it.to}
                type="button"
                onClick={() => navigate({ to: it.to })}
                className={
                  "flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs transition " +
                  (active ? "text-brass" : "text-muted-foreground")
                }
                aria-current={active ? "page" : undefined}
              >
                <Icon className={"h-5 w-5 " + (active ? "text-brass" : "text-muted-foreground")} />
                <span className="text-[11px]">{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
