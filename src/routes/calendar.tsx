import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { REGIONS, getRegion, parseBbox } from "@/lib/regions";
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

  const region = getRegion(regionId);
  const bboxParts = parseBbox(region.bbox);

  const query = useQuery({
    queryKey: ["daily-counts", regionId, startDate, endDate],
    queryFn: () =>
      getDailyCounts({
        data: { ...bboxParts, start_date: startDate, end_date: endDate },
      }),
  });

  const days = query.data ?? [];
  const countForMode = (day: (typeof days)[number]) =>
    mode === "MODIS" ? day.modis : mode === "VIIRS" ? day.viirs : day.modis + day.viirs;
  const total = days.reduce((sum, day) => sum + countForMode(day), 0);
  const busiest = days.reduce<(typeof days)[number] | null>(
    (best, day) => (countForMode(day) > (best ? countForMode(best) : -1) ? day : best),
    null,
  );
  const monthlyTotals = new Map<string, number>();
  const weekdayTotals = Array.from({ length: 7 }, () => 0);
  for (const day of days) {
    const count = countForMode(day);
    const month = day.date.slice(0, 7);
    monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + count);
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    weekdayTotals[weekday] = (weekdayTotals[weekday] ?? 0) + count;
  }
  const activeMonths = [...monthlyTotals.entries()].filter(([, count]) => count > 0);
  const busiestMonth = activeMonths.reduce<(typeof activeMonths)[number] | null>(
    (best, item) => (!best || item[1] > best[1] ? item : best),
    null,
  );
  const quietestMonth = activeMonths.reduce<(typeof activeMonths)[number] | null>(
    (best, item) => (!best || item[1] < best[1] ? item : best),
    null,
  );
  const strongestWeekdayIndex = weekdayTotals.reduce(
    (best, count, index) => (count > weekdayTotals[best]! ? index : best),
    0,
  );
  const monthLabel = (value: string) =>
    new Date(`${value}-01T00:00:00Z`).toLocaleString("en", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
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
                {countForMode(busiest).toLocaleString()} detections
              </div>
            )}
          </div>
        </div>
      )}

      {activeMonths.length > 0 && (
        <section className="mt-8 border-t border-border py-8" aria-labelledby="calendar-insights">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ember">Computed insights</p>
              <h2 id="calendar-insights" className="mt-2 font-sans text-xl font-semibold">
                Patterns in this selection
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Derived only from the visible {mode === "combined" ? "harmonized" : mode} daily counts.
                Months without stored detections are excluded from the quietest-month comparison.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
              {[
                {
                  label: "Busiest month",
                  value: busiestMonth ? monthLabel(busiestMonth[0]) : "—",
                  detail: busiestMonth ? `${busiestMonth[1].toLocaleString()} detections` : "No activity",
                },
                {
                  label: "Quietest active month",
                  value: quietestMonth ? monthLabel(quietestMonth[0]) : "—",
                  detail: quietestMonth ? `${quietestMonth[1].toLocaleString()} detections` : "No activity",
                },
                {
                  label: "Strongest weekday",
                  value: weekdayNames[strongestWeekdayIndex],
                  detail: `${weekdayTotals[strongestWeekdayIndex]!.toLocaleString()} detections`,
                },
              ].map((insight) => (
                <div key={insight.label} className="bg-card p-5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {insight.label}
                  </div>
                  <div className="mt-3 font-sans text-lg font-semibold">{insight.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{insight.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
