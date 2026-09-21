import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Database, Layers3, CalendarDays } from "lucide-react";
import { getLiveSnapshot } from "@/lib/firelens.functions";

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
  const snapshot = useQuery({
    queryKey: ["live-snapshot"],
    queryFn: () => getLiveSnapshot(),
  });

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

      <section className="border-b border-border py-10" aria-labelledby="snapshot-heading">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ember">Live Snapshot</p>
            <h2 id="snapshot-heading" className="mt-2 font-sans text-2xl font-semibold">
              What FireLens currently holds
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              These totals come directly from stored NASA FIRMS records and update after each data pull.
            </p>
          </div>
          <div className="grid grid-cols-3 border-y border-border lg:min-w-[620px] lg:border-x">
            {[
              {
                label: "Detections tracked",
                value: snapshot.isLoading ? "…" : snapshot.data?.totalDetections.toLocaleString() ?? "—",
              },
              {
                label: "Active sensors",
                value: snapshot.isLoading ? "…" : `${snapshot.data?.activeSensors ?? 0} / 2`,
              },
              {
                label: "Presets with records",
                value: snapshot.isLoading
                  ? "…"
                  : `${snapshot.data?.regionsCovered ?? 0} / ${snapshot.data?.totalRegions ?? 0}`,
              },
            ].map((item, index) => (
              <div key={item.label} className={`px-3 py-5 sm:px-6 ${index > 0 ? "border-l border-border" : ""}`}>
                <div className="font-sans text-2xl font-semibold sm:text-3xl">{item.value}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        {snapshot.isError && (
          <p className="mt-4 text-xs text-destructive">The live snapshot is temporarily unavailable.</p>
        )}
      </section>

      <section className="border-b border-border py-16" aria-labelledby="workflow-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ember">How it works</p>
            <h2 id="workflow-heading" className="mt-2 font-sans text-2xl font-semibold">
              From orbital signal to readable pattern
            </h2>
          </div>
          <Link to="/about" search={{}} className="hidden items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground sm:flex">
            Read the method <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-3">
          {[
            {
              n: "01",
              title: "NASA FIRMS data",
              body: "MODIS and VIIRS report thermal anomalies with different resolutions and confidence systems.",
              icon: Database,
            },
            {
              n: "02",
              title: "Harmonization",
              body: "FireLens aligns both feeds to one structure while preserving the original sensor details.",
              icon: Layers3,
            },
            {
              n: "03",
              title: "Calendar & insights",
              body: "Daily counts become maps, calendar patterns, and transparent sensor comparisons.",
              icon: CalendarDays,
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ember">{step.n}</span>
                  <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="mt-8 font-sans text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            );
          })}
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
