import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchForm } from "@/components/flight/SearchForm";
import heroImg from "@/assets/hero-plane.jpg";
import { Plane, Shield, Clock, Globe, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkyWings — Fly the world's finest" },
      { name: "description", content: "Find and book flights to 200+ destinations worldwide. Premium cabins, refined service, instant e-tickets." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[680px] flex items-center overflow-hidden">
        <img src={heroImg} alt="Wide-body airliner soaring above golden sunset clouds" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-background" />
        <div className="container mx-auto relative z-10 px-4 pt-24 pb-32 w-full">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-gold/40 mb-5">
              <Star className="h-3 w-3 text-gold fill-gold" />
              <span className="text-xs font-medium text-white tracking-wide">Trusted by 2M+ travelers worldwide</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-white leading-[1.05]">
              Hello Tomorrow.<br />
              <span className="text-gold">Fly with SkyWings.</span>
            </h1>
            <p className="mt-5 text-lg text-white/85 max-w-xl font-light">
              Premium cabins, refined service, and 200+ destinations — all in one beautifully simple journey.
            </p>
          </div>
          <div className="max-w-6xl"><SearchForm /></div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <div className="inline-flex h-px w-12 bg-gold mb-4" />
          <h2 className="font-display text-4xl md:text-5xl mb-3">An experience above</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Every flight engineered around your comfort, your time, and your story.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Globe, title: "200+ Destinations", desc: "Six continents, one seamless network" },
            { icon: Shield, title: "Secure Payments", desc: "Bank-grade encryption end to end" },
            { icon: Clock, title: "Instant E-Tickets", desc: "Boarding pass in your pocket" },
            { icon: Plane, title: "Effortless Check-in", desc: "Skip the queues, board with ease" },
          ].map((f) => (
            <div key={f.title} className="bg-gradient-card rounded-xl p-6 border border-border/40 shadow-card hover:shadow-elegant transition-smooth group">
              <div className="h-12 w-12 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow mb-4 group-hover:scale-105 transition-smooth">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular routes */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex h-px w-12 bg-gold mb-3" />
            <h2 className="font-display text-4xl">Popular routes</h2>
          </div>
          <Link to="/" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { from: "Delhi", to: "Mumbai", price: "$89", code: "DEL-BOM" },
            { from: "Bengaluru", to: "Goa", price: "$75", code: "BLR-GOI" },
            { from: "Mumbai", to: "Dubai", price: "$245", code: "BOM-DXB" },
            { from: "Delhi", to: "Singapore", price: "$420", code: "DEL-SIN" },
            { from: "Chennai", to: "London", price: "$680", code: "MAA-LHR" },
            { from: "Hyderabad", to: "New York", price: "$890", code: "HYD-JFK" },
          ].map((r) => (
            <div key={r.code} className="bg-card rounded-xl p-5 border border-border/40 flex items-center justify-between hover:border-gold/60 hover:shadow-card transition-smooth cursor-pointer group">
              <div>
                <div className="font-display text-lg">{r.from} → {r.to}</div>
                <div className="text-xs text-muted-foreground mt-0.5 tracking-wider">{r.code} · STARTING FROM</div>
              </div>
              <div className="font-display text-2xl text-primary group-hover:text-gold transition-smooth">{r.price}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
