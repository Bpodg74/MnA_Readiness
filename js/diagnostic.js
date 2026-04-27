/* ── State ────────────────────────────────────────────────── */
const answers = {};

const dimensions = [
  { id: 'q1',  label: 'Financial documentation',    weight: 2 },
  { id: 'q2',  label: 'Business plan readiness',    weight: 2 },
  { id: 'q3',  label: 'Value proposition',          weight: 1.5 },
  { id: 'q4',  label: 'Revenue breakdown',          weight: 1.5 },
  { id: 'q5',  label: 'Client concentration',       weight: 1 },
  { id: 'q6',  label: 'KPI & retention tracking',   weight: 1 },
  { id: 'q7',  label: 'Growth strategy',            weight: 1.5 },
  { id: 'q8',  label: 'Org & tech documentation',   weight: 1 },
  { id: 'q9',  label: 'Management independence',    weight: 1 },
  { id: 'q10', label: 'Shareholding clarity',       weight: 2 },
  { id: 'q11', label: 'Contracts & transferability',weight: 1.5 },
  { id: 'q12', label: 'Stakeholder alignment',      weight: 1 },
];

const stepProgress = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };

/* ── Navigation ──────────────────────────────────────────── */
function goStep(n) {
  document.querySelectorAll('.diag-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + n).classList.add('active');
  document.getElementById('stepLabel').textContent = 'Step ' + n + ' of 5';
  document.getElementById('progressFill').style.width = stepProgress[n] + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (n === 5) renderResults();
}

/* ── Option selection ────────────────────────────────────── */
document.addEventListener('click', function(e) {
  const opt = e.target.closest('.q-opt');
  if (!opt) return;

  const group = opt.closest('.q-options');
  const qId   = group.dataset.q;
  const val   = parseInt(opt.dataset.val, 10);

  group.querySelectorAll('.q-opt').forEach(o => o.classList.remove('selected'));
  opt.classList.add('selected');
  answers[qId] = val;

  checkStepComplete(opt.closest('.diag-step'));
  if (qId === 'q1' || qId === 'q2' || qId === 'q3') maybeShowSignal();
});

function checkStepComplete(stepEl) {
  if (!stepEl) return;
  const stepId = stepEl.id;
  const stepNum = parseInt(stepId.replace('step', ''), 10);
  const groups = stepEl.querySelectorAll('.q-options');
  const allAnswered = Array.from(groups).every(g => answers[g.dataset.q] !== undefined);
  const nextBtn = document.getElementById('next' + stepNum);
  if (nextBtn) nextBtn.disabled = !allAnswered;
}

/* ── Signal reveal after first 3 questions ───────────────── */
function maybeShowSignal() {
  if (answers.q1 === undefined || answers.q2 === undefined || answers.q3 === undefined) return;

  const raw = (answers.q1 + answers.q2 + answers.q3);
  const pct = Math.round((raw / 6) * 100);

  const signal = document.getElementById('signal1');
  const scoreEl = document.getElementById('signalScore');
  const msgEl = document.getElementById('signalMsg');

  scoreEl.textContent = pct + '%';

  if (pct >= 67) {
    msgEl.textContent = 'Strong foundations on the core three indicators. Continue to understand your full picture across all eight dimensions.';
  } else if (pct >= 34) {
    msgEl.textContent = 'Some foundations in place, but meaningful gaps exist. Completing the full diagnostic will identify where to focus.';
  } else {
    msgEl.textContent = 'These three indicators suggest the business needs preparation before entering an M&A process. The good news: this is fixable.';
  }

  signal.style.display = 'block';
}

/* ── Scoring engine ──────────────────────────────────────── */
function calcScore() {
  let totalWeight = 0;
  let totalScore  = 0;

  dimensions.forEach(d => {
    const val = answers[d.id];
    if (val !== undefined) {
      totalWeight += d.weight;
      totalScore  += (val / 2) * d.weight;
    }
  });

  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
}

function getRating(score) {
  if (score >= 75) return { label: 'M&A ready',         msg: 'Your business shows strong preparation across most dimensions. You are well-placed to enter a process with confidence.' };
  if (score >= 50) return { label: 'Progressing',        msg: 'Solid foundations in some areas, but material gaps remain. A structured programme over 3–6 months would significantly strengthen your position.' };
  if (score >= 25) return { label: 'Early preparation',  msg: 'Significant work is needed before entering a process. Buyers will identify these gaps quickly — addressing them now protects your valuation.' };
  return              { label: 'Not yet process-ready', msg: 'The business is at an early stage of M&A preparation. This is common and addressable — but requires a structured approach before going to market.' };
}

/* ── Results rendering ───────────────────────────────────── */
function renderResults() {
  const score   = calcScore();
  const rating  = getRating(score);

  /* Dial animation */
  const arc = document.getElementById('dialArc');
  const circumference = 326.7;
  const offset = circumference - (score / 100) * circumference;
  setTimeout(() => { arc.style.strokeDashoffset = offset; arc.style.transition = 'stroke-dashoffset 1.2s ease'; }, 100);

  document.getElementById('scoreNum').textContent     = score;
  document.getElementById('scoreRating').textContent  = rating.label;
  document.getElementById('scoreSummary').textContent = rating.msg;

  /* Dimension breakdown */
  const container = document.getElementById('breakdown');
  container.innerHTML = '<p class="breakdown-title">Score by dimension</p>';

  dimensions.forEach(d => {
    const val = answers[d.id] !== undefined ? answers[d.id] : 0;
    const pct = Math.round((val / 2) * 100);
    const cls = pct >= 67 ? 'high' : pct >= 34 ? 'mid' : 'low';

    const row = document.createElement('div');
    row.className = 'bdim';
    row.innerHTML = `
      <span class="bdim-label">${d.label}</span>
      <div class="bdim-track">
        <div class="bdim-fill ${cls}" style="width:0%"></div>
      </div>`;
    container.appendChild(row);

    /* Animate bars in after paint */
    setTimeout(() => { row.querySelector('.bdim-fill').style.width = pct + '%'; }, 200);
  });
}

/* ── Gap report content ──────────────────────────────────── */
const gapAdvice = {
  q1: {
    label: 'Financial documentation',
    gap:   'Your financials are not yet in a form buyers will accept.',
    action:'Engage an auditor now to certify the last 3 years of P&L, balance sheet and cash flows. Buyers will not proceed without this — and gaps discovered late in a process cause repricing.',
  },
  q2: {
    label: 'Business plan model',
    gap:   'You lack an investor-ready 5-year business plan.',
    action:'Build a structured financial model with a historical base, key assumptions, growth scenarios and sensitivity analysis. This is the single document buyers spend the most time on.',
  },
  q3: {
    label: 'Value proposition',
    gap:   'Your competitive differentiation is not clearly documented.',
    action:'Create a concise investor narrative: what makes you hard to replicate, evidenced by client wins, retention data and market positioning. Buyers pay a premium for defensible differentiation.',
  },
  q4: {
    label: 'Revenue breakdown',
    gap:   'Revenue is not cleanly segmented by client type, channel or geography.',
    action:'Extract a revenue waterfall from your CRM or accounts — split by client type, brand, product line and geography. Unexplained revenue aggregation raises buyer concern immediately.',
  },
  q5: {
    label: 'Client concentration',
    gap:   'High client concentration creates deal risk.',
    action:'Document your top client relationships and their contract terms. If concentration is high, a proactive narrative on contract tenure and renewal probability helps defend the valuation.',
  },
  q6: {
    label: 'KPI & retention tracking',
    gap:   'You are not tracking the metrics buyers will ask for on day one.',
    action:'Build a KPI dashboard covering NRR, churn rate, cohort retention and ARR/MRR bridge. These metrics are now standard buyer expectations — absence signals operational immaturity.',
  },
  q7: {
    label: 'Growth strategy',
    gap:   'Your growth strategy is not documented or quantified.',
    action:'Produce a written strategy document: target markets, entry approach, market opportunity sizing and revenue bridge from today to year 5. Buyers are acquiring your future, not just your past.',
  },
  q8: {
    label: 'Organisation & technology',
    gap:   'Your org structure, tech stack and IP ownership are not documented.',
    action:'Create an org chart, a tech stack map (owned vs licensed vs third-party), and an IP register. Undocumented IP or unclear system ownership is a common deal-stopper in diligence.',
  },
  q9: {
    label: 'Management independence',
    gap:   'The business is too dependent on its founders.',
    action:'Identify the 2–3 key hires or delegation steps needed to make the business run independently. Buyers price founder dependency as a risk — demonstrating a capable team protects your multiple.',
  },
  q10: {
    label: 'Shareholding clarity',
    gap:   'Shareholding structure has gaps or unresolved complexities.',
    action:'Instruct a lawyer to review and update your cap table, shareholder agreements and any options or warrants. Structural complexity discovered in diligence can delay or kill a deal.',
  },
  q11: {
    label: 'Contracts & transferability',
    gap:   'Key contracts are informal or contain unclear change-of-control clauses.',
    action:'Formalise all key client, supplier and lease agreements. Review change-of-control clauses — consent requirements can delay closing by months if not addressed in advance.',
  },
  q12: {
    label: 'Stakeholder alignment',
    gap:   'Shareholders and board have not formally aligned on the exit.',
    action:'Hold a structured shareholder conversation to agree: desired outcome (full sale vs partial), valuation expectations, and timeline. Misaligned shareholders are a deal-killer — buyers will find out.',
  },
};

function getTopGaps() {
  return dimensions
    .map(d => ({ ...d, val: answers[d.id] !== undefined ? answers[d.id] : 0 }))
    .filter(d => d.val < 2)
    .sort((a, b) => (a.val - b.val) || (b.weight - a.weight))
    .slice(0, 3);
}

/* ── Form submission ─────────────────────────────────────── */
function submitReport(e) {
  e.preventDefault();

  /* Honeypot check — silent reject if filled */
  if (document.getElementById('honeypot').value !== '') return;

  const email = document.getElementById('gateEmail').value.trim();
  if (!email) return;

  const score   = calcScore();
  const rating  = getRating(score);
  const topGaps = getTopGaps();

  /* Build human-readable gap summary for the email payload */
  const gapText = topGaps.map((g, i) => {
    const advice = gapAdvice[g.id];
    return `Gap ${i+1}: ${advice.label}\n${advice.gap}\nWhat to do: ${advice.action}`;
  }).join('\n\n');

  const payload = {
    email,
    score,
    rating:  rating.label,
    message: rating.msg,
    gap_report: gapText,
    _subject:   `M&A Readiness Report — Score ${score}/100 (${rating.label})`,
    _replyto:   email,
    /* Formspree autoresponder fields */
    _autoresponse: buildAutoresponderEmail(score, rating, topGaps),
  };

  /* Show loading state */
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  fetch('https://formspree.io/f/xaqazzpp', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(payload),
  })
  .then(r => {
    if (r.ok) {
      /* Hide gate, show inline gap report immediately */
      document.getElementById('gateForm').style.display   = 'none';
      document.querySelector('.gate-title').style.display = 'none';
      document.querySelector('.gate-desc').style.display  = 'none';
      document.querySelector('.gate-note').style.display  = 'none';
      renderGapReport(score, rating, topGaps, email);
    } else {
      btn.textContent = 'Send me the report →';
      btn.disabled = false;
      alert('Something went wrong. Please try again.');
    }
  })
  .catch(() => {
    btn.textContent = 'Send me the report →';
    btn.disabled = false;
    alert('Connection error. Please try again.');
  });
}

