/* ==========================================================
   A LETTER IN CODE — for Hadisa Norouzi, by Mursal
   All interactions: intro, reveals, orbit, timeline,
   before/after, memory wall, secret message, finale.
   ========================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function svgIcon(id, extraClass) {
    return '<svg class="ic ' + (extraClass || "") + '" aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }

  /* ----------------------------------------------------------
     Custom modal system (vanilla JS)
     ---------------------------------------------------------- */
  function createModal(el) {
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      el.classList.add("open");
      el.setAttribute("aria-hidden", "false");
      document.body.classList.add("intro-locked");
      var x = el.querySelector(".cx-x");
      if (x) x.focus();
    }

    function close() {
      el.classList.remove("open");
      el.setAttribute("aria-hidden", "true");
      document.body.classList.remove("intro-locked");
      if (lastFocus) lastFocus.focus();
    }

    el.querySelectorAll("[data-close]").forEach(function (trigger) {
      trigger.addEventListener("click", close);
    });

    return { open: open, close: close, isOpen: function () { return el.classList.contains("open"); } };
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".cx-modal.open").forEach(function (m) {
      m.querySelector("[data-close]").click();
    });
  });

  /* ----------------------------------------------------------
     Particle field (used by intro, background and finale)
     ---------------------------------------------------------- */
  function createParticles(canvas, opts) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var rafId = null;
    var running = false;

    opts = opts || {};
    var count = opts.count || 70;
    var colors = opts.colors || ["rgba(250,248,246,0.5)", "rgba(212,175,106,0.4)", "rgba(124,110,230,0.4)"];
    var speed = opts.speed || 0.15;
    var maxSize = opts.maxSize || 1.6;
    var rise = opts.rise || false;

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(p) {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      p.x = Math.random() * w;
      p.y = rise ? h + Math.random() * h * 0.3 : Math.random() * h;
      p.r = Math.random() * maxSize + 0.3;
      p.vx = (Math.random() - 0.5) * speed;
      p.vy = rise ? -(Math.random() * speed * 3 + speed) : (Math.random() - 0.5) * speed;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = Math.random() * 0.5 + 0.2;
      p.twinkle = Math.random() * 0.02 + 0.004;
      p.phase = Math.random() * Math.PI * 2;
      return p;
    }

    function init() {
      resize();
      particles = [];
      for (var i = 0; i < count; i++) {
        var p = spawn({});
        if (rise) p.y = Math.random() * canvas.clientHeight;
        particles.push(p);
      }
    }

    function frame() {
      if (!running) return;
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        init();
        w = canvas.clientWidth; h = canvas.clientHeight;
      }
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.twinkle;
        var a = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
        if (p.y < -10 || p.y > h + 10 || p.x < -10 || p.x > w + 10) spawn(p);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(a, 0);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      rafId = window.requestAnimationFrame(frame);
    }

    init();
    window.addEventListener("resize", init);

    return {
      start: function () {
        if (running || prefersReducedMotion) return;
        running = true;
        frame();
      },
      stop: function () {
        running = false;
        if (rafId) window.cancelAnimationFrame(rafId);
      },
      clear: function () {
        this.stop();
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      }
    };
  }

  /* ----------------------------------------------------------
     PART 1 — Cinematic intro sequence
     ---------------------------------------------------------- */
  var intro = document.getElementById("cinematicIntro");
  var introCanvas = document.getElementById("introCanvas");
  var introParticles = createParticles(introCanvas, { count: 90, speed: 0.1, maxSize: 1.4 });

  document.body.classList.add("intro-locked");
  introParticles.start();

  var lines = [
    document.getElementById("introLine1"),
    document.getElementById("introLine2"),
    document.getElementById("introLine3")
  ];
  var introReveal = document.getElementById("introReveal");
  var timers = [];

  function after(ms, fn) { timers.push(window.setTimeout(fn, ms)); }

  if (prefersReducedMotion) {
    introReveal.classList.add("visible");
  } else {
    var t = 900;
    lines.forEach(function (line) {
      after(t, function () { line.classList.add("visible"); });
      after(t + 2600, function () {
        line.classList.remove("visible");
        line.classList.add("hidden-up");
      });
      t += 3400;
    });
    after(t + 400, function () { introReveal.classList.add("visible"); });
  }

  /* Enter the story */
  var mainSite = document.getElementById("mainSite");
  var bgCanvas = document.getElementById("bgCanvas");
  var bgParticles = createParticles(bgCanvas, { count: 55, speed: 0.12, maxSize: 1.5 });

  document.getElementById("enterBtn").addEventListener("click", function () {
    timers.forEach(window.clearTimeout);
    intro.classList.add("leaving");
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-locked");
    mainSite.classList.add("entered");
    bgParticles.start();
    window.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(function () {
      introParticles.clear();
      intro.style.display = "none";
    }, 1600);
  });

  /* ----------------------------------------------------------
     Scroll reveal observer (all sections)
     ---------------------------------------------------------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });

  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });

  /* ----------------------------------------------------------
     PART 4 — Orbit learning system
     ---------------------------------------------------------- */
  var orbitStage = document.getElementById("orbitStage");
  var orbitDesc = document.getElementById("orbitDesc");
  var orbitNodes = orbitStage.querySelectorAll(".orbit-node");
  var orbitLines = orbitStage.querySelectorAll(".orbit-line");
  var skillModal = createModal(document.getElementById("skillModal"));

  function activateNode(node) {
    orbitStage.classList.add("dimmed");
    orbitNodes.forEach(function (n) { n.classList.toggle("active", n === node); });
    orbitLines.forEach(function (l) {
      l.classList.toggle("lit", l.dataset.angle === node.style.getPropertyValue("--angle").replace("deg", ""));
    });
    orbitDesc.textContent = node.dataset.desc;
  }

  function resetOrbit() {
    orbitStage.classList.remove("dimmed");
    orbitNodes.forEach(function (n) { n.classList.remove("active"); });
    orbitLines.forEach(function (l) { l.classList.remove("lit"); });
    orbitDesc.innerHTML = "&nbsp;";
  }

  orbitNodes.forEach(function (node) {
    node.addEventListener("mouseenter", function () { activateNode(node); });
    node.addEventListener("focus", function () { activateNode(node); });
    node.addEventListener("mouseleave", resetOrbit);
    node.addEventListener("blur", resetOrbit);
    node.addEventListener("click", function () {
      document.getElementById("skillModalIcon").innerHTML = svgIcon(node.dataset.icon);
      document.getElementById("skillModalTitle").textContent = node.dataset.name;
      document.getElementById("skillModalDesc").textContent = node.dataset.desc;
      document.getElementById("skillModalWhy").textContent = node.dataset.why;
      skillModal.open();
    });
  });

  /* ----------------------------------------------------------
     PART 6 — Timeline: progressive fill + lit milestones
     ---------------------------------------------------------- */
  var timeline = document.getElementById("timeline");
  var timelineFill = document.getElementById("timelineFill");
  var timelineItems = timeline.querySelectorAll("[data-milestone]");

  function updateTimeline() {
    var rect = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    var anchor = vh * 0.6;
    var progress = (anchor - rect.top) / rect.height;
    progress = Math.max(0, Math.min(1, progress));
    timelineFill.style.height = (progress * 100) + "%";

    timelineItems.forEach(function (item) {
      var nodeRect = item.querySelector(".timeline-node").getBoundingClientRect();
      item.classList.toggle("lit", nodeRect.top < anchor && nodeRect.top > -100);
    });
  }

  var scrollQueued = false;
  window.addEventListener("scroll", function () {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () {
      updateTimeline();
      scrollQueued = false;
    });
  }, { passive: true });
  updateTimeline();

  /* ----------------------------------------------------------
     PART 8 — Before / After slider
     ---------------------------------------------------------- */
  var baFrame = document.getElementById("baFrame");
  var baAfter = document.getElementById("baAfter");
  var baDivider = document.getElementById("baDivider");
  var baDragging = false;

  function setBaPosition(clientX) {
    var rect = baFrame.getBoundingClientRect();
    var pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(4, Math.min(96, pct));
    baAfter.style.clipPath = "inset(0 0 0 " + pct + "%)";
    baDivider.style.left = pct + "%";
    baDivider.setAttribute("aria-valuenow", Math.round(pct));
  }

  baDivider.addEventListener("pointerdown", function (e) {
    baDragging = true;
    baDivider.setPointerCapture(e.pointerId);
  });
  baFrame.addEventListener("pointerdown", function (e) {
    if (e.target !== baDivider && !baDivider.contains(e.target)) setBaPosition(e.clientX);
    baDragging = true;
  });
  window.addEventListener("pointermove", function (e) {
    if (baDragging) setBaPosition(e.clientX);
  });
  window.addEventListener("pointerup", function () { baDragging = false; });
  baDivider.addEventListener("keydown", function (e) {
    var current = parseFloat(baDivider.getAttribute("aria-valuenow")) || 50;
    if (e.key === "ArrowLeft") setBaPosition(baFrame.getBoundingClientRect().left + (baFrame.offsetWidth * (current - 5)) / 100);
    if (e.key === "ArrowRight") setBaPosition(baFrame.getBoundingClientRect().left + (baFrame.offsetWidth * (current + 5)) / 100);
  });

  /* ----------------------------------------------------------
     PART 9 — Memory wall
     ---------------------------------------------------------- */
