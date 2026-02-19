(function() {
  'use strict';

  var form = document.getElementById('submit-form');
  var submitBtn = document.getElementById('submit-btn');
  var statusDiv = document.getElementById('form-status');
  var priceTypeSelect = document.getElementById('event_price_type');
  var pricePaidFields = document.getElementById('price-paid-fields');
  var priceRangeFields = document.getElementById('price-range-fields');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Toggle price fields based on price type
  priceTypeSelect.addEventListener('change', function() {
    pricePaidFields.classList.toggle('visible', this.value === 'paid');
    priceRangeFields.classList.toggle('visible', this.value === 'range');
  });

  // Set minimum dates to today
  var today = new Date().toISOString().split('T')[0];
  document.getElementById('event_start_date').setAttribute('min', today);
  document.getElementById('event_end_date').setAttribute('min', today);

  // Sync end date minimum to start date
  document.getElementById('event_start_date').addEventListener('change', function() {
    var endDate = document.getElementById('event_end_date');
    endDate.setAttribute('min', this.value);
    if (endDate.value && endDate.value < this.value) {
      endDate.value = this.value;
    }
  });

  var REQUIRED_FIELDS = [
    { id: 'contact_name', label: 'Contact Name' },
    { id: 'contact_email', label: 'Email', type: 'email' },
    { id: 'event_name', label: 'Event Name' },
    { id: 'event_description', label: 'Event Description' },
    { id: 'event_url', label: 'Event URL', type: 'url' },
    { id: 'event_start_date', label: 'Start Date' },
    { id: 'event_end_date', label: 'End Date' },
    { id: 'location_name', label: 'Location Name' },
    { id: 'location_address', label: 'Location Address' }
  ];

  function clearErrors() {
    var errorEls = form.querySelectorAll('.error-message');
    for (var i = 0; i < errorEls.length; i++) {
      errorEls[i].classList.remove('visible');
      errorEls[i].textContent = '';
    }
    var inputEls = form.querySelectorAll('.error');
    for (var j = 0; j < inputEls.length; j++) {
      inputEls[j].classList.remove('error');
    }
  }

  function showError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.add('error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateUrl(url) {
    try { new URL(url); return true; } catch (_) { return false; }
  }

  function validate() {
    clearErrors();
    var valid = true;

    for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
      var field = REQUIRED_FIELDS[i];
      var el = document.getElementById(field.id);
      var value = el ? el.value.trim() : '';

      if (!value) {
        showError(field.id, field.label + ' is required.');
        valid = false;
        continue;
      }

      if (field.type === 'email' && !validateEmail(value)) {
        showError(field.id, 'Please enter a valid email address.');
        valid = false;
      }
      if (field.type === 'url' && !validateUrl(value)) {
        showError(field.id, 'Please enter a valid URL (starting with https://).');
        valid = false;
      }
    }

    // Validate end date >= start date
    var startDate = document.getElementById('event_start_date').value;
    var endDate = document.getElementById('event_end_date').value;
    if (startDate && endDate && endDate < startDate) {
      showError('event_end_date', 'End date must be on or after start date.');
      valid = false;
    }

    return valid;
  }

  function getFormData() {
    var getValue = function(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    var languages = [];
    var langCheckboxes = form.querySelectorAll('input[name="event_language"]:checked');
    for (var i = 0; i < langCheckboxes.length; i++) {
      languages.push(langCheckboxes[i].value);
    }

    var priceType = getValue('event_price_type');

    return {
      contact_name: getValue('contact_name'),
      contact_email: getValue('contact_email'),
      contact_phone: getValue('contact_phone'),
      event_name: getValue('event_name'),
      event_description: getValue('event_description'),
      event_url: getValue('event_url'),
      event_start_date: getValue('event_start_date'),
      event_start_time: getValue('event_start_time'),
      event_end_date: getValue('event_end_date'),
      event_end_time: getValue('event_end_time'),
      event_attendance_mode: getValue('event_attendance_mode'),
      event_language: languages,
      event_target_audience: getValue('event_target_audience'),
      event_price_type: priceType,
      event_price: priceType === 'paid' ? parseFloat(getValue('event_price')) || null : null,
      event_low_price: priceType === 'range' ? parseFloat(getValue('event_low_price')) || null : null,
      event_high_price: priceType === 'range' ? parseFloat(getValue('event_high_price')) || null : null,
      event_price_currency: 'CHF',
      event_image_1x1: getValue('event_image_1x1'),
      event_image_16x9: getValue('event_image_16x9'),
      location_name: getValue('location_name'),
      location_address: getValue('location_address'),
      organizer_name: getValue('organizer_name'),
      organizer_url: getValue('organizer_url')
    };
  }

  function showStatus(type, message, useHtml) {
    statusDiv.className = 'form-status ' + type;
    if (useHtml) {
      statusDiv.innerHTML = message;
    } else {
      statusDiv.textContent = message;
    }
    statusDiv.style.display = 'block';
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    statusDiv.style.display = 'none';

    if (uploadsInProgress > 0) {
      showStatus('error', 'Please wait for image uploads to complete.');
      return;
    }

    if (!validate()) {
      // Scroll to first error
      var firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    var data = getFormData();

    fetch('/api/events/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      return response.json().then(function(body) {
        return { ok: response.ok, body: body };
      });
    })
    .then(function(result) {
      if (result.ok) {
        var eventName = result.body.event_name || 'Your event';
        var eventId = result.body.event_id || '';
        var html = '<h4>Thank you for your submission!</h4>'
          + '<p><strong>' + escapeHtml(eventName) + '</strong> has been submitted for review by the Swiss {ai} Events team.</p>'
          + '<p>We have sent a confirmation to your email address. You will be notified once your event has been reviewed and published.</p>'
          + (eventId ? '<p class="submission-id">Submission ID: ' + escapeHtml(eventId) + '</p>' : '');
        showStatus('success', html, true);
        form.reset();
        pricePaidFields.classList.remove('visible');
        priceRangeFields.classList.remove('visible');
      } else {
        showStatus('error', result.body.error || 'Something went wrong. Please try again.');
      }
    })
    .catch(function() {
      showStatus('error', 'Network error. Please check your connection and try again.');
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Event';
    });
  });

  // --- File upload handling ---
  var ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  var MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  var uploadsInProgress = 0;

  function setUploadStatus(fieldId, state, message) {
    var statusEl = document.getElementById(fieldId + '_status');
    if (!statusEl) return;
    statusEl.className = 'upload-status ' + state;
    statusEl.textContent = message;
  }

  function handleFileSelect(fileInput, hiddenInputId) {
    var file = fileInput.files[0];
    if (!file) return;

    var hiddenInput = document.getElementById(hiddenInputId);
    var fieldId = fileInput.id.replace('_file', '');

    // Client-side validation
    if (ALLOWED_TYPES.indexOf(file.type) === -1) {
      setUploadStatus(fieldId, 'upload-error', 'Invalid file type. Use JPEG, PNG, or GIF.');
      fileInput.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setUploadStatus(fieldId, 'upload-error', 'File too large. Maximum 10 MB.');
      fileInput.value = '';
      return;
    }

    // Upload file to server (server stores in Vercel Blob)
    uploadsInProgress++;
    submitBtn.disabled = true;
    setUploadStatus(fieldId, 'uploading', 'Uploading ' + file.name + '...');

    fetch('/api/upload', {
      method: 'POST',
      headers: { 'X-Content-Type': file.type },
      body: file
    })
    .then(function(response) {
      if (!response.ok) {
        return response.text().then(function(text) {
          try {
            var err = JSON.parse(text);
            throw new Error(err.error || 'Upload failed');
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) {
              throw new Error('Upload failed (server error). Please try again.');
            }
            throw parseErr;
          }
        });
      }
      return response.json();
    })
    .then(function(data) {
      hiddenInput.value = data.url;
      setUploadStatus(fieldId, 'done', 'Uploaded: ' + file.name);
    })
    .catch(function(err) {
      setUploadStatus(fieldId, 'upload-error', err.message || 'Upload failed. Please try again.');
      hiddenInput.value = '';
      fileInput.value = '';
    })
    .finally(function() {
      uploadsInProgress = Math.max(0, uploadsInProgress - 1);
      if (uploadsInProgress === 0) {
        submitBtn.disabled = false;
      }
    });
  }

  document.getElementById('event_image_1x1_file').addEventListener('change', function() {
    handleFileSelect(this, 'event_image_1x1');
  });
  document.getElementById('event_image_16x9_file').addEventListener('change', function() {
    handleFileSelect(this, 'event_image_16x9');
  });

  // Clear upload state on form reset
  form.addEventListener('reset', function() {
    document.getElementById('event_image_1x1').value = '';
    document.getElementById('event_image_16x9').value = '';
    setUploadStatus('event_image_1x1', '', '');
    setUploadStatus('event_image_16x9', '', '');
  });

  // Clear field error on input
  form.addEventListener('input', function(e) {
    var target = e.target;
    if (target.classList.contains('error')) {
      target.classList.remove('error');
      var errorEl = document.getElementById(target.id + '-error');
      if (errorEl) {
        errorEl.classList.remove('visible');
        errorEl.textContent = '';
      }
    }
  });
})();
