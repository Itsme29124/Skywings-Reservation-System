import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { cancelBookingThunk, fetchBookingsThunk } from "@/store/slices/bookingsSlice";
import { getFlightById } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { Button } from "@/components/ui/button";
import { formatTime, formatDate, formatDuration, formatPrice } from "@/lib/format";
import { Plane, Ticket, Calendar, X, RotateCcw, CheckSquare, ArrowRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/trips")({
  component: TripsPage,
  head: () => ({ meta: [{ title: "My trips — SkyWings" }] }),
});

function TripsPage() {
  const user = useAppSelector((s) => s.user.current);
  const bookings = useAppSelector((s) => s.bookings.items);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  useEffect(() => {
    if (user) dispatch(fetchBookingsThunk());
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-3xl mb-2">Sign in to view your trips</h1>
        <p className="text-muted-foreground mb-6">Manage bookings, check in, and download e-tickets.</p>
        <Link to="/login" search={{ redirect: "/trips" }}>
          <Button className="bg-gradient-hero shadow-elegant">Sign in</Button>
        </Link>
      </div>
    );
  }

  const handleCancel = async (pnr: string, total: number) => {
    await dispatch(cancelBookingThunk(pnr));
    toast.success(`Booking ${pnr} cancelled. Refund of ${formatPrice(Math.round(total * 0.85))} will be processed.`);
  };

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="font-display text-4xl mb-2">My trips</h1>
        <p className="text-muted-foreground mb-8">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} in your account</p>

        {bookings.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/40 p-12 text-center shadow-card">
            <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl mb-2">No trips yet</h2>
            <p className="text-muted-foreground mb-6">Time to plan your next journey.</p>
            <Link to="/"><Button className="bg-gradient-hero shadow-elegant">Search flights</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice().reverse().map((b) => {
              const flight = getFlightById(b.flightId);
              if (!flight) return null;
              const origin = AIRPORTS.find((a) => a.code === flight.origin);
              const dest = AIRPORTS.find((a) => a.code === flight.destination);
              const past = new Date(flight.departureTime) < new Date();
              return (
                <div key={b.pnr} className="bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden">
                  <div className="flex items-center justify-between bg-secondary/40 px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">PNR</span>
                      <span className="font-mono font-semibold">{b.pnr}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${b.status === "CONFIRMED" ? "bg-success/15 text-success" : b.status === "CANCELLED" ? "bg-destructive/15 text-destructive" : "bg-gold/30 text-foreground"}`}>
                      {b.status}{b.checkedIn ? " · CHECKED IN" : ""}
                    </span>
                  </div>
                  <div className="p-6 grid md:grid-cols-[1fr_auto] gap-6 items-center">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <div className="font-display text-2xl">{formatTime(flight.departureTime)}</div>
                          <div className="text-xs text-muted-foreground">{origin?.code} · {origin?.city}</div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-display text-2xl">{formatTime(flight.arrivalTime)}</div>
                          <div className="text-xs text-muted-foreground">{dest?.code} · {dest?.city}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(flight.departureTime)}</span>
                        <span>{flight.flightNumber} · {flight.airline}</span>
                        <span>{formatDuration(flight.durationMinutes)}</span>
                        <span>{b.passengers.length} pax · seats {b.seats.join(", ")}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Link to="/booking/$pnr" params={{ pnr: b.pnr }}>
                        <Button variant="outline" size="sm">View ticket</Button>
                      </Link>
                      {b.status === "CONFIRMED" && !past && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => nav({ to: "/check-in", search: { pnr: b.pnr } })}>
                            <CheckSquare className="h-3.5 w-3.5 mr-1.5" /> Check in
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => nav({ to: "/reschedule/$pnr", params: { pnr: b.pnr } })}>
                            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reschedule
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                                <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel booking {b.pnr}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Per our fare rules, you'll receive a refund of {formatPrice(Math.round(b.totalPrice * 0.85))} (15% cancellation fee). This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep booking</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancel(b.pnr, b.totalPrice)} className="bg-destructive">Cancel & refund</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}