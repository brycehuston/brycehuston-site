const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const reveals = document.querySelectorAll(".reveal");
const storyShell = document.querySelector(".storytelling-shell");
const statsSection = document.querySelector("[data-stats-section]");
const statValues = document.querySelectorAll(".stats-value");
const ctaParticleField = document.querySelector(".cta-particle-field");
const ctaParticleCanvas = document.querySelector(".cta-particle-canvas");

reveals.forEach((element) => {
  const delay = element.dataset.delay;
  if (delay) {
    element.style.setProperty("--delay", `${delay}ms`);
  }
});

if (!prefersReducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -24px 0px",
    }
  );

  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add("is-visible"));
}

function formatStatValue(value) {
  return String(value);
}

function buildStatOdometer(element) {
  const value = formatStatValue(Number.parseInt(element.dataset.value || element.textContent || "0", 10));
  const suffix = element.dataset.suffix || "";
  const digits = value.split("");
  element.textContent = "";
  element.classList.remove("is-counting", "is-finished");

  const tracks = digits.map((digit, index) => {
    const windowEl = document.createElement("span");
    const trackEl = document.createElement("span");
    const cycles = 1;
    const finalDigit = Number.parseInt(digit, 10);
    const sequence = [];

    windowEl.className = "stats-digit-window";
    trackEl.className = "stats-digit-track";

    for (let cycle = 0; cycle < cycles; cycle += 1) {
      for (let number = 0; number <= 9; number += 1) {
        sequence.push(number);
      }
    }

    for (let number = 0; number <= finalDigit; number += 1) {
      sequence.push(number);
    }

    sequence.forEach((number) => {
      const digitEl = document.createElement("span");
      digitEl.className = "stats-digit";
      digitEl.textContent = String(number);
      trackEl.append(digitEl);
    });

    windowEl.append(trackEl);
    element.append(windowEl);
    return trackEl;
  });

  if (suffix) {
    const suffixEl = document.createElement("span");
    suffixEl.className = "stats-suffix";
    suffixEl.textContent = suffix;
    element.append(suffixEl);
  }

  return tracks;
}

function setTrackTargets(element) {
  const tracks = element.querySelectorAll(".stats-digit-track");

  tracks.forEach((track) => {
    const digit = track.querySelector(".stats-digit");
    if (!digit) {
      return;
    }

    const digitHeight = digit.getBoundingClientRect().height;
    const finalIndex = track.children.length - 1;
    track.dataset.finalOffset = String(-digitHeight * finalIndex);
    track.style.transform = "translateY(0px)";
  });
}

