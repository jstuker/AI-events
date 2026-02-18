import { Link } from "react-router-dom";
import type { Event } from "../../types/event";
import { StatusBadge } from "../events/StatusBadge";

interface UpcomingEventsTableProps {
  readonly events: readonly Event[];
  readonly title: string;
}

export function UpcomingEventsTable({
  events,
  title,
}: UpcomingEventsTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
        {title}
      </h3>
      {events.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-gray-500">
          No upcoming events
        </p>
      ) : (
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[40%]" />
            <col className="w-[20%]" />
            <col className="w-[25%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
              <th className="px-4 py-2 font-medium">Event</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.event_id} className="border-b border-gray-50">
                <td className="truncate px-4 py-2">
                  <Link
                    to={`/events/${event.event_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {event.event_name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {event.event_start_date}
                </td>
                <td className="truncate px-4 py-2 text-gray-600">
                  {event.location_name}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={event.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
