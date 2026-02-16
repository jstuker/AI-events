---
# Internal metadata (system-managed)
event_id: "{{ uuid }}"
date: "{{ now.Format "2006-01-02T15:04:05+01:00" }}"
status: "draft"
source: "manual"
created_at: "{{ now.Format "2006-01-02T15:04:05+01:00" }}"
updated_at: "{{ now.Format "2006-01-02T15:04:05+01:00" }}"

# Contact information
contact_name: ""
contact_email: ""
contact_phone: ""

# Event details
event_name: "{{ replace .File.ContentBaseName "-" " " | title }}"
event_description: ""
event_url: ""
event_start_date: ""
event_end_date: ""
event_price_type: "free"
event_price:
event_price_currency: "CHF"
event_low_price:
event_high_price:
event_price_availability: "InStock"
event_image_1x1: ""
event_image_16x9: ""
event_language: ["en"]
event_attendance_mode: "presence"
event_target_audience: ""

# Location
location_name: ""
location_address: ""

# Organizer
organizer_name: ""
organizer_url: ""

# Internal editorial fields
featured: false
featured_type: ""
tags: []
publication_channels: ["saiw"]

# Hugo taxonomies (populated from fields above)
locations: []
organizers: []
---

