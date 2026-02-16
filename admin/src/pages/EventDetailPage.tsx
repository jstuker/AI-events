import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import type { Event, EventStatus } from "../types/event";
import type { CommitEntry, EventFormData } from "../types/event-form";
import {
  eventToFormData,
  formDataToEvent,
  combineDateTime,
} from "../types/event-form";
import { useAuth } from "../hooks/useAuth";
import { useEventForm } from "../hooks/useEventForm";
import {
  fetchEventByPath,
  fetchEventById,
  saveEvent,
  fetchEventHistory,
} from "../services/event-detail-service";
import { EventDetailView } from "../components/events/EventDetailView";
import { EventEditForm } from "../components/events/EventEditForm";
import { EventHistory } from "../components/events/EventHistory";
import { StatusTransitionControl } from "../components/events/StatusTransitionControl";
import { DuplicateAlert } from "../components/events/DuplicateAlert";
import { SaveDialog } from "../components/ui/SaveDialog";
import { getNextStatuses } from "../utils/status-workflow";
import { fetchAllEvents } from "../services/event-service";
import { findDuplicatesForEvent } from "../utils/duplicate-detection";
import type { DuplicateMatch } from "../utils/duplicate-detection";

type Tab = "details" | "history";

const EMPTY_FORM_DATA: EventFormData = {
  event_id: "",
  date: "",
  slug: "",
  status: "draft",
  source: "",
  created_at: "",
  updated_at: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  event_name: "",
  event_description: "",
  event_url: "",
  event_start_date: "",
  event_start_time: "",
  event_end_date: "",
  event_end_time: "",
  event_price_type: "free",
  event_price: null,
  event_price_currency: "CHF",
  event_low_price: null,
  event_high_price: null,
  event_price_availability: "InStock",
  event_image_1x1: "",
  event_image_16x9: "",
  event_language: [],
  event_attendance_mode: "presence",
  event_target_audience: "",
  location_name: "",
  location_address: "",
  organizer_name: "",
  organizer_url: "",
  featured: false,
  featured_type: "",
  tags: [],
  publication_channels: [],
  locations: [],
  cities: [],
  organizers: [],
  body: "",
};

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const { token } = useAuth();

  const filePath =
    (location.state as { filePath?: string } | null)?.filePath ?? "";

  const [event, setEvent] = useState<Event | null>(null);
  const [sha, setSha] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [commits, setCommits] = useState<readonly CommitEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<
    readonly DuplicateMatch[]
  >([]);

  const form = useEventForm(event ? eventToFormData(event) : EMPTY_FORM_DATA);

  const loadEvent = useCallback(async () => {
    if (!token || !eventId) return;
    setIsLoading(true);
    setError("");
    try {
      const result = filePath
        ? await fetchEventByPath(token, filePath)
        : await fetchEventById(token, eventId);
      setEvent(result.event);
      setSha(result.sha);
      form.reset(eventToFormData(result.event));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setIsLoading(false);
    }
  }, [token, eventId, filePath, form]);

  const loadHistory = useCallback(async () => {
    if (!token || !event) return;
    setIsLoadingHistory(true);
    try {
      const history = await fetchEventHistory(token, event.filePath);
      setCommits(history);
    } catch {
      // History is non-critical, silently handle
    } finally {
      setIsLoadingHistory(false);
    }
  }, [token, event]);

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, eventId]);

  useEffect(() => {
    if (activeTab === "history" && commits.length === 0) {
      loadHistory();
    }
  }, [activeTab, commits.length, loadHistory]);

  useEffect(() => {
    if (!token || !event) return;
    let cancelled = false;
    fetchAllEvents(token)
      .then((allEvents) => {
        if (!cancelled) {
          setDuplicateMatches(findDuplicatesForEvent(event, allEvents));
        }
      })
      .catch(() => {
        // Duplicate detection is non-critical
      });
    return () => {
      cancelled = true;
    };
  }, [token, event]);

  const handleEdit = () => {
    if (event) {
      form.reset(eventToFormData(event));
      setIsEditing(true);
      setSaveSuccess("");
    }
  };

  const handleCancel = () => {
    if (event) {
      form.reset(eventToFormData(event));
    }
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    if (form.validate()) {
      setShowSaveDialog(true);
    }
  };

  const handleSave = async (message: string) => {
    if (!token || !event) return;
    setIsSaving(true);
    setError("");
    try {
      const updatedFormData: EventFormData = {
        ...form.formData,
        date: combineDateTime(
          form.formData.event_start_date,
          form.formData.event_start_time,
        ),
        updated_at: new Date().toISOString(),
      };
      const updatedEvent = formDataToEvent(updatedFormData, event.filePath);
      const result = await saveEvent(
        token,
        updatedEvent,
        event.filePath,
        sha,
        message,
      );
      setEvent(result.event);
      setSha(result.sha);
      form.reset(eventToFormData(result.event));
      setIsEditing(false);
      setShowSaveDialog(false);
      setSaveSuccess("Event saved successfully");
      setCommits([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
      setShowSaveDialog(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusTransition = async (newStatus: EventStatus) => {
    if (!token || !event) return;
    setIsTransitioning(true);
    setError("");
    setSaveSuccess("");
    try {
      const updatedFormData: EventFormData = {
        ...form.formData,
        status: newStatus,
        date: combineDateTime(
          form.formData.event_start_date,
          form.formData.event_start_time,
        ),
        updated_at: new Date().toISOString(),
      };
      const updatedEvent = formDataToEvent(updatedFormData, event.filePath);
      const message = `status: ${event.status} → ${newStatus} — ${event.event_name}`;
      const result = await saveEvent(
        token,
        updatedEvent,
        event.filePath,
        sha,
        message,
      );
      setEvent(result.event);
      setSha(result.sha);
      form.reset(eventToFormData(result.event));
      setSaveSuccess(`Status changed to ${newStatus}`);
      setCommits([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsTransitioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading event...</p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="p-6">
        <Link
          to="/events"
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
        >
          &larr; Back to events
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/events"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            &larr; Back to events
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {event.event_name}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <StatusTransitionControl
        currentStatus={event.status}
        eventName={event.event_name}
        formData={form.formData}
        onTransition={handleStatusTransition}
        isTransitioning={isTransitioning}
      />

      <DuplicateAlert matches={duplicateMatches} />

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-800 text-sm">{saveSuccess}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === "details"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {activeTab === "details" &&
        (isEditing ? (
          <EventEditForm
            formData={form.formData}
            errors={form.errors}
            setField={form.setField}
            setArray={form.setArray}
            allowedStatuses={[event.status, ...getNextStatuses(event.status)]}
          />
        ) : (
          <EventDetailView event={event} />
        ))}

      {activeTab === "history" && (
        <EventHistory commits={commits} isLoading={isLoadingHistory} />
      )}

      {showSaveDialog && (
        <SaveDialog
          defaultMessage={`Update event: ${event.event_name}`}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  );
}
