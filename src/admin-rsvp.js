import "./styles.css";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const loginForm = document.querySelector("#admin-login-form");
const loginStatus = document.querySelector("#admin-login-status");
const content = document.querySelector("#admin-rsvp-content");
const rsvpStatus = document.querySelector("#admin-rsvp-status");
const rsvpCount = document.querySelector("#admin-rsvp-count");
const tableBody = document.querySelector("#admin-rsvp-table-body");
const exportButton = document.querySelector("#admin-export");
const refreshButton = document.querySelector("#admin-refresh");
const logoutButton = document.querySelector("#admin-logout");

const ATTENDANCE_LABELS = {
  tham_du: "Có, sẽ tham dự",
  chua_chac: "Sẽ báo lại sau",
  khong_tham_du: "Không tham dự",
};

const EVENT_LABELS = {
  ca_hai: "Cả hai buổi tiệc",
  nha_gai: "Tiệc Nhà Gái - 14.10.2026",
  nha_trai: "Tiệc Nhà Trai - 15.10.2026",
  chua_chac: "Chưa chọn buổi tiệc",
  khong_tham_du: "Không tham dự",
};

let rsvps = [];

const setLoginStatus = (message, tone = "") => {
  if (!loginStatus) {
    return;
  }

  loginStatus.textContent = message;
  if (tone) {
    loginStatus.dataset.tone = tone;
  } else {
    delete loginStatus.dataset.tone;
  }
};

const setRsvpStatus = (message, tone = "") => {
  if (!rsvpStatus) {
    return;
  }

  rsvpStatus.textContent = message;
  if (tone) {
    rsvpStatus.dataset.tone = tone;
  } else {
    delete rsvpStatus.dataset.tone;
  }
};

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateValue));
};

const showAdminContent = (isVisible) => {
  loginForm.hidden = isVisible;
  content.hidden = !isVisible;
};

const renderRsvps = () => {
  tableBody.replaceChildren();

  if (!rsvps.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.textContent = "Chưa có xác nhận nào.";
    row.append(cell);
    tableBody.append(row);
  }

  rsvps.forEach((rsvp) => {
    const row = document.createElement("tr");
    const cells = [
      formatDateTime(rsvp.created_at),
      rsvp.name,
      ATTENDANCE_LABELS[rsvp.attendance] ?? rsvp.attendance,
      EVENT_LABELS[rsvp.events] ?? rsvp.events,
      rsvp.guest_count ?? "",
      rsvp.note ?? "",
    ];

    cells.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = String(value ?? "");
      row.append(cell);
    });

    tableBody.append(row);
  });

  rsvpCount.textContent = `${rsvps.length} xác nhận`;
};

const loadRsvps = async () => {
  if (!supabase) {
    setRsvpStatus("Chưa cấu hình Supabase.", "error");
    return;
  }

  refreshButton.disabled = true;
  exportButton.disabled = true;
  setRsvpStatus("Đang tải dữ liệu...");

  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    rsvps = [];
    renderRsvps();
    showAdminContent(false);
    setLoginStatus("Phiên đăng nhập đã hết hạn, bạn đăng nhập lại giúp mình nha.", "error");
    refreshButton.disabled = false;
    exportButton.disabled = false;
    return;
  }

  const { data, error } = await supabase
    .from("rsvps")
    .select("created_at,name,attendance,events,guest_count,note")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("RSVP load failed", error);
    const message =
      error.code === "42501"
        ? "Tài khoản này chưa được cấp quyền admin RSVP."
        : `Chưa thể tải dữ liệu RSVP. ${error.message}`;
    setRsvpStatus(message, "error");
    refreshButton.disabled = false;
    exportButton.disabled = false;
    return;
  }

  rsvps = data ?? [];
  renderRsvps();
  setRsvpStatus("");
  refreshButton.disabled = false;
  exportButton.disabled = !rsvps.length;
};

const csvEscape = (value) => {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
};

const downloadCsv = () => {
  const headers = ["Thời gian", "Tên", "Trả lời", "Buổi tiệc", "Số người", "Lời nhắn"];
  const rows = rsvps.map((rsvp) => [
    formatDateTime(rsvp.created_at),
    rsvp.name,
    ATTENDANCE_LABELS[rsvp.attendance] ?? rsvp.attendance,
    EVENT_LABELS[rsvp.events] ?? rsvp.events,
    rsvp.guest_count ?? "",
    rsvp.note ?? "",
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "cadi-rsvp.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const checkSession = async () => {
  if (!supabase) {
    setLoginStatus("Chưa cấu hình Supabase.", "error");
    return;
  }

  const { data } = await supabase.auth.getSession();
  const isLoggedIn = Boolean(data.session);
  showAdminContent(isLoggedIn);

  if (isLoggedIn) {
    await loadRsvps();
  } else {
    rsvps = [];
    renderRsvps();
  }
};

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!supabase) {
    setLoginStatus("Chưa cấu hình Supabase.", "error");
    return;
  }

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    setLoginStatus("Bạn nhập email và mật khẩu giúp mình nha.", "error");
    return;
  }

  setLoginStatus("Đang đăng nhập...");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setLoginStatus("Đăng nhập chưa thành công.", "error");
    return;
  }

  setLoginStatus("");
  showAdminContent(true);
  await loadRsvps();
});

exportButton?.addEventListener("click", downloadCsv);
refreshButton?.addEventListener("click", loadRsvps);
logoutButton?.addEventListener("click", async () => {
  await supabase?.auth.signOut();
  rsvps = [];
  renderRsvps();
  showAdminContent(false);
  setLoginStatus("");
});

checkSession();
