const data = [
  {
    header: "Mammals",
    links: [
      { title: "Red Panda", url: "/animals/red-panda" },
      { title: "Fennec Fox", url: "/animals/fennec-fox" },
      { title: "Quokka", url: "/animals/quokka" },
      { title: "Hedgehog", url: "/animals/hedgehog" },
      { title: "Koala", url: "/animals/koala" },
      { title: "Sloth", url: "/animals/sloth" },
    ],
  },
  {
    header: "Birds & Sea Creatures",
    links: [
      { title: "Axolotl", url: "/animals/axolotl" },
      { title: "Sea Otter", url: "/animals/sea-otter" },
      { title: "Pygmy Seahorse", url: "/animals/pygmy-seahorse" },
      { title: "Puffin", url: "/animals/puffin" },
      { title: "Kākāpō", url: "/animals/kakapo" },
      { title: "Penguin Chick", url: "/animals/penguin-chick" },
    ],
  },
];

const openBtn = document.getElementById("open-modal") as HTMLButtonElement;
const dialog = document.getElementById("search-modal") as HTMLDialogElement;
const confirmSearchBtn = document.getElementById(
  "confirm-search"
) as HTMLButtonElement;
const openBtnText = document.getElementById(
  "open-button-text"
) as HTMLSpanElement;
const closeBtn = document.getElementById("close-modal") as HTMLButtonElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const results = document.getElementById("results") as HTMLDivElement;
const liveRegion = document.getElementById("live-region") as HTMLDivElement;

// Open dialog
openBtn.addEventListener("click", () => {
  openBtn.setAttribute("aria-expanded", "true");
  dialog.showModal();
  searchInput.value = "";
  results.innerHTML = "";
  liveRegion.textContent = "";
  setTimeout(() => searchInput.focus(), 0);
});

confirmSearchBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const query = searchInput.value.trim().toLowerCase();
  if (query === "") return;

  // Set query on trigger button
  openBtnText.textContent = query;

  // Close modal and update external results
  dialog.close();

  console.log(`Show results for ${query}...`);
});

// Close dialog via button
closeBtn.addEventListener("click", (e) => {
  e.preventDefault();

  dialog.close();
  openBtn.focus();
  return false;
});

dialog.addEventListener("close", () => {
  openBtn.setAttribute("aria-expanded", "false");
});

dialog.addEventListener("click", (e) => {
  e.preventDefault();

  const rect = dialog.getBoundingClientRect();
  const isInDialog =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (!isInDialog) {
    dialog.close();
  }
});

function renderResults(
  container: HTMLElement,
  groups: { header: string; links: (typeof data)[0]["links"] }[]
) {
  for (const group of groups) {
    const groupEl = document.createElement("div");
    groupEl.className = "group";

    const header = document.createElement("h3");
    header.textContent = group.header;
    groupEl.appendChild(header);

    const ul = document.createElement("ul");
    for (const link of group.links) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = link.url;
      a.textContent = link.title;
      li.appendChild(a);
      ul.appendChild(li);
    }

    groupEl.appendChild(ul);
    container.appendChild(groupEl);
  }
}

function getMatchedGroups(term: string) {
  return data
    .map((group) => {
      const matchedLinks = group.links.filter((link) =>
        link.title.toLowerCase().includes(term.toLowerCase())
      );
      return matchedLinks.length
        ? { header: group.header, links: matchedLinks }
        : null;
    })
    .filter(Boolean) as { header: string; links: (typeof data)[0]["links"] }[];
}

// Filter logic
searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim();
  let totalResults = 0;
  results.innerHTML = "";

  const suggestionsHeader = document.createElement("h2");
  suggestionsHeader.textContent = "Suggestions";
  results.appendChild(suggestionsHeader);

  for (const group of data) {
    const matchedLinks = group.links.filter((link) =>
      link.title.toLowerCase().includes(term.toLowerCase())
    );

    if (matchedLinks.length > 0) {
      totalResults += matchedLinks.length;

      const groupEl = document.createElement("div");
      groupEl.className = "group";

      const header = document.createElement("h3");
      header.textContent = group.header;
      groupEl.appendChild(header);

      const ul = document.createElement("ul");
      for (const link of matchedLinks) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.url;
        a.textContent = link.title;
        a.tabIndex = 0;
        li.appendChild(a);
        ul.appendChild(li);
      }

      groupEl.appendChild(ul);
      results.appendChild(groupEl);
    }
  }

  updateLiveRegion(totalResults);
});

const updateLiveRegion = debounce((count: number) => {
  let text =
    count === 0
      ? "No suggestion available."
      : `${count} suggestion${count > 1 ? "s" : ""} available.`;

  const isIdentical = liveRegion.textContent === text;
  if (isIdentical) text = text + " ";

  liveRegion.textContent = text;

  // Clear the content after 2 seconds to make sure the user doesn't access the aria-live region with arrow-key navigation
  setTimeout(() => {
    liveRegion.textContent = "";
  }, 2000);
}, 500);

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeout: number;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), delay);
  } as T;
}
