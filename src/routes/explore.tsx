import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { REGIONS, getRegion, parseBbox, SENSOR_META } from "@/lib/regions";
import {
  RegionSelect,
  DateRangeInputs,
  ConfidenceFilter,
  defaultFilters,
  type FireFilters,
} from "@/components/FireControls";
import { getDetections, fetchFireData, backfillFireData } from "@/lib/firelens.functions";

const FireMap = lazy(() => import("@/components/FireMap"));

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — FireLens" },
      {
        name: "description",
        content:
          "Interactive map of harmonized NASA MODIS and VIIRS fire detections. Pick a region, filter by confidence, and pull fresh data from NASA FIRMS.",
      },
      { property: "og:title", content: "Explore — FireLens" },
      {
        property: "og:description",
        content: "Interactive map of harmonized MODIS and VIIRS fire detections for any region.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

type PullState =
  | { status: "idle" }
  | { status: "running"; done: number; total: number }
  | { status: "done"; stored: number }
  | { status: "error"; message: string };

/** Split a date range into 30-day chunks so each backfill call stays short. */
function monthChunks(start: string, end: string): { start: string; end: string }[] {
  const out: { start: string; end: string }[] = [];
  const cursor = new Date(start + "T00:00:00Z");
  const last = new Date(end + "T00:00:00Z");
  while (cursor <= last) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setUTCDate(chunkEnd.getUTCDate() + 29);
    if (chunkEnd > last) chunkEnd.setTime(last.getTime());
    out.push({
      start: cursor.toISOString().slice(0, 10),
      end: chunkEnd.toISOString().slice(0, 10),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 30);
  }
  return out;
}

function MapFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <span className="font-mono text-xs text-muted-foreground">Loading map…</span>
    </div>
  );
}