function animateStatValue(element, delay = 0) {
  const tracks = buildStatOdometer(element);
  if (!tracks.length) {
    return;
  }

  setTrackTargets(element);

  window.setTimeout(() => {
    const startTime = performance.now();
    element.classList.add("is-counting");

    function step(now) {
      const elapsed = now - startTime;
      const finished = [];

      tracks.forEach((track, index) => {
        const localDelay = index * 240;
        const duration = 3620 + index * 520;
        const offset = Number.parseFloat(track.dataset.finalOffset || "0");
        const progress = Math.min(Math.max((elapsed - localDelay) / duration, 0), 1);
        const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
        track.style.transform = `translateY(${offset * eased}px)`;
        finished.push(progress >= 1);
      });

      if (finished.every(Boolean)) {
        element.classList.remove("is-counting");
        element.classList.add("is-finished");
        return;
      }

      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }, delay);
}

function initStatsSection() {
  if (!statsSection || !statValues.length) {
    return;
  }

  if (prefersReducedMotion.matches) {
    statValues.forEach((element) => {
      const value = formatStatValue(Number.parseInt(element.dataset.value || element.textContent || "0", 10));
      const suffix = element.dataset.suffix || "";
      element.textContent = `${value}${suffix}`;
      element.classList.add("is-finished");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        statValues.forEach((element, index) => {
          animateStatValue(element, index * 120);
        });
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.4,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  observer.observe(statsSection);
}

function initStorytelling() {
  if (!storyShell || prefersReducedMotion.matches || window.matchMedia("(max-width: 900px)").matches) {
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  const { gsap } = window;
  const { ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const panels = gsap.utils.toArray(".story-panel");
  if (panels.length < 2) {
    return;
  }

  const panelParts = panels.map((panel) => ({
    panel,
    copy: panel.querySelector(".story-panel-copy"),
    detail: panel.querySelector(".story-panel-side, .story-value-list, .story-service-list"),
  }));

  panelParts.forEach(({ panel, copy, detail }) => {
    gsap.set(panel, {
      opacity: 0.5,
      y: 56,
      scale: 0.985,
    });

    gsap.set([copy, detail].filter(Boolean), {
      opacity: 0,
      y: 26,
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: "top 78%",
        end: "top 34%",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    timeline.to(
      panel,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: "none",
      },
      0
    );

    if (copy) {
      timeline.to(
        copy,
        {
          opacity: 1,
          y: 0,
          ease: "none",
        },
        0.1
      );
    }

    if (detail) {
      timeline.to(
        detail,
        {
          opacity: 1,
          y: 0,
          ease: "none",
        },
        0.18
      );
    }
  });
}

function initCtaParticles() {
  if (!ctaParticleField || !ctaParticleCanvas || prefersReducedMotion.matches) {
    return;
  }

  const context = ctaParticleCanvas.getContext("2d");
  if (!context) {
    return;
  }

  const particlePalette = [
    { rgb: "0,255,255", alpha: 0.72 },
    { rgb: "98,177,255", alpha: 0.7 },
    { rgb: "131,92,255", alpha: 0.58 },
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let running = false;
  let particles = [];
  let streaks = [];

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildParticle() {
    const tone = particlePalette[Math.floor(Math.random() * particlePalette.length)];
    return {
      baseX: random(0.12, 0.88),
      baseY: random(0.04, 0.62),
      driftX: random(14, 42),
      driftY: random(10, 34),
      radius: random(1.05, 2.45),
      angle: random(0, Math.PI * 2),
      speed: random(0.18, 0.52),
      alpha: random(0.34, 0.92) * tone.alpha,
      color: tone.rgb,
      prevX: null,
      prevY: null,
    };
  }

  function resetStreak(streak, initial = false) {
    const tone = particlePalette[Math.floor(Math.random() * particlePalette.length)];
    streak.x = random(width * 0.08, width * 0.92);
    streak.y = initial ? random(height * 0.08, height * 0.7) : height + random(0, height * 0.28);
    streak.vx = random(-0.16, 0.16);
    streak.vy = -random(0.4, 0.9);
    streak.length = random(10, 24);
    streak.alpha = random(0.08, 0.2);
    streak.color = tone.rgb;
  }

  function rebuildScene() {
    const compact = window.matchMedia("(max-width: 900px)").matches;
    const particleCount = compact ? 44 : 72;
    const streakCount = compact ? 14 : 22;

    particles = Array.from({ length: particleCount }, buildParticle);
    streaks = Array.from({ length: streakCount }, () => ({}));
    streaks.forEach((streak) => resetStreak(streak, true));
  }

  function resizeCanvas() {
    const rect = ctaParticleField.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctaParticleCanvas.width = width * dpr;
    ctaParticleCanvas.height = height * dpr;
    ctaParticleCanvas.style.width = `${width}px`;
    ctaParticleCanvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    rebuildScene();
  }

  function drawParticle(particle, timeSeconds) {
    const t = timeSeconds * particle.speed;
    const x =
      width * particle.baseX +
      Math.cos(t + particle.angle) * particle.driftX +
      Math.sin((t + particle.angle) * 1.6) * particle.driftX * 0.2;
    const y =
      height * particle.baseY +
      Math.sin(t + particle.angle) * particle.driftY +
      Math.cos((t + particle.angle) * 1.4) * particle.driftY * 0.24;

    if (particle.prevX !== null && particle.prevY !== null) {
      context.beginPath();
      context.moveTo(particle.prevX, particle.prevY);
      context.lineTo(x, y);
      context.lineWidth = Math.max(0.55, particle.radius * 0.34);
      context.strokeStyle = `rgba(${particle.color}, ${particle.alpha * 0.16})`;
      context.shadowBlur = 12;
      context.shadowColor = `rgba(${particle.color}, ${particle.alpha * 0.18})`;
      context.stroke();
    }

    context.beginPath();
    context.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
    context.shadowBlur = 14;
    context.shadowColor = `rgba(${particle.color}, ${particle.alpha * 0.45})`;
    context.arc(x, y, particle.radius, 0, Math.PI * 2);
    context.fill();

    particle.prevX = x;
    particle.prevY = y;
  }

  function drawStreak(streak) {
    streak.x += streak.vx;
    streak.y += streak.vy;

    if (streak.y < -streak.length || streak.x < -30 || streak.x > width + 30) {
      resetStreak(streak);
    }

    context.beginPath();
    context.moveTo(streak.x, streak.y);
    context.lineTo(streak.x - streak.vx * streak.length, streak.y - streak.vy * streak.length);
    context.lineWidth = 1.1;
    context.strokeStyle = `rgba(${streak.color}, ${streak.alpha})`;
    context.shadowBlur = 10;
    context.shadowColor = `rgba(${streak.color}, ${streak.alpha * 0.45})`;
    context.stroke();
  }

  function frame(now) {
    if (!running) {
      return;
    }

    const timeSeconds = now * 0.001;
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => drawParticle(particle, timeSeconds));
    streaks.forEach(drawStreak);

    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running) {
      return;
    }
    running = true;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  resizeCanvas();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  observer.observe(ctaParticleField);

  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
      return;
    }

    if (ctaParticleField.getBoundingClientRect().bottom > 0) {
      start();
    }
  });
}

function prepareTitleReveal(element, force = false) {
  if (!element) {
    return [];
  }

  if (!element.dataset.titleRevealHtml) {
    element.dataset.titleRevealHtml = element.innerHTML.trim();
  }

  if (element.dataset.titleRevealPrepared === "true" && !force) {
    return Array.from(element.querySelectorAll(".title-reveal-line"));
  }

  const titleHtml = element.dataset.titleRevealHtml || "";
  if (!titleHtml) {
    return [];
  }

  element.textContent = "";
  const mask = document.createElement("span");
  const line = document.createElement("span");

  mask.className = "title-reveal-line-mask";
  line.className = "title-reveal-line";
  line.innerHTML = titleHtml;

  mask.append(line);
  element.append(mask);

  element.dataset.titleRevealPrepared = "true";
  return [line];
}

function initTitleReveals() {
  if (prefersReducedMotion.matches || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  const targets = Array.from(
    document.querySelectorAll(".hero-copy h1, .stats-heading-block h2, .section-header h2, .story-panel-copy h2, .pathway-card h2, .final-cta-card h2")
  );

  if (!targets.length) {
    return;
  }

  const { gsap } = window;
  const { ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const titleFromState = {
    yPercent: 112,
    rotateX: -94,
    z: -44,
    opacity: 0,
    force3D: true,
  };

  const playTitleReveal = (lines, delay = 0) => {
    const timeline = gsap.timeline({ delay });

    timeline.to(lines, {
      yPercent: -4,
      rotateX: 10,
      z: 10,
      opacity: 1,
      duration: 1.18,
      stagger: 0.08,
      ease: "power2.inOut",
    });

    timeline.to(
      lines,
      {
        yPercent: 0,
        rotateX: 0,
        z: 0,
        opacity: 1,
        duration: 0.92,
        stagger: 0.08,
        ease: "power3.out",
      },
      "-=0.34"
    );
  };

  targets.forEach((title) => {
    const lines = prepareTitleReveal(title);
    if (!lines.length) {
      return;
    }

    const isHeroTitle = title.matches(".hero-copy h1");
    gsap.set(lines, titleFromState);

    if (isHeroTitle) {
      requestAnimationFrame(() => {
        playTitleReveal(lines, 0.18);
      });
      return;
    }

    ScrollTrigger.create({
      trigger: title,
      start: "top 70%",
      once: true,
      onEnter: () => {
        playTitleReveal(lines, 0.08);
      },
    });
  });
}

function initFrameTraceAccents() {
  const cards = Array.from(document.querySelectorAll("[data-frame-trace]"));
  if (!cards.length) {
    return;
  }

  const buildTrace = (card) => {
    if (card.querySelector(".frame-trace-overlay")) {
      return null;
    }

    const overlay = document.createElement("div");
    overlay.className = "frame-trace-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const cardWidth = Math.max(card.offsetWidth, 1);
    const cardHeight = Math.max(card.offsetHeight, 1);
    svg.setAttribute("viewBox", `0 0 ${cardWidth} ${cardHeight}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("frame-trace-svg");

    const styles = getComputedStyle(card);
    const radiusBase = Number.parseFloat(styles.borderTopLeftRadius) || 24;
    const radiusAdjust = Number.parseFloat(styles.getPropertyValue("--frame-trace-radius-adjust")) || 0;
    const lineStroke = 2.2;
    const glowStroke = 4.8;
    const traceStroke = Math.max(lineStroke, glowStroke);
    const width = Math.max(cardWidth - traceStroke, 1);
    const height = Math.max(cardHeight - traceStroke, 1);
    const rx = Math.max(0, Math.min(radiusBase + radiusAdjust, width / 2, height / 2));

    const makeRect = (className, strokeWidth) => {
      const inset = strokeWidth / 2;
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", `${inset}`);
      rect.setAttribute("y", `${inset}`);
      rect.setAttribute("width", `${Math.max(cardWidth - strokeWidth, 1)}`);
      rect.setAttribute("height", `${Math.max(cardHeight - strokeWidth, 1)}`);
      rect.setAttribute("rx", `${rx}`);
      rect.setAttribute("ry", `${rx}`);
      rect.style.strokeWidth = `${strokeWidth}`;
      rect.classList.add("frame-trace-path", className);
      return rect;
    };

    const glowPath = makeRect("frame-trace-path-glow", glowStroke);
    const linePath = makeRect("frame-trace-path-line", lineStroke);

    svg.append(glowPath, linePath);
    overlay.appendChild(svg);
    card.appendChild(overlay);

    return { overlay, glowPath, linePath };
  };

  cards.forEach((card) => {
    const trace = buildTrace(card);
    if (!trace) {
      return;
    }

    const { glowPath, linePath } = trace;
    const totalLength = linePath.getTotalLength();

    if (prefersReducedMotion.matches || !window.gsap || !window.ScrollTrigger) {
      glowPath.style.strokeDasharray = `${totalLength}`;
      glowPath.style.strokeDashoffset = "0";
      linePath.style.strokeDasharray = `${totalLength}`;
      linePath.style.strokeDashoffset = "0";
      card.classList.add("is-frame-trace-ready", "is-frame-trace-complete");
      return;
    }

    const { gsap } = window;
    const { ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    [glowPath, linePath].forEach((path) => {
      path.style.strokeDasharray = `${totalLength}`;
      path.style.strokeDashoffset = `${totalLength}`;
    });

    ScrollTrigger.create({
      trigger: card,
      start: "top 82%",
      once: true,
      onEnter: () => {
        card.classList.add("is-frame-trace-ready");

        const tl = gsap.timeline({
          onComplete: () => {
            card.classList.add("is-frame-trace-complete");
          },
        });

        tl.to(
          glowPath,
          {
            strokeDashoffset: 0,
            opacity: 0.52,
            duration: 1.8,
            ease: "power2.inOut",
          },
          0
        );

        tl.to(
          linePath,
          {
            strokeDashoffset: 0,
            opacity: 0.92,
            duration: 1.48,
            ease: "power2.out",
          },
          0.1
        );

        tl.to(
          glowPath,
          {
            opacity: 0.18,
            duration: 0.7,
            ease: "power2.out",
          },
          1.18
        );
      },
    });
  });
}

initStatsSection();
initStorytelling();
initCtaParticles();
initFrameTraceAccents();

function bootTitleReveals() {
  const titleRevealReady = document.fonts?.ready ?? Promise.resolve();
  titleRevealReady.then(() => {
    if (window.gsap && window.ScrollTrigger) {
      initTitleReveals();
      return;
    }

    window.addEventListener(
      "load",
      () => {
        initTitleReveals();
      },
      { once: true }
    );
  });
}

bootTitleReveals();
