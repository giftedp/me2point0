import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageSquare, Calendar, BookOpen, Settings } from "lucide-react";

export function BottomNav() {
  const loc = useLocation();
  const path = loc.pathname ?? "/";

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/assistant", label: "Assistant", icon: MessageSquare },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/memory", label: "Memory", icon: BookOpen },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="pointer-events-auto fixed inset-x-0 bottom-4 z-30 flex justify-center">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-5">
        <div className="flex w-full items-center justify-between rounded-3xl border border-border bg-card/95 px-3 py-2 shadow-lift">
          {items.map((it) => {
            const Icon = it.icon as any;
            const active = path === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={
                  "flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs transition " +
                  (active ? "text-brass" : "text-muted-foreground")
                }
                aria-current={active ? "page" : undefined}
              >
                <Icon className={"h-5 w-5 " + (active ? "text-brass" : "text-muted-foreground")} />
                <span className="text-[11px]">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
