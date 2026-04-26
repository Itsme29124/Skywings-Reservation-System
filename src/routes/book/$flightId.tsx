import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getFlightById } from "@/data/flights";
import { AIRPORTS } from "@/data/airports";
import { useAppDispatch, useAppSelector } from "@/store";
import { addBookingThunk, type Passenger } from "@/store/slices/bookingsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SeatMap, generateSeats } from "@/components/flight/SeatMap";
import { ArrowLeft, Plane, ArrowRight, Check, CreditCard, Loader2, Lock, User } from "lucide-react";
import { formatTime, formatDate, formatDuration, formatPrice, generatePNR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/book/$flightId")({
  component: BookPage,
  head: () => ({ meta: [{ title: "Book your flight — SkyWings" }] }),
});

type Step = 1 | 2 | 3;

function BookPage() {
  const { flightId } = Route.useParams();
  const flight = getFlightById(flightId);
  const passengerCount = useAppSelector((s) => s.search.passengers);
  const user = useAppSelector((s) => s.user.current);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: passengerCount }, () => ({ firstName: "", lastName: "", dob: "", gender: "M" as const })),
  );
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [seats, setSeats] = useState<string[]>([]);
  const [card, setCard] = useState({ number: "", name: user?.fullName ?? "", expiry: "", cvc: "" });
  const [processing, setProcessing] = useState(false);

  const allSeats = useMemo(() => (flight ? generateSeats(flight.id) : []), [flight]);
  const premiumSurcharge = seats.filter((s) => allSeats.find((x) => x.code === s)?.type === "premium").length * 25;
  const subtotal = (flight?.price ?? 0) * passengerCount;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes + premiumSurcharge;

  if (!flight) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl mb-2">Flight not found</h1>
        <Link to="/" className="text-primary underline">Search again</Link>
      </div>
    );
  }

  const origin = AIRPORTS.find((a) => a.code === flight.origin);
  const dest = AIRPORTS.find((a) => a.code === flight.destination);

  const validateStep1 = () => {
    for (const p of passengers) {
      if (!p.firstName.trim() || !p.lastName.trim() || !p.dob) return false;
    }
    return contactEmail.trim() && contactPhone.trim();
  };

  const next = () => {
    if (step === 1 && !validateStep1()) { toast.error("Please complete all passenger and contact details."); return; }
    if (step === 2 && seats.length !== passengerCount) { toast.error(`Please select ${passengerCount} seat${passengerCount > 1 ? "s" : ""}.`); return; }
    setStep((s) => (s + 1) as Step);
  };

  const handlePay = async () => {
    if (!user) { nav({ to: "/login", search: { redirect: `/book/${flightId}` } }); return; }
    if (!card.number || !card.name || !card.expiry || !card.cvc) { toast.error("Please complete card details."); return; }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1400));
    const pnr = generatePNR();
    const result = await dispatch(addBookingThunk({
      pnr, flightId: flight.id, passengers, seats,
      totalPrice: total, status: "CONFIRMED",
      contactEmail, contactPhone,
      createdAt: new Date().toISOString(), checkedIn: false,
    }));
    if (addBookingThunk.rejected.match(result)) {
      toast.error("Booking failed. Please try again.");
      setProcessing(false);
      return;
    }
    toast.success("Payment successful!");
    nav({ to: "/booking/$pnr", params: { pnr } });
  };

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/search"
          search={{ origin: flight.origin, destination: flight.destination, date: flight.departureTime.slice(0, 10), passengers: passengerCount }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to results
        </Link>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
          {[
            { n: 1, label: "Passengers" },
            { n: 2, label: "Seats" },
            { n: 3, label: "Payment" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 md:gap-4">
              <div className={`flex items-center gap-2 ${step >= s.n ? "" : "opacity-40"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${step > s.n ? "bg-success text-success-foreground" : step === s.n ? "bg-gradient-hero text-primary-foreground shadow-elegant" : "bg-muted text-muted-foreground"}`}>
                  {step > s.n ? <Check className="h-4 w-4" /> : s.n}
                </div>
                <span className="hidden md:inline text-sm font-medium">{s.label}</span>
              </div>
              {i < 2 && <div className={`h-px w-8 md:w-16 ${step > s.n ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-4">
            {step === 1 && (
              <>
                <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card">
                  <h2 className="font-display text-2xl mb-4 flex items-center gap-2"><User className="h-5 w-5" /> Passenger details</h2>
                  <div className="space-y-6">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="grid md:grid-cols-2 gap-3 pb-6 border-b border-border last:border-0 last:pb-0">
                        <div className="md:col-span-2 text-sm font-semibold text-muted-foreground">Passenger {idx + 1}</div>
                        <div>
                          <Label>First name</Label>
                          <Input value={p.firstName} onChange={(e) => { const n = [...passengers]; n[idx] = { ...n[idx], firstName: e.target.value }; setPassengers(n); }} />
                        </div>
                        <div>
                          <Label>Last name</Label>
                          <Input value={p.lastName} onChange={(e) => { const n = [...passengers]; n[idx] = { ...n[idx], lastName: e.target.value }; setPassengers(n); }} />
                        </div>
                        <div>
                          <Label>Date of birth</Label>
                          <Input type="date" value={p.dob} onChange={(e) => { const n = [...passengers]; n[idx] = { ...n[idx], dob: e.target.value }; setPassengers(n); }} />
                        </div>
                        <div>
                          <Label>Gender</Label>
                          <Select value={p.gender} onValueChange={(v) => { const n = [...passengers]; n[idx] = { ...n[idx], gender: v as Passenger["gender"] }; setPassengers(n); }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">Male</SelectItem>
                              <SelectItem value="F">Female</SelectItem>
                              <SelectItem value="O">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card">
                  <h2 className="font-display text-xl mb-4">Contact information</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div><Label>Email</Label><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
                    <div><Label>Phone</Label><Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 555 123 4567" /></div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card">
                <h2 className="font-display text-2xl mb-1">Choose your seats</h2>
                <p className="text-sm text-muted-foreground mb-4">Select {passengerCount} seat{passengerCount > 1 ? "s" : ""} · {seats.length}/{passengerCount} chosen</p>
                <SeatMap
                  flightId={flight.id}
                  selected={seats}
                  required={passengerCount}
                  onToggle={(c) => setSeats((cur) => cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c])}
                />
              </div>
            )}

            {step === 3 && (
              <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-card">
                <h2 className="font-display text-2xl mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment</h2>
                {!user && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4 text-sm">
                    You'll be asked to <Link to="/login" search={{ redirect: `/book/${flightId}` }} className="text-primary font-semibold underline">sign in</Link> to complete this booking.
                  </div>
                )}
                <div className="space-y-3">
                  <div><Label>Card number</Label><Input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" /></div>
                  <div><Label>Cardholder name</Label><Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Expiry</Label><Input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" /></div>
                    <div><Label>CVC</Label><Input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" /></div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> This is a demo — no real charge will occur.
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3">
              {step > 1 && <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)}>Back</Button>}
              <div className="flex-1" />
              {step < 3 ? (
                <Button onClick={next} className="bg-gradient-hero shadow-elegant gap-2">Continue <ArrowRight className="h-4 w-4" /></Button>
              ) : (
                <Button onClick={handlePay} disabled={processing} className="bg-gradient-hero shadow-elegant gap-2 min-w-44">
                  {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <>Pay {formatPrice(total)}</>}
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside className="bg-card rounded-2xl border border-border/40 p-6 shadow-card h-fit lg:sticky lg:top-20">
            <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
              <Plane className="h-4 w-4 text-primary" />
              <span className="font-semibold">{flight.airline}</span>
              <span className="text-xs text-muted-foreground ml-auto">{flight.flightNumber}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <div className="font-display text-2xl">{formatTime(flight.departureTime)}</div>
                <div className="text-xs text-muted-foreground">{origin?.code} · {origin?.city}</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="text-xs text-muted-foreground">{formatDuration(flight.durationMinutes)}</div>
                <div className="w-full h-px bg-border my-1" />
                <div className="text-xs text-muted-foreground">{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl">{formatTime(flight.arrivalTime)}</div>
                <div className="text-xs text-muted-foreground">{dest?.code} · {dest?.city}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground pb-4 border-b border-border mb-4">{formatDate(flight.departureTime)}</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Base fare × {passengerCount}</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Taxes & fees</span><span>{formatPrice(taxes)}</span></div>
              {premiumSurcharge > 0 && <div className="flex justify-between text-muted-foreground"><span>Premium seats</span><span>{formatPrice(premiumSurcharge)}</span></div>}
              <div className="flex justify-between font-display text-xl pt-3 border-t border-border">
                <span>Total</span><span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}