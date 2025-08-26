const input = document.getElementById("search-input") as HTMLInputElement;
const listbox = document.getElementById(
  "autocomplete-list"
) as HTMLUListElement;
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
    const li = document.createElement("li");
    li.id = `option-${i}`;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");

    li.textContent = country;

    li.addEventListener("click", () => {
      input.value = country;
      closeListbox();
      input.focus();
    });
    container.appendChild(li);
  });
}

input.addEventListener("keydown", (e: KeyboardEvent) => {
  const options = listbox.querySelectorAll<HTMLLIElement>("li");
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
      closeListbox();
      console.log("esc");
      input.focus();
      break;
    case "Tab":
      if (currentIndex >= 0) {
        input.value = options[currentIndex].textContent || input.value;
      }
      closeListbox();
      break;
  }
});

function updateActiveOption(options: NodeListOf<HTMLLIElement>) {
  options.forEach((opt, i) => {
    opt.classList.toggle("highlighted", i === currentIndex);
    opt.setAttribute("aria-selected", i === currentIndex ? "true" : "false");
  });

  if (currentIndex >= 0) {
    input.setAttribute("aria-activedescendant", options[currentIndex].id);
  } else {
    input.removeAttribute("aria-activedescendant");
  }
}

function closeListbox() {
  listbox.classList.add("hidden");
  input.setAttribute("aria-expanded", "false");
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
  if (isIdentical) text = text + " ";

  statusRegion.textContent = text;
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
