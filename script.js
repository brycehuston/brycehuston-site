const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroNavBar = document.querySelector(".hero-nav-bar");
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

function initAutoHideNav() {
  if (!heroNavBar) {
    return;
  }

  let lastScrollY = window.scrollY;
  let isHidden = false;
  let ticking = false;

  function applyNavState() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    const nearTop = currentScrollY <= 24;
    const compactViewport = window.matchMedia("(max-width: 900px)").matches;
    const hideThreshold = compactViewport ? 10 : 14;
    const showThreshold = compactViewport ? -8 : -12;

    heroNavBar.classList.toggle("is-nav-elevated", currentScrollY > 8);

    if (nearTop) {
      isHidden = false;
    } else if (scrollDelta >= hideThreshold) {
      isHidden = true;
    } else if (scrollDelta <= showThreshold) {
      isHidden = false;
    }

    heroNavBar.classList.toggle("is-nav-hidden", isHidden);
    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(applyNavState);
  }

  applyNavState();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", applyNavState, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      isHidden = false;
      heroNavBar.classList.remove("is-nav-hidden");
      lastScrollY = window.scrollY;
      applyNavState();
    }
  });
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

function initSolutionsServicesRail() {
  const shell = document.querySelector("[data-services-rail]");
  if (!shell) {
    return;
  }

  const section = shell.closest(".services-rail-section") || shell;
  const heading = shell.querySelector(".services-rail-heading");
  const cards = Array.from(shell.querySelectorAll("[data-services-card]"));

  if (!heading || !cards.length) {
    return;
  }

  if (
    prefersReducedMotion.matches ||
    window.matchMedia("(max-width: 900px)").matches ||
    !window.gsap ||
    !window.ScrollTrigger
  ) {
    return;
  }

  const { gsap } = window;
  const { ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const cardDrift = [-10, 12, -14, 12];
  const cardExitDrift = [-14, 18, -18, 16];

  gsap.set(heading, {
    opacity: 0,
    y: 20,
    force3D: true,
  });

  cards.forEach((card, index) => {
    gsap.set(card, {
      opacity: 0,
      y: 24 + index * 1.2,
      scale: 0.975,
      transformOrigin: "50% 50%",
      force3D: true,
    });
  });

  const introTimeline = gsap.timeline({
    paused: true,
    defaults: {
      ease: "power2.out",
      duration: 0.72,
    },
  });

  introTimeline.to(
    heading,
    {
      opacity: 1,
      y: 0,
    },
    0
  );

  introTimeline.to(
    cards,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.1,
    },
    0.08
  );

  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    onEnter: () => {
      shell.classList.add("is-services-active");
      introTimeline.play();
    },
    onLeaveBack: () => {
      shell.classList.remove("is-services-active");
      introTimeline.reverse();
    },
  });

  const timeline = gsap.timeline({
    defaults: {
      ease: "none",
    },
    scrollTrigger: {
      trigger: section,
      start: "top 66%",
      end: "bottom 36%",
      scrub: 0.85,
      invalidateOnRefresh: true,
    },
  });

  timeline.to(
    heading,
    {
      y: -8,
      opacity: 0.86,
      duration: 0.28,
    },
    0.28
  );

  cards.forEach((card, index) => {
    timeline.to(
      card,
      {
        y: cardDrift[index] ?? 0,
        duration: 0.42,
      },
      0
    );
  });

  cards.forEach((card, index) => {
    timeline.to(
      card,
      {
        y: cardExitDrift[index] ?? cardDrift[index] ?? 0,
        opacity: 0.9,
        duration: 0.18,
      },
      0.8
    );
  });
}

