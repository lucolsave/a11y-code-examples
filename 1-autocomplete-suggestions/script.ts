const input = document.getElementById("search-input") as HTMLInputElement;
const listbox = document.getElementById("autocomplete-list") as HTMLDivElement;
const statusRegion = document.getElementById("search-status") as HTMLDivElement;
const confirmSearchBtn = document.getElementById(
  "confirm-search"
) as HTMLButtonElement;

const countries = [
  "Australia",
  "Austria",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "India",
  "Japan",
  "Mexico",
  "Netherlands",
  "Norway",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
];

let currentIndex: number = -1;

input.addEventListener("input", () => {
  const query = input.value.toLowerCase();
  const matches = countries.filter((c) => c.toLowerCase().startsWith(query));

  listbox.innerHTML = "";
  currentIndex = -1;

  if (query.length > 0 && matches.length > 0) {
    renderResults(listbox, matches);

    listbox.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
    updateLiveRegion(matches.length);
  } else {
    closeListbox();
    updateLiveRegion(0);
  }
});

function renderResults(container: HTMLElement, matches: string[]) {
  matches.forEach((country, i) => {
    const option = document.createElement("div");
    option.id = `option-${i}`;
    option.setAttribute("role", "option");
    option.setAttribute("tabindex", "0");

    option.textContent = country;

    option.addEventListener("click", () => {
      input.value = country;
      closeListbox();
      input.focus();
    });

    option.addEventListener("mouseover", (e) => {
      input.setAttribute("aria-activedescendant", option.id);
    });

    container.appendChild(option);
  });
}

input.addEventListener("keydown", (e: KeyboardEvent) => {
  const options = listbox.querySelectorAll<HTMLDivElement>('[role="option"]');
  if (!options.length) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      currentIndex = (currentIndex + 1) % options.length;
      updateActiveOption(options);
      break;
    case "ArrowUp":
      e.preventDefault();
      currentIndex = currentIndex <= 0 ? -1 : currentIndex - 1;
      updateActiveOption(options);
      break;
    case "Enter":
    case " ":
      if (currentIndex >= 0) {
        e.preventDefault();
        options[currentIndex].click();
      }
      break;
    case "Escape":
      e.preventDefault();
      if (currentIndex >= 0) {
        options[currentIndex].click();
      } else {
        closeListbox();
      }
      break;
    case "Tab":
      if (currentIndex >= 0) {
        input.value = options[currentIndex].textContent || input.value;
      }
      if (input.getAttribute("aria-expanded") === "true") {
        // Keep the focus on the listbox if a option is opened.
        e.preventDefault();
      }
      closeListbox();

      break;
  }
});

function updateActiveOption(options: NodeListOf<HTMLDivElement>) {
  options.forEach((opt, i) => {
    opt.classList.toggle("highlighted", i === currentIndex);
  });

  if (currentIndex >= 0) {
    input.setAttribute("aria-activedescendant", options[currentIndex].id);
  } else {
    input.setAttribute("aria-activedescendant", "");
  }
}

function closeListbox() {
  listbox.classList.add("hidden");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-activedescendant", "");
  // debounce(input.focus, 100)();
  listbox.innerHTML = "";
  currentIndex = -1;
}

confirmSearchBtn.addEventListener("click", (e) => {
  e.preventDefault();

  console.log(`Show results for ${input.value.toLowerCase()}...`);
});

const updateLiveRegion = debounce((count: number) => {
  let text =
    count === 0
      ? "No options available."
      : `${count} option${count > 1 ? "s" : ""} available.`;

  const isIdentical = statusRegion.textContent === text;
  // Change the text to make sure it's announced again
  if (isIdentical) text = text + " ";

  statusRegion.textContent = text;

  // Clear the content after 2 seconds to make sure the user doesn't access the aria-live region with arrow-key navigation
  setTimeout(() => {
    statusRegion.textContent = "";
  }, 2000);
}, 500);

document.addEventListener("click", (e) => {
  if (
    !input.contains(e.target as Node) &&
    !listbox.contains(e.target as Node)
  ) {
    closeListbox();
  }
});

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeout: number;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), delay);
  } as T;
}
