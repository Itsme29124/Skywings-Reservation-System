import type { Flight } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { formatTime, formatDuration, formatPrice } from "@/lib/format";
import { Plane, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function FlightCard({ flight }: { flight: Flight }) {
  const origin = AIRPORTS.find((a) => a.code === flight.origin);
  const dest = AIRPORTS.find((a) => a.code === flight.destination);
  return (
    <div className="group bg-gradient-card rounded-2xl shadow-card hover:shadow-elegant transition-smooth p-6 border border-border/40">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-3 md:w-48">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plane className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-sm">{flight.airline}</div>
            <div className="text-xs text-muted-foreground">{flight.flightNumber}</div>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-4">
          <div className="text-center">
            <div className="font-display text-2xl font-bold">{formatTime(flight.departureTime)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{origin?.code}</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-1">{formatDuration(flight.durationMinutes)}</div>
            <div className="relative w-full h-px bg-border">
              <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold">{formatTime(flight.arrivalTime)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{dest?.code}</div>
          </div>
        </div>

        <div className="md:text-right md:w-48 flex md:flex-col items-center md:items-end justify-between gap-2">
          <div>
            <div className="font-display text-2xl font-bold text-primary">{formatPrice(flight.price)}</div>
            <div className="text-xs text-muted-foreground">{flight.seatsAvailable} seats left</div>
          </div>
          <Link to="/book/$flightId" params={{ flightId: flight.id }}>
            <Button className="bg-gradient-hero hover:opacity-90 shadow-elegant">Select</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