function initSolutionsEnergyField() {
  if (!document.body?.classList.contains("solutions-page") || prefersReducedMotion.matches) {
    return;
  }

  const canvas = document.getElementById("solutionsEnergyCanvas");
  const heroShell = document.querySelector(".solutions-hero-shell");
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const compactMedia = window.matchMedia("(max-width: 900px)");
  const targetElements = Array.from(
    document.querySelectorAll(
      ".solutions-hero-shell, [data-services-rail], .solutions-fit-grid, .service-area-shell, .google-proof-layout, .solutions-process-grid, .solutions-closing-panel"
    )
  );

  if (!targetElements.length) {
    return;
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let lastTime = 0;
  let lastEmit = 0;
  let lastScrollY = window.scrollY;
  let scrollEnergy = 0;
  let activeTargetElement = null;
  let introTriggered = false;
  let introSettledAt = 0;
  let introHandoffSent = false;
  let introHandoffVector = { x: 0.86, y: 0.5 };
  let heroPauseUntil = 0;
  let currentEnergySide = 1;
  let ambientRailUntil = 0;
  let ambientRailSide = 1;
  let nextEmitJitter = 1;
  let bolts = [];
  let halos = [];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const random = (min, max) => min + Math.random() * (max - min);
  const randomInt = (min, max) => Math.floor(random(min, max + 1));

  const resizeCanvas = () => {
    width = Math.max(window.innerWidth, 1);
    height = Math.max(window.innerHeight, 1);
    dpr = Math.min(window.devicePixelRatio || 1, compactMedia.matches ? 1.2 : 1.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const pickActiveTarget = () => {
    const focusY = height * 0.44;
    let best = null;

    targetElements.forEach((element) => {
      if (!element.isConnected || element.getClientRects().length === 0) {
        return;
      }

      const rect = element.getBoundingClientRect();
      if (rect.bottom < -height * 0.12 || rect.top > height * 1.12) {
        return;
      }

      const centerY = rect.top + rect.height * 0.5;
      const visibleHeight = Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, 0));
      const score = Math.abs(centerY - focusY) - visibleHeight * 0.08;

      if (!best || score < best.score) {
        best = { element, rect, score };
      }
    });

    return best;
  };

  const subdividePath = (points, spread) => {
    const next = [];

    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.hypot(dx, dy) || 1;
      const perpendicularX = -dy / distance;
      const perpendicularY = dx / distance;
      const alongX = dx / distance;
      const alongY = dy / distance;

      next.push(start);
      next.push({
        x:
          (start.x + end.x) * 0.5 +
          perpendicularX * random(-spread, spread) +
          alongX * random(-spread * 0.14, spread * 0.14),
        y:
          (start.y + end.y) * 0.5 +
          perpendicularY * random(-spread, spread) +
          alongY * random(-spread * 0.14, spread * 0.14),
      });
    }

    next.push(points[points.length - 1]);
    return next;
  };

  const buildPath = (start, end, passes, spread) => {
    let points = [start, end];

    for (let pass = 0; pass < passes; pass += 1) {
      points = subdividePath(points, spread);
      spread *= 0.56;
    }

    return points;
  };

  const buildBranch = (mainPoints, intensity) => {
    if (mainPoints.length < 6) {
      return null;
    }

    const anchorIndex = randomInt(3, Math.max(mainPoints.length - 4, 3));
    const anchor = mainPoints[anchorIndex];
    const branchDirection = Math.random() < 0.5 ? -1 : 1;
    const branchEnd = {
      x: anchor.x + random(46, 144) * intensity * branchDirection,
      y: anchor.y + random(-58, 122) * intensity,
    };

    return buildPath(anchor, branchEnd, 4, 28 * intensity);
  };

  const buildNestedBranch = (branchPoints, intensity) => {
    if (!branchPoints || branchPoints.length < 5 || Math.random() < 0.45) {
      return null;
    }

    return buildBranch(branchPoints, Math.max(0.72, intensity * 0.82));
  };

  const createHalo = (x, y, radius, alpha, life, born) => ({
    x,
    y,
    radius,
    alpha,
    life,
    born,
  });

  const emitBolt = (target, now, emphasis = 1, side = 1) => {
    if (!target) {
      return;
    }

    const rect = target.rect;
    const start = {
      x: side > 0 ? random(width * 0.04, width * 0.15) : random(width * 0.85, width * 0.96),
      y: random(height * 0.06, height * 0.18),
    };
    const end = {
      x:
        side > 0
          ? clamp(rect.left + rect.width * random(0.58, 0.84), width * 0.46, width * 0.94)
          : clamp(rect.left + rect.width * random(0.16, 0.42), width * 0.08, width * 0.58),
      y: clamp(rect.top + rect.height * random(0.22, 0.78), height * 0.18, height * 0.92),
    };
    const main = buildPath(start, end, 5, Math.min(height * 0.085, 62) * emphasis);
    const branches = [];
    const branchCount =
      emphasis > 1 ? randomInt(4, 6) : Math.random() < 0.9 ? randomInt(2, 5) : randomInt(1, 2);

    for (let index = 0; index < branchCount; index += 1) {
      const branch = buildBranch(main, Math.min(1.08, emphasis));
      if (branch) {
        branches.push(branch);
        const nestedBranch = buildNestedBranch(branch, Math.min(1.04, emphasis));
        if (nestedBranch) {
          branches.push(nestedBranch);
        }
      }
    }

    bolts.push({
      born: now,
      life: random(980, 1480),
      alpha: random(0.72, 0.96) * Math.min(1.08, 0.74 + emphasis * 0.24),
      strength: 1,
      main,
      branches,
    });

    halos.push(createHalo(start.x, start.y, random(34, 56), 0.22 * emphasis, random(700, 1100), now));
    halos.push(createHalo(end.x, end.y, random(42, 82), 0.28 * emphasis, random(950, 1450), now));

    if (bolts.length > (compactMedia.matches ? 3 : 5)) {
      bolts = bolts.slice(-1 * (compactMedia.matches ? 3 : 5));
    }

    if (halos.length > 12) {
      halos = halos.slice(-12);
    }
  };

  const emitIntroBolt = (impactViewport, now) => {
    if (!impactViewport) {
      return;
    }

    const start = {
      x: random(width * 0.008, width * 0.03),
      y: random(height * 0.012, height * 0.05),
    };
    const end = {
      x: impactViewport.x,
      y: impactViewport.y,
    };
    const main = buildPath(start, end, 6, Math.min(height * 0.11, 76));
    const branches = [];
    const introBranchCount = randomInt(4, 7);

    for (let index = 0; index < introBranchCount; index += 1) {
      const branch = buildBranch(main, 1.22);
      if (branch) {
        branches.push(branch);
        const nestedBranch = buildNestedBranch(branch, 0.96);
        if (nestedBranch) {
          branches.push(nestedBranch);
        }
      }
    }

    bolts.push({
      born: now,
      life: 1680,
      revealDuration: 500,
      alpha: 0.94,
      strength: 1.52,
      main,
      branches,
    });

    const lastPoint = main[main.length - 1] ?? end;
    const previousPoint = main[main.length - 2] ?? start;
    const handoffDx = lastPoint.x - previousPoint.x;
    const handoffDy = lastPoint.y - previousPoint.y;
    const handoffLength = Math.hypot(handoffDx, handoffDy) || 1;
    introHandoffVector = {
      x: handoffDx / handoffLength,
      y: handoffDy / handoffLength,
    };

    halos.push(createHalo(start.x, start.y, 38, 0.18, 980, now));
    halos.push(createHalo(end.x, end.y, 74, 0.32, 1480, now));
    introTriggered = true;
    introSettledAt = now + 560;
    introHandoffSent = false;
  };

  const drawPartialPath = (points, reveal) => {
    const maxIndex = points.length - 1;
    const progress = clamp(reveal, 0, 1) * maxIndex;
    const whole = Math.floor(progress);
    const fraction = progress - whole;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let index = 1; index <= whole && index < points.length; index += 1) {
      context.lineTo(points[index].x, points[index].y);
    }

    if (whole < maxIndex) {
      const start = points[whole];
      const end = points[whole + 1];
      context.lineTo(lerp(start.x, end.x, fraction), lerp(start.y, end.y, fraction));
    }
  };

  const strokeBolt = (points, reveal, alpha, branch = false, strength = 1) => {
    const glowAlpha = (branch ? 0.1 : 0.17) * alpha;
    const lineAlpha = (branch ? 0.2 : 0.32) * alpha;
    const coreAlpha = (branch ? 0.42 : 0.8) * alpha;

    context.save();
    context.globalCompositeOperation = "lighter";
    context.shadowBlur = (branch ? 12 : 20) * strength;
    context.shadowColor = `rgba(168, 143, 90, ${glowAlpha * 1.45})`;

    drawPartialPath(points, reveal);
    context.strokeStyle = `rgba(168, 143, 90, ${glowAlpha})`;
    context.lineWidth = (branch ? 5.2 : 8.9) * strength;
    context.stroke();

    context.shadowBlur = (branch ? 6.2 : 10.5) * strength;
    context.shadowColor = `rgba(195, 200, 207, ${lineAlpha})`;
    drawPartialPath(points, reveal);
    context.strokeStyle = `rgba(195, 200, 207, ${lineAlpha})`;
    context.lineWidth = (branch ? 1.95 : 2.95) * strength;
    context.stroke();

    context.shadowBlur = 0;
    drawPartialPath(points, reveal);
    context.strokeStyle = `rgba(255, 248, 236, ${coreAlpha})`;
    context.lineWidth = (branch ? 1.08 : 1.36) * strength;
    context.stroke();
    context.restore();
  };

  const drawHalo = (halo, now) => {
    if (now < halo.born) {
      return true;
    }

    const progress = clamp((now - halo.born) / halo.life, 0, 1);
    if (progress >= 1) {
      return false;
    }

    const alpha = (1 - progress) * halo.alpha;
    const radius = halo.radius * (0.72 + progress * 0.62);
    const gradient = context.createRadialGradient(halo.x, halo.y, 0, halo.x, halo.y, radius);
    gradient.addColorStop(0, `rgba(255, 244, 225, ${alpha * 0.42})`);
    gradient.addColorStop(0.34, `rgba(168, 143, 90, ${alpha * 0.22})`);
    gradient.addColorStop(1, "rgba(168, 143, 90, 0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(halo.x, halo.y, radius, 0, Math.PI * 2);
    context.fill();
    return true;
  };

  const drawAmbientRail = (target, now, side = 1) => {
    if (!target) {
      return;
    }

    const remaining = clamp((ambientRailUntil - now) / 520, 0, 1);
    if (remaining <= 0) {
      return;
    }

    const endX =
      side > 0
        ? clamp(target.rect.left + target.rect.width * 0.76, width * 0.5, width * 0.94)
        : clamp(target.rect.left + target.rect.width * 0.24, width * 0.06, width * 0.5);
    const endY = clamp(target.rect.top + target.rect.height * 0.42, height * 0.18, height * 0.9);
    const startX = side > 0 ? width * 0.045 : width * 0.955;
    const startY = height * 0.08;
    const intensity = clamp(scrollEnergy, 0, 1) * remaining;
    const gradient = context.createLinearGradient(startX, startY, endX, endY);

    gradient.addColorStop(0, "rgba(168, 143, 90, 0)");
    gradient.addColorStop(0.2, `rgba(168, 143, 90, ${0.012 + intensity * 0.015})`);
    gradient.addColorStop(0.72, `rgba(195, 200, 207, ${0.01 + intensity * 0.01})`);
    gradient.addColorStop(1, "rgba(195, 200, 207, 0)");

    context.save();
    context.beginPath();
    context.moveTo(startX, startY);
    if (side > 0) {
      context.bezierCurveTo(width * 0.18, height * 0.12, endX * 0.48, endY * 0.78, endX, endY);
    } else {
      context.bezierCurveTo(width * 0.82, height * 0.12, lerp(startX, endX, 0.46), endY * 0.78, endX, endY);
    }
    context.strokeStyle = gradient;
    context.lineWidth = 0.9;
    context.shadowBlur = 8;
    context.shadowColor = `rgba(168, 143, 90, ${0.025 + intensity * 0.026})`;
    context.stroke();
    context.restore();
  };

  const tick = (now) => {
    const scrollY = window.scrollY;
    const scrollDelta = Math.abs(scrollY - lastScrollY);
    lastScrollY = scrollY;
    scrollEnergy = scrollEnergy * 0.9 + Math.min(scrollDelta / 120, 1.1) * 0.22;
    context.clearRect(0, 0, width, height);

    const target = pickActiveTarget();
    if (introTriggered && now >= heroPauseUntil && now < ambientRailUntil) {
      drawAmbientRail(target, now, ambientRailSide);
    }

    if (introTriggered && !introHandoffSent && now >= introSettledAt) {
      introHandoffSent = true;
      activeTargetElement = heroShell ?? activeTargetElement;
      heroPauseUntil = now + (compactMedia.matches ? 1800 : 1600);
      lastEmit = heroPauseUntil;
      ambientRailUntil = 0;
      window.dispatchEvent(
        new CustomEvent("solutions-hero-handoff", {
          detail: {
            at: now,
            vector: introHandoffVector,
          },
        })
      );
    }

    if (!document.hidden && target && introTriggered && introHandoffSent && now >= heroPauseUntil) {
      const changedTarget = activeTargetElement !== target.element;
      const baseInterval = compactMedia.matches ? 3350 : 2550;
      const interval = Math.max(compactMedia.matches ? 1800 : 1400, (baseInterval - scrollEnergy * 620) * nextEmitJitter);

      if (changedTarget) {
        currentEnergySide *= -1;
        emitBolt(target, now, 1.15, currentEnergySide);
        lastEmit = now;
        ambientRailSide = currentEnergySide;
        ambientRailUntil = now + 420;
        nextEmitJitter = random(0.92, 1.28);
      } else if (now - lastEmit >= interval) {
        currentEnergySide *= -1;
        emitBolt(target, now, 0.84 + Math.min(scrollEnergy, 0.7), currentEnergySide);
        lastEmit = now;
        ambientRailSide = currentEnergySide;
        ambientRailUntil = now + 380;
        nextEmitJitter = random(0.96, 1.34);
      }

      activeTargetElement = target.element;
    }

    halos = halos.filter((halo) => drawHalo(halo, now));

    bolts = bolts.filter((bolt) => {
      const age = now - bolt.born;
      if (age < 0) {
        return true;
      }

      if (age >= bolt.life) {
        return false;
      }

      const reveal = clamp(age / (bolt.revealDuration ?? 620), 0, 1);
      const fadeStart = bolt.life * 0.66;
      const alpha = age < fadeStart ? bolt.alpha : bolt.alpha * (1 - (age - fadeStart) / (bolt.life - fadeStart));

      strokeBolt(bolt.main, reveal, alpha, false, bolt.strength ?? 1);
      bolt.branches.forEach((branch) => {
        strokeBolt(branch, Math.min(reveal * 1.08, 1), alpha * 0.68, true, (bolt.strength ?? 1) * 0.92);
      });

      return true;
    });

    lastTime = now;
    rafId = window.requestAnimationFrame(tick);
  };

  const onResize = () => {
    resizeCanvas();
  };

  const onHeroImpact = (event) => {
    const impactViewport = event.detail?.impactViewport;
    emitIntroBolt(impactViewport, performance.now());
  };

  resizeCanvas();
  window.addEventListener("resize", onResize);
  window.addEventListener("solutions-hero-impact", onHeroImpact);
  rafId = window.requestAnimationFrame(tick);

  window.addEventListener(
    "pagehide",
    () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("solutions-hero-impact", onHeroImpact);
    },
    { once: true }
  );
}

