const THEME_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemTheme() {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function updateToggle(theme) {
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  const dark = theme === "dark";
  button.querySelector(".material-icons-round").textContent = dark ? "light_mode" : "dark_mode";
  button.setAttribute("aria-label", dark ? "Gunakan mode terang" : "Gunakan mode gelap");
  button.setAttribute("title", dark ? "Gunakan mode terang" : "Gunakan mode gelap");
}

export function getTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme, persist = true) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", next === "dark");
  if (persist) localStorage.setItem(THEME_KEY, next);
  updateToggle(next);
  return next;
}

export function toggleTheme() {
  return setTheme(getTheme() === "dark" ? "light" : "dark");
}

export async function withLightTheme(task) {
  const previous = getTheme();
  setTheme("light", false);
  try {
    return await task();
  } finally {
    setTheme(previous, false);
  }
}

function initializeTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  setTheme(stored === "dark" || stored === "light" ? stored : systemTheme());
  window.matchMedia(DARK_QUERY).addEventListener("change", event => {
    if (!localStorage.getItem(THEME_KEY)) setTheme(event.matches ? "dark" : "light", false);
  });
  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
}

initializeTheme();
