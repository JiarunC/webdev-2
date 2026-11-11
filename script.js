"use strict";

/* ==========================================================================
   1. API & TIER ICON CONFIGURATION
   ========================================================================== */
const API_CONFIG = {
  CHEAPSHARK_GAMES_ENDPOINT: "https://www.cheapshark.com/api/1.0/games",
  CHEAPSHARK_DEALS_ENDPOINT: "https://www.cheapshark.com/api/1.0/deals",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE: "https://image.tmdb.org/t/p/w342",
  TMDB_IMAGE_BACKUP_BASE: "https://image.tmdb.org/t/p/w500",
  TMDB_API_KEY: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNzJhMDI0MDEwMThkZDVhOTUzNjIxNThkMDJjMTYzNCIsIm5iZiI6MTc4MjkxNDgxMy4wNDksInN1YiI6IjZhNDUxZWZkNDRjODA0ZmVjNzQxN2RhOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OPWxCi4EY5aoShdDKDVxqBQIxfall46ofyesKH8gadw"
};

const TIER_ICON_PRESETS = [
  { id: "none", label: "None", value: "", symbol: "", alt: "" },
  { id: "favorite", label: "Favorite", value: "symbol:favorite", symbol: "favorite", alt: "Favorite icon" },
  { id: "star", label: "Star", value: "symbol:star", symbol: "star", alt: "Star icon" },
  { id: "neutral", label: "Neutral", value: "symbol:sentiment_neutral", symbol: "sentiment_neutral", alt: "Neutral icon" },
  { id: "half-star", label: "Half Star", value: "symbol:star_half", symbol: "star_half", alt: "Half Star icon" },
  { id: "bin", label: "Bin", value: "symbol:delete", symbol: "delete", alt: "Bin icon" },
  { id: "chore", label: "Chore", value: "symbol:mop", symbol: "mop", alt: "Chore icon" }
];

/* ==========================================================================
   2. MATTE PALETTE, DEFAULT A-F TEMPLATE & DEFAULT GAME CATALOG
   ========================================================================== */
const MATTE_SWATCHES = [
  "#b8644f",
  "#c48747",
  "#b5a253",
  "#688f6e",
  "#597c9c",
  "#7d6891",
  "#9e5d75",
  "#528582",
  "#8c7a65",
  "#666578"
];

function createDefaultTiers() {
  return [
    { id: "tier-a", name: "A", color: "#b8644f", icon: "", iconAlt: "", games: [] },
    { id: "tier-b", name: "B", color: "#c48747", icon: "", iconAlt: "", games: [] },
    { id: "tier-c", name: "C", color: "#b5a253", icon: "", iconAlt: "", games: [] },
    { id: "tier-d", name: "D", color: "#688f6e", icon: "", iconAlt: "", games: [] },
    { id: "tier-e", name: "E", color: "#597c9c", icon: "", iconAlt: "", games: [] },
    { id: "tier-f", name: "F", color: "#7d6891", icon: "", iconAlt: "", games: [] }
  ];
}

function gameCoverUrls(appId) {
  return {
    primary: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/library_600x900.jpg",
    secondary: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/header.jpg"
  };
}

// 24 default reference video games populated when clicking Load Defaults in Games mode.
const DEFAULT_GAME_CATALOG = [
  { appId: 367520, name: "Hollow Knight", year: "2017" },
  { appId: 504230, name: "Celeste", year: "2018" },
  { appId: 524220, name: "NieR:Automata", year: "2017" },
  { appId: 753640, name: "Outer Wilds", year: "2019" },
  { appId: 1145360, name: "Hades", year: "2020" },
  { appId: 237930, name: "Transistor", year: "2014" },
  { appId: 632470, name: "Disco Elysium", year: "2019" },
  { appId: 638230, name: "Journey", year: "2012" },
  { appId: 257850, name: "Hyper Light Drifter", year: "2016" },
  { appId: 379720, name: "DOOM", year: "2016" },
  { appId: 1687950, name: "Persona 5 Royal", year: "2019" },
  { appId: 613830, name: "Chrono Trigger", year: "1995" },
  { appId: 387290, name: "Ori and the Blind Forest", year: "2015" },
  { appId: 391540, name: "Undertale", year: "2015" },
  { appId: 632360, name: "Risk of Rain 2", year: "2020" },
  { appId: 268910, name: "Cuphead", year: "2017" },
  { appId: 212680, name: "FTL: Faster Than Light", year: "2012" },
  { appId: 224760, name: "FEZ", year: "2012" },
  { appId: 553420, name: "TUNIC", year: "2022" },
  { appId: 1262350, name: "SIGNALIS", year: "2022" },
  { appId: 460950, name: "Katana ZERO", year: "2019" },
  { appId: 107100, name: "Bastion", year: "2011" },
  { appId: 264710, name: "Subnautica", year: "2018" },
  { appId: 1245620, name: "ELDEN RING", year: "2022" }
].map(function mapCatalogEntry(entry) {
  const urls = gameCoverUrls(entry.appId);
  return {
    id: "game-" + entry.appId,
    mediaType: "game",
    name: entry.name,
    year: entry.year,
    releaseDate: entry.year,
    imageUrl: urls.primary,
    backupUrl: urls.secondary,
    source: "default-game"
  };
});

/* ==========================================================================
   3. APPLICATION STATE & ISOLATED WORKSPACES (GAMES VS. MOVIES)
   ========================================================================== */
const STORAGE_KEYS = {
  SAVED_LISTS: "strata_saved_tierlists_v1",
  THEME: "strata_theme_mode_v1"
};

function defaultTitleForMode(mode) {
  return mode === "movies" ? "Movie Tier List" : "Video Game Tier List";
}

function expectedMediaTypeForMode(mode) {
  return mode === "movies" ? "movie" : "game";
}

function createWorkspaceState(mode) {
  return {
    mediaMode: mode,
    activeSlotId: null,
    lastSavedTitle: null,
    title: defaultTitleForMode(mode),
    orientation: "horizontal",
    tiers: createDefaultTiers(),
    candidates: [],
    candidateFilter: "",
    searchMatches: []
  };
}

const state = {
  mode: "games",
  theme: "dark",
  workspaces: {
    games: createWorkspaceState("games"),
    movies: createWorkspaceState("movies")
  },
  editingTierId: null,
  isCreatingTier: false,
  modalIconValue: ""
};

function getActiveWorkspace() {
  return state.workspaces[state.mode];
}

let dragContext = null;

/* ==========================================================================
   4. DOM REFERENCES
   ========================================================================== */
const dom = {};

function cacheDom() {
  dom.html = document.documentElement;
  dom.workspaceMain = document.getElementById("workspace-main");
  dom.modeSwitch = document.getElementById("mode-switch");
  dom.modeLabel = document.getElementById("mode-label");
  dom.orientationSwitch = document.getElementById("orientation-switch");
  dom.orientationLabel = document.getElementById("orientation-label");
  dom.themeSwitch = document.getElementById("theme-switch");
  dom.themeLabel = document.getElementById("theme-label");
  dom.addTierBtn = document.getElementById("add-tier-btn");
  dom.saveTierlistForm = document.getElementById("save-tierlist-form");
  dom.openStorageBtn = document.getElementById("open-storage-btn");
  dom.savedCount = document.getElementById("saved-count");
  dom.newTemplateBtn = document.getElementById("new-template-btn");

  dom.gameToolWindow = document.getElementById("game-tool-window");
  dom.gameSearchForm = document.getElementById("game-search-form");
  dom.gameQueryInput = document.getElementById("game-query-input");
  dom.clearGameQueryBtn = document.getElementById("clear-game-query-btn");
  dom.gameSearchBtn = document.getElementById("game-search-btn");
  dom.loadGameDefaultsBtn = document.getElementById("load-game-defaults-btn");
  dom.gameSearchFeedback = document.getElementById("game-search-feedback");
  dom.gameMatchesPanel = document.getElementById("game-matches-panel");
  dom.gameMatchesCount = document.getElementById("game-matches-count");
  dom.closeGameMatchesBtn = document.getElementById("close-game-matches-btn");
  dom.gameMatchesList = document.getElementById("game-matches-list");

  dom.movieToolWindow = document.getElementById("movie-tool-window");
  dom.movieSearchForm = document.getElementById("movie-search-form");
  dom.movieQueryInput = document.getElementById("movie-query-input");
  dom.clearMovieQueryBtn = document.getElementById("clear-movie-query-btn");
  dom.movieSearchBtn = document.getElementById("movie-search-btn");
  dom.loadMovieDefaultsBtn = document.getElementById("load-movie-defaults-btn");
  dom.movieSearchFeedback = document.getElementById("movie-search-feedback");
  dom.movieMatchesPanel = document.getElementById("movie-matches-panel");
  dom.movieMatchesCount = document.getElementById("movie-matches-count");
  dom.closeMovieMatchesBtn = document.getElementById("close-movie-matches-btn");
  dom.movieMatchesList = document.getElementById("movie-matches-list");

  dom.srDocumentHeading = document.getElementById("sr-document-heading");
  dom.tierlistTitle = document.getElementById("tierlist-title");
  dom.documentHint = document.getElementById("document-hint");
  dom.tiersList = document.getElementById("tiers-list");

  dom.candidatesCount = document.getElementById("candidates-count");
  dom.candidatesFilterInput = document.getElementById("candidates-filter-input");
  dom.clearCandidatesFilterBtn = document.getElementById("clear-candidates-filter-btn");
  dom.clearCandidatesBtn = document.getElementById("clear-candidates-btn");
  dom.candidatesDropzone = document.getElementById("candidates-dropzone");
  dom.candidatesList = document.getElementById("candidates-list");
  dom.candidatesEmptyMsg = document.getElementById("candidates-empty-msg");

  dom.tierEditorDialog = document.getElementById("tier-editor-dialog");
  dom.tierEditorForm = document.getElementById("tier-editor-form");
  dom.tierModalTitle = document.getElementById("tier-modal-title");
  dom.closeTierModalBtn = document.getElementById("close-tier-modal-btn");
  dom.cancelTierModalBtn = document.getElementById("cancel-tier-modal-btn");
  dom.tierNameInput = document.getElementById("tier-name-input");
  dom.tierColorInput = document.getElementById("tier-color-input");
  dom.tierColorHex = document.getElementById("tier-color-hex");
  dom.matteSwatches = document.getElementById("matte-swatches");
  dom.tierIconPreset = document.getElementById("tier-icon-preset");
  dom.tierIconUrl = document.getElementById("tier-icon-url");
  dom.tierIconFile = document.getElementById("tier-icon-file");
  dom.tierIconPreviewSymbol = document.getElementById("tier-icon-preview-symbol");
  dom.tierIconPreview = document.getElementById("tier-icon-preview");
  dom.tierIconNone = document.getElementById("tier-icon-none");
  dom.clearTierIconBtn = document.getElementById("clear-tier-icon-btn");

  dom.storageDialog = document.getElementById("storage-dialog");
  dom.closeStorageModalBtn = document.getElementById("close-storage-modal-btn");
  dom.doneStorageModalBtn = document.getElementById("done-storage-modal-btn");
  dom.saveCopyForm = document.getElementById("save-copy-form");
  dom.saveAsNameInput = document.getElementById("save-as-name-input");
  dom.savedListsUl = document.getElementById("saved-lists-ul");
  dom.savedListsEmpty = document.getElementById("saved-lists-empty");

  dom.statusMessage = document.getElementById("status-message");
  dom.statusMode = document.getElementById("status-mode");
  dom.statusOrientation = document.getElementById("status-orientation");
  dom.statusTierCount = document.getElementById("status-tier-count");
  dom.statusRankedCount = document.getElementById("status-ranked-count");
  dom.statusCandidateCount = document.getElementById("status-candidate-count");
}

