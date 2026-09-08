/* =====================================================
   DATE INVITATION — SCRIPT.JS
   Pure Vanilla JavaScript, no dependencies.
   ===================================================== */

"use strict";

/* ─────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────── */
let currentScreen  = "screen-intro";
let selectedDate   = "";
let selectedTime   = "";
let selectedPlan   = "";
let noAttempts     = 0;
let noVanished     = false;

// Texts shown on NO button before it vanishes
const NO_TEXTS = [
  "NO 😭",
  "Are you sure? 🥺",
  "Think again 😭",
  "Nice try 👀",
  "Really? 😂",
];

// Final message shown just before vanishing (shown at attempt 5)
const NO_FINAL_TEXT = "Okay... Too bad. 😂";

/* ─────────────────────────────────────────────────────
   SCREEN NAVIGATION
───────────────────────────────────────────────────── */
function showScreen(screenId) {
  const current = document.querySelector(".screen.active");
  const next    = document.getElementById(screenId);

  if (!next || next === current) return;

  // Animate out
  if (current) {
    current.style.animation = "screenFadeOut 0.35s ease both";
    setTimeout(() => {
      current.classList.remove("active");
      current.style.animation = "";
    }, 330);
  }

  // Animate in
  setTimeout(() => {
    next.style.animation = "";
    next.classList.add("active");
    next.scrollTop = 0;
    currentScreen = screenId;
  }, 340);
}

/* ─────────────────────────────────────────────────────
   HANDLE YES
───────────────────────────────────────────────────── */
function handleYes() {
  const btn  = document.getElementById("yes-btn");
  const card = btn.closest(".card");

  burstHearts(btn);

  card.classList.add("wobble");
  setTimeout(() => card.classList.remove("wobble"), 600);

  // Hide the NO button — it may have been reparented to <body> as fixed
  const noBtn = document.getElementById("no-btn");
  if (noBtn) {
    noBtn.style.transition = "opacity 0.3s ease";
    noBtn.style.opacity    = "0";
    noBtn.style.pointerEvents = "none";
    setTimeout(() => noBtn.remove(), 350);
  }

  setTimeout(() => {
    showScreen("screen-yes");
  }, 600);
}

/* ─────────────────────────────────────────────────────
   HANDLE NO — Flee then vanish after 4-5 attempts
───────────────────────────────────────────────────── */
function handleNo() {
  if (noVanished) return;

  noAttempts++;

  const btn = document.getElementById("no-btn");

  // At attempt 5: show "Too bad" message and vanish the button
  if (noAttempts >= 5) {
    vanishNoButton(btn);
    return;
  }

  // Update text
  btn.textContent = NO_TEXTS[noAttempts] || NO_TEXTS[NO_TEXTS.length - 1];

  // Flee to a random safe viewport position
  moveNoButton(btn);
}

function moveNoButton(btn) {
  const W  = window.innerWidth;
  const H  = window.innerHeight;

  if (!btn.classList.contains("fleeing")) {
    // Snapshot position BEFORE touching anything
    const rect = btn.getBoundingClientRect();

    // Reparent to <body> so the card's backdrop-filter stacking context
    // doesn't trap the button — it needs to render above everything
    document.body.appendChild(btn);

    // Lock size so layout doesn't collapse
    btn.style.position = "fixed";
    btn.style.margin   = "0";
    btn.style.width    = rect.width  + "px";
    btn.style.height   = rect.height + "px";
    // Start exactly where it was visually
    btn.style.top      = rect.top    + "px";
    btn.style.left     = rect.left   + "px";

    // Add class AFTER inline styles so the first paint is at the old position
    btn.classList.add("fleeing");
  }

  const bW = btn.offsetWidth  || 130;
  const bH = btn.offsetHeight || 50;
  const margin = 20;

  // Pick a random target well within the viewport
  const newX = margin + Math.random() * (W - bW - margin * 2);
  const newY = margin + Math.random() * (H - bH - margin * 2);

  // Use rAF to let the browser commit the starting position first,
  // then set the new target so the CSS transition actually plays
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      btn.style.left = newX + "px";
      btn.style.top  = newY + "px";
    });
  });
}

function vanishNoButton(btn) {
  noVanished = true;

  // Show "Too bad" on the button itself for a moment
  btn.textContent = NO_FINAL_TEXT;

  // Move it to centre-ish one last time
  if (!btn.classList.contains("fleeing")) {
    btn.classList.add("fleeing");
    btn.style.width  = btn.offsetWidth  + "px";
    btn.style.height = btn.offsetHeight + "px";
  }
  const W  = window.innerWidth;
  const H  = window.innerHeight;
  btn.style.left = (W / 2 - btn.offsetWidth  / 2) + "px";
  btn.style.top  = (H / 2 - btn.offsetHeight / 2) + "px";

  // After short pause, fade it out with a popup message
  setTimeout(() => {
    // Fade the button away
    btn.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    btn.style.opacity    = "0";
    btn.style.transform  = "scale(0) rotate(15deg)";

    // Show the vanish message popup
    showVanishMsg();

    setTimeout(() => {
      btn.style.display = "none";
    }, 600);
  }, 700);
}

