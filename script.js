"use strict";

/* ==========================================================================
   1. API & PLACEHOLDER ASSET CONFIGURATION
   Replace the placeholder strings below with your own credentials and assets.
   ========================================================================== */
const API_CONFIG = {
  // IGDB v4 (Twitch Developer Portal Client ID & Client Secret)
  IGDB_CLIENT_ID: "PLACEHOLDER_IGDB_CLIENT_ID",
  IGDB_CLIENT_SECRET: "PLACEHOLDER_IGDB_CLIENT_SECRET",
  // Optional: If you already have an OAuth Bearer token, paste it here; otherwise leave ""
  IGDB_ACCESS_TOKEN: "",

  // Steam Web API Key (https://steamcommunity.com/dev/apikey)
  STEAM_API_KEY: "PLACEHOLDER_STEAM_API_KEY",

  // Optional static-site CORS proxy fallback.
  // Direct fetch() is always tried first; if the browser blocks cross-origin headers,
  // requests automatically retry using this prefix when non-empty.
  CORS_PROXY: "https://corsproxy.io/?url="
};

const ICON_PLACEHOLDERS = {
  // Placeholder image path used when a game record has no cover artwork
  FALLBACK_POSTER: "placeholders/default-game-poster.png",

  // Optional preset icons selectable when editing any tier row
  TIER_PRESETS: [
    { id: "none", label: "None (Text Label Only)", src: "", alt: "" },
    { id: "score", label: "Full Conductor Score [Placeholder]", src: "placeholders/icon-score.png", alt: "Conductor score icon" },
    { id: "leitmotif", label: "Leitmotif Theme [Placeholder]", src: "placeholders/icon-leitmotif.png", alt: "Leitmotif icon" },
    { id: "adaptive", label: "Adaptive Cue Matrix [Placeholder]", src: "placeholders/icon-adaptive.png", alt: "Adaptive cue icon" },
    { id: "orchestra", label: "Orchestral Ensemble [Placeholder]", src: "placeholders/icon-orchestra.png", alt: "Orchestral ensemble icon" },
    { id: "synth", label: "Modular Synthesizer [Placeholder]", src: "placeholders/icon-synth.png", alt: "Modular synthesizer icon" },
    { id: "ambient", label: "Ambient Soundscape [Placeholder]", src: "placeholders/icon-ambient.png", alt: "Ambient soundscape icon" }
  ]
};

/* ==========================================================================
   2. MATTE PALETTE, DEFAULT A-F TEMPLATE & DEFAULT COMPOSER GAME CATALOG
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

function steamPosterUrls(appId) {
  return {
    primary: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/" + appId + "/library_600x900.jpg",
    secondary: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/header.jpg"
  };
}

// Default reference games (renowned game scores) used as fallback for private Steam profiles
// and offline testing prior to adding IGDB / Steam API keys.
const DEFAULT_COMPOSER_CATALOG = [
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
  const urls = steamPosterUrls(entry.appId);
  return {
    id: "steam-" + entry.appId,
    name: entry.name,
    year: entry.year,
    imageUrl: urls.primary,
    backupUrl: urls.secondary,
    source: "default"
  };
});

/* ==========================================================================
   3. APPLICATION STATE & STORAGE KEYS
   ========================================================================== */
const STORAGE_KEYS = {
  SAVED_LISTS: "cuetier_saved_tierlists_v1",
  THEME: "cuetier_theme_mode_v1"
};

const state = {
  activeSlotId: null,
  lastSavedTitle: null,
  title: "Video Game Score Tier List",
  orientation: "vertical",
  theme: "dark",
  tiers: createDefaultTiers(),
  candidates: [],
  candidateFilter: "",
  searchMatches: [],
  selectedMatchIds: new Set(),
  editingRowId: null,
  isCreatingRow: false,
  igdbTokenCache: {
    token: "",
    expiresAt: 0
  }
};

let dragContext = null;

/* ==========================================================================
   4. DOM REFERENCES
   ========================================================================== */
const dom = {};

function cacheDom() {
  dom.html = document.documentElement;
  dom.workspaceMain = document.getElementById("workspace-main");
  dom.orientationSwitch = document.getElementById("orientation-switch");
  dom.orientationLabel = document.getElementById("orientation-label");
  dom.themeSwitch = document.getElementById("theme-switch");
  dom.themeLabel = document.getElementById("theme-label");
  dom.addRowBtn = document.getElementById("add-row-btn");
  dom.saveTierlistForm = document.getElementById("save-tierlist-form");
  dom.openStorageBtn = document.getElementById("open-storage-btn");
  dom.savedCount = document.getElementById("saved-count");
  dom.newTemplateBtn = document.getElementById("new-template-btn");

  dom.igdbSearchForm = document.getElementById("igdb-search-form");
  dom.igdbQueryInput = document.getElementById("igdb-query-input");
  dom.igdbSearchBtn = document.getElementById("igdb-search-btn");
  dom.igdbFeedback = document.getElementById("igdb-feedback");
  dom.igdbMatchesPanel = document.getElementById("igdb-matches-panel");
  dom.matchesCount = document.getElementById("matches-count");
  dom.selectedMatchesCount = document.getElementById("selected-matches-count");
  dom.confirmSelectedMatchesBtn = document.getElementById("confirm-selected-matches-btn");
  dom.closeMatchesBtn = document.getElementById("close-matches-btn");
  dom.igdbMatchesList = document.getElementById("igdb-matches-list");

  dom.steamImportForm = document.getElementById("steam-import-form");
  dom.steamLinkInput = document.getElementById("steam-link-input");
  dom.steamImportBtn = document.getElementById("steam-import-btn");
  dom.loadDefaultsBtn = document.getElementById("load-defaults-btn");
  dom.steamFeedback = document.getElementById("steam-feedback");

  dom.srDocumentHeading = document.getElementById("sr-document-heading");
  dom.tierlistTitle = document.getElementById("tierlist-title");
  dom.tierRowsList = document.getElementById("tier-rows-list");

  dom.candidatesCount = document.getElementById("candidates-count");
  dom.candidatesFilterInput = document.getElementById("candidates-filter-input");
  dom.clearCandidatesBtn = document.getElementById("clear-candidates-btn");
  dom.candidatesDropzone = document.getElementById("candidates-dropzone");
  dom.candidatesList = document.getElementById("candidates-list");
  dom.candidatesEmptyMsg = document.getElementById("candidates-empty-msg");

  dom.rowEditorDialog = document.getElementById("row-editor-dialog");
  dom.rowEditorForm = document.getElementById("row-editor-form");
  dom.rowModalTitle = document.getElementById("row-modal-title");
  dom.closeRowModalBtn = document.getElementById("close-row-modal-btn");
  dom.cancelRowModalBtn = document.getElementById("cancel-row-modal-btn");
  dom.rowNameInput = document.getElementById("row-name-input");
  dom.rowColorInput = document.getElementById("row-color-input");
  dom.rowColorHex = document.getElementById("row-color-hex");
  dom.matteSwatches = document.getElementById("matte-swatches");
  dom.rowIconPreset = document.getElementById("row-icon-preset");
  dom.rowIconUrl = document.getElementById("row-icon-url");
  dom.rowIconFile = document.getElementById("row-icon-file");
  dom.rowIconPreview = document.getElementById("row-icon-preview");
  dom.rowIconNone = document.getElementById("row-icon-none");
  dom.clearRowIconBtn = document.getElementById("clear-row-icon-btn");

  dom.storageDialog = document.getElementById("storage-dialog");
  dom.closeStorageModalBtn = document.getElementById("close-storage-modal-btn");
  dom.doneStorageModalBtn = document.getElementById("done-storage-modal-btn");
  dom.saveCopyForm = document.getElementById("save-copy-form");
  dom.saveAsNameInput = document.getElementById("save-as-name-input");
  dom.savedListsUl = document.getElementById("saved-lists-ul");
  dom.savedListsEmpty = document.getElementById("saved-lists-empty");

  dom.statusMessage = document.getElementById("status-message");
  dom.statusOrientation = document.getElementById("status-orientation");
  dom.statusTierCount = document.getElementById("status-tier-count");
  dom.statusRankedCount = document.getElementById("status-ranked-count");
  dom.statusCandidateCount = document.getElementById("status-candidate-count");
  dom.statusApiKeys = document.getElementById("status-api-keys");
}

