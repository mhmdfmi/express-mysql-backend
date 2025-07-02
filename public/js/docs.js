function setTheme(mode) {
  if (mode === "light") {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    document.getElementById("theme-icon").textContent = "☀️";
    document.getElementById("theme-icon-mobile").textContent = "☀️";
  } else {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    document.getElementById("theme-icon").textContent = "🌙";
    document.getElementById("theme-icon-mobile").textContent = "🌙";
  }
  localStorage.setItem("theme", mode);
}

// DOM refs
const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const sidebarToggle = document.getElementById("sidebar-toggle");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleMobile = document.getElementById("theme-toggle-mobile");

// Theme toggle
themeToggle.onclick = () => {
  setTheme(
    document.documentElement.classList.contains("dark") ? "light" : "dark"
  );
};
themeToggleMobile.onclick = () => {
  setTheme(
    document.documentElement.classList.contains("dark") ? "light" : "dark"
  );
  closeSidebar();
};
// Set theme on load
(() => {
  const saved = localStorage.getItem("theme");
  if (saved === "light") setTheme("light");
  else setTheme("dark");
})();

// Sidebar logic
window.closeSidebar = function () {
  sidebar.classList.remove("sidebar-open");
  sidebar.classList.add("sidebar-closed");
  sidebarBackdrop.classList.remove("active");
  sidebarToggle.classList.remove("open");
  sidebarToggle.setAttribute("aria-expanded", "false");
};
sidebarToggle.onclick = function () {
  // Jika sidebar sedang terbuka, tutup
  if (sidebar.classList.contains("sidebar-open")) {
    window.closeSidebar();
  } else {
    // Jika sidebar tertutup, buka
    sidebar.classList.remove("sidebar-closed");
    sidebar.classList.add("sidebar-open");
    sidebarBackdrop.classList.add("active");
    sidebarToggle.classList.add("open");
    sidebarToggle.setAttribute("aria-expanded", "true");
  }
};
// Sidebar link close logic
document.querySelectorAll("#sidebar .sidebar-link").forEach((link) => {
  link.addEventListener("click", function () {
    window.closeSidebar();
  });
});
// Sidebar backdrop click
sidebarBackdrop.onclick = function () {
  window.closeSidebar();
};

// Navbar active link animation (desktop)
function setActiveNav() {
  const hash = window.location.hash;
  document.querySelectorAll("#navbar li a").forEach((a) => {
    if (hash && a.getAttribute("href") === hash) a.classList.add("active");
    else a.classList.remove("active");
  });
}
window.addEventListener("hashchange", setActiveNav);
window.addEventListener("DOMContentLoaded", setActiveNav);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      const yOffset = window.innerWidth < 768 ? 0 : 64; // offset navbar
      const y =
        target.getBoundingClientRect().top + window.pageYOffset - yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      history.replaceState(null, "", "#" + targetId);
      // Tutup sidebar jika mobile
      if (window.innerWidth < 768 && typeof window.closeSidebar === "function")
        window.closeSidebar();
    }
  });
});
