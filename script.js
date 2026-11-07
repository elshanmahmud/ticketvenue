document.addEventListener("DOMContentLoaded", () => {
  const blockUpper = document.getElementById("block-upper");
  const blockLower = document.getElementById("block-lower");

  function renderVenueMap() {
    for (let r = 13; r >= 8; r--) {
      blockUpper.appendChild(createRowElement(r));
    }
    for (let r = 7; r >= 1; r--) {
      blockLower.appendChild(createRowElement(r));
    }
  }

  function createRowElement(rowNum) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "seat-row";

    const leftLabel = document.createElement("span");
    leftLabel.className = "row-label";
    leftLabel.textContent = rowNum;
    rowDiv.appendChild(leftLabel);

    for (let s = 1; s <= 16; s++) {
      const seatBtn = document.createElement("button");
      seatBtn.className = "seat";
      seatBtn.textContent = s;
      seatBtn.dataset.row = rowNum;
      seatBtn.dataset.seat = s;
      rowDiv.appendChild(seatBtn);
    }

    const rightLabel = document.createElement("span");
    rightLabel.className = "row-label";
    rightLabel.textContent = rowNum;
    rowDiv.appendChild(rightLabel);

    return rowDiv;
  }

  renderVenueMap();
});
