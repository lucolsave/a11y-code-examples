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
  "confirm-search",
) as HTMLButtonElement;
const openBtnText = document.getElementById(
  "open-button-text",
) as HTMLSpanElement;
const closeBtn = document.getElementById("close-modal") as HTMLButtonElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const clearSearchBtn = document.getElementById(
  "clear-search",
) as HTMLButtonElement;
const results = document.getElementById("results") as HTMLDivElement;
const liveRegion = document.getElementById("live-region") as HTMLDivElement;
let lastSearchedQuery = "";
const defaultSearchText = "Search cute animals";

function updateOpenButtonQuery(query: string) {
  const nextQuery = query.trim();
  const buttonText = nextQuery || defaultSearchText;
  openBtnText.textContent = buttonText;
  openBtn.setAttribute("aria-label", `Search, ${buttonText}`);
}

function discardDraftAndRestoreButton() {
  updateOpenButtonQuery("");
  lastSearchedQuery = "";
  searchInput.value = "";
  updateClearButtonVisibility();
}

function persistSearchDraft() {
  lastSearchedQuery = searchInput.value.trim();
  updateOpenButtonQuery(lastSearchedQuery);
  updateClearButtonVisibility();
}

function updateClearButtonVisibility() {
  clearSearchBtn.hidden = searchInput.value.length === 0;
}

// Open dialog
openBtn.addEventListener("click", () => {
  dialog.showModal();
  searchInput.value = lastSearchedQuery;
  updateClearButtonVisibility();
  results.innerHTML = "";
  liveRegion.textContent = "";
  // Allow the dialog to open before we set focus. Call showSuggestions() explicitly
  // because the focus event often does not fire when focus is moved into a newly opened dialog.
  setTimeout(() => {
    searchInput.focus();
    showSuggestions();
  }, 0);
});

// Close on first ESC (prevent input clear); persist draft so button shows current value
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.preventDefault();
    discardDraftAndRestoreButton();
    dialog.close();
    openBtn.focus();
    return;
  }
  if (e.key === "Enter" && !searchInput.value) e.preventDefault();
});

confirmSearchBtn.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !searchInput.value) {
    e.preventDefault();
    setTimeout(() => searchInput.focus(), 0);
  }
});

confirmSearchBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const query = searchInput.value.trim();
  if (query === "") {
    setTimeout(() => searchInput.focus(), 0);
    return;
  }

  // Set query on trigger button
  lastSearchedQuery = query;
  updateOpenButtonQuery(lastSearchedQuery);

  // Close modal and update external results
  dialog.close();

  alert(
    `A search is performed here. Remember to manage the focus accordingly.`,
  );
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  persistSearchDraft();
  showSuggestions();
  searchInput.focus();
});

// Close dialog via button
closeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  persistSearchDraft();

  dialog.close();
  openBtn.focus();
  return false;
});

dialog.addEventListener("click", (e) => {
  // Close when the user clicks outside the dialog panel (the dimmed backdrop). For
  // modal <dialog>, those clicks use the <dialog> node as event.target; clicks on
  // content inside use a descendant as target, so we do not close.
  if (e.target === dialog) {
    e.preventDefault();
    persistSearchDraft();
    dialog.close();
  }
});

dialog.addEventListener("cancel", () => {
  discardDraftAndRestoreButton();
});

function renderResults(
  container: HTMLElement,
  groups: { header: string; links: (typeof data)[0]["links"] }[],
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
        link.title.toLowerCase().includes(term.toLowerCase()),
      );
      return matchedLinks.length
        ? { header: group.header, links: matchedLinks }
        : null;
    })
    .filter(Boolean) as { header: string; links: (typeof data)[0]["links"] }[];
}

function showSuggestions() {
  const term = searchInput.value.trim();
  let totalResults = 0;
  results.innerHTML = "";

  const suggestionsHeader = document.createElement("h2");
  suggestionsHeader.textContent = "Suggestions";
  results.appendChild(suggestionsHeader);

  for (const group of data) {
    const matchedLinks = group.links.filter((link) =>
      link.title.toLowerCase().includes(term.toLowerCase()),
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
        a.textContent = link.title.trim();
        li.appendChild(a);
        ul.appendChild(li);
      }

      groupEl.appendChild(ul);
      results.appendChild(groupEl);
    }
  }

  updateLiveRegion(totalResults);
}

searchInput.addEventListener("focus", showSuggestions);
searchInput.addEventListener("input", () => {
  persistSearchDraft();
  showSuggestions();
});

const updateLiveRegion = debounce((count: number) => {
  let text =
    count === 0
      ? "No suggestions available."
      : `${count} suggestion${count > 1 ? "s" : ""} available.`;

  const isIdentical = liveRegion.textContent === text;
  // Change the text to make sure it's announced again
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