function showVanishMsg() {
  const msg = document.getElementById("no-vanish-msg");
  msg.innerHTML = `<div style="font-size:2rem; margin-bottom:8px;">😂</div>
    <div>Okay okay... that option's gone now.</div>
    <div style="font-size:0.85rem; margin-top:6px; font-weight:500; color:#a889ac;">
      Looks like YES is the only choice 💗
    </div>`;

  // Show
  msg.classList.add("show");
  msg.classList.remove("hide");

  // Auto-hide after 2.5 seconds
  setTimeout(() => {
    msg.classList.remove("show");
    msg.classList.add("hide");
    setTimeout(() => msg.classList.remove("hide"), 500);
  }, 2800);
}

/* ─────────────────────────────────────────────────────
   INIT NO BUTTON (hover flee + touch support)
───────────────────────────────────────────────────── */
function initNoButton() {
  const btn = document.getElementById("no-btn");
  if (!btn) return;

  // On mouse enter after first attempt: flee immediately on hover
  btn.addEventListener("mouseenter", () => {
    if (noVanished || noAttempts === 0) return;
    moveNoButton(btn);
  });

  // Touch support for mobile
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleNo();
  }, { passive: false });
}

/* ─────────────────────────────────────────────────────
   DATE VALIDATION
───────────────────────────────────────────────────── */
function validateDate() {
  selectedDate = document.getElementById("date-input").value;
  selectedTime = document.getElementById("time-input").value;

  const btn = document.getElementById("date-continue-btn");
  btn.disabled = !(selectedDate && selectedTime);
}

/* ─────────────────────────────────────────────────────
   SELECT PLAN
───────────────────────────────────────────────────── */
function selectPlan(el, planName) {
  document.querySelectorAll(".plan-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
  selectedPlan = planName;
  document.getElementById("plan-continue-btn").disabled = false;
}

/* ─────────────────────────────────────────────────────
   SHOW SUMMARY
───────────────────────────────────────────────────── */
function showSummary() {
  document.getElementById("summary-date").textContent = formatDate(selectedDate);
  document.getElementById("summary-time").textContent = formatTime(selectedTime);
  document.getElementById("summary-plan").textContent = selectedPlan;
  showScreen("screen-summary");
}

/* ─────────────────────────────────────────────────────
   CONFIRM DATE
───────────────────────────────────────────────────── */
function confirmDate() {
  document.getElementById("accepted-date").textContent = formatDate(selectedDate);
  document.getElementById("accepted-time").textContent = formatTime(selectedTime);
  document.getElementById("accepted-plan").textContent = selectedPlan;

  showScreen("screen-accepted");

  setTimeout(() => {
    spawnConfetti(30);
    spawnFloatingHearts(6);
  }, 500);
}

/* ─────────────────────────────────────────────────────
   SHOW PAYMENT MODAL
───────────────────────────────────────────────────── */
function showPayment() {
  const modal = document.getElementById("payment-modal");
  modal.classList.add("active");

  // Reset reveal lines
  ["pay-line-1", "pay-line-2", "pay-line-3", "pay-line-fee"].forEach(id => {
    document.getElementById(id).classList.remove("shown");
  });
  document.getElementById("payment-continue-btn").style.display = "none";

  // Reveal lines sequentially
  const delays  = [400, 1200, 2100, 2900];
  const lineIds = ["pay-line-1", "pay-line-2", "pay-line-3", "pay-line-fee"];

  lineIds.forEach((id, i) => {
    setTimeout(() => {
      document.getElementById(id).classList.add("shown");
    }, delays[i]);
  });

  // Show continue button
  setTimeout(() => {
    document.getElementById("payment-continue-btn").style.display = "flex";
  }, 3600);
}

/* ─────────────────────────────────────────────────────
   SHOW FINAL SCREEN  (called directly from payment modal)
───────────────────────────────────────────────────── */
function showFinal() {
  // Close payment modal
  const modal = document.getElementById("payment-modal");
  if (modal) modal.classList.remove("active");

  document.getElementById("final-date").textContent = formatDate(selectedDate);
  document.getElementById("final-time").textContent = formatTime(selectedTime);
  document.getElementById("final-plan").textContent = selectedPlan;

  showScreen("screen-final");

  // Big celebration
  setTimeout(() => {
    spawnConfetti(65);
    spawnFloatingHearts(14);
    spawnSparkles(12);
  }, 500);
}

/* ─────────────────────────────────────────────────────
   CONFETTI
───────────────────────────────────────────────────── */
function spawnConfetti(count) {
  const colors = [
    "#ff6b9d", "#ffadc8", "#c9b8ff", "#ffcba4",
    "#ffe4ef", "#a78bfa", "#fbbf24", "#34d399"
  ];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left         = Math.random() * 100 + "vw";
      piece.style.top          = "-20px";
      piece.style.background   = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width        = (6 + Math.random() * 8)  + "px";
      piece.style.height       = (6 + Math.random() * 12) + "px";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      const dur = 2.5 + Math.random() * 2;
      piece.style.animationDuration = dur + "s";
      piece.style.animationDelay   = "0s";
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), dur * 1000 + 200);
    }, i * 40);
  }
}