/* ==========================================================================
   5. UTILITY HELPERS
   ========================================================================== */
const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function makeId(prefix) {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function formatUnixReleaseDate(unixSeconds) {
  const ts = Number(unixSeconds);
  if (!ts || ts <= 0) {
    return "";
  }
  const date = new Date(ts * 1000);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return SHORT_MONTHS[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + date.getUTCFullYear();
}

function formatTmdbReleaseDate(isoDateStr) {
  const match = String(isoDateStr || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return "";
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    return "";
  }
  return SHORT_MONTHS[monthIndex] + " " + day + ", " + year;
}

function getContrastInk(hexColor) {
  const clean = String(hexColor || "").replace("#", "");
  if (clean.length !== 6) {
    return "#19171a";
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 142 ? "#19171a" : "#fffff0";
}

const PLACEHOLDER_IMAGE_SRC = "placeholder.png";
const failedImageUrls = new Set();

function isValidCustomIconUrl(rawUrl) {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed || failedImageUrls.has(trimmed)) {
    return false;
  }
  if (trimmed === PLACEHOLDER_IMAGE_SRC) {
    return true;
  }
  if (trimmed.indexOf("data:") === 0) {
    return /^data:image\/(?:png|jpe?g|gif|webp|bmp|ico|avif);base64,[a-z0-9+/=]+$/i.test(trimmed);
  }
  const match = trimmed.match(
    /^https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})(?::\d+)?(\/[^\s?#]*)(?:\?[^\s#]*)?(?:#[^\s]*)?$/i
  );
  if (!match) {
    return false;
  }
  const host = match[1].toLowerCase();
  const pathname = match[2];
  if (
    host === "example.com" ||
    host === "example.org" ||
    host === "example.net" ||
    /\.example$|\.invalid$|\.test$/i.test(host)
  ) {
    return false;
  }
  if (!/\.(?:png|jpe?g|gif|webp|avif|bmp|ico)$/i.test(pathname)) {
    return false;
  }
  return true;
}

function isValidPosterSource(rawUrl) {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed || failedImageUrls.has(trimmed)) {
    return false;
  }
  if (trimmed === PLACEHOLDER_IMAGE_SRC) {
    return true;
  }
  if (trimmed.indexOf("data:") === 0) {
    return /^data:image\/(?:png|jpe?g|gif|webp|bmp|ico|avif);base64,[a-z0-9+/=]+$/i.test(trimmed);
  }
  const match = trimmed.match(
    /^https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})(?::\d+)?(?:\/[^\s]*)?$/i
  );
  if (!match) {
    return false;
  }
  const host = match[1].toLowerCase();
  if (
    host === "example.com" ||
    host === "example.org" ||
    host === "example.net" ||
    /\.example$|\.invalid$|\.test$/i.test(host)
  ) {
    return false;
  }
  return true;
}

function sanitizeTierIconValue(rawIconValue) {
  const trimmed = String(rawIconValue || "").trim();
  if (!trimmed) {
    return "";
  }
  if (extractSymbolLigature(trimmed)) {
    return trimmed;
  }
  if (!isValidCustomIconUrl(trimmed)) {
    return PLACEHOLDER_IMAGE_SRC;
  }
  return trimmed;
}

function attachPosterFallbacks(imgEl, item) {
  if (!isValidPosterSource(item.imageUrl)) {
    if (item.backupUrl && isValidPosterSource(item.backupUrl)) {
      item.imageUrl = item.backupUrl;
      item.backupUrl = "";
    } else {
      item.imageUrl = PLACEHOLDER_IMAGE_SRC;
      item.backupUrl = "";
    }
  }

  let stage = 0;
  function handlePosterError() {
    const failedSrc = imgEl.getAttribute("src") || item.imageUrl || "";
    if (failedSrc && failedSrc !== PLACEHOLDER_IMAGE_SRC) {
      failedImageUrls.add(failedSrc);
    }
    if (
      stage === 0 &&
      item.backupUrl &&
      isValidPosterSource(item.backupUrl) &&
      imgEl.getAttribute("src") !== item.backupUrl &&
      imgEl.src !== item.backupUrl
    ) {
      stage = 1;
      item.imageUrl = item.backupUrl;
      item.backupUrl = "";
      imgEl.src = item.imageUrl;
      return;
    }
    if (stage <= 1) {
      stage = 2;
      item.imageUrl = PLACEHOLDER_IMAGE_SRC;
      item.backupUrl = "";
      if (imgEl.getAttribute("src") !== PLACEHOLDER_IMAGE_SRC) {
        imgEl.src = PLACEHOLDER_IMAGE_SRC;
      }
    }
  }
  imgEl.addEventListener("error", handlePosterError);
  return handlePosterError;
}

function getPresetByValue(iconValue) {
  return TIER_ICON_PRESETS.find(function findPreset(preset) {
    return preset.value === iconValue && preset.value !== "";
  }) || null;
}

function extractSymbolLigature(iconValue) {
  const raw = String(iconValue || "").trim();
  if (raw.indexOf("symbol:") === 0) {
    return raw.slice("symbol:".length).trim();
  }
  return "";
}

function replaceBrokenTierIconsInState(brokenUrl) {
  if (!brokenUrl) {
    return;
  }
  const modes = ["games", "movies"];
  for (let m = 0; m < modes.length; m += 1) {
    const ws = state.workspaces[modes[m]];
    for (let t = 0; t < ws.tiers.length; t += 1) {
      if (ws.tiers[t].icon === brokenUrl) {
        ws.tiers[t].icon = PLACEHOLDER_IMAGE_SRC;
      }
    }
  }
}

function applyTierIconSource(imgEl, rawIconUrl) {
  const targetUrl = String(rawIconUrl || "").trim();
  if (!targetUrl || !isValidCustomIconUrl(targetUrl)) {
    replaceBrokenTierIconsInState(targetUrl);
    imgEl.src = PLACEHOLDER_IMAGE_SRC;
    return;
  }

  let settled = false;
  function handleIconError() {
    if (settled) {
      return;
    }
    settled = true;
    failedImageUrls.add(targetUrl);
    replaceBrokenTierIconsInState(targetUrl);
    if (imgEl.getAttribute("src") !== PLACEHOLDER_IMAGE_SRC) {
      imgEl.src = PLACEHOLDER_IMAGE_SRC;
    }
  }

  imgEl.addEventListener("error", handleIconError, { once: true });
  imgEl.src = targetUrl;

  if (imgEl.complete && imgEl.naturalWidth === 0) {
    handleIconError();
  }
}

function syncSearchClearButton(inputEl, clearBtnEl) {
  if (!inputEl || !clearBtnEl) {
    return;
  }
  clearBtnEl.hidden = inputEl.value.length === 0;
}

function wireSearchClearButton(inputEl, clearBtnEl, onCleared) {
  syncSearchClearButton(inputEl, clearBtnEl);
  inputEl.addEventListener("input", function onSearchFieldInput() {
    syncSearchClearButton(inputEl, clearBtnEl);
  });
  clearBtnEl.addEventListener("click", function onClearSearchField() {
    inputEl.value = "";
    syncSearchClearButton(inputEl, clearBtnEl);
    if (typeof onCleared === "function") {
      onCleared();
    }
    inputEl.focus();
  });
}

function setStatus(message) {
  dom.statusMessage.textContent = message;
}

function clearToolFeedback(element) {
  element.hidden = true;
  element.textContent = "";
  delete element.dataset.level;
}

function showToolFeedback(element, message, level) {
  if (!message) {
    clearToolFeedback(element);
    return;
  }
  element.textContent = message;
  element.dataset.level = level || "info";
  element.hidden = false;
}

function openDialog(dialogEl) {
  try {
    if (typeof dialogEl.showModal === "function") {
      if (!dialogEl.open) {
        dialogEl.showModal();
      }
    } else {
      dialogEl.setAttribute("open", "");
    }
  } catch (err) {
    dialogEl.setAttribute("open", "");
  }
}

function closeDialog(dialogEl) {
  try {
    if (typeof dialogEl.close === "function" && dialogEl.open) {
      dialogEl.close();
    } else {
      dialogEl.removeAttribute("open");
    }
  } catch (err) {
    dialogEl.removeAttribute("open");
  }
}

