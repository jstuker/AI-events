(function() {
  'use strict';

  // --- Pagination ---
  var PAGE_SIZE = 12;
  var visibleLimit = PAGE_SIZE;

  // --- View toggle ---
  var currentView = 'grid';

  // --- Filter element IDs ---
  var FILTER_IDS = ['filter-search', 'filter-city', 'filter-mode', 'filter-date-from'];
  var URL_PARAM_MAP = {
    'filter-search': 'q',
    'filter-city': 'city',
    'filter-mode': 'mode',
    'filter-date-from': 'from'
  };

  // --- URL parameter sync ---
  function readUrlParams() {
    var params = new URLSearchParams(window.location.search);
    FILTER_IDS.forEach(function(id) {
      var paramName = URL_PARAM_MAP[id];
      var val = params.get(paramName);
      var el = document.getElementById(id);
      if (el && val) {
        el.value = val;
      }
    });
    var view = params.get('view');
    if (view && (view === 'grid' || view === 'list' || view === 'calendar')) {
      setView(view);
    }
  }

  function writeUrlParams() {
    var params = new URLSearchParams();
    FILTER_IDS.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && el.value) {
        params.set(URL_PARAM_MAP[id], el.value);
      }
    });
    if (currentView !== 'grid') {
      params.set('view', currentView);
    }
    var qs = params.toString();
    var newUrl = window.location.pathname + (qs ? '?' + qs : '');
    window.history.replaceState(null, '', newUrl);
  }

  function hasActiveFilters() {
    for (var i = 0; i < FILTER_IDS.length; i++) {
      var el = document.getElementById(FILTER_IDS[i]);
      if (el && el.value) return true;
    }
    return false;
  }

  window.setView = function(view) {
    currentView = view;
    var gridList = document.getElementById('events-list');
    var listView = document.getElementById('upcoming-list-view');
    var calendar = document.getElementById('calendar-view');
    var noResults = document.getElementById('no-results');
    var btnGrid = document.getElementById('btn-grid');
    var btnList = document.getElementById('btn-list');
    var btnCal = document.getElementById('btn-calendar');

    btnGrid.classList.toggle('active', view === 'grid');
    if (btnList) btnList.classList.toggle('active', view === 'list');
    btnCal.classList.toggle('active', view === 'calendar');

    if (view === 'calendar') {
      gridList.style.display = 'none';
      if (listView) listView.style.display = 'none';
      noResults.style.display = 'none';
      calendar.classList.add('active');
      renderCalendar();
    } else if (view === 'list') {
      gridList.style.display = 'none';
      if (listView) listView.style.display = '';
      calendar.classList.remove('active');
      applyFilters();
    } else {
      gridList.style.display = '';
      if (listView) listView.style.display = 'none';
      calendar.classList.remove('active');
      applyFilters();
    }
    writeUrlParams();
  };

  // --- Filtering ---
  function matchesSearch(card, query) {
    if (!query) return true;
    var searchData = card.dataset.search || '';
    var terms = query.split(/\s+/);
    for (var i = 0; i < terms.length; i++) {
      if (terms[i] && searchData.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  window.applyFilters = function() {
    var search = (document.getElementById('filter-search').value || '').toLowerCase().trim();
    var city = document.getElementById('filter-city').value;
    var mode = document.getElementById('filter-mode').value;
    var dateFrom = document.getElementById('filter-date-from').value;

    var cards = document.querySelectorAll('#events-list .event-card');
    var matchCount = 0;
    var shownCount = 0;
    var totalCount = cards.length;

    cards.forEach(function(card) {
      var match = true;

      if (!matchesSearch(card, search)) match = false;
      if (city && card.dataset.city !== city) match = false;
      if (mode && card.dataset.mode !== mode) match = false;
      if (dateFrom && card.dataset.date < dateFrom) match = false;

      if (match) {
        matchCount++;
        if (matchCount <= visibleLimit) {
          card.style.display = '';
          shownCount++;
        } else {
          card.style.display = 'none';
        }
      } else {
        card.style.display = 'none';
      }
    });

    document.getElementById('no-results').style.display = matchCount === 0 ? '' : 'none';

    // Update result count
    var resultCount = document.getElementById('result-count');
    if (resultCount) {
      var filtersActive = hasActiveFilters();
      if (filtersActive) {
        resultCount.textContent = matchCount + ' of ' + totalCount + ' events';
      } else {
        resultCount.textContent = totalCount + ' events';
      }
    }

    // Show/hide reset button
    var btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.style.display = hasActiveFilters() ? '' : 'none';
    }

    // Update load-more button
    var loadMore = document.getElementById('load-more');
    if (loadMore) {
      loadMore.style.display = (matchCount > shownCount) ? '' : 'none';
      var remaining = matchCount - shownCount;
      loadMore.textContent = 'Load more (' + remaining + ' remaining)';
    }

    if (currentView === 'calendar') {
      renderCalendar();
    }

    if (currentView === 'list') {
      renderListView();
    }

    writeUrlParams();
  };

  window.loadMore = function() {
    visibleLimit += PAGE_SIZE;
    applyFilters();
  };

  window.resetFilters = function() {
    FILTER_IDS.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    visibleLimit = PAGE_SIZE;
    applyFilters();
  };

  // --- HTML escaping ---
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- List view ---
  function renderListView() {
    var events = getFilteredEvents();
    var tbody = document.getElementById('upcoming-list-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    events.forEach(function(ev) {
      var tr = document.createElement('tr');

      var tdDate = document.createElement('td');
      tdDate.className = 'date-col';
      var time = document.createElement('time');
      time.setAttribute('datetime', ev.date);
      var parts = ev.date.split('-');
      var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      time.textContent = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
      tdDate.appendChild(time);

      var tdName = document.createElement('td');
      var link = document.createElement('a');
      link.setAttribute('href', ev.href);
      link.textContent = ev.name;
      tdName.appendChild(link);

      var tdCity = document.createElement('td');
      tdCity.className = 'city-col';
      tdCity.textContent = ev.city || '';

      tr.appendChild(tdDate);
      tr.appendChild(tdName);
      tr.appendChild(tdCity);
      tbody.appendChild(tr);
    });
  }

  // --- Calendar view ---
  var calendarDate = new Date();

  // Find the earliest event to set initial calendar month
  var allCards = document.querySelectorAll('#events-list .event-card');
  if (allCards.length > 0) {
    var dates = [];
    allCards.forEach(function(card) {
      if (card.dataset.date) dates.push(card.dataset.date);
    });
    dates.sort();
    if (dates.length > 0) {
      var parts = dates[0].split('-');
      calendarDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    }
  }

  window.changeMonth = function(delta) {
    calendarDate.setMonth(calendarDate.getMonth() + delta);
    renderCalendar();
  };

  function getFilteredEvents() {
    var search = (document.getElementById('filter-search').value || '').toLowerCase().trim();
    var city = document.getElementById('filter-city').value;
    var mode = document.getElementById('filter-mode').value;
    var dateFrom = document.getElementById('filter-date-from').value;

    var events = [];
    document.querySelectorAll('#events-list .event-card').forEach(function(card) {
      var show = true;
      if (!matchesSearch(card, search)) show = false;
      if (city && card.dataset.city !== city) show = false;
      if (mode && card.dataset.mode !== mode) show = false;
      if (dateFrom && card.dataset.date < dateFrom) show = false;

      if (show) {
        var link = card.querySelector('h2 a');
        events.push({
          date: card.dataset.date,
          name: link ? link.textContent : 'Event',
          href: link ? link.getAttribute('href') : '#',
          featured: card.dataset.featured === 'true',
          city: card.dataset.city || ''
        });
      }
    });
    return events;
  }

  function renderCalendar() {
    var year = calendarDate.getFullYear();
    var month = calendarDate.getMonth();

    var monthNames = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    document.getElementById('calendar-month-label').textContent = monthNames[month] + ' ' + year;

    var firstDay = new Date(year, month, 1).getDay();
    var startOffset = (firstDay === 0) ? 6 : firstDay - 1; // Monday start
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var daysInPrevMonth = new Date(year, month, 0).getDate();

    var events = getFilteredEvents();
    var eventsByDate = {};
    events.forEach(function(ev) {
      if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
      eventsByDate[ev.date].push(ev);
    });

    var html = '';
    var dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    dayNames.forEach(function(d) {
      html += '<div class="calendar-day-header">' + d + '</div>';
    });

    // Previous month days
    for (var i = startOffset - 1; i >= 0; i--) {
      html += '<div class="calendar-day other-month"><div class="day-number">' + (daysInPrevMonth - i) + '</div></div>';
    }

    // Current month days
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var dayEvents = eventsByDate[dateStr] || [];
      html += '<div class="calendar-day"><div class="day-number">' + d + '</div>';
      dayEvents.forEach(function(ev) {
        html += '<a class="cal-event' + (ev.featured ? ' featured' : '') + '" href="' + escapeHtml(ev.href) + '" title="' + escapeHtml(ev.name) + '">' + escapeHtml(ev.name) + '</a>';
      });
      html += '</div>';
    }

    // Next month days to fill the grid
    var totalCells = startOffset + daysInMonth;
    var remaining = (7 - (totalCells % 7)) % 7;
    for (var n = 1; n <= remaining; n++) {
      html += '<div class="calendar-day other-month"><div class="day-number">' + n + '</div></div>';
    }

    document.getElementById('calendar-grid').innerHTML = html;
  }

  // --- Initialize from URL params ---
  readUrlParams();
  applyFilters();
})();