function initSolutionsHeroZap() {
  if (!document.body?.classList.contains("solutions-page") || prefersReducedMotion.matches) {
    return;
  }

  const shell = document.querySelector(".solutions-hero-shell");
  const canvas = document.getElementById("solutionsHeroZapCanvas");
  if (!shell || !canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const compactMedia = window.matchMedia("(max-width: 900px)");
  const title = shell.querySelector(".page-hero-copy h1");

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let previousFrame = 0;
  let hasPlayed = false;
  let visibleChargeMs = 0;
  let awaitingHandoff = false;
  let ambientBoltTimeoutId = 0;
  let ambientBoltFromRight = true;
  let anchorPoint = null;
  let handoffVector = { x: 0.86, y: 0.5 };
  let bolts = [];
  let halos = [];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const random = (min, max) => min + Math.random() * (max - min);
  const randomInt = (min, max) => Math.floor(random(min, max + 1));
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
  const easeInOutSine = (value) => -(Math.cos(Math.PI * value) - 1) / 2;

  const resizeCanvas = () => {
    const rect = shell.getBoundingClientRect();
    width = Math.max(Math.round(rect.width), 1);
    height = Math.max(Math.round(rect.height), 1);
    dpr = Math.min(window.devicePixelRatio || 1, compactMedia.matches ? 1.2 : 1.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    anchorPoint = {
      x: Math.max(4, width * 0.006),
      y: Math.max(18, height * 0.052),
    };
  };

  const ensureTicking = () => {
    if (rafId) {
      return;
    }

    previousFrame = 0;
    rafId = window.requestAnimationFrame(tick);
  };

  const getEdgeStrikeConfig = (fromRight = false) => {
    const insetX = Math.max(4, width * 0.006);
    const insetY = Math.max(18, height * 0.052);

    return fromRight
      ? {
          sourcePoint: {
            x: width - insetX,
            y: insetY,
          },
          entryVector: { x: -0.86, y: 0.5 },
        }
      : {
          sourcePoint: {
            x: insetX,
            y: insetY,
          },
          entryVector: { x: 0.86, y: 0.5 },
        };
  };

  const scheduleAmbientHeroBolt = (delayOverride = null) => {
    if (ambientBoltTimeoutId) {
      window.clearTimeout(ambientBoltTimeoutId);
    }

    const baseDelay =
      delayOverride ??
      Math.round(
        random(42000, 92000) +
          (Math.random() < 0.18 ? random(8000, 16000) : 0)
      );

    ambientBoltTimeoutId = window.setTimeout(() => {
      if (!hasPlayed) {
        scheduleAmbientHeroBolt();
        return;
      }

      triggerAmbientHeroBolt(ambientBoltFromRight);

      const shouldDoubleHit = Math.random() < 0.16;
      ambientBoltFromRight = !ambientBoltFromRight;

      if (shouldDoubleHit) {
        const followupSide = ambientBoltFromRight;
        ambientBoltFromRight = !ambientBoltFromRight;
        window.setTimeout(() => {
          triggerAmbientHeroBolt(followupSide);
        }, Math.round(random(1400, 3200)));
      }

      scheduleAmbientHeroBolt();
    }, baseDelay);
  };

  const rectWithinShell = (element, shellRect) => {
    if (!element) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    return {
      left: rect.left - shellRect.left,
      top: rect.top - shellRect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const subdivideSweepPath = (points, spread, phase) => {
    const next = [];

    for (let index = 0; index < points.length - 1; index += 1) {
      const startPoint = points[index];
      const endPoint = points[index + 1];
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const distance = Math.hypot(dx, dy) || 1;
      const perpendicularX = -dy / distance;
      const perpendicularY = dx / distance;
      const alongX = dx / distance;
      const alongY = dy / distance;
      const midT = ((startPoint.t ?? 0) + (endPoint.t ?? 1)) * 0.5;
      const growthT = clamp((midT - 0.06) / 0.94, 0, 1);
      const fanBias = Math.pow(growthT, 1.7);
      const tailBoost = growthT > 0.62 ? lerp(1, 1.34, (growthT - 0.62) / 0.38) : 1;
      const localSpread = spread * lerp(0.24, 1.66, fanBias) * tailBoost;
      const phaseNoise = Math.sin((midT * 9.2 + phase + index * 0.17) * Math.PI) * localSpread * lerp(0.05, 0.12, fanBias);
      const perpendicularOffset =
        random(-localSpread, localSpread) * lerp(0.34, 1, fanBias) * random(0.82, 1.1) + phaseNoise;
      const alongOffset = random(-localSpread * 0.1, localSpread * 0.2) * lerp(0.18, 0.86, fanBias);

      next.push(startPoint);
      next.push({
        x: (startPoint.x + endPoint.x) * 0.5 + perpendicularX * perpendicularOffset + alongX * alongOffset,
        y: (startPoint.y + endPoint.y) * 0.5 + perpendicularY * perpendicularOffset + alongY * alongOffset,
        t: midT,
      });
    }

    next.push(points[points.length - 1]);
    return next;
  };

  const buildSweepPath = (start, control, end, spreadMax, phase, segmentCount = 26) => {
    const points = [
      { x: start.x, y: start.y, t: 0 },
      {
        x: lerp(start.x, control.x, 0.44),
        y: lerp(start.y, control.y, 0.44),
        t: 0.24,
      },
      { x: control.x, y: control.y, t: 0.56 },
      {
        x: lerp(control.x, end.x, 0.58),
        y: lerp(control.y, end.y, 0.58),
        t: 0.8,
      },
      { x: end.x, y: end.y, t: 1 },
    ];

    let refined = points;
    const passes = Math.max(4, Math.min(6, Math.round(Math.log2(segmentCount))));
    let spread = spreadMax;

    for (let pass = 0; pass < passes; pass += 1) {
      refined = subdivideSweepPath(refined, spread, phase + pass * 0.17);
      spread *= 0.58;
    }

    refined[0] = { x: start.x, y: start.y, t: 0 };
    if (refined[1]) {
      refined[1] = {
        x: lerp(start.x, refined[1].x, 0.24),
        y: lerp(start.y, refined[1].y, 0.24),
        t: refined[1].t,
      };
    }
    if (refined[2]) {
      refined[2] = {
        x: lerp(start.x, refined[2].x, 0.4),
        y: lerp(start.y, refined[2].y, 0.4),
        t: refined[2].t,
      };
    }
    if (refined[3]) {
      refined[3] = {
        x: lerp(start.x, refined[3].x, 0.58),
        y: lerp(start.y, refined[3].y, 0.58),
        t: refined[3].t,
      };
    }
    refined[refined.length - 1] = { x: end.x, y: end.y, t: 1 };
    return refined;
  };

  const drawPartialPath = (points, reveal) => {
    const maxIndex = points.length - 1;
    const progress = clamp(reveal, 0, 1) * maxIndex;
    const whole = Math.floor(progress);
    const fraction = progress - whole;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let index = 1; index <= whole && index < points.length; index += 1) {
      context.lineTo(points[index].x, points[index].y);
    }

    if (whole < maxIndex) {
      const start = points[whole];
      const end = points[whole + 1];
      context.lineTo(lerp(start.x, end.x, fraction), lerp(start.y, end.y, fraction));
    }
  };

  const drawHalo = (halo, now) => {
    if (now < halo.born) {
      return true;
    }

    const progress = clamp((now - halo.born) / halo.life, 0, 1);
    if (progress >= 1) {
      return false;
    }

    const alpha = (1 - progress) * halo.alpha;
    const radius = halo.radius * (0.78 + progress * 0.58);
    const gradient = context.createRadialGradient(halo.x, halo.y, 0, halo.x, halo.y, radius);
    gradient.addColorStop(0, `rgba(255, 246, 230, ${alpha * 0.36})`);
    gradient.addColorStop(0.4, `rgba(168, 143, 90, ${alpha * 0.18})`);
    gradient.addColorStop(1, "rgba(168, 143, 90, 0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(halo.x, halo.y, radius, 0, Math.PI * 2);
    context.fill();
    return true;
  };

  const strokeBolt = (points, reveal, alpha, branch = false, strength = 1) => {
    const glowAlpha = (branch ? 0.1 : 0.17) * alpha;
    const lineAlpha = (branch ? 0.2 : 0.32) * alpha;
    const coreAlpha = (branch ? 0.42 : 0.8) * alpha;

    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowBlur = (branch ? 11 : 19) * strength;
    context.shadowColor = `rgba(168, 143, 90, ${glowAlpha * 1.45})`;

    drawPartialPath(points, reveal);
    context.strokeStyle = `rgba(168, 143, 90, ${glowAlpha})`;
    context.lineWidth = (branch ? 5.4 : 9.6) * strength;
    context.stroke();

    context.shadowBlur = (branch ? 6 : 10.5) * strength;
    context.shadowColor = `rgba(195, 200, 207, ${lineAlpha})`;
    drawPartialPath(points, reveal);
    context.strokeStyle = `rgba(195, 200, 207, ${lineAlpha})`;
    context.lineWidth = (branch ? 2 : 3.05) * strength;
    context.stroke();

    context.shadowBlur = 0;
    drawPartialPath(points, reveal);
    context.strokeStyle = `rgba(255, 249, 238, ${coreAlpha})`;
    context.lineWidth = (branch ? 1.12 : 1.4) * strength;
    context.stroke();
    context.restore();
  };

  const drawSweepWash = (points, reveal, alpha, strength = 1) => {
    const visibleProgress = clamp(reveal, 0, 1);
    const lastVisibleIndex = Math.max(1, Math.floor((points.length - 1) * visibleProgress));
    const leader = points[lastVisibleIndex];

    for (let index = 1; index <= lastVisibleIndex; index += 2) {
      const point = points[index];
      const pointT = point.t ?? index / (points.length - 1);
      const radius = lerp(14, 90, Math.pow(pointT, 1.18)) * strength;
      const pointAlpha = alpha * lerp(0.012, 0.075, pointT);
      const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      gradient.addColorStop(0, `rgba(255, 246, 230, ${pointAlpha * 0.32})`);
      gradient.addColorStop(0.34, `rgba(168, 143, 90, ${pointAlpha})`);
      gradient.addColorStop(1, "rgba(168, 143, 90, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    }

    if (leader) {
      const leaderRadius = 54 * strength;
      const leaderGradient = context.createRadialGradient(leader.x, leader.y, 0, leader.x, leader.y, leaderRadius);
      leaderGradient.addColorStop(0, `rgba(255, 248, 236, ${alpha * 0.18})`);
      leaderGradient.addColorStop(0.28, `rgba(168, 143, 90, ${alpha * 0.12})`);
      leaderGradient.addColorStop(1, "rgba(168, 143, 90, 0)");
      context.fillStyle = leaderGradient;
      context.beginPath();
      context.arc(leader.x, leader.y, leaderRadius, 0, Math.PI * 2);
      context.fill();
    }
  };

  const drawAfterglow = (points, reveal, alpha, strength = 1) => {
    if (alpha <= 0) {
      return;
    }

    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowBlur = 10 * strength;
    context.shadowColor = `rgba(168, 143, 90, ${alpha * 0.18})`;
    drawPartialPath(points, Math.min(reveal, 1));
    context.strokeStyle = `rgba(168, 143, 90, ${alpha * 0.16})`;
    context.lineWidth = 1.15 * strength;
    context.stroke();
    context.restore();
  };

  const drawImpactSpark = (source, now, born, life, strength = 1) => {
    if (!source || !life) {
      return;
    }

    const progress = clamp((now - born) / life, 0, 1);
    if (progress >= 1) {
      return;
    }

    const alpha = (1 - progress) * 0.9;
    const vectorLength = Math.hypot(handoffVector.x, handoffVector.y) || 1;
    const dirX = handoffVector.x / vectorLength;
    const dirY = handoffVector.y / vectorLength;
    const perpX = -dirY;
    const perpY = dirX;
    const sparkLength = lerp(11, 4, progress) * strength;

    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    context.shadowBlur = 10 * strength;
    context.shadowColor = `rgba(168, 143, 90, ${alpha * 0.22})`;

    [-1, 0, 1].forEach((offset, index) => {
      const bias = offset * lerp(5, 1.8, progress) * strength;
      context.beginPath();
      context.moveTo(source.x, source.y);
      context.lineTo(
        source.x + dirX * sparkLength + perpX * bias,
        source.y + dirY * sparkLength + perpY * bias
      );
      context.strokeStyle = index === 1
        ? `rgba(255, 249, 238, ${alpha * 0.82})`
        : `rgba(168, 143, 90, ${alpha * 0.52})`;
      context.lineWidth = index === 1 ? 1.18 * strength : 0.82 * strength;
      context.stroke();
    });

    context.restore();
  };

  const drawBorderReaction = (now, born, life, strength = 1) => {
    if (!life) {
      return;
    }

    const progress = clamp((now - born) / life, 0, 1);
    if (progress >= 1) {
      return;
    }

    const alpha = (1 - progress) * 0.22;
    const radius = Math.min(32, Math.max(26, width * 0.032));
    const center = { x: radius, y: radius };
    const arcSweep = lerp(0.18, 0.68, 1 - progress);

    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    context.shadowBlur = 8 * strength;
    context.shadowColor = `rgba(168, 143, 90, ${alpha * 0.9})`;
    context.beginPath();
    context.arc(center.x, center.y, radius - 1.4, Math.PI * 1.02, Math.PI * (1.02 + arcSweep), false);
    context.strokeStyle = `rgba(191, 166, 112, ${alpha})`;
    context.lineWidth = 1.05 * strength;
    context.stroke();
    context.restore();
  };

  const drawSourceRoot = (points, reveal, alpha, strength = 1) => {
    const source = points?.[0];
    if (!source) {
      return;
    }

    const visibleIndex = Math.min(points.length - 1, Math.max(2, Math.floor((points.length - 1) * clamp(reveal, 0.08, 1))));
    const target = points[visibleIndex];
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.hypot(dx, dy) || 1;
    const rootLength = Math.min(distance * 0.28, 22 * strength);
    const rootEnd = {
      x: source.x + (dx / distance) * rootLength,
      y: source.y + (dy / distance) * rootLength,
    };
    const feederLength = Math.max(18, 26 * strength);
    const handoffLength = Math.hypot(handoffVector.x, handoffVector.y) || 1;
    const feederStart = {
      x: source.x - (handoffVector.x / handoffLength) * feederLength,
      y: source.y - (handoffVector.y / handoffLength) * feederLength,
    };

    const glow = context.createRadialGradient(source.x, source.y, 0, source.x, source.y, 20 * strength);
    glow.addColorStop(0, `rgba(255, 249, 238, ${alpha * 0.22})`);
    glow.addColorStop(0.34, `rgba(168, 143, 90, ${alpha * 0.16})`);
    glow.addColorStop(1, "rgba(168, 143, 90, 0)");

    context.fillStyle = glow;
    context.beginPath();
    context.arc(source.x, source.y, 20 * strength, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    context.shadowBlur = 12 * strength;
    context.shadowColor = `rgba(168, 143, 90, ${alpha * 0.22})`;
    context.beginPath();
    context.moveTo(feederStart.x, feederStart.y);
    context.lineTo(source.x, source.y);
    context.strokeStyle = `rgba(255, 248, 236, ${alpha * 0.52})`;
    context.lineWidth = 1.12 * strength;
    context.stroke();
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.lineTo(rootEnd.x, rootEnd.y);
    context.strokeStyle = `rgba(255, 248, 236, ${alpha * 0.74})`;
    context.lineWidth = 1.55 * strength;
    context.stroke();
    context.restore();
  };

  const emitHeroBolt = (now, emphasis = 1, sourcePoint = null, entryVector = null) => {
    const shellRect = shell.getBoundingClientRect();
    const titleRect = rectWithinShell(title, shellRect);

    const start = sourcePoint
      ? { x: sourcePoint.x, y: sourcePoint.y }
      : { x: anchorPoint.x, y: anchorPoint.y };
    const resolvedEntryVector = entryVector
      ? (() => {
          const length = Math.hypot(entryVector.x, entryVector.y) || 1;
          return { x: entryVector.x / length, y: entryVector.y / length };
        })()
      : handoffVector;
    const isRightEntry = resolvedEntryVector.x < 0;
    const sourceGuide = {
      x: start.x + resolvedEntryVector.x * width * 0.28,
      y: start.y + resolvedEntryVector.y * height * 0.22,
    };
    const control = titleRect
      ? {
          x: clamp(
            lerp(
              sourceGuide.x,
              titleRect.left + titleRect.width * (isRightEntry ? 0.64 : 0.36),
              0.62
            ),
            width * 0.18,
            width * 0.82
          ),
          y: clamp(lerp(sourceGuide.y, titleRect.top + titleRect.height * 0.72, 0.62), height * 0.18, height * 0.66),
        }
      : {
          x: sourceGuide.x,
          y: sourceGuide.y,
        };
    const end = {
      x: isRightEntry ? width * 0.014 : width * 0.986,
      y: height * 0.958,
    };

    const seedBase = isRightEntry ? [0.26, -0.08, -0.42] : [-0.26, 0.08, 0.42];
    const trunkSeeds = seedBase.map((seed) => seed + random(-0.035, 0.035));

    const trunks = trunkSeeds.map((seed, index) => {
      const intensity = index === 1 ? 1.22 : index === 0 ? 0.82 : 0.72;
      const trunkControl = {
        x: clamp(control.x + seed * width * 0.3, width * 0.08, width * 0.86),
        y: clamp(control.y + seed * height * 0.23, height * 0.1, height * 0.84),
      };
      const trunkEnd = {
        x: isRightEntry
          ? clamp(
              end.x + Math.abs(seed) * width * 0.13 + seed * width * 0.086,
              width * 0.005,
              width * 0.28
            )
          : clamp(
              end.x - Math.abs(seed) * width * 0.13 + seed * width * 0.086,
              width * 0.72,
              width * 0.995
            ),
        y: clamp(end.y - seed * height * 0.27 + Math.abs(seed) * height * 0.084, height * 0.62, height * 0.993),
      };
      const main = buildSweepPath(
        start,
        trunkControl,
        trunkEnd,
        (116 + Math.abs(seed) * 46) * emphasis * intensity,
        random(0.06, 1.72),
        38
      );
      const branches = [];
      const branchCount =
          index === 1 ? randomInt(2, 4) : index === 0 && Math.random() < 0.88 ? randomInt(2, 3) : Math.random() < 0.55 ? randomInt(1, 2) : 0;

      for (let branchIndex = 0; branchIndex < branchCount; branchIndex += 1) {
        const branchStartT = random(0.44, 0.9);
        const anchorIndex = clamp(Math.floor(branchStartT * (main.length - 1)), 5, main.length - 4);
        const anchor = main[anchorIndex];
        const branchProgress = anchor.t ?? anchorIndex / (main.length - 1);
        const branchDirection = Math.random() < 0.64 ? (isRightEntry ? -1 : 1) : (isRightEntry ? 1 : -1);
        const branchEnd = {
          x: anchor.x + random(42, lerp(92, 196, branchProgress)) * branchDirection,
          y: anchor.y + random(-86, lerp(28, 132, branchProgress)),
        };
        const branchControl = {
          x: lerp(anchor.x, branchEnd.x, random(0.12, 0.64)),
          y: lerp(anchor.y, branchEnd.y, random(0.14, 0.54)) - lerp(0, 18, branchProgress),
        };
        branches.push(
          buildSweepPath(
            anchor,
            branchControl,
            branchEnd,
            lerp(12, 28, branchProgress) * emphasis * intensity,
            random(0.04, 1.84),
            10
          )
        );
      }

      return {
        main,
        branches,
        strength: intensity,
      };
    });

    bolts.push({
      born: now,
      life: random(1900, 2450),
      alpha: random(0.62, 0.8) * Math.min(0.96, 0.72 + emphasis * 0.12),
      strength: 1.12,
      sparkBorn: now,
      sparkLife: 180,
      borderBorn: now + 30,
      borderLife: 240,
      main: trunks[1]?.main ?? trunks[0].main,
      branches: [],
      trunks,
    });

    halos.push({ x: start.x, y: start.y, radius: random(18, 32), alpha: 0.12 * emphasis, life: random(760, 1120), born: now });
    halos.push({ x: control.x, y: control.y, radius: random(22, 38), alpha: 0.08 * emphasis, life: random(980, 1420), born: now });
    halos.push({ x: end.x, y: end.y, radius: random(28, 48), alpha: 0.18 * emphasis, life: random(1100, 1650), born: now });

    if (bolts.length > (compactMedia.matches ? 5 : 7)) {
      bolts = bolts.slice(-1 * (compactMedia.matches ? 5 : 7));
    }

    if (halos.length > 16) {
      halos = halos.slice(-16);
    }
  };

  const drawCornerCharge = (now, prepProgress) => {
    const eased = clamp(prepProgress, 0, 1);
    const lineLength = lerp(anchorPoint.x + width * 0.02, anchorPoint.x + width * 0.14, eased);
    const lineDepth = lerp(anchorPoint.y + height * 0.01, anchorPoint.y + height * 0.12, eased);
    const pulse = 0.82 + Math.sin(now * 0.0065) * 0.08;
    const glowRadius = lerp(22, 64, eased) * pulse;
    const glowAlpha = lerp(0.04, 0.16, eased);

    const gradient = context.createRadialGradient(anchorPoint.x, anchorPoint.y, 0, anchorPoint.x, anchorPoint.y, glowRadius);
    gradient.addColorStop(0, `rgba(255, 247, 233, ${glowAlpha * 0.34})`);
    gradient.addColorStop(0.32, `rgba(168, 143, 90, ${glowAlpha})`);
    gradient.addColorStop(1, "rgba(168, 143, 90, 0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(anchorPoint.x, anchorPoint.y, glowRadius, 0, Math.PI * 2);
    context.fill();

    const lineGradient = context.createLinearGradient(anchorPoint.x, anchorPoint.y, lineLength, lineDepth);
    lineGradient.addColorStop(0, `rgba(168, 143, 90, ${glowAlpha * 0.12})`);
    lineGradient.addColorStop(0.45, `rgba(168, 143, 90, ${glowAlpha * 0.34})`);
    lineGradient.addColorStop(1, "rgba(195, 200, 207, 0)");

    context.save();
    context.beginPath();
    context.moveTo(anchorPoint.x, anchorPoint.y);
    context.lineTo(lineLength, lineDepth);
    context.strokeStyle = lineGradient;
    context.lineWidth = 1;
    context.shadowBlur = 10;
    context.shadowColor = `rgba(168, 143, 90, ${glowAlpha * 0.6})`;
    context.stroke();
    context.restore();
  };

  const tick = (now) => {
    const frameDelta = previousFrame ? Math.min(now - previousFrame, 48) : 16;
    previousFrame = now;
    const shellRect = shell.getBoundingClientRect();
    const visible = shellRect.bottom > 0 && shellRect.top < window.innerHeight;
    const visibleRatio = visible
      ? clamp((Math.min(shellRect.bottom, window.innerHeight) - Math.max(shellRect.top, 0)) / Math.max(shellRect.height, 1), 0, 1)
      : 0;

    context.clearRect(0, 0, width, height);

    if (!hasPlayed) {
      if (visibleRatio > 0.18) {
        visibleChargeMs = Math.min(4200, visibleChargeMs + frameDelta);
      }

      const prepProgress = clamp(visibleChargeMs / 4000, 0, 1);
      if (prepProgress > 0.02) {
        drawCornerCharge(now, prepProgress);
      }

      if (visibleChargeMs >= 4000 && !awaitingHandoff) {
        const shellRectNow = shell.getBoundingClientRect();
        const impactViewport = {
          x: shellRectNow.left + anchorPoint.x,
          y: shellRectNow.top + anchorPoint.y,
        };

        window.dispatchEvent(
          new CustomEvent("solutions-hero-impact", {
            detail: {
              impactViewport,
            },
          })
        );
        awaitingHandoff = true;
      }
    }

    halos = halos.filter((halo) => drawHalo(halo, now));

    bolts = bolts.filter((bolt) => {
      const age = now - bolt.born;
      if (age < 0) {
        return true;
      }

      if (age >= bolt.life) {
        return false;
      }

      const reveal = clamp(age / 720, 0, 1);
      const fadeStart = bolt.life * 0.66;
      const alpha = age < fadeStart ? bolt.alpha : bolt.alpha * (1 - (age - fadeStart) / (bolt.life - fadeStart));

      const trunks = bolt.trunks?.length
        ? bolt.trunks
        : [{ main: bolt.main, branches: bolt.branches, strength: 1 }];

      drawImpactSpark(
        bolt.main?.[0] ?? trunks[Math.min(1, trunks.length - 1)].main?.[0],
        now,
        bolt.sparkBorn ?? bolt.born,
        bolt.sparkLife ?? 0,
        bolt.strength ?? 1
      );
      drawBorderReaction(now, bolt.borderBorn ?? bolt.born, bolt.borderLife ?? 0, bolt.strength ?? 1);
      drawSourceRoot(bolt.main ?? trunks[Math.min(1, trunks.length - 1)].main, reveal, alpha, bolt.strength ?? 1);

      trunks.forEach((trunk, trunkIndex) => {
        const trunkStrength = (bolt.strength ?? 1) * (trunk.strength ?? 1);
        const trunkAlpha = alpha * (trunkIndex === 1 ? 1 : trunkIndex === 0 ? 0.56 : 0.34);
        const washAlpha = trunkIndex === 1 ? trunkAlpha : trunkAlpha * 0.48;
        drawSweepWash(trunk.main, reveal, washAlpha, trunkStrength);
        drawAfterglow(trunk.main, reveal, trunkAlpha * (1 - clamp(reveal * 0.72, 0, 0.72)), trunkStrength * 0.92);
        strokeBolt(trunk.main, reveal, trunkAlpha, false, trunkStrength);
        trunk.branches.forEach((branch) => {
          strokeBolt(branch, Math.min(reveal * 1.08, 1), trunkAlpha * 0.2, true, trunkStrength * 0.64);
        });
      });
      return true;
    });

    if (hasPlayed && !bolts.length && !halos.length) {
      rafId = 0;
      return;
    }

    rafId = window.requestAnimationFrame(tick);
  };

  const onResize = () => resizeCanvas();
  const onHeroHandoff = (event) => {
    if (hasPlayed) {
      return;
    }

    const incomingVector = event.detail?.vector;
    if (incomingVector) {
      const incomingLength = Math.hypot(incomingVector.x, incomingVector.y) || 1;
      handoffVector = {
        x: incomingVector.x / incomingLength,
        y: incomingVector.y / incomingLength,
      };
    }

    emitHeroBolt(event.detail?.at ?? performance.now(), 1.08, anchorPoint, handoffVector);
    hasPlayed = true;
    awaitingHandoff = false;
    shell.classList.remove("is-hero-dimmed");
    shell.classList.add("is-hero-energized");
  };

  const triggerAmbientHeroBolt = (fromRight = false) => {
    const shellRect = shell.getBoundingClientRect();
    const visible = shellRect.bottom > 0 && shellRect.top < window.innerHeight;
    if (!visible) {
      return;
    }

    const { sourcePoint, entryVector } = getEdgeStrikeConfig(fromRight);
    emitHeroBolt(performance.now(), 0.92, sourcePoint, entryVector);
    ensureTicking();
  };

  shell.classList.add("is-hero-dimmed");
  resizeCanvas();
  window.addEventListener("resize", onResize);
  window.addEventListener("solutions-hero-handoff", onHeroHandoff);
  rafId = window.requestAnimationFrame(tick);
  scheduleAmbientHeroBolt(Math.round(random(36000, 68000)));

  window.addEventListener(
    "pagehide",
    () => {
      window.cancelAnimationFrame(rafId);
      if (ambientBoltTimeoutId) {
        window.clearTimeout(ambientBoltTimeoutId);
      }
      window.removeEventListener("resize", onResize);
      window.removeEventListener("solutions-hero-handoff", onHeroHandoff);
    },
    { once: true }
  );
}

function prepareSolutionsHeroKicker(kicker) {
  if (!kicker) {
    return [];
  }

  if (!kicker.dataset.kickerText) {
    kicker.dataset.kickerText = kicker.textContent.trim().replace(/\s+/g, " ");
  }

  const useWordTokens = window.matchMedia("(max-width: 640px)").matches;
  const kickerMode = useWordTokens ? "word" : "char";

  if (
    kicker.dataset.kickerPrepared === "true" &&
    kicker.dataset.kickerMode === kickerMode
  ) {
    return Array.from(kicker.querySelectorAll(".solutions-hero-kicker-char"));
  }

  const text = kicker.dataset.kickerText;
  if (!text) {
    return [];
  }

  kicker.textContent = "";

  if (useWordTokens) {
    text.split(" ").forEach((word, index, words) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "solutions-hero-kicker-char";
      wordSpan.textContent = word;
      kicker.append(wordSpan);

      if (index < words.length - 1) {
        const spaceSpan = document.createElement("span");
        spaceSpan.className = "solutions-hero-kicker-space";
        spaceSpan.textContent = " ";
        kicker.append(spaceSpan);
      }
    });
  } else {
    Array.from(text).forEach((character) => {
      const span = document.createElement("span");

      if (character === " ") {
        span.className = "solutions-hero-kicker-space";
        span.textContent = " ";
      } else {
        span.className = "solutions-hero-kicker-char";
        span.textContent = character;
      }

      kicker.append(span);
    });
  }

  kicker.dataset.kickerPrepared = "true";
  kicker.dataset.kickerMode = kickerMode;
  return Array.from(kicker.querySelectorAll(".solutions-hero-kicker-char"));
}

function initSolutionsHeroTitleFit() {
  if (!document.body?.classList.contains("solutions-page")) {
    return;
  }

  const title = document.querySelector("[data-solutions-hero-title]");
  const copy = document.querySelector(".solutions-hero-copy");
  if (!title || !copy) {
    return;
  }

  let frameId = 0;
  let resizeObserver = null;

  const applyFit = () => {
    frameId = 0;

    if (window.matchMedia("(max-width: 900px)").matches) {
      title.style.removeProperty("--solutions-hero-title-size");
      title.style.removeProperty("width");
      return;
    }

    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize || "16") || 16;
    const availableWidth = Math.max(copy.clientWidth - 40, 0);
    if (!availableWidth) {
      return;
    }

    title.style.width = `${availableWidth}px`;

    let low = rootFontSize * 6.25;
    let high = Math.min(window.innerWidth * 0.26, rootFontSize * 24);

    for (let step = 0; step < 18; step += 1) {
      const mid = (low + high) / 2;
      title.style.setProperty("--solutions-hero-title-size", `${mid}px`);

      if (title.scrollWidth <= availableWidth) {
        low = mid;
      } else {
        high = mid;
      }
    }

    title.style.setProperty("--solutions-hero-title-size", `${Math.floor(low)}px`);
  };

  const scheduleFit = () => {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(applyFit);
  };

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  fontsReady.then(scheduleFit);
  window.addEventListener("load", scheduleFit, { once: true });
  window.addEventListener("resize", scheduleFit, { passive: true });
  window.setTimeout(scheduleFit, 180);
  window.setTimeout(scheduleFit, 900);

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(scheduleFit);
    resizeObserver.observe(copy);
  }

  window.addEventListener(
    "pagehide",
    () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("resize", scheduleFit);
      resizeObserver?.disconnect();
    },
    { once: true }
  );
}

function initSolutionsHeroIntro() {
  if (!document.body?.classList.contains("solutions-page") || prefersReducedMotion.matches || !window.gsap) {
    return;
  }

  const section = document.querySelector(".solutions-hero-section");
  const shell = document.querySelector(".solutions-hero-shell");
  const kicker = document.querySelector("[data-solutions-kicker]");
  const title = document.querySelector("[data-solutions-hero-title]");
  if (!section || !shell || !kicker || !title) {
    return;
  }

  const titleWords = Array.from(title.querySelectorAll(".solutions-hero-title-word"));
  const lead = shell.querySelector(".solutions-hero-lead");
  const actions = shell.querySelector(".hero-actions");
  const proof = shell.querySelector(".solutions-hero-inline-proof");
  const aside = shell.querySelector(".solutions-hero-aside");
  const secondaryTargets = [lead, actions, proof, aside].filter(Boolean);
  const { gsap } = window;

  const playIntro = () => {
    if (shell.dataset.solutionsHeroIntroPlayed === "true") {
      return;
    }

    const kickerChars = prepareSolutionsHeroKicker(kicker);
    if (!kickerChars.length || !titleWords.length) {
      shell.dataset.solutionsHeroIntroPlayed = "true";
      return;
    }

    shell.dataset.solutionsHeroIntroPlayed = "true";

    gsap.set(kicker, {
      "--solutions-kicker-line-scale": 0.18,
      "--solutions-kicker-line-opacity": 0.2,
    });
    gsap.set(kickerChars, {
      opacity: 0,
      yPercent: 18,
      scaleX: 0.76,
      scaleY: 1.12,
      filter: "blur(7px)",
      transformOrigin: "50% 70%",
      force3D: true,
    });
    gsap.set(title, {
      opacity: 0,
      scale: 0.86,
      filter: "blur(18px)",
      transformOrigin: "50% 52%",
      force3D: true,
      "--solutions-hero-title-glow": 0.16,
    });
    gsap.set(titleWords, {
      opacity: 0,
      xPercent: (index) => (index === 0 ? 12 : -12),
      scaleX: 0.9,
      filter: "blur(10px)",
      transformOrigin: (index) => (index === 0 ? "100% 50%" : "0% 50%"),
      force3D: true,
    });
    gsap.set(secondaryTargets, {
      opacity: 0,
      y: 18,
      filter: "blur(10px)",
      force3D: true,
    });

    const introTimeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    introTimeline.to(
      kicker,
      {
        "--solutions-kicker-line-scale": 1,
        "--solutions-kicker-line-opacity": 1,
        duration: 0.42,
        ease: "power2.out",
      },
      0
    );

    introTimeline.to(
      kickerChars,
      {
        opacity: 1,
        yPercent: 0,
        scaleX: 1,
        scaleY: 1,
        filter: "blur(0px)",
        duration: 0.34,
        stagger: 0.018,
        ease: "power3.out",
      },
      0.04
    );

    introTimeline.to(
      title,
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        "--solutions-hero-title-glow": 0.82,
        duration: 0.82,
      },
      0.18
    );

    introTimeline.to(
      titleWords,
      {
        opacity: 1,
        xPercent: 0,
        scaleX: 1,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.04,
        ease: "power4.out",
      },
      0.2
    );

    introTimeline.to(
      secondaryTargets,
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.64,
        stagger: 0.08,
      },
      0.66
    );
  };

  const startIntro = () => {
    const sectionTop = section.getBoundingClientRect().top;
    if (!("IntersectionObserver" in window) || sectionTop <= window.innerHeight * 0.82) {
      window.requestAnimationFrame(playIntro);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          playIntro();
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.28,
      }
    );

    observer.observe(section);

    window.addEventListener(
      "pagehide",
      () => {
        observer.disconnect();
      },
      { once: true }
    );
  };

  const titleRevealReady = document.fonts?.ready ?? Promise.resolve();
  titleRevealReady.then(startIntro);
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

  const selectors = [
    "[data-title-reveal]",
    ".hero-copy h1",
    ".stats-heading-block h2",
    ".section-header h2",
    ".story-panel-copy h2",
    ".final-cta-card h2",
  ];
  const targets = Array.from(new Set(Array.from(document.querySelectorAll(selectors.join(", ")))));

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

  const playTitleReveal = (lines, delay = 0, variant = "default") => {
    const timeline = gsap.timeline({ delay });
    const isDouble = variant === "double";

    timeline.to(lines, {
      yPercent: isDouble ? -8 : -4,
      rotateX: isDouble ? 14 : 10,
      z: isDouble ? 14 : 10,
      opacity: 1,
      duration: isDouble ? 1.28 : 1.18,
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
    const variant = title.dataset.titleVariant || "default";
    const start = title.dataset.titleStart || "top 76%";
    gsap.set(lines, titleFromState);

    if (isHeroTitle) {
      requestAnimationFrame(() => {
        playTitleReveal(lines, 0.18, variant);
      });
      return;
    }

    ScrollTrigger.create({
      trigger: title,
      start,
      once: true,
      onEnter: () => {
        playTitleReveal(lines, 0.08, variant);
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
    if (!card.isConnected || card.getClientRects().length === 0 || card.offsetWidth === 0 || card.offsetHeight === 0) {
      return null;
    }

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
    const traceDelay = Number.parseFloat(card.dataset.frameTraceDelay || "0") || 0;
    const isSolutionsServiceCard = card.matches(".services-rail-card");
    const glowDuration = isSolutionsServiceCard ? 1.18 : 1.8;
    const lineDuration = isSolutionsServiceCard ? 1.08 : 1.48;
    const settleStart = isSolutionsServiceCard ? 0.88 : 1.18;
    const glowPeakOpacity = isSolutionsServiceCard ? 0.34 : 0.52;
    const linePeakOpacity = isSolutionsServiceCard ? 0.88 : 0.92;
    const glowRestOpacity = isSolutionsServiceCard ? 0.08 : 0.18;

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
          delay: traceDelay,
          onComplete: () => {
            card.classList.add("is-frame-trace-complete");
          },
        });

        tl.to(
          glowPath,
          {
            strokeDashoffset: 0,
            opacity: glowPeakOpacity,
            duration: glowDuration,
            ease: "power2.inOut",
          },
          0
        );

        tl.to(
          linePath,
          {
            strokeDashoffset: 0,
            opacity: linePeakOpacity,
            duration: lineDuration,
            ease: "power2.out",
          },
          0.1
        );

        tl.to(
          glowPath,
          {
            opacity: glowRestOpacity,
            duration: isSolutionsServiceCard ? 0.46 : 0.7,
            ease: "power2.out",
          },
          settleStart
        );
      },
    });
  });
}

