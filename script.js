/* =====================================================================
   IEM Events — Department of CSE (AIML)
   JavaScript features implemented:
     1. Dynamic event rendering + category filtering
     2. Live countdown to the next upcoming event
     3. Digital clock (Asia/Kolkata)
     4. Dark / light mode toggle (remembered in localStorage)
     5. Registration form validation
     6. Feedback form validation
     7. Mobile navigation toggle + current-section highlighting
   ===================================================================== */

'use strict';

/* ---------------------------------------------------------------------
   1. Event data + rendering + filtering
   --------------------------------------------------------------------- */

const EVENTS = [
  {
    id: 'hackmatrix',
    name: 'HackMatrix 2026',
    date: '2026-11-14T08:00:00+05:30',
    venue: 'AIML Central Lab,Gurukul Campus, Kolkata',
    category: 'technical',
    description: 'A 12-hour student hackathon where teams build working technology prototypes and present their solutions. Organised by the ACM Student Chapter at Adamas University.'
  },
  {
    id: 'ai-workshop',
    name: 'AI & Machine Learning Workshop',
    date: '2026-11-20T10:00:00+05:30',
    venue: 'AI & ML Lab',
    category: 'workshop',
    description: 'A beginner-friendly workshop introducing artificial intelligence, machine learning and practical applications.'
  },
  {
    id: 'codesprint',
    name: 'CodeSprint 2026',
    date: '2026-11-22T10:00:00+05:30',
    venue: 'Computer Lab 1',
    category: 'technical',
    description: 'A programming challenge where students solve coding problems using logic, algorithms and problem-solving skills.'
  },
  {
    id: 'robotech',
    name: 'RoboTech Challenge',
    date: '2026-11-25T11:00:00+05:30',
    venue: 'Robotics Lab',
    category: 'technical',
    description: 'Students explore robotics concepts and demonstrate creative technology prototypes.'
  },
  {
    id: 'project-expo',
    name: 'InnovateX Project Expo',
    date: '2026-11-28T10:00:00+05:30',
    venue: 'Seminar Hall',
    category: 'technical',
    description: 'Students showcase software projects, innovative ideas and technology-based solutions to everyday problems.'
  },
  {
    id: 'cyberquest',
    name: 'CyberQuest 2026',
    date: '2026-12-02T11:00:00+05:30',
    venue: 'Computer Lab 2',
    category: 'technical',
    description: 'An educational cybersecurity event covering online privacy, digital safety, passwords and basic network security.'
  }
];

const CATEGORY_LABELS = {
  technical: 'Technical',
  workshop: 'Workshop',
  cultural: 'Cultural',
  lecture: 'Lecture'
};

const eventList = document.getElementById('eventList');
const eventEmpty = document.getElementById('eventEmpty');
const eventSelect = document.getElementById('eventSelect');

function formatDateParts(iso) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('en-IN', { day: '2-digit' }),
    month: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    full: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };
}

function renderEvents() {
  // Sort by date so the list always reads chronologically
  const sorted = [...EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date));

  eventList.innerHTML = sorted.map(ev => {
    const dt = formatDateParts(ev.date);
    return `
      <li class="event" data-category="${ev.category}">
        <div class="event-date">
          <span class="day">${dt.day}</span>
          <span class="month">${dt.month}</span>
        </div>
        <div class="event-body">
          <h3>${ev.name}</h3>
          <p class="event-venue">${dt.full}, ${dt.time} · ${ev.venue}</p>
          <p class="event-desc">${ev.description}</p>
        </div>
        <span class="event-tag">${CATEGORY_LABELS[ev.category]}</span>
      </li>`;
  }).join('');

  // Populate the registration dropdown from the same data
  sorted.forEach(ev => {
    const opt = document.createElement('option');
    opt.value = ev.id;
    opt.textContent = `${ev.name} (${formatDateParts(ev.date).day} ${formatDateParts(ev.date).month})`;
    eventSelect.appendChild(opt);
  });
}

function filterEvents(category) {
  let visible = 0;
  document.querySelectorAll('.event').forEach(el => {
    const show = category === 'all' || el.dataset.category === category;
    el.classList.toggle('is-hidden', !show);
    if (show) visible++;
  });
  eventEmpty.hidden = visible > 0;
}

document.getElementById('eventFilters').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
  btn.classList.add('is-active');
  filterEvents(btn.dataset.filter);
});

renderEvents();

/* ---------------------------------------------------------------------
   2. Countdown to the next upcoming event
   --------------------------------------------------------------------- */
const cd = {
  title: document.getElementById('cdTitle'),
  meta: document.getElementById('cdMeta'),
  days: document.getElementById('cdDays'),
  hours: document.getElementById('cdHours'),
  mins: document.getElementById('cdMins'),
  secs: document.getElementById('cdSecs')
};

function getNextEvent() {
  const now = Date.now();
  return [...EVENTS]
    .filter(ev => new Date(ev.date).getTime() > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
}

const pad = n => String(n).padStart(2, '0');

function updateCountdown() {
  const next = getNextEvent();
  if (!next) {
    cd.title.textContent = 'No upcoming events';
    cd.meta.textContent = 'Check back next semester.';
    cd.days.textContent = cd.hours.textContent = cd.mins.textContent = cd.secs.textContent = '00';
    return;
  }
  const dt = formatDateParts(next.date);
  cd.title.textContent = next.name;
  cd.meta.textContent = `${dt.full} · ${next.venue}`;

  let diff = Math.max(0, new Date(next.date).getTime() - Date.now());
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000);  diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);

  cd.days.textContent = pad(days);
  cd.hours.textContent = pad(hours);
  cd.mins.textContent = pad(mins);
  cd.secs.textContent = pad(secs);
}

