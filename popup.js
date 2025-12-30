document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("wishlist");

  chrome.storage.local.get(["apniwish"], (result) => {
    const wishlist = result.apniwish || [];

    if (wishlist.length === 0) {
      container.innerHTML = `
        <p style="text-align:center;padding:20px">
          🛒 No wishes yet<br>
          <small>Save products to see them here</small>
        </p>`;
      return;
    }

    wishlist.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "item";

      const colorMap = {
        Flipkart: "#0074E4",
        Amazon: "#FF9900",
        Myntra: "#FF3F6C",
        Meesho: "#6B1FA1",
        AJIO: "#2A2A2A"
      };

      div.innerHTML = `
        <img src="${item.image}">
        <div class="info">
          <span class="platform" style="background:${colorMap[item.platform] || "#555"}">
            ${item.platform}
          </span>
          <p class="title" title="${item.title}">${item.title}</p>
          <p class="price">${item.price}</p>
          <button class="remove-btn">Remove</button>
        </div>
      `;

      // Open product when clicking card
      div.addEventListener("click", () => {
        chrome.tabs.create({ url: item.url });
      });

      // Remove
      div.querySelector(".remove-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        removeItem(index);
      });

      container.appendChild(div);
    });
  });

  document.getElementById("viewAllBtn").onclick = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("apniwish.html")
    });
  };
});

function removeItem(index) {
  chrome.storage.local.get(["apniwish"], (result) => {
    const wishlist = result.apniwish || [];
    wishlist.splice(index, 1);
    chrome.storage.local.set({ apniwish: wishlist }, () => location.reload());
  });
}
