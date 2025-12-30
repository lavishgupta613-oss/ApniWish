document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("wishlist-container");

/* --------- Floating Royal Filter Button --------- */
const filterBtn = document.createElement("button");
filterBtn.id = "filterBtn";
filterBtn.innerHTML = "☰";

Object.assign(filterBtn.style, {
  position: "fixed",
  top: "20px",
  left: "20px",
  zIndex: 99,

  padding: "12px 16px",
  fontSize: "18px",
  fontWeight: "600",

  background: "linear-gradient(135deg, #1e3c72, #2a5298)", // royal blue
  color: "#ffffff",

  border: "none",
  borderRadius: "14px",

  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(30, 60, 114, 0.35)",

  transition: "all 0.3s ease",
  backdropFilter: "blur(4px)"
});

/* Hover effect */
filterBtn.addEventListener("mouseenter", () => {
  filterBtn.style.transform = "translateY(-2px) scale(1.05)";
  filterBtn.style.boxShadow = "0 15px 30px rgba(30, 60, 114, 0.5)";
});

/* Mouse leave */
filterBtn.addEventListener("mouseleave", () => {
  filterBtn.style.transform = "scale(1)";
  filterBtn.style.boxShadow = "0 10px 25px rgba(30, 60, 114, 0.35)";
});

/* Click feedback */
filterBtn.addEventListener("mousedown", () => {
  filterBtn.style.transform = "scale(0.95)";
});
filterBtn.addEventListener("mouseup", () => {
  filterBtn.style.transform = "scale(1.05)";
});

document.body.appendChild(filterBtn);


  const filterPanel = document.createElement("div");
  filterPanel.id = "filterPanel";
// Object.assign(filterPanel.style, {
//   position: "fixed",
//   top: "0",
//   left: "-320px",
//   width: "300px",
//   height: "100%",
//   background: "linear-gradient(180deg, #0f172a, #020617)", // 🔥 dark theme
//   color: "#e5e7eb",
//   zIndex: 9998,
//   padding: "20px",
//   boxShadow: "8px 0 30px rgba(0,0,0,0.6)", // premium depth
//   transition: "left 0.3s ease",
//   overflowY: "auto"
// });

  document.body.appendChild(filterPanel);

  const filterOverlay = document.createElement("div");
  filterOverlay.id = "filterOverlay";
// Object.assign(filterOverlay.style, {
//   position: "fixed",
//   top: "0",
//   left: "0",
//   width: "100%",
//   height: "100%",
//   background: "rgba(0,0,0,0.3)",
//   opacity: "0",
//   visibility: "hidden",
//   pointerEvents: "none",   // ⭐ ADD THIS
//   transition: "opacity 0.3s ease",
//   zIndex: 9997
// });

  document.body.appendChild(filterOverlay);

  // Close panel
  filterOverlay.addEventListener("click", closeFilter);
  
let filterOpen = false;

function openFilter() {
  filterPanel.style.left = "0";
  filterOverlay.style.opacity = "1";
  filterOverlay.style.visibility = "visible";
  filterOverlay.style.pointerEvents = "auto";
  filterOpen = true;
}

function closeFilter() {
  filterPanel.style.left = "-320px";
  filterOverlay.style.opacity = "0";
  filterOverlay.style.visibility = "hidden";
  filterOverlay.style.pointerEvents = "none";
  filterOpen = false;
}



  filterBtn.addEventListener("click", openFilter);

  // Filter title
const title = document.createElement("h2");
title.innerText = "Filter by Platform";
title.className = "filter-title";
filterPanel.appendChild(title);

// Platforms
const platforms = ["Flipkart", "Amazon", "Myntra", "Meesho", "AJIO"];

platforms.forEach(p => {
  const label = document.createElement("label");
  label.className = "platform-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.dataset.platform = p;

  const customBox = document.createElement("span");
  customBox.className = "custom-checkbox";

  const text = document.createElement("span");
  text.innerText = p;

  label.appendChild(checkbox);
  label.appendChild(customBox);
  label.appendChild(text);
  filterPanel.appendChild(label);
});
const closeBtn = document.createElement("button");
closeBtn.innerHTML = "✕";
closeBtn.className = "close-filter-btn";

