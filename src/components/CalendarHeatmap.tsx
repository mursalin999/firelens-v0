// GitHub-style contribution heatmap for daily fire counts. Browser-safe.
export interface DayCount {
  date: string; // YYYY-MM-DD
  modis: number;
  viirs: number;
}

interface Props {
  days: DayCount[];
  startDate: string;
  endDate: string;
  mode: "combined" | "MODIS" | "VIIRS";
}

function countFor(d: DayCount | undefined, mode: Props["mode"]): number {
  if (!d) return 0;
  if (mode === "MODIS") return d.modis;
  if (mode === "VIIRS") return d.viirs;
  return d.modis + d.viirs;
}

function level(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  const r = count / max;
  if (r <= 0.2) return 1;
  if (r <= 0.45) return 2;
  if (r <= 0.7) return 3;
  return 4;
}

const LEVEL_BG = [
  "bg-muted",
  "bg-ember/25",
  "bg-ember/50",
  "bg-ember/75",
  "bg-ember",
];

export function CalendarHeatmap({ days, startDate, endDate, mode }: Props) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const max = Math.max(1, ...days.map((d) => countFor(d, mode)));

  // Build week columns starting on the Sunday before startDate.
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const first = new Date(start);
  first.setUTCDate(first.getUTCDate() - first.getUTCDay());

  const weeks: { date: Date; inRange: boolean }[][] = [];
  const cursor = new Date(first);
  while (cursor <= end) {
    const week: { date: Date; inRange: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({ date: new Date(cursor), inRange: cursor >= start && cursor <= end });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  const monthLabels: { label: string; index: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const m = week[0].date.getUTCMonth();
    if (m !== lastMonth && week[0].date <= end) {
      monthLabels.push({
        label: week[0].date.toLocaleString("en", { month: "short", timeZone: "UTC" }),
        index: i,
      });
      lastMonth = m;
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="relative mb-1 h-4">
          {monthLabels.map((m) => (
            <span
              key={m.index}
              className="absolute font-mono text-[10px] text-muted-foreground"
              style={{ left: m.index * 15 }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map(({ date, inRange }) => {
                const iso = date.toISOString().slice(0, 10);
                if (!inRange) {
                  return <span key={iso} className="h-3 w-3 rounded-[2px]" />;
                }
                const d = byDate.get(iso);
                const count = countFor(d, mode);
                const lv = level(count, max);
                return (
                  <span
                    key={iso}
                    title={`${iso}: ${count} detection${count === 1 ? "" : "s"}${
                      d ? ` (MODIS ${d.modis} · VIIRS ${d.viirs})` : ""
                    }`}
                    className={`h-3 w-3 rounded-[2px] ${LEVEL_BG[lv]}`}
                    style={{ animation: "cell-in 300ms ease-out both", animationDelay: `${Math.min(wi * 12, 600)}ms` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span>Less</span>
          {LEVEL_BG.map((c, i) => (
            <span key={i} className={`h-3 w-3 rounded-[2px] ${c}`} />
          ))}
          <span>More</span>
          <span className="ml-3">peak day: {max} detections</span>
        </div>
      </div>
    </div>
  );
}
