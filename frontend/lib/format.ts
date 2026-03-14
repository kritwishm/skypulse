const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "\u20B9",
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  JPY: "\u00A5",
  CAD: "CA$",
  AUD: "A$",
  SGD: "S$",
  AED: "AED ",
  THB: "\u0E3F",
};

export function formatPrice(price: number, currency: string = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency} `;
  const maximumFractionDigits = ["JPY", "INR"].includes(currency.toUpperCase())
    ? 0
    : 2;

  const formatted = price.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });

  return `${symbol}${formatted}`;
}

export function formatDuration(duration: string | null): string {
  if (!duration) return "\u2014";
  return duration;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
