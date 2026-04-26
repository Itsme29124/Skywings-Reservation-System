/*
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store";
import { checkInBookingThunk } from "@/store/slices/bookingsSlice";
import { getFlightById } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare, CheckCircle2, Plane, Search } from "lucide-react";
import { formatTime, formatDate, formatPrice } from "@/lib/format";
import { toast } from "sonner";

const searchSchema = z.object({ pnr: z.string().optional() });

export const Route = createFileRoute("/check-in")({
  validateSearch: searchSchema,
  component: CheckInPage,
  head: () => ({ meta: [{ title: "Online check-in — SkyWings" }] }),
});

function CheckInPage() {
  const initial = Route.useSearch().pnr;
  const [pnrInput, setPnrInput] = useState(initial ?? "");
  const [lastName, setLastName] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(initial ?? null);
  const bookings = useAppSelector((s) => s.bookings.items);
  const dispatch = useAppDispatch();

  useEffect(() => { if (initial) setSubmitted(initial); }, [initial]);

  const booking = submitted ? bookings.find((b) => b.pnr.toUpperCase() === submitted.toUpperCase()) : null;
  const flight = booking ? getFlightById(booking.flightId) : null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const found = bookings.find((b) => b.pnr.toUpperCase() === pnrInput.trim().toUpperCase());
    if (!found) return toast.error("Booking not found. Check your PNR.");
    if (lastName && !found.passengers.some((p) => p.lastName.toLowerCase() === lastName.toLowerCase().trim())) {
      return toast.error("Last name doesn't match this booking.");
    }
    setSubmitted(found.pnr);
  };

  const handleCheckIn = async () => {
    if (!booking) return;
    await dispatch(checkInBookingThunk(booking.pnr));
    toast.success("You're checked in! Boarding pass ready.");
  };

  if (booking && flight) {
    const origin = AIRPORTS.find((a) => a.code === flight.origin);
    const dest = AIRPORTS.find((a) => a.code === flight.destination);
    return (
      <div className="bg-secondary/30 min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <h1 className="font-display text-3xl mb-6 flex items-center gap-2"><CheckSquare className="h-7 w-7 text-primary" /> Online check-in</h1>
          <div className="bg-card rounded-2xl border border-border/40 shadow-elegant overflow-hidden">
            <div className="bg-gradient-hero text-primary-foreground p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs uppercase opacity-80">Boarding pass</div>
                  <div className="font-display text-2xl">{booking.pnr}</div>
                </div>
                {booking.checkedIn && (
                  <div className="bg-success px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> CHECKED IN
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-display text-3xl">{origin?.code}</div>
                  <div className="text-xs opacity-80">{formatTime(flight.departureTime)}</div>
                </div>
                <Plane className="h-5 w-5 mx-2" />
                <div>
                  <div className="font-display text-3xl">{dest?.code}</div>
                  <div className="text-xs opacity-80">{formatTime(flight.arrivalTime)}</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div><div className="text-xs text-muted-foreground">Date</div><div className="font-medium">{formatDate(flight.departureTime)}</div></div>
                <div><div className="text-xs text-muted-foreground">Flight</div><div className="font-medium">{flight.flightNumber}</div></div>
                <div><div className="text-xs text-muted-foreground">Gate</div><div className="font-medium">B12</div></div>
              </div>
              <div className="border-t border-border pt-3">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{p.firstName} {p.lastName}</span>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Seat {booking.seats[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-border">
              {booking.checkedIn ? (
                <Button className="w-full" variant="outline" onClick={() => window.print()}>Download boarding pass</Button>
              ) : (
                <Button className="w-full bg-gradient-hero shadow-elegant" onClick={handleCheckIn}>
                  Confirm check-in
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 text-center">
            <button onClick={() => setSubmitted(null)} className="text-sm text-muted-foreground hover:text-foreground underline">Check in another booking</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-md">
        <h1 className="font-display text-3xl mb-2 flex items-center gap-2"><CheckSquare className="h-7 w-7 text-primary" /> Online check-in</h1>
        <p className="text-muted-foreground mb-6">Available 24 hours before departure.</p>
        <form onSubmit={handleLookup} className="bg-card rounded-2xl border border-border/40 p-6 shadow-card space-y-4">
          <div>
            <Label>Booking reference (PNR)</Label>
            <Input required value={pnrInput} onChange={(e) => setPnrInput(e.target.value.toUpperCase())} placeholder="e.g. ABC123" maxLength={6} className="font-mono uppercase" />
          </div>
          <div>
            <Label>Last name (optional)</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
          </div>
          <Button type="submit" className="w-full bg-gradient-hero shadow-elegant"><Search className="h-4 w-4 mr-2" /> Find booking</Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">Don't have a booking? <Link to="/" className="text-primary underline">Search flights</Link></p>
      </div>
    </div>
  );
}
*/



