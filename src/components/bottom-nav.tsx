import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Home, MessageSquare, Calendar, BookOpen, Settings } from "lucide-react";

export function BottomNav({ currentPath }: { currentPath?: string }) {
  const path = currentPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const navRef = useRef<HTMLElement>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Publish the real nav height so page content can reserve exactly that much space.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const apply = () => {
      document.documentElement.style.setProperty("--bottom-nav-height", `${el.offsetHeight}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--bottom-nav-height");
    };
  }, []);

  // On mobile, hide the bar while the on-screen keyboard is up so the composer stays visible.
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
    if (!vv) return;
    const onResize = () => setKeyboardOpen(window.innerHeight - vv.height > 150);
    onResize();
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/assistant", label: "Assistant", icon: MessageSquare },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/memory", label: "Memory", icon: BookOpen },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const navigate = useNavigate();

  if (keyboardOpen) return null;

  return (
    <nav
      ref={navRef}
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 flex justify-center px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3"
    >
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2">
        <div className="flex w-full items-center justify-between rounded-3xl border border-border bg-card/95 px-3 py-2 shadow-lift backdrop-blur">

          {items.map((it) => {
            const Icon = it.icon as any;
            const active = path === it.to;
            return (
              <button
                key={it.to}
                type="button"
                onClick={() => navigate({ to: it.to })}
                className={
                  "flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs transition-all duration-200 " +
                  (active
                    ? "text-brass bg-brass/10 shadow-brass"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/80")
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
