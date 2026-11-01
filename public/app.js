
const searchInput = document.getElementById("searchInput");
const toolCards = [...document.querySelectorAll(".tool-card")];
const categories = document.querySelectorAll(".category");
const toolCount = document.getElementById("toolCount");
const noResults = document.getElementById("noResults");
const toast = document.getElementById("toast");

let selectedCategory = "All";

function filterTools() {
  const query = searchInput.value.toLowerCase().trim();
  let visible = 0;

  toolCards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const category = card.dataset.category;

    const matchesSearch = name.includes(query);
    const matchesCategory =
      selectedCategory === "All" ||
      category === selectedCategory;

    const show = matchesSearch && matchesCategory;

    card.hidden = !show;

    if (show) visible++;
  });

  toolCount.textContent = visible + " TOOLS";
  noResults.hidden = visible !== 0;
}

// Search functionality
searchInput.addEventListener("input", filterTools);

// Category filtering
categories.forEach(button => {
  button.addEventListener("click", () => {
    categories.forEach(item => item.classList.remove("active"));

    button.classList.add("active");
    selectedCategory = button.dataset.category;

    filterTools();
  });
});

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// Close mobile menu
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

// Notifications
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Tool buttons
document.querySelectorAll(".tool-link").forEach(button => {
    button.addEventListener("click", () => {
        const tool = button.dataset.tool;
        if (tool) {
            window.location.href = "/tools.html?tool=" + encodeURIComponent(tool);
        }
    });
});

// // Login button
document.getElementById("loginBtn").addEventListener("click", () => {
  showToast("Login system coming soon!");
});

// Keyboard shortcut
document.addEventListener("keydown", event => {
  if (
    event.key === "/" &&
    document.activeElement !== searchInput &&
    !["INPUT", "TEXTAREA"].includes(
      document.activeElement.tagName
    )
  ) {
    event.preventDefault();
    searchInput.focus();
  }

  if (event.key === "Escape") {
    searchInput.blur();
    navLinks.classList.remove("open");
  }
});

// Initialize
filterTools();

console.log("TOOLVERSE loaded successfully!");

