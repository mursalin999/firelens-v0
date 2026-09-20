import { Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/LogoMark";

const FOOTER_LINKS = [
  { to: "/explore", label: "Explore" },
  { to: "/calendar", label: "Calendar" },
  { to: "/compare", label: "Compare" },
  { to: "/about", label: "About" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:px-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-ember">
            <LogoMark className="h-7 w-7" />
            <span className="font-sans text-base font-semibold text-foreground">Emberline</span>
          </div>
          <p className="mt-3 font-sans text-sm font-medium text-foreground">
            Harmonization of MODIS and VIIRS Hot Spots
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Data: NASA FIRMS (Fire Information for Resource Management System) · MODIS NRT · VIIRS NOAA-20 NRT
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={{}}
              className="font-sans text-sm text-muted-foreground transition-colors hover:text-ember"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}