import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { REGIONS, getRegion, parseBbox, SENSOR_META, type SensorId } from "@/lib/regions";
import { RegionSelect, DateRangeInputs, defaultFilters } from "@/components/FireControls";
import { getDetections, getDailyCounts } from "@/lib/firelens.functions";

const FireMap = lazy(() => import("@/components/FireMap"));

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Sensor Comparison — FireLens" },
      {
        name: "description",
        content:
          "MODIS-only, VIIRS-only, or harmonized — see how the two satellite fire records differ and why they don't always agree.",
      },
      { property: "og:title", content: "Sensor Comparison — FireLens" },
      {
        property: "og:description",
        content: "Compare MODIS and VIIRS fire detections side by side, or harmonized together.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Compare,
});

type Mode = SensorId | "combined";

function Compare() {
  const defaults = defaultFilters();
  const [regionId, setRegionId] = useState(defaults.regionId);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [mode, setMode] = useState<Mode>("combined");

  const region = getRegion(regionId);
  const bboxParts = parseBbox(region.bbox);
  const sensors = mode === "combined" ? undefined : [mode];

  const mapQuery = useQuery({
    queryKey: ["compare-map", regionId, startDate, endDate, mode],
    queryFn: () =>
      getDetections({
        data: { ...bboxParts, start_date: startDate, end_date: endDate, sensors },
      }),
  });

  const dailyQuery = useQuery({
    queryKey: ["daily-counts", regionId, startDate, endDate],
    queryFn: () =>
      getDailyCounts({ data: { ...bboxParts, start_date: startDate, end_date: endDate } }),
  });

  const detections = mapQuery.data ?? [];
  const days = dailyQuery.data ?? [];
  const modisTotal = days.reduce((s, d) => s + d.modis, 0);
  const viirsTotal = days.reduce((s, d) => s + d.viirs, 0);
  const chartMax = Math.max(1, ...days.map((d) => d.modis + d.viirs));

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight">Sensor Comparison</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Same Earth, two instruments — see where MODIS and VIIRS agree and where they don't.
          </p>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
      <aside className="space-y-5 lg:sticky lg:top-20 lg:rounded-lg lg:border lg:border-border lg:bg-card lg:p-5">
        <div className="flex flex-wrap items-end gap-4 lg:flex-col lg:items-stretch">
          <RegionSelect value={regionId} onChange={setRegionId} />
          <DateRangeInputs
            startDate={startDate}
            endDate={endDate}
            onStart={setStartDate}
            onEnd={setEndDate}
          />
        </div>
      <div className="flex gap-1.5 lg:flex-col" role="tablist" aria-label="Sensor selection">
        {(["MODIS", "VIIRS", "combined"] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-md border px-3 py-1.5 font-sans text-xs transition-colors ${
              mode === m
                ? "border-foreground bg-foreground text-background"
                : "border-input bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "combined" ? "Harmonized (both)" : `${m} only`}
          </button>
        ))}
      </div>
      </aside>

      <div className="mt-6 grid gap-6 lg:mt-0 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="h-[420px] overflow-hidden rounded-lg border border-border lg:h-[620px]">
          <ClientOnly
            fallback={<div className="h-full w-full bg-muted" />}
          >
            <Suspense fallback={<div className="h-full w-full bg-muted" />}>
              <FireMap detections={detections} center={region.center} zoom={region.zoom} />
            </Suspense>
          </ClientOnly>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 font-sans text-sm font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SENSOR_META.MODIS.color }} />
                MODIS
              </div>
              <div className="mt-1 font-sans text-3xl font-semibold">
                {modisTotal.toLocaleString()}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">detections in range</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 font-sans text-sm font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SENSOR_META.VIIRS.color }} />
                VIIRS
              </div>
              <div className="mt-1 font-sans text-3xl font-semibold">
                {viirsTotal.toLocaleString()}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">detections in range</div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 lg:min-h-[260px]">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Daily detections
            </div>
            {days.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No data yet — pull data on the Explore page.
              </p>
            ) : (
              <div className="mt-3 flex h-40 items-end gap-px lg:h-[clamp(200px,28vh,360px)]">
                {days.map((d) => {
                  const mH = (d.modis / chartMax) * 100;
                  const vH = (d.viirs / chartMax) * 100;
                  return (
                    <div
                      key={d.date}
                      className="flex flex-1 flex-col justify-end gap-px"
                      title={`${d.date} — MODIS ${d.modis}, VIIRS ${d.viirs}`}
                    >
                      {(mode === "combined" || mode === "MODIS") && (
                        <div
                          className="w-full rounded-t-[1px]"
                          style={{ height: `${mH}%`, backgroundColor: SENSOR_META.MODIS.color, minHeight: d.modis ? 2 : 0 }}
                        />
                      )}
                      {(mode === "combined" || mode === "VIIRS") && (
                        <div
                          className="w-full rounded-t-[1px]"
                          style={{ height: `${vH}%`, backgroundColor: SENSOR_META.VIIRS.color, minHeight: d.viirs ? 2 : 0 }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-sans text-base font-semibold text-foreground">
              Why don't they always agree?
            </h2>
            <p className="mt-2">
              MODIS sees each spot at ~1 km resolution while VIIRS resolves 375 m — VIIRS often
              splits one MODIS pixel into several detections and catches smaller fires. They also
              pass overhead at different times, so a short-lived fire may appear in one record and
              miss the other. Different confidence systems mean the same pixel can be "high" in one
              record and "nominal" in the other.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
