import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { z } from "zod";
import { searchFlights } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { FlightCard } from "@/components/flight/FlightCard";
import { SearchForm } from "@/components/flight/SearchForm";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Plane } from "lucide-react";

const searchSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  date: z.string(),
  passengers: z.coerce.number().min(1).max(9),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search results — SkyWings" }] }),
});

function SearchPage() {
  const params = Route.useSearch();
  const flights = useMemo(() => searchFlights(params), [params]);

  const maxPrice = useMemo(() => Math.max(1000, ...flights.map((f) => f.price)), [flights]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">("price");

  const filtered = useMemo(() => {
    let result = flights.filter((f) => f.price >= priceRange[0] && f.price <= priceRange[1]);
    if (nonStopOnly) result = result.filter((f) => f.stops === 0);
    if (sortBy === "price") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "duration") result = [...result].sort((a, b) => a.durationMinutes - b.durationMinutes);
    if (sortBy === "departure") result = [...result].sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    return result;
  }, [flights, priceRange, nonStopOnly, sortBy]);

  const origin = AIRPORTS.find((a) => a.code === params.origin);
  const dest = AIRPORTS.find((a) => a.code === params.destination);

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="text-primary-foreground mb-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {origin?.city} → {dest?.city}
            </h1>
            <p className="text-sm opacity-90 mt-1">
              {new Date(params.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {params.passengers} passenger{params.passengers > 1 ? "s" : ""}
            </p>
          </div>
          <SearchForm compact />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Filters */}
        <aside className="bg-card rounded-2xl border border-border/40 p-5 h-fit shadow-card">
          <h3 className="font-display font-semibold text-lg mb-4">Filters</h3>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Price: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <Slider
              min={0} max={maxPrice} step={10}
              value={priceRange}
              onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
            />
          </div>

          <div className="mb-6 flex items-center gap-2">
            <Checkbox id="nonstop" checked={nonStopOnly} onCheckedChange={(v) => setNonStopOnly(!!v)} />
            <label htmlFor="nonstop" className="text-sm font-medium cursor-pointer">Non-stop only</label>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Sort by</h4>
            <div className="space-y-2">
              {[
                { v: "price", l: "Price (low to high)" },
                { v: "duration", l: "Duration (shortest)" },
                { v: "departure", l: "Departure time" },
              ].map((o) => (
                <label key={o.v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="sort" value={o.v} checked={sortBy === o.v} onChange={() => setSortBy(o.v as typeof sortBy)} className="accent-primary" />
                  {o.l}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="text-sm text-muted-foreground mb-4">
            {filtered.length} flight{filtered.length !== 1 ? "s" : ""} found
          </div>
          {filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/40 p-12 text-center">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No flights found</h3>
              <p className="text-sm text-muted-foreground">Try a different date or relax your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((f) => <FlightCard key={f.id} flight={f} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