var memoryGrid = document.getElementById("memoryGrid");
var memoryModal = createModal(document.getElementById("memoryModal"));
var memoryModalMedia = document.getElementById("memoryModalMedia");
var memoryModalCaption = document.getElementById("memoryModalCaption");

var memories = [
  {
    caption: "My First Steps",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
  },
  {
    caption: "A Project I Built",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80"
  },
  {
    caption: "Something I Learned",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
  },
  {
    caption: "A Moment I Remember",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80"
  },
  {
    caption: "Late Night Practice",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80"
  },
  {
    caption: "A Problem Solved",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
  },
  {
    caption: "Lines of Gratitude",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80"
  },
  {
    caption: "The Journey Continues",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80"
  }
];

memories.forEach(function (mem) {

  var tile = document.createElement("button");

  tile.className = "memory-tile";
  tile.type = "button";
  tile.setAttribute("aria-label", mem.caption);

  tile.innerHTML =
    '<img src="' + mem.image + '" alt="' + mem.caption + '" loading="lazy">' +
    '<span class="memory-caption">' + mem.caption + "</span>";

  tile.dataset.media = "image";
  tile.dataset.src = mem.image;
  tile.dataset.caption = mem.caption;

  tile.addEventListener("click", function () {

    memoryModalCaption.textContent = tile.dataset.caption;

    memoryModalMedia.innerHTML =
      '<img src="' +
      tile.dataset.src +
      '" alt="' +
      tile.dataset.caption +
      '" style="max-width:100%; height:auto; border-radius:12px;">';

    memoryModal.open();
  });

  memoryGrid.appendChild(tile);
});

  /* ----------------------------------------------------------
     PART 11 — Secret message sequence
     ---------------------------------------------------------- */
  var secretBtn = document.getElementById("secretBtn");
  var secretOverlay = document.getElementById("secretOverlay");
  var secretClose = document.getElementById("secretClose");
  var secretLines = [
    { el: document.getElementById("secretLine1"), show: 800,  hide: 3600 },
    { el: document.getElementById("secretLine2"), show: 4400, hide: 7600 },
    { el: document.getElementById("secretLine3"), show: 8400, hide: 11600 },
    { el: document.getElementById("secretLine4"), show: 12400, hide: 16400 },
    { el: document.getElementById("secretLine5"), show: 17400, hide: null }
  ];
  var secretTimers = [];
  var secretPlaying = false;

  function clearSecretTimers() {
    secretTimers.forEach(window.clearTimeout);
    secretTimers = [];
  }

  function startSecret() {
    if (secretPlaying) return;
    secretPlaying = true;
    bgParticles.stop();
    secretOverlay.classList.add("active");
    secretOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("intro-locked");

    if (prefersReducedMotion) {
      secretLines[4].el.classList.add("visible");
      secretClose.classList.add("shown");
      return;
    }

    secretLines.forEach(function (line) {
      secretTimers.push(window.setTimeout(function () {
        line.el.classList.add("visible");
      }, line.show));
      if (line.hide !== null) {
        secretTimers.push(window.setTimeout(function () {
          line.el.classList.remove("visible");
          line.el.classList.add("hidden-up");
        }, line.hide));
      }
    });
    secretTimers.push(window.setTimeout(function () {
      secretClose.classList.add("shown");
    }, 21000));
  }

  function endSecret() {
    clearSecretTimers();
    secretPlaying = false;
    secretOverlay.classList.remove("active");
    secretOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-locked");
    secretLines.forEach(function (line) {
      line.el.classList.remove("visible", "hidden-up");
    });
    secretClose.classList.remove("shown");
    bgParticles.start();
  }

  secretBtn.addEventListener("click", startSecret);
  secretClose.addEventListener("click", endSecret);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && secretPlaying) endSecret();
  });

  /* ----------------------------------------------------------
     PART 12 — Finale sparkles
     ---------------------------------------------------------- */
  var finaleCanvas = document.getElementById("finaleCanvas");
  var finaleParticles = createParticles(finaleCanvas, {
    count: 60,
    speed: 0.25,
    maxSize: 2,
    rise: true,
    colors: ["rgba(212,175,106,0.55)", "rgba(124,110,230,0.4)", "rgba(250,248,246,0.45)"]
  });

  var finaleObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) finaleParticles.start();
      else finaleParticles.stop();
    });
  }, { threshold: 0.15 });
  finaleObserver.observe(document.getElementById("finale"));

})();
