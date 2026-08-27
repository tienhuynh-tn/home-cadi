import "./styles.css";
import { createClient } from "@supabase/supabase-js";

const WISH_LIMIT = 30;
const NAME_LIMIT = 24;
const MESSAGE_LIMIT = 240;
const WISH_ROTATION_MS = 5000;
const TITLE_CHARACTER_DELAY_MS = 145;
const TITLE_LINE_DELAY_MS = 650;
const SENSITIVE_WORDS = new Set([
  "asshole",
  "bastard",
  "bitch",
  "buoi",
  "cunt",
  "dick",
  "dit",
  "fuck",
  "fucker",
  "fucking",
  "lon",
  "nude",
  "porn",
  "pussy",
  "sex",
  "shit",
  "slut",
  "whore",
  "xxx",
]);
const SENSITIVE_PHRASES = [
  "cho chet",
  "con me may",
  "dcm",
  "dit me",
  "dm",
  "dmm",
  "do khon",
  "du ma",
  "mat day",
  "oc cho",
];
const STORY_START_DATE = new Date("2006-09-05T00:00:00+07:00");
const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const wishForm = document.querySelector("#wish-form");
const wishesList = document.querySelector("#wishes-list");
const wishStatus = document.querySelector("#wish-status");
const wishSubmit = document.querySelector(".wish-submit");
const storyYears = document.querySelector("#story-years");
const storyMonths = document.querySelector("#story-months");
const storyDays = document.querySelector("#story-days");
const storyHours = document.querySelector("#story-hours");
const storyMinutes = document.querySelector("#story-minutes");
const storySeconds = document.querySelector("#story-seconds");
const weddingSong = document.querySelector("#wedding-song");
const musicToggle = document.querySelector("#music-toggle");
const heroTitle = document.querySelector(".hero-title");
const letterEnvelope = document.querySelector("[data-letter-envelope]");
let revealObserver;
let songWasStarted = false;
let songWasPausedByUser = false;
let currentWishIndex = 0;
let wishRotationTimer;

const padTime = (value) => String(value).padStart(2, "0");

const splitGraphemes = (text) => {
  if ("Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter("vi", { granularity: "grapheme" }).segment(text), ({ segment }) => segment);
  }

  return Array.from(text);
};

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
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12,
    },
  );

  revealElements.forEach(observeRevealElement);
};

