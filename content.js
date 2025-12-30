console.log("✅ ApniWish Extension Loaded");

/* ---------------- PLATFORM DETECTION ---------------- */
const host = location.hostname;

const isFlipkart = host.includes("flipkart");
const isAmazon = host.includes("amazon");
const isMyntra = host.includes("myntra");
const isMeesho = host.includes("meesho");
const isAjio = host.includes("ajio");

/* ---------------- OBSERVER ---------------- */
const observer = new MutationObserver(() => {
  const titleWrapper = getTitleWrapper();
  if (!titleWrapper) return;

  if (document.getElementById("apniwish-btn")) return;

const btn = document.createElement("button");
btn.id = "apniwish-btn";
btn.innerHTML = `
  <span class="icon">🔖</span>
  <span class="text">Save</span>
`;
btn.title = "Save to ApniWish";
btn.dataset.saved = "false";

document.body.appendChild(btn);

  Object.assign(btn.style, {
    marginLeft: "12px",
    padding: "6px 8px",
    borderRadius: "50%",
    border: "1px solid #e0e0e0",
    background: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    verticalAlign: "middle",
    zIndex: 9999
  });

  btn.onclick = () => toggleWishlist(btn);

  titleWrapper.appendChild(btn);
  checkIfAlreadySaved(btn);
});

observer.observe(document.body, { childList: true, subtree: true });

/* ---------------- HELPERS ---------------- */

function getTitleWrapper() {
  if (isFlipkart) return document.querySelector("h1.CEn5rD");
  if (isAmazon) return document.querySelector("#title") || document.querySelector("#productTitle")?.parentElement;
  if (isMyntra) return document.querySelector(".pdp-title");
  if (isMeesho) return document.querySelector("h1");
  if (isAjio) return document.querySelector(".prod-name");
  return null;
}

/* ---------------- DATA EXTRACTORS ---------------- */

function getFlipkartData() {
  const title =
    document.querySelector("span.B_NuCI")?.innerText ||
    document.querySelector("h1")?.innerText;

  const price =
    document.querySelector("div.hZ3P6w.bnqy13")?.innerText || // ✅ NEW CONFIRMED
    document.querySelector("div._30jeq3._16Jk6d")?.innerText ||
    document.querySelector("div._30jeq3")?.innerText ||
    document.querySelector("span.Nx9bqj")?.innerText ||
    document.querySelector("[class*='price']")?.innerText;

  let image =
    document.querySelector("img[src*='rukminim']")?.src ||
    document.querySelector("img[data-src*='rukminim']")?.dataset?.src;

  if (image) {
    image = image.replace(/\/image\/\d+\/\d+\//, "/image/832/832/");
  }

  return {
    title,
    price,
    image,
    url: location.href,
    platform: "Flipkart"
  };
}


function getAmazonData() {
  const whole = document.querySelector(".a-price-whole")?.innerText;
  const fraction = document.querySelector(".a-price-fraction")?.innerText;

  return {
    title: document.getElementById("productTitle")?.innerText?.trim(),
    price: whole ? `₹${whole}${fraction || ""}` : null,
    image:
      document.getElementById("landingImage")?.src ||
      document.querySelector("img[data-old-hires]")?.src,
    url: location.origin + location.pathname,
    platform: "Amazon"
  };
}

function getMyntraData() {
  const bg = document.querySelector(".image-grid-image")?.style?.backgroundImage;
  const image = bg ? bg.replace(/url\("(.+)"\)/, "$1") : null;

  return {
    title:
      document.querySelector(".pdp-title")?.innerText +
      " " +
      document.querySelector(".pdp-name")?.innerText,
    price: document.querySelector(".pdp-price strong")?.innerText,
    image,
    url: location.href,
    platform: "Myntra"
  };
}

function getMeeshoData() {
  const title =
    document.querySelector("h1")?.innerText ||
    document.querySelector("[data-testid='product-title']")?.innerText;

  const price =
    document.querySelector("h4")?.innerText ||
    document.querySelector("[data-testid='product-price']")?.innerText;

  let image = null;

  // ✅ STEP 1: collect only product images
  const candidates = [...document.querySelectorAll("img")]
    .filter(img =>
      img.src &&
      img.src.includes("images.meesho.com/images/products") &&
      img.width >= 300 &&
      img.height >= 300 &&
      img.getBoundingClientRect().top < window.innerHeight
    );

  // ✅ STEP 2: choose the first visible large image
  image = candidates[0]?.src;

  // ✅ STEP 3: fallback – closest image near title
  if (!image) {
    const titleEl = document.querySelector("h1");
    if (titleEl) {
      const nearbyImgs = [...document.querySelectorAll("img")]
        .filter(img =>
          img.src?.includes("images.meesho.com/images/products") &&
          Math.abs(img.getBoundingClientRect().top - titleEl.getBoundingClientRect().top) < 400
        );
      image = nearbyImgs[0]?.src;
    }
  }

  return {
    title,
    price,
    image,
    url: location.href,
    platform: "Meesho"
  };
}


/* ---------------- WISHLIST HANDLER ---------------- */

function toggleWishlist(btn) {
  let product;

  if (isAmazon) product = getAmazonData();
  else if (isFlipkart) product = getFlipkartData();
  else if (isMyntra) product = getMyntraData();
  else if (isMeesho) product = getMeeshoData();
  else if (isAjio) product = getAjioData();

  if (!product?.title || !product?.price) {
    showToast("Unable to fetch product details ❌", "error");
    return;
  }

  product.time = Date.now();

  chrome.storage.local.get(["apniwish"], (res) => {
    let wishlist = res.apniwish || [];
    const index = wishlist.findIndex(p => p.url === product.url);

    if (index !== -1) {
      wishlist.splice(index, 1);
      chrome.storage.local.set({ apniwish: wishlist }, () => {
        markAsUnsaved(btn);
        showToast("Removed from ApniWish ❌", "remove");
      });
    } else {
      wishlist.push(product);
      chrome.storage.local.set({ apniwish: wishlist }, () => {
        markAsSaved(btn);
        showToast("Added to ApniWish ✅", "add");
      });
    }
  });
}

/* ---------------- BUTTON STATES ---------------- */

function markAsSaved(btn) {
  btn.dataset.saved = "true";
  btn.innerHTML = "✅";
  btn.style.background = "#d4f7d4";
  btn.style.border = "1px solid #4caf50";
}

function markAsUnsaved(btn) {
  btn.dataset.saved = "false";
  btn.innerHTML = "🔖";
  btn.style.background = "#fff";
  btn.style.border = "1px solid #e0e0e0";
}

/* ---------------- STORAGE CHECK ---------------- */

function checkIfAlreadySaved(btn) {
  chrome.storage.local.get(["apniwish"], (res) => {
    const list = res.apniwish || [];
    list.some(p => p.url === location.href)
      ? markAsSaved(btn)
      : markAsUnsaved(btn);
  });
}

/* ---------------- TOAST ---------------- */

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.innerText = message;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    background:
      type === "add" ? "#4caf50" :
      type === "remove" ? "#f44336" : "#333",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    zIndex: 999999,
    opacity: 0,
    transition: "all 0.3s ease"
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = 1;
    toast.style.bottom = "50px";
  });

  setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.bottom = "30px";
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}
