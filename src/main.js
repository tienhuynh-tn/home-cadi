import "./styles.css";

const WISH_ROTATION_MIN_MS = 4500;
const WISH_ROTATION_MAX_MS = 16000;
const WISH_ROTATION_BASE_MS = 3600;
const WISH_ROTATION_MS_PER_CHARACTER = 28;
const TITLE_CHARACTER_DELAY_MS = 145;
const TITLE_LINE_DELAY_MS = 650;
const STORY_START_DATE = new Date("2006-09-05T00:00:00+07:00");
const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
let supabaseClientPromise;

const wishesList = document.querySelector("#wishes-list");
const rsvpWishesPage = document.querySelector(".rsvp-wishes-page");
const storyYears = document.querySelector("#story-years");
const storyMonths = document.querySelector("#story-months");
const storyDays = document.querySelector("#story-days");
const storyHours = document.querySelector("#story-hours");
const storyMinutes = document.querySelector("#story-minutes");
const storySeconds = document.querySelector("#story-seconds");
const weddingSong = document.querySelector("#wedding-song");
const musicToggle = document.querySelector("#music-toggle");
const heroTitle = document.querySelector(".hero-title");
let revealObserver;
let songWasStarted = false;
let songWasPausedByUser = false;
let currentWishIndex = 0;
let wishRotationTimer;
let wishRotationIsPaused = false;

const getSupabaseClient = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey),
    );
  }

  return supabaseClientPromise;
};

const scheduleNonCriticalWork = (callback) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 2500 });
    return;
  }

  window.setTimeout(callback, 1200);
};

const padTime = (value) => String(value).padStart(2, "0");

const splitGraphemes = (text) => {
  if ("Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter("vi", { granularity: "grapheme" }).segment(text), ({ segment }) => segment);
  }

  return Array.from(text);
};

const getCharacterCount = (text) => splitGraphemes(text).length;

const showRevealElement = (element) => {
  element.classList.add("is-visible");
};

const observeRevealElement = (element) => {
  if (!revealObserver) {
    showRevealElement(element);
    return;
  }

  revealObserver.observe(element);
};

const setupHandwritingTitle = () => {
  if (!heroTitle || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const lines = Array.from(heroTitle.querySelectorAll("span"));
  const titleText = lines.map((line) => line.textContent.trim()).join(" ");
  heroTitle.setAttribute("aria-label", titleText);
  const animatedLines = lines.map((line) => {
    const text = line.textContent.trim();
    const characters = splitGraphemes(text);
    const reserveElement = document.createElement("span");
    const liveElement = document.createElement("span");
    const maskElement = document.createElement("span");
    const liveTextElement = document.createElement("span");
    const measureElement = document.createElement("span");

    reserveElement.className = "handwriting-reserve";
    reserveElement.textContent = text;
    liveElement.className = "handwriting-live";
    maskElement.className = "handwriting-mask";
    liveTextElement.className = "handwriting-live-text";
    liveTextElement.textContent = text;
    measureElement.className = "handwriting-measure";
    maskElement.append(liveTextElement);
    liveElement.append(maskElement);

    line.setAttribute("aria-hidden", "true");
    line.textContent = "";
    line.append(reserveElement, liveElement, measureElement);

    return {
      characters,
      maskElement,
      measureElement,
      widths: [],
    };
  });

  const measureLine = (line) => {
    const fontSize = Number.parseFloat(window.getComputedStyle(line.measureElement).fontSize);
    const overhangBuffer = Math.ceil(fontSize * 0.42);

    line.widths = line.characters.map((_, characterIndex) => {
      line.measureElement.textContent = line.characters.slice(0, characterIndex + 1).join("");
      return Math.ceil(line.measureElement.getBoundingClientRect().width) + overhangBuffer;
    });

    line.measureElement.textContent = "";
  };

  const typeLine = (lineIndex) => {
    const line = animatedLines[lineIndex];

    if (!line) {
      return;
    }

    measureLine(line);
    line.characters.forEach((_, characterIndex) => {
      window.setTimeout(() => {
        line.maskElement.style.width = `${line.widths[characterIndex]}px`;

        if (characterIndex === line.characters.length - 1) {
          line.maskElement.style.willChange = "auto";
          window.setTimeout(() => typeLine(lineIndex + 1), TITLE_LINE_DELAY_MS);
        }
      }, characterIndex * TITLE_CHARACTER_DELAY_MS);
    });
  };

  const startWriting = () => {
    if (heroTitle.classList.contains("is-writing")) {
      return;
    }

    heroTitle.classList.add("is-writing");
    const beginTyping = () => typeLine(0);

    if (document.fonts?.ready) {
      document.fonts.ready.then(beginTyping, beginTyping);
      return;
    }

    beginTyping();
  };

  if (!("IntersectionObserver" in window)) {
    window.requestAnimationFrame(startWriting);
    return;
  }

  const titleObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        startWriting();
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.45,
    },
  );

  titleObserver.observe(heroTitle);
};

