import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppSelector } from "@/store";
import { getFlightById } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plane, Download, Mail, ArrowRight } from "lucide-react";
import { formatTime, formatDate, formatDuration, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/booking/$pnr")({
  component: ConfirmationPage,
  head: () => ({ meta: [{ title: "Booking confirmed — SkyWings" }] }),
});

function ConfirmationPage() {
  const { pnr } = Route.useParams();
  const booking = useAppSelector((s) => s.bookings.items.find((b) => b.pnr === pnr));

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl mb-2">Booking not found</h1>
        <Link to="/trips" className="text-primary underline">View your trips</Link>
      </div>
    );
  }

  const flight = getFlightById(booking.flightId)!;
  const origin = AIRPORTS.find((a) => a.code === flight.origin);
  const dest = AIRPORTS.find((a) => a.code === flight.destination);

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="font-display text-4xl mb-2">Booking confirmed</h1>
          <p className="text-muted-foreground">Your e-ticket has been sent to <span className="font-medium text-foreground">{booking.contactEmail}</span></p>
        </div>

        {/* E-ticket */}
        <div className="bg-card rounded-2xl border border-border/40 shadow-elegant overflow-hidden">
          <div className="bg-gradient-hero text-primary-foreground p-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">PNR / Booking reference</div>
              <div className="font-display text-3xl tracking-wider">{booking.pnr}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gold flex items-center justify-center">
              <Plane className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="text-center flex-1">
                <div className="font-display text-3xl">{formatTime(flight.departureTime)}</div>
                <div className="font-semibold mt-1">{origin?.code}</div>
                <div className="text-xs text-muted-foreground">{origin?.city}</div>
              </div>
              <div className="flex flex-col items-center text-muted-foreground">
                <ArrowRight className="h-5 w-5 text-primary" />
                <div className="text-xs mt-1">{formatDuration(flight.durationMinutes)}</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-display text-3xl">{formatTime(flight.arrivalTime)}</div>
                <div className="font-semibold mt-1">{dest?.code}</div>
                <div className="text-xs text-muted-foreground">{dest?.city}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm border-t border-border pt-4">
              <div><div className="text-xs text-muted-foreground">Date</div><div className="font-medium">{formatDate(flight.departureTime)}</div></div>
              <div><div className="text-xs text-muted-foreground">Flight</div><div className="font-medium">{flight.flightNumber}</div></div>
              <div><div className="text-xs text-muted-foreground">Aircraft</div><div className="font-medium">{flight.aircraft}</div></div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="text-xs text-muted-foreground mb-2">Passengers & seats</div>
              <div className="space-y-1">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.firstName} {p.lastName}</span>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">{booking.seats[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Total paid</div>
              <div className="font-display text-2xl text-primary">{formatPrice(booking.totalPrice)}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <Button variant="outline" onClick={() => window.print()}><Download className="h-4 w-4 mr-2" /> Download</Button>
          <Button variant="outline"><Mail className="h-4 w-4 mr-2" /> Email me</Button>
          <Link to="/trips"><Button className="w-full bg-gradient-hero shadow-elegant">My trips</Button></Link>
        </div>
      </div>
    </div>
  );
}