import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store";
import { checkInBookingThunk } from "@/store/slices/bookingsSlice";
import { getFlightById } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare, CheckCircle2, Plane, Search } from "lucide-react";
import { formatTime, formatDate } from "@/lib/format";
import { toast } from "sonner";

const searchSchema = z.object({ pnr: z.string().optional() });

export const Route = createFileRoute("/check-in")({
  validateSearch: searchSchema,
  component: CheckInPage,
  head: () => ({ meta: [{ title: "Online check-in — SkyWings" }] }),
});

function CheckInPage() {
  const initial = Route.useSearch().pnr;
  const [pnrInput, setPnrInput] = useState(initial ?? "");
  const [lastName, setLastName] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(initial ?? null);
  const bookings = useAppSelector((s) => s.bookings.items);
  const dispatch = useAppDispatch();

  useEffect(() => { if (initial) setSubmitted(initial); }, [initial]);

  const booking = submitted ? bookings.find((b) => b.pnr.toUpperCase() === submitted.toUpperCase()) : null;
  const flight = booking ? getFlightById(booking.flightId) : null;

  const handleLookup = (e: React.SubmitEvent) => {
    e.preventDefault();
    const found = bookings.find((b) => b.pnr.toUpperCase() === pnrInput.trim().toUpperCase());
    if (!found) return toast.error("Booking not found. Check your PNR.");
    if (lastName && !found.passengers.some((p) => p.lastName.toLowerCase() === lastName.toLowerCase().trim())) {
      return toast.error("Last name doesn't match this booking.");
    }
    setSubmitted(found.pnr);
  };

  const handleCheckIn = async () => {
    if (!booking) return;
    await dispatch(checkInBookingThunk(booking.pnr));
    toast.success("You're checked in! Boarding pass ready.");
  };

  if (booking && flight) {
    const origin = AIRPORTS.find((a) => a.code === flight.origin);
    const dest = AIRPORTS.find((a) => a.code === flight.destination);
    return (
      <div className="bg-secondary/30 min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <h1 className="font-display text-3xl mb-6 flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-primary" /> Online check-in
          </h1>
          <div className="bg-card rounded-2xl border border-border/40 shadow-elegant overflow-hidden">
            <div className="bg-gradient-hero text-primary-foreground p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs uppercase opacity-80">Boarding pass</div>
                  <div className="font-display text-2xl">{booking.pnr}</div>
                </div>
                {booking.checkedIn && (
                  <div className="bg-success px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> CHECKED IN
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-display text-3xl">{origin?.code}</div>
                  <div className="text-xs opacity-80">{formatTime(flight.departureTime)}</div>
                </div>
                <Plane className="h-5 w-5 mx-2" />
                <div>
                  <div className="font-display text-3xl">{dest?.code}</div>
                  <div className="text-xs opacity-80">{formatTime(flight.arrivalTime)}</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="font-medium">{formatDate(flight.departureTime)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Flight</div>
                  <div className="font-medium">{flight.flightNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Gate</div>
                  <div className="font-medium">B12</div>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{p.firstName} {p.lastName}</span>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Seat {booking.seats[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-border">
              {booking.checkedIn ? (
                <Button className="w-full" variant="outline" onClick={() => window.print()}>
                  Download boarding pass
                </Button>
              ) : (
                <Button className="w-full bg-gradient-hero shadow-elegant" onClick={handleCheckIn}>
                  Confirm check-in
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => setSubmitted(null)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Check in another booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-md">
        <h1 className="font-display text-3xl mb-2 flex items-center gap-2">
          <CheckSquare className="h-7 w-7 text-primary" /> Online check-in
        </h1>
        <p className="text-muted-foreground mb-6">Available 24 hours before departure.</p>
        <form
          onSubmit={handleLookup}
          className="bg-card rounded-2xl border border-border/40 shadow-card p-6 space-y-4"
        >
          <div>
            <Label htmlFor="pnr">Booking reference (PNR)</Label>
            <Input
              id="pnr"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value)}
              placeholder="e.g. SKW-ABC123"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last name (optional)</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-hero shadow-elegant h-11">
            <Search className="mr-2 h-4 w-4" /> Find booking
          </Button>
        </form>
      </div>
    </div>
  );
}