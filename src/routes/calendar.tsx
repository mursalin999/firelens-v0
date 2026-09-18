import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { REGIONS, parseBbox } from "@/lib/regions";
import { RegionSelect, DateRangeInputs, defaultFilters } from "@/components/FireControls";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { getDailyCounts } from "@/lib/firelens.functions";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Burning Activity Calendar — FireLens" },
      {
        name: "description",
        content:
          "A heatmap calendar of daily satellite fire detections for any region — seasonal patterns and unusual days visible at a glance.",
      },
      { property: "og:title", content: "Burning Activity Calendar — FireLens" },
      {
        property: "og:description",
        content: "Daily MODIS + VIIRS fire detection density rendered as a calendar heatmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

type Mode = "combined" | "MODIS" | "VIIRS";

function CalendarPage() {
  const defaults = defaultFilters();
  const [regionId, setRegionId] = useState(defaults.regionId);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [mode, setMode] = useState<Mode>("combined");

  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];
  const bboxParts = parseBbox(region.bbox);

  const query = useQuery({
    queryKey: ["daily-counts", regionId, startDate, endDate],
    queryFn: () =>
      getDailyCounts({
        data: { ...bboxParts, start_date: startDate, end_date: endDate },
      }),
  });

  const days = query.data ?? [];
  const total = days.reduce((s, d) => s + d.modis + d.viirs, 0);
  const busiest = days.reduce<(typeof days)[number] | null>(
    (best, d) => (d.modis + d.viirs > (best ? best.modis + best.viirs : -1) ? d : best),
    null,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight">
            Burning Activity Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detection density per day for {region.name}. Unusual periods stand out at a glance.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <RegionSelect value={regionId} onChange={setRegionId} />
          <DateRangeInputs
            startDate={startDate}
            endDate={endDate}
            onStart={setStartDate}
            onEnd={setEndDate}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-1.5" role="tablist" aria-label="Sensor view">
        {(["combined", "MODIS", "VIIRS"] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-md border px-3 py-1.5 font-sans text-xs capitalize transition-colors ${
              mode === m
                ? "border-foreground bg-foreground text-background"
                : "border-input bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "combined" ? "Harmonized" : m}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        {query.isLoading && (
          <p className="py-16 text-center font-mono text-xs text-muted-foreground">
            Reading stored detections…
          </p>
        )}
        {query.isError && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            Couldn't load daily counts.
          </p>
        )}
        {!query.isLoading && !query.isError && days.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No stored detections for {region.name} in this range. Open{" "}
            <a href="/explore" className="text-ember underline underline-offset-4">
              Explore
            </a>{" "}
            and run a data pull first.
          </p>
        )}
        {days.length > 0 && (
          <CalendarHeatmap days={days} startDate={startDate} endDate={endDate} mode={mode} />
        )}
      </div>

      {days.length > 0 && (
        <div className="mt-6 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Total detections
            </div>
            <div className="mt-1 font-sans text-3xl font-semibold">{total.toLocaleString()}</div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Active days
            </div>
            <div className="mt-1 font-sans text-3xl font-semibold">{days.length}</div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Busiest day
            </div>
            <div className="mt-1 font-sans text-3xl font-semibold">
              {busiest ? busiest.date : "—"}
            </div>
            {busiest && (
              <div className="font-mono text-xs text-muted-foreground">
                {(busiest.modis + busiest.viirs).toLocaleString()} detections
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
