interface Suggestion {
  name: string;
  type: "country" | "city";
}

const input = document.getElementById("search-input") as HTMLInputElement;
const listbox = document.getElementById("autocomplete-list") as HTMLDivElement;
const statusRegion = document.getElementById("search-status") as HTMLDivElement;
const confirmSearchBtn = document.getElementById(
  "confirm-search"
) as HTMLButtonElement;
const externalResults = document.getElementById(
  "external-results"
) as HTMLDivElement;

const suggestions: Suggestion[] = [
  { name: "Australia", type: "country" },
  { name: "Brazil", type: "country" },
  { name: "Canada", type: "country" },
  { name: "France", type: "country" },
  { name: "India", type: "country" },
  { name: "Japan", type: "country" },
  { name: "Mexico", type: "country" },
  { name: "Norway", type: "country" },
  { name: "Spain", type: "country" },
  { name: "Thailand", type: "country" },
  { name: "Athens", type: "city" },
  { name: "Barcelona", type: "city" },
  { name: "Berlin", type: "city" },
  { name: "Cairo", type: "city" },
  { name: "Cape Town", type: "city" },
  { name: "Florence", type: "city" },
  { name: "Istanbul", type: "city" },
  { name: "Jakarta", type: "city" },
  { name: "Madrid", type: "city" },
  { name: "Manila", type: "city" },
  { name: "New York", type: "city" },
  { name: "Nairobi", type: "city" },
  { name: "Stockholm", type: "city" },
  { name: "Sydney", type: "city" },
  { name: "Tokyo", type: "city" },
  { name: "Toronto", type: "city" },
];

let currentIndex: number = -1;

input.addEventListener("input", () => {
  listbox.innerHTML = "";
  currentIndex = -1;

  const query = input.value.toLowerCase();
  const filtered = suggestions.filter((s) =>
    s.name.toLowerCase().startsWith(query)
  );

  const countries = filtered.filter((s) => s.type === "country");
  const cities = filtered.filter((s) => s.type === "city");

  if (filtered.length > 0 && query.length > 0) {
    const addGroup = (
      items: Suggestion[],
      groupLabel: string,
      groupId: string
    ) => {
      if (items.length === 0) return;

      const group = document.createElement("ul");
      group.setAttribute("role", "group");
      group.setAttribute("aria-labelledby", groupId);

      const heading = document.createElement("li");
      heading.id = groupId;
      heading.className = "group-heading";
      heading.setAttribute("role", "separator");
      heading.setAttribute("aria-hidden", "true");
      heading.textContent = groupLabel;
      group.appendChild(heading);

      items.forEach((item, i) => {
        const li = document.createElement("li");
        li.id = `${groupId}-option-${i}`;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.textContent = item.name;

        li.addEventListener("click", () => {
          input.value = item.name;
          closeListbox();
          input.focus();
        });

        group.appendChild(li);
      });

      listbox.appendChild(group);
    };

    addGroup(countries, "Countries", "group-countries");
    addGroup(cities, "Cities", "group-cities");

    listbox.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
    updateLiveRegion(filtered.length);
  } else {
    closeListbox();
    updateLiveRegion(0);
  }
});

input.addEventListener("keydown", (e: KeyboardEvent) => {
  const options = listbox.querySelectorAll<HTMLLIElement>('li[role="option"]');
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

const updateLiveRegion = debounce((count: number) => {
  let text =
    count === 0
      ? "No options available."
      : `${count} option${
          count > 1 ? "s" : ""
        } available. Use up and down arrows to review and ENTER to select.`;

  const isIdentical = statusRegion.textContent === text;
  if (isIdentical) text = text + " ";

  statusRegion.textContent = `${count} result${count !== 1 ? "s" : ""} found`;
}, 500);

document.addEventListener("click", (e) => {
  if (
    !input.contains(e.target as Node) &&
    !listbox.contains(e.target as Node)
  ) {
    closeListbox();
  }
});

confirmSearchBtn.addEventListener("click", (e) => {
  e.preventDefault();

  console.log(`Show results for ${input.value.toLowerCase()}`);
});

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeout: number;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), delay);
  } as T;
}
