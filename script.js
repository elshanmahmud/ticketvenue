function getRowConfig(rowNum) {
  if (rowNum >= 10) {
    return { section: "Balcony Tier", price: 45.0, tierClass: "tier-balcony" };
  } else if (rowNum >= 7) {
    return {
      section: "Mezzanine Tier",
      price: 75.0,
      tierClass: "tier-mezzanine",
    };
  } else if (rowNum >= 3) {
    return {
      section: "Standard Tier",
      price: 120.0,
      tierClass: "tier-standard",
    };
  } else {
    return { section: "VIP Tier", price: 180.0, tierClass: "tier-vip" };
  }
}

function createRowElement(
  rowNum,
  selectedSeatState,
  seatStates,
  cart,
  renderCallback,
) {
  const rowDiv = document.createElement("div");
  rowDiv.className = "seat-row";

  const leftLabel = document.createElement("span");
  leftLabel.className = "row-label";
  leftLabel.textContent = rowNum;
  rowDiv.appendChild(leftLabel);

  const config = getRowConfig(rowNum);

  for (let s = 1; s <= 16; s++) {
    const seatBtn = document.createElement("button");
    seatBtn.className = `seat ${config.tierClass}`;
    seatBtn.textContent = s;
    seatBtn.dataset.row = rowNum;
    seatBtn.dataset.seat = s;

    const seatKey = `${rowNum}-${s}`;

    // Demo unavailable seats
    if (
      !seatStates[seatKey] &&
      ((rowNum === 3 && (s === 5 || s === 6)) ||
        (rowNum === 8 && (s === 10 || s === 11)) ||
        (rowNum === 2 && s === 12) ||
        (rowNum === 10 && s === 4))
    ) {
      seatStates[seatKey] = "unavailable";
    }

    // Apply persistent states
    if (seatStates[seatKey] === "unavailable") {
      seatBtn.classList.add("unavailable");
      seatBtn.disabled = true;
    } else if (seatStates[seatKey] === "in-cart") {
      seatBtn.classList.add("in-cart");
    }

    // Seat click inspection listener
    seatBtn.addEventListener("click", () => {
      if (seatStates[seatKey] === "unavailable") return;

      if (selectedSeatState.current) {
        selectedSeatState.current.classList.remove("selected");
      }

      seatBtn.classList.add("selected");
      selectedSeatState.current = seatBtn;

      // Track currently inspected seat object for cart action
      selectedSeatState.inspected = {
        row: rowNum,
        seatNum: s,
        section: config.section,
        price: config.price,
        key: seatKey,
      };

      document.getElementById("seat-section").textContent = config.section;
      document.getElementById("seat-row").textContent = rowNum;
      document.getElementById("seat-number").textContent = s;
      document.getElementById("seat-price").textContent =
        `$${config.price.toFixed(2)}`;

      const addToCartBtn = document.getElementById("add-to-cart-btn");
      if (seatStates[seatKey] === "in-cart") {
        document.getElementById("seat-status").textContent = "In Cart";
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = "ALREADY IN CART";
      } else {
        document.getElementById("seat-status").textContent =
          "Available (Inspected)";
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = "ADD TO CART";
      }
    });

    rowDiv.appendChild(seatBtn);
  }

  const rightLabel = document.createElement("span");
  rightLabel.className = "row-label";
  rightLabel.textContent = rowNum;
  rowDiv.appendChild(rightLabel);

  return rowDiv;
}

function renderVenueMap(selectedSeatState, seatStates, cart, renderCallback) {
  const blockUpper = document.getElementById("block-upper");
  const blockLower = document.getElementById("block-lower");

  blockLower.innerHTML =
    '<div class="block-title">Orchestra / Lower Tier</div>';
  blockUpper.innerHTML = '<div class="block-title">Balcony / Upper Tier</div>';

  for (let r = 1; r <= 6; r++) {
    blockLower.appendChild(
      createRowElement(r, selectedSeatState, seatStates, cart, renderCallback),
    );
  }
  for (let r = 7; r <= 12; r++) {
    blockUpper.appendChild(
      createRowElement(r, selectedSeatState, seatStates, cart, renderCallback),
    );
  }
}