/* ==========================================================================
   6. NON-INTERLACED POOL MANAGEMENT (STRICT GAMES VS. MOVIES ISOLATION)
   ========================================================================== */
function isItemAlreadyPresent(workspace, itemId, itemName) {
  const normalizedName = String(itemName || "").trim().toLowerCase();
  const inCandidates = workspace.candidates.some(function checkCandidate(entry) {
    return entry.id === itemId || entry.name.trim().toLowerCase() === normalizedName;
  });
  if (inCandidates) {
    return true;
  }
  return workspace.tiers.some(function checkTier(tier) {
    return tier.games.some(function checkRanked(entry) {
      return entry.id === itemId || entry.name.trim().toLowerCase() === normalizedName;
    });
  });
}

function addItemsToCandidates(itemsArray, targetMode) {
  const modeKey = targetMode === "movies" ? "movies" : "games";
  const workspace = state.workspaces[modeKey];
  const requiredMediaType = expectedMediaTypeForMode(modeKey);
  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < itemsArray.length; i += 1) {
    const raw = itemsArray[i];
    if (!raw) {
      continue;
    }
    // Enforce non-interlacing: reject any record tagged with the opposite media type
    if (raw.mediaType && raw.mediaType !== requiredMediaType) {
      continue;
    }

    const cleanTitle = String(raw.name || "Untitled").trim();
    const cleanItem = {
      id: raw.id || makeId(requiredMediaType),
      mediaType: requiredMediaType,
      name: cleanTitle,
      year: raw.year ? String(raw.year) : "",
      releaseDate: raw.releaseDate ? String(raw.releaseDate) : (raw.year ? String(raw.year) : ""),
      imageUrl: raw.imageUrl || PLACEHOLDER_IMAGE_SRC,
      backupUrl: raw.backupUrl || "",
      source: raw.source || modeKey
    };

    if (isItemAlreadyPresent(workspace, cleanItem.id, cleanItem.name)) {
      skippedCount += 1;
    } else {
      workspace.candidates.push(cleanItem);
      addedCount += 1;
    }
  }

  if (state.mode === modeKey) {
    renderWorkspace();
  }
  return { addedCount: addedCount, skippedCount: skippedCount };
}

function extractItemById(workspace, itemId) {
  const candIdx = workspace.candidates.findIndex(function findCand(entry) {
    return entry.id === itemId;
  });
  if (candIdx !== -1) {
    return workspace.candidates.splice(candIdx, 1)[0];
  }

  for (let t = 0; t < workspace.tiers.length; t += 1) {
    const tier = workspace.tiers[t];
    const itemIdx = tier.games.findIndex(function findInTier(entry) {
      return entry.id === itemId;
    });
    if (itemIdx !== -1) {
      return tier.games.splice(itemIdx, 1)[0];
    }
  }
  return null;
}

function moveItemToDestination(itemId, destinationType, destinationTierId, beforeItemId) {
  const workspace = getActiveWorkspace();
  const requiredMediaType = expectedMediaTypeForMode(state.mode);
  const item = extractItemById(workspace, itemId);
  if (!item) {
    return;
  }

  // Guard against cross-mode interlacing
  if (item.mediaType && item.mediaType !== requiredMediaType) {
    return;
  }
  item.mediaType = requiredMediaType;

  if (destinationType === "candidates") {
    if (beforeItemId) {
      const targetIdx = workspace.candidates.findIndex(function findTarget(entry) {
        return entry.id === beforeItemId;
      });
      if (targetIdx !== -1) {
        workspace.candidates.splice(targetIdx, 0, item);
      } else {
        workspace.candidates.push(item);
      }
    } else {
      workspace.candidates.push(item);
    }
    setStatus('Moved "' + item.name + '" to Candidates');
  } else if (destinationType === "tier") {
    const targetTier = workspace.tiers.find(function findTier(t) {
      return t.id === destinationTierId;
    });
    if (!targetTier) {
      workspace.candidates.push(item);
    } else if (beforeItemId) {
      const targetIdx = targetTier.games.findIndex(function findTarget(entry) {
        return entry.id === beforeItemId;
      });
      if (targetIdx !== -1) {
        targetTier.games.splice(targetIdx, 0, item);
      } else {
        targetTier.games.push(item);
      }
      setStatus('Assigned "' + item.name + '" to tier ' + targetTier.name);
    } else {
      targetTier.games.push(item);
      setStatus('Assigned "' + item.name + '" to tier ' + targetTier.name);
    }
  }

  renderWorkspace();
}

/* ==========================================================================
   7. RENDERING ENGINE
   ========================================================================== */
function createPosterListItem(item, containerType, tierId) {
  const workspace = getActiveWorkspace();
  const li = document.createElement("li");
  li.className = "poster-item";
  li.draggable = true;
  li.dataset.gameId = item.id;
  li.dataset.mediaType = item.mediaType || expectedMediaTypeForMode(state.mode);
  li.dataset.containerType = containerType;
  if (tierId) {
    li.dataset.tierId = tierId;
  }
  li.title = item.year ? item.name + " (" + item.year + ")" : item.name;

  // Poster images use strictly the title of the game/movie as alt text
  const img = document.createElement("img");
  img.className = "poster-img";
  img.alt = item.name;
  img.loading = "lazy";
  img.decoding = "async";
  const onPosterError = attachPosterFallbacks(img, item);
  img.src = item.imageUrl || PLACEHOLDER_IMAGE_SRC;
  if (img.complete && img.naturalWidth === 0 && img.getAttribute("src") !== PLACEHOLDER_IMAGE_SRC) {
    onPosterError();
  }

  const caption = document.createElement("span");
  caption.className = "poster-caption";
  caption.textContent = item.name;

  const quickBtn = document.createElement("button");
  quickBtn.type = "button";
  quickBtn.className = "poster-quick-btn";

  const quickIcon = document.createElement("span");
  quickIcon.className = "material-symbols-outlined poster-quick-icon";
  quickIcon.setAttribute("aria-hidden", "true");
  quickIcon.textContent = "close_small";
  quickBtn.appendChild(quickIcon);

  if (containerType === "tier") {
    quickBtn.title = "Remove from tier back to Candidates";
    quickBtn.setAttribute("aria-label", "Remove " + item.name + " from tier");
    quickBtn.addEventListener("click", function handleReturnToPool(event) {
      event.stopPropagation();
      moveItemToDestination(item.id, "candidates", null, null);
    });
  } else {
    quickBtn.title = "Delete from Candidate pool";
    quickBtn.setAttribute("aria-label", "Delete " + item.name + " from candidates");
    quickBtn.addEventListener("click", function handleDeleteCandidate(event) {
      event.stopPropagation();
      extractItemById(workspace, item.id);
      setStatus('Removed "' + item.name + '" from Candidates');
      renderWorkspace();
    });
  }

  li.addEventListener("dragstart", function handleDragStart(event) {
    dragContext = {
      itemId: item.id,
      mode: state.mode,
      originType: containerType,
      originTierId: tierId || null
    };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", item.id);
    }
    window.requestAnimationFrame(function markDragging() {
      li.classList.add("is-dragging");
    });
  });

  li.addEventListener("dragend", function handleDragEnd() {
    li.classList.remove("is-dragging");
    clearDragHighlights();
    dragContext = null;
  });

  li.addEventListener("dragover", function handleCardDragOver(event) {
    event.preventDefault();
    if (dragContext && dragContext.mode === state.mode && dragContext.itemId !== item.id) {
      li.classList.add("is-drop-target");
    }
  });

  li.addEventListener("dragleave", function handleCardDragLeave() {
    li.classList.remove("is-drop-target");
  });

  li.addEventListener("drop", function handleCardDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    li.classList.remove("is-drop-target");
    clearDragHighlights();

    if (dragContext && dragContext.mode !== state.mode) {
      return;
    }

    const droppedId = dragContext
      ? dragContext.itemId
      : (event.dataTransfer ? event.dataTransfer.getData("text/plain") : "");

    if (!droppedId || droppedId === item.id) {
      return;
    }

    const activeWs = getActiveWorkspace();
    const rect = li.getBoundingClientRect();
    const insertBefore = event.clientX < rect.left + rect.width / 2;
    if (insertBefore) {
      moveItemToDestination(droppedId, containerType, tierId || null, item.id);
    } else {
      const siblingList = containerType === "candidates"
        ? activeWs.candidates
        : (activeWs.tiers.find(function findT(t) { return t.id === tierId; }) || { games: [] }).games;
      const idx = siblingList.findIndex(function findCurrent(entry) { return entry.id === item.id; });
      const nextItem = idx !== -1 && idx + 1 < siblingList.length ? siblingList[idx + 1] : null;
      moveItemToDestination(droppedId, containerType, tierId || null, nextItem ? nextItem.id : null);
    }
  });

  li.appendChild(img);
  li.appendChild(caption);
  li.appendChild(quickBtn);
  return li;
}

function clearDragHighlights() {
  const zones = document.querySelectorAll(".is-drag-over, .is-drop-target");
  for (let i = 0; i < zones.length; i += 1) {
    zones[i].classList.remove("is-drag-over", "is-drop-target");
  }
}

function bindDropZoneEvents(zoneEl, destinationType, tierId) {
  zoneEl.addEventListener("dragover", function handleZoneDragOver(event) {
    event.preventDefault();
    if (dragContext && dragContext.mode !== state.mode) {
      return;
    }
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    zoneEl.classList.add("is-drag-over");
  });

  zoneEl.addEventListener("dragleave", function handleZoneDragLeave(event) {
    const related = event.relatedTarget;
    const isDomNode = typeof Node !== "undefined" ? related instanceof Node : Boolean(related);
    if (!related || !isDomNode || !zoneEl.contains(related)) {
      zoneEl.classList.remove("is-drag-over");
    }
  });

  zoneEl.addEventListener("drop", function handleZoneDrop(event) {
    event.preventDefault();
    zoneEl.classList.remove("is-drag-over");
    if (dragContext && dragContext.mode !== state.mode) {
      return;
    }
    const droppedId = dragContext
      ? dragContext.itemId
      : (event.dataTransfer ? event.dataTransfer.getData("text/plain") : "");
    if (!droppedId) {
      return;
    }
    moveItemToDestination(droppedId, destinationType, tierId || null, null);
  });
}

