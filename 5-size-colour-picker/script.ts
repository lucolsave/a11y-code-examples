const colourLinks = document.querySelectorAll(".colours a");
const sizeButtons = document.querySelectorAll(".sizes button");
const selectedColour = document.querySelector(".selected-colour");

colourLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    colourLinks.forEach((item) => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "page");

    const colourName = link.textContent?.trim() ?? "";
    if (selectedColour) {
      selectedColour.textContent = `Selected colour: ${colourName}`;
    }
  });
});

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.getAttribute("aria-disabled") === "true") {
      return;
    }

    if (button.getAttribute("aria-pressed") === "true") {
      return;
    }

    sizeButtons.forEach((item) => {
      if (item.getAttribute("aria-disabled") === "true") {
        return;
      }
      item.setAttribute("aria-pressed", "false");
    });

    button.setAttribute("aria-pressed", "true");
  });
});
