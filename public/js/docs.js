function setTheme(mode) {
  if (mode === "light") {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    document.getElementById("theme-icon").textContent = "☀️";
    // Check if mobile theme icon exists before setting
    const themeIconMobile = document.getElementById("theme-icon-mobile");
    if (themeIconMobile) {
      themeIconMobile.textContent = "☀️";
    }
  } else {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    document.getElementById("theme-icon").textContent = "🌙";
    // Check if mobile theme icon exists before setting
    const themeIconMobile = document.getElementById("theme-icon-mobile");
    if (themeIconMobile) {
      themeIconMobile.textContent = "🌙";
    }
  }
  localStorage.setItem("theme", mode);
}

// DOM refs
const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const sidebarToggle = document.getElementById("sidebar-toggle");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleMobile = document.getElementById("theme-toggle-mobile"); // Can be null if not on mobile view

// Theme toggle
if (themeToggle) {
  themeToggle.onclick = () => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "light" : "dark"
    );
  };
}

if (themeToggleMobile) {
  themeToggleMobile.onclick = () => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "light" : "dark"
    );
    closeSidebar();
  };
}

// Set theme on load
(() => {
  const saved = localStorage.getItem("theme");
  if (saved === "light") setTheme("light");
  else setTheme("dark");
})();

// Sidebar logic
window.closeSidebar = function () {
  if (sidebar) {
    sidebar.classList.remove("sidebar-open");
    sidebar.classList.add("sidebar-closed"); // Add this class for initial state
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.classList.remove("active");
  }
  if (sidebarToggle) {
    sidebarToggle.classList.remove("open");
    sidebarToggle.setAttribute("aria-expanded", "false");
  }
};

if (sidebarToggle) {
  sidebarToggle.onclick = function () {
    if (sidebar && sidebar.classList.contains("sidebar-open")) {
      window.closeSidebar();
    } else {
      if (sidebar) {
        sidebar.classList.remove("sidebar-closed");
        sidebar.classList.add("sidebar-open");
      }
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.add("active");
      }
      if (sidebarToggle) {
        sidebarToggle.classList.add("open");
        sidebarToggle.setAttribute("aria-expanded", "true");
      }
    }
  };
}

// Sidebar link close logic
document.querySelectorAll("#sidebar .sidebar-link").forEach((link) => {
  link.addEventListener("click", function () {
    if (window.innerWidth < 769) {
      // Only close sidebar on mobile after clicking link
      window.closeSidebar();
    }
  });
});

// Sidebar backdrop click
if (sidebarBackdrop) {
  sidebarBackdrop.onclick = function () {
    window.closeSidebar();
  };
}

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
      const yOffset = window.innerWidth < 769 ? 0 : 64; // offset navbar (4rem = 64px)
      const y =
        target.getBoundingClientRect().top + window.pageYOffset - yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      history.replaceState(null, "", "#" + targetId);
      // Tutup sidebar jika mobile
      if (window.innerWidth < 769 && typeof window.closeSidebar === "function")
        window.closeSidebar();
    }
  });
});

// Copy to clipboard functionality
document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", function () {
    const codeBlock = this.previousElementSibling; // Get the <pre> element
    if (codeBlock && codeBlock.tagName === "PRE") {
      const textToCopy = codeBlock.textContent;

      // Use Clipboard API for modern browsers
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            this.textContent = "Copied!";
            this.classList.add("copied");
            setTimeout(() => {
              this.textContent = "Copy Example";
              this.classList.remove("copied");
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
            // Fallback for older browsers or if Clipboard API fails
            fallbackCopyTextToClipboard(textToCopy, this);
          });
      } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(textToCopy, this);
      }
    }
  });
});

function fallbackCopyTextToClipboard(text, buttonElement) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "Copied!" : "Failed to copy!";
    buttonElement.textContent = msg;
    buttonElement.classList.add("copied"); // Still add copied class for visual feedback
    setTimeout(() => {
      buttonElement.textContent = "Copy Example";
      buttonElement.classList.remove("copied");
    }, 2000);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    buttonElement.textContent = "Error!";
    setTimeout(() => {
      buttonElement.textContent = "Copy Example";
    }, 2000);
  }

  document.body.removeChild(textArea);
}

// Initial sidebar state for desktop (hidden)
// This ensures sidebar is hidden on larger screens even if JS loads late
function setInitialSidebarState() {
  if (window.innerWidth >= 769) {
    if (sidebar) {
      sidebar.classList.remove("sidebar-open");
      sidebar.classList.add("sidebar-closed");
    }
    if (sidebarBackdrop) {
      sidebarBackdrop.classList.remove("active");
    }
    if (sidebarToggle) {
      sidebarToggle.classList.remove("open");
      sidebarToggle.setAttribute("aria-expanded", "false");
    }
  }
}

window.addEventListener("resize", setInitialSidebarState);
window.addEventListener("DOMContentLoaded", setInitialSidebarState);
