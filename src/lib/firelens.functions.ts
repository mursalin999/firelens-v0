import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const bboxSchema = z
  .string()
  .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "bbox must be west,south,east,north");

// --- fetch-fire-data: pull 1–5 recent days for a bbox and store them ---
export const fetchFireData = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        bbox: bboxSchema,
        days: z.number().int().min(1).max(5),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { fetchAndHarmonize, upsertDetections } = await import("./firms.server");
    const rows = await fetchAndHarmonize(data);
    const stored = await upsertDetections(rows);
    return { rows, stored };
  });

// --- backfill-fire-data: populate a historical range in ≤5-day windows ---
export const backfillFireData = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        bbox: bboxSchema,
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { fetchAndHarmonize, upsertDetections, chunkDateRange } = await import(
      "./firms.server"
    );
    const starts = chunkDateRange(data.start_date, data.end_date);
    let chunks = 0;
    let stored = 0;
    const errors: string[] = [];
    // Sequential, not parallel — stays comfortably inside FIRMS's
    // 5000 requests / 10-minute limit even for a full year of data.
    for (const date of starts) {
      try {
        const rows = await fetchAndHarmonize({ bbox: data.bbox, days: 5, date });
        stored += await upsertDetections(rows);
        chunks += 1;
      } catch (err) {
        errors.push(`${date}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return { chunks, stored, errors };
  });

// --- Public read queries (publishable key, anon-safe SELECT policy) ---

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const detectionsQuerySchema = z.object({
  west: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sensors: z.array(z.enum(["MODIS", "VIIRS"])).optional(),
  confidence: z.array(z.enum(["low", "nominal", "high"])).optional(),
});

export const getDetections = createServerFn({ method: "GET" })
  .inputValidator((data) => detectionsQuerySchema.parse(data))
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("fire_detections")
      .select(
        "lat,lon,acq_date,acq_time,sensor,satellite,resolution_m,brightness_k,brightness2_k,frp_mw,confidence_tier,day_night",
      )
      .gte("lon", data.west)
      .lte("lon", data.east)
      .gte("lat", data.south)
      .lte("lat", data.north)
      .gte("acq_date", data.start_date)
      .lte("acq_date", data.end_date)
      .order("acq_date", { ascending: true })
      .limit(20000);
    if (data.sensors?.length) q = q.in("sensor", data.sensors);
    if (data.confidence?.length) q = q.in("confidence_tier", data.confidence);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// Daily counts per sensor — powers the calendar heatmap and comparison chart.
export const getDailyCounts = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    detectionsQuerySchema.omit({ sensors: true, confidence: true }).parse(data),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("fire_detections")
      .select("acq_date,sensor")
      .gte("lon", data.west)
      .lte("lon", data.east)
      .gte("lat", data.south)
      .lte("lat", data.north)
      .gte("acq_date", data.start_date)
      .lte("acq_date", data.end_date)
      .limit(100000);
    if (error) throw new Error(error.message);
    const counts = new Map<string, { date: string; modis: number; viirs: number }>();
    for (const r of rows ?? []) {
      const entry = counts.get(r.acq_date) ?? { date: r.acq_date, modis: 0, viirs: 0 };
      if (r.sensor === "MODIS") entry.modis += 1;
      else entry.viirs += 1;
      counts.set(r.acq_date, entry);
    }
    return [...counts.values()].sort((a, b) => a.date.localeCompare(b.date));
  });