const setupScrollReveal = () => {
  const revealElements = document.querySelectorAll(".scroll-reveal");

  if (!revealElements.length) {
    return;
  }

  document.documentElement.classList.add("reveal-ready");

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealElements.forEach(showRevealElement);
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        showRevealElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -4% 0px",
      threshold: 0.08,
    },
  );

  revealElements.forEach(observeRevealElement);
};

const updateStoryTimer = () => {
  if (!storyYears || !storyMonths || !storyDays || !storyHours || !storyMinutes || !storySeconds) {
    return;
  }

  const now = new Date();
  const anniversary = new Date(STORY_START_DATE);
  let years = now.getFullYear() - STORY_START_DATE.getFullYear();

  anniversary.setFullYear(STORY_START_DATE.getFullYear() + years);

  if (anniversary > now) {
    years -= 1;
    anniversary.setFullYear(STORY_START_DATE.getFullYear() + years);
  }

  let months = now.getMonth() - anniversary.getMonth();
  const monthMarker = new Date(anniversary);

  if (months < 0) {
    months += 12;
  }

  monthMarker.setMonth(anniversary.getMonth() + months);

  if (monthMarker > now) {
    months -= 1;
    monthMarker.setMonth(monthMarker.getMonth() - 1);
  }

  const elapsed = Math.max(0, now.getTime() - monthMarker.getTime());
  const days = Math.floor(elapsed / DAY_IN_MS);
  const hours = Math.floor((elapsed % DAY_IN_MS) / HOUR_IN_MS);
  const minutes = Math.floor((elapsed % HOUR_IN_MS) / MINUTE_IN_MS);
  const seconds = Math.floor((elapsed % MINUTE_IN_MS) / SECOND_IN_MS);

  storyYears.textContent = String(years);
  storyMonths.textContent = String(months);
  storyDays.textContent = String(days);
  storyHours.textContent = padTime(hours);
  storyMinutes.textContent = padTime(minutes);
  storySeconds.textContent = padTime(seconds);
};

const setMusicToggleState = () => {
  if (!musicToggle || !weddingSong) {
    return;
  }

  const isPlaying = !weddingSong.paused;
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-label", isPlaying ? "Tắt nhạc" : "Bật nhạc");
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
};

const playWeddingSong = async () => {
  if (!weddingSong || songWasPausedByUser) {
    return false;
  }

  try {
    await weddingSong.play();
    songWasStarted = true;
    setMusicToggleState();
    return true;
  } catch {
    setMusicToggleState();
    return false;
  }
};

const setupWeddingSong = () => {
  if (!weddingSong || !musicToggle) {
    return;
  }

  weddingSong.loop = true;
  weddingSong.muted = false;
  weddingSong.volume = 1;
  setMusicToggleState();

  const gestureEvents = [
    "pointerdown",
    "touchstart",
    "mousedown",
    "click",
    "keydown",
  ];
  const gestureListenerOptions = {
    capture: true,
    passive: true,
  };

  const stopGestureAutoplay = () => {
    gestureEvents.forEach((eventName) => {
      document.removeEventListener(eventName, startAfterGesture, true);
      window.removeEventListener(eventName, startAfterGesture, true);
    });
  };

  const retryAutoplay = () => {
    if (!songWasStarted && !songWasPausedByUser) {
      playWeddingSong().then((didStart) => {
        if (didStart) {
          stopGestureAutoplay();
        }
      });
    }
  };

  const startAfterGesture = () => {
    retryAutoplay();
  };

  weddingSong.addEventListener("loadeddata", retryAutoplay, { once: true });
  weddingSong.addEventListener("canplay", retryAutoplay, { once: true });
  window.addEventListener("pageshow", retryAutoplay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      retryAutoplay();
    }
  });
  gestureEvents.forEach((eventName) => {
    document.addEventListener(eventName, startAfterGesture, gestureListenerOptions);
    window.addEventListener(eventName, startAfterGesture, gestureListenerOptions);
  });

  musicToggle.addEventListener("click", async () => {
    if (weddingSong.paused) {
      songWasPausedByUser = false;
      await playWeddingSong();
      return;
    }

    songWasPausedByUser = true;
    weddingSong.pause();
    setMusicToggleState();
  });

  weddingSong.addEventListener("play", setMusicToggleState);
  weddingSong.addEventListener("pause", setMusicToggleState);
};