function renderTiers() {
  const workspace = getActiveWorkspace();
  dom.tiersList.innerHTML = "";
  const isVerticalColumns = workspace.orientation === "vertical";
  const nounLabel = state.mode === "movies" ? "Movies" : "Games";

  for (let index = 0; index < workspace.tiers.length; index += 1) {
    const tier = workspace.tiers[index];
    const tierLi = document.createElement("li");
    tierLi.className = "tier-item";
    tierLi.dataset.tierId = tier.id;

    // Header cell (name + optional icon + user-selected matte color via CSS variable)
    const headerCell = document.createElement("div");
    headerCell.className = "tier-header-cell";
    headerCell.style.setProperty("--tier-color", tier.color);
    headerCell.style.setProperty("--tier-ink", getContrastInk(tier.color));

    if (tier.icon) {
      const symbolName = extractSymbolLigature(tier.icon);
      if (symbolName) {
        const iconSpan = document.createElement("span");
        iconSpan.className = "material-symbols-outlined tier-icon-symbol";
        iconSpan.setAttribute("role", "img");
        iconSpan.setAttribute("aria-label", tier.iconAlt || (tier.name + " tier icon"));
        iconSpan.textContent = symbolName;
        headerCell.appendChild(iconSpan);
      } else {
        const iconImg = document.createElement("img");
        iconImg.className = "tier-icon-img";
        iconImg.alt = tier.iconAlt || (tier.name + " tier icon");
        applyTierIconSource(iconImg, tier.icon);
        headerCell.appendChild(iconImg);
      }
    }

    const nameSpan = document.createElement("span");
    nameSpan.className = "tier-name-text";
    nameSpan.textContent = tier.name;
    headerCell.appendChild(nameSpan);

    // Dropzone cell
    const dropzone = document.createElement("div");
    dropzone.className = "tier-dropzone";
    dropzone.dataset.dropZone = "tier";
    dropzone.dataset.tierId = tier.id;
    bindDropZoneEvents(dropzone, "tier", tier.id);

    const posterUl = document.createElement("ul");
    posterUl.className = "poster-collection";
    posterUl.setAttribute("aria-label", nounLabel + " in tier " + tier.name);

    for (let g = 0; g < tier.games.length; g += 1) {
      posterUl.appendChild(createPosterListItem(tier.games[g], "tier", tier.id));
    }
    dropzone.appendChild(posterUl);

    // Controls cell (Edit, Reorder, Delete)
    const controlsCell = document.createElement("div");
    controlsCell.className = "tier-controls-cell";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "ide-btn ide-btn-compact";
    editBtn.textContent = "Edit";
    editBtn.title = "Edit name, color, or icon for tier " + tier.name;
    editBtn.addEventListener("click", function onEditClick() {
      openTierEditorModal(tier.id);
    });

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "ide-btn ide-btn-compact";
    prevBtn.textContent = isVerticalColumns ? "Left" : "Up";
    prevBtn.disabled = index === 0;
    prevBtn.title = "Move tier earlier";
    prevBtn.addEventListener("click", function onMovePrev() {
      moveTier(index, -1);
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "ide-btn ide-btn-compact";
    nextBtn.textContent = isVerticalColumns ? "Right" : "Down";
    nextBtn.disabled = index === workspace.tiers.length - 1;
    nextBtn.title = "Move tier later";
    nextBtn.addEventListener("click", function onMoveNext() {
      moveTier(index, 1);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "ide-btn ide-btn-compact";
    delBtn.textContent = "Del";
    delBtn.title = "Delete tier (returns ranked items to Candidates)";
    delBtn.addEventListener("click", function onDeleteTier() {
      deleteTier(tier.id);
    });

    controlsCell.appendChild(editBtn);
    controlsCell.appendChild(prevBtn);
    controlsCell.appendChild(nextBtn);
    controlsCell.appendChild(delBtn);

    if (isVerticalColumns) {
      tierLi.appendChild(headerCell);
      tierLi.appendChild(controlsCell);
      tierLi.appendChild(dropzone);
    } else {
      tierLi.appendChild(headerCell);
      tierLi.appendChild(dropzone);
      tierLi.appendChild(controlsCell);
    }

    dom.tiersList.appendChild(tierLi);
  }
}

function renderCandidates() {
  const workspace = getActiveWorkspace();
  const isMovies = state.mode === "movies";
  dom.candidatesList.innerHTML = "";
  dom.candidatesList.setAttribute(
    "aria-label",
    isMovies ? "Candidate movie posters" : "Candidate game posters"
  );

  const query = workspace.candidateFilter.trim().toLowerCase();
  const visibleCandidates = query
    ? workspace.candidates.filter(function matchFilter(entry) {
        return entry.name.toLowerCase().indexOf(query) !== -1;
      })
    : workspace.candidates;

  for (let i = 0; i < visibleCandidates.length; i += 1) {
    dom.candidatesList.appendChild(createPosterListItem(visibleCandidates[i], "candidates", null));
  }

  dom.candidatesCount.textContent = String(workspace.candidates.length);
  if (workspace.candidates.length === 0) {
    dom.candidatesEmptyMsg.textContent = "Candidate pool is empty. Search titles or click Load Defaults.";
    dom.candidatesEmptyMsg.hidden = false;
  } else if (visibleCandidates.length === 0) {
    dom.candidatesEmptyMsg.textContent = 'No candidates match filter "' + workspace.candidateFilter + '".';
    dom.candidatesEmptyMsg.hidden = false;
  } else {
    dom.candidatesEmptyMsg.hidden = true;
  }
}

function renderMetricsAndChrome() {
  const workspace = getActiveWorkspace();
  const isMovies = state.mode === "movies";

  // Mode sync (strictly shows CheapShark in Games mode and TMDB in Movies mode)
  dom.workspaceMain.dataset.mode = state.mode;
  dom.modeLabel.textContent = isMovies ? "Movies" : "Games";
  dom.modeSwitch.setAttribute("aria-pressed", String(isMovies));
  dom.statusMode.textContent = state.mode.toUpperCase();
  dom.gameToolWindow.hidden = isMovies;
  dom.movieToolWindow.hidden = !isMovies;
  dom.documentHint.textContent = "Drag and drop posters into tiers or back to the candidate pool.";

  // Filter & search clear button sync
  if (document.activeElement !== dom.candidatesFilterInput) {
    dom.candidatesFilterInput.value = workspace.candidateFilter;
  }
  syncSearchClearButton(dom.gameQueryInput, dom.clearGameQueryBtn);
  syncSearchClearButton(dom.movieQueryInput, dom.clearMovieQueryBtn);
  syncSearchClearButton(dom.candidatesFilterInput, dom.clearCandidatesFilterBtn);

  // Title sync
  if (document.activeElement !== dom.tierlistTitle) {
    dom.tierlistTitle.value = workspace.title;
  }
  dom.srDocumentHeading.textContent = workspace.title || defaultTitleForMode(state.mode);
  document.title = (workspace.title || defaultTitleForMode(state.mode)) + " // Strata";

  // Orientation sync
  dom.workspaceMain.dataset.orientation = workspace.orientation;
  const isVertical = workspace.orientation === "vertical";
  dom.orientationLabel.textContent = isVertical ? "Vertical" : "Horizontal";
  dom.orientationSwitch.setAttribute("aria-pressed", String(isVertical));
  dom.statusOrientation.textContent = workspace.orientation.toUpperCase();

  // Theme sync
  dom.html.dataset.theme = state.theme;
  const isLight = state.theme === "light";
  dom.themeLabel.textContent = isLight ? "Light" : "Dark";
  dom.themeSwitch.setAttribute("aria-pressed", String(isLight));

  // Status bar counts
  let rankedTotal = 0;
  for (let i = 0; i < workspace.tiers.length; i += 1) {
    rankedTotal += workspace.tiers[i].games.length;
  }
  dom.statusTierCount.textContent = String(workspace.tiers.length);
  dom.statusRankedCount.textContent = String(rankedTotal);
  dom.statusCandidateCount.textContent = String(workspace.candidates.length);

  const savedLists = readSavedTierLists();
  dom.savedCount.textContent = String(savedLists.length);
}

function renderWorkspace() {
  renderMetricsAndChrome();
  renderTiers();
  renderCandidates();
  renderModeSearchMatches("games");
  renderModeSearchMatches("movies");
}

/* ==========================================================================
   8. TIER CRUD (ADD, EDIT NAME/COLOR/ICON, REORDER, DELETE)
   ========================================================================== */
function moveTier(index, delta) {
  const workspace = getActiveWorkspace();
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= workspace.tiers.length) {
    return;
  }
  const moved = workspace.tiers.splice(index, 1)[0];
  workspace.tiers.splice(targetIndex, 0, moved);
  setStatus('Reordered tier "' + moved.name + '"');
  renderWorkspace();
}

function deleteTier(tierId) {
  const workspace = getActiveWorkspace();
  const idx = workspace.tiers.findIndex(function findTier(t) {
    return t.id === tierId;
  });
  if (idx === -1) {
    return;
  }
  const removed = workspace.tiers.splice(idx, 1)[0];
  if (removed.games.length > 0) {
    for (let i = 0; i < removed.games.length; i += 1) {
      workspace.candidates.push(removed.games[i]);
    }
    setStatus(
      'Deleted tier "' + removed.name + '" and returned ' + removed.games.length + " item(s) to Candidates"
    );
  } else {
    setStatus('Deleted tier "' + removed.name + '"');
  }
  renderWorkspace();
}

function initTierEditorControls() {
  dom.matteSwatches.innerHTML = "";
  for (let i = 0; i < MATTE_SWATCHES.length; i += 1) {
    const hex = MATTE_SWATCHES[i];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch-btn";
    btn.dataset.hex = hex;
    btn.style.setProperty("--swatch-color", hex);
    btn.title = "Select matte color " + hex;
    btn.setAttribute("aria-label", "Select color " + hex);
    btn.addEventListener("click", function onPickSwatch() {
      setTierModalColor(hex);
    });
    dom.matteSwatches.appendChild(btn);
  }

  dom.tierIconPreset.innerHTML = "";
  for (let j = 0; j < TIER_ICON_PRESETS.length; j += 1) {
    const preset = TIER_ICON_PRESETS[j];
    const opt = document.createElement("option");
    opt.value = preset.value;
    opt.dataset.alt = preset.alt;
    opt.textContent = preset.label;
    dom.tierIconPreset.appendChild(opt);
  }
}

function setTierModalColor(hex) {
  const normalized = String(hex || "#7d6891").toLowerCase();
  dom.tierColorInput.value = normalized;
  dom.tierColorHex.textContent = normalized;

  const swatches = dom.matteSwatches.querySelectorAll(".swatch-btn");
  for (let i = 0; i < swatches.length; i += 1) {
    swatches[i].classList.toggle("is-active", swatches[i].dataset.hex.toLowerCase() === normalized);
  }
}

function updateTierModalIconPreview(iconValue) {
  const trimmed = String(iconValue || "").trim();
  if (!trimmed) {
    dom.tierIconPreviewSymbol.hidden = true;
    dom.tierIconPreviewSymbol.textContent = "";
    dom.tierIconPreview.hidden = true;
    dom.tierIconNone.hidden = false;
    return;
  }

  const symbolName = extractSymbolLigature(trimmed);
  if (symbolName) {
    const preset = getPresetByValue(trimmed);
    dom.tierIconNone.hidden = true;
    dom.tierIconPreview.hidden = true;
    dom.tierIconPreviewSymbol.textContent = symbolName;
    dom.tierIconPreviewSymbol.setAttribute(
      "aria-label",
      preset ? preset.alt : (symbolName + " icon")
    );
    dom.tierIconPreviewSymbol.hidden = false;
    return;
  }

  dom.tierIconNone.hidden = true;
  dom.tierIconPreviewSymbol.hidden = true;
  dom.tierIconPreviewSymbol.textContent = "";
  dom.tierIconPreview.hidden = false;

  if (!isValidCustomIconUrl(trimmed)) {
    state.modalIconValue = PLACEHOLDER_IMAGE_SRC;
    if (dom.tierIconPreview.getAttribute("src") !== PLACEHOLDER_IMAGE_SRC) {
      dom.tierIconPreview.src = PLACEHOLDER_IMAGE_SRC;
    }
    return;
  }

  dom.tierIconPreview.src = trimmed;

  if (
    dom.tierIconPreview.complete &&
    dom.tierIconPreview.naturalWidth === 0 &&
    dom.tierIconPreview.getAttribute("src") !== PLACEHOLDER_IMAGE_SRC
  ) {
    failedImageUrls.add(trimmed);
    state.modalIconValue = PLACEHOLDER_IMAGE_SRC;
    dom.tierIconPreview.src = PLACEHOLDER_IMAGE_SRC;
  }
}

function openTierEditorModal(tierId) {
  const workspace = getActiveWorkspace();
  dom.tierIconFile.value = "";
  if (tierId === null) {
    state.isCreatingTier = true;
    state.editingTierId = null;
    state.modalIconValue = "";
    dom.tierModalTitle.textContent = "Add New Tier";
    const nextColor = MATTE_SWATCHES[workspace.tiers.length % MATTE_SWATCHES.length];
    dom.tierNameInput.value = "New Tier";
    setTierModalColor(nextColor);
    dom.tierIconPreset.value = "";
    dom.tierIconUrl.value = "";
    updateTierModalIconPreview("");
  } else {
    const tier = workspace.tiers.find(function findT(t) {
      return t.id === tierId;
    });
    if (!tier) {
      return;
    }
    tier.icon = sanitizeTierIconValue(tier.icon);
    state.isCreatingTier = false;
    state.editingTierId = tier.id;
    state.modalIconValue = tier.icon || "";
    dom.tierModalTitle.textContent = 'Edit Tier "' + tier.name + '"';
    dom.tierNameInput.value = tier.name;
    setTierModalColor(tier.color);

    const matchingPreset = getPresetByValue(tier.icon);
    dom.tierIconPreset.value = matchingPreset ? matchingPreset.value : "";
    dom.tierIconUrl.value = matchingPreset ? "" : (tier.icon || "");
    updateTierModalIconPreview(state.modalIconValue);
  }

  openDialog(dom.tierEditorDialog);
  dom.tierNameInput.focus();
  dom.tierNameInput.select();
}

function handleSaveTierModal(event) {
  event.preventDefault();
  const workspace = getActiveWorkspace();
  const name = dom.tierNameInput.value.trim() || "Untitled";
  const color = dom.tierColorInput.value || "#7d6891";
  let iconValue = sanitizeTierIconValue(state.modalIconValue);
  if (
    iconValue &&
    !extractSymbolLigature(iconValue) &&
    dom.tierIconPreview.getAttribute("src") === PLACEHOLDER_IMAGE_SRC
  ) {
    iconValue = PLACEHOLDER_IMAGE_SRC;
  }

  const matchingPreset = getPresetByValue(iconValue);
  const iconAlt = iconValue
    ? (matchingPreset ? matchingPreset.alt : name + " tier icon")
    : "";

  if (state.isCreatingTier) {
    workspace.tiers.push({
      id: makeId("tier"),
      name: name,
      color: color,
      icon: iconValue,
      iconAlt: iconAlt,
      games: []
    });
    setStatus('Added new tier "' + name + '"');
  } else {
    const tier = workspace.tiers.find(function findT(t) {
      return t.id === state.editingTierId;
    });
    if (tier) {
      tier.name = name;
      tier.color = color;
      tier.icon = iconValue;
      tier.iconAlt = iconAlt;
      setStatus('Updated tier "' + name + '"');
    }
  }

  closeDialog(dom.tierEditorDialog);
  renderWorkspace();
}

/* ==========================================================================
   9. SHARED SEARCH MATCHES RENDERER + CHEAPSHARK GAME SEARCH (GAMES MODE)
   ========================================================================== */
function closeSearchMatches(targetMode) {
  const isMovies = targetMode === "movies";
  const workspace = state.workspaces[isMovies ? "movies" : "games"];
  const feedbackEl = isMovies ? dom.movieSearchFeedback : dom.gameSearchFeedback;
  workspace.searchMatches = [];
  clearToolFeedback(feedbackEl);
  renderModeSearchMatches(isMovies ? "movies" : "games");
}

function renderModeSearchMatches(targetMode) {
  const isMovies = targetMode === "movies";
  const workspace = state.workspaces[isMovies ? "movies" : "games"];
  const listEl = isMovies ? dom.movieMatchesList : dom.gameMatchesList;
  const countEl = isMovies ? dom.movieMatchesCount : dom.gameMatchesCount;
  const panelEl = isMovies ? dom.movieMatchesPanel : dom.gameMatchesPanel;
  const feedbackEl = isMovies ? dom.movieSearchFeedback : dom.gameSearchFeedback;

  listEl.innerHTML = "";
  countEl.textContent = String(workspace.searchMatches.length);

  if (workspace.searchMatches.length === 0) {
    panelEl.hidden = true;
    return;
  }

  panelEl.hidden = false;

  for (let i = 0; i < workspace.searchMatches.length; i += 1) {
    const match = workspace.searchMatches[i];
    const alreadyAdded = isItemAlreadyPresent(workspace, match.id, match.name);

    const li = document.createElement("li");
    li.className = "match-card";

    const thumb = document.createElement("img");
    thumb.className = "match-thumb";
    thumb.alt = match.name;
    thumb.loading = "lazy";
    const onThumbError = attachPosterFallbacks(thumb, match);
    thumb.src = match.imageUrl || PLACEHOLDER_IMAGE_SRC;
    if (thumb.complete && thumb.naturalWidth === 0 && thumb.getAttribute("src") !== PLACEHOLDER_IMAGE_SRC) {
      onThumbError();
    }

    const meta = document.createElement("div");
    meta.className = "match-meta";

    const titleEl = document.createElement("span");
    titleEl.className = "match-name";
    titleEl.textContent = match.name;
    titleEl.title = match.name;

    const dateEl = document.createElement("span");
    dateEl.className = "match-date";
    dateEl.textContent = match.releaseDate ? match.releaseDate : "Release date unavailable";

    const controls = document.createElement("div");
    controls.className = "match-controls";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "ide-btn ide-btn-compact ide-btn-primary";
    addBtn.textContent = alreadyAdded ? "Added" : "Add";
    addBtn.disabled = alreadyAdded;
    addBtn.addEventListener("click", function onAddMatch() {
      const outcome = addItemsToCandidates([match], targetMode);
      if (outcome.addedCount > 0) {
        showToolFeedback(feedbackEl, 'Added "' + match.name + '" poster to Candidates.', "ok");
        setStatus('Added "' + match.name + '" to ' + (isMovies ? "Movies" : "Games") + " Candidates");
      }
      renderModeSearchMatches(targetMode);
    });

    controls.appendChild(addBtn);

    meta.appendChild(titleEl);
    meta.appendChild(dateEl);
    meta.appendChild(controls);

    li.appendChild(thumb);
    li.appendChild(meta);
    listEl.appendChild(li);
  }
}

async function queryCheapSharkGames(searchTerm) {
  const encodedTitle = encodeURIComponent(searchTerm);
  const gamesUrl = API_CONFIG.CHEAPSHARK_GAMES_ENDPOINT + "?title=" + encodedTitle + "&limit=16";
  const dealsUrl = API_CONFIG.CHEAPSHARK_DEALS_ENDPOINT + "?title=" + encodedTitle + "&pageSize=60";

  const responses = await Promise.all([
    fetch(gamesUrl),
    fetch(dealsUrl).catch(function ignoreDealsFailure() {
      return null;
    })
  ]);

  const gamesResponse = responses[0];
  const dealsResponse = responses[1];

  if (!gamesResponse.ok) {
    throw new Error("CheapShark request returned HTTP " + gamesResponse.status + ".");
  }

  const results = await gamesResponse.json();
  if (!Array.isArray(results)) {
    return [];
  }

  const releaseByGameId = new Map();
  const releaseByAppId = new Map();
  const releaseByInternal = new Map();

  if (dealsResponse && dealsResponse.ok) {
    try {
      const deals = await dealsResponse.json();
      if (Array.isArray(deals)) {
        for (let i = 0; i < deals.length; i += 1) {
          const deal = deals[i];
          const ts = Number(deal && deal.releaseDate);
          if (ts > 0) {
            if (deal.gameID && !releaseByGameId.has(String(deal.gameID))) {
              releaseByGameId.set(String(deal.gameID), ts);
            }
            if (deal.steamAppID && !releaseByAppId.has(String(deal.steamAppID))) {
              releaseByAppId.set(String(deal.steamAppID), ts);
            }
            if (deal.internalName && !releaseByInternal.has(String(deal.internalName).toUpperCase())) {
              releaseByInternal.set(String(deal.internalName).toUpperCase(), ts);
            }
          }
        }
      }
    } catch (dealsParseErr) {
      // Release dates remain optional if deals payload cannot be parsed
    }
  }

  return results.map(function mapCheapSharkRecord(item) {
    const title = item.external || "Unknown Title";
    const rawReleaseTs =
      releaseByGameId.get(String(item.gameID)) ||
      (item.steamAppID ? releaseByAppId.get(String(item.steamAppID)) : 0) ||
      (item.internalName ? releaseByInternal.get(String(item.internalName).toUpperCase()) : 0) ||
      Number(item.releaseDate) ||
      0;
    const formattedDate = formatUnixReleaseDate(rawReleaseTs);

    if (item.steamAppID) {
      const urls = gameCoverUrls(item.steamAppID);
      return {
        id: "game-" + item.steamAppID,
        mediaType: "game",
        name: title,
        year: formattedDate,
        releaseDate: formattedDate,
        imageUrl: item.thumb || urls.secondary,
        backupUrl: urls.secondary,
        source: "cheapshark"
      };
    }

    return {
      id: "cs-" + item.gameID,
      mediaType: "game",
      name: title,
      year: formattedDate,
      releaseDate: formattedDate,
      imageUrl: item.thumb || PLACEHOLDER_IMAGE_SRC,
      backupUrl: "",
      source: "cheapshark"
    };
  });
}

async function handleGameSearchSubmit(event) {
  event.preventDefault();
  const query = dom.gameQueryInput.value.trim();
  if (!query) {
    showToolFeedback(dom.gameSearchFeedback, "Enter a video game title to search.", "warn");
    dom.gameQueryInput.focus();
    return;
  }

  dom.gameSearchBtn.disabled = true;
  dom.gameSearchBtn.textContent = "Searching...";

  try {
    const matches = await queryCheapSharkGames(query);
    state.workspaces.games.searchMatches = matches;
    if (matches.length === 0) {
      showToolFeedback(dom.gameSearchFeedback, 'No CheapShark matches found for "' + query + '".', "warn");
    } else {
      showToolFeedback(
        dom.gameSearchFeedback,
        "Found " + matches.length + ' match(es) on CheapShark for "' + query + '". Click Add on any match below.',
        "ok"
      );
    }
    setStatus("CheapShark returned " + matches.length + " game match(es)");
    renderModeSearchMatches("games");
  } catch (err) {
    state.workspaces.games.searchMatches = [];
    renderModeSearchMatches("games");
    showToolFeedback(
      dom.gameSearchFeedback,
      "CheapShark request failed (" + err.message + ").",
      "error"
    );
    setStatus("CheapShark search failed");
  } finally {
    dom.gameSearchBtn.disabled = false;
    dom.gameSearchBtn.textContent = "Search";
  }
}

function handleLoadGameDefaults() {
  const outcome = addItemsToCandidates(DEFAULT_GAME_CATALOG, "games");
  renderModeSearchMatches("games");
  showToolFeedback(
    dom.gameSearchFeedback,
    "Loaded " +
      outcome.addedCount +
      " default game(s) into Candidates" +
      (outcome.skippedCount > 0 ? " (" + outcome.skippedCount + " already present)." : "."),
    "ok"
  );
  setStatus("Loaded " + outcome.addedCount + " default game(s) into Candidates");
}

/* ==========================================================================
   10. TMDB MOVIE SEARCH & 24 RANDOM POPULAR MOVIES (MOVIES MODE)
   ========================================================================== */
async function fetchTmdbJson(endpointPath, paramsObj) {
  const rawCredential = String(API_CONFIG.TMDB_API_KEY || "").trim();
  if (!rawCredential) {
    throw new Error("Missing TMDB API key in API_CONFIG.TMDB_API_KEY.");
  }

  const cleanToken = rawCredential.replace(/^Bearer\s+/i, "").trim();
  const isBearerJwt = cleanToken.indexOf("eyJ") === 0 || cleanToken.split(".").length === 3;

  const pairs = [];
  const keys = Object.keys(paramsObj || {});
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    if (paramsObj[k] !== undefined && paramsObj[k] !== null && paramsObj[k] !== "") {
      pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(paramsObj[k])));
    }
  }

  if (!isBearerJwt) {
    pairs.push("api_key=" + encodeURIComponent(cleanToken));
  }

  const url = API_CONFIG.TMDB_BASE_URL + endpointPath + (pairs.length > 0 ? "?" + pairs.join("&") : "");
  const headers = { Accept: "application/json" };
  if (isBearerJwt) {
    headers.Authorization = "Bearer " + cleanToken;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: headers
  });

  if (!response.ok) {
    throw new Error("TMDB returned HTTP " + response.status + ".");
  }

  return response.json();
}

