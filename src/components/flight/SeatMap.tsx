import { Armchair } from "lucide-react";
import { Fragment } from "react";

export interface SeatInfo { code: string; type: "premium" | "standard"; taken: boolean; }

const ROWS = 12;
const COLS = ["A", "B", "C", "D", "E", "F"];

export function generateSeats(flightId: string): SeatInfo[] {
  let h = 2166136261;
  for (let i = 0; i < flightId.length; i++) { h ^= flightId.charCodeAt(i); h = Math.imul(h, 16777619); }
  const seats: SeatInfo[] = [];
  for (let r = 1; r <= ROWS; r++) {
    for (const c of COLS) {
      h = Math.imul(h ^ (r * 31 + c.charCodeAt(0)), 16777619) >>> 0;
      seats.push({ code: `${r}${c}`, type: r <= 3 ? "premium" : "standard", taken: (h % 7) === 0 });
    }
  }
  return seats;
}

interface Props {
  flightId: string;
  selected: string[];
  required: number;
  onToggle: (code: string) => void;
}

export function SeatMap({ flightId, selected, required, onToggle }: Props) {
  const seats = generateSeats(flightId);
  return (
    <div className="bg-card rounded-xl border border-border/40 p-6">
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs mb-6 text-muted-foreground">
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-muted border border-border" /> Available</div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gold/40" /> Premium (+$25)</div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary" /> Selected</div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-foreground/20" /> Taken</div>
      </div>

      <div className="mx-auto max-w-xs space-y-1.5">
        <div className="text-center text-xs text-muted-foreground mb-3 border-b border-dashed border-border pb-2">FRONT</div>
        {Array.from({ length: ROWS }, (_, i) => i + 1).map((row) => (
          <div key={row} className="flex items-center gap-1.5 justify-center">
            <span className="w-5 text-xs text-muted-foreground">{row}</span>
            {COLS.map((c, idx) => {
              const seat = seats.find((s) => s.code === `${row}${c}`)!;
              const isSel = selected.includes(seat.code);
              const disabled = seat.taken || (!isSel && selected.length >= required);
              const base = "h-8 w-8 rounded-md flex items-center justify-center text-[10px] font-semibold transition-smooth";
              let cls = "bg-muted hover:bg-muted/70 text-muted-foreground";
              if (seat.type === "premium") cls = "bg-gold/30 hover:bg-gold/50 text-foreground";
              if (isSel) cls = "bg-primary text-primary-foreground shadow-md scale-105";
              if (seat.taken) cls = "bg-foreground/15 text-muted-foreground cursor-not-allowed";
              return (
                <Fragment key={seat.code}>
                  {idx === 3 && <span className="w-3" />}
                  <button type="button" disabled={disabled} onClick={() => onToggle(seat.code)} className={`${base} ${cls}`}>
                    {isSel ? <Armchair className="h-3.5 w-3.5" /> : c}
                  </button>
                </Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
