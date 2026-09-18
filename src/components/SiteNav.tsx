import { Link, useRouterState } from "@tanstack/react-router";

const NAV_ITEMS = [
  { to: "/", label: "FireLens" },
  { to: "/explore", label: "Explore" },
  { to: "/calendar", label: "Calendar" },
  { to: "/compare", label: "Compare" },
  { to: "/about", label: "About & Data" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-ember" aria-hidden />
          <span className="font-sans text-base font-semibold tracking-tight">FireLens</span>
          <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
            MODIS × VIIRS
          </span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          {NAV_ITEMS.filter((i) => i.to !== "/").map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                search={{}}
                className={`rounded-md px-2.5 py-1.5 font-sans text-sm transition-colors sm:px-3 ${
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