function initSolutionsFrameTraceTargets() {
  if (!document.body?.classList.contains("solutions-page")) {
    return;
  }

  const register = (selector, traceName, delayStep = 0) => {
    const elements = Array.from(document.querySelectorAll(selector));
    elements.forEach((element, index) => {
      element.classList.add("frame-trace-card");

      if (!element.dataset.frameTrace) {
        element.dataset.frameTrace = traceName;
      }

      if (delayStep > 0 && !element.dataset.frameTraceDelay) {
        element.dataset.frameTraceDelay = (index * delayStep).toFixed(2);
      }
    });
  };

  register(".solutions-proof-pill", "solutions-proof-pill", 0.08);
  register(".google-proof-stage .google-review-card, .google-proof-stage .google-review-card-featured", "solutions-review-card", 0.05);
  register(".google-proof-mobile .google-review-card, .google-proof-mobile .google-review-card-featured", "solutions-review-card", 0.05);
  register(".service-area-shell", "solutions-area");
  register(".service-area-marquee .service-area-sequence:first-child .service-area-tile", "solutions-area-tile", 0.035);
  register(".service-area-mobile-grid .service-area-tile", "solutions-area-tile", 0.035);
  register(".solutions-closing-action-panel", "solutions-action");
}

function initPathwayReveal() {
  const pathwayCard = document.querySelector("[data-pathway-reveal]");
  if (!pathwayCard) {
    return;
  }

  const settleImmediately = () => {
    pathwayCard.classList.add(
      "is-pathway-settled",
      "is-pathway-support-ready",
      "is-pathway-support-one-ready",
      "is-pathway-support-two-ready",
      "is-pathway-support-three-ready",
      "is-pathway-button-ready"
    );
  };

  if (prefersReducedMotion.matches) {
    settleImmediately();
    return;
  }

  let hasPlayed = false;
  const timeouts = [];

  const schedule = (delay, callback) => {
    timeouts.push(window.setTimeout(callback, delay));
  };

  const playSequence = () => {
    if (hasPlayed) {
      return;
    }

    hasPlayed = true;

    schedule(500, () => {
      pathwayCard.classList.add("is-pathway-line-one-visible");
    });

    schedule(2300, () => {
      pathwayCard.classList.add("is-pathway-line-two-visible");
    });

    schedule(5600, () => {
      pathwayCard.classList.add("is-pathway-intro-clearing");
    });

    schedule(6950, () => {
      pathwayCard.classList.add("is-pathway-settled");
    });

    schedule(9300, () => {
      pathwayCard.classList.add("is-pathway-support-ready");
    });

    schedule(9300, () => {
      pathwayCard.classList.add("is-pathway-support-one-ready");
    });

    schedule(11050, () => {
      pathwayCard.classList.add("is-pathway-support-two-ready");
    });

    schedule(13550, () => {
      pathwayCard.classList.add("is-pathway-support-three-ready");
    });

    schedule(15850, () => {
      pathwayCard.classList.add("is-pathway-button-ready");
    });
  };

  if (!("IntersectionObserver" in window)) {
    playSequence();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || hasPlayed) {
          return;
        }

        playSequence();
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.72,
      rootMargin: "0px 0px -2% 0px",
    }
  );

  observer.observe(pathwayCard);

  window.addEventListener("pagehide", () => {
    observer.disconnect();
    timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
  });
}

