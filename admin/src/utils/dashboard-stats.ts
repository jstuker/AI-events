import type { Event, EventStatus } from "../types/event";

export interface DashboardStats {
  readonly total: number;
  readonly byStatus: Readonly<Record<EventStatus, number>>;
  readonly pendingDraft: number;
  readonly pendingReview: number;
  readonly published: number;
  readonly submissionsThisWeek: number;
  readonly submissionsThisMonth: number;
  readonly upcoming: readonly Event[];
  readonly reviewQueue: readonly Event[];
}

const ALL_STATUSES: readonly EventStatus[] = [
  "draft",
  "review",
  "pending",
  "approved",
  "published",
  "archived",
];

function countByStatus(
  events: readonly Event[],
): Readonly<Record<EventStatus, number>> {
  const counts = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<
    EventStatus,
    number
  >;

  for (const event of events) {
    counts[event.status] = (counts[event.status] ?? 0) + 1;
  }

  return counts;
}

function isWithinDays(dateStr: string, days: number, now: Date): boolean {
  const date = new Date(dateStr);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff && date <= now;
}

export function computeDashboardStats(
  events: readonly Event[],
  now: Date = new Date(),
): DashboardStats {
  const byStatus = countByStatus(events);

  const pendingDraft = byStatus.draft + byStatus.pending;
  const pendingReview = byStatus.review + byStatus.pending;

  const published = byStatus.published;

  const submissionsThisWeek = events.filter((e) =>
    isWithinDays(e.created_at, 7, now),
  ).length;

  const submissionsThisMonth = events.filter((e) =>
    isWithinDays(e.created_at, 30, now),
  ).length;

  const todayStr = now.toISOString().slice(0, 10);
  const upcoming = [...events]
    .filter((e) => e.event_start_date >= todayStr)
    .sort((a, b) => a.event_start_date.localeCompare(b.event_start_date))
    .slice(0, 10);

  const reviewQueue = [...events]
    .filter(
      (e) =>
        e.status === "draft" || e.status === "review" || e.status === "pending",
    )
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  return {
    total: events.length,
    byStatus,
    pendingDraft,
    pendingReview,
    published,
    submissionsThisWeek,
    submissionsThisMonth,
    upcoming,
    reviewQueue,
  };
}
