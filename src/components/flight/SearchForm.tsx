import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, Calendar, MapPin, Users, Search } from "lucide-react";
import { AIRPORTS } from "@/data/airports";
import { useAppDispatch, useAppSelector } from "@/store";
import { setField } from "@/store/slices/searchSlice";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const search = useAppSelector((s) => s.search);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const swap = () => {
    const o = search.origin;
    dispatch(setField({ key: "origin", value: search.destination }));
    dispatch(setField({ key: "destination", value: o }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nav({
      to: "/search",
      search: {
        origin: search.origin,
        destination: search.destination,
        date: search.date,
        passengers: search.passengers,
      },
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`bg-card rounded-2xl shadow-elegant border border-border/40 p-4 md:p-6 ${compact ? "" : "backdrop-blur-xl"}`}
    >
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr_1fr_auto] items-end">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> From
          </label>
          <Select value={search.origin} onValueChange={(v) => dispatch(setField({ key: "origin", value: v }))}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AIRPORTS.map((a) => (
                <SelectItem key={a.code} value={a.code}>{a.city} ({a.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="button" variant="ghost" size="icon" onClick={swap} className="h-12 w-12 hidden md:flex">
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> To
          </label>
          <Select value={search.destination} onValueChange={(v) => dispatch(setField({ key: "destination", value: v }))}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AIRPORTS.map((a) => (
                <SelectItem key={a.code} value={a.code}>{a.city} ({a.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Date
          </label>
          <Input
            type="date"
            value={search.date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => dispatch(setField({ key: "date", value: e.target.value }))}
            className="h-12"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
            <Users className="h-3 w-3" /> Passengers
          </label>
          <Select
            value={String(search.passengers)}
            onValueChange={(v) => dispatch(setField({ key: "passengers", value: Number(v) }))}
          >
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "passenger" : "passengers"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" size="lg" className="h-12 bg-gradient-hero hover:opacity-90 shadow-elegant gap-2 px-6">
          <Search className="h-4 w-4" /> Search
        </Button>
      </div>
    </form>
  );
}
