import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About, Data & Limitations — FireLens" },
      {
        name: "description",
        content:
          "What FireLens shows, where the data comes from (NASA FIRMS MODIS & VIIRS), and the limitations to keep in mind.",
      },
      { property: "og:title", content: "About, Data & Limitations — FireLens" },
      {
        property: "og:description",
        content: "FireLens data sources, harmonization method, and known limitations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">About & Data Limitations</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        FireLens was built by Team Emberline (Mymensingh, Bangladesh local event) for the NASA
        Space Apps Challenge 2026 challenge “Harmonization of MODIS and VIIRS Hot Spots.”
      </p>

      <section className="mt-10 space-y-4 border-t border-border pt-8">
        <h2 className="font-sans text-xl font-semibold">What you are looking at</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Every dot and every calendar cell is a <em>satellite-detected thermal anomaly</em> — a
          pixel that was unusually hot when the satellite passed over. These are{" "}
          <strong className="text-foreground">not confirmed ground fires</strong>. Industrial
          heat sources, gas flares, and other hot surfaces can also trigger detections.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Data comes from NASA FIRMS (Fire Information for Resource Management System), using the
          MODIS NRT and VIIRS NOAA-20 NRT near-real-time products.
        </p>
      </section>

      <section className="mt-10 space-y-4 border-t border-border pt-8">
        <h2 className="font-sans text-xl font-semibold">The two sensors</h2>
        <dl className="space-y-4 text-sm leading-relaxed">
          <div>
            <dt className="font-sans font-medium text-foreground">MODIS — 1,000 m pixels</dt>
            <dd className="text-muted-foreground">
              Flown on Terra (since 1999) and Aqua (since 2002). Reports confidence as a numeric
              0–100 score. FireLens buckets that score into low / nominal / high —{" "}
              <strong className="text-foreground">
                this bucketing is our rough estimate, not an official NASA definition
              </strong>
              . The original numeric value is always kept alongside.
            </dd>
          </div>
          <div>
            <dt className="font-sans font-medium text-foreground">VIIRS — 375 m pixels</dt>
            <dd className="text-muted-foreground">
              Flown on Suomi NPP, NOAA-20, and NOAA-21. Reports confidence directly as
              low / nominal / high, which FireLens uses unchanged. Finer pixels mean VIIRS detects
              smaller fires and resolves clusters MODIS sees as one.
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-10 space-y-4 border-t border-border pt-8">
        <h2 className="font-sans text-xl font-semibold">Known limitations</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Cloud cover</strong> blocks the sensors entirely —
            a quiet day on the calendar may just be a cloudy day.
          </li>
          <li>
            <strong className="text-foreground">Sun glint</strong> off water or bare ground can
            cause false detections, especially in daytime low-confidence rows.
          </li>
          <li>
            <strong className="text-foreground">Duplicate detections</strong> of the same fire can
            occur when satellites pass at different times or when adjacent pixels both trigger.
          </li>
          <li>
            <strong className="text-foreground">Revisit gaps</strong> — each satellite samples a
            location only a few times per day, so short-lived fires are easily missed.
          </li>
          <li>
            <strong className="text-foreground">Near-real-time latency</strong> — NRT products are
            processed quickly and may be revised in later science-quality releases.
          </li>
        </ul>
      </section>

      <footer className="mt-12 border-t border-border pt-6 font-mono text-xs text-muted-foreground">
        Source: NASA FIRMS · firms.modaps.eosdis.nasa.gov — FireLens never fabricates data; empty
        views mean no pull has run or nothing was detected.
      </footer>
    </div>
  );
}
