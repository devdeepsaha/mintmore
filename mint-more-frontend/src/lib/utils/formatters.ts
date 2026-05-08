/**
 * Formats a number as Indian Rupees (INR) using the en-IN locale.
 * e.g. formatINR(125000) → "₹1,25,000"
 */
export function formatINR(
  amount: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Formats a number as a compact INR value.
 * e.g. formatINRCompact(125000) → "₹1.25L"
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(2)}Cr`;
  }
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(2)}L`;
  }
  if (amount >= 1_000) {
    return `₹${(amount / 1_000).toFixed(1)}K`;
  }
  return formatINR(amount);
}

/**
 * Formats a Date or ISO string to a readable date.
 * e.g. "12 Jul 2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a Date or ISO string to a readable date + time.
 * e.g. "12 Jul 2024, 3:45 PM"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Formats a Date or ISO string to relative time.
 * e.g. "2 hours ago", "just now", "in 3 days"
 */
export function formatRelativeTime(date?: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });

  if (Math.abs(diffSecs) < 60) return "just now";
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");

  return formatDate(d);
}

/**
 * Formats a time duration in minutes to a human-readable string.
 * e.g. formatDuration(90) → "1h 30m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Truncates a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Formats a freelancer level for display.
 */
export function formatFreelancerLevel(
  level: "beginner" | "intermediate" | "experienced",
): string {
  const map: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    experienced: "Experienced",
  };
  return map[level] ?? level;
}

/**
 * Formats a job status for display.
 */
export function formatJobStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Returns initials from a full name (up to 2 chars).
 * e.g. "Rahul Sharma" → "RS"
 */
export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}
