// Browser-only map module — imported lazily (React.lazy) behind <ClientOnly>.
// Never import this module statically from a route.
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { SENSOR_META } from "@/lib/regions";

export interface MapDetection {
  lat: number;
  lon: number;
  acq_date: string;
  acq_time: string;
  sensor: "MODIS" | "VIIRS";
  satellite: string;
  resolution_m: number;
  brightness_k: number | null;
  frp_mw: number | null;
  confidence_tier: "low" | "nominal" | "high";
  day_night: "D" | "N" | null;
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MAX_MARKERS = 5000;

export default function FireMap({
  detections,
  center,
  zoom,
}: {
  detections: MapDetection[];
  center: [number, number];
  zoom: number;
}) {
  const shown =
    detections.length > MAX_MARKERS
      ? detections.filter((_, i) => i % Math.ceil(detections.length / MAX_MARKERS) === 0)
      : detections;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      scrollWheelZoom
      attributionControl
    >
      <Recenter center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shown.map((d, i) => {
        const meta = SENSOR_META[d.sensor];
        return (
          <CircleMarker
            key={`${d.sensor}-${d.satellite}-${d.acq_date}-${d.acq_time}-${d.lat}-${d.lon}-${i}`}
            center={[d.lat, d.lon]}
            radius={d.sensor === "MODIS" ? 4 : 2.5}
            pathOptions={{
              color: meta.color,
              fillColor: meta.color,
              fillOpacity: d.confidence_tier === "high" ? 0.85 : d.confidence_tier === "nominal" ? 0.55 : 0.3,
              weight: 1,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div className="font-sans text-sm">
                <div className="font-semibold">
                  {d.sensor} · {d.satellite}
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {d.lat.toFixed(3)}, {d.lon.toFixed(3)}
                </div>
                <div className="mt-1 text-xs">
                  {d.acq_date} {d.acq_time} UTC · {d.day_night === "N" ? "night" : "day"}
                </div>
                <div className="mt-1 text-xs">
                  Brightness {d.brightness_k?.toFixed(1) ?? "—"} K
                  {d.frp_mw != null && ` · FRP ${d.frp_mw.toFixed(1)} MW`}
                </div>
                <div className="mt-1 text-xs">
                  Confidence: <span className="font-medium">{d.confidence_tier}</span> ·{" "}
                  {d.resolution_m} m pixel
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
