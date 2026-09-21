import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FireLens — One Earth. Two satellites. One clearer picture." },
      {
        name: "description",
        content:
          "FireLens harmonizes NASA MODIS and VIIRS satellite fire detections into a single burning-activity calendar for any region — built by Team Emberline for NASA Space Apps Challenge 2026.",
      },
      { property: "og:title", content: "FireLens — One Earth. Two satellites. One clearer picture." },
      {
        property: "og:description",
        content:
          "Two satellite fire records with different confidence systems and resolutions, unified into one burning-activity calendar for emergency responders, scientists, and land managers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <section className="border-b border-border py-20 sm:py-28 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center lg:gap-16 lg:py-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ember">
            Team Emberline · NASA Space Apps Challenge 2026
          </p>
          <h1 className="mt-6 max-w-3xl font-sans text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            One Earth. Two satellites.
            <br />
            One clearer picture.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            NASA's MODIS and VIIRS instruments both detect fires from orbit — but they
            report different confidence systems, at different pixel sizes, in different
            formats. FireLens harmonizes both records into one burning-activity calendar
            for any region you select, so responders, scientists, and land managers can
            read historical fire patterns — and spot unusual conditions — in seconds.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/explore"
              search={{}}
              className="rounded-md bg-ember px-6 py-3 font-sans text-sm font-semibold text-ember-foreground transition-opacity hover:opacity-90"
            >
              Explore fire activity →
            </Link>
            <Link
              to="/about"
              search={{}}
              className="font-sans text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              How to read this data
            </Link>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card lg:block" aria-hidden="true">
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="absolute inset-8 border-l border-b border-border">
            <div className="absolute left-[12%] top-[62%] h-2.5 w-2.5 rounded-full bg-ember shadow-[0_0_0_8px_color-mix(in_oklab,var(--color-ember)_15%,transparent)]" />
            <div className="absolute left-[37%] top-[26%] h-2 w-2 rounded-full bg-steel shadow-[0_0_0_7px_color-mix(in_oklab,var(--color-steel)_15%,transparent)]" />
            <div className="absolute left-[64%] top-[48%] h-3 w-3 rounded-full bg-ember shadow-[0_0_0_10px_color-mix(in_oklab,var(--color-ember)_15%,transparent)]" />
            <div className="absolute left-[81%] top-[18%] h-2 w-2 rounded-full bg-steel shadow-[0_0_0_7px_color-mix(in_oklab,var(--color-steel)_15%,transparent)]" />
          </div>
          <div className="absolute left-6 top-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Harmonized detection field</div>
          <div className="absolute inset-x-6 bottom-6 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2 font-sans text-sm"><span className="h-2.5 w-2.5 rounded-full bg-ember" />MODIS · 1 km</div>
            <div className="flex items-center gap-2 font-sans text-sm"><span className="h-2.5 w-2.5 rounded-full bg-steel" />VIIRS · 375 m</div>
          </div>
        </div>
      </section>

      <section className="grid gap-10 py-16 sm:grid-cols-3">
        {[
          {
            n: "01",
            title: "Two sensors, one record",
            body: "MODIS sees fires at 1 km resolution; VIIRS at 375 m. FireLens aligns both onto a single timeline, keeping each sensor's original confidence value for transparency.",
          },
          {
            n: "02",
            title: "A calendar of burning",
            body: "Daily detection counts rendered as a heatmap reveal seasonal rhythms — and the days that break them.",
          },
          {
            n: "03",
            title: "Honest about uncertainty",
            body: "Satellite thermal anomalies are not confirmed ground fires. FireLens keeps confidence tiers visible and documents every limitation.",
          },
        ].map((f) => (
          <div key={f.n}>
            <div className="font-mono text-xs text-ember">{f.n}</div>
            <h2 className="mt-2 font-sans text-lg font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
