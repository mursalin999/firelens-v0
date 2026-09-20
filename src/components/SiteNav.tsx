import { Link, useRouterState } from "@tanstack/react-router";
import { LogoMark } from "@/components/LogoMark";

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
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark className="h-7 w-7 text-ember" />
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