function mapTmdbMovieRecord(item) {
  const title = String((item && (item.title || item.original_title)) || "Untitled Movie").trim();
  const formattedDate = formatTmdbReleaseDate(item && item.release_date);
  const posterPath = item && item.poster_path ? String(item.poster_path) : "";
  const primaryUrl = posterPath
    ? API_CONFIG.TMDB_IMAGE_BASE + posterPath
    : PLACEHOLDER_IMAGE_SRC;
  const backupUrl = posterPath
    ? API_CONFIG.TMDB_IMAGE_BACKUP_BASE + posterPath
    : "";

  return {
    id: "tmdb-" + item.id,
    mediaType: "movie",
    name: title,
    year: formattedDate,
    releaseDate: formattedDate,
    imageUrl: primaryUrl,
    backupUrl: backupUrl,
    source: "tmdb"
  };
}

async function queryTmdbMovies(searchTerm) {
  const payload = await fetchTmdbJson("/search/movie", {
    query: searchTerm,
    include_adult: "false",
    language: "en-US",
    page: 1
  });

  const results = payload && Array.isArray(payload.results) ? payload.results : [];
  return results.slice(0, 16).map(mapTmdbMovieRecord);
}

async function handleMovieSearchSubmit(event) {
  event.preventDefault();
  const query = dom.movieQueryInput.value.trim();
  if (!query) {
    showToolFeedback(dom.movieSearchFeedback, "Enter a movie title to search.", "warn");
    dom.movieQueryInput.focus();
    return;
  }

  dom.movieSearchBtn.disabled = true;
  dom.movieSearchBtn.textContent = "Searching...";

  try {
    const matches = await queryTmdbMovies(query);
    state.workspaces.movies.searchMatches = matches;
    if (matches.length === 0) {
      showToolFeedback(dom.movieSearchFeedback, 'No TMDB matches found for "' + query + '".', "warn");
    } else {
      showToolFeedback(
        dom.movieSearchFeedback,
        "Found " + matches.length + ' match(es) on TMDB for "' + query + '". Click Add on any match below.',
        "ok"
      );
    }
    setStatus("TMDB returned " + matches.length + " movie match(es)");
    renderModeSearchMatches("movies");
  } catch (err) {
    state.workspaces.movies.searchMatches = [];
    renderModeSearchMatches("movies");
    showToolFeedback(
      dom.movieSearchFeedback,
      "TMDB request failed (" + err.message + ").",
      "error"
    );
    setStatus("TMDB search failed");
  } finally {
    dom.movieSearchBtn.disabled = false;
    dom.movieSearchBtn.textContent = "Search";
  }
}

