---
# Internal metadata (system-managed)
event_id: "{{ uuid }}"
date: "{{ now.Format "2006-01-02T15:04:05+01:00" }}"
slug: ""
status: "draft"
source: "manual"
created_at: "{{ now.Format "2006-01-02T15:04:05+01:00" }}"
updated_at: "{{ now.Format "2006-01-02T15:04:05+01:00" }}"

# Contact information (M = mandatory)
contact_name: ""       # M
contact_email: ""      # M
contact_phone: ""

# Event details
event_name: "{{ replace .File.ContentBaseName "-" " " | title }}"  # M
event_description: ""  # M
event_url: ""          # M
event_start_date: ""   # M — ISO-8601 with Zurich TZ, must match `date` above
event_end_date: ""     # M — ISO-8601 with Zurich TZ
event_price_type: "free"          # free | paid | range
event_price:                      # required when price_type = paid
event_price_currency: "CHF"       # required when any price is set
event_low_price:                  # required when price_type = range
event_high_price:                 # required when price_type = range
event_price_availability: "InStock"  # InStock | SoldOut | PreOrder
event_image_1x1: ""
event_image_16x9: ""
event_language: ["en"]            # de, fr, it, en
event_attendance_mode: "presence" # presence | online | hybrid
event_target_audience: ""

# Location — location_name also serves as Hugo `locations` taxonomy term
location_name: ""      # M
location_address: ""   # M

# Organizer — organizer_name also serves as Hugo `organizers` taxonomy term
organizer_name: ""
organizer_url: ""

# Editorial & taxonomy fields
featured: false
featured_type: ""      # badge | accent_border | larger_card | position_boost
tags: []               # also used as Hugo `tags` taxonomy
publication_channels: ["saiw"]
locations: []          # must contain [location_name] — Hugo taxonomy
organizers: []         # must contain [organizer_name] — Hugo taxonomy
---

