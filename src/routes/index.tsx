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
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="border-b border-border py-20 sm:py-28">
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

      <footer className="border-t border-border py-8 font-mono text-xs text-muted-foreground">
        Data: NASA FIRMS (Fire Information for Resource Management System) · MODIS NRT ·
        VIIRS NOAA-20 NRT
      </footer>
    </div>
  );
}