async function fetchRandomPopularTmdbMovies(count) {
  const targetCount = count || 24;
  const pagePool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = pagePool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = pagePool[i];
    pagePool[i] = pagePool[j];
    pagePool[j] = swap;
  }

  // Query 3 random popular pages (up to 60 popular movies) and pick 24 at random
  const chosenPages = pagePool.slice(0, 3);
  const payloads = await Promise.all(
    chosenPages.map(function requestPopularPage(pageNumber) {
      return fetchTmdbJson("/movie/popular", {
        language: "en-US",
        page: pageNumber
      });
    })
  );

  const seenIds = new Set();
  const mappedPool = [];
  for (let p = 0; p < payloads.length; p += 1) {
    const list = payloads[p] && Array.isArray(payloads[p].results) ? payloads[p].results : [];
    for (let m = 0; m < list.length; m += 1) {
      const rawMovie = list[m];
      if (rawMovie && rawMovie.id && !seenIds.has(rawMovie.id)) {
        seenIds.add(rawMovie.id);
        mappedPool.push(mapTmdbMovieRecord(rawMovie));
      }
    }
  }

  for (let k = mappedPool.length - 1; k > 0; k -= 1) {
    const r = Math.floor(Math.random() * (k + 1));
    const tmp = mappedPool[k];
    mappedPool[k] = mappedPool[r];
    mappedPool[r] = tmp;
  }

  const moviesWs = state.workspaces.movies;
  const unseen = [];
  const alreadyPresent = [];
  for (let n = 0; n < mappedPool.length; n += 1) {
    if (isItemAlreadyPresent(moviesWs, mappedPool[n].id, mappedPool[n].name)) {
      alreadyPresent.push(mappedPool[n]);
    } else {
      unseen.push(mappedPool[n]);
    }
  }

  return unseen.concat(alreadyPresent).slice(0, targetCount);
}

