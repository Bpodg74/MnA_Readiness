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

/* ── Form submission with bot protection ─────────────────── */
function submitReport(e) {
  e.preventDefault();

  /* Honeypot check */
  if (document.getElementById('honeypot').value !== '') return;

  const email = document.getElementById('gateEmail').value.trim();
  if (!email) return;

  /* Build payload */
  const score  = calcScore();
  const rating = getRating(score);
  const payload = {
    email,
    score,
    rating: rating.label,
    answers: JSON.stringify(answers),
    _subject: 'M&A Readiness — New diagnostic submission (score: ' + score + ')',
    _replyto: email,
  };

  /* Send via Formspree — replace YOUR_FORM_ID below */
  fetch('https://formspree.io/f/xaqazzpp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then(r => {
    if (r.ok) {
      document.getElementById('gateForm').style.display = 'none';
      document.querySelector('.gate-title').style.display = 'none';
      document.querySelector('.gate-desc').style.display = 'none';
      document.querySelector('.gate-note').style.display = 'none';
      document.getElementById('gateConfirm').style.display = 'block';
    } else {
      alert('Something went wrong. Please try again or email us directly.');
    }
  })
  .catch(() => { alert('Connection error. Please try again.'); });
}
