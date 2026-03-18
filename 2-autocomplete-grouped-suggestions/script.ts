interface Suggestion {
  name: string;
  type: "country" | "city";
}

const input = document.getElementById("search-input") as HTMLInputElement;
const listbox = document.getElementById("autocomplete-list") as HTMLDivElement;
const statusRegion = document.getElementById("search-status") as HTMLDivElement;
const confirmSearchBtn = document.getElementById(
  "confirm-search",
) as HTMLButtonElement;
/*
  A visually hidden button that's only accessible while suggestions are shown.
  This is needed because TalkBack/VoiceOver does not trigger a blur event when the user leaves the input, so the suggestions stay visible and take up much of the screen.
  The hidden button gives TalkBack/VoiceOver users a way to close the suggestions.
*/
const closeSuggestionsBtn = document.getElementById(
  "close-suggestions",
) as HTMLButtonElement;

const suggestions: Suggestion[] = [
  { name: "Australia", type: "country" },
  { name: "Brazil", type: "country" },
  { name: "Canada", type: "country" },
  { name: "Costa Rica", type: "country" },
  { name: "France", type: "country" },
  { name: "India", type: "country" },
  { name: "Japan", type: "country" },
  { name: "Mexico", type: "country" },
  { name: "New Zealand", type: "country" },
  { name: "Norway", type: "country" },
  { name: "South Africa", type: "country" },
  { name: "South Korea", type: "country" },
  { name: "Sri Lanka", type: "country" },
  { name: "Thailand", type: "country" },
  { name: "United Kingdom", type: "country" },
  { name: "United States", type: "country" },
  { name: "Athens", type: "city" },
  { name: "Barcelona", type: "city" },
  { name: "Berlin", type: "city" },
  { name: "Buenos Aires", type: "city" },
  { name: "Cairo", type: "city" },
  { name: "Cape Town", type: "city" },
  { name: "Florence", type: "city" },
  { name: "Hong Kong", type: "city" },
  { name: "Istanbul", type: "city" },
  { name: "Jakarta", type: "city" },
  { name: "Las Vegas", type: "city" },
  { name: "Los Angeles", type: "city" },
  { name: "Madrid", type: "city" },
  { name: "Manila", type: "city" },
  { name: "Mexico City", type: "city" },
  { name: "New York", type: "city" },
  { name: "Nairobi", type: "city" },
  { name: "Rio de Janeiro", type: "city" },
  { name: "San Diego", type: "city" },
  { name: "Stockholm", type: "city" },
  { name: "Sydney", type: "city" },
  { name: "Tel Aviv", type: "city" },
  { name: "Tokyo", type: "city" },
  { name: "Toronto", type: "city" },
];

let currentIndex: number = -1;
let originalQuery: string = "";

function showOptions() {
  listbox.innerHTML = "";
  currentIndex = -1;

  const query = input.value.toLowerCase();
  const filtered =
    !query || query.length === 0
      ? [
          // Show first 3 of each type when empty
          ...suggestions.filter((s) => s.type === "country").slice(0, 3),
          ...suggestions.filter((s) => s.type === "city").slice(0, 3),
        ]
      : suggestions.filter((s) => s.name.toLowerCase().startsWith(query));

  const countries = filtered.filter((s) => s.type === "country");
  const cities = filtered.filter((s) => s.type === "city");

  if (filtered.length > 0) {
    const addGroup = (
      items: Suggestion[],
      groupLabel: string,
      groupId: string,
    ) => {
      if (items.length === 0) return;

      const group = document.createElement("div");
      group.setAttribute("role", "group");
      group.setAttribute("aria-labelledby", groupId);

      const heading = document.createElement("div");
      heading.id = groupId;
      heading.className = "group-heading";
      heading.textContent = groupLabel;

      group.appendChild(heading);

      items.forEach((item, i) => {
        const option = document.createElement("div");
        option.id = `${groupId}-option-${i}`;
        option.setAttribute("role", "option");
        option.setAttribute("tabindex", "0");
        option.textContent = item.name;

        option.addEventListener("click", () => {
          input.value = item.name;
          closeListbox();
          input.focus();
        });

        option.addEventListener("mouseover", (e) => {
          input.setAttribute("aria-activedescendant", option.id);
        });

        group.appendChild(option);
      });

      listbox.appendChild(group);
    };

    addGroup(countries, "Countries", "group-countries");
    addGroup(cities, "Cities", "group-cities");

    listbox.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
    closeSuggestionsBtn.classList.remove("hidden");
    updateLiveRegion(filtered.length);
  } else {
    closeListbox();
    updateLiveRegion(0);
  }
}

input.addEventListener("focus", () => {
  showOptions();
});

input.addEventListener("input", () => {
  showOptions();
});

input.addEventListener("keydown", (e: KeyboardEvent) => {
  const options = listbox.querySelectorAll<HTMLDivElement>('[role="option"]');
  if (!options.length) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      if (currentIndex === -1) {
        originalQuery = input.value;
      }
      currentIndex = (currentIndex + 1) % options.length;
      updateActiveOption(options);
      input.value = options[currentIndex].textContent || input.value;
      break;
    case "ArrowUp":
      e.preventDefault();
      currentIndex = currentIndex <= 0 ? -1 : currentIndex - 1;
      updateActiveOption(options);
      if (currentIndex === -1) {
        input.value = originalQuery;
      } else {
        input.value = options[currentIndex].textContent || input.value;
      }
      break;
    case "Enter":
      if (currentIndex >= 0) {
        e.preventDefault();
        input.value = options[currentIndex].textContent || input.value;
        closeListbox();
        submitSearch();
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
  closeSuggestionsBtn.classList.add("hidden");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-activedescendant", "");
  // debounce(input.focus, 100)();
  listbox.innerHTML = "";
  currentIndex = -1;
  originalQuery = "";
}

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

function submitSearch() {
  const query = input.value.trim();
  if (query) {
    alert(`A search is performed here. Remember to manage the focus accordingly.`);
  } else {
    setTimeout(() => input.focus(), 0);
  }
}

confirmSearchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  submitSearch();
});

closeSuggestionsBtn.addEventListener("click", (e) => {
  e.preventDefault();
  closeListbox();
  confirmSearchBtn.focus();
});

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeout: number;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), delay);
  } as T;
}
