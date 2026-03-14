const getHost = () => {
  if (typeof window === "undefined") return "localhost:8000";
  return `${window.location.hostname}:8000`;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || `http://${getHost()}`;

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || `ws://${getHost()}/ws`;
