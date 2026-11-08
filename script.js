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

function createRowElement(rowNum, selectedSeatState) {
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

    if (
      (rowNum === 3 && (s === 5 || s === 6)) ||
      (rowNum === 8 && (s === 10 || s === 11)) ||
      (rowNum === 2 && s === 12) ||
      (rowNum === 10 && s === 4)
    ) {
      seatBtn.classList.add("unavailable");
      seatBtn.disabled = true;
    }

    seatBtn.addEventListener("click", () => {
      if (selectedSeatState.current) {
        selectedSeatState.current.classList.remove("selected");
      }

      seatBtn.classList.add("selected");
      selectedSeatState.current = seatBtn;

      document.getElementById("seat-section").textContent = config.section;
      document.getElementById("seat-row").textContent = rowNum;
      document.getElementById("seat-number").textContent = s;
      document.getElementById("seat-price").textContent =
        `$${config.price.toFixed(2)}`;
      document.getElementById("seat-status").textContent =
        "Available (Inspected)";
      document.getElementById("add-to-cart-btn").disabled = false;
    });

    rowDiv.appendChild(seatBtn);
  }

  const rightLabel = document.createElement("span");
  rightLabel.className = "row-label";
  rightLabel.textContent = rowNum;
  rowDiv.appendChild(rightLabel);

  return rowDiv;
}

function renderVenueMap(selectedSeatState) {
  const blockUpper = document.getElementById("block-upper");
  const blockLower = document.getElementById("block-lower");

  blockLower.innerHTML =
    '<div class="block-title">Orchestra / Lower Tier</div>';
  blockUpper.innerHTML = '<div class="block-title">Balcony / Upper Tier</div>';

  for (let r = 1; r <= 6; r++) {
    blockLower.appendChild(createRowElement(r, selectedSeatState));
  }
  for (let r = 7; r <= 12; r++) {
    blockUpper.appendChild(createRowElement(r, selectedSeatState));
  }
}

function initPanAndZoom() {
  let currentZoom = 1;
  let panX = 0;
  let panY = 0;
  const mapInner = document.getElementById("venue-map-inner");

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
}

function initializeApp() {
  const selectedSeatState = { current: null };
  renderVenueMap(selectedSeatState);
  initPanAndZoom();
}

function runMain() {
  initializeApp();
}

document.addEventListener("DOMContentLoaded", runMain);