async function handleLoadMovieDefaults() {
  dom.loadMovieDefaultsBtn.disabled = true;
  dom.loadMovieDefaultsBtn.textContent = "Loading...";

  try {
    const randomPopularMovies = await fetchRandomPopularTmdbMovies(24);
    if (randomPopularMovies.length === 0) {
      showToolFeedback(dom.movieSearchFeedback, "TMDB returned 0 popular movies.", "warn");
      setStatus("TMDB returned 0 popular movies");
      return;
    }

    const outcome = addItemsToCandidates(randomPopularMovies, "movies");
    renderModeSearchMatches("movies");
    showToolFeedback(
      dom.movieSearchFeedback,
      "Loaded " +
        outcome.addedCount +
        " random popular movie(s) from TMDB into Candidates" +
        (outcome.skippedCount > 0 ? " (" + outcome.skippedCount + " already present)." : "."),
      "ok"
    );
    setStatus("Loaded " + outcome.addedCount + " random popular movie(s) from TMDB");
  } catch (err) {
    showToolFeedback(
      dom.movieSearchFeedback,
      "TMDB Load Defaults failed (" + err.message + ").",
      "error"
    );
    setStatus("TMDB Load Defaults failed");
  } finally {
    dom.loadMovieDefaultsBtn.disabled = false;
    dom.loadMovieDefaultsBtn.textContent = "Load Defaults";
  }
}

/* ==========================================================================
   11. LOCALSTORAGE PERSISTENCE (SAVE & LOAD MODE-TAGGED TIER LISTS)
   ========================================================================== */
function readSavedTierLists() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SAVED_LISTS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function writeSavedTierLists(listsArray) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.SAVED_LISTS, JSON.stringify(listsArray));
    return true;
  } catch (err) {
    setStatus("localStorage write failed (storage quota exceeded or blocked)");
    return false;
  }
}

function sanitizeItemsForMode(itemsArray, modeKey) {
  if (!Array.isArray(itemsArray)) {
    return [];
  }
  const requiredType = expectedMediaTypeForMode(modeKey);
  const clean = [];
  for (let i = 0; i < itemsArray.length; i += 1) {
    const item = itemsArray[i];
    if (!item) {
      continue;
    }
    if (item.mediaType && item.mediaType !== requiredType) {
      continue;
    }
    clean.push({
      id: item.id || makeId(requiredType),
      mediaType: requiredType,
      name: String(item.name || "Untitled"),
      year: item.year ? String(item.year) : "",
      releaseDate: item.releaseDate ? String(item.releaseDate) : "",
      imageUrl: item.imageUrl || PLACEHOLDER_IMAGE_SRC,
      backupUrl: item.backupUrl || "",
      source: item.source || modeKey
    });
  }
  return clean;
}

function cloneSerializableState(customTitle, forceNewSlot) {
  const workspace = getActiveWorkspace();
  const cleanTitle =
    String(customTitle || workspace.title || defaultTitleForMode(state.mode)).trim() ||
    defaultTitleForMode(state.mode);
  const shouldReuseSlot =
    !forceNewSlot &&
    Boolean(workspace.activeSlotId) &&
    workspace.lastSavedTitle === cleanTitle;

  const slotId = shouldReuseSlot ? workspace.activeSlotId : makeId("slot");
  return {
    slotId: slotId,
    mediaMode: state.mode,
    title: cleanTitle,
    orientation: workspace.orientation,
    tiers: JSON.parse(JSON.stringify(workspace.tiers)),
    candidates: JSON.parse(JSON.stringify(workspace.candidates)),
    updatedAt: new Date().toISOString()
  };
}

function saveCurrentTierList(customTitle, forceNewSlot) {
  const workspace = getActiveWorkspace();
  const snapshot = cloneSerializableState(customTitle, forceNewSlot);
  const lists = readSavedTierLists();
  const existingIdx = lists.findIndex(function findSlot(item) {
    return item.slotId === snapshot.slotId;
  });

  if (existingIdx !== -1) {
    lists[existingIdx] = snapshot;
  } else {
    lists.unshift(snapshot);
  }

  if (writeSavedTierLists(lists)) {
    workspace.activeSlotId = snapshot.slotId;
    workspace.lastSavedTitle = snapshot.title;
    workspace.title = snapshot.title;
    setStatus('Saved ' + state.mode + ' tier list "' + snapshot.title + '" to localStorage');
    renderWorkspace();
    renderSavedListsModal();
  }
}

function loadSavedTierListById(slotId) {
  const lists = readSavedTierLists();
  const found = lists.find(function findSlot(item) {
    return item.slotId === slotId;
  });
  if (!found) {
    setStatus("Requested saved tier list could not be found");
    return;
  }

  const slotMode = found.mediaMode === "movies" ? "movies" : "games";
  const targetWorkspace = state.workspaces[slotMode];

  const loadedTiers = Array.isArray(found.tiers) && found.tiers.length > 0
    ? found.tiers.map(function sanitizeTier(tier) {
        return {
          id: tier.id || makeId("tier"),
          name: String(tier.name || "Tier"),
          color: tier.color || "#7d6891",
          icon: sanitizeTierIconValue(tier.icon),
          iconAlt: tier.iconAlt || "",
          games: sanitizeItemsForMode(tier.games, slotMode)
        };
      })
    : createDefaultTiers();

  targetWorkspace.activeSlotId = found.slotId;
  targetWorkspace.lastSavedTitle = found.title;
  targetWorkspace.title = found.title || defaultTitleForMode(slotMode);
  targetWorkspace.orientation = found.orientation === "vertical" ? "vertical" : "horizontal";
  targetWorkspace.tiers = loadedTiers;
  targetWorkspace.candidates = sanitizeItemsForMode(found.candidates, slotMode);
  targetWorkspace.candidateFilter = "";

  state.mode = slotMode;
  dragContext = null;

  closeDialog(dom.storageDialog);
  setStatus('Loaded ' + slotMode + ' tier list "' + targetWorkspace.title + '" from localStorage');
  renderWorkspace();
}

function deleteSavedTierListById(slotId) {
  const lists = readSavedTierLists();
  const target = lists.find(function findSlot(item) {
    return item.slotId === slotId;
  });
  const filtered = lists.filter(function keepOther(item) {
    return item.slotId !== slotId;
  });

  if (writeSavedTierLists(filtered)) {
    const modeKeys = ["games", "movies"];
    for (let i = 0; i < modeKeys.length; i += 1) {
      const ws = state.workspaces[modeKeys[i]];
      if (ws.activeSlotId === slotId) {
        ws.activeSlotId = null;
        ws.lastSavedTitle = null;
      }
    }
    if (target) {
      setStatus('Deleted saved list "' + target.title + '" from localStorage');
    }
    renderWorkspace();
    renderSavedListsModal();
  }
}

function renderSavedListsModal() {
  const activeWs = getActiveWorkspace();
  const lists = readSavedTierLists();
  dom.savedListsUl.innerHTML = "";
  dom.savedListsEmpty.hidden = lists.length > 0;

  for (let i = 0; i < lists.length; i += 1) {
    const slot = lists[i];
    const slotMode = slot.mediaMode === "movies" ? "movies" : "games";
    const sameMode = slotMode === state.mode;
    const isActive = sameMode && slot.slotId === activeWs.activeSlotId;

    const li = document.createElement("li");
    li.className = "saved-slot-item" + (isActive ? " is-active-slot" : "");

    const info = document.createElement("div");
    info.className = "saved-slot-info";

    const titleEl = document.createElement("span");
    titleEl.className = "saved-slot-title";
    titleEl.textContent = slot.title;

    let rankedCount = 0;
    const tierCount = Array.isArray(slot.tiers) ? slot.tiers.length : 0;
    if (Array.isArray(slot.tiers)) {
      for (let t = 0; t < slot.tiers.length; t += 1) {
        rankedCount += Array.isArray(slot.tiers[t].games) ? slot.tiers[t].games.length : 0;
      }
    }
    const candCount = Array.isArray(slot.candidates) ? slot.candidates.length : 0;
    const savedDate = slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : "Unknown date";

    const metaEl = document.createElement("span");
    metaEl.className = "saved-slot-meta";
    metaEl.textContent =
      slotMode.toUpperCase() +
      " | " +
      tierCount +
      " tiers | " +
      rankedCount +
      " ranked | " +
      candCount +
      " candidates | " +
      (slot.orientation || "horizontal") +
      " | Saved: " +
      savedDate;

    info.appendChild(titleEl);
    info.appendChild(metaEl);

    const actions = document.createElement("div");
    actions.className = "saved-slot-actions";

    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "ide-btn ide-btn-compact ide-btn-primary";
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", function onLoadSlot() {
      loadSavedTierListById(slot.slotId);
    });

    const overwriteBtn = document.createElement("button");
    overwriteBtn.type = "button";
    overwriteBtn.className = "ide-btn ide-btn-compact";
    overwriteBtn.textContent = "Overwrite";
    overwriteBtn.disabled = !sameMode;
    overwriteBtn.title = sameMode
      ? "Overwrite this slot with the current " + state.mode + " workspace"
      : "Cannot overwrite a " + slotMode + " list while in " + state.mode + " mode";
    overwriteBtn.addEventListener("click", function onOverwriteSlot() {
      if (slotMode !== state.mode) {
        return;
      }
      activeWs.activeSlotId = slot.slotId;
      activeWs.lastSavedTitle = activeWs.title;
      saveCurrentTierList(activeWs.title, false);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "ide-btn ide-btn-compact";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", function onDeleteSlot() {
      deleteSavedTierListById(slot.slotId);
    });

    actions.appendChild(loadBtn);
    actions.appendChild(overwriteBtn);
    actions.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(actions);
    dom.savedListsUl.appendChild(li);
  }
}