/* ─────────────────────────────────────────────────────
   FLOATING HEARTS
───────────────────────────────────────────────────── */
function spawnFloatingHearts(count) {
  const heartEmojis = ["💗", "❤️", "🩷", "💕", "💖", "💓"];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const heart = document.createElement("div");
      heart.className   = "floating-heart";
      heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      heart.style.left     = (10 + Math.random() * 80) + "vw";
      heart.style.bottom   = (Math.random() * 20) + "vh";
      heart.style.fontSize = (0.9 + Math.random() * 1.2) + "rem";
      const dur = 2.5 + Math.random() * 2;
      heart.style.animationDuration = dur + "s";
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), dur * 1000 + 200);
    }, i * 180);
  }
}

/* ─────────────────────────────────────────────────────
   SPARKLES
───────────────────────────────────────────────────── */
function spawnSparkles(count) {
  const sparkleEmojis = ["✨", "⭐", "🌟", "💫"];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const sp = document.createElement("div");
      sp.className   = "sparkle";
      sp.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
      sp.style.left              = (5 + Math.random() * 90) + "vw";
      sp.style.top               = (5 + Math.random() * 80) + "vh";
      sp.style.animationDuration = (0.8 + Math.random() * 0.8) + "s";
      sp.style.animationDelay    = (Math.random() * 0.5) + "s";
      document.body.appendChild(sp);
      setTimeout(() => sp.remove(), 1800);
    }, i * 120);
  }
}

/* ─────────────────────────────────────────────────────
   HEART BURST (at element position)
───────────────────────────────────────────────────── */
function burstHearts(el) {
  const rect   = el.getBoundingClientRect();
  const cx     = rect.left + rect.width  / 2;
  const cy     = rect.top  + rect.height / 2;
  const emojis = ["💗", "❤️", "🩷", "💕"];

  for (let i = 0; i < 10; i++) {
    const h = document.createElement("div");
    h.style.cssText = `
      position: fixed;
      left: ${cx}px;
      top: ${cy}px;
      font-size: ${0.9 + Math.random() * 0.6}rem;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: transform ${0.6 + Math.random() * 0.3}s cubic-bezier(0.22, 1, 0.36, 1),
                  opacity   ${0.6 + Math.random() * 0.3}s ease;
    `;
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(h);

    const angle    = (i / 10) * 360 + Math.random() * 20;
    const distance = 55 + Math.random() * 65;
    const rad      = (angle * Math.PI) / 180;
    const tx       = Math.cos(rad) * distance;
    const ty       = Math.sin(rad) * distance;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        h.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.5)`;
        h.style.opacity   = "0";
      });
    });

    setTimeout(() => h.remove(), 900);
  }
}

/* ─────────────────────────────────────────────────────
   BACKGROUND FLOATING HEARTS (ambient)
───────────────────────────────────────────────────── */
function initBgHearts() {
  const container = document.getElementById("bg-hearts");
  const emojis    = ["💗", "🌸", "✨", "💕", "🩷"];

  for (let i = 0; i < 12; i++) {
    const el = document.createElement("div");
    el.className   = "bg-heart";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left  = (Math.random() * 100) + "vw";
    el.style.fontSize = (0.8 + Math.random() * 0.8) + "rem";
    const dur = 12 + Math.random() * 12;
    el.style.animationDuration = dur + "s";
    el.style.animationDelay   = -(Math.random() * dur) + "s";
    container.appendChild(el);
  }
}

/* ─────────────────────────────────────────────────────
   PLAN CARD KEYBOARD SUPPORT
───────────────────────────────────────────────────── */
function initPlanCardKeyboard() {
  document.querySelectorAll(".plan-card").forEach(card => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/* ─────────────────────────────────────────────────────
   FORMAT HELPERS
───────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      year:    "numeric",
      month:   "long",
      day:     "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hr     = h % 12 || 12;
    const min    = m.toString().padStart(2, "0");
    return `${hr}:${min} ${period}`;
  } catch {
    return timeStr;
  }
}

/* ─────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initBgHearts();
  initNoButton();
  initPlanCardKeyboard();

  // Set date input minimum to today
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, "0");
  const dd    = String(today.getDate()).padStart(2, "0");
  const dateInput = document.getElementById("date-input");
  if (dateInput) {
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }
});
