import { Plane } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary/30 mt-20">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
              <Plane className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold">SkyWings</span>
          </div>
          <p className="text-sm text-muted-foreground">Fly the modern way. Bookings, check-ins, and journeys made effortless.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About</li><li>Careers</li><li>Press</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Contact</li><li>Baggage</li><li>FAQs</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Privacy</li><li>Terms</li><li>Cookies</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SkyWings. All rights reserved.
      </div>
    </footer>
  );
}
