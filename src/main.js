import "./styles.css";
import { createClient } from "@supabase/supabase-js";

const WISH_LIMIT = 30;
const NAME_LIMIT = 60;
const MESSAGE_LIMIT = 500;

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

loadWishes();
