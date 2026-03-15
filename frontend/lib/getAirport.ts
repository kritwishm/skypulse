import airports, { type AirportInfo } from "./airports";

const airportMap = new Map<string, AirportInfo>();
for (const airport of airports) {
  airportMap.set(airport.iata, airport);
}

export function getAirport(iata: string): AirportInfo | undefined {
  return airportMap.get(iata.toUpperCase());
}