/* ==========================================================================
   5. UTILITY HELPERS (CONTRAST, PLACEHOLDER FALLBACKS, CREDENTIAL CHECKS)
   ========================================================================== */
function makeId(prefix) {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function isPlaceholderValue(val) {
  if (!val || typeof val !== "string") {
    return true;
  }
  const trimmed = val.trim();
  return trimmed === "" || trimmed.indexOf("PLACEHOLDER_") === 0 || trimmed.indexOf("YOUR_") === 0;
}

function hasIgdbCredentials() {
  if (!isPlaceholderValue(API_CONFIG.IGDB_CLIENT_ID) && !isPlaceholderValue(API_CONFIG.IGDB_ACCESS_TOKEN)) {
    return true;
  }
  return !isPlaceholderValue(API_CONFIG.IGDB_CLIENT_ID) && !isPlaceholderValue(API_CONFIG.IGDB_CLIENT_SECRET);
}

function hasSteamCredentials() {
  return !isPlaceholderValue(API_CONFIG.STEAM_API_KEY);
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

function escapeXml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildPosterFallbackDataUri(gameTitle) {
  const safeTitle = String(gameTitle || "Game").slice(0, 42);
  const words = safeTitle.split(/\s+/);
  const lines = [];
  let current = "";

  for (let i = 0; i < words.length; i += 1) {
    const candidate = current ? current + " " + words[i] : words[i];
    if (candidate.length <= 13 || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
    if (lines.length === 4) {
      break;
    }
  }
  if (current && lines.length < 4) {
    lines.push(current);
  }

  const textNodes = lines
    .map(function renderLine(line, index) {
      const y = 78 + index * 22;
      return '<text x="90" y="' + y + '" text-anchor="middle" fill="#fffff0" font-family="sans-serif" font-size="14" font-weight="600">' + escapeXml(line) + "</text>";
    })
    .join("");

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="252" viewBox="0 0 180 252">' +
    '<rect width="180" height="252" fill="#2e2c3b"/>' +
    '<rect x="6" y="6" width="168" height="240" fill="none" stroke="#5d5878" stroke-width="2"/>' +
    textNodes +
    '<text x="90" y="228" text-anchor="middle" fill="#fc9928" font-family="monospace" font-size="11">[POSTER]</text>' +
    "</svg>";

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function buildIconFallbackDataUri(label) {
  const tag = String(label || "ICON")
    .replace(/\[Placeholder\]/gi, "")
    .trim()
    .slice(0, 4)
    .toUpperCase() || "ICO";

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" fill="#252a36"/>' +
    '<rect x="3" y="3" width="58" height="58" fill="none" stroke="#fc9928" stroke-width="2"/>' +
    '<text x="32" y="37" text-anchor="middle" fill="#fffff0" font-family="monospace" font-size="15" font-weight="700">' +
    escapeXml(tag) +
    "</text>" +
    "</svg>";

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function attachPosterFallbacks(imgEl, game) {
  let stage = 0;
  imgEl.addEventListener("error", function handlePosterError() {
    if (stage === 0 && game.backupUrl && imgEl.src !== game.backupUrl) {
      stage = 1;
      imgEl.src = game.backupUrl;
      return;
    }
    if (stage <= 1 && ICON_PLACEHOLDERS.FALLBACK_POSTER && game.imageUrl !== ICON_PLACEHOLDERS.FALLBACK_POSTER) {
      stage = 2;
      imgEl.dataset.placeholderSlot = ICON_PLACEHOLDERS.FALLBACK_POSTER;
      imgEl.src = ICON_PLACEHOLDERS.FALLBACK_POSTER;
      return;
    }
    if (stage <= 2) {
      stage = 3;
      imgEl.src = buildPosterFallbackDataUri(game.name);
    }
  });
}

function attachRowIconFallback(imgEl, labelText, originalSrc) {
  let handled = false;
  if (originalSrc) {
    imgEl.dataset.placeholderSlot = originalSrc;
  }
  imgEl.addEventListener("error", function handleIconError() {
    if (!handled) {
      handled = true;
      imgEl.src = buildIconFallbackDataUri(labelText);
    }
  });
}

function setStatus(message) {
  dom.statusMessage.textContent = message;
}

function showToolFeedback(element, message, level) {
  if (!message) {
    element.hidden = true;
    element.textContent = "";
    return;
  }
  element.textContent = message;
  element.dataset.level = level || "info";
  element.hidden = false;
}

function openDialog(dialogEl) {
  if (typeof dialogEl.showModal === "function") {
    if (!dialogEl.open) {
      dialogEl.showModal();
    }
  } else {
    dialogEl.setAttribute("open", "");
  }
}

function closeDialog(dialogEl) {
  if (typeof dialogEl.close === "function" && dialogEl.open) {
    dialogEl.close();
  } else {
    dialogEl.removeAttribute("open");
  }
}

async function fetchWithCorsFallback(url, options) {
  try {
    return await fetch(url, options);
  } catch (directErr) {
    if (API_CONFIG.CORS_PROXY && API_CONFIG.CORS_PROXY.trim() !== "") {
      const proxiedUrl = API_CONFIG.CORS_PROXY + encodeURIComponent(url);
      return await fetch(proxiedUrl, options);
    }
    throw directErr;
  }
}

/* ==========================================================================
   6. GAME POOL MANAGEMENT (DEDUPLICATION & MOVES)
   ========================================================================== */
function isGameAlreadyPresent(gameId, gameName) {
  const normalizedName = String(gameName || "").trim().toLowerCase();
  const inCandidates = state.candidates.some(function checkCandidate(g) {
    return g.id === gameId || g.name.trim().toLowerCase() === normalizedName;
  });
  if (inCandidates) {
    return true;
  }
  return state.tiers.some(function checkTier(tier) {
    return tier.games.some(function checkRanked(g) {
      return g.id === gameId || g.name.trim().toLowerCase() === normalizedName;
    });
  });
}

function addGamesToCandidates(gamesArray) {
  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < gamesArray.length; i += 1) {
    const raw = gamesArray[i];
    const cleanGame = {
      id: raw.id || makeId("game"),
      name: String(raw.name || "Untitled Game").trim(),
      year: raw.year ? String(raw.year) : "",
      imageUrl: raw.imageUrl || ICON_PLACEHOLDERS.FALLBACK_POSTER,
      backupUrl: raw.backupUrl || "",
      source: raw.source || "manual"
    };

    if (isGameAlreadyPresent(cleanGame.id, cleanGame.name)) {
      skippedCount += 1;
    } else {
      state.candidates.push(cleanGame);
      addedCount += 1;
    }
  }

  renderWorkspace();
  return { addedCount: addedCount, skippedCount: skippedCount };
}

function extractGameById(gameId) {
  const candIdx = state.candidates.findIndex(function findCand(g) {
    return g.id === gameId;
  });
  if (candIdx !== -1) {
    return state.candidates.splice(candIdx, 1)[0];
  }

  for (let t = 0; t < state.tiers.length; t += 1) {
    const tier = state.tiers[t];
    const gameIdx = tier.games.findIndex(function findInTier(g) {
      return g.id === gameId;
    });
    if (gameIdx !== -1) {
      return tier.games.splice(gameIdx, 1)[0];
    }
  }
  return null;
}

function moveGameToDestination(gameId, destinationType, destinationTierId, beforeGameId) {
  const game = extractGameById(gameId);
  if (!game) {
    return;
  }

  if (destinationType === "candidates") {
    if (beforeGameId) {
      const targetIdx = state.candidates.findIndex(function findTarget(g) {
        return g.id === beforeGameId;
      });
      if (targetIdx !== -1) {
        state.candidates.splice(targetIdx, 0, game);
      } else {
        state.candidates.push(game);
      }
    } else {
      state.candidates.push(game);
    }
    setStatus('Moved "' + game.name + '" to Candidates');
  } else if (destinationType === "tier") {
    const targetTier = state.tiers.find(function findTier(t) {
      return t.id === destinationTierId;
    });
    if (!targetTier) {
      state.candidates.push(game);
    } else if (beforeGameId) {
      const targetIdx = targetTier.games.findIndex(function findTarget(g) {
        return g.id === beforeGameId;
      });
      if (targetIdx !== -1) {
        targetTier.games.splice(targetIdx, 0, game);
      } else {
        targetTier.games.push(game);
      }
      setStatus('Assigned "' + game.name + '" to tier ' + targetTier.name);
    } else {
      targetTier.games.push(game);
      setStatus('Assigned "' + game.name + '" to tier ' + targetTier.name);
    }
  }

  renderWorkspace();
}

/* ==========================================================================
   7. RENDERING ENGINE
   ========================================================================== */
function createPosterListItem(game, containerType, tierId) {
  const li = document.createElement("li");
  li.className = "poster-item";
  li.draggable = true;
  li.dataset.gameId = game.id;
  li.dataset.containerType = containerType;
  if (tierId) {
    li.dataset.tierId = tierId;
  }
  li.title = game.year ? game.name + " (" + game.year + ")" : game.name;

  // Requirement: Poster images simply have the name of the game as alt text
  const img = document.createElement("img");
  img.className = "poster-img";
  img.src = game.imageUrl || ICON_PLACEHOLDERS.FALLBACK_POSTER;
  img.alt = game.name;
  img.loading = "lazy";
  img.decoding = "async";
  attachPosterFallbacks(img, game);

  const caption = document.createElement("span");
  caption.className = "poster-caption";
  caption.textContent = game.name;

  const quickBtn = document.createElement("button");
  quickBtn.type = "button";
  quickBtn.className = "poster-quick-btn";
  quickBtn.textContent = "x";

  if (containerType === "tier") {
    quickBtn.title = "Remove from tier back to Candidates";
    quickBtn.setAttribute("aria-label", "Remove " + game.name + " from tier");
    quickBtn.addEventListener("click", function handleReturnToPool(event) {
      event.stopPropagation();
      moveGameToDestination(game.id, "candidates", null, null);
    });
  } else {
    quickBtn.title = "Delete from Candidate pool";
    quickBtn.setAttribute("aria-label", "Delete " + game.name + " from candidates");
    quickBtn.addEventListener("click", function handleDeleteCandidate(event) {
      event.stopPropagation();
      extractGameById(game.id);
      setStatus('Removed "' + game.name + '" from Candidates');
      renderWorkspace();
    });
  }

  li.addEventListener("dragstart", function handleDragStart(event) {
    dragContext = {
      gameId: game.id,
      originType: containerType,
      originTierId: tierId || null
    };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", game.id);
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
    if (dragContext && dragContext.gameId !== game.id) {
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

    const droppedId = dragContext
      ? dragContext.gameId
      : (event.dataTransfer ? event.dataTransfer.getData("text/plain") : "");

    if (!droppedId || droppedId === game.id) {
      return;
    }

    const rect = li.getBoundingClientRect();
    const insertBefore = event.clientX < rect.left + rect.width / 2;
    if (insertBefore) {
      moveGameToDestination(droppedId, containerType, tierId || null, game.id);
    } else {
      const siblingList = containerType === "candidates"
        ? state.candidates
        : (state.tiers.find(function findT(t) { return t.id === tierId; }) || { games: [] }).games;
      const idx = siblingList.findIndex(function findCurrent(g) { return g.id === game.id; });
      const nextGame = idx !== -1 && idx + 1 < siblingList.length ? siblingList[idx + 1] : null;
      moveGameToDestination(droppedId, containerType, tierId || null, nextGame ? nextGame.id : null);
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
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    zoneEl.classList.add("is-drag-over");
  });

  zoneEl.addEventListener("dragleave", function handleZoneDragLeave(event) {
    if (!zoneEl.contains(event.relatedTarget)) {
      zoneEl.classList.remove("is-drag-over");
    }
  });

  zoneEl.addEventListener("drop", function handleZoneDrop(event) {
    event.preventDefault();
    zoneEl.classList.remove("is-drag-over");
    const droppedId = dragContext
      ? dragContext.gameId
      : (event.dataTransfer ? event.dataTransfer.getData("text/plain") : "");
    if (!droppedId) {
      return;
    }
    moveGameToDestination(droppedId, destinationType, tierId || null, null);
  });
}

function renderTiers() {
  dom.tierRowsList.innerHTML = "";
  const isHorizontal = state.orientation === "horizontal";

  for (let index = 0; index < state.tiers.length; index += 1) {
    const tier = state.tiers[index];
    const rowLi = document.createElement("li");
    rowLi.className = "tier-row";
    rowLi.dataset.tierId = tier.id;

    // Header cell (name + optional icon + user-selected matte color via CSS variable)
    const headerCell = document.createElement("div");
    headerCell.className = "tier-header-cell";
    headerCell.style.setProperty("--tier-color", tier.color);
    headerCell.style.setProperty("--tier-ink", getContrastInk(tier.color));

    if (tier.icon) {
      const iconImg = document.createElement("img");
      iconImg.className = "tier-icon-img";
      iconImg.src = tier.icon;
      iconImg.alt = tier.iconAlt || (tier.name + " tier icon");
      attachRowIconFallback(iconImg, tier.name, tier.icon);
      headerCell.appendChild(iconImg);
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
    posterUl.setAttribute("aria-label", "Games in tier " + tier.name);

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
      openRowEditorModal(tier.id);
    });

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "ide-btn ide-btn-compact";
    prevBtn.textContent = isHorizontal ? "Left" : "Up";
    prevBtn.disabled = index === 0;
    prevBtn.title = "Move tier earlier";
    prevBtn.addEventListener("click", function onMovePrev() {
      moveTierRow(index, -1);
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "ide-btn ide-btn-compact";
    nextBtn.textContent = isHorizontal ? "Right" : "Down";
    nextBtn.disabled = index === state.tiers.length - 1;
    nextBtn.title = "Move tier later";
    nextBtn.addEventListener("click", function onMoveNext() {
      moveTierRow(index, 1);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "ide-btn ide-btn-compact";
    delBtn.textContent = "Del";
    delBtn.title = "Delete tier row (returns ranked games to Candidates)";
    delBtn.addEventListener("click", function onDeleteTier() {
      deleteTierRow(tier.id);
    });

    controlsCell.appendChild(editBtn);
    controlsCell.appendChild(prevBtn);
    controlsCell.appendChild(nextBtn);
    controlsCell.appendChild(delBtn);

    if (isHorizontal) {
      rowLi.appendChild(headerCell);
      rowLi.appendChild(controlsCell);
      rowLi.appendChild(dropzone);
    } else {
      rowLi.appendChild(headerCell);
      rowLi.appendChild(dropzone);
      rowLi.appendChild(controlsCell);
    }

    dom.tierRowsList.appendChild(rowLi);
  }
}

function renderCandidates() {
  dom.candidatesList.innerHTML = "";
  const query = state.candidateFilter.trim().toLowerCase();

  const visibleCandidates = query
    ? state.candidates.filter(function matchFilter(g) {
        return g.name.toLowerCase().indexOf(query) !== -1;
      })
    : state.candidates;

  for (let i = 0; i < visibleCandidates.length; i += 1) {
    dom.candidatesList.appendChild(createPosterListItem(visibleCandidates[i], "candidates", null));
  }

  dom.candidatesCount.textContent = String(state.candidates.length);
  if (state.candidates.length === 0) {
    dom.candidatesEmptyMsg.textContent =
      "Candidate pool is empty. Search titles via IGDB, import a Steam Community profile, or click Load Defaults.";
    dom.candidatesEmptyMsg.hidden = false;
  } else if (visibleCandidates.length === 0) {
    dom.candidatesEmptyMsg.textContent = 'No candidates match filter "' + state.candidateFilter + '".';
    dom.candidatesEmptyMsg.hidden = false;
  } else {
    dom.candidatesEmptyMsg.hidden = true;
  }
}

function renderMetricsAndChrome() {
  // Title sync
  if (document.activeElement !== dom.tierlistTitle) {
    dom.tierlistTitle.value = state.title;
  }
  dom.srDocumentHeading.textContent = state.title || "Untitled Video Game Tier List";
  document.title = (state.title || "Untitled Tier List") + " // CueTier";

  // Orientation sync
  dom.workspaceMain.dataset.orientation = state.orientation;
  const isHorizontal = state.orientation === "horizontal";
  dom.orientationLabel.textContent = isHorizontal ? "Horizontal" : "Vertical";
  dom.orientationSwitch.setAttribute("aria-pressed", String(isHorizontal));
  dom.statusOrientation.textContent = state.orientation.toUpperCase();

  // Theme sync
  dom.html.dataset.theme = state.theme;
  const isLight = state.theme === "light";
  dom.themeLabel.textContent = isLight ? "Light" : "Dark";
  dom.themeSwitch.setAttribute("aria-pressed", String(isLight));

  // Status bar counts
  let rankedTotal = 0;
  for (let i = 0; i < state.tiers.length; i += 1) {
    rankedTotal += state.tiers[i].games.length;
  }
  dom.statusTierCount.textContent = String(state.tiers.length);
  dom.statusRankedCount.textContent = String(rankedTotal);
  dom.statusCandidateCount.textContent = String(state.candidates.length);

  const igdbState = hasIgdbCredentials() ? "IGDB: Ready" : "IGDB: Placeholder";
  const steamState = hasSteamCredentials() ? "Steam: Ready" : "Steam: Placeholder";
  dom.statusApiKeys.textContent = igdbState + " | " + steamState;

  const savedLists = readSavedTierLists();
  dom.savedCount.textContent = String(savedLists.length);
}

function renderWorkspace() {
  renderMetricsAndChrome();
  renderTiers();
  renderCandidates();
}

/* ==========================================================================
   8. TIER ROW CRUD (ADD, EDIT NAME/COLOR/ICON, REORDER, DELETE)
   ========================================================================== */
function moveTierRow(index, delta) {
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= state.tiers.length) {
    return;
  }
  const moved = state.tiers.splice(index, 1)[0];
  state.tiers.splice(targetIndex, 0, moved);
  setStatus('Reordered tier "' + moved.name + '"');
  renderWorkspace();
}

function deleteTierRow(tierId) {
  const idx = state.tiers.findIndex(function findTier(t) {
    return t.id === tierId;
  });
  if (idx === -1) {
    return;
  }
  const removed = state.tiers.splice(idx, 1)[0];
  if (removed.games.length > 0) {
    for (let i = 0; i < removed.games.length; i += 1) {
      state.candidates.push(removed.games[i]);
    }
    setStatus(
      'Deleted tier "' + removed.name + '" and returned ' + removed.games.length + " game(s) to Candidates"
    );
  } else {
    setStatus('Deleted tier "' + removed.name + '"');
  }
  renderWorkspace();
}

function initRowEditorControls() {
  // Populate matte swatch buttons
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
      setRowModalColor(hex);
    });
    dom.matteSwatches.appendChild(btn);
  }

  // Populate preset icon select options
  dom.rowIconPreset.innerHTML = "";
  for (let j = 0; j < ICON_PLACEHOLDERS.TIER_PRESETS.length; j += 1) {
    const preset = ICON_PLACEHOLDERS.TIER_PRESETS[j];
    const opt = document.createElement("option");
    opt.value = preset.src;
    opt.dataset.alt = preset.alt;
    opt.textContent = preset.label;
    dom.rowIconPreset.appendChild(opt);
  }
}

function setRowModalColor(hex) {
  const normalized = String(hex || "#7d6891").toLowerCase();
  dom.rowColorInput.value = normalized;
  dom.rowColorHex.textContent = normalized;

  const swatches = dom.matteSwatches.querySelectorAll(".swatch-btn");
  for (let i = 0; i < swatches.length; i += 1) {
    swatches[i].classList.toggle("is-active", swatches[i].dataset.hex.toLowerCase() === normalized);
  }
}

function updateRowModalIconPreview(src, labelHint) {
  const trimmed = String(src || "").trim();
  if (!trimmed) {
    dom.rowIconPreview.hidden = true;
    dom.rowIconPreview.removeAttribute("src");
    dom.rowIconNone.hidden = false;
    return;
  }

  dom.rowIconNone.hidden = true;
  dom.rowIconPreview.hidden = false;
  dom.rowIconPreview.addEventListener(
    "error",
    function onPreviewErr() {
      dom.rowIconPreview.src = buildIconFallbackDataUri(labelHint || dom.rowNameInput.value || "ICO");
    },
    { once: true }
  );
  dom.rowIconPreview.src = trimmed;
}

function openRowEditorModal(tierId) {
  dom.rowIconFile.value = "";
  if (tierId === null) {
    state.isCreatingRow = true;
    state.editingRowId = null;
    dom.rowModalTitle.textContent = "Add New Tier Row";
    const nextColor = MATTE_SWATCHES[state.tiers.length % MATTE_SWATCHES.length];
    dom.rowNameInput.value = "New Tier";
    setRowModalColor(nextColor);
    dom.rowIconPreset.value = "";
    dom.rowIconUrl.value = "";
    updateRowModalIconPreview("", "New");
  } else {
    const tier = state.tiers.find(function findT(t) {
      return t.id === tierId;
    });
    if (!tier) {
      return;
    }
    state.isCreatingRow = false;
    state.editingRowId = tier.id;
    dom.rowModalTitle.textContent = 'Edit Tier Row "' + tier.name + '"';
    dom.rowNameInput.value = tier.name;
    setRowModalColor(tier.color);

    const matchingPreset = ICON_PLACEHOLDERS.TIER_PRESETS.find(function findPreset(p) {
      return p.src === tier.icon;
    });
    dom.rowIconPreset.value = matchingPreset ? matchingPreset.src : "";
    dom.rowIconUrl.value = tier.icon || "";
    updateRowModalIconPreview(tier.icon, tier.name);
  }

  openDialog(dom.rowEditorDialog);
  dom.rowNameInput.focus();
  dom.rowNameInput.select();
}

function handleSaveRowModal(event) {
  event.preventDefault();
  const name = dom.rowNameInput.value.trim() || "Untitled";
  const color = dom.rowColorInput.value || "#7d6891";
  const iconSrc = dom.rowIconUrl.value.trim();

  const matchingPreset = ICON_PLACEHOLDERS.TIER_PRESETS.find(function findP(p) {
    return p.src === iconSrc && p.src !== "";
  });
  const iconAlt = iconSrc
    ? (matchingPreset ? matchingPreset.alt : name + " tier icon")
    : "";

  if (state.isCreatingRow) {
    state.tiers.push({
      id: makeId("tier"),
      name: name,
      color: color,
      icon: iconSrc,
      iconAlt: iconAlt,
      games: []
    });
    setStatus('Added new tier row "' + name + '"');
  } else {
    const tier = state.tiers.find(function findT(t) {
      return t.id === state.editingRowId;
    });
    if (tier) {
      tier.name = name;
      tier.color = color;
      tier.icon = iconSrc;
      tier.iconAlt = iconAlt;
      setStatus('Updated tier row "' + name + '"');
    }
  }

  closeDialog(dom.rowEditorDialog);
  renderWorkspace();
}

/* ==========================================================================
   9. IGDB SEARCH FEATURE (WITH MULTI-MATCH CONFIRMATION & FALLBACK)
   ========================================================================== */
async function obtainIgdbAccessToken() {
  if (!isPlaceholderValue(API_CONFIG.IGDB_ACCESS_TOKEN)) {
    return API_CONFIG.IGDB_ACCESS_TOKEN.trim();
  }

  const now = Date.now();
  if (state.igdbTokenCache.token && state.igdbTokenCache.expiresAt > now + 30000) {
    return state.igdbTokenCache.token;
  }

  const authUrl =
    "https://id.twitch.tv/oauth2/token?client_id=" +
    encodeURIComponent(API_CONFIG.IGDB_CLIENT_ID.trim()) +
    "&client_secret=" +
    encodeURIComponent(API_CONFIG.IGDB_CLIENT_SECRET.trim()) +
    "&grant_type=client_credentials";

  const response = await fetch(authUrl, { method: "POST" });
  if (!response.ok) {
    throw new Error("Twitch OAuth token exchange failed (HTTP " + response.status + "). Check IGDB_CLIENT_ID and IGDB_CLIENT_SECRET.");
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Twitch OAuth response did not include an access_token.");
  }

  state.igdbTokenCache.token = data.access_token;
  state.igdbTokenCache.expiresAt = now + (Number(data.expires_in) || 3600) * 1000;
  return data.access_token;
}

async function queryIgdbGames(searchTerm) {
  const token = await obtainIgdbAccessToken();
  const sanitized = searchTerm.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const apicalypseQuery =
    'search "' + sanitized + '"; fields name, first_release_date, cover.image_id, cover.url; limit 12;';

  const response = await fetchWithCorsFallback("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": API_CONFIG.IGDB_CLIENT_ID.trim(),
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "text/plain"
    },
    body: apicalypseQuery
  });

  if (!response.ok) {
    throw new Error("IGDB v4 request returned HTTP " + response.status + ".");
  }

  const results = await response.json();
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map(function mapIgdbRecord(item) {
    let posterUrl = ICON_PLACEHOLDERS.FALLBACK_POSTER;
    if (item.cover && item.cover.image_id) {
      posterUrl = "https://images.igdb.com/igdb/image/upload/t_cover_big/" + item.cover.image_id + ".jpg";
    } else if (item.cover && item.cover.url) {
      const rawUrl = item.cover.url.indexOf("//") === 0 ? "https:" + item.cover.url : item.cover.url;
      posterUrl = rawUrl.replace("t_thumb", "t_cover_big");
    }

    let releaseYear = "";
    if (item.first_release_date) {
      releaseYear = String(new Date(item.first_release_date * 1000).getUTCFullYear());
    }

    return {
      id: "igdb-" + item.id,
      name: item.name || "Unknown Title",
      year: releaseYear,
      imageUrl: posterUrl,
      backupUrl: "",
      source: "igdb"
    };
  });
}

function searchOfflineReferenceCatalog(query) {
  const q = query.trim().toLowerCase();
  const directMatches = DEFAULT_COMPOSER_CATALOG.filter(function matchItem(item) {
    return item.name.toLowerCase().indexOf(q) !== -1;
  });

  if (directMatches.length > 0) {
    return directMatches;
  }

  // If user typed a title not in the 24-entry local set while testing without keys,
  // provide a custom placeholder poster entry alongside close catalog suggestions so confirmation can still be tested.
  return [
    {
      id: makeId("custom"),
      name: query.trim(),
      year: "Custom",
      imageUrl: ICON_PLACEHOLDERS.FALLBACK_POSTER,
      backupUrl: "",
      source: "placeholder"
    }
  ].concat(DEFAULT_COMPOSER_CATALOG.slice(0, 4));
}

function renderSearchMatches() {
  dom.igdbMatchesList.innerHTML = "";
  dom.matchesCount.textContent = String(state.searchMatches.length);
  dom.selectedMatchesCount.textContent = String(state.selectedMatchIds.size);
  dom.confirmSelectedMatchesBtn.disabled = state.selectedMatchIds.size === 0;

  if (state.searchMatches.length === 0) {
    dom.igdbMatchesPanel.hidden = true;
    return;
  }

  dom.igdbMatchesPanel.hidden = false;

  for (let i = 0; i < state.searchMatches.length; i += 1) {
    const match = state.searchMatches[i];
    const isChecked = state.selectedMatchIds.has(match.id);
    const alreadyAdded = isGameAlreadyPresent(match.id, match.name);

    const li = document.createElement("li");
    li.className = "match-card" + (isChecked ? " is-selected" : "");

    const thumb = document.createElement("img");
    thumb.className = "match-thumb";
    thumb.src = match.imageUrl || ICON_PLACEHOLDERS.FALLBACK_POSTER;
    thumb.alt = match.name;
    thumb.loading = "lazy";
    attachPosterFallbacks(thumb, match);

    const meta = document.createElement("div");
    meta.className = "match-meta";

    const titleEl = document.createElement("span");
    titleEl.className = "match-name";
    titleEl.textContent = match.name;
    titleEl.title = match.name;

    const yearEl = document.createElement("span");
    yearEl.className = "match-year";
    yearEl.textContent = match.year ? "Release: " + match.year : "Release: N/A";

    const controls = document.createElement("div");
    controls.className = "match-controls";

    const checkLabel = document.createElement("label");
    checkLabel.className = "match-check-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;
    checkbox.disabled = alreadyAdded;
    checkbox.addEventListener("change", function onToggleSelect() {
      if (checkbox.checked) {
        state.selectedMatchIds.add(match.id);
      } else {
        state.selectedMatchIds.delete(match.id);
      }
      renderSearchMatches();
    });

    const checkText = document.createElement("span");
    checkText.textContent = "Select";
    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(checkText);

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "ide-btn ide-btn-compact ide-btn-primary";
    confirmBtn.textContent = alreadyAdded ? "Added" : "Confirm Add";
    confirmBtn.disabled = alreadyAdded;
    confirmBtn.addEventListener("click", function onConfirmSingle() {
      const outcome = addGamesToCandidates([match]);
      state.selectedMatchIds.delete(match.id);
      if (outcome.addedCount > 0) {
        showToolFeedback(dom.igdbFeedback, 'Added "' + match.name + '" poster to Candidates.', "ok");
        setStatus('Confirmed IGDB match "' + match.name + '"');
      }
      renderSearchMatches();
    });

    controls.appendChild(checkLabel);
    controls.appendChild(confirmBtn);

    meta.appendChild(titleEl);
    meta.appendChild(yearEl);
    meta.appendChild(controls);

    li.appendChild(thumb);
    li.appendChild(meta);
    dom.igdbMatchesList.appendChild(li);
  }
}

async function handleIgdbSearchSubmit(event) {
  event.preventDefault();
  const query = dom.igdbQueryInput.value.trim();
  if (!query) {
    showToolFeedback(dom.igdbFeedback, "Enter a video game title to search.", "warn");
    dom.igdbQueryInput.focus();
    return;
  }

  dom.igdbSearchBtn.disabled = true;
  dom.igdbSearchBtn.textContent = "Searching...";
  state.selectedMatchIds.clear();

  try {
    if (!hasIgdbCredentials()) {
      state.searchMatches = searchOfflineReferenceCatalog(query);
      showToolFeedback(
        dom.igdbFeedback,
        "IGDB API placeholder credentials detected in script.js. Showing reference catalog matches so you can confirm and test selection.",
        "warn"
      );
      setStatus("IGDB search ran in placeholder catalog mode");
      renderSearchMatches();
      return;
    }

    const matches = await queryIgdbGames(query);
    state.searchMatches = matches;
    if (matches.length === 0) {
      showToolFeedback(dom.igdbFeedback, 'No IGDB matches found for "' + query + '".', "warn");
    } else {
      showToolFeedback(
        dom.igdbFeedback,
        "Found " + matches.length + ' match(es) on IGDB for "' + query + '". Confirm one or select several below.',
        "ok"
      );
    }
    setStatus("IGDB returned " + matches.length + " match(es)");
    renderSearchMatches();
  } catch (err) {
    state.searchMatches = searchOfflineReferenceCatalog(query);
    showToolFeedback(
      dom.igdbFeedback,
      "IGDB request failed (" + err.message + "). Loaded offline fallback matches instead.",
      "error"
    );
    setStatus("IGDB error; fallback matches shown");
    renderSearchMatches();
  } finally {
    dom.igdbSearchBtn.disabled = false;
    dom.igdbSearchBtn.textContent = "Search";
  }
}

function handleConfirmSelectedMatches() {
  const chosen = state.searchMatches.filter(function isChosen(m) {
    return state.selectedMatchIds.has(m.id);
  });
  if (chosen.length === 0) {
    return;
  }
  const outcome = addGamesToCandidates(chosen);
  state.selectedMatchIds.clear();
  showToolFeedback(
    dom.igdbFeedback,
    "Added " + outcome.addedCount + " selected game poster(s) to Candidates.",
    "ok"
  );
  setStatus("Added " + outcome.addedCount + " game(s) from search matches");
  renderSearchMatches();
}

/* ==========================================================================
   10. STEAM COMMUNITY LINK IMPORT (WITH PRIVATE PROFILE ERROR & DEFAULTS)
   ========================================================================== */
function parseSteamCommunityInput(rawInput) {
  const input = String(rawInput || "").trim();
  if (!input) {
    return { valid: false, reason: "Enter a Steam Community profile URL (e.g. https://steamcommunity.com/id/yourname)." };
  }

  // Raw 17-digit SteamID64
  if (/^\d{17}$/.test(input)) {
    return { valid: true, type: "steamid", value: input };
  }

  // Standard /profiles/<17-digit-id>
  const profileMatch = input.match(/steamcommunity\.com\/profiles\/(\d{17})(?:[/?#]|$)/i);
  if (profileMatch) {
    return { valid: true, type: "steamid", value: profileMatch[1] };
  }

  // Custom vanity URL /id/<vanity>
  const vanityMatch = input.match(/steamcommunity\.com\/id\/([^/?#\s]+)(?:[/?#]|$)/i);
  if (vanityMatch) {
    return { valid: true, type: "vanity", value: decodeURIComponent(vanityMatch[1]) };
  }

  return {
    valid: false,
    reason:
      "Unrecognized Steam link format. Expected https://steamcommunity.com/id/<vanity> or https://steamcommunity.com/profiles/<17-digit-steamid>."
  };
}

async function resolveSteamId64(parsedProfile, apiKey) {
  if (parsedProfile.type === "steamid") {
    return parsedProfile.value;
  }

  const resolveUrl =
    "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" +
    encodeURIComponent(apiKey) +
    "&vanityurl=" +
    encodeURIComponent(parsedProfile.value);

  const response = await fetchWithCorsFallback(resolveUrl);
  if (!response.ok) {
    throw new Error("Steam ResolveVanityURL failed (HTTP " + response.status + ").");
  }

  const payload = await response.json();
  if (!payload || !payload.response || payload.response.success !== 1 || !payload.response.steamid) {
    throw new Error('Steam vanity profile "' + parsedProfile.value + '" was not found.');
  }

  return payload.response.steamid;
}

async function checkSteamProfileVisibility(steamId64, apiKey) {
  const summaryUrl =
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
    encodeURIComponent(apiKey) +
    "&steamids=" +
    encodeURIComponent(steamId64);

  const response = await fetchWithCorsFallback(summaryUrl);
  if (!response.ok) {
    return { exists: true, isPublic: true, personaName: "" };
  }

  const data = await response.json();
  const players = data && data.response && Array.isArray(data.response.players) ? data.response.players : [];
  if (players.length === 0) {
    return { exists: false, isPublic: false, personaName: "" };
  }

  const player = players[0];
  // Steam communityvisibilitystate: 3 = Public; 1 or 2 = Private / Friends-Only
  return {
    exists: true,
    isPublic: player.communityvisibilitystate === 3,
    personaName: player.personaname || ""
  };
}

function loadDefaultFallbackGamesIntoCandidates() {
  const outcome = addGamesToCandidates(DEFAULT_COMPOSER_CATALOG);
  return outcome;
}

async function handleSteamImportSubmit(event) {
  event.preventDefault();
  const parsed = parseSteamCommunityInput(dom.steamLinkInput.value);
  if (!parsed.valid) {
    showToolFeedback(dom.steamFeedback, parsed.reason, "error");
    dom.steamLinkInput.focus();
    return;
  }

  if (!hasSteamCredentials()) {
    const fallbackOutcome = loadDefaultFallbackGamesIntoCandidates();
    showToolFeedback(
      dom.steamFeedback,
      "STEAM_API_KEY in script.js is still set to its placeholder. Loaded " +
        fallbackOutcome.addedCount +
        " default composer reference game(s) into Candidates until your Steam Web API key is added.",
      "warn"
    );
    setStatus("Steam placeholder key detected; loaded default candidates");
    return;
  }

  dom.steamImportBtn.disabled = true;
  dom.steamImportBtn.textContent = "Pulling...";

  try {
    const apiKey = API_CONFIG.STEAM_API_KEY.trim();
    const steamId64 = await resolveSteamId64(parsed, apiKey);
    const visibility = await checkSteamProfileVisibility(steamId64, apiKey);

    if (!visibility.exists) {
      const outcome = loadDefaultFallbackGamesIntoCandidates();
      showToolFeedback(
        dom.steamFeedback,
        "No Steam account exists for ID " +
          steamId64 +
          ". Loaded " +
          outcome.addedCount +
          " default game(s) into Candidates instead.",
        "error"
      );
      setStatus("Steam profile not found; default games loaded");
      return;
    }

    if (!visibility.isPublic) {
      const outcome = loadDefaultFallbackGamesIntoCandidates();
      const label = visibility.personaName ? ' ("' + visibility.personaName + '")' : "";
      showToolFeedback(
        dom.steamFeedback,
        "Steam profile" +
          label +
          " is set to Private. Steam Web API cannot access private libraries; loaded " +
          outcome.addedCount +
          " default game(s) into Candidates.",
        "warn"
      );
      setStatus("Private Steam profile detected; loaded default games");
      return;
    }

    const ownedUrl =
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
      encodeURIComponent(apiKey) +
      "&steamid=" +
      encodeURIComponent(steamId64) +
      "&include_appinfo=1&include_played_free_games=1&format=json";

    const ownedRes = await fetchWithCorsFallback(ownedUrl);
    if (!ownedRes.ok) {
      throw new Error("Steam GetOwnedGames returned HTTP " + ownedRes.status + ".");
    }

    const ownedData = await ownedRes.json();
    const rawGames = ownedData && ownedData.response ? ownedData.response.games : undefined;

    // Note: Steam returns an empty response object {} when "Game details" privacy is set to Private/Friends-Only
    if (!Array.isArray(rawGames) || rawGames.length === 0) {
      const outcome = loadDefaultFallbackGamesIntoCandidates();
      showToolFeedback(
        dom.steamFeedback,
        "Steam Game Details are hidden/private (or library has 0 visible games). Loaded " +
          outcome.addedCount +
          " default game(s) into Candidates as fallback.",
        "warn"
      );
      setStatus("Hidden Steam game details; default games loaded");
      return;
    }

    const sortedSteamGames = rawGames
      .slice()
      .sort(function byPlaytimeThenName(a, b) {
        const diff = (b.playtime_forever || 0) - (a.playtime_forever || 0);
        if (diff !== 0) {
          return diff;
        }
        return String(a.name || "").localeCompare(String(b.name || ""));
      })
      .map(function mapSteamGame(g) {
        const urls = steamPosterUrls(g.appid);
        return {
          id: "steam-" + g.appid,
          name: g.name || "Steam App " + g.appid,
          year: "",
          imageUrl: urls.primary,
          backupUrl: urls.secondary,
          source: "steam"
        };
      });

    const outcome = addGamesToCandidates(sortedSteamGames);
    showToolFeedback(
      dom.steamFeedback,
      "Pulled Steam library successfully: added " +
        outcome.addedCount +
        " game(s) to Candidates" +
        (outcome.skippedCount > 0 ? " (" + outcome.skippedCount + " duplicates skipped)." : "."),
      "ok"
    );
    setStatus("Imported " + outcome.addedCount + " game(s) from Steam library");
  } catch (err) {
    const outcome = loadDefaultFallbackGamesIntoCandidates();
    showToolFeedback(
      dom.steamFeedback,
      "Steam import error (" +
        err.message +
        "). Loaded " +
        outcome.addedCount +
        " default reference game(s) into Candidates.",
      "error"
    );
    setStatus("Steam API error; default games loaded");
  } finally {
    dom.steamImportBtn.disabled = false;
    dom.steamImportBtn.textContent = "Pull Library";
  }
}

/* ==========================================================================
   11. LOCALSTORAGE PERSISTENCE (SAVE MULTIPLE TIER LISTS & LOAD)
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

function cloneSerializableState(customTitle, forceNewSlot) {
  const cleanTitle = String(customTitle || state.title || "Untitled Tier List").trim() || "Untitled Tier List";
  const shouldReuseSlot =
    !forceNewSlot &&
    Boolean(state.activeSlotId) &&
    state.lastSavedTitle === cleanTitle;

  const slotId = shouldReuseSlot ? state.activeSlotId : makeId("slot");
  return {
    slotId: slotId,
    title: cleanTitle,
    orientation: state.orientation,
    tiers: JSON.parse(JSON.stringify(state.tiers)),
    candidates: JSON.parse(JSON.stringify(state.candidates)),
    updatedAt: new Date().toISOString()
  };
}

function saveCurrentTierList(customTitle, forceNewSlot) {
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
    state.activeSlotId = snapshot.slotId;
    state.lastSavedTitle = snapshot.title;
    state.title = snapshot.title;
    setStatus('Saved tier list "' + snapshot.title + '" to localStorage');
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

  state.activeSlotId = found.slotId;
  state.lastSavedTitle = found.title;
  state.title = found.title || "Untitled Tier List";
  state.orientation = found.orientation === "horizontal" ? "horizontal" : "vertical";
  state.tiers = Array.isArray(found.tiers) && found.tiers.length > 0
    ? JSON.parse(JSON.stringify(found.tiers))
    : createDefaultTiers();
  state.candidates = Array.isArray(found.candidates)
    ? JSON.parse(JSON.stringify(found.candidates))
    : [];
  state.candidateFilter = "";
  dom.candidatesFilterInput.value = "";

  closeDialog(dom.storageDialog);
  setStatus('Loaded tier list "' + state.title + '" from localStorage');
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
    if (state.activeSlotId === slotId) {
      state.activeSlotId = null;
      state.lastSavedTitle = null;
    }
    if (target) {
      setStatus('Deleted saved list "' + target.title + '" from localStorage');
    }
    renderWorkspace();
    renderSavedListsModal();
  }
}

function renderSavedListsModal() {
  const lists = readSavedTierLists();
  dom.savedListsUl.innerHTML = "";
  dom.savedListsEmpty.hidden = lists.length > 0;

  for (let i = 0; i < lists.length; i += 1) {
    const slot = lists[i];
    const li = document.createElement("li");
    li.className = "saved-slot-item" + (slot.slotId === state.activeSlotId ? " is-active-slot" : "");

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
      tierCount +
      " tiers | " +
      rankedCount +
      " ranked | " +
      candCount +
      " candidates | " +
      (slot.orientation || "vertical") +
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
    overwriteBtn.title = "Overwrite this slot with the current workspace";
    overwriteBtn.addEventListener("click", function onOverwriteSlot() {
      state.activeSlotId = slot.slotId;
      state.lastSavedTitle = state.title;
      saveCurrentTierList(state.title, false);
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
   12. THEME & ORIENTATION SWITCHING + EVENT WIRING
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
  state.orientation = state.orientation === "vertical" ? "horizontal" : "vertical";
  setStatus(
    state.orientation === "vertical"
      ? "Switched to VERTICAL list (Candidates docked on right)"
      : "Switched to HORIZONTAL list (Candidates listed below)"
  );
  renderWorkspace();
}

function resetToDefaultTemplate() {
  state.activeSlotId = null;
  state.lastSavedTitle = null;
  state.title = "Video Game Score Tier List";
  state.orientation = "vertical";
  state.tiers = createDefaultTiers();
  state.candidates = [];
  state.candidateFilter = "";
  dom.candidatesFilterInput.value = "";
  setStatus("Reset workspace to default A-F template (Vertical)");
  renderWorkspace();
}

function bindEvents() {
  // Top toolbar switches & actions
  dom.orientationSwitch.addEventListener("click", toggleOrientation);
  dom.themeSwitch.addEventListener("click", toggleTheme);

  dom.addRowBtn.addEventListener("click", function onAddRow() {
    openRowEditorModal(null);
  });

  dom.saveTierlistForm.addEventListener("submit", function onSubmitSave(event) {
    event.preventDefault();
    saveCurrentTierList(state.title, false);
  });

  dom.openStorageBtn.addEventListener("click", function onOpenStorage() {
    dom.saveAsNameInput.value = state.title;
    renderSavedListsModal();
    openDialog(dom.storageDialog);
  });

  dom.newTemplateBtn.addEventListener("click", resetToDefaultTemplate);

  // Editable list title
  dom.tierlistTitle.addEventListener("input", function onTitleInput() {
    state.title = dom.tierlistTitle.value;
    dom.srDocumentHeading.textContent = state.title || "Untitled Video Game Tier List";
    document.title = (state.title || "Untitled Tier List") + " // CueTier";
  });

  dom.tierlistTitle.addEventListener("blur", function onTitleBlur() {
    if (!dom.tierlistTitle.value.trim()) {
      state.title = "Untitled Game Tier List";
      dom.tierlistTitle.value = state.title;
      renderMetricsAndChrome();
    }
  });

  // IGDB search & matches
  dom.igdbSearchForm.addEventListener("submit", handleIgdbSearchSubmit);
  dom.confirmSelectedMatchesBtn.addEventListener("click", handleConfirmSelectedMatches);
  dom.closeMatchesBtn.addEventListener("click", function onCloseMatches() {
    dom.igdbMatchesPanel.hidden = true;
  });

  // Steam import & default catalog button
  dom.steamImportForm.addEventListener("submit", handleSteamImportSubmit);
  dom.loadDefaultsBtn.addEventListener("click", function onLoadDefaultsClick() {
    const outcome = loadDefaultFallbackGamesIntoCandidates();
    showToolFeedback(
      dom.steamFeedback,
      "Loaded " +
        outcome.addedCount +
        " default composer reference game(s) into Candidates" +
        (outcome.skippedCount > 0 ? " (" + outcome.skippedCount + " already present)." : "."),
      "ok"
    );
    setStatus("Loaded " + outcome.addedCount + " default game(s) into Candidates");
  });

  // Candidates pool dropzone & filter
  bindDropZoneEvents(dom.candidatesDropzone, "candidates", null);

  dom.candidatesFilterInput.addEventListener("input", function onFilterInput() {
    state.candidateFilter = dom.candidatesFilterInput.value;
    renderCandidates();
  });

  dom.clearCandidatesBtn.addEventListener("click", function onClearCandidates() {
    const count = state.candidates.length;
    if (count === 0) {
      return;
    }
    state.candidates = [];
    state.candidateFilter = "";
    dom.candidatesFilterInput.value = "";
    setStatus("Cleared " + count + " candidate poster(s)");
    renderWorkspace();
  });

  // Row editor modal events
  dom.rowEditorForm.addEventListener("submit", handleSaveRowModal);
  dom.closeRowModalBtn.addEventListener("click", function onCloseRowModal() {
    closeDialog(dom.rowEditorDialog);
  });
  dom.cancelRowModalBtn.addEventListener("click", function onCancelRowModal() {
    closeDialog(dom.rowEditorDialog);
  });

  dom.rowColorInput.addEventListener("input", function onColorPick() {
    setRowModalColor(dom.rowColorInput.value);
  });

  dom.rowIconPreset.addEventListener("change", function onPresetIconChange() {
    dom.rowIconUrl.value = dom.rowIconPreset.value;
    updateRowModalIconPreview(dom.rowIconPreset.value, dom.rowNameInput.value);
  });

  dom.rowIconUrl.addEventListener("input", function onCustomIconUrl() {
    const val = dom.rowIconUrl.value.trim();
    const matching = ICON_PLACEHOLDERS.TIER_PRESETS.find(function matchP(p) {
      return p.src === val;
    });
    dom.rowIconPreset.value = matching ? matching.src : "";
    updateRowModalIconPreview(val, dom.rowNameInput.value);
  });

  dom.rowIconFile.addEventListener("change", function onIconFileSelected() {
    const file = dom.rowIconFile.files && dom.rowIconFile.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", function onFileRead() {
      if (typeof reader.result === "string") {
        dom.rowIconPreset.value = "";
        dom.rowIconUrl.value = reader.result;
        updateRowModalIconPreview(reader.result, dom.rowNameInput.value);
      }
    });
    reader.readAsDataURL(file);
  });

  dom.clearRowIconBtn.addEventListener("click", function onClearIcon() {
    dom.rowIconPreset.value = "";
    dom.rowIconUrl.value = "";
    dom.rowIconFile.value = "";
    updateRowModalIconPreview("", "");
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
    const slotTitle = dom.saveAsNameInput.value.trim() || state.title;
    saveCurrentTierList(slotTitle, true);
  });
}

/* ==========================================================================
   13. BOOTSTRAP
   ========================================================================== */
function init() {
  cacheDom();
  loadInitialTheme();
  initRowEditorControls();
  bindEvents();
  renderWorkspace();
}

document.addEventListener("DOMContentLoaded", init);
