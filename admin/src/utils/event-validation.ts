import type { EventFormData, ValidationErrors } from "../types/event-form";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_REGEX = /^https?:\/\/.+/;
const IMAGE_PATH_REGEX = /^(\/images\/|https?:\/\/)/;
// HTML5 spec email pattern: local-part@domain with proper label validation
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}/;

export function validateEvent(form: EventFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!form.event_name.trim()) {
    errors.event_name = "Event name is required";
  }

  if (form.slug && !SLUG_REGEX.test(form.slug)) {
    errors.slug = "Slug must be lowercase, hyphen-separated, ASCII only";
  }

  if (form.event_start_date && !DATE_REGEX.test(form.event_start_date)) {
    errors.event_start_date = "Invalid date format (expected YYYY-MM-DD)";
  }

  if (form.event_end_date && !DATE_REGEX.test(form.event_end_date)) {
    errors.event_end_date = "Invalid date format (expected YYYY-MM-DD)";
  }

  if (form.event_start_date && form.event_end_date) {
    if (form.event_end_date < form.event_start_date) {
      errors.event_end_date = "End date must be on or after start date";
    }
  }

  if (form.event_price_type === "paid" && form.event_price === null) {
    errors.event_price = "Price is required when type is paid";
  }

  if (form.event_price_type === "range") {
    if (form.event_low_price === null) {
      errors.event_low_price = "Low price is required for price range";
    }
    if (form.event_high_price === null) {
      errors.event_high_price = "High price is required for price range";
    }
    if (
      form.event_low_price !== null &&
      form.event_high_price !== null &&
      form.event_high_price < form.event_low_price
    ) {
      errors.event_high_price = "High price must be >= low price";
    }
  }

  if (form.event_url && !URL_REGEX.test(form.event_url)) {
    errors.event_url = "Must be a valid URL (http:// or https://)";
  }

  if (form.organizer_url && !URL_REGEX.test(form.organizer_url)) {
    errors.organizer_url = "Must be a valid URL (http:// or https://)";
  }

  if (form.contact_email && !EMAIL_REGEX.test(form.contact_email)) {
    errors.contact_email = "Must be a valid email address";
  }

  if (form.event_image_1x1 && !IMAGE_PATH_REGEX.test(form.event_image_1x1)) {
    errors.event_image_1x1 =
      "Must start with /images/ or be a full URL (https://)";
  }

  if (form.event_image_16x9 && !IMAGE_PATH_REGEX.test(form.event_image_16x9)) {
    errors.event_image_16x9 =
      "Must start with /images/ or be a full URL (https://)";
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