const stopWishRotation = () => {
  window.clearTimeout(wishRotationTimer);
  wishRotationTimer = undefined;
};

const getActiveWishRotationMs = () => {
  const activeWish = wishesList?.querySelector(".wish-card.is-active .wish-message");
  const messageLength = getCharacterCount(activeWish?.textContent ?? "");
  const duration = WISH_ROTATION_BASE_MS + (messageLength * WISH_ROTATION_MS_PER_CHARACTER);
  const clampedDuration = Math.min(
    Math.max(duration, WISH_ROTATION_MIN_MS),
    WISH_ROTATION_MAX_MS,
  );

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return clampedDuration * 1.5;
  }

  return clampedDuration;
};

const scheduleWishRotation = () => {
  stopWishRotation();

  const wishCount = wishesList?.querySelectorAll(".wish-card").length ?? 0;
  if (wishRotationIsPaused || wishCount <= 1) {
    return;
  }

  wishRotationTimer = window.setTimeout(() => {
    setActiveWish(currentWishIndex + 1);
    scheduleWishRotation();
  }, getActiveWishRotationMs());
};

const setActiveWish = (nextIndex) => {
  if (!wishesList) {
    return;
  }

  const wishCards = Array.from(wishesList.querySelectorAll(".wish-card"));
  if (!wishCards.length) {
    currentWishIndex = 0;
    return;
  }

  currentWishIndex = (nextIndex + wishCards.length) % wishCards.length;

  wishCards.forEach((card, index) => {
    const isActive = index === currentWishIndex;
    card.classList.toggle("is-active", isActive);
    card.hidden = !isActive;
  });
};

const startWishRotation = () => {
  wishRotationIsPaused = false;
  scheduleWishRotation();
};

const pauseWishRotation = () => {
  wishRotationIsPaused = true;
  stopWishRotation();
};

const resumeWishRotation = () => {
  if (!wishRotationIsPaused) {
    return;
  }

  wishRotationIsPaused = false;
  scheduleWishRotation();
};

const setupWishRotationControls = () => {
  if (!rsvpWishesPage) {
    return;
  }

  if ("PointerEvent" in window) {
    rsvpWishesPage.addEventListener("pointerdown", pauseWishRotation, { passive: true });
    rsvpWishesPage.addEventListener("pointerup", resumeWishRotation, { passive: true });
    rsvpWishesPage.addEventListener("pointercancel", resumeWishRotation, { passive: true });
    rsvpWishesPage.addEventListener("pointerleave", resumeWishRotation, { passive: true });
    return;
  }

  rsvpWishesPage.addEventListener("touchstart", pauseWishRotation, { passive: true });
  rsvpWishesPage.addEventListener("touchend", resumeWishRotation, { passive: true });
  rsvpWishesPage.addEventListener("touchcancel", resumeWishRotation, { passive: true });
  rsvpWishesPage.addEventListener("mousedown", pauseWishRotation);
  rsvpWishesPage.addEventListener("mouseup", resumeWishRotation);
  rsvpWishesPage.addEventListener("mouseleave", resumeWishRotation);
};

const renderWishes = (wishes) => {
  if (!wishesList) {
    return;
  }

  stopWishRotation();
  currentWishIndex = 0;
  wishesList.replaceChildren();

  if (!wishes.length) {
    return;
  }

  wishes.forEach((wish) => {
    const item = document.createElement("li");
    item.className = "wish-card";

    const message = document.createElement("p");
    message.className = "wish-message";
    message.textContent = `"${wish.wish_message}"`;

    const author = document.createElement("p");
    author.className = "wish-author";
    author.textContent = wish.name;

    item.append(message, author);
    wishesList.append(item);
  });

  setActiveWish(0);
  startWishRotation();
};

const loadWishes = async () => {
  let supabase;
  try {
    supabase = await getSupabaseClient();
  } catch (error) {
    console.error("Supabase client load failed", error);
    renderWishes([]);
    return;
  }

  if (!supabase) {
    renderWishes([]);
    return;
  }

  const { data, error } = await supabase.rpc("get_public_rsvp_wishes");

  if (error) {
    console.error("Wish load failed", error);
    renderWishes([]);
    return;
  }

  renderWishes(data ?? []);
};

setupHandwritingTitle();
setupScrollReveal();
setupWeddingSong();
setupWishRotationControls();
updateStoryTimer();
window.setInterval(updateStoryTimer, SECOND_IN_MS);
scheduleNonCriticalWork(loadWishes);