function Explore() {
  const [filters, setFilters] = useState<FireFilters>(defaultFilters);
  const [pull, setPull] = useState<PullState>({ status: "idle" });
  const queryClient = useQueryClient();
  const runBackfill = useServerFn(backfillFireData);
  const runFetch = useServerFn(fetchFireData);

  const region = getRegion(filters.regionId);
  const bboxParts = parseBbox(region.bbox);

  const query = useQuery({
    queryKey: [
      "detections",
      filters.regionId,
      filters.startDate,
      filters.endDate,
      filters.confidence.join(","),
    ],
    queryFn: () =>
      getDetections({
        data: {
          ...bboxParts,
          start_date: filters.startDate,
          end_date: filters.endDate,
          confidence: filters.confidence.length ? filters.confidence : undefined,
        },
      }),
  });

  const detections = useMemo(() => query.data ?? [], [query.data]);
  const modisCount = detections.filter((d) => d.sensor === "MODIS").length;
  const percentage = (count: number) =>
    detections.length === 0 ? 0 : Math.round((count / detections.length) * 100);
  const confidenceCounts = {
    low: detections.filter((d) => d.confidence_tier === "low").length,
    nominal: detections.filter((d) => d.confidence_tier === "nominal").length,
    high: detections.filter((d) => d.confidence_tier === "high").length,
  };

  const pullHistory = async () => {
    const chunks = monthChunks(filters.startDate, filters.endDate);
    setPull({ status: "running", done: 0, total: chunks.length });
    let stored = 0;
    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]!;
        const res = await runBackfill({
          data: {
            bbox: region.bbox,
            start_date: chunk.start,
            end_date: chunk.end,
          },
        });
        stored += res.stored;
        setPull({ status: "running", done: i + 1, total: chunks.length });
      }
      await queryClient.invalidateQueries({ queryKey: ["detections"] });
      setPull({ status: "done", stored });
    } catch (err) {
      setPull({ status: "error", message: err instanceof Error ? err.message : "Pull failed" });
    }
  };

  const pullRecent = async () => {
    setPull({ status: "running", done: 0, total: 1 });
    try {
      const res = await runFetch({ data: { bbox: region.bbox, days: 3 } });
      await queryClient.invalidateQueries({ queryKey: ["detections"] });
      setPull({ status: "done", stored: res.stored });
    } catch (err) {
      setPull({ status: "error", message: err instanceof Error ? err.message : "Pull failed" });
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight">Explore</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Harmonized fire detections for {region.name}, {filters.startDate} → {filters.endDate}
          </p>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="space-y-5 lg:sticky lg:top-20 lg:rounded-lg lg:border lg:border-border lg:bg-card lg:p-5">
          <div className="flex flex-wrap items-end gap-4 lg:flex-col lg:items-stretch">
            <RegionSelect
              value={filters.regionId}
              onChange={(regionId) => setFilters((f) => ({ ...f, regionId }))}
            />
            <DateRangeInputs
              startDate={filters.startDate}
              endDate={filters.endDate}
              onStart={(startDate) => setFilters((f) => ({ ...f, startDate }))}
              onEnd={(endDate) => setFilters((f) => ({ ...f, endDate }))}
            />
            <ConfidenceFilter
              value={filters.confidence}
              onChange={(confidence) => setFilters((f) => ({ ...f, confidence }))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 lg:flex-col lg:items-stretch lg:border-x-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Data pull
            </span>
            <button
              type="button"
              onClick={pullRecent}
              disabled={pull.status === "running"}
              className="rounded-md bg-primary px-3 py-1.5 font-sans text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Fetch last 3 days
            </button>
            <button
              type="button"
              onClick={pullHistory}
              disabled={pull.status === "running"}
              className="rounded-md border border-ember bg-ember/10 px-3 py-1.5 font-sans text-xs font-medium text-ember transition-colors hover:bg-ember/20 disabled:opacity-50"
            >
              Load full range from NASA FIRMS
            </button>
            <span className="font-mono text-xs text-muted-foreground" role="status">
              {pull.status === "running" && `Pulling… window ${pull.done}/${pull.total} (this can take a few minutes for long ranges)`}
              {pull.status === "done" && `Stored ${pull.stored.toLocaleString()} detections`}
              {pull.status === "error" && <span className="text-destructive">{pull.message}</span>}
              {pull.status === "idle" && "Live data comes from NASA FIRMS — pulls are safe to re-run."}
            </span>
          </div>
        </aside>

        <div className="mt-6 grid gap-6 lg:mt-0 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="h-[520px] overflow-hidden rounded-lg border border-border lg:h-[620px]">
          <ClientOnly fallback={<MapFallback />}>
            <Suspense fallback={<MapFallback />}>
              <FireMap
                detections={detections}
                center={region.center}
                zoom={region.zoom}
              />
            </Suspense>
          </ClientOnly>
        </div>

        <aside className="space-y-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Detections in view
            </div>
            <div className="mt-1 font-sans text-4xl font-semibold tracking-tight">
              {query.isLoading ? "…" : detections.length.toLocaleString()}
            </div>
            {detections.length >= 20000 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Showing the first 20,000 — narrow the date range for the complete set.
              </p>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            {(Object.keys(SENSOR_META) as Array<keyof typeof SENSOR_META>).map((id) => (
              <div key={id} className="flex items-start gap-2.5">
                <span
                  className="mt-1 inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: SENSOR_META[id].color }}
                />
                <div>
                  <div className="font-sans text-sm font-medium">
                    {SENSOR_META[id].label}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {id === "MODIS" ? modisCount : detections.length - modisCount}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {SENSOR_META[id].description}
                  </div>
                </div>
              </div>
            ))}
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Dot brightness reflects confidence tier; MODIS dots are larger to hint at
              its coarser 1 km pixel.
            </p>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Share of current view
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <div className="font-sans text-xl font-semibold">{percentage(modisCount)}%</div>
                <div className="text-xs text-muted-foreground">MODIS</div>
              </div>
              <div>
                <div className="font-sans text-xl font-semibold">
                  {percentage(detections.length - modisCount)}%
                </div>
                <div className="text-xs text-muted-foreground">VIIRS</div>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {(["low", "nominal", "high"] as const).map((tier) => (
                <div key={tier} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2">
                  <span className="text-xs capitalize text-muted-foreground">{tier}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-ember"
                      style={{ width: `${percentage(confidenceCounts[tier])}%` }}
                    />
                  </span>
                  <span className="w-9 text-right font-mono text-[10px] text-muted-foreground">
                    {percentage(confidenceCounts[tier])}%
                  </span>
                </div>
              ))}
            </div>
            {detections.length === 0 && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Percentages appear when this selection contains stored detections.
              </p>
            )}
          </div>

          {query.isError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              Couldn't load detections. Try again, or run a data pull for this region first.
            </p>
          )}
          {!query.isLoading && !query.isError && detections.length === 0 && (
            <p className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
              No stored detections for this selection yet. Use "Load full range" to pull
              real data from NASA FIRMS.
            </p>
          )}
        </aside>
        </div>
      </div>
    </div>
  );
}
