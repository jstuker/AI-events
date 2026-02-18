import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Event } from "../types/event";
import { useAuth } from "../hooks/useAuth";
import { fetchAllEvents } from "../services/event-service";
import { computeDashboardStats } from "../utils/dashboard-stats";
import { findAllDuplicateGroups } from "../utils/duplicate-detection";
import { StatCard } from "../components/dashboard/StatCard";
import { UpcomingEventsTable } from "../components/dashboard/UpcomingEventsTable";
import { DuplicatesPanel } from "../components/dashboard/DuplicatesPanel";

export function DashboardPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<readonly Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAllEvents(token);
      setEvents(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadEvents}
          className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = computeDashboardStats(events);
  const duplicateGroups = findAllDuplicateGroups(events);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Dashboard</h2>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Published"
          value={stats.published}
          linkTo="/events?status=published"
        />
        <StatCard
          label="Pending Draft"
          value={stats.pendingDraft}
          highlight={stats.pendingDraft > 0}
          linkTo="/events?status=draft"
        />
        <StatCard
          label="Pending Review"
          value={stats.pendingReview}
          highlight={stats.pendingReview > 0}
          linkTo="/events?status=review"
        />
        <StatCard
          label="Duplicates"
          value={duplicateGroups.length}
          highlight={duplicateGroups.length > 0}
        />
      </div>

      <div className="mb-6">
        <UpcomingEventsTable
          events={stats.eventsToReview}
          title="Events to Review"
        />
      </div>

      {duplicateGroups.length > 0 && (
        <div className="mb-6">
          <DuplicatesPanel groups={duplicateGroups} />
        </div>
      )}

      <div className="mb-6">
        <UpcomingEventsTable events={stats.upcoming} title="Upcoming Events" />
      </div>

      <div>
        <Link
          to="/events"
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          View All Events
        </Link>
      </div>
    </div>
  );
}