/* ---------------------------------------------------------------------
   3. Digital clock (India Standard Time)
   --------------------------------------------------------------------- */
const clockEl = document.getElementById('clock');

function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

updateCountdown();
updateClock();
setInterval(() => { updateCountdown(); updateClock(); }, 1000);

/* ---------------------------------------------------------------------
   4. Dark / light mode
   --------------------------------------------------------------------- */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

function applyTheme(mode) {
  const dark = mode === 'dark';
  document.body.classList.toggle('dark', dark);
  themeIcon.textContent = dark ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  try { localStorage.setItem('iem-theme', mode); } catch (_) { /* storage may be unavailable */ }
}

(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('iem-theme'); } catch (_) {}
  if (saved) return applyTheme(saved);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
})();

themeToggle.addEventListener('click', () => {
  applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

/* ---------------------------------------------------------------------
   5 & 6. Form validation helpers
   --------------------------------------------------------------------- */
const RULES = {
  name:  { re: /^[A-Za-z][A-Za-z .'-]{1,59}$/, msg: 'Enter your full name (letters, spaces, dots only).' },
  roll:  { re: /^\d{10}$/, msg: 'Roll number must be exactly 10 digits.' },
  email: { re: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/, msg: 'Enter a valid email address, e.g. name@iem.edu.in.' },
  phone: { re: /^[6-9]\d{9}$/, msg: 'Enter a valid 10-digit Indian mobile number.' }
};

function setError(id, message) {
  const field = document.getElementById(id);
  const err = document.getElementById('err-' + id);
  if (field) field.classList.toggle('is-invalid', Boolean(message));
  if (err) err.textContent = message || '';
  return !message;
}

function validateText(id, rule) {
  const value = document.getElementById(id).value.trim();
  if (!value) return setError(id, 'This field is required.');
  if (rule && !rule.re.test(value)) return setError(id, rule.msg);
  return setError(id, '');
}

function validateSelect(id, message) {
  const value = document.getElementById(id).value;
  return setError(id, value ? '' : message);
}

/* --- Registration form --- */
const regForm = document.getElementById('regForm');
const regStatus = document.getElementById('regStatus');

regForm.addEventListener('submit', e => {
  e.preventDefault();

  const checks = [
    validateText('studentName', RULES.name),
    validateText('rollNo', RULES.roll),
    validateSelect('department', 'Select your department.'),
    validateText('email', RULES.email),
    validateText('phone', RULES.phone),
    (() => {
      const chosen = regForm.querySelector('input[name="gender"]:checked');
      return setError('gender', chosen ? '' : 'Select an option.');
    })(),
    validateSelect('eventSelect', 'Select the event you want to register for.')
  ];

  if (checks.every(Boolean)) {
    const name = document.getElementById('studentName').value.trim();
    const eventName = eventSelect.options[eventSelect.selectedIndex].text;
    regStatus.className = 'form-status ok';
    regStatus.textContent = `Registered. Thanks ${name} — you're on the list for ${eventName}. A confirmation will be sent to your email.`;
    regForm.reset();
    regForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  } else {
    regStatus.className = 'form-status bad';
    regStatus.textContent = 'Some fields need attention. Fix the highlighted ones and submit again.';
    const firstBad = regForm.querySelector('.is-invalid');
    if (firstBad) firstBad.focus();
  }
});

// Live re-validation: clear an error as soon as the user fixes the field
regForm.addEventListener('input', e => {
  const id = e.target.id;
  if (!id || !document.getElementById('err-' + id)) return;
  if (e.target.classList.contains('is-invalid')) {
    const map = { studentName: RULES.name, rollNo: RULES.roll, email: RULES.email, phone: RULES.phone };
    if (map[id]) validateText(id, map[id]);
    else if (e.target.tagName === 'SELECT') validateSelect(id, 'This field is required.');
  }
});

/* --- Feedback form --- */
const fbForm = document.getElementById('feedbackForm');
const fbStatus = document.getElementById('fbStatus');

fbForm.addEventListener('submit', e => {
  e.preventDefault();
  const checks = [
    validateText('fbName', RULES.name),
    validateText('fbEmail', RULES.email),
    (() => {
      const msg = document.getElementById('fbMessage').value.trim();
      if (!msg) return setError('fbMessage', 'Write a message before sending.');
      if (msg.length < 15) return setError('fbMessage', 'Message is too short — at least 15 characters.');
      return setError('fbMessage', '');
    })()
  ];

  if (checks.every(Boolean)) {
    fbStatus.className = 'form-status ok';
    fbStatus.textContent = 'Feedback sent. Thank you — the coordinators read every message.';
    fbForm.reset();
  } else {
    fbStatus.className = 'form-status bad';
    fbStatus.textContent = 'Fix the highlighted fields and send again.';
  }
});

/* ---------------------------------------------------------------------
   7. Mobile navigation + current-section highlighting
   --------------------------------------------------------------------- */
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

// Close the menu after choosing a link on mobile
siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  siteNav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

// Highlight the nav link for the section currently in view
const sections = document.querySelectorAll('main section[id]');
const navLinks = siteNav.querySelectorAll('a[href^="#"]');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}