/* ── Build autoresponder email text (sent via Formspree) ─── */
function buildAutoresponderEmail(score, rating, topGaps) {
  const lines = [
    `Your M&A Readiness Score: ${score}/100 — ${rating.label}`,
    '',
    rating.msg,
    '',
    '─────────────────────────────────',
    'YOUR TOP THREE READINESS GAPS',
    '─────────────────────────────────',
    '',
  ];
  topGaps.forEach((g, i) => {
    const a = gapAdvice[g.id];
    lines.push(`${i+1}. ${a.label.toUpperCase()}`);
    lines.push(a.gap);
    lines.push('');
    lines.push('What to do:');
    lines.push(a.action);
    lines.push('');
  });
  lines.push('─────────────────────────────────');
  lines.push('This report was generated by the M&A Readiness Index.');
  lines.push('All responses are confidential and will not be shared with third parties.');
  return lines.join('\n');
}

/* ── Render inline gap report on screen ──────────────────── */
function renderGapReport(score, rating, topGaps, email) {
  const container = document.getElementById('gateConfirm');

  const colorMap = { 0: '#b85c38', 1: '#b88a38', 2: '#2c4a3e' };
  const gapCards = topGaps.map((g, i) => {
    const a     = gapAdvice[g.id];
    const color = colorMap[g.val] || '#b85c38';
    return `
      <div class="gap-card">
        <div class="gap-card-head" style="border-left:3px solid ${color}">
          <span class="gap-n">Gap ${i+1}</span>
          <span class="gap-dim">${a.label}</span>
        </div>
        <p class="gap-issue">${a.gap}</p>
        <div class="gap-action-block">
          <p class="gap-action-label">What to do</p>
          <p class="gap-action">${a.action}</p>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="report-header">
      <p class="report-sent">Report sent to ${email}</p>
      <h3 class="report-title">Your personalised gap report</h3>
      <p class="report-sub">Based on your score of <strong>${score}/100</strong> — <em>${rating.label}</em></p>
    </div>
    <div class="gap-cards">${gapCards}</div>
    <div class="report-footer">
      <p class="report-footer-msg">These three areas represent your highest-priority preparation steps before entering an M&amp;A process. Addressing them systematically over 3–6 months will materially improve your valuation outcome and reduce deal risk.</p>
      <p class="report-footer-note">A copy of this report has been sent to ${email}.</p>
    </div>`;

  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
