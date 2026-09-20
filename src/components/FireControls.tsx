import { REGIONS, CONFIDENCE_TIERS, type ConfidenceTier } from "@/lib/regions";

export interface FireFilters {
  regionId: string;
  startDate: string;
  endDate: string;
  confidence: ConfidenceTier[];
}

export function defaultFilters(): FireFilters {
  const end = new Date();
  const start = new Date();
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  return {
    regionId: REGIONS[0]!.id,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    confidence: [...CONFIDENCE_TIERS],
  };
}

export function RegionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 lg:w-full">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        Region
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-card px-3 py-2 font-sans text-sm lg:w-full"
      >
        {REGIONS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DateRangeInputs({
  startDate,
  endDate,
  onStart,
  onEnd,
}: {
  startDate: string;
  endDate: string;
  onStart: (d: string) => void;
  onEnd: (d: string) => void;
}) {
  return (
    <div className="flex gap-3 lg:grid lg:w-full lg:grid-cols-1">
      <label className="flex flex-col gap-1 lg:w-full">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          From
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStart(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2 font-mono text-sm lg:w-full"
        />
      </label>
      <label className="flex flex-col gap-1 lg:w-full">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          To
        </span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEnd(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2 font-mono text-sm lg:w-full"
        />
      </label>
    </div>
  );
}

export function ConfidenceFilter({
  value,
  onChange,
}: {
  value: ConfidenceTier[];
  onChange: (tiers: ConfidenceTier[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        Confidence
      </legend>
      <div className="flex gap-1.5">
        {CONFIDENCE_TIERS.map((tier) => {
          const active = value.includes(tier);
          return (
            <button
              key={tier}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange(
                  active ? value.filter((t) => t !== tier) : [...value, tier],
                )
              }
              className={`rounded-md border px-3 py-1.5 font-sans text-xs capitalize transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-input bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tier}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