/* ==========================================================================
   12. MODE, THEME & ORIENTATION SWITCHING + EVENT WIRING
   ========================================================================== */
function loadInitialTheme() {
  try {
    const savedTheme = window.localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === "light" || savedTheme === "dark") {
      state.theme = savedTheme;
    }
  } catch (err) {
    state.theme = "dark";
  }
}

function toggleMode() {
  state.mode = state.mode === "games" ? "movies" : "games";
  dragContext = null;
  clearDragHighlights();
  setStatus(
    state.mode === "movies"
      ? "Switched to MOVIES mode"
      : "Switched to GAMES mode"
  );
  renderWorkspace();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  try {
    window.localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
  } catch (err) {
    // Ignore storage restriction on theme preference
  }
  setStatus("Switched color mode to " + state.theme.toUpperCase());
  renderWorkspace();
}

function toggleOrientation() {
  const workspace = getActiveWorkspace();
  workspace.orientation = workspace.orientation === "horizontal" ? "vertical" : "horizontal";
  setStatus(
    workspace.orientation === "horizontal"
      ? "Switched to HORIZONTAL layout"
      : "Switched to VERTICAL layout"
  );
  renderWorkspace();
}

function resetToDefaultTemplate() {
  const workspace = getActiveWorkspace();
  workspace.activeSlotId = null;
  workspace.lastSavedTitle = null;
  workspace.title = defaultTitleForMode(state.mode);
  workspace.orientation = "horizontal";
  workspace.tiers = createDefaultTiers();
  workspace.candidates = [];
  workspace.candidateFilter = "";
  workspace.searchMatches = [];
  dom.candidatesFilterInput.value = "";
  clearToolFeedback(state.mode === "movies" ? dom.movieSearchFeedback : dom.gameSearchFeedback);
  setStatus("Reset " + state.mode + " workspace to default A-F template (Horizontal)");
  renderWorkspace();
}

function bindEvents() {
  // Top toolbar switches & actions
  dom.modeSwitch.addEventListener("click", toggleMode);
  dom.orientationSwitch.addEventListener("click", toggleOrientation);
  dom.themeSwitch.addEventListener("click", toggleTheme);

  dom.addTierBtn.addEventListener("click", function onAddTier() {
    openTierEditorModal(null);
  });

  dom.saveTierlistForm.addEventListener("submit", function onSubmitSave(event) {
    event.preventDefault();
    saveCurrentTierList(getActiveWorkspace().title, false);
  });

  dom.openStorageBtn.addEventListener("click", function onOpenStorage() {
    dom.saveAsNameInput.value = getActiveWorkspace().title;
    renderSavedListsModal();
    openDialog(dom.storageDialog);
  });

  dom.newTemplateBtn.addEventListener("click", resetToDefaultTemplate);

  // Editable list title
  dom.tierlistTitle.addEventListener("input", function onTitleInput() {
    const workspace = getActiveWorkspace();
    workspace.title = dom.tierlistTitle.value;
    dom.srDocumentHeading.textContent = workspace.title || defaultTitleForMode(state.mode);
    document.title = (workspace.title || defaultTitleForMode(state.mode)) + " // Strata";
  });

  dom.tierlistTitle.addEventListener("blur", function onTitleBlur() {
    const workspace = getActiveWorkspace();
    if (!dom.tierlistTitle.value.trim()) {
      workspace.title = defaultTitleForMode(state.mode);
      dom.tierlistTitle.value = workspace.title;
      renderMetricsAndChrome();
    }
  });

  // CheapShark game search & Load Defaults (Games mode)
  dom.gameSearchForm.addEventListener("submit", handleGameSearchSubmit);
  wireSearchClearButton(dom.gameQueryInput, dom.clearGameQueryBtn);
  dom.loadGameDefaultsBtn.addEventListener("click", handleLoadGameDefaults);
  dom.closeGameMatchesBtn.addEventListener("click", function onCloseGameMatches() {
    closeSearchMatches("games");
  });

  // TMDB movie search & Load Defaults (Movies mode)
  dom.movieSearchForm.addEventListener("submit", handleMovieSearchSubmit);
  wireSearchClearButton(dom.movieQueryInput, dom.clearMovieQueryBtn);
  dom.loadMovieDefaultsBtn.addEventListener("click", handleLoadMovieDefaults);
  dom.closeMovieMatchesBtn.addEventListener("click", function onCloseMovieMatches() {
    closeSearchMatches("movies");
  });

  // Candidate pool dropzone & filter
  bindDropZoneEvents(dom.candidatesDropzone, "candidates", null);

  dom.candidatesFilterInput.addEventListener("input", function onFilterInput() {
    getActiveWorkspace().candidateFilter = dom.candidatesFilterInput.value;
    renderCandidates();
  });
  wireSearchClearButton(dom.candidatesFilterInput, dom.clearCandidatesFilterBtn, function onClearCandidateFilter() {
    getActiveWorkspace().candidateFilter = "";
    renderCandidates();
  });

  dom.clearCandidatesBtn.addEventListener("click", function onClearCandidates() {
    const workspace = getActiveWorkspace();
    const count = workspace.candidates.length;
    if (count === 0) {
      return;
    }
    workspace.candidates = [];
    workspace.candidateFilter = "";
    dom.candidatesFilterInput.value = "";
    setStatus("Cleared " + count + " candidate poster(s)");
    renderWorkspace();
    renderModeSearchMatches(state.mode);
  });

  // Tier editor modal events
  dom.tierEditorForm.addEventListener("submit", handleSaveTierModal);
  dom.closeTierModalBtn.addEventListener("click", function onCloseTierModal() {
    closeDialog(dom.tierEditorDialog);
  });
  dom.cancelTierModalBtn.addEventListener("click", function onCancelTierModal() {
    closeDialog(dom.tierEditorDialog);
  });

  dom.tierColorInput.addEventListener("input", function onColorPick() {
    setTierModalColor(dom.tierColorInput.value);
  });

  dom.tierIconPreset.addEventListener("change", function onPresetIconChange() {
    state.modalIconValue = dom.tierIconPreset.value;
    dom.tierIconUrl.value = "";
    dom.tierIconFile.value = "";
    updateTierModalIconPreview(state.modalIconValue);
  });

  dom.tierIconUrl.addEventListener("input", function onCustomIconUrl() {
    const val = dom.tierIconUrl.value.trim();
    state.modalIconValue = val;
    const matching = getPresetByValue(val);
    dom.tierIconPreset.value = matching ? matching.value : "";
    dom.tierIconFile.value = "";
    updateTierModalIconPreview(state.modalIconValue);
  });

  dom.tierIconFile.addEventListener("change", function onIconFileSelected() {
    const file = dom.tierIconFile.files && dom.tierIconFile.files[0];
    if (!file) {
      return;
    }
    if (file.type && file.type.indexOf("image/") !== 0) {
      state.modalIconValue = PLACEHOLDER_IMAGE_SRC;
      dom.tierIconPreset.value = "";
      dom.tierIconUrl.value = "";
      updateTierModalIconPreview(PLACEHOLDER_IMAGE_SRC);
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", function onFileRead() {
      if (typeof reader.result === "string") {
        state.modalIconValue = reader.result;
        dom.tierIconPreset.value = "";
        dom.tierIconUrl.value = "";
        updateTierModalIconPreview(state.modalIconValue);
      }
    });
    reader.addEventListener("error", function onFileReadError() {
      state.modalIconValue = PLACEHOLDER_IMAGE_SRC;
      dom.tierIconPreset.value = "";
      dom.tierIconUrl.value = "";
      updateTierModalIconPreview(PLACEHOLDER_IMAGE_SRC);
    });
    reader.readAsDataURL(file);
  });

  dom.tierIconPreview.addEventListener("error", function onTierIconPreviewError() {
    if (dom.tierIconPreview.hidden || !state.modalIconValue || extractSymbolLigature(state.modalIconValue)) {
      return;
    }
    const brokenSrc = dom.tierIconPreview.getAttribute("src") || state.modalIconValue;
    if (brokenSrc && brokenSrc !== PLACEHOLDER_IMAGE_SRC) {
      failedImageUrls.add(brokenSrc);
    }
    state.modalIconValue = PLACEHOLDER_IMAGE_SRC;
    if (dom.tierIconPreview.getAttribute("src") !== PLACEHOLDER_IMAGE_SRC) {
      dom.tierIconPreview.src = PLACEHOLDER_IMAGE_SRC;
    }
  });

  dom.clearTierIconBtn.addEventListener("click", function onClearIcon() {
    state.modalIconValue = "";
    dom.tierIconPreset.value = "";
    dom.tierIconUrl.value = "";
    dom.tierIconFile.value = "";
    updateTierModalIconPreview("");
  });

  // Storage dialog events
  dom.closeStorageModalBtn.addEventListener("click", function onCloseStorage() {
    closeDialog(dom.storageDialog);
  });
  dom.doneStorageModalBtn.addEventListener("click", function onDoneStorage() {
    closeDialog(dom.storageDialog);
  });
  dom.saveCopyForm.addEventListener("submit", function onSaveCopySubmit(event) {
    event.preventDefault();
    const workspace = getActiveWorkspace();
    const slotTitle = dom.saveAsNameInput.value.trim() || workspace.title;
    saveCurrentTierList(slotTitle, true);
  });
}

/* ==========================================================================
   13. BOOTSTRAP
   ========================================================================== */
function init() {
  cacheDom();
  loadInitialTheme();
  initTierEditorControls();
  bindEvents();
  renderWorkspace();
}

document.addEventListener("DOMContentLoaded", init);