const setupLetterEnvelope = () => {
  if (!letterEnvelope) {
    return;
  }

  const envelopeButton = letterEnvelope.querySelector(".appreciation-envelope-button");
  if (!envelopeButton) {
    return;
  }

  letterEnvelope.classList.add("is-ready");

  envelopeButton.addEventListener("click", () => {
    letterEnvelope.classList.add("is-open");
    letterEnvelope.closest(".appreciation-section")?.classList.add("is-letter-open");
    envelopeButton.setAttribute("aria-expanded", "true");
  });
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
  weddingSong.load();
  setMusicToggleState();
  playWeddingSong();

  const gestureEvents = [
    "pointerdown",
    "pointermove",
    "pointerup",
    "touchstart",
    "touchmove",
    "touchend",
    "mousedown",
    "wheel",
    "scroll",
    "click",
    "keydown",
  ];

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
    document.addEventListener(eventName, startAfterGesture, true);
    window.addEventListener(eventName, startAfterGesture, true);
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

const setStatus = (message, tone = "") => {
  if (!wishStatus) {
    return;
  }

  wishStatus.textContent = message;
  if (tone) {
    wishStatus.dataset.tone = tone;
  } else {
    delete wishStatus.dataset.tone;
  }
};

const setSubmitting = (isSubmitting) => {
  if (!wishSubmit) {
    return;
  }

  wishSubmit.disabled = isSubmitting;
  wishSubmit.textContent = isSubmitting ? "Đang gửi..." : "Gửi lời chúc";
};

const formatWishDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  const day = padTime(date.getDate());
  const month = padTime(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const normalizeWishText = (value) =>
  value
    .toLowerCase()
    .replaceAll("đ", "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const hasSensitiveContent = (...values) => {
  const normalizedText = normalizeWishText(values.join(" "));
  if (!normalizedText) {
    return false;
  }

  const paddedText = ` ${normalizedText} `;
  const hasSensitivePhrase = SENSITIVE_PHRASES.some((phrase) =>
    paddedText.includes(` ${phrase} `),
  );

  if (hasSensitivePhrase) {
    return true;
  }

  return normalizedText
    .split(" ")
    .some((word) => SENSITIVE_WORDS.has(word));
};

const stopWishRotation = () => {
  window.clearInterval(wishRotationTimer);
  wishRotationTimer = undefined;
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
  stopWishRotation();

  const wishCount = wishesList?.querySelectorAll(".wish-card").length ?? 0;
  if (wishCount <= 1) {
    return;
  }

  wishRotationTimer = window.setInterval(() => {
    setActiveWish(currentWishIndex + 1);
  }, WISH_ROTATION_MS);
};

const renderWishes = (wishes) => {
  if (!wishesList) {
    return;
  }

  stopWishRotation();
  currentWishIndex = 0;
  wishesList.replaceChildren();

  if (!wishes.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "wish-card wish-card-empty";

    const message = document.createElement("p");
    message.className = "wish-message";
    message.textContent = "Hãy là người đầu tiên gửi lời chúc đến cô dâu chú rể.";

    emptyItem.append(message);
    wishesList.append(emptyItem);
    setActiveWish(0);
    return;
  }

  wishes.forEach((wish) => {
    const item = document.createElement("li");
    item.className = "wish-card";

    const message = document.createElement("p");
    message.className = "wish-message";
    message.textContent = wish.message;

    const meta = document.createElement("p");
    meta.className = "wish-meta";

    const name = document.createElement("span");
    name.textContent = wish.name;

    const date = document.createElement("span");
    date.textContent = formatWishDate(wish.created_at);

    meta.append(name);
    if (date.textContent) {
      meta.append("•", date);
    }

    item.append(message, meta);
    wishesList.append(item);
  });

  setActiveWish(0);
  startWishRotation();
};

const loadWishes = async ({ announce = true } = {}) => {
  if (!supabase) {
    setStatus(
      "Chưa cấu hình Supabase. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.",
      "error",
    );
    renderWishes([]);
    return;
  }

  if (announce) {
    setStatus("Đang tải lời chúc...");
  }

  const { data, error } = await supabase
    .from("wishes")
    .select("name,message,created_at")
    .order("created_at", { ascending: false })
    .limit(WISH_LIMIT);

  if (error) {
    setStatus("Chưa thể tải lời chúc. Vui lòng thử lại sau.", "error");
    renderWishes([]);
    return;
  }

  if (announce) {
    setStatus("");
  }
  renderWishes(data ?? []);
};

const getValidatedWish = (formData) => {
  const name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (website) {
    return null;
  }

  if (!name || !message) {
    throw new Error("Bạn nhập tên và lời chúc giúp tụi mình nha.");
  }

  if (name.length > NAME_LIMIT) {
    throw new Error(`Tên không vượt quá ${NAME_LIMIT} ký tự.`);
  }

  if (message.length > MESSAGE_LIMIT) {
    throw new Error(`Lời chúc không vượt quá ${MESSAGE_LIMIT} ký tự.`);
  }

  if (hasSensitiveContent(name, message)) {
    throw new Error("Nội dung có từ chưa phù hợp, bạn chỉnh lại giúp tụi mình nha.");
  }

  return { name, message };
};

wishForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!supabase) {
    setStatus(
      "Chưa cấu hình Supabase nên chưa thể gửi lời chúc.",
      "error",
    );
    return;
  }

  let wish;
  try {
    wish = getValidatedWish(new FormData(wishForm));
  } catch (error) {
    setStatus(error.message, "error");
    return;
  }

  if (!wish) {
    return;
  }

  setSubmitting(true);
  setStatus("Đang gửi lời chúc...");

  const { error } = await supabase.from("wishes").insert(wish);

  if (error) {
    setStatus("Chưa thể gửi lời chúc. Vui lòng thử lại sau.", "error");
    setSubmitting(false);
    return;
  }

  wishForm.reset();
  setSubmitting(false);
  await loadWishes({ announce: false });
  setStatus("Cảm ơn bạn đã gửi lời chúc!", "success");
});

setupHandwritingTitle();
setupScrollReveal();
setupLetterEnvelope();
setupWeddingSong();
updateStoryTimer();
window.setInterval(updateStoryTimer, SECOND_IN_MS);
loadWishes({ announce: false });