// closeBtn.onclick = () => {
//   filterPanel.classList.add("hide");
//   setTimeout(() => {
//     filterPanel.style.display = "none";
//   }, 300);
// };

filterPanel.appendChild(closeBtn);
  /* -------- Platform color helper -------- */
  function getPlatformColor(platform) {
    switch (platform) {
      case "Flipkart": return "#0074E4";
      case "Amazon": return "#FF9900";
      case "Myntra": return "#FF3F6C";
      case "Meesho": return "#6B1FA1";
      case "AJIO": return "#2A2A2A";
      default: return "#555";
    }
  }

  document.getElementById("filterBtn").onclick = () => {
  filterOpen ? closeFilter() : openFilter();
};

closeBtn.onclick = closeFilter;
filterOverlay.onclick = closeFilter;
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && filterOpen) closeFilter();
});

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}




  /* -------- Render Wishlist -------- */
  function renderWishlist() {
    chrome.storage.local.get(["apniwish"], (res) => {
      const wishlist = res.apniwish || [];
      container.innerHTML = "";

      // Get checked platforms
      const checkedPlatforms = Array.from(filterPanel.querySelectorAll("input[type=checkbox]:checked"))
                                    .map(cb => cb.dataset.platform);

      const filteredList = checkedPlatforms.length
                            ? wishlist.filter(item => checkedPlatforms.includes(item.platform))
                            : wishlist;

      if (filteredList.length === 0) {
        container.innerHTML = "<p style='padding:20px;text-align:center'>No products found ✨</p>";
        return;
      }wishlist.forEach(item => {
  if (!item.addedAt) item.addedAt = Date.now();
  if (item.starred === undefined) item.starred = false;
});


      filteredList.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "product-item";
        div.style.cursor = "pointer";

        div.innerHTML = `
  <img src="${item.image || ''}" alt="${item.title || 'Product'}" />
  
  <div class="info">
    <h3 title="${item.title}">${item.title || "No title"}</h3>

    <div class="bottom-row">
      <div class="bottom-left">
        <p class="price">${item.price || "Price unavailable"}</p>
        <button class="remove-btn">Remove</button>
      </div>

      <div class="bottom-right">
        <button class="star-btn ${item.starred ? "active" : ""}">
          ${item.starred ? "★" : "☆"}
        </button>
        
      </div>
    </div>
  </div>
`;
div.querySelector(".star-btn").onclick = (e) => {
  e.stopPropagation();
  item.starred = !item.starred;
  chrome.storage.local.set({ apniwish: wishlist }, renderWishlist);
};

const timeMeta = document.createElement("div");
timeMeta.className = "time-meta";
timeMeta.innerText = `Added · ${timeAgo(item.addedAt)}`;
div.appendChild(timeMeta);

div.querySelector(".remove-btn").onclick = (e) => {
  e.stopPropagation();
  wishlist.splice(index, 1);
  chrome.storage.local.set({ apniwish: wishlist }, renderWishlist);
};


        // Platform badge
const platformLabel = document.createElement("span");
platformLabel.className = `platform-label ${item.platform?.toLowerCase() || ""}`;
platformLabel.innerText = item.platform || "Unknown";
div.appendChild(platformLabel);

        // Remove button
        div.querySelector(".remove-btn").onclick = (e) => {
          e.stopPropagation();
          wishlist.splice(index, 1);
          chrome.storage.local.set({ apniwish: wishlist }, renderWishlist);
        };

        // Image fallback
        const img = div.querySelector("img");
        img.onerror = () => img.src = "https://via.placeholder.com/150?text=No+Image";

        // Open product on click
        div.addEventListener("click", (e) => {
          if (e.target.closest(".remove-btn")) return;
          if (item.url) window.open(item.url, "_blank");
        });

        container.appendChild(div);
      });
    });
  }

  // Update on checkbox change
  const checkboxes = Array.from(filterPanel.querySelectorAll("input[type=checkbox]"));
  checkboxes.forEach(cb => cb.addEventListener("change", renderWishlist));

  renderWishlist();
});