function initSolutionsProcessBadgeSequence() {
  const section = document.querySelector(".solutions-process-section");
  const badges = Array.from(document.querySelectorAll("[data-process-badge]"));
  if (!section || !badges.length) {
    return;
  }

  const delays = [0, 8000, 16000];
  let hasPlayed = false;
  const timeouts = [];

  const clearTimers = () => {
    timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeouts.length = 0;
  };

  const lightBadge = (badge) => {
    badge.classList.add("is-process-badge-lit");
  };

  const playSequence = () => {
    if (hasPlayed) {
      return;
    }

    hasPlayed = true;
    badges.forEach((badge) => badge.classList.remove("is-process-badge-lit"));

    badges.forEach((badge, index) => {
      const timeoutId = window.setTimeout(() => {
        lightBadge(badge);
      }, delays[index] ?? index * 8000);
      timeouts.push(timeoutId);
    });
  };

  if (!("IntersectionObserver" in window)) {
    playSequence();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || hasPlayed) {
          return;
        }

        playSequence();
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.5,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  observer.observe(section);

  window.addEventListener("pagehide", () => {
    observer.disconnect();
    clearTimers();
  });
}

initAutoHideNav();
initStatsSection();
initStorytelling();
initSolutionsServicesRail();
initSolutionsEnergyField();
initSolutionsHeroZap();
initSolutionsHeroTitleFit();
initSolutionsHeroIntro();
initCtaParticles();
initSolutionsFrameTraceTargets();
initFrameTraceAccents();
initPathwayReveal();
initSolutionsProcessBadgeSequence();

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
