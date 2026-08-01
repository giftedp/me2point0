import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Home, MessageSquare, Calendar, BookOpen, Settings } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/assistant", label: "Chat", icon: MessageSquare },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/memory", label: "Memory", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function TopNav({ currentPath }: { currentPath?: string }) {
  const path = currentPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  // Publish the real nav height so page content can reserve exactly that much space.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const apply = () => {
      document.documentElement.style.setProperty("--top-nav-height", `${el.offsetHeight}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--top-nav-height");
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-1 px-3 py-2 sm:gap-2 sm:px-5 sm:py-3">
        {items.map((it) => {
          const Icon = it.icon;
          const active = path === it.to;
          return (
            <button
              key={it.to}
              type="button"
              onClick={() => navigate({ to: it.to })}
              aria-current={active ? "page" : undefined}
              className={
                "flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs transition-colors sm:flex-row sm:gap-2 sm:px-4 " +
                (active
                  ? "bg-terracotta text-terracotta-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate text-[11px] font-medium sm:text-sm">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default TopNav;
