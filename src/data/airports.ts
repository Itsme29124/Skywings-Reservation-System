export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi Intl", country: "India" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Intl", country: "India" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda Intl", country: "India" },
  { code: "MAA", city: "Chennai", name: "Chennai Intl", country: "India" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi Intl", country: "India" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose Intl", country: "India" },
  { code: "GOI", city: "Goa", name: "Dabolim Airport", country: "India" },
  { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE" },
  { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore" },
  { code: "LHR", city: "London", name: "Heathrow", country: "UK" },
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl", country: "USA" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France" },
];
