interface Suggestion {
  text: string;
  url: string;
  type: "query" | "topic" | "recipe";
}

const input = document.getElementById("search-input") as HTMLInputElement;
const listbox = document.getElementById(
  "autocomplete-list"
) as HTMLUListElement;
const statusRegion = document.getElementById("search-status") as HTMLDivElement;
const confirmSearchBtn = document.getElementById(
  "confirm-search"
) as HTMLButtonElement;

const recepies: Suggestion[] = [
  {
    text: "Spicy tomato soup",
    url: "/search?q=spicy+tomato+soup",
    type: "query",
  },
  {
    text: "Creamy mushroom risotto",
    url: "/search?q=mushroom+risotto",
    type: "query",
  },
  {
    text: "Vegetarian comfort foods",
    url: "/topics/vegetarian-comfort",
    type: "topic",
  },
  {
    text: "Street food around the world",
    url: "/topics/street-food",
    type: "topic",
  },
  {
    text: "Luigi's lasagna",
    url: "/recipe/luigis-lasagna",
    type: "recipe",
  },
  {
    text: "Ryu's midnight ramen",
    url: "/recipe/ryus-midnight-ramen",
    type: "recipe",
  },
];

let currentIndex: number = -1;

function getIconSVG(type: string): string {
  if (type === "query") {
    return `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M10 2a8 8 0 015.29 13.71l4 4a1 1 0 01-1.42 1.42l-4-4A8 8 0 1110 2zm0 2a6 6 0 100 12a6 6 0 000-12z"/></svg>`;
  }
  if (type === "topic") {
    return `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/></svg>`;
  }
  if (type === "recipe") {
    return `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l4 8h8l-6 6l2 8l-8-5l-8 5l2-8l-6-6h8z"/></svg>`;
  }
  return "";
}

input.addEventListener("input", () => {
  const query = input.value.toLowerCase();
  const matches = recepies.filter((r) => r.text.toLowerCase().includes(query));

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

function renderResults(container: HTMLElement, matches: Suggestion[]) {
  matches.forEach((recepie, i) => {
    const li = document.createElement("li");
    const id = `option-${i}`;
    li.id = `option-${i}`;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");
    li.setAttribute("aria-describedby", `${recepie.type}-desc`);
    li.setAttribute("data-link", encodeURI(recepie.url));

    li.innerHTML = `${getIconSVG(recepie.type)} <span>${recepie.text}</span>`;

    li.addEventListener("click", (e) => {
      e.preventDefault();
      selectSuggestion(id);
      closeListbox();
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

function selectSuggestion(id: string) {
  const li = document.getElementById(id) as HTMLLIElement;
  const url = li?.getAttribute("data-link");
  if (!url) return;
  alert("You clicked a link to: " + decodeURI(url));
  // window.location.href = decodeURI(url);
}

function updateActiveOption(options: NodeListOf<HTMLLIElement>) {
  options.forEach((opt, i) => {
    opt.classList.toggle("highlighted", i === currentIndex);
    opt.setAttribute("aria-selected", i === currentIndex ? "true" : "false");
  });

  input.value = options[currentIndex].textContent ?? "";

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
