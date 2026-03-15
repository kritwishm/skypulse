import airports, { type AirportInfo } from "./airports";

/**
 * Search airports with a tiered strategy:
 * 1. Exact IATA match (e.g. "DEL" → DEL)
 * 2. IATA prefix (e.g. "GO" → GOI, GOX, GOO, ...)
 * 3. City/name starts with query (e.g. "kolk" → Kolkata)
 * 4. City/name contains query as substring
 *
 * Results are deduped and capped at `limit`.
 */
export function searchAirports(query: string, limit = 8): AirportInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const seen = new Set<string>();
  const out: AirportInfo[] = [];

  function add(a: AirportInfo) {
    if (seen.has(a.iata) || out.length >= limit) return;
    seen.add(a.iata);
    out.push(a);
  }

  const qUpper = q.toUpperCase();

  // Tier 1: Exact IATA match
  for (const a of airports) {
    if (a.iata === qUpper) {
      add(a);
      break;
    }
  }

  // Tier 2: IATA starts with query
  if (out.length < limit) {
    for (const a of airports) {
      if (a.iata.startsWith(qUpper)) add(a);
      if (out.length >= limit) break;
    }
  }

  // Tier 3: City or name starts with query
  if (out.length < limit) {
    for (const a of airports) {
      if (
        a.city.toLowerCase().startsWith(q) ||
        a.name.toLowerCase().startsWith(q)
      ) {
        add(a);
      }
      if (out.length >= limit) break;
    }
  }

  // Tier 4: City, name, or country contains query as substring
  if (out.length < limit) {
    for (const a of airports) {
      if (
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      ) {
        add(a);
      }
      if (out.length >= limit) break;
    }
  }

  return out;
}
