import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { ALL_FLIGHTS } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { ShieldCheck, Plane, Users, Ticket, DollarSign } from "lucide-react";
import { formatPrice, formatTime, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { fetchAllBookingsThunk } from "@/store/slices/bookingsSlice";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — SkyWings" }] }),
});

function AdminPage() {
  const user = useAppSelector((s) => s.user.current);
  const bookings = useAppSelector((s) => s.bookings.items);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user?.isAdmin) {
      dispatch(fetchAllBookingsThunk());
    }
  }, [user, dispatch]);

  const stats = useMemo(() => ({
    flights: ALL_FLIGHTS.length,
    airports: AIRPORTS.length,
    bookings: bookings.length,
    revenue: bookings.filter((b) => b.status !== "CANCELLED").reduce((sum, b) => sum + b.totalPrice, 0),
  }), [bookings]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-3xl mb-2">Admin access required</h1>
        <p className="text-muted-foreground mb-6">Sign in with an admin account to continue.</p>
        <Link to="/login" search={{ redirect: "/admin" }}><Button className="bg-gradient-hero">Sign in</Button></Link>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <ShieldCheck className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h1 className="font-display text-3xl mb-2">Not authorised</h1>
        <p className="text-muted-foreground mb-2">This area is restricted to administrators.</p>
        <p className="text-xs text-muted-foreground">Sign up with email <span className="font-mono">admin@skywings.com</span> to access admin.</p>
      </div>
    );
  }

  const upcoming = ALL_FLIGHTS.filter((f) => new Date(f.departureTime) > new Date()).slice(0, 10);

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Operations overview · {user.fullName}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Plane, label: "Flights", value: stats.flights.toLocaleString() },
            { icon: Users, label: "Airports", value: stats.airports },
            { icon: Ticket, label: "Bookings", value: stats.bookings },
            { icon: DollarSign, label: "Revenue", value: formatPrice(stats.revenue) },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl border border-border/40 p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="font-display text-3xl">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card">
            <h2 className="font-display text-xl mb-4">Upcoming flights (sample)</h2>
            <div className="divide-y divide-border">
              {upcoming.map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{f.flightNumber} · {f.origin} → {f.destination}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(f.departureTime)} · {formatTime(f.departureTime)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(f.price)}</div>
                    <div className="text-xs text-muted-foreground">{f.seatsAvailable} seats</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card">
            <h2 className="font-display text-xl mb-4">Recent bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No bookings yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {bookings.slice().reverse().slice(0, 8).map((b) => (
                  <div key={b.pnr} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-mono font-semibold">{b.pnr}</div>
                      <div className="text-xs text-muted-foreground">{b.passengers.length} pax · {b.contactEmail}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(b.totalPrice)}</div>
                      <div className={`text-xs ${b.status === "CONFIRMED" ? "text-success" : b.status === "CANCELLED" ? "text-destructive" : "text-muted-foreground"}`}>{b.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
