/*
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { rescheduleBookingThunk } from "@/store/slices/bookingsSlice";
import { getFlightById, searchFlights } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { FlightCard } from "@/components/flight/FlightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/reschedule/$pnr")({
  component: ReschedulePage,
  head: () => ({ meta: [{ title: "Reschedule flight — SkyWings" }] }),
});

function ReschedulePage() {
  const { pnr } = Route.useParams();
  const booking = useAppSelector((s) => s.bookings.items.find((b) => b.pnr === pnr));
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const flight = booking ? getFlightById(booking.flightId) : undefined;
  const [date, setDate] = useState(flight?.departureTime.slice(0, 10) ?? "2026-04-26");

  if (!booking || !flight) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl mb-2">Booking not found</h1>
        <Link to="/trips" className="text-primary underline">Back to trips</Link>
      </div>
    );
  }

  const origin = AIRPORTS.find((a) => a.code === flight.origin);
  const dest = AIRPORTS.find((a) => a.code === flight.destination);
  const alternatives = searchFlights({ origin: flight.origin, destination: flight.destination, date, passengers: booking.passengers.length })
    .filter((f) => f.id !== flight.id);

  const handlePick = async (newId: string, newPrice: number) => {
    const diff = (newPrice * booking.passengers.length) - booking.totalPrice;
    await dispatch(rescheduleBookingThunk({ pnr, flightId: newId }));
    toast.success(`Flight rescheduled. Fare difference: ${diff >= 0 ? "+" : ""}${formatPrice(diff)}.`);
    nav({ to: "/trips" });
  };

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/trips" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to trips
        </Link>
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card mb-6">
          <h1 className="font-display text-3xl mb-1 flex items-center gap-2"><RotateCcw className="h-6 w-6 text-primary" /> Reschedule</h1>
          <p className="text-muted-foreground">Booking <span className="font-mono font-semibold text-foreground">{pnr}</span> · {origin?.city} → {dest?.city} · {formatDate(flight.departureTime)}</p>
          <div className="mt-4 max-w-xs">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">New travel date</label>
            <Input type="date" value={date} min="2026-04-25" onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <h2 className="font-display text-xl mb-4">Available flights ({alternatives.length})</h2>
        {alternatives.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/40 p-12 text-center">
            <p className="text-muted-foreground">No flights available on this date. Try another date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alternatives.map((f) => (
              <div key={f.id} className="relative">
                <FlightCard flight={f} />
                <div className="absolute inset-0 pointer-events-none flex items-end justify-end p-6">
                  <Button onClick={() => handlePick(f.id, f.price)} className="pointer-events-auto bg-primary shadow-elegant">
                    Switch to this flight
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
*/




import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { rescheduleBookingThunk } from "@/store/slices/bookingsSlice";
import { getFlightById, searchFlights } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { FlightCard } from "@/components/flight/FlightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/reschedule/$pnr")({
  component: ReschedulePage,
  head: () => ({ meta: [{ title: "Reschedule flight — SkyWings" }] }),
});

function ReschedulePage() {
  const { pnr } = Route.useParams();
  const booking = useAppSelector((s) => s.bookings.items.find((b) => b.pnr === pnr));
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const flight = booking ? getFlightById(booking.flightId) : undefined;
  const [date, setDate] = useState(flight?.departureTime.slice(0, 10) ?? "2026-04-26");

  if (!booking || !flight) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl mb-2">Booking not found</h1>
        <Link to="/trips" className="text-primary underline">Back to trips</Link>
      </div>
    );
  }

  const origin = AIRPORTS.find((a) => a.code === flight.origin);
  const dest = AIRPORTS.find((a) => a.code === flight.destination);
  const alternatives = searchFlights({
    origin: flight.origin,
    destination: flight.destination,
    date,
    passengers: booking.passengers.length,
  }).filter((f) => f.id !== flight.id);

  const handlePick = async (newId: string, newPrice: number) => {
    const diff = newPrice * booking.passengers.length - booking.totalPrice;
    await dispatch(rescheduleBookingThunk({ pnr, flightId: newId }));
    toast.success(
      `Flight rescheduled. Fare difference: ${diff >= 0 ? "+" : ""}${formatPrice(diff)}.`
    );
    nav({ to: "/trips" });
  };

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to trips
        </Link>

        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card mb-6">
          <h1 className="font-display text-3xl mb-1 flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" /> Reschedule
          </h1>
          <p className="text-muted-foreground">
            Booking <span className="font-mono font-semibold text-foreground">{pnr}</span> ·{" "}
            {origin?.city} → {dest?.city} · {formatDate(flight.departureTime)}
          </p>
          <div className="mt-4 max-w-xs">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              New travel date
            </label>
            <Input
              type="date"
              value={date}
              min="2026-04-25"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <h2 className="font-display text-xl mb-4">Available flights ({alternatives.length})</h2>

        {alternatives.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/40 p-12 text-center">
            <p className="text-muted-foreground">No flights available on this date. Try another date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alternatives.map((f) => (
              <div key={f.id} className="relative">
                <FlightCard flight={f} />
                <div className="absolute inset-0 pointer-events-none flex items-end justify-end p-6">
                  <Button
                    onClick={() => handlePick(f.id, f.price)}
                    className="pointer-events-auto bg-primary shadow-elegant"
                  >
                    Switch to this flight
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}