function updateCartUI(cart, seatStates, renderCallback) {
  const cartItemsList = document.getElementById("cart-items-list");
  const cartTotalPriceEl = document.getElementById("cart-total-price");

  cartItemsList.innerHTML = "";
  if (cart.length === 0) {
    cartItemsList.innerHTML =
      '<p style="color: #666; font-size: 13px; text-align: center;">Cart is empty</p>';
    cartTotalPriceEl.textContent = "$0.00";
    return;
  }

  let total = 0;
  cart.forEach((item) => {
    total += item.price;
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.style.display = "flex";
    itemDiv.style.justifyContent = "space-between";
    itemDiv.style.alignItems = "center";
    itemDiv.style.padding = "4px 0";
    itemDiv.style.fontSize = "13px";
    itemDiv.innerHTML = `
      <span>R${item.row} S${item.seatNum} ($${item.price.toFixed(2)})</span>
      <button class="remove-btn" data-key="${item.key}" style="background:#ef4444; color:#fff; border:none; padding:2px 6px; border-radius:3px; cursor:pointer; font-size:11px;">Remove</button>
    `;

    itemDiv.querySelector(".remove-btn").addEventListener("click", () => {
      removeFromCart(item.key, cart, seatStates, renderCallback);
    });

    cartItemsList.appendChild(itemDiv);
  });

  cartTotalPriceEl.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(key, cart, seatStates, renderCallback) {
  const index = cart.findIndex((item) => item.key === key);
  if (index !== -1) cart.splice(index, 1);
  delete seatStates[key];

  localStorage.setItem("venue_cart", JSON.stringify(cart));
  localStorage.setItem("venue_seat_states", JSON.stringify(seatStates));

  document.getElementById("seat-status").textContent = "Available (Inspected)";
  document.getElementById("add-to-cart-btn").disabled = false;
  document.getElementById("add-to-cart-btn").textContent = "ADD TO CART";

  renderCallback();
  updateCartUI(cart, seatStates, renderCallback);
}

function initPanAndZoom() {
  let currentZoom = 1;
  let panX = 0;
  let panY = 0;
  const mapInner = document.getElementById("venue-map-inner");
  const viewport = document.getElementById("venue-viewport");

  function updateTransform() {
    mapInner.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
  }

  document.getElementById("zoom-in-btn").addEventListener("click", () => {
    if (currentZoom < 1.8) {
      currentZoom += 0.15;
      updateTransform();
    }
  });
  document.getElementById("zoom-out-btn").addEventListener("click", () => {
    if (currentZoom > 0.6) {
      currentZoom -= 0.15;
      updateTransform();
    }
  });
  document.getElementById("pan-up-btn").addEventListener("click", () => {
    panY += 30;
    updateTransform();
  });
  document.getElementById("pan-down-btn").addEventListener("click", () => {
    panY -= 30;
    updateTransform();
  });
  document.getElementById("pan-left-btn").addEventListener("click", () => {
    panX += 30;
    updateTransform();
  });
  document.getElementById("pan-right-btn").addEventListener("click", () => {
    panX -= 30;
    updateTransform();
  });
  document.getElementById("reset-view-btn").addEventListener("click", () => {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    updateTransform();
  });

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        if (currentZoom < 1.8) currentZoom += 0.1;
      } else {
        if (currentZoom > 0.6) currentZoom -= 0.1;
      }
      updateTransform();
    },
    { passive: false },
  );

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  viewport.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    viewport.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    viewport.style.cursor = "default";
  });
}

function initializeApp() {
  let cart = JSON.parse(localStorage.getItem("venue_cart")) || [];
  let seatStates = JSON.parse(localStorage.getItem("venue_seat_states")) || {};
  const selectedSeatState = { current: null, inspected: null };

  const renderCallback = () => {
    renderVenueMap(selectedSeatState, seatStates, cart, renderCallback);
  };

  renderCallback();
  updateCartUI(cart, seatStates, renderCallback);
  initPanAndZoom();

  // Add to Cart Button Listener
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  addToCartBtn.addEventListener("click", () => {
    if (!selectedSeatState.inspected) return;

    if (cart.some((item) => item.key === selectedSeatState.inspected.key)) {
      alert("This seat is already in your cart.");
      return;
    }

    cart.push(selectedSeatState.inspected);
    seatStates[selectedSeatState.inspected.key] = "in-cart";

    localStorage.setItem("venue_cart", JSON.stringify(cart));
    localStorage.setItem("venue_seat_states", JSON.stringify(seatStates));

    renderCallback();
    updateCartUI(cart, seatStates, renderCallback);

    document.getElementById("seat-status").textContent = "In Cart";
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = "ALREADY IN CART";
  });
}

function runMain() {
  initializeApp();
}

document.addEventListener("DOMContentLoaded", runMain);
