import { AIRPORTS } from "./airports";

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  price: number;
  seatsAvailable: number;
  aircraft: string;
}

const AIRLINES = [
  { name: "SkyWings", code: "SW" },
  { name: "AeroJet", code: "AJ" },
  { name: "Nimbus Air", code: "NA" },
  { name: "Stratos", code: "ST" },
  { name: "Pegasus Airlines", code: "PG" },
];

const AIRCRAFT = ["Boeing 777-300ER", "Airbus A380-800", "Boeing 787-9", "Airbus A350-900"];

// Deterministic PRNG so SSR and client produce identical data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Use a fixed reference date so server and client agree
const REFERENCE_DATE = new Date("2026-04-25T00:00:00.000Z");

function generateFlights(): Flight[] {
  const flights: Flight[] = [];
  for (const origin of AIRPORTS) {
    for (const destination of AIRPORTS) {
      if (origin.code === destination.code) continue;
      for (let day = 0; day < 60; day++) {
        for (let f = 0; f < 3; f++) {
          const seed = hashStr(`${origin.code}-${destination.code}-${day}-${f}`);
          const rand = mulberry32(seed);
          const airline = AIRLINES[Math.floor(rand() * AIRLINES.length)];
          const departureHour = 6 + f * 5 + Math.floor(rand() * 4);
          const minutes = Math.floor(rand() * 12) * 5;
          const departure = new Date(REFERENCE_DATE);
          departure.setUTCDate(departure.getUTCDate() + day);
          departure.setUTCHours(departureHour, minutes, 0, 0);
          const duration = 60 + Math.floor(rand() * 540);
          const arrival = new Date(departure.getTime() + duration * 60_000);
          const stops = rand() > 0.7 ? 1 : 0;
          const basePrice = 80 + Math.floor(duration / 60) * 35;
          const price = Math.round(basePrice + rand() * 220);
          flights.push({
            id: `${airline.code}-${origin.code}-${destination.code}-${day}-${f}`,
            flightNumber: `${airline.code}${100 + Math.floor(rand() * 900)}`,
            airline: airline.name,
            airlineCode: airline.code,
            origin: origin.code,
            destination: destination.code,
            departureTime: departure.toISOString(),
            arrivalTime: arrival.toISOString(),
            durationMinutes: duration,
            stops,
            price,
            seatsAvailable: 20 + Math.floor(rand() * 80),
            aircraft: AIRCRAFT[Math.floor(rand() * AIRCRAFT.length)],
          });
        }
      }
    }
  }
  return flights;
}

export const ALL_FLIGHTS: Flight[] = generateFlights();

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export function searchFlights(params: SearchParams): Flight[] {
  return ALL_FLIGHTS.filter((f) => {
    if (f.origin !== params.origin) return false;
    if (f.destination !== params.destination) return false;
    if (f.departureTime.slice(0, 10) !== params.date) return false;
    if (f.seatsAvailable < params.passengers) return false;
    return true;
  }).sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

export function getFlightById(id: string): Flight | undefined {
  return ALL_FLIGHTS.find((f) => f.id === id);
}

// Available dates with flights (for empty-result fallbacks)
export function availableDatesForRoute(origin: string, destination: string): string[] {
  const set = new Set<string>();
  for (const f of ALL_FLIGHTS) {
    if (f.origin === origin && f.destination === destination) {
      set.add(f.departureTime.slice(0, 10));
    }
  }
  return Array.from(set).sort();
}
