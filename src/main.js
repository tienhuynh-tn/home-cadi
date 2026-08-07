import "./styles.css";
import { createClient } from "@supabase/supabase-js";

const WISH_LIMIT = 30;
const NAME_LIMIT = 60;
const MESSAGE_LIMIT = 500;
const STORY_START_TIME = new Date("2006-09-05T00:00:00+07:00").getTime();
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
const storyDays = document.querySelector("#story-days");
const storyHours = document.querySelector("#story-hours");
const storyMinutes = document.querySelector("#story-minutes");
const storySeconds = document.querySelector("#story-seconds");

const padTime = (value) => String(value).padStart(2, "0");

const updateStoryTimer = () => {
  if (!storyDays || !storyHours || !storyMinutes || !storySeconds) {
    return;
  }

  const elapsed = Math.max(0, Date.now() - STORY_START_TIME);
  const days = Math.floor(elapsed / DAY_IN_MS);
  const hours = Math.floor((elapsed % DAY_IN_MS) / HOUR_IN_MS);
  const minutes = Math.floor((elapsed % HOUR_IN_MS) / MINUTE_IN_MS);
  const seconds = Math.floor((elapsed % MINUTE_IN_MS) / SECOND_IN_MS);

  storyDays.textContent = String(days);
  storyHours.textContent = padTime(hours);
  storyMinutes.textContent = padTime(minutes);
  storySeconds.textContent = padTime(seconds);
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

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
};

const renderWishes = (wishes) => {
  if (!wishesList) {
    return;
  }

  wishesList.replaceChildren();

  if (!wishes.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "wish-card";

    const message = document.createElement("p");
    message.className = "wish-message";
    message.textContent = "Hãy là người đầu tiên gửi lời chúc đến cô dâu chú rể.";

    emptyItem.append(message);
    wishesList.append(emptyItem);
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
    throw new Error("Vui lòng nhập tên và lời chúc.");
  }

  if (name.length > NAME_LIMIT) {
    throw new Error(`Tên không vượt quá ${NAME_LIMIT} ký tự.`);
  }

  if (message.length > MESSAGE_LIMIT) {
    throw new Error(`Lời chúc không vượt quá ${MESSAGE_LIMIT} ký tự.`);
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

updateStoryTimer();
window.setInterval(updateStoryTimer, SECOND_IN_MS);
loadWishes();
