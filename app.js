const APP_NAME = "Trackline";
const GAME_FORMAT = "trackline-game";
const SAVE_FORMAT = "trackline-save";
const GAME_VERSION = 1;
const EDITOR_DRAFT_KEY = "trackline-editor-draft-v1";
const PLAY_CACHE_PREFIX = "trackline-play-cache:";
const GRAPH_WORLD_WIDTH = 4200;
const GRAPH_WORLD_HEIGHT = 3200;
const NODE_WIDTH = 280;
const NODE_HEADER_HEIGHT = 92;
const NODE_OPTION_HEIGHT = 38;
const LOGIC_EXECUTION_LIMIT = 128;
const START_NODE_ID = "START";
const END_NODE_ID = "END";
const SPECIAL_NODE_WIDTH = 180;
const ISSUED_IDS = new Set([START_NODE_ID, END_NODE_ID]);

const CREATE_TABS = [
  { id: "system", label: "System" },
  { id: "trackers", label: "Integers" },
  { id: "groups", label: "Groups" },
  { id: "flags", label: "Enums" },
  { id: "profiles", label: "Profiles" },
  { id: "strings", label: "Strings" },
];

const TRACKER_OPERATORS = ["=", "!=", "<", ">", "<=", ">="];
const REQUIREMENT_JOIN_OPTIONS = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
];
const DIRECTION_OPTIONS = [
  { value: "both", label: "Can increase or decrease" },
  { value: "increase", label: "Only increasing" },
  { value: "decrease", label: "Only decreasing" },
];
const SIGN_OPTIONS = [
  { value: "any", label: "Any sign" },
  { value: "nonNegative", label: "Never negative" },
  { value: "nonPositive", label: "Never positive" },
];
const FAILURE_OPTIONS = [
  { value: "disabled", label: "Visible but disabled" },
  { value: "hidden", label: "Hidden entirely" },
];
const DISPLAY_OPTIONS = [
  { value: "none", label: "Hide note" },
  { value: "auto", label: "Auto-generate note" },
  { value: "custom", label: "Custom note" },
];
const TERMINAL_OPTIONS = [
  { value: "target", label: "Go to target node" },
];

const refs = {
  homeView: document.getElementById("homeView"),
  playView: document.getElementById("playView"),
  createView: document.getElementById("createView"),
  playGameInput: document.getElementById("playGameInput"),
  createGameInput: document.getElementById("createGameInput"),
  playSaveInput: document.getElementById("playSaveInput"),
  playGameName: document.getElementById("playGameName"),
  playValidationCard: document.getElementById("playValidationCard"),
  playValidationSummary: document.getElementById("playValidationSummary"),
  playLog: document.getElementById("playLog"),
  playCurrentMessage: document.getElementById("playCurrentMessage"),
  playOptions: document.getElementById("playOptions"),
  playNotes: document.getElementById("playNotes"),
  playNotesCard: document.getElementById("playNotesCard"),
  playTrackerCard: document.getElementById("playTrackerCard"),
  playTrackerGroups: document.getElementById("playTrackerGroups"),
  playFlagsCard: document.getElementById("playFlagsCard"),
  playFlags: document.getElementById("playFlags"),
  playProfilesCard: document.getElementById("playProfilesCard"),
  playProfiles: document.getElementById("playProfiles"),
  playLoadGameButton: document.getElementById("playLoadGameButton"),
  playImportSaveButton: document.getElementById("playImportSaveButton"),
  playExportSaveButton: document.getElementById("playExportSaveButton"),
  playRestartButton: document.getElementById("playRestartButton"),
  playBackChoiceButton: document.getElementById("playBackChoiceButton"),
  playReturnEditorButton: document.getElementById("playReturnEditorButton"),
  playBackHomeButton: document.getElementById("playBackHomeButton"),
  editorGameName: document.getElementById("editorGameName"),
  editorStatus: document.getElementById("editorStatus"),
  editorNewButton: document.getElementById("editorNewButton"),
  editorLoadButton: document.getElementById("editorLoadButton"),
  editorDownloadButton: document.getElementById("editorDownloadButton"),
  editorTestPlayButton: document.getElementById("editorTestPlayButton"),
  editorBackHomeButton: document.getElementById("editorBackHomeButton"),
  editorTabButtons: document.getElementById("editorTabButtons"),
  editorSidebarContent: document.getElementById("editorSidebarContent"),
  graphAddNodeButton: document.getElementById("graphAddNodeButton"),
  graphAddEndNodeButton: document.getElementById("graphAddEndNodeButton"),
  graphCenterButton: document.getElementById("graphCenterButton"),
  graphAddLogicNodeButton: document.getElementById("graphAddLogicNodeButton"),
  graphZoomOutButton: document.getElementById("graphZoomOutButton"),
  graphZoomLabel: document.getElementById("graphZoomLabel"),
  graphZoomInButton: document.getElementById("graphZoomInButton"),
  graphViewport: document.getElementById("graphViewport"),
  graphWorld: document.getElementById("graphWorld"),
  graphConnections: document.getElementById("graphConnections"),
  graphNodes: document.getElementById("graphNodes"),
  graphOverlays: document.getElementById("graphOverlays"),
  menuOverlay: document.getElementById("menuOverlay"),
  editorInspectorShell: document.getElementById("editorInspectorShell"),
  editorInspector: document.getElementById("editorInspector"),
  graphAddClusterButton: document.getElementById("graphAddClusterButton"),
};

const appState = {
  view: "home",
  createGame: loadEditorDraft(),
  playGame: null,
  playState: null,
  playValidation: [],
  playError: null,
  playContext: {
    fromDraft: false,
  },
  createTab: "system",
  selection: {
    nodeId: null,
    logicNodeId: null,
    clusterId: null,
    specialNodeKind: null,
    paragraphId: null,
    optionId: null,
    trackerMenuId: null,
    nodeMenuId: null,
    logicNodeMenuId: null,
    paragraphMenuId: null,
    optionMenuId: null,
    floatingActionMenuId: null,
    selectMenuId: null,
  },
  graph: {
    panX: 140,
    panY: 110,
    zoom: 1,
    suppressNextGraphClick: false,
  },
  drag: null,
};

refs.graphWorld.style.width = `${GRAPH_WORLD_WIDTH}px`;
refs.graphWorld.style.height = `${GRAPH_WORLD_HEIGHT}px`;
refs.graphConnections.setAttribute("viewBox", `0 0 ${GRAPH_WORLD_WIDTH} ${GRAPH_WORLD_HEIGHT}`);

bindGlobalEvents();
if (appState.createGame) {
  normalizeEditorSelection();
}
renderApp();

function bindGlobalEvents() {
  refs.homeView.addEventListener("click", handleHomeClick);
  refs.playLoadGameButton.addEventListener("click", () => refs.playGameInput.click());
  refs.playImportSaveButton.addEventListener("click", () => refs.playSaveInput.click());
  refs.playExportSaveButton.addEventListener("click", exportPlaySave);
  refs.playRestartButton.addEventListener("click", restartPlaySession);
  refs.playBackChoiceButton.addEventListener("click", rewindTestPlayChoice);
  refs.playReturnEditorButton.addEventListener("click", () => switchView("create"));
  refs.playBackHomeButton.addEventListener("click", () => switchView("home"));
  refs.playGameInput.addEventListener("change", handlePlayGameImport);
  refs.createGameInput.addEventListener("change", handleCreateGameImport);
  refs.playSaveInput.addEventListener("change", handlePlaySaveImport);
  refs.playOptions.addEventListener("click", handlePlayOptionClick);
  refs.playNotes.addEventListener("input", handlePlayNotesInput);

  refs.editorNewButton.addEventListener("click", () => {
    appState.createGame = createGameScaffold();
    normalizeEditorSelection();
    persistEditorDraft();
    switchView("create");
    requestAnimationFrame(centerGraph);
  });
  refs.editorLoadButton.addEventListener("click", () => refs.createGameInput.click());
  refs.editorDownloadButton.addEventListener("click", exportEditorGame);
  refs.editorTestPlayButton.addEventListener("click", () => {
    if (!appState.createGame) {
      return;
    }

    startPlayFromGame(clone(appState.createGame), { fromDraft: true });
  });
  refs.editorBackHomeButton.addEventListener("click", () => switchView("home"));
  refs.editorTabButtons.addEventListener("click", handleTabClick);
  refs.editorSidebarContent.addEventListener("click", handleSidebarClick);
  refs.editorSidebarContent.addEventListener("input", handleCreateTextInput);
  refs.editorSidebarContent.addEventListener("change", handleSidebarChange);
  refs.editorInspector.addEventListener("click", handleInspectorClick);
  refs.editorInspector.addEventListener("input", handleCreateTextInput);
  refs.editorInspector.addEventListener("change", handleInspectorChange);
  refs.graphOverlays.addEventListener("click", handleInspectorClick);
  refs.graphOverlays.addEventListener("input", handleCreateTextInput);
  refs.graphOverlays.addEventListener("change", handleInspectorChange);
  refs.menuOverlay.addEventListener("click", handleOverlayClick);
  refs.graphAddNodeButton.addEventListener("click", addNodeAtViewportCenter);
  refs.graphAddEndNodeButton.addEventListener("click", placeEndNodeAtViewportCenter);
  refs.graphAddClusterButton.addEventListener("click", addClusterAtViewportCenter);
  refs.graphAddLogicNodeButton.addEventListener("click", addLogicNodeAtViewportCenter);
  refs.graphCenterButton.addEventListener("click", centerGraph);
  refs.graphZoomInButton.addEventListener("click", () => zoomGraph(1.06));
  refs.graphZoomOutButton.addEventListener("click", () => zoomGraph(1 / 1.06));
  refs.graphNodes.addEventListener("click", handleGraphClick);
  refs.graphNodes.addEventListener("input", handleCreateTextInput);
  refs.graphNodes.addEventListener("change", handleGraphChange);
  refs.graphNodes.addEventListener("focusin", handleGraphFocusIn);
  refs.graphNodes.addEventListener("mousedown", handleNodeDragStart);
  refs.graphViewport.addEventListener("mousedown", handleViewportPanStart);
  refs.graphViewport.addEventListener("wheel", handleGraphWheel, { passive: false });

  document.addEventListener("mousedown", handleDocumentMouseDown);
  document.addEventListener("mousemove", handleDocumentDrag);
  document.addEventListener("mouseup", handleDocumentDragEnd);
}

function switchView(nextView) {
  appState.view = nextView;
  renderApp();
}

function renderApp() {
  refs.homeView.classList.toggle("hidden", appState.view !== "home");
  refs.playView.classList.toggle("hidden", appState.view !== "play");
  refs.createView.classList.toggle("hidden", appState.view !== "create");

  if (appState.view === "home") {
    renderHomeView();
  } else if (appState.view === "play") {
    renderPlayView();
  } else if (appState.view === "create") {
    renderCreateView();
  }

  renderMenuOverlay();
}

function renderHomeView() {
  const draft = appState.createGame;
  const draftSummary = draft
    ? `${draft.nodes.length} messages · ${draft.logicNodes.length} logic nodes`
    : "No local draft stored yet.";

  refs.homeView.innerHTML = `
    <div class="home-shell">
      <article class="mode-card">
        <p class="eyebrow">Play</p>
        <h1>Play</h1>
        <p class="copy">
          Load a game file and start a run.
        </p>
        <div class="mode-grid" style="margin-top: 18px;">
          <div class="mode-action">
            <p class="copy">Choose a <code>.json</code> file and begin.</p>
            <div class="button-stack slim">
              <button class="button" type="button" data-action="home-play-load">Choose Game File</button>
              ${
                draft
                  ? '<button class="button secondary" type="button" data-action="home-play-draft">Play Current Draft</button>'
                  : ""
              }
            </div>
          </div>
        </div>
      </article>

      <article class="mode-card">
        <p class="eyebrow">Create</p>
        <h1>Create</h1>
        <p class="copy">
          Build or continue a game in the editor.
        </p>
        <div class="mode-grid" style="margin-top: 18px;">
          <div class="mode-action">
            <p class="copy">${escapeHtml(draftSummary)}</p>
            <div class="button-stack slim">
              <button class="button" type="button" data-action="home-create-new">Start New Game</button>
              <button class="button secondary" type="button" data-action="home-create-load">Load Game File</button>
              ${
                draft
                  ? '<button class="button ghost" type="button" data-action="home-create-draft">Continue Draft</button>'
                  : ""
              }
            </div>
          </div>
        </div>
      </article>
    </div>
  `;
}

function renderPlayView() {
  const game = appState.playGame;
  const playState = appState.playState;
  const validation = appState.playValidation;
  const currentNode = game && playState ? getNodeById(game, playState.currentNodeId) : null;

  refs.playGameName.textContent = game?.metadata.name ?? "No game loaded";
  refs.playBackChoiceButton.classList.toggle(
    "hidden",
    !appState.playContext.fromDraft || !playState || playState.history.length === 0
  );
  refs.playReturnEditorButton.classList.toggle("hidden", !appState.playContext.fromDraft);

  const errors = validation.filter((issue) => issue.severity === "error");
  const warnings = validation.filter((issue) => issue.severity === "warning");
  const showValidation = appState.playContext.fromDraft;

  refs.playValidationCard.classList.toggle("hidden", !showValidation || !game);
  refs.playValidationSummary.innerHTML = game && showValidation
    ? `
        <div class="validation-item">
          <strong class="${errors.length ? "status-bad" : "status-good"}">${errors.length} error${errors.length === 1 ? "" : "s"}</strong>
          <p class="copy">${
            errors.length
              ? appState.playContext.fromDraft
                ? "Test play is running despite errors so you can keep probing the flow."
                : "Fix these in create mode before playback."
              : "Game file passed the required validation checks."
          }</p>
        </div>
        <div class="validation-item">
          <strong class="${warnings.length ? "status-warn" : ""}">${warnings.length} warning${warnings.length === 1 ? "" : "s"}</strong>
          <p class="copy">${warnings.length ? warnings[0].message : "No warnings."}</p>
        </div>
      `
    : "";

  renderPlayLog();
  renderPlayCurrentMessage(currentNode);
  renderPlayOptions(currentNode);
  renderPlayTrackerGroups();
  renderPlayFlags();
  renderPlayProfiles();
  refs.playNotes.value = playState?.notes ?? "";
}

function renderPlayLog() {
  if (appState.playError?.length) {
    refs.playLog.innerHTML = `<div class="paper-note">Playback is blocked because the loaded game has validation errors.</div>`;
    return;
  }

  const entries = appState.playState?.log ?? [];

  if (!entries.length) {
    refs.playLog.innerHTML = `<div class="paper-note">Load a game to begin a transcript.</div>`;
    return;
  }

  refs.playLog.innerHTML = entries
    .map((entry) => {
      if (entry.type === "choice") {
        return `<article class="log-entry choice"><p>${escapeHtml(entry.text)}</p></article>`;
      }

      if (entry.type === "event") {
        return `<article class="log-entry event"><p class="meta">${escapeHtml(entry.label)}</p><p>${escapeHtml(
          entry.text
        )}</p></article>`;
      }

      return `
        <article class="log-entry">
          <h3>${escapeHtml(entry.name)}</h3>
          ${entry.secondary ? `<p class="meta">${escapeHtml(entry.secondary)}</p>` : ""}
          <p>${escapeHtml(entry.body)}</p>
        </article>
      `;
    })
    .join("");

  requestAnimationFrame(() => {
    refs.playLog.scrollTop = refs.playLog.scrollHeight;
  });
}

function renderPlayCurrentMessage(currentNode) {
  if (appState.playError?.length) {
    refs.playCurrentMessage.classList.remove("hidden");
    refs.playCurrentMessage.innerHTML = `<div class="paper-note">The game did not start because required validation checks failed.</div>`;
    return;
  }

  if (!appState.playGame || !appState.playState) {
    refs.playCurrentMessage.classList.remove("hidden");
    refs.playCurrentMessage.innerHTML = `<div class="paper-note">No game is active.</div>`;
    return;
  }

  if (!currentNode) {
    refs.playCurrentMessage.classList.remove("hidden");
    refs.playCurrentMessage.innerHTML =
      appState.playState?.currentNodeId === appState.playGame?.endNode?.id && appState.playState?.status === "complete"
        ? `<div class="paper-note">The run has reached the End Node.</div>`
        : `<div class="paper-note">The active message could not be found.</div>`;
    return;
  }

  refs.playCurrentMessage.classList.add("hidden");
  refs.playCurrentMessage.innerHTML = "";
}

function renderPlayOptions(currentNode) {
  if (appState.playError?.length) {
    refs.playOptions.innerHTML = `<div class="paper-note">No options are available while validation errors remain.</div>`;
    return;
  }

  if (!appState.playGame || !appState.playState || !currentNode) {
    refs.playOptions.innerHTML = `<div class="paper-note">No options available.</div>`;
    return;
  }

  if (appState.playState.status !== "active") {
    refs.playOptions.innerHTML = `<div class="paper-note">Run complete. Export the save or restart to play again.</div>`;
    return;
  }

  const options = currentNode.options
    .map((option) => ({ option, availability: evaluateOptionAvailability(appState.playGame, appState.playState, option) }))
    .filter(({ availability }) => availability.state !== "hidden");

  if (!options.length) {
    refs.playOptions.innerHTML = `<div class="paper-note">This message has no visible options.</div>`;
    return;
  }

  refs.playOptions.innerHTML = options
    .map(({ option, availability }) => {
      const note = buildOptionInlineNote(appState.playGame, appState.playState, option);
      const optionText = interpolateText(appState.playGame, appState.playState, option.text);

      return `
        <button
          class="play-option"
          type="button"
          data-option-id="${escapeAttr(option.id)}"
          ${availability.state === "disabled" ? "disabled" : ""}
        >
          ${escapeHtml(optionText)}
          ${note ? `<span class="option-note">${escapeHtml(note)}</span>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderPlayTrackerGroups() {
  const game = appState.playGame;
  const playState = appState.playState;

  if (!game || !playState) {
    refs.playTrackerCard.classList.add("hidden");
    refs.playTrackerGroups.innerHTML = "";
    return;
  }

  const groups = buildTrackerDisplayGroups(game);
  refs.playTrackerCard.classList.toggle("hidden", !groups.length);

  refs.playTrackerGroups.innerHTML = groups.length
    ? groups
        .map((group) => {
          return `
            <div class="tracker-group-card">
              <strong>${escapeHtml(group.name)}</strong>
              ${group.trackers
                .map((tracker) => {
                  const value = playState.trackers[tracker.id] ?? tracker.startValue;
                  return `
                    <div class="tracker-row">
                      <span>${escapeHtml(tracker.name)}</span>
                      <span class="value">${escapeHtml(formatTrackerValue(tracker, value))}</span>
                    </div>
                  `;
                })
                .join("")}
            </div>
          `;
        })
        .join("")
    : "";
}

function renderPlayFlags() {
  const game = appState.playGame;
  const playState = appState.playState;

  if (!game || !playState) {
    refs.playFlagsCard.classList.add("hidden");
    refs.playFlags.innerHTML = "";
    return;
  }

  const visibleFlags = game.flags.filter((flag) => flag.visible);
  refs.playFlagsCard.classList.toggle("hidden", !visibleFlags.length);

  refs.playFlags.innerHTML = visibleFlags.length
    ? visibleFlags
        .map((flag) => {
          const value = playState.flags[flag.id];
          return `
            <div class="flag-card inline-row">
              <span>${escapeHtml(flag.name)}</span>
              <span class="value">${escapeHtml(value === null ? "null" : value)}</span>
            </div>
          `;
        })
        .join("")
    : "";
}

function renderPlayProfiles() {
  const game = appState.playGame;
  const playState = appState.playState;

  if (!game || !playState) {
    refs.playProfilesCard.classList.add("hidden");
    refs.playProfiles.innerHTML = "";
    return;
  }

  const visibleProfiles = game.profiles.filter((profile) => profile.visible);
  refs.playProfilesCard.classList.toggle("hidden", !visibleProfiles.length);

  refs.playProfiles.innerHTML = visibleProfiles.length
    ? visibleProfiles
        .map((profile) => {
          const value = playState.profiles?.[profile.id];
          return `
            <div class="flag-card inline-row">
              <span>${escapeHtml(profile.name)}</span>
              <span class="value">${escapeHtml(value === null || value === undefined ? "null" : String(value))}</span>
            </div>
          `;
        })
        .join("")
    : "";
}

function renderCreateView() {
  const game = appState.createGame;

  if (!game) {
    refs.editorGameName.textContent = "Untitled Game";
    refs.editorStatus.textContent = "Start a new game or load a file.";
    refs.editorTabButtons.innerHTML = "";
    refs.editorSidebarContent.innerHTML = `<div class="paper-note">No draft is loaded yet.</div>`;
    refs.editorInspector.innerHTML = "";
    refs.editorInspectorShell.classList.add("hidden");
    refs.graphNodes.innerHTML = `<div class="empty-graph">Create a new game to begin authoring.</div>`;
    refs.graphConnections.innerHTML = "";
    refs.graphOverlays.innerHTML = "";
    refs.graphZoomLabel.textContent = `${Math.round(appState.graph.zoom * 100)}%`;
    refs.graphAddEndNodeButton.disabled = true;
    applyGraphTransform();
    return;
  }

  refs.graphAddEndNodeButton.disabled = Boolean(game.endNode?.placed);

  refs.editorGameName.textContent = game.metadata.name || "Untitled Game";
  refs.editorStatus.textContent = `${game.nodes.length} message${game.nodes.length === 1 ? "" : "s"} · ${game.logicNodes.length} logic node${game.logicNodes.length === 1 ? "" : "s"} · ${game.trackers.length} integer${game.trackers.length === 1 ? "" : "s"} · ${game.flags.length} enum${game.flags.length === 1 ? "" : "s"} · ${game.profiles.length} profile${game.profiles.length === 1 ? "" : "s"} · ${game.strings.length} string${game.strings.length === 1 ? "" : "s"}`;

  renderEditorTabs();
  renderEditorSidebar(game);
  renderGraph(game);
  renderInspector(game);
}

function renderEditorTabs() {
  refs.editorTabButtons.innerHTML = CREATE_TABS.map((tab) => {
    const active = appState.createTab === tab.id ? "active" : "";
    return `<button class="tab-button ${active}" type="button" data-action="switch-tab" data-tab-id="${escapeAttr(
      tab.id
    )}">${escapeHtml(tab.label)}</button>`;
  }).join("");
}

function renderEditorSidebar(game) {
  switch (appState.createTab) {
    case "system":
      refs.editorSidebarContent.innerHTML = renderSystemTab(game);
      break;
    case "trackers":
      refs.editorSidebarContent.innerHTML = renderTrackersTab(game);
      break;
    case "groups":
      refs.editorSidebarContent.innerHTML = renderGroupsTab(game);
      break;
    case "flags":
      refs.editorSidebarContent.innerHTML = renderFlagsTab(game);
      break;
    case "profiles":
      refs.editorSidebarContent.innerHTML = renderProfilesTab(game);
      break;
    case "strings":
      refs.editorSidebarContent.innerHTML = renderStringsTab(game);
      break;
    default:
      refs.editorSidebarContent.innerHTML = "";
  }
}

function renderSystemTab(game) {
  return `
    <div class="form-block">
      <div class="field-group">
        <label>Game name</label>
        <input class="field" data-meta-field="name" value="${escapeAttr(game.metadata.name)}" />
      </div>
      <div class="field-group">
        <label>Description</label>
        <textarea class="textarea" data-meta-field="description">${escapeHtml(
          game.metadata.description
        )}</textarea>
      </div>
      <hr class="panel-rule" />
      <div class="create-actions">
        <div class="create-actions-row">
          <button class="button secondary" type="button" data-action="proxy-new">New Game</button>
          <button class="button secondary" type="button" data-action="proxy-load">Load File</button>
        </div>
        <div class="create-actions-row">
          <button class="button" type="button" data-action="proxy-download">Download Game</button>
          <button class="button secondary" type="button" data-action="proxy-test">Test Play</button>
        </div>
        <div class="create-actions-row">
          <button class="button ghost" type="button" data-action="proxy-home">Return to Menu</button>
        </div>
      </div>
    </div>
  `;
}

function renderSelectControl({
  menuId,
  value = "",
  options = [],
  attributes = {},
  className = "",
  placeholder = "Select an option",
  emptyLabel = "No options available",
}) {
  const normalizedValue = value ?? "";
  const optionList = options.map((option) => ({
    value: option?.value ?? "",
    label: option?.label ?? String(option?.value ?? ""),
  }));
  const selectedOption =
    optionList.find((option) => String(option.value) === String(normalizedValue)) ||
    (normalizedValue !== "" && normalizedValue !== null && normalizedValue !== undefined
      ? { value: normalizedValue, label: String(normalizedValue) }
      : null);
  const isOpen = appState.selection.selectMenuId === menuId;
  const disabled = optionList.length === 0;
  const label = selectedOption?.label || (disabled ? emptyLabel : placeholder);
  const popoverMarkup = !disabled
    ? `
        <div class="select-menu-options hidden">
          <div class="popover-menu">
            ${optionList
              .map(
                (option) => `
                  <button
                    class="popover-item ${String(option.value) === String(normalizedValue) ? "is-selected" : ""}"
                    type="button"
                    data-action="select-menu-option"
                    data-select-menu-id="${escapeAttr(menuId)}"
                    data-select-menu-value="${escapeAttr(String(option.value))}"
                  >${escapeHtml(option.label)}</button>
                `
              )
              .join("")}
          </div>
        </div>
      `
    : "";

  return `
    <div class="menu-wrap select-menu ${escapeAttr(className)}" data-select-menu-id="${escapeAttr(menuId)}">
      <input
        type="hidden"
        class="select-menu-input"
        value="${escapeAttr(String(normalizedValue))}"
        ${buildDataAttributes(attributes)}
      />
      <button
        class="field select-menu-button"
        type="button"
        data-action="toggle-select-menu"
        data-select-menu-id="${escapeAttr(menuId)}"
        ${disabled ? "disabled" : ""}
      >
        <span class="select-menu-label">${escapeHtml(label)}</span>
        <span class="select-menu-caret" aria-hidden="true">▾</span>
      </button>
      ${popoverMarkup}
    </div>
  `;
}

function renderTrackersTab(game) {
  return `
    <div class="list-block">
      ${
        game.trackers.length
          ? game.trackers
              .map((tracker) => {
                const menuOpen = appState.selection.trackerMenuId === tracker.id;
                return `
                  <div class="item-card">
                    <div class="inline-row tracker-card-head">
                      <strong>${escapeHtml(tracker.name || "New integer")}</strong>
                      <div class="menu-wrap">
                        <button class="button small ghost menu-button" type="button" data-action="toggle-tracker-menu" data-tracker-id="${escapeAttr(
                          tracker.id
                        )}">···</button>
                        ${
                          menuOpen
                            ? `
                                <div class="popover-menu">
                                  <button class="popover-item" type="button" data-action="duplicate-tracker" data-tracker-id="${escapeAttr(
                                    tracker.id
                                  )}">Duplicate</button>
                                  <button class="popover-item" type="button" data-action="delete-tracker" data-tracker-id="${escapeAttr(
                                    tracker.id
                                  )}">Delete</button>
                                </div>
                              `
                            : ""
                        }
                      </div>
                    </div>
                    <div class="field-group">
                      <label>Name</label>
                      <input class="field" data-tracker-field="name" data-tracker-id="${escapeAttr(
                        tracker.id
                      )}" value="${escapeAttr(tracker.name)}" />
                    </div>
                    <div class="inline-form">
                      <div class="field-group">
                        <label>Start Value</label>
                        <input class="field" type="number" data-tracker-field="startValue" data-tracker-id="${escapeAttr(
                          tracker.id
                        )}" value="${escapeAttr(String(tracker.startValue))}" />
                      </div>
                      <div class="field-group">
                        <label>Group</label>
                        ${renderSelectControl({
                          menuId: `tracker:${tracker.id}:groupId`,
                          value: tracker.groupId || "",
                          attributes: {
                            "data-tracker-field": "groupId",
                            "data-tracker-id": tracker.id,
                          },
                          options: [
                            { value: "", label: "Ungrouped" },
                            ...game.trackerGroups.map((group) => ({
                              value: group.id,
                              label: group.name || group.id,
                            })),
                          ],
                        })}
                      </div>
                    </div>
                    <label class="node-toggle">
                      <input type="checkbox" data-tracker-field="visible" data-tracker-id="${escapeAttr(
                        tracker.id
                      )}" ${tracker.visible ? "checked" : ""} />
                      Show in Play
                    </label>
                    <div class="inline-form">
                      <div class="field-group">
                        <label>Lower Bound</label>
                        <input class="field" type="number" data-tracker-field="min" data-tracker-id="${escapeAttr(
                          tracker.id
                        )}" value="${tracker.min === null ? "" : escapeAttr(String(tracker.min))}" />
                      </div>
                      <div class="field-group">
                        <label>Upper Bound</label>
                        <input class="field" type="number" data-tracker-field="max" data-tracker-id="${escapeAttr(
                          tracker.id
                        )}" value="${tracker.max === null ? "" : escapeAttr(String(tracker.max))}" />
                      </div>
                    </div>
                    <div class="field-group">
                      <label>Directional Restriction</label>
                      ${renderSelectControl({
                        menuId: `tracker:${tracker.id}:direction`,
                        value: tracker.direction,
                        attributes: {
                          "data-tracker-field": "direction",
                          "data-tracker-id": tracker.id,
                        },
                        options: DIRECTION_OPTIONS,
                      })}
                    </div>
                    <div class="field-group">
                      <label>Sign Restriction</label>
                      ${renderSelectControl({
                        menuId: `tracker:${tracker.id}:sign`,
                        value: tracker.sign,
                        attributes: {
                          "data-tracker-field": "sign",
                          "data-tracker-id": tracker.id,
                        },
                        options: SIGN_OPTIONS,
                      })}
                    </div>
                  </div>
                `;
              })
              .join("")
          : '<div class="paper-note">No integers defined yet.</div>'
      }
    </div>
    <div class="tracker-add-wrap">
      <button class="list-add-fab" type="button" data-action="add-tracker" title="Add integer">+</button>
    </div>
  `;
}

function renderGroupsTab(game) {
  return `
    <div class="list-block">
      ${
      game.trackerGroups.length
        ? game.trackerGroups
            .map((group, index) => {
              return `
                <div class="item-card">
                  <div class="inline-row">
                    <strong>Group ${index + 1}</strong>
                    <button class="button small ghost" type="button" data-action="delete-group" data-group-id="${escapeAttr(
                      group.id
                    )}">Delete</button>
                  </div>
                  <div class="field-group">
                    <label>Display name</label>
                    <input class="field" data-group-field="name" data-group-id="${escapeAttr(
                      group.id
                    )}" value="${escapeAttr(group.name)}" />
                  </div>
                  <p class="copy">${game.trackers.filter((tracker) => tracker.groupId === group.id).length} integer(s) assigned</p>
                </div>
              `;
            })
            .join("")
        : '<div class="paper-note">No integer groups defined. Integers can still appear as Ungrouped.</div>'
    }
    </div>
    <div class="tracker-add-wrap">
      <button class="list-add-fab" type="button" data-action="add-group" title="Add group">+</button>
    </div>
  `;
}

function renderFlagsTab(game) {
  return `
    <div class="list-block">
      ${
      game.flags.length
        ? game.flags
            .map((flag) => {
              return `
                <div class="item-card">
                  <div class="inline-row">
                    <strong>${escapeHtml(flag.name || "New enum")}</strong>
                    <button class="button small ghost" type="button" data-action="delete-flag" data-flag-id="${escapeAttr(
                      flag.id
                    )}">Delete</button>
                  </div>
                  <div class="field-group">
                    <label>Name</label>
                    <input class="field" data-flag-field="name" data-flag-id="${escapeAttr(
                      flag.id
                    )}" value="${escapeAttr(flag.name)}" />
                  </div>
                  <label class="node-toggle">
                    <input type="checkbox" data-flag-field="visible" data-flag-id="${escapeAttr(
                      flag.id
                    )}" ${flag.visible ? "checked" : ""} />
                    Show in Play
                  </label>
                  <div class="field-group">
                    <label>States</label>
                    <textarea class="textarea" data-flag-field="states" data-flag-id="${escapeAttr(
                      flag.id
                    )}" placeholder="Comma or newline separated states">${escapeHtml(flag.states.join(", "))}</textarea>
                  </div>
                  <p class="copy">The null state is implicit and always available at runtime.</p>
                </div>
              `;
            })
            .join("")
        : '<div class="paper-note">No enums defined yet.</div>'
    }
    </div>
    <div class="tracker-add-wrap">
      <button class="list-add-fab" type="button" data-action="add-flag" title="Add enum">+</button>
    </div>
  `;
}

function renderProfilesTab(game) {
  return `
    <div class="list-block">
      ${
        game.profiles.length
          ? game.profiles
              .map((profile) => {
                return `
                  <div class="item-card">
                    <div class="inline-row">
                      <strong>${escapeHtml(profile.name || "New profile")}</strong>
                      <button class="button small ghost" type="button" data-action="delete-profile" data-profile-id="${escapeAttr(
                        profile.id
                      )}">Delete</button>
                    </div>
                    <div class="field-group">
                      <label>Name</label>
                      <input class="field" data-profile-field="name" data-profile-id="${escapeAttr(
                        profile.id
                      )}" value="${escapeAttr(profile.name)}" />
                    </div>
                    <label class="node-toggle">
                      <input type="checkbox" data-profile-field="visible" data-profile-id="${escapeAttr(
                        profile.id
                      )}" ${profile.visible ? "checked" : ""} />
                      Show in Play
                    </label>
                    <div class="field-group">
                      <label>Starting State</label>
                      ${renderSelectControl({
                        menuId: `profile:${profile.id}:startState`,
                        value: profile.startState ?? "__NULL__",
                        attributes: {
                          "data-profile-field": "startState",
                          "data-profile-id": profile.id,
                        },
                        options: getStateOptions(profile.states),
                      })}
                    </div>
                    <div class="field-group">
                      <label>States</label>
                      <div class="stack compact">
                        ${
                          profile.states.length
                            ? profile.states
                                .map((state) => {
                                  return `
                                    <div class="item-card">
                                      <div class="inline-row">
                                        <strong>${escapeHtml(state.name || "Unnamed state")}</strong>
                                        <button class="button small ghost" type="button" data-action="delete-profile-state" data-profile-id="${escapeAttr(
                                          profile.id
                                        )}" data-profile-state-id="${escapeAttr(state.id)}">Delete</button>
                                      </div>
                                      <div class="field-group">
                                        <label>State Name</label>
                                        <input class="field" data-profile-state-field="name" data-profile-id="${escapeAttr(
                                          profile.id
                                        )}" data-profile-state-id="${escapeAttr(state.id)}" value="${escapeAttr(state.name)}" />
                                      </div>
                                      <div class="item-card">
                                        <div class="inline-row">
                                          <strong>Set Variables</strong>
                                          <button class="button small secondary" type="button" data-action="add-profile-mapping" data-profile-id="${escapeAttr(
                                            profile.id
                                          )}" data-profile-state-id="${escapeAttr(state.id)}">Add Set Variable</button>
                                        </div>
                                        ${
                                          state.mappings.length
                                            ? state.mappings
                                                .map((mapping) =>
                                                  renderVariableEffectEditor(game, mapping, {
                                                    removeAction: "remove-profile-mapping",
                                                    extraData: {
                                                      "data-profile-id": profile.id,
                                                      "data-profile-state-id": state.id,
                                                    },
                                                  })
                                                )
                                                .join("")
                                            : '<p class="copy">No set-variable rules.</p>'
                                        }
                                      </div>
                                    </div>
                                  `;
                                })
                                .join("")
                            : '<div class="paper-note">No states defined yet.</div>'
                        }
                      </div>
                    </div>
                    <div class="tracker-add-wrap">
                      <button class="list-add-fab" type="button" data-action="add-profile-state" data-profile-id="${escapeAttr(
                        profile.id
                      )}" title="Add state">+</button>
                    </div>
                  </div>
                `;
              })
              .join("")
          : '<div class="paper-note">No profiles defined yet.</div>'
      }
    </div>
    <div class="tracker-add-wrap">
      <button class="list-add-fab" type="button" data-action="add-profile" title="Add profile">+</button>
    </div>
  `;
}

function renderStringsTab(game) {
  return `
    <div class="list-block">
      ${
        game.strings.length
          ? game.strings
              .map((entry) => {
                return `
                  <div class="item-card">
                    <div class="inline-row">
                      <strong>${escapeHtml(entry.name || "New string")}</strong>
                      <button class="button small ghost" type="button" data-action="delete-string" data-string-id="${escapeAttr(
                        entry.id
                      )}">Delete</button>
                    </div>
                    <div class="field-group">
                      <label>Name</label>
                      <input class="field" data-string-field="name" data-string-id="${escapeAttr(entry.id)}" value="${escapeAttr(
                        entry.name
                      )}" />
                    </div>
                    <div class="field-group">
                      <label>Start Value</label>
                      <textarea class="textarea" data-string-field="startValue" data-string-id="${escapeAttr(
                        entry.id
                      )}" placeholder="Starting text">${escapeHtml(entry.startValue)}</textarea>
                    </div>
                    <p class="copy">Use <code>{{${escapeHtml(
                      entry.name || "Variable Name"
                    )}}}</code> in message, info, paragraph, or option text to insert the current value.</p>
                  </div>
                `;
              })
              .join("")
          : '<div class="paper-note">No strings defined yet.</div>'
      }
    </div>
    <div class="tracker-add-wrap">
      <button class="list-add-fab" type="button" data-action="add-string" title="Add string">+</button>
    </div>
  `;
}

function renderInspector(game) {
  const cluster = appState.selection.clusterId ? getClusterById(game, appState.selection.clusterId) : null;

  if (cluster) {
    refs.editorInspectorShell.classList.remove("hidden");
    refs.editorInspector.innerHTML = renderClusterInspector(game, cluster);
    return;
  }

  refs.editorInspector.innerHTML = "";
  refs.editorInspectorShell.classList.add("hidden");
}

function renderClusterInspector(game, cluster) {
  return `
    <div class="form-block">
      <div class="inline-row">
        <strong>Cluster</strong>
        <button class="button small ghost" type="button" data-action="clear-cluster-selection">Close</button>
      </div>
      <div class="field-group">
        <label>Name</label>
        <input class="field" data-cluster-field="name" value="${escapeAttr(cluster.name)}" />
      </div>
      <div class="field-group">
        <label>Target node</label>
        ${renderSelectControl({
          menuId: `cluster:${cluster.id}:targetNodeId`,
          value: cluster.targetNodeId || "",
          attributes: { "data-cluster-field": "targetNodeId" },
          options: [{ value: "", label: "Unassigned" }, ...getPassTargetOptions(game)],
        })}
      </div>
      <div class="item-actions">
        <button class="button small ghost" type="button" data-action="delete-cluster">Delete Cluster</button>
      </div>
    </div>
  `;
}

function renderParagraphInspector(game, node, paragraph) {
  const actionMenuId = buildFloatingActionMenuKey("paragraph", node.id, paragraph.id);
  const actionMenuOpen = appState.selection.floatingActionMenuId === actionMenuId;
  return `
    <div class="form-block">
      <div class="floating-panel-head">
        <strong>Paragraph</strong>
        <div class="floating-panel-actions">
          <div class="menu-wrap">
            <button class="button small ghost menu-button panel-icon-button" type="button" data-action="toggle-floating-action-menu" data-floating-action-menu-id="${escapeAttr(
              actionMenuId
            )}">···</button>
            ${
              actionMenuOpen
                ? `
                    <div class="popover-menu">
                      <button class="popover-item" type="button" data-action="duplicate-paragraph-inline" data-node-id="${escapeAttr(
                        node.id
                      )}" data-paragraph-id="${escapeAttr(paragraph.id)}">Duplicate</button>
                      <button class="popover-item" type="button" data-action="delete-paragraph-inline" data-node-id="${escapeAttr(
                        node.id
                      )}" data-paragraph-id="${escapeAttr(paragraph.id)}" ${node.paragraphs.length === 1 ? "disabled" : ""}>Delete</button>
                    </div>
                  `
                : ""
            }
          </div>
          <button class="button small ghost panel-icon-button" type="button" data-action="clear-paragraph-selection" aria-label="Close paragraph panel">&times;</button>
        </div>
      </div>

      <div class="field-group">
        <label>Text</label>
        <textarea class="textarea" data-node-id="${escapeAttr(node.id)}" data-paragraph-id="${escapeAttr(
          paragraph.id
        )}" data-paragraph-field="text">${escapeHtml(paragraph.text)}</textarea>
      </div>

      <div class="item-card">
        <div class="inline-row">
          <div class="section-heading">
            ${renderRuleIcon("checks", true)}
            <strong>Check Variable</strong>
          </div>
        </div>
        ${renderRuleTableHeader("check")}
        ${
          paragraph.requirements.length
            ? paragraph.requirements.map((requirement) => renderRequirementEditor(game, requirement)).join("")
            : '<p class="copy">No variable checks.</p>'
        }
        <div class="rule-add-wrap">
          <button class="list-add-fab" type="button" data-action="add-paragraph-variable-check" title="Add check variable">+</button>
        </div>
      </div>

    </div>
  `;
}

function renderOptionInspector(game, node, option) {
  const actionMenuId = buildFloatingActionMenuKey("option", node.id, option.id);
  const actionMenuOpen = appState.selection.floatingActionMenuId === actionMenuId;
  return `
    <div class="form-block">
      <div class="floating-panel-head">
        <strong>${escapeHtml(option.text || "Untitled option")}</strong>
        <div class="floating-panel-actions">
          <div class="menu-wrap">
            <button class="button small ghost menu-button panel-icon-button" type="button" data-action="toggle-floating-action-menu" data-floating-action-menu-id="${escapeAttr(
              actionMenuId
            )}">···</button>
            ${
              actionMenuOpen
                ? `
                    <div class="popover-menu">
                      <button class="popover-item" type="button" data-action="duplicate-option-inline" data-node-id="${escapeAttr(
                        node.id
                      )}" data-option-id="${escapeAttr(option.id)}">Duplicate</button>
                      <button class="popover-item" type="button" data-action="delete-option-inline" data-node-id="${escapeAttr(
                        node.id
                      )}" data-option-id="${escapeAttr(option.id)}">Delete</button>
                    </div>
                  `
                : ""
            }
          </div>
          <button class="button small ghost panel-icon-button" type="button" data-action="clear-option-selection" aria-label="Close option panel">&times;</button>
        </div>
      </div>

      <div class="field-group">
        <label>Text</label>
        <textarea class="textarea" data-node-id="${escapeAttr(node.id)}" data-option-id="${escapeAttr(
          option.id
        )}" data-option-field="text">${escapeHtml(option.text)}</textarea>
      </div>

      <div class="field-group">
        <label>Target behavior</label>
        ${renderSelectControl({
          menuId: `option:${option.id}:terminal`,
          value: option.terminal,
          className: "select-menu-fit select-width-target",
          attributes: { "data-option-field": "terminal" },
          options: TERMINAL_OPTIONS,
        })}
      </div>

      <div class="item-card">
        <div class="option-meta-row">
          <div class="section-heading">
            ${renderRuleIcon("effects", true)}
            <strong>Set Variable</strong>
          </div>
          <div class="option-meta-controls">
            <div class="option-meta-inline">
              <label>Set Variable Display:</label>
              ${renderSelectControl({
                menuId: `option:${option.id}:effectDisplayMode`,
                value: option.effectDisplayMode,
                className: "select-menu-fit select-width-display",
                attributes: { "data-option-field": "effectDisplayMode" },
                options: DISPLAY_OPTIONS,
              })}
            </div>
          </div>
        </div>
        ${
          option.effectDisplayMode === "custom"
            ? `
              <div class="field-group">
                <label>Custom Set Variable Text</label>
                <input class="field" data-option-field="effectDisplayText" value="${escapeAttr(
                  option.effectDisplayText
                )}" />
              </div>
            `
            : ""
        }
        ${renderRuleTableHeader("set")}
        ${
          option.variableEffects.length
            ? option.variableEffects.map((effect) => renderVariableEffectEditor(game, effect)).join("")
            : '<p class="copy">No set-variable rules.</p>'
        }
        <div class="rule-add-wrap">
          <button class="list-add-fab" type="button" data-action="add-variable-effect" title="Add set variable">+</button>
        </div>
      </div>

      <div class="item-card">
        <div class="option-meta-row">
          <div class="section-heading">
            ${renderRuleIcon("checks", true)}
            <strong>Check Variable</strong>
          </div>
          <div class="option-meta-controls">
            <div class="option-meta-inline">
              <label>Failed Variable Check:</label>
              ${renderSelectControl({
                menuId: `option:${option.id}:failureMode`,
                value: option.failureMode,
                className: "select-menu-fit select-width-failure",
                attributes: { "data-option-field": "failureMode" },
                options: FAILURE_OPTIONS,
              })}
            </div>
            <div class="option-meta-inline">
              <label>Variable Check Display:</label>
              ${renderSelectControl({
                menuId: `option:${option.id}:requirementDisplayMode`,
                value: option.requirementDisplayMode,
                className: "select-menu-fit select-width-display",
                attributes: { "data-option-field": "requirementDisplayMode" },
                options: DISPLAY_OPTIONS,
              })}
            </div>
          </div>
        </div>
        ${
          option.requirementDisplayMode === "custom"
            ? `
              <div class="field-group">
                <label>Custom Variable Check Text</label>
                <input class="field" data-option-field="requirementDisplayText" value="${escapeAttr(
                  option.requirementDisplayText
                )}" />
              </div>
            `
            : ""
        }
        ${renderRuleTableHeader("check")}
        ${
          option.requirements.length
            ? option.requirements.map((requirement) => renderRequirementEditor(game, requirement)).join("")
            : '<p class="copy">No variable checks.</p>'
        }
        <div class="rule-add-wrap">
          <button class="list-add-fab" type="button" data-action="add-variable-check" title="Add check variable">+</button>
        </div>
      </div>

    </div>
  `;
}

function renderLogicNodeInspector(game, logicNode) {
  return `
    <div class="form-block">
      <div class="floating-panel-head">
        <strong>${escapeHtml(logicNode.name || "Logic Node")}</strong>
        <div class="floating-panel-actions">
          <button class="button small ghost panel-icon-button" type="button" data-action="clear-logic-node-selection" aria-label="Close logic panel">&times;</button>
        </div>
      </div>

      <div class="field-group">
        <label>Name</label>
        <input class="field" data-logic-node-field="name" value="${escapeAttr(logicNode.name)}" />
      </div>

      <div class="field-group">
        <label>Continue to</label>
        ${renderSelectControl({
          menuId: `logic:${logicNode.id}:targetNodeId`,
          value: logicNode.targetNodeId || "",
          attributes: { "data-logic-node-field": "targetNodeId" },
          options: [{ value: "", label: "Unassigned" }, ...getPassTargetOptions(game)],
        })}
      </div>

      <div class="item-card">
        <div class="inline-row">
          <strong>Triggers</strong>
          <button class="button small secondary" type="button" data-action="add-logic-trigger">Add Trigger</button>
        </div>
        ${
          logicNode.triggers.length
            ? logicNode.triggers.map((trigger) => renderLogicTriggerEditor(game, trigger)).join("")
            : '<p class="copy">No triggers configured.</p>'
        }
      </div>

      <div class="item-card">
        <div class="inline-row">
          <strong>Actions</strong>
          <button class="button small secondary" type="button" data-action="add-logic-action">Add Action</button>
        </div>
        ${
          logicNode.actions.length
            ? logicNode.actions.map((action) => renderLogicActionEditor(game, action)).join("")
            : '<p class="copy">No actions configured.</p>'
        }
      </div>

      <div class="item-actions">
        <button class="button small ghost" type="button" data-action="duplicate-logic-node">Duplicate</button>
        <button class="button small ghost" type="button" data-action="delete-logic-node">Delete</button>
      </div>
    </div>
  `;
}

function renderLogicTriggerEditor(game, trigger) {
  const triggerTypeOptions = [
    { value: "passSelf", label: "Player passes this logic node" },
    { value: "passNode", label: "Player passes a node" },
    { value: "passAnyNode", label: "Player passes any node" },
    { value: "variableChange", label: "Variable changes" },
    { value: "event", label: "Event happens" },
  ];

  return `
    <div class="item-card">
      <div class="inline-row">
        <strong>Trigger</strong>
        <button class="button small ghost" type="button" data-action="remove-logic-trigger" data-logic-trigger-id="${escapeAttr(
          trigger.id
        )}">Remove</button>
      </div>
      <div class="field-group">
        <label>Type</label>
        ${renderSelectControl({
          menuId: `logic-trigger:${trigger.id}:kind`,
          value: trigger.kind,
          attributes: {
            "data-logic-trigger-id": trigger.id,
            "data-logic-trigger-field": "kind",
          },
          options: triggerTypeOptions,
        })}
      </div>
      ${
        trigger.kind === "passNode"
          ? `
            <div class="field-group">
              <label>Node</label>
              ${renderSelectControl({
                menuId: `logic-trigger:${trigger.id}:targetNodeId`,
                value: trigger.targetNodeId || "",
                attributes: {
                  "data-logic-trigger-id": trigger.id,
                  "data-logic-trigger-field": "targetNodeId",
                },
                options: getPassTargetOptions(game),
              })}
            </div>
          `
          : ""
      }
      ${
        trigger.kind === "variableChange"
          ? renderLogicVariableChangeFields(game, trigger)
          : ""
      }
      ${
        trigger.kind === "event"
          ? `
            <div class="field-group">
              <label>Event name</label>
              <input class="field" data-logic-trigger-id="${escapeAttr(trigger.id)}" data-logic-trigger-field="eventName" value="${escapeAttr(
                trigger.eventName
              )}" />
            </div>
          `
          : ""
      }
    </div>
  `;
}

function renderLogicVariableChangeFields(game, trigger) {
  return `
    <div class="field-group">
      <label>Variable type</label>
      ${renderSelectControl({
        menuId: `logic-trigger:${trigger.id}:variableType`,
        value: trigger.variableType,
        attributes: {
          "data-logic-trigger-id": trigger.id,
          "data-logic-trigger-field": "variableType",
        },
        options: [
          { value: "tracker", label: "Integer" },
          { value: "flag", label: "Enum" },
          { value: "profile", label: "Profile" },
          { value: "string", label: "String" },
        ],
      })}
    </div>
    <div class="field-group">
      <label>Variable</label>
      ${renderSelectControl({
        menuId: `logic-trigger:${trigger.id}:variableId`,
        value: trigger.variableId || "",
        attributes: {
          "data-logic-trigger-id": trigger.id,
          "data-logic-trigger-field": "variableId",
        },
        options: getVariableOptions(game, trigger.variableType),
      })}
    </div>
    <div class="field-group">
      <label>Rule</label>
      ${renderSelectControl({
        menuId: `logic-trigger:${trigger.id}:operator`,
        value: trigger.operator,
        attributes: {
          "data-logic-trigger-id": trigger.id,
          "data-logic-trigger-field": "operator",
        },
        options: getLogicVariableTriggerOperatorOptions(trigger.variableType),
      })}
    </div>
    ${
      trigger.operator === "changed" || trigger.operator === "increase" || trigger.operator === "decrease"
        ? ""
        : `
          <div class="field-group">
            <label>Value</label>
            ${renderLogicVariableValueEditor(game, trigger, "trigger")}
          </div>
        `
    }
  `;
}

function renderLogicActionEditor(game, action) {
  const actionTypeOptions = [
    { value: "emitEvent", label: "Emit event" },
    { value: "changeVariable", label: "Change variable" },
    { value: "jumpToNode", label: "Jump to node" },
  ];

  return `
    <div class="item-card">
      <div class="inline-row">
        <strong>Action</strong>
        <button class="button small ghost" type="button" data-action="remove-logic-action" data-logic-action-id="${escapeAttr(
          action.id
        )}">Remove</button>
      </div>
      <div class="field-group">
        <label>Type</label>
        ${renderSelectControl({
          menuId: `logic-action:${action.id}:kind`,
          value: action.kind,
          attributes: {
            "data-logic-action-id": action.id,
            "data-logic-action-field": "kind",
          },
          options: actionTypeOptions,
        })}
      </div>
      ${
        action.kind === "emitEvent"
          ? `
            <div class="field-group">
              <label>Event name</label>
              <input class="field" data-logic-action-id="${escapeAttr(action.id)}" data-logic-action-field="eventName" value="${escapeAttr(
                action.eventName
              )}" />
            </div>
          `
          : ""
      }
      ${
        action.kind === "changeVariable"
          ? `
            <div class="field-group">
              <label>Change</label>
              ${renderSelectControl({
                menuId: `logic-action:${action.id}:action`,
                value: action.action,
                attributes: {
                  "data-logic-action-id": action.id,
                  "data-logic-action-field": "action",
                },
                options:
                  action.variableType === "tracker"
                    ? [
                        { value: "set", label: "Set to" },
                        { value: "increase", label: "Increase by" },
                        { value: "decrease", label: "Decrease by" },
                      ]
                    : [{ value: "set", label: "Set to" }],
              })}
            </div>
            <div class="field-group">
              <label>Variable type</label>
              ${renderSelectControl({
                menuId: `logic-action:${action.id}:variableType`,
                value: action.variableType,
                attributes: {
                  "data-logic-action-id": action.id,
                  "data-logic-action-field": "variableType",
                },
                options: [
                  { value: "tracker", label: "Integer" },
                  { value: "flag", label: "Enum" },
                  { value: "profile", label: "Profile" },
                  { value: "string", label: "String" },
                ],
              })}
            </div>
            <div class="field-group">
              <label>Variable</label>
              ${renderSelectControl({
                menuId: `logic-action:${action.id}:variableId`,
                value: action.variableId || "",
                attributes: {
                  "data-logic-action-id": action.id,
                  "data-logic-action-field": "variableId",
                },
                options: getVariableOptions(game, action.variableType),
              })}
            </div>
            <div class="field-group">
              <label>Value</label>
              ${renderLogicVariableValueEditor(game, action, "action")}
            </div>
          `
          : ""
      }
      ${
        action.kind === "jumpToNode"
          ? `
            <div class="field-group">
              <label>Destination node</label>
              ${renderSelectControl({
                menuId: `logic-action:${action.id}:targetNodeId`,
                value: action.targetNodeId || "",
                attributes: {
                  "data-logic-action-id": action.id,
                  "data-logic-action-field": "targetNodeId",
                },
                options: getPassTargetOptions(game),
              })}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function renderLogicVariableValueEditor(game, entry, ownerKind) {
  const dataAttributes =
    ownerKind === "trigger"
      ? `data-logic-trigger-id="${escapeAttr(entry.id)}" data-logic-trigger-field="value"`
      : `data-logic-action-id="${escapeAttr(entry.id)}" data-logic-action-field="value"`;
  if (entry.variableType === "flag" || entry.variableType === "profile") {
    return renderSelectControl({
      menuId: `logic-${ownerKind}:${entry.id}:value`,
      value: entry.value ?? "__NULL__",
      attributes:
        ownerKind === "trigger"
          ? {
              "data-logic-trigger-id": entry.id,
              "data-logic-trigger-field": "value",
            }
          : {
              "data-logic-action-id": entry.id,
              "data-logic-action-field": "value",
            },
      options: getStatefulRequirementOptions(game, entry.variableType, entry.variableId),
    });
  }
  if (entry.variableType === "string") {
    return `<input class="field" ${dataAttributes} value="${escapeAttr(entry.value ?? "")}" />`;
  }
  return `<input class="field" type="number" ${dataAttributes} value="${escapeAttr(String(entry.value ?? 0))}" />`;
}

function getLogicVariableTriggerOperatorOptions(variableType) {
  if (variableType === "tracker") {
    return [
      { value: "changed", label: "Any change" },
      { value: "increase", label: "Increase" },
      { value: "decrease", label: "Decrease" },
      { value: "=", label: "Equal to" },
      { value: "!=", label: "Not equal to" },
      { value: "<", label: "Less than" },
      { value: ">", label: "Greater than" },
      { value: "<=", label: "Less than or equal to" },
      { value: ">=", label: "Greater than or equal to" },
    ];
  }
  return [
    { value: "changed", label: "Any change" },
    { value: "=", label: "Equal to" },
    { value: "!=", label: "Not equal to" },
  ];
}

function renderRuleTableHeader(kind) {
  const labels =
    kind === "set"
      ? ["Action", "Type", "Variable", "Value"]
      : ["Logic", "Type", "Variable", "Operator", "Value"];

  return `
    <div class="rule-table-header ${kind === "set" ? "rule-table-set" : "rule-table-check"}">
      ${labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
      <span></span>
    </div>
  `;
}

function renderRequirementEditor(game, requirement) {
  const isInteger = requirement.kind === "tracker";
  const valueControl = isInteger
    ? `<input class="field" type="number" data-requirement-id="${escapeAttr(
        requirement.id
      )}" data-requirement-field="value" value="${escapeAttr(String(requirement.value))}" />`
    : renderSelectControl({
        menuId: `requirement:${requirement.id}:state`,
        value: requirement.state ?? "__NULL__",
        attributes: {
          "data-requirement-id": requirement.id,
          "data-requirement-field": "state",
        },
        options: getStatefulRequirementOptions(game, requirement.kind, requirement.targetId),
      });
  const variableOptions = isInteger
    ? game.trackers.map((tracker) => ({ value: tracker.id, label: tracker.name }))
    : getVariableOptions(game, requirement.kind);
  const operatorOptions = isInteger
    ? [
        { value: "=", label: "Equal to" },
        { value: "!=", label: "Not equal to" },
        { value: "<", label: "Less than" },
        { value: ">", label: "Greater than" },
        { value: "<=", label: "Less than or equal to" },
        { value: ">=", label: "Greater than or equal to" },
      ]
    : [
        { value: "=", label: "Equal to" },
        { value: "!=", label: "Not equal to" },
      ];

  return `
    <div class="sentence-row sentence-row-check">
      <div class="sentence-cell">
        ${renderSelectControl({
          menuId: `requirement:${requirement.id}:joinMode`,
          value: requirement.joinMode,
          attributes: {
            "data-requirement-id": requirement.id,
            "data-requirement-field": "joinMode",
          },
          options: REQUIREMENT_JOIN_OPTIONS,
        })}
      </div>
      <div class="sentence-cell">
          ${renderSelectControl({
            menuId: `requirement:${requirement.id}:kind`,
            value: requirement.kind,
            attributes: {
              "data-requirement-id": requirement.id,
              "data-requirement-field": "kind",
            },
            options: [
              { value: "tracker", label: "Integer" },
              { value: "flag", label: "Enum" },
              { value: "profile", label: "Profile" },
            ],
          })}
      </div>
      <div class="sentence-cell">
          ${renderSelectControl({
            menuId: `requirement:${requirement.id}:targetId`,
            value: requirement.targetId || "",
            attributes: {
              "data-requirement-id": requirement.id,
              "data-requirement-field": "targetId",
            },
            options: variableOptions,
          })}
      </div>
      <div class="sentence-cell">
          ${renderSelectControl({
            menuId: `requirement:${requirement.id}:operator`,
            value: requirement.operator,
            attributes: {
              "data-requirement-id": requirement.id,
              "data-requirement-field": "operator",
            },
            options: operatorOptions,
          })}
      </div>
      <div class="sentence-cell">
          ${valueControl}
      </div>
      <button class="button small ghost panel-icon-button sentence-remove" type="button" data-action="remove-requirement" data-requirement-id="${escapeAttr(
        requirement.id
      )}" aria-label="Remove check variable">&times;</button>
    </div>
  `;
}

function renderVariableEffectEditor(game, effect, context = {}) {
  const removeAction = context.removeAction || "remove-variable-effect";
  const extraData = buildDataAttributes(context.extraData);
  const actionOptions =
    effect.variableType === "tracker"
      ? [
          { value: "set", label: "Set to" },
          { value: "increase", label: "Increase by" },
          { value: "decrease", label: "Decrease by" },
        ]
      : [{ value: "set", label: "Set to" }];
  const valueControl =
    effect.variableType === "flag"
      ? renderSelectControl({
          menuId: `effect:${effect.id}:value`,
          value: effect.value ?? "__NULL__",
          attributes: {
            "data-variable-effect-id": effect.id,
            "data-variable-effect-field": "value",
            ...(context.extraData || {}),
          },
          options: getStatefulRequirementOptions(game, "flag", effect.variableId),
        })
      : effect.variableType === "profile"
        ? renderSelectControl({
            menuId: `effect:${effect.id}:value`,
            value: effect.value ?? "__NULL__",
            attributes: {
              "data-variable-effect-id": effect.id,
              "data-variable-effect-field": "value",
              ...(context.extraData || {}),
            },
            options: getStatefulRequirementOptions(game, "profile", effect.variableId),
          })
        : effect.variableType === "string"
          ? `<input class="field" data-variable-effect-id="${escapeAttr(effect.id)}" data-variable-effect-field="value" ${extraData} value="${escapeAttr(
            effect.value ?? ""
          )}" />`
        : `<input class="field" type="number" data-variable-effect-id="${escapeAttr(effect.id)}" data-variable-effect-field="value" ${extraData} value="${escapeAttr(
            String(effect.value ?? 0)
          )}" />`;
  return `
    <div class="sentence-row sentence-row-set">
      <div class="sentence-cell">
        ${renderSelectControl({
          menuId: `effect:${effect.id}:action`,
          value: effect.action,
          attributes: {
            "data-variable-effect-id": effect.id,
            "data-variable-effect-field": "action",
            ...(context.extraData || {}),
          },
          options: actionOptions,
        })}
      </div>
      <div class="sentence-cell">
        ${renderSelectControl({
          menuId: `effect:${effect.id}:variableType`,
          value: effect.variableType,
          attributes: {
            "data-variable-effect-id": effect.id,
            "data-variable-effect-field": "variableType",
            ...(context.extraData || {}),
          },
          options: [
            { value: "tracker", label: "Integer" },
            { value: "flag", label: "Enum" },
            { value: "profile", label: "Profile" },
            { value: "string", label: "String" },
          ],
        })}
      </div>
      <div class="sentence-cell">
        ${renderSelectControl({
          menuId: `effect:${effect.id}:variableId`,
          value: effect.variableId || "",
          attributes: {
            "data-variable-effect-id": effect.id,
            "data-variable-effect-field": "variableId",
            ...(context.extraData || {}),
          },
          options: getVariableOptions(game, effect.variableType),
        })}
      </div>
      <div class="sentence-cell">
          ${valueControl}
      </div>
      <button class="button small ghost panel-icon-button sentence-remove" type="button" data-action="${escapeAttr(removeAction)}" data-variable-effect-id="${escapeAttr(
          effect.id
        )}" ${extraData} aria-label="Remove set variable">&times;</button>
    </div>
  `;
}

function getVariableOptions(game, variableType) {
  const source =
    variableType === "flag"
      ? game.flags
      : variableType === "profile"
        ? game.profiles
        : variableType === "string"
          ? game.strings
          : game.trackers;

  return source.map((entry) => ({
    value: entry.id,
    label: entry.name || entry.id,
  }));
}

function getStatefulRequirementOptions(game, kind, variableId) {
  if (kind === "profile") {
    const profile = getProfileById(game, variableId);
    return getStateOptions(profile?.states || []);
  }
  return getFlagStateOptions(game, variableId);
}

function getNodeOptions(game) {
  return game.nodes.map((node) => ({
    value: node.id,
    label: node.id,
  }));
}

function getPassTargetOptions(game) {
  return [
    ...game.nodes.map((node) => ({
      value: node.id,
      label: node.id,
    })),
    ...(game.logicNodes || []).map((logicNode) => ({
      value: logicNode.id,
      label: logicNode.id,
    })),
    ...(game.endNode?.placed
      ? [
          {
            value: game.endNode.id,
            label: game.endNode.id,
          },
        ]
      : []),
  ];
}

function getPassTargetLabel(game, targetId) {
  const target = getPassTargetById(game, targetId);
  if (!target) {
    return "";
  }
  return target.id;
}

function getSpecialNodeByKind(game, kind) {
  if (!game || !kind) {
    return null;
  }
  return kind === "start" ? game.startNode : kind === "end" ? game.endNode : null;
}

function isStoryNodeId(game, nodeId) {
  return Boolean(getNodeById(game, nodeId));
}

function getFlagStateOptions(game, flagId) {
  const flag = getFlagById(game, flagId);
  const states = [null, ...(flag?.states ?? [])];

  return states.map((state) => ({
    value: state === null ? "__NULL__" : state,
    label: state === null ? "null" : state,
  }));
}

function getStateOptions(states) {
  return [null, ...states].map((stateEntry) => {
    const state = typeof stateEntry === "string" ? stateEntry : stateEntry?.name ?? null;
    return {
      value: state === null ? "__NULL__" : state,
      label: state === null ? "null" : state,
    };
  });
}

function buildDataAttributes(attributes = {}) {
  return Object.entries(attributes)
    .filter(([_key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}="${escapeAttr(String(value))}"`)
    .join(" ");
}

function renderGraph(game) {
  refs.graphZoomLabel.textContent = `${Math.round(appState.graph.zoom * 100)}%`;
  applyGraphTransform();

  if (!game.nodes.length && !game.clusters.length && !game.logicNodes.length) {
    refs.graphNodes.innerHTML = `<div class="empty-graph">Add a message node to begin authoring.</div>`;
    refs.graphConnections.innerHTML = "";
    refs.graphOverlays.innerHTML = "";
    return;
  }

  refs.graphNodes.innerHTML = [
    renderGraphSpecialNode(game, game.startNode),
    ...(game.endNode?.placed ? [renderGraphSpecialNode(game, game.endNode)] : []),
    ...game.clusters.map((cluster) => renderGraphCluster(game, cluster)),
    ...(game.logicNodes || []).map((logicNode) => renderGraphLogicNode(game, logicNode)),
    ...game.nodes.map((node) => renderGraphNode(game, node)),
  ]
    .join("");

  refs.graphConnections.innerHTML = buildConnectionPaths(game);
  refs.graphOverlays.innerHTML = renderGraphFloatingPanels(game);
}

function renderGraphCluster(game, cluster) {
  const selectedCluster = appState.selection.clusterId === cluster.id;
  const targetNode = cluster.targetNodeId ? getPassTargetById(game, cluster.targetNodeId) : null;

  return `
    <article
      class="graph-cluster ${selectedCluster ? "selected" : ""}"
      data-cluster-id="${escapeAttr(cluster.id)}"
      style="transform: translate(${cluster.position.x}px, ${cluster.position.y}px);"
    >
      <button class="cluster-handle cluster-handle-in" type="button" data-cluster-inlet-id="${escapeAttr(
        cluster.id
      )}" data-connect-target-cluster-id="${escapeAttr(cluster.id)}" title="Connect into cluster"></button>
      <div class="cluster-shell" data-drag-cluster-id="${escapeAttr(cluster.id)}">
        <p class="cluster-label">${escapeHtml(cluster.name || "Cluster")}</p>
        <p class="cluster-target">${escapeHtml(targetNode?.id || "No target node")}</p>
      </div>
      <button class="cluster-handle cluster-handle-out" type="button" data-connect-cluster-id="${escapeAttr(
        cluster.id
      )}" title="Connect cluster to message"></button>
    </article>
  `;
}

function renderGraphLogicNode(game, logicNode) {
  const selectedLogicNode = appState.selection.logicNodeId === logicNode.id;
  const targetNode = logicNode.targetNodeId ? getPassTargetById(game, logicNode.targetNodeId) : null;
  const triggerCount = logicNode.triggers.length;
  const actionCount = logicNode.actions.length;

  return `
    <article
      class="graph-logic-node ${selectedLogicNode ? "selected" : ""}"
      data-logic-node-id="${escapeAttr(logicNode.id)}"
      style="transform: translate(${logicNode.position.x}px, ${logicNode.position.y}px);"
    >
      <button class="logic-node-handle logic-node-handle-in" type="button" data-node-inlet-id="${escapeAttr(
        logicNode.id
      )}" data-connect-target-node-id="${escapeAttr(logicNode.id)}" title="Connect into logic node"></button>
      <div class="logic-node-shell" data-drag-logic-node-id="${escapeAttr(logicNode.id)}">
        <p class="special-node-code">${escapeHtml(logicNode.id)}</p>
        <p class="logic-node-label">${escapeHtml(logicNode.name || "Logic Node")}</p>
        <p class="logic-node-meta">${triggerCount} trigger${triggerCount === 1 ? "" : "s"} · ${actionCount} action${actionCount === 1 ? "" : "s"}</p>
        <p class="logic-node-target">${escapeHtml(targetNode?.id || "No continue target")}</p>
      </div>
      <button class="logic-node-handle logic-node-handle-out" type="button" data-connect-logic-node-id="${escapeAttr(
        logicNode.id
      )}" title="Connect logic node"></button>
    </article>
  `;
}

function renderGraphSpecialNode(game, specialNode) {
  const selected =
    appState.selection.specialNodeKind === specialNode.kind &&
    !appState.selection.nodeId &&
    !appState.selection.logicNodeId &&
    !appState.selection.clusterId;
  const targetId = specialNode.targetNodeId ? getPassTargetById(game, specialNode.targetNodeId)?.id || specialNode.targetNodeId : null;

  return `
    <article
      class="graph-special-node ${selected ? "selected" : ""}"
      data-special-node-kind="${escapeAttr(specialNode.kind)}"
      style="transform: translate(${specialNode.position.x}px, ${specialNode.position.y}px);"
    >
      ${
        specialNode.kind === "end"
          ? `<button class="special-node-handle special-node-handle-in" type="button" data-node-inlet-id="${escapeAttr(
              specialNode.id
            )}" data-connect-target-node-id="${escapeAttr(specialNode.id)}" title="Connect into end node"></button>`
          : ""
      }
      <div class="special-node-shell ${specialNode.kind === "end" ? "end-node" : ""}" ${
        specialNode.kind === "start" ? `data-drag-start-node="true"` : `data-drag-end-node="true"`
      }>
        <p class="special-node-code">${escapeHtml(specialNode.id)}</p>
        <p class="special-node-label">${escapeHtml(specialNode.name)}</p>
        <p class="special-node-target">${
          specialNode.kind === "start"
            ? escapeHtml(targetId || "No target node")
            : "Game ends here"
        }</p>
      </div>
      ${
        specialNode.kind === "start"
          ? `<button class="special-node-handle special-node-handle-out" type="button" data-connect-start-node="true" title="Connect start node"></button>`
          : ""
      }
    </article>
  `;
}

function renderGraphNode(game, node) {
  const selectedNode = appState.selection.nodeId === node.id;
  const menuOpen = appState.selection.nodeMenuId === node.id;

  return `
    <article
      class="graph-node ${selectedNode ? "selected" : ""}"
      data-node-id="${escapeAttr(node.id)}"
      style="transform: translate(${node.position.x}px, ${node.position.y}px);"
    >
      <span class="node-inlet" data-node-inlet-id="${escapeAttr(node.id)}" data-connect-target-node-id="${escapeAttr(
        node.id
      )}"></span>
      <div class="node-shell">
        <div class="node-topline" data-drag-node-id="${escapeAttr(node.id)}">
          <div>
            <h3>Story Node</h3>
            <p class="node-code">${escapeHtml(node.id)}</p>
          </div>
          <div class="menu-wrap">
            <button class="button small ghost menu-button node-menu-button" type="button" data-action="toggle-node-menu" data-node-id="${escapeAttr(
              node.id
            )}">···</button>
            ${
              menuOpen
                ? `
                    <div class="popover-menu">
                      <button class="popover-item" type="button" data-action="duplicate-node-inline" data-node-id="${escapeAttr(
                        node.id
                      )}">Duplicate</button>
                      <button class="popover-item" type="button" data-action="add-option-inline" data-node-id="${escapeAttr(
                        node.id
                      )}">Add option</button>
                      <button class="popover-item" type="button" data-action="delete-node-inline" data-node-id="${escapeAttr(
                        node.id
                      )}" ${game.nodes.length === 1 ? "disabled" : ""}>Delete</button>
                    </div>
                  `
                : ""
            }
          </div>
        </div>
        ${renderNodeInlineEditor(game, node)}
      </div>
    </article>
  `;
}

function renderNodeReadOnlyBody(game, node) {
  const secondaryLine = buildNodeSecondaryLine(game, node);

  return `
    <div class="node-readonly">
      ${secondaryLine ? `<p class="node-summary-secondary">${escapeHtml(secondaryLine)}</p>` : ""}
      <div class="field-group">
        <label>Paragraphs</label>
        <div class="node-block-list">
          ${node.paragraphs.map((paragraph) => renderNodeParagraphReadOnlyRow(game, node, paragraph)).join("")}
        </div>
      </div>
      <div class="field-group">
        <label>Options</label>
        <div class="node-options">
          ${
            node.options.length
              ? node.options.map((option) => renderNodeOptionRow(game, node, option)).join("")
              : '<div class="node-option"><div class="node-option-meta"><strong>No options yet.</strong><small>Add an option to branch from this message.</small></div></div>'
          }
        </div>
      </div>
    </div>
  `;
}

function renderNodeInlineEditor(game, node) {
  return `
    <div class="node-edit-grid">
      <div class="field-group">
        <input class="field" aria-label="Reference ID" placeholder="Reference ID" data-node-id="${escapeAttr(
          node.id
        )}" data-node-field="id" value="${escapeAttr(node.id)}" />
      </div>
      <div class="field-group">
        <input class="field" aria-label="Title" placeholder="Title" data-node-id="${escapeAttr(
          node.id
        )}" data-node-field="name" value="${escapeAttr(node.name)}" />
      </div>
      <div class="field-group">
        <input class="field" aria-label="Subtitle" placeholder="Subtitle" data-node-id="${escapeAttr(
          node.id
        )}" data-node-field="secondary" value="${escapeAttr(node.secondary)}" />
      </div>
      <div class="field-group">
        <label>Paragraphs</label>
        <div class="node-block-list">
          ${node.paragraphs.map((paragraph) => renderNodeParagraphRow(game, node, paragraph)).join("")}
          <div class="node-option-add">
            <button class="list-add-fab node-add-fab" type="button" data-action="add-paragraph-inline" data-node-id="${escapeAttr(
              node.id
            )}" title="Add paragraph">+</button>
          </div>
        </div>
      </div>
      <div class="field-group">
        <label>Options</label>
        <div class="node-options">
          ${
            node.options.length
              ? node.options.map((option) => renderNodeOptionRow(game, node, option)).join("")
              : '<div class="node-option"><div class="node-option-meta"><strong>No options yet.</strong><small>Add an option to branch from this message.</small></div></div>'
          }
          <div class="node-option-add">
            <button class="list-add-fab node-add-fab" type="button" data-action="add-option-inline" data-node-id="${escapeAttr(
              node.id
            )}" title="Add option">+</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNodeParagraphReadOnlyRow(_game, node, paragraph) {
  const hasText = paragraph.text.trim().length > 0;

  return `
    <div class="node-paragraph node-paragraph-readonly" data-node-id="${escapeAttr(node.id)}" data-paragraph-id="${escapeAttr(
      paragraph.id
    )}">
      <div class="node-block-head">
        <div class="node-rule-icons">
          ${renderRequirementIcons(paragraph.requirements, "paragraph")}
        </div>
      </div>
      ${
        hasText
          ? `<p class="node-paragraph-copy">${escapeHtml(paragraph.text)}</p>`
          : `<p class="node-paragraph-copy node-paragraph-copy-empty">No text yet.</p>`
      }
    </div>
  `;
}

function renderNodeParagraphRow(_game, node, paragraph) {
  const selectedParagraph = appState.selection.nodeId === node.id && appState.selection.paragraphId === paragraph.id;
  const draggingParagraph =
    appState.drag?.type === "reorderParagraph" && appState.drag.nodeId === node.id && appState.drag.itemId === paragraph.id;

  return `
    <div class="node-paragraph ${selectedParagraph ? "selected" : ""} ${draggingParagraph ? "is-dragging" : ""}" data-node-id="${escapeAttr(
      node.id
    )}" data-paragraph-id="${escapeAttr(paragraph.id)}">
      <div class="node-block-head">
        <div class="node-rule-icons">
          ${renderRequirementIcons(paragraph.requirements, "paragraph")}
        </div>
      </div>
      <div class="node-paragraph-text node-text-static">${escapeHtml(paragraph.text)}</div>
    </div>
  `;
}

function renderNodeOptionRow(game, node, option) {
  const selectedOption = appState.selection.nodeId === node.id && appState.selection.optionId === option.id;
  const draggingOption =
    appState.drag?.type === "reorderOption" && appState.drag.nodeId === node.id && appState.drag.itemId === option.id;

  return `
    <div class="node-option ${selectedOption ? "selected" : ""} ${draggingOption ? "is-dragging" : ""}" data-node-id="${escapeAttr(node.id)}" data-option-id="${escapeAttr(
      option.id
    )}">
      <div class="node-block-head">
        <div class="node-rule-icons">
          ${renderRequirementIcons(option.requirements, "option", option.failureMode, option.variableEffects)}
        </div>
      </div>
      <div class="node-option-meta">
        <div class="node-option-text node-text-static">${escapeHtml(option.text)}</div>
      </div>
      <div class="node-option-actions">
        <button class="option-handle" type="button" data-connect-option-id="${escapeAttr(
          option.id
        )}" data-node-id="${escapeAttr(node.id)}" title="Connect option"></button>
      </div>
    </div>
  `;
}

function renderGraphFloatingPanels(game) {
  const parts = [];

  if (appState.selection.paragraphMenuId) {
    const [nodeId, paragraphId] = appState.selection.paragraphMenuId.split(":");
    const node = getNodeById(game, nodeId);
    const paragraph = getParagraphById(node, paragraphId);
    const anchor = getFloatingPanelAnchor(`.node-paragraph[data-node-id="${nodeId}"][data-paragraph-id="${paragraphId}"]`);
    if (node && paragraph && anchor) {
      parts.push(renderParagraphFloatingMenu(game, node, paragraph, anchor));
    }
  }

  if (appState.selection.optionMenuId) {
    const [nodeId, optionId] = appState.selection.optionMenuId.split(":");
    const node = getNodeById(game, nodeId);
    const option = getOptionById(node, optionId);
    const anchor = getFloatingPanelAnchor(`.node-option[data-node-id="${nodeId}"][data-option-id="${optionId}"]`);
    if (node && option && anchor) {
      parts.push(renderOptionFloatingMenu(game, node, option, anchor));
    }
  }

  if (appState.selection.logicNodeMenuId) {
    const logicNode = getLogicNodeById(game, appState.selection.logicNodeMenuId);
    const anchor = getFloatingPanelAnchor(`.graph-logic-node[data-logic-node-id="${appState.selection.logicNodeMenuId}"]`);
    if (logicNode && anchor) {
      parts.push(renderLogicNodeFloatingMenu(game, logicNode, anchor));
    }
  }

  return parts.join("");
}

function getFloatingPanelAnchor(selector) {
  const element = refs.graphNodes.querySelector(selector);
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const point = clientPointToWorld(rect.right + 8, rect.top + rect.height / 2);
  return `left:${point.x}px; top:${point.y}px;`;
}

function renderParagraphFloatingMenu(game, node, paragraph, positionStyle) {
  return `
    <div class="floating-node-panel" style="${positionStyle}">
      <div class="floating-node-panel-shell">
        ${renderParagraphInspector(game, node, paragraph)}
      </div>
    </div>
  `;
}

function renderOptionFloatingMenu(game, node, option, positionStyle) {
  return `
    <div class="floating-node-panel" style="${positionStyle}">
      <div class="floating-node-panel-shell">
        ${renderOptionInspector(game, node, option)}
      </div>
    </div>
  `;
}

function renderLogicNodeFloatingMenu(game, logicNode, positionStyle) {
  return `
    <div class="floating-node-panel" style="${positionStyle}">
      <div class="floating-node-panel-shell">
        ${renderLogicNodeInspector(game, logicNode)}
      </div>
    </div>
  `;
}

function renderRequirementIcons(requirements, kind, failureMode = "disabled", variableEffects = []) {
  const hasRequirements = requirements.length > 0;
  const parts = [
    renderRuleIcon("checks", hasRequirements),
  ];

  if (kind === "option") {
    parts.push(renderRuleIcon("effects", variableEffects.length > 0));
    parts.push(renderRuleIcon("hidden", hasRequirements && failureMode === "hidden"));
    parts.push(renderRuleIcon("disabled", hasRequirements && failureMode === "disabled"));
  }

  return parts.join("");
}

function renderRuleIcon(kind, active) {
  const labels = {
    checks: "Checks variables",
    effects: "Sets variables",
    hidden: "Hidden when unmet",
    disabled: "Disabled when unmet",
  };
  return `
    <span class="rule-icon ${active ? "active" : "inactive"}" title="${escapeAttr(labels[kind])}">
      ${renderRuleIconSvg(kind)}
    </span>
  `;
}

function renderRuleIconSvg(kind) {
  switch (kind) {
    case "checks":
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h7M3 8h5M3 11.5h4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4"/><path d="M10.2 10.1 11.5 11.4 14 8.9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"/></svg>';
    case "effects":
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4"/><path d="M4 13h8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.2" opacity="0.7"/></svg>';
    case "hidden":
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.4 8c1.3-2.1 3.2-3.1 5.6-3.1 2.4 0 4.3 1 5.6 3.1-1.3 2.1-3.2 3.1-5.6 3.1-2.4 0-4.3-1-5.6-3.1Zm0 0 11.2 0M5 11l6-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"/></svg>';
    case "disabled":
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.2 7V5.6A2.8 2.8 0 0 1 8 2.8a2.8 2.8 0 0 1 2.8 2.8V7M4.2 7h7.6v6H4.2z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.2"/></svg>';
    default:
      return "";
  }
}

function getNodeEditorBody(node) {
  return node.paragraphs.map((paragraph) => paragraph.text).filter(Boolean).join("\n\n");
}

function getNodeRuntimeBody(game, playState, node) {
  return node.paragraphs
    .filter((paragraph) => evaluateParagraphVisibility(game, playState, paragraph))
    .map((paragraph) => paragraph.text)
    .filter(Boolean)
    .join("\n\n");
}

function interpolateText(game, playState, text) {
  return String(text || "").replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, token) => {
    const key = String(token || "").trim();
    if (!key) {
      return "";
    }

    const stringEntry = game.strings.find((entry) => entry.name === key);
    if (stringEntry) {
      return playState.strings?.[stringEntry.id] ?? stringEntry.startValue;
    }

    const enumEntry = game.flags.find((entry) => entry.name === key);
    if (enumEntry) {
      const value = playState.flags?.[enumEntry.id];
      return value === null || value === undefined ? "" : String(value);
    }

    const profileEntry = game.profiles.find((entry) => entry.name === key);
    if (profileEntry) {
      const value = playState.profiles?.[profileEntry.id];
      return value === null || value === undefined ? "" : String(value);
    }

    const integerEntry = game.trackers.find((entry) => entry.name === key);
    if (integerEntry) {
      return String(playState.trackers?.[integerEntry.id] ?? integerEntry.startValue ?? "");
    }

    return "";
  });
}

function buildConnectionPaths(game) {
  const paths = [];

  if (game.startNode?.targetNodeId) {
    const start = getWorldPointForElement(`[data-connect-start-node="true"]`);
    const end = getWorldPointForElement(`[data-node-inlet-id="${escapeAttr(game.startNode.targetNodeId)}"]`);
    if (start && end) {
      paths.push(renderConnectionPath(start, end, "cluster-link"));
    }
  }

  game.nodes.forEach((node) => {
    node.options.forEach((option) => {
      if (option.terminal !== "target") {
        return;
      }

      const start = getWorldPointForElement(`[data-connect-option-id="${escapeAttr(option.id)}"]`);
      const end = option.targetClusterId
        ? getWorldPointForElement(`[data-cluster-inlet-id="${escapeAttr(option.targetClusterId)}"]`)
        : option.targetNodeId
          ? getWorldPointForElement(`[data-node-inlet-id="${escapeAttr(option.targetNodeId)}"]`)
          : null;
      if (!start || !end) {
        return;
      }

      paths.push(renderConnectionPath(start, end));
    });
  });

  game.clusters.forEach((cluster) => {
    if (!cluster.targetNodeId) {
      return;
    }

    const start = getWorldPointForElement(`[data-connect-cluster-id="${escapeAttr(cluster.id)}"]`);
    const end = getWorldPointForElement(`[data-node-inlet-id="${escapeAttr(cluster.targetNodeId)}"]`);
    if (!start || !end) {
      return;
    }

    paths.push(renderConnectionPath(start, end, "cluster-link"));
  });

  (game.logicNodes || []).forEach((logicNode) => {
    if (!logicNode.targetNodeId) {
      return;
    }

    const start = getWorldPointForElement(`[data-connect-logic-node-id="${escapeAttr(logicNode.id)}"]`);
    const end = getWorldPointForElement(`[data-node-inlet-id="${escapeAttr(logicNode.targetNodeId)}"]`);
    if (!start || !end) {
      return;
    }

    paths.push(renderConnectionPath(start, end, "cluster-link"));
  });

  if (appState.drag?.type === "connect" || appState.drag?.type === "connectCluster" || appState.drag?.type === "connectLogicNode" || appState.drag?.type === "connectStartNode") {
    const start = appState.drag.type === "connect"
      ? getWorldPointForElement(`[data-connect-option-id="${escapeAttr(appState.drag.optionId)}"]`)
      : appState.drag.type === "connectCluster"
        ? getWorldPointForElement(`[data-connect-cluster-id="${escapeAttr(appState.drag.clusterId)}"]`)
        : appState.drag.type === "connectLogicNode"
          ? getWorldPointForElement(`[data-connect-logic-node-id="${escapeAttr(appState.drag.logicNodeId)}"]`)
          : getWorldPointForElement(`[data-connect-start-node="true"]`);
    const end = clientPointToWorld(appState.drag.pointerX, appState.drag.pointerY);
    if (start && end) {
      paths.push(renderConnectionPath(start, end, "preview"));
    }
  }

  return paths.join("");
}

function renderConnectionPath(start, end, extraClass = "") {
  const delta = Math.max(72, Math.abs(end.x - start.x) / 2);
  return `<path class="connection-path ${extraClass}" d="M ${start.x} ${start.y} C ${start.x + delta} ${start.y}, ${
    end.x - delta
  } ${end.y}, ${end.x} ${end.y}" />`;
}

function getWorldPointForElement(selector) {
  const element = refs.graphNodes.querySelector(selector);
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  return clientPointToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

function clientPointToWorld(clientX, clientY) {
  const worldRect = refs.graphWorld.getBoundingClientRect();
  return {
    x: (clientX - worldRect.left) / appState.graph.zoom,
    y: (clientY - worldRect.top) / appState.graph.zoom,
  };
}

function handleHomeClick(event) {
  const action = event.target.closest("[data-action]")?.dataset.action;

  switch (action) {
    case "home-play-load":
      refs.playGameInput.click();
      break;
    case "home-play-draft":
      if (appState.createGame) {
        startPlayFromGame(clone(appState.createGame), { fromDraft: true });
      }
      break;
    case "home-create-new":
      appState.createGame = createGameScaffold();
      normalizeEditorSelection();
      persistEditorDraft();
      switchView("create");
      requestAnimationFrame(centerGraph);
      break;
    case "home-create-load":
      refs.createGameInput.click();
      break;
    case "home-create-draft":
      if (appState.createGame) {
        normalizeEditorSelection();
        switchView("create");
      }
      break;
    default:
      break;
  }
}

async function handlePlayGameImport(event) {
  const [file] = event.target.files ?? [];
  if (!file) {
    return;
  }

  try {
    const raw = await readFileText(file);
    const parsed = JSON.parse(raw);
    startPlayFromGame(normalizeGame(parsed), { fromDraft: false });
  } catch (error) {
    console.error(error);
    window.alert("That game file could not be loaded.");
  } finally {
    event.target.value = "";
  }
}

async function handleCreateGameImport(event) {
  const [file] = event.target.files ?? [];
  if (!file) {
    return;
  }

  try {
    const raw = await readFileText(file);
    const parsed = JSON.parse(raw);
    appState.createGame = normalizeGame(parsed);
    normalizeEditorSelection();
    persistEditorDraft();
    switchView("create");
  } catch (error) {
    console.error(error);
    window.alert("That game file could not be opened in the editor.");
  } finally {
    event.target.value = "";
  }
}

async function handlePlaySaveImport(event) {
  const [file] = event.target.files ?? [];
  if (!file) {
    return;
  }

  if (!appState.playGame) {
    window.alert("Load a game before importing a save.");
    event.target.value = "";
    return;
  }

  try {
    const raw = await readFileText(file);
    const parsed = JSON.parse(raw);
    const save = normalizePlaySave(parsed.state ?? parsed, appState.playGame);

    if (!save || save.gameId !== getGameCacheKey(appState.playGame)) {
      throw new Error("Save does not match the loaded game.");
    }

    appState.playState = save;
    persistPlayCache();
    renderPlayView();
  } catch (error) {
    console.error(error);
    window.alert("That save file could not be imported.");
  } finally {
    event.target.value = "";
  }
}

function startPlayFromGame(game, { fromDraft }) {
  const validation = validateGame(game);
  const errors = validation.filter((issue) => issue.severity === "error");

  appState.playGame = game;
  appState.playValidation = validation;
  appState.playContext = { fromDraft: Boolean(fromDraft) };

  if (errors.length && !fromDraft) {
    appState.playState = null;
    appState.playError = errors;
    switchView("play");
    return;
  }

  const cached = loadPlayCache(getGameCacheKey(game));
  if (cached && !fromDraft && window.confirm(`Resume the cached run for "${game.metadata.name}"?`)) {
    appState.playState = normalizePlaySave(cached, game);
  } else {
    appState.playState = createPlayState(game);
  }

  appState.playError = null;
  persistPlayCache();
  switchView("play");
}

function handlePlayOptionClick(event) {
  const button = event.target.closest("[data-option-id]");
  if (!button || !appState.playGame || !appState.playState) {
    return;
  }

  const currentNode = getNodeById(appState.playGame, appState.playState.currentNodeId);
  if (!currentNode) {
    return;
  }

  const option = getOptionById(currentNode, button.dataset.optionId);
  if (!option) {
    return;
  }

  const availability = evaluateOptionAvailability(appState.playGame, appState.playState, option);
  if (availability.state !== "selectable") {
    return;
  }

  applyPlayOption(appState.playGame, appState.playState, currentNode, option);
  persistPlayCache();
  renderPlayView();
}

function handlePlayNotesInput(event) {
  if (!appState.playState) {
    return;
  }

  appState.playState.notes = event.target.value;
  appState.playState.updatedAt = new Date().toISOString();
  persistPlayCache();
}

function applyPlayOption(game, playState, currentNode, option) {
  if (playState.status !== "active") {
    return;
  }

  const logicContext = createLogicExecutionContext(game, playState);

  playState.history.push({
    nodeId: currentNode.id,
    optionId: option.id,
  });
  playState.log.push({
    type: "choice",
    text: interpolateText(game, playState, (option.text || "").trim()),
  });

  option.variableEffects.forEach((effect) => {
    applyVariableEffect(game, playState, effect, new Set(), logicContext);
  });

  if (playState.status !== "active") {
    playState.updatedAt = new Date().toISOString();
    return;
  }

  const forcedTargetId = consumeLogicJumpTarget(logicContext);
  const transition = forcedTargetId
    ? { type: "node", nodeId: forcedTargetId }
    : resolveTransition(game, playState, currentNode, option);
  playState.updatedAt = new Date().toISOString();

  if (transition.type === "node") {
    advancePlayStateToTarget(game, playState, transition.nodeId, logicContext);
    return;
  }

  playState.status = "error";
  playState.log.push({
    type: "event",
    label: "Runtime error",
    text: "The option could not determine what happens next.",
  });
}

function appendMessageLog(playState, node) {
  playState.log.push({
    type: "message",
    name: node.name,
    secondary: interpolateText(appState.playGame, playState, buildNodeSecondaryLine(appState.playGame, node)),
    body: interpolateText(appState.playGame, playState, getNodeRuntimeBody(appState.playGame, playState, node)),
  });
}

function advancePlayStateToTarget(game, playState, initialTargetId, logicContext = createLogicExecutionContext(game, playState)) {
  let targetId = initialTargetId;

  while (targetId && playState.status === "active") {
    if (!guardLogicExecution(logicContext)) {
      return;
    }

    const target = getPassTargetById(game, targetId);
    if (!target) {
      playState.status = "error";
      playState.log.push({
        type: "event",
        label: "Runtime error",
        text: "The option target could not be resolved.",
      });
      return;
    }

    dispatchLogicNodePass(game, playState, logicContext, target);
    if (playState.status !== "active") {
      return;
    }

    const jumpTargetId = consumeLogicJumpTarget(logicContext);
    if (jumpTargetId) {
      targetId = jumpTargetId;
      continue;
    }

    if (target.kind === "end") {
      playState.currentNodeId = target.id;
      playState.status = "complete";
      playState.log.push({
        type: "event",
        label: "Game end",
        text: "The game reached the End Node.",
      });
      return;
    }

    const nextNode = getNodeById(game, target.id);
    if (nextNode) {
      playState.currentNodeId = nextNode.id;
      appendMessageLog(playState, nextNode);
      return;
    }

    targetId = target.targetNodeId || null;
    if (!targetId) {
      playState.status = "error";
      playState.log.push({
        type: "event",
        label: "Runtime error",
        text: "A logic node was passed without a continue target or jump action.",
      });
      return;
    }
  }
}

function resolveTransition(game, playState, currentNode, option) {
  if (option.terminal === "target") {
    const targetNodeId = resolveOptionTargetNodeId(game, option);
    return targetNodeId ? { type: "node", nodeId: targetNodeId } : { type: "error" };
  }

  return { type: "error" };
}

function resolveOptionTargetNodeId(game, option) {
  if (option.targetClusterId) {
    return getClusterById(game, option.targetClusterId)?.targetNodeId || null;
  }
  return option.targetNodeId || null;
}

function restartPlaySession() {
  if (!appState.playGame) {
    return;
  }

  if (!window.confirm("Restart the current run and replace the cached state?")) {
    return;
  }

  appState.playState = createPlayState(appState.playGame);
  appState.playError = null;
  persistPlayCache();
  renderPlayView();
}

function rewindTestPlayChoice() {
  if (!appState.playGame || !appState.playState || !appState.playContext.fromDraft) {
    return;
  }

  const replayHistory = appState.playState.history.slice(0, -1);
  const nextState = createPlayState(appState.playGame);
  nextState.notes = appState.playState.notes;

  for (const step of replayHistory) {
    if (nextState.status !== "active") {
      break;
    }

    const currentNode = getNodeById(appState.playGame, nextState.currentNodeId);
    if (!currentNode) {
      break;
    }

    const option = getOptionById(currentNode, step.optionId);
    if (!option) {
      break;
    }

    const availability = evaluateOptionAvailability(appState.playGame, nextState, option);
    if (availability.state !== "selectable") {
      break;
    }

    applyPlayOption(appState.playGame, nextState, currentNode, option);
  }

  nextState.updatedAt = new Date().toISOString();
  appState.playState = nextState;
  persistPlayCache();
  renderPlayView();
}

function exportPlaySave() {
  if (!appState.playState || !appState.playGame) {
    return;
  }

  const payload = {
    format: SAVE_FORMAT,
    version: GAME_VERSION,
    savedAt: new Date().toISOString(),
    gameId: getGameCacheKey(appState.playGame),
    state: serializePlayState(appState.playState),
  };
  const filename = `${slugify(appState.playGame.metadata.name)}-save-${timestampForFile()}.json`;
  downloadTextFile(filename, JSON.stringify(payload, null, 2));
}

function exportEditorGame() {
  if (!appState.createGame) {
    return;
  }

  const filename = `${slugify(appState.createGame.metadata.name)}.json`;
  downloadTextFile(filename, JSON.stringify(serializeGame(appState.createGame), null, 2));
}

function handleTabClick(event) {
  if (handleSelectMenuAction(event.target.closest("[data-action]"))) {
    return;
  }

  const button = event.target.closest("[data-tab-id]");
  if (!button) {
    return;
  }

  appState.createTab = button.dataset.tabId;
  if (appState.createTab !== "trackers") {
    appState.selection.trackerMenuId = null;
  }
  appState.selection.selectMenuId = null;
  renderCreateView();
}

function handleSidebarClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (handleSelectMenuAction(actionElement)) {
    return;
  }
  const action = actionElement?.dataset.action;
  if (!action || !appState.createGame) {
    return;
  }

  switch (action) {
    case "proxy-new":
      refs.editorNewButton.click();
      break;
    case "proxy-load":
      refs.editorLoadButton.click();
      break;
    case "proxy-download":
      refs.editorDownloadButton.click();
      break;
    case "proxy-test":
      refs.editorTestPlayButton.click();
      break;
    case "proxy-home":
      refs.editorBackHomeButton.click();
      break;
    case "add-tracker":
      appState.selection.trackerMenuId = null;
      addTracker();
      break;
    case "toggle-tracker-menu":
      appState.selection.selectMenuId = null;
      appState.selection.trackerMenuId =
        appState.selection.trackerMenuId === actionElement.dataset.trackerId ? null : actionElement.dataset.trackerId;
      renderCreateView();
      break;
    case "duplicate-tracker":
      duplicateTracker(actionElement.dataset.trackerId);
      break;
    case "delete-tracker":
      appState.createGame.trackers = appState.createGame.trackers.filter(
        (tracker) => tracker.id !== actionElement.dataset.trackerId
      );
      appState.selection.trackerMenuId = null;
      commitEditorChange();
      break;
    case "add-group":
      addTrackerGroup();
      break;
    case "delete-group":
      deleteTrackerGroup(actionElement.dataset.groupId);
      break;
    case "add-flag":
      addFlag();
      break;
    case "delete-flag":
      appState.createGame.flags = appState.createGame.flags.filter((flag) => flag.id !== actionElement.dataset.flagId);
      commitEditorChange();
      break;
    case "add-profile":
      appState.createGame.profiles.push(createProfile());
      commitEditorChange();
      break;
    case "delete-profile":
      appState.createGame.profiles = appState.createGame.profiles.filter(
        (profile) => profile.id !== actionElement.dataset.profileId
      );
      commitEditorChange();
      break;
    case "add-profile-state": {
      const profile = getProfileById(appState.createGame, actionElement.dataset.profileId);
      if (!profile) {
        break;
      }
      profile.states.push(createProfileState(`State ${profile.states.length + 1}`));
      if (profile.startState === null && profile.states.length) {
        profile.startState = profile.states[0].name;
      }
      commitEditorChange();
      break;
    }
    case "delete-profile-state": {
      const profile = getProfileById(appState.createGame, actionElement.dataset.profileId);
      if (!profile) {
        break;
      }
      const state = getProfileStateById(profile, actionElement.dataset.profileStateId);
      profile.states = profile.states.filter((entry) => entry.id !== actionElement.dataset.profileStateId);
      if (state && profile.startState === state.name) {
        profile.startState = null;
      }
      commitEditorChange();
      break;
    }
    case "add-profile-mapping": {
      const profile = getProfileById(appState.createGame, actionElement.dataset.profileId);
      const state = getProfileStateById(profile, actionElement.dataset.profileStateId);
      if (!state) {
        break;
      }
      state.mappings.push(createVariableEffect("tracker", appState.createGame.trackers[0]?.id ?? null));
      commitEditorChange();
      break;
    }
    case "remove-profile-mapping": {
      const profile = getProfileById(appState.createGame, actionElement.dataset.profileId);
      const state = getProfileStateById(profile, actionElement.dataset.profileStateId);
      if (!state) {
        break;
      }
      state.mappings = state.mappings.filter((mapping) => mapping.id !== actionElement.dataset.variableEffectId);
      commitEditorChange();
      break;
    }
    case "add-string":
      appState.createGame.strings.push(createStringVariable());
      commitEditorChange();
      break;
    case "delete-string":
      appState.createGame.strings = appState.createGame.strings.filter((entry) => entry.id !== actionElement.dataset.stringId);
      commitEditorChange();
      break;
    default:
      break;
  }
}

function handleSidebarChange(event) {
  if (!appState.createGame) {
    return;
  }

  const target = event.target;

  if (target.dataset.metaField) {
    appState.createGame.metadata[target.dataset.metaField] = target.value;
    commitEditorChange();
    return;
  }

  if (target.dataset.trackerField) {
    const tracker = getTrackerById(appState.createGame, target.dataset.trackerId);
    if (!tracker) {
      return;
    }

    tracker[target.dataset.trackerField] =
      target.type === "checkbox"
        ? target.checked
        : target.dataset.trackerField === "startValue"
          ? parseNumberOrFallback(target.value, 0)
          : target.dataset.trackerField === "min" || target.dataset.trackerField === "max"
            ? parseNullableNumber(target.value)
            : target.value || null;
    commitEditorChange();
    return;
  }

  if (target.dataset.groupField) {
    const group = getTrackerGroupById(appState.createGame, target.dataset.groupId);
    if (!group) {
      return;
    }

    group[target.dataset.groupField] = target.value;
    commitEditorChange();
    return;
  }

  if (target.dataset.flagField) {
    const flag = getFlagById(appState.createGame, target.dataset.flagId);
    if (!flag) {
      return;
    }

    flag[target.dataset.flagField] =
      target.type === "checkbox"
        ? target.checked
        : target.dataset.flagField === "states"
          ? parseStatesInput(target.value)
          : target.value;
    commitEditorChange();
    return;
  }

  if (target.dataset.profileField) {
    const profile = getProfileById(appState.createGame, target.dataset.profileId);
    if (!profile) {
      return;
    }

    profile[target.dataset.profileField] =
      target.type === "checkbox" ? target.checked : fromNullableSelectValue(target.value);
    commitEditorChange();
    return;
  }

  if (target.dataset.profileStateField) {
    const profile = getProfileById(appState.createGame, target.dataset.profileId);
    const state = getProfileStateById(profile, target.dataset.profileStateId);
    if (!profile || !state) {
      return;
    }

    if (target.dataset.profileStateField === "name") {
      const previousName = state.name;
      state.name = target.value;
      if (profile.startState === previousName) {
        profile.startState = state.name;
      }
    } else {
      state[target.dataset.profileStateField] = target.value;
    }
    commitEditorChange();
    return;
  }

  if (target.dataset.variableEffectId && target.dataset.profileId && target.dataset.profileStateId) {
    const profile = getProfileById(appState.createGame, target.dataset.profileId);
    const state = getProfileStateById(profile, target.dataset.profileStateId);
    const effect = state?.mappings.find((item) => item.id === target.dataset.variableEffectId);
    if (!effect) {
      return;
    }

    const field = target.dataset.variableEffectField;
    if (field === "variableType") {
      Object.assign(effect, createVariableEffect(target.value, getFirstVariableId(appState.createGame, target.value), effect.id));
    } else if (field === "action") {
      effect.action = target.value;
    } else if (field === "value") {
      effect.value =
        effect.variableType === "flag" || effect.variableType === "profile"
          ? fromNullableSelectValue(target.value)
          : effect.variableType === "tracker"
            ? parseNumberOrFallback(target.value, 0)
            : target.value;
    } else {
      effect[field] = target.value || null;
    }
    commitEditorChange();
    return;
  }

  if (target.dataset.stringField) {
    const entry = appState.createGame.strings.find((item) => item.id === target.dataset.stringId);
    if (!entry) {
      return;
    }

    entry[target.dataset.stringField] = target.value;
    commitEditorChange();
  }
}

function closeTransientCreateMenus() {
  const hadOpenMenu =
    appState.selection.trackerMenuId !== null ||
    appState.selection.nodeMenuId !== null ||
    appState.selection.logicNodeMenuId !== null ||
    appState.selection.paragraphMenuId !== null ||
    appState.selection.optionMenuId !== null ||
    appState.selection.floatingActionMenuId !== null ||
    appState.selection.selectMenuId !== null;
  if (!hadOpenMenu) {
    return false;
  }

  appState.selection.trackerMenuId = null;
  appState.selection.nodeMenuId = null;
  appState.selection.logicNodeMenuId = null;
  appState.selection.paragraphMenuId = null;
  appState.selection.optionMenuId = null;
  appState.selection.floatingActionMenuId = null;
  appState.selection.selectMenuId = null;
  return true;
}

function handleDocumentMouseDown(event) {
  if (appState.view === "create" && dismissOpenSelectMenuIfNeeded(event.target)) {
    return;
  }

  if (
    appState.view === "create" &&
    !event.target.closest(
      "#graphViewport, .menu-wrap, .floating-node-panel, .graph-node, .graph-cluster, .graph-special-node, .create-panel, .graph-floating-controls, button, input, textarea, select, label"
      + ", .graph-logic-node"
    )
  ) {
    const closedMenu = closeTransientCreateMenus();
    if (closedMenu) {
      requestAnimationFrame(() => {
        if (appState.view === "create") {
          renderCreateView();
        }
      });
    }
  }
}

function findOpenSelectMenuElement() {
  if (!appState.selection.selectMenuId) {
    return null;
  }

  return [...document.querySelectorAll(".select-menu[data-select-menu-id]")].find(
    (element) => element.dataset.selectMenuId === appState.selection.selectMenuId
  ) || null;
}

function dismissOpenSelectMenuIfNeeded(target) {
  const menuElement = findOpenSelectMenuElement();
  if (!menuElement) {
    appState.selection.selectMenuId = null;
    return false;
  }

  if (menuElement.contains(target) || refs.menuOverlay.contains(target)) {
    return false;
  }

  appState.selection.selectMenuId = null;
  renderMenuOverlay();
  return false;
}

function renderMenuOverlay() {
  if (appState.view !== "create") {
    refs.menuOverlay.innerHTML = "";
    return;
  }

  const menuElement = findOpenSelectMenuElement();
  if (!menuElement) {
    refs.menuOverlay.innerHTML = "";
    return;
  }

  const button = menuElement.querySelector(".select-menu-button");
  const content = menuElement.querySelector(".select-menu-options .popover-menu");
  if (!button || !content) {
    refs.menuOverlay.innerHTML = "";
    return;
  }

  const rect = button.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const estimatedWidth = Math.min(360, viewportWidth - 24);
  const estimatedHeight = 260;
  const left = Math.min(rect.left, viewportWidth - estimatedWidth - 12);
  const top = rect.bottom + 6 + estimatedHeight > viewportHeight ? Math.max(12, rect.top - estimatedHeight - 6) : rect.bottom + 6;

  refs.menuOverlay.innerHTML = `
    <div class="menu-overlay-popover" style="left:${Math.max(12, left)}px; top:${top}px; min-width:${Math.ceil(rect.width)}px;">
      ${content.outerHTML}
    </div>
  `;
}

function handleSelectMenuAction(actionElement) {
  const action = actionElement?.dataset.action;
  if (action === "toggle-select-menu") {
    appState.selection.trackerMenuId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.selectMenuId =
      appState.selection.selectMenuId === actionElement.dataset.selectMenuId
        ? null
        : actionElement.dataset.selectMenuId;
    renderMenuOverlay();
    return true;
  }

  if (action !== "select-menu-option") {
    return false;
  }

  const menuElement = findOpenSelectMenuElement();
  const input = menuElement?.querySelector(".select-menu-input");
  if (!input) {
    appState.selection.selectMenuId = null;
    renderMenuOverlay();
    return true;
  }

  const nextValue = actionElement.dataset.selectMenuValue ?? "";
  const changed = input.value !== nextValue;
  input.value = nextValue;
  appState.selection.selectMenuId = null;
  renderMenuOverlay();

  if (changed) {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    renderCreateView();
  }
  return true;
}

function handleOverlayClick(event) {
  const actionElement = event.target.closest("[data-action]");
  handleSelectMenuAction(actionElement);
}

function handleGraphClick(event) {
  if (!appState.createGame) {
    return;
  }

  if (appState.graph.suppressNextGraphClick) {
    appState.graph.suppressNextGraphClick = false;
    return;
  }

  const actionElement = event.target.closest("[data-action]");
  if (handleSelectMenuAction(actionElement)) {
    return;
  }
  if (event.target.closest(".floating-node-panel")) {
    if (actionElement) {
      handleInspectorClick(event);
    }
    return;
  }
  if (actionElement) {
    switch (actionElement.dataset.action) {
      case "toggle-node-menu":
        appState.selection.nodeId = actionElement.dataset.nodeId;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = null;
        appState.selection.trackerMenuId = null;
        appState.selection.paragraphMenuId = null;
        appState.selection.optionMenuId = null;
        appState.selection.selectMenuId = null;
        appState.selection.nodeMenuId =
          appState.selection.nodeMenuId === actionElement.dataset.nodeId ? null : actionElement.dataset.nodeId;
        appState.selection.logicNodeMenuId = null;
        appState.selection.floatingActionMenuId = null;
        renderCreateView();
        return;
      case "toggle-paragraph-menu": {
        const menuKey = buildParagraphMenuKey(actionElement.dataset.nodeId, actionElement.dataset.paragraphId);
        appState.selection.nodeId = actionElement.dataset.nodeId;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = actionElement.dataset.paragraphId;
        appState.selection.optionId = null;
        appState.selection.trackerMenuId = null;
        appState.selection.nodeMenuId = null;
        appState.selection.logicNodeMenuId = null;
        appState.selection.optionMenuId = null;
        appState.selection.selectMenuId = null;
        appState.selection.floatingActionMenuId = null;
        appState.selection.paragraphMenuId = appState.selection.paragraphMenuId === menuKey ? null : menuKey;
        renderCreateView();
        return;
      }
      case "toggle-option-menu": {
        const menuKey = buildOptionMenuKey(actionElement.dataset.nodeId, actionElement.dataset.optionId);
        appState.selection.nodeId = actionElement.dataset.nodeId;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = actionElement.dataset.optionId;
        appState.selection.trackerMenuId = null;
        appState.selection.nodeMenuId = null;
        appState.selection.logicNodeMenuId = null;
        appState.selection.paragraphMenuId = null;
        appState.selection.selectMenuId = null;
        appState.selection.floatingActionMenuId = null;
        appState.selection.optionMenuId = appState.selection.optionMenuId === menuKey ? null : menuKey;
        renderCreateView();
        return;
      }
      case "edit-paragraph-settings":
        appState.selection.nodeId = actionElement.dataset.nodeId;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = actionElement.dataset.paragraphId;
        appState.selection.optionId = null;
        appState.selection.paragraphMenuId = null;
        appState.selection.optionMenuId = null;
        appState.selection.selectMenuId = null;
        appState.selection.floatingActionMenuId = null;
        renderCreateView();
        return;
      case "edit-option-settings":
        appState.selection.nodeId = actionElement.dataset.nodeId;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = actionElement.dataset.optionId;
        appState.selection.paragraphMenuId = null;
        appState.selection.optionMenuId = null;
        appState.selection.selectMenuId = null;
        appState.selection.floatingActionMenuId = null;
        renderCreateView();
        return;
      case "add-paragraph-inline":
        addParagraph(actionElement.dataset.nodeId);
        return;
      case "add-option-inline": {
        const node = getNodeById(appState.createGame, actionElement.dataset.nodeId);
        if (!node) {
          return;
        }
        const option = createOption();
        node.options.push(option);
        appState.selection.nodeId = node.id;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = option.id;
        appState.selection.nodeMenuId = null;
        appState.selection.paragraphMenuId = null;
        appState.selection.optionMenuId = buildOptionMenuKey(node.id, option.id);
        appState.selection.selectMenuId = null;
        appState.selection.floatingActionMenuId = null;
        commitEditorChange();
        return;
      }
      case "delete-cluster":
        deleteSelectedCluster();
        return;
      case "duplicate-paragraph-inline":
        duplicateParagraph(actionElement.dataset.nodeId, actionElement.dataset.paragraphId);
        return;
      case "move-paragraph-up":
        moveParagraph(
          actionElement.dataset.nodeId || appState.selection.nodeId,
          actionElement.dataset.paragraphId || appState.selection.paragraphId,
          -1
        );
        return;
      case "move-paragraph-down":
        moveParagraph(
          actionElement.dataset.nodeId || appState.selection.nodeId,
          actionElement.dataset.paragraphId || appState.selection.paragraphId,
          1
        );
        return;
      case "move-option-up":
        moveOption(
          actionElement.dataset.nodeId || appState.selection.nodeId,
          actionElement.dataset.optionId || appState.selection.optionId,
          -1
        );
        return;
      case "move-option-down":
        moveOption(
          actionElement.dataset.nodeId || appState.selection.nodeId,
          actionElement.dataset.optionId || appState.selection.optionId,
          1
        );
        return;
      case "delete-paragraph-inline":
        deleteParagraph(actionElement.dataset.nodeId, actionElement.dataset.paragraphId);
        return;
      case "delete-option-inline": {
        const node = getNodeById(appState.createGame, actionElement.dataset.nodeId);
        if (!node) {
          return;
        }
        node.options = node.options.filter((option) => option.id !== actionElement.dataset.optionId);
        appState.selection.nodeId = node.id;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = null;
        appState.selection.optionMenuId = null;
        commitEditorChange();
        return;
      }
      case "duplicate-node-inline":
        duplicateNode(actionElement.dataset.nodeId);
        return;
      case "delete-node-inline":
        appState.selection.nodeId = actionElement.dataset.nodeId;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = null;
        appState.selection.nodeMenuId = null;
        appState.selection.optionMenuId = null;
        appState.selection.selectMenuId = null;
        appState.selection.floatingActionMenuId = null;
        deleteSelectedNode();
        return;
      default:
        break;
    }
  }

  if (event.target.closest("input, textarea, select, label, button")) {
    return;
  }

  const optionElement = event.target.closest("[data-option-id]");
  if (optionElement) {
    appState.selection.nodeId = optionElement.dataset.nodeId;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = optionElement.dataset.optionId;
    appState.selection.trackerMenuId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.logicNodeMenuId = null;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = buildOptionMenuKey(optionElement.dataset.nodeId, optionElement.dataset.optionId);
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
    renderCreateView();
    return;
  }

  const paragraphElement = event.target.closest("[data-paragraph-id]");
  if (paragraphElement) {
    appState.selection.nodeId = paragraphElement.dataset.nodeId;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = paragraphElement.dataset.paragraphId;
    appState.selection.optionId = null;
    appState.selection.trackerMenuId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.logicNodeMenuId = null;
    appState.selection.paragraphMenuId = buildParagraphMenuKey(
      paragraphElement.dataset.nodeId,
      paragraphElement.dataset.paragraphId
    );
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
    renderCreateView();
    return;
  }

  const logicNodeElement = event.target.closest("[data-logic-node-id]");
  if (logicNodeElement) {
    appState.selection.nodeId = null;
    appState.selection.logicNodeId = logicNodeElement.dataset.logicNodeId;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = null;
    appState.selection.trackerMenuId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.logicNodeMenuId = logicNodeElement.dataset.logicNodeId;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
    renderCreateView();
    return;
  }

  const clusterElement = event.target.closest("[data-cluster-id]");
  if (clusterElement) {
    appState.selection.nodeId = null;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = clusterElement.dataset.clusterId;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = null;
    appState.selection.trackerMenuId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.logicNodeMenuId = null;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
    renderCreateView();
    return;
  }

  const specialNodeElement = event.target.closest("[data-special-node-kind]");
  if (specialNodeElement) {
    appState.selection.nodeId = null;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = specialNodeElement.dataset.specialNodeKind;
    appState.selection.paragraphId = null;
    appState.selection.optionId = null;
    appState.selection.trackerMenuId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.logicNodeMenuId = null;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
    renderCreateView();
    return;
  }

  const nodeElement = event.target.closest("[data-node-id]");
  if (nodeElement) {
    appState.selection.nodeId = nodeElement.dataset.nodeId;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = null;
    appState.selection.trackerMenuId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.logicNodeMenuId = null;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
    renderCreateView();
    return;
  }

  clearEditorSelection();
}

function clearEditorSelection() {
  const hadSelection =
    appState.selection.nodeId !== null ||
    appState.selection.logicNodeId !== null ||
    appState.selection.clusterId !== null ||
    appState.selection.specialNodeKind !== null ||
    appState.selection.paragraphId !== null ||
    appState.selection.optionId !== null ||
    appState.selection.trackerMenuId !== null ||
    appState.selection.nodeMenuId !== null ||
    appState.selection.logicNodeMenuId !== null ||
    appState.selection.paragraphMenuId !== null ||
    appState.selection.optionMenuId !== null ||
    appState.selection.floatingActionMenuId !== null ||
    appState.selection.selectMenuId !== null;
  appState.selection.nodeId = null;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  appState.selection.trackerMenuId = null;
  appState.selection.nodeMenuId = null;
  appState.selection.logicNodeMenuId = null;
  appState.selection.paragraphMenuId = null;
  appState.selection.optionMenuId = null;
  appState.selection.floatingActionMenuId = null;
  appState.selection.selectMenuId = null;
  if (hadSelection) {
    renderCreateView();
  }
}

function handleGraphFocusIn(event) {
  if (!appState.createGame) {
    return;
  }

  if (event.target.closest(".floating-node-panel")) {
    return;
  }

  const paragraphElement = event.target.closest("[data-paragraph-id]");
  const optionElement = event.target.closest("[data-option-id]");
  if (optionElement) {
    appState.selection.nodeId = optionElement.dataset.nodeId;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = optionElement.dataset.optionId;
    appState.selection.logicNodeMenuId = null;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = buildOptionMenuKey(optionElement.dataset.nodeId, optionElement.dataset.optionId);
    appState.selection.floatingActionMenuId = null;
    renderCreateView();
    return;
  }

  if (paragraphElement) {
    appState.selection.nodeId = paragraphElement.dataset.nodeId;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = paragraphElement.dataset.paragraphId;
    appState.selection.optionId = null;
    appState.selection.logicNodeMenuId = null;
    appState.selection.paragraphMenuId = buildParagraphMenuKey(
      paragraphElement.dataset.nodeId,
      paragraphElement.dataset.paragraphId
    );
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    renderCreateView();
    return;
  }

  const logicNodeElement = event.target.closest("[data-logic-node-id]");
  if (logicNodeElement) {
    appState.selection.nodeId = null;
    appState.selection.logicNodeId = logicNodeElement.dataset.logicNodeId;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = null;
    appState.selection.logicNodeMenuId = logicNodeElement.dataset.logicNodeId;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    renderCreateView();
    return;
  }

  const clusterElement = event.target.closest("[data-cluster-id]");
  if (clusterElement) {
    appState.selection.nodeId = null;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = clusterElement.dataset.clusterId;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = null;
    appState.selection.logicNodeMenuId = null;
    renderInspector(appState.createGame);
  }
}

function handleNodeDragStart(event) {
  if (!appState.createGame) {
    return;
  }

  const startNodeHandle = event.target.closest("[data-connect-start-node]");
  if (startNodeHandle) {
    appState.selection.nodeId = null;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = "start";
    appState.drag = {
      type: "connectStartNode",
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    refs.graphConnections.innerHTML = buildConnectionPaths(appState.createGame);
    event.preventDefault();
    return;
  }

  const logicNodeHandle = event.target.closest("[data-connect-logic-node-id]");
  if (logicNodeHandle) {
    appState.drag = {
      type: "connectLogicNode",
      logicNodeId: logicNodeHandle.dataset.connectLogicNodeId,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    refs.graphConnections.innerHTML = buildConnectionPaths(appState.createGame);
    event.preventDefault();
    return;
  }

  const clusterHandle = event.target.closest("[data-connect-cluster-id]");
  if (clusterHandle) {
    appState.drag = {
      type: "connectCluster",
      clusterId: clusterHandle.dataset.connectClusterId,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    refs.graphConnections.innerHTML = buildConnectionPaths(appState.createGame);
    event.preventDefault();
    return;
  }

  const optionHandle = event.target.closest("[data-connect-option-id]");
  if (optionHandle) {
    appState.selection.nodeId = optionHandle.dataset.nodeId;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = optionHandle.dataset.connectOptionId;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.drag = {
      type: "connect",
      nodeId: optionHandle.dataset.nodeId,
      optionId: optionHandle.dataset.connectOptionId,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    renderCreateView();
    event.preventDefault();
    return;
  }

  const paragraphRow = event.target.closest(".node-paragraph[data-paragraph-id]");
  if (paragraphRow && !event.target.closest("button, input, textarea, select, label, .floating-node-panel")) {
    appState.drag = {
      type: "reorderParagraph",
      nodeId: paragraphRow.dataset.nodeId,
      itemId: paragraphRow.dataset.paragraphId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.preventDefault();
    return;
  }

  const optionRow = event.target.closest(".node-option[data-option-id]");
  if (optionRow && !event.target.closest("button, input, textarea, select, label, .floating-node-panel")) {
    appState.drag = {
      type: "reorderOption",
      nodeId: optionRow.dataset.nodeId,
      itemId: optionRow.dataset.optionId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.preventDefault();
    return;
  }

  const logicNodeDragHandle = event.target.closest("[data-drag-logic-node-id]");
  if (logicNodeDragHandle && !event.target.closest("button, input, textarea, select")) {
    const logicNode = getLogicNodeById(appState.createGame, logicNodeDragHandle.dataset.dragLogicNodeId);
    if (!logicNode) {
      return;
    }

    appState.selection.nodeId = null;
    appState.selection.logicNodeId = logicNode.id;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.optionId = null;
    appState.selection.paragraphId = null;
    appState.drag = {
      type: "logicNode",
      logicNodeId: logicNode.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: logicNode.position.x,
      originY: logicNode.position.y,
    };
    event.preventDefault();
    return;
  }

  const clusterDragHandle = event.target.closest("[data-drag-cluster-id]");
  if (clusterDragHandle && !event.target.closest("button, input, textarea, select")) {
    const cluster = getClusterById(appState.createGame, clusterDragHandle.dataset.dragClusterId);
    if (!cluster) {
      return;
    }

    appState.selection.nodeId = null;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = cluster.id;
    appState.selection.specialNodeKind = null;
    appState.selection.optionId = null;
    appState.selection.paragraphId = null;
    appState.drag = {
      type: "cluster",
      clusterId: cluster.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: cluster.position.x,
      originY: cluster.position.y,
    };
    event.preventDefault();
    return;
  }

  const specialDragHandle = event.target.closest("[data-drag-start-node], [data-drag-end-node]");
  if (specialDragHandle && !event.target.closest("button, input, textarea, select")) {
    const kind = specialDragHandle.dataset.dragStartNode !== undefined ? "start" : "end";
    const specialNode = getSpecialNodeByKind(appState.createGame, kind);
    if (!specialNode) {
      return;
    }

    appState.selection.nodeId = null;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = kind;
    appState.selection.optionId = null;
    appState.selection.paragraphId = null;
    appState.drag = {
      type: "specialNode",
      kind,
      startX: event.clientX,
      startY: event.clientY,
      originX: specialNode.position.x,
      originY: specialNode.position.y,
    };
    event.preventDefault();
    return;
  }

  const dragHandle = event.target.closest("[data-drag-node-id]");
  if (!dragHandle || event.target.closest("button, input, textarea, select")) {
    return;
  }

  const node = getNodeById(appState.createGame, dragHandle.dataset.dragNodeId);
  if (!node) {
    return;
  }

  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.optionId = null;
  appState.drag = {
    type: "node",
    nodeId: node.id,
    startX: event.clientX,
    startY: event.clientY,
    originX: node.position.x,
    originY: node.position.y,
  };
  event.preventDefault();
}

function handleViewportPanStart(event) {
  if (!appState.createGame) {
    return;
  }

  if (event.target.closest(".graph-node, .graph-cluster, .graph-logic-node, .graph-special-node, .floating-node-panel, .create-panel, .graph-floating-controls")) {
    return;
  }

  appState.drag = {
    type: "pan",
    startX: event.clientX,
    startY: event.clientY,
    originX: appState.graph.panX,
    originY: appState.graph.panY,
    moved: false,
    startTarget: event.target,
  };
  refs.graphViewport.classList.add("dragging");
  event.preventDefault();
}

function handleGraphWheel(event) {
  if (appState.view !== "create") {
    return;
  }

  if (event.target.closest(".floating-node-panel, .create-panel, input, textarea, select")) {
    return;
  }

  event.preventDefault();

  const factor = event.deltaY < 0 ? 1.025 : 1 / 1.025;
  const oldZoom = appState.graph.zoom;
  const nextZoom = clamp(oldZoom * factor, 0.45, 1.8);
  const rect = refs.graphViewport.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const worldX = (pointerX - appState.graph.panX) / oldZoom;
  const worldY = (pointerY - appState.graph.panY) / oldZoom;

  appState.graph.zoom = nextZoom;
  appState.graph.panX = pointerX - worldX * nextZoom;
  appState.graph.panY = pointerY - worldY * nextZoom;
  renderCreateView();
}

function handleDocumentDrag(event) {
  if (!appState.drag || !appState.createGame) {
    return;
  }

  if (appState.drag.type === "pan") {
    const movedX = event.clientX - appState.drag.startX;
    const movedY = event.clientY - appState.drag.startY;
    if (Math.abs(movedX) > 3 || Math.abs(movedY) > 3) {
      appState.drag.moved = true;
    }
    appState.graph.panX = appState.drag.originX + (event.clientX - appState.drag.startX);
    appState.graph.panY = appState.drag.originY + (event.clientY - appState.drag.startY);
    applyGraphTransform();
    refs.graphConnections.innerHTML = buildConnectionPaths(appState.createGame);
    return;
  }

  if (appState.drag.type === "node") {
    const node = getNodeById(appState.createGame, appState.drag.nodeId);
    if (!node) {
      return;
    }

    node.position.x = clamp(
      Math.round(appState.drag.originX + (event.clientX - appState.drag.startX) / appState.graph.zoom),
      0,
      GRAPH_WORLD_WIDTH - NODE_WIDTH - 40
    );
    node.position.y = clamp(
      Math.round(appState.drag.originY + (event.clientY - appState.drag.startY) / appState.graph.zoom),
      0,
      GRAPH_WORLD_HEIGHT - 200
    );
    renderGraph(appState.createGame);
    return;
  }

  if (appState.drag.type === "cluster") {
    const cluster = getClusterById(appState.createGame, appState.drag.clusterId);
    if (!cluster) {
      return;
    }

    cluster.position.x = clamp(
      Math.round(appState.drag.originX + (event.clientX - appState.drag.startX) / appState.graph.zoom),
      0,
      GRAPH_WORLD_WIDTH - 180
    );
    cluster.position.y = clamp(
      Math.round(appState.drag.originY + (event.clientY - appState.drag.startY) / appState.graph.zoom),
      0,
      GRAPH_WORLD_HEIGHT - 120
    );
    renderGraph(appState.createGame);
    return;
  }

  if (appState.drag.type === "logicNode") {
    const logicNode = getLogicNodeById(appState.createGame, appState.drag.logicNodeId);
    if (!logicNode) {
      return;
    }

    logicNode.position.x = clamp(
      Math.round(appState.drag.originX + (event.clientX - appState.drag.startX) / appState.graph.zoom),
      0,
      GRAPH_WORLD_WIDTH - 220
    );
    logicNode.position.y = clamp(
      Math.round(appState.drag.originY + (event.clientY - appState.drag.startY) / appState.graph.zoom),
      0,
      GRAPH_WORLD_HEIGHT - 140
    );
    renderGraph(appState.createGame);
    return;
  }

  if (appState.drag.type === "specialNode") {
    const specialNode = getSpecialNodeByKind(appState.createGame, appState.drag.kind);
    if (!specialNode) {
      return;
    }

    specialNode.position.x = clamp(
      Math.round(appState.drag.originX + (event.clientX - appState.drag.startX) / appState.graph.zoom),
      0,
      GRAPH_WORLD_WIDTH - SPECIAL_NODE_WIDTH - 40
    );
    specialNode.position.y = clamp(
      Math.round(appState.drag.originY + (event.clientY - appState.drag.startY) / appState.graph.zoom),
      0,
      GRAPH_WORLD_HEIGHT - 120
    );
    renderGraph(appState.createGame);
    return;
  }

  if (appState.drag.type === "reorderParagraph" || appState.drag.type === "reorderOption") {
    updateReorderDrag(event);
    return;
  }

  if (appState.drag.type === "connect" || appState.drag.type === "connectCluster" || appState.drag.type === "connectLogicNode" || appState.drag.type === "connectStartNode") {
    appState.drag.pointerX = event.clientX;
    appState.drag.pointerY = event.clientY;
    refs.graphConnections.innerHTML = buildConnectionPaths(appState.createGame);
  }
}

function handleDocumentDragEnd(event) {
  if (!appState.drag) {
    return;
  }

  if (appState.drag.type === "pan") {
    if (!appState.drag.moved && !appState.drag.startTarget?.closest(".graph-node, .graph-cluster, .graph-logic-node, .create-panel, .graph-floating-controls")) {
      clearEditorSelection();
    } else if (appState.drag.moved) {
      appState.graph.suppressNextGraphClick = true;
    }
  } else if (appState.drag.type === "node") {
    persistEditorDraft();
  } else if (appState.drag.type === "logicNode") {
    persistEditorDraft();
  } else if (appState.drag.type === "specialNode") {
    persistEditorDraft();
  } else if (appState.drag.type === "cluster") {
    persistEditorDraft();
  } else if (appState.drag.type === "reorderParagraph" || appState.drag.type === "reorderOption") {
    if (appState.drag.moved) {
      persistEditorDraft();
      appState.graph.suppressNextGraphClick = true;
    }
  } else if ((appState.drag.type === "connect" || appState.drag.type === "connectCluster" || appState.drag.type === "connectLogicNode" || appState.drag.type === "connectStartNode") && appState.createGame) {
    const targetElement = event.target.closest("[data-connect-target-node-id]");
    const clusterTargetElement = event.target.closest("[data-connect-target-cluster-id]");
    if (appState.drag.type === "connect") {
      const sourceNode = getNodeById(appState.createGame, appState.drag.nodeId);
      const option = getOptionById(sourceNode, appState.drag.optionId);
      if (option && targetElement) {
        option.terminal = "target";
        option.targetClusterId = null;
        option.targetNodeId = targetElement.dataset.connectTargetNodeId;
        appState.selection.nodeId = appState.drag.nodeId;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = appState.drag.optionId;
        commitEditorChange();
        appState.drag = null;
        refs.graphViewport.classList.remove("dragging");
        return;
      }

      if (option && clusterTargetElement) {
        option.terminal = "target";
        option.targetClusterId = clusterTargetElement.dataset.connectTargetClusterId;
        option.targetNodeId = null;
        appState.selection.nodeId = appState.drag.nodeId;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = appState.drag.optionId;
        commitEditorChange();
        appState.drag = null;
        refs.graphViewport.classList.remove("dragging");
        return;
      }

      if (option && shouldCreateNodeFromConnectDrop(event.target)) {
        createConnectedNodeAtPoint(sourceNode, option, clientPointToWorld(event.clientX, event.clientY));
        appState.drag = null;
        refs.graphViewport.classList.remove("dragging");
        return;
      }
    } else if (appState.drag.type === "connectCluster") {
      const cluster = getClusterById(appState.createGame, appState.drag.clusterId);
      if (cluster && targetElement) {
        cluster.targetNodeId = targetElement.dataset.connectTargetNodeId;
        appState.selection.nodeId = null;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = cluster.id;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = null;
        commitEditorChange();
        appState.drag = null;
        refs.graphViewport.classList.remove("dragging");
        return;
      }
    } else if (appState.drag.type === "connectLogicNode") {
      const logicNode = getLogicNodeById(appState.createGame, appState.drag.logicNodeId);
      if (logicNode && targetElement) {
        logicNode.targetNodeId = targetElement.dataset.connectTargetNodeId;
        appState.selection.nodeId = null;
        appState.selection.logicNodeId = logicNode.id;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = null;
        appState.selection.logicNodeMenuId = logicNode.id;
        commitEditorChange();
        appState.drag = null;
        refs.graphViewport.classList.remove("dragging");
        return;
      }
    } else {
      if (targetElement) {
        appState.createGame.startNode.targetNodeId = targetElement.dataset.connectTargetNodeId;
        appState.selection.nodeId = null;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = "start";
        appState.selection.paragraphId = null;
        appState.selection.optionId = null;
        commitEditorChange();
        appState.drag = null;
        refs.graphViewport.classList.remove("dragging");
        return;
      }

      if (shouldCreateNodeFromConnectDrop(event.target)) {
        const node = createNode("", getNodeCreationTemplate(appState.createGame, null));
        const point = clientPointToWorld(event.clientX, event.clientY);
        node.position.x = clamp(Math.round(point.x + 28), 0, GRAPH_WORLD_WIDTH - NODE_WIDTH - 40);
        node.position.y = clamp(Math.round(point.y - 82), 0, GRAPH_WORLD_HEIGHT - 220);
        appState.createGame.nodes.push(node);
        appState.createGame.startNode.targetNodeId = node.id;
        appState.selection.nodeId = node.id;
        appState.selection.logicNodeId = null;
        appState.selection.clusterId = null;
        appState.selection.specialNodeKind = null;
        appState.selection.paragraphId = null;
        appState.selection.optionId = null;
        commitEditorChange();
        appState.drag = null;
        refs.graphViewport.classList.remove("dragging");
        return;
      }
    }

    if (appState.drag.type === "connect") {
      const sourceNode = getNodeById(appState.createGame, appState.drag.nodeId);
      const option = getOptionById(sourceNode, appState.drag.optionId);
      if (option && shouldCreateNodeFromConnectDrop(event.target)) {
      createConnectedNodeAtPoint(sourceNode, option, clientPointToWorld(event.clientX, event.clientY));
      appState.drag = null;
      refs.graphViewport.classList.remove("dragging");
      return;
      }
    }
  }

  appState.drag = null;
  if (appState.createGame) {
    refs.graphConnections.innerHTML = buildConnectionPaths(appState.createGame);
  }
  refs.graphViewport.classList.remove("dragging");
}

function updateReorderDrag(event) {
  const distanceX = event.clientX - appState.drag.startX;
  const distanceY = event.clientY - appState.drag.startY;
  if (!appState.drag.moved && Math.abs(distanceX) <= 3 && Math.abs(distanceY) <= 3) {
    return;
  }

  if (!appState.drag.moved) {
    appState.drag.moved = true;
    appState.selection.nodeId = appState.drag.nodeId;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.trackerMenuId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
    if (appState.drag.type === "reorderParagraph") {
      appState.selection.paragraphId = appState.drag.itemId;
      appState.selection.optionId = null;
    } else {
      appState.selection.paragraphId = null;
      appState.selection.optionId = appState.drag.itemId;
    }
    renderGraph(appState.createGame);
  }

  const selector =
    appState.drag.type === "reorderParagraph"
      ? ".node-paragraph[data-paragraph-id]"
      : ".node-option[data-option-id]";
  const overElement = document.elementFromPoint(event.clientX, event.clientY)?.closest(selector);
  if (!overElement || overElement.dataset.nodeId !== appState.drag.nodeId) {
    return;
  }

  const node = getNodeById(appState.createGame, appState.drag.nodeId);
  if (!node) {
    return;
  }

  const items = appState.drag.type === "reorderParagraph" ? node.paragraphs : node.options;
  const currentIndex = items.findIndex((item) => item.id === appState.drag.itemId);
  const targetId =
    appState.drag.type === "reorderParagraph" ? overElement.dataset.paragraphId : overElement.dataset.optionId;
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) {
    return;
  }

  const [item] = items.splice(currentIndex, 1);
  items.splice(targetIndex, 0, item);
  renderGraph(appState.createGame);
}

function shouldCreateNodeFromConnectDrop(target) {
  return Boolean(
    target.closest("#graphViewport") &&
      !target.closest(".floating-node-panel, .create-panel, .graph-floating-controls, .graph-node, .graph-cluster, .graph-logic-node, .graph-special-node")
  );
}

function createConnectedNodeAtPoint(sourceNode, option, point) {
  const template = getNodeCreationTemplate(appState.createGame, sourceNode?.id);
  const node = createNode("", template);
  node.position.x = clamp(Math.round(point.x + 28), 0, GRAPH_WORLD_WIDTH - NODE_WIDTH - 40);
  node.position.y = clamp(Math.round(point.y - 82), 0, GRAPH_WORLD_HEIGHT - 220);
  appState.createGame.nodes.push(node);
  option.terminal = "target";
  option.targetClusterId = null;
  option.targetNodeId = node.id;
  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  commitEditorChange();
}
function handleInspectorClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (handleSelectMenuAction(actionElement)) {
    return;
  }
  const action = actionElement?.dataset.action;
  if (!action || !appState.createGame) {
    return;
  }

  switch (action) {
    case "toggle-floating-action-menu":
      appState.selection.floatingActionMenuId =
        appState.selection.floatingActionMenuId === actionElement.dataset.floatingActionMenuId
          ? null
          : actionElement.dataset.floatingActionMenuId;
      renderCreateView();
      break;
    case "clear-paragraph-selection":
      appState.selection.paragraphId = null;
      appState.selection.paragraphMenuId = null;
      appState.selection.floatingActionMenuId = null;
      renderCreateView();
      break;
    case "clear-cluster-selection":
      appState.selection.clusterId = null;
      renderCreateView();
      break;
    case "clear-logic-node-selection":
      appState.selection.logicNodeId = null;
      appState.selection.logicNodeMenuId = null;
      renderCreateView();
      break;
    case "add-option":
      withSelectedNode((node) => {
        const option = createOption();
        node.options.push(option);
        appState.selection.paragraphId = null;
        appState.selection.optionId = option.id;
        appState.selection.optionMenuId = buildOptionMenuKey(node.id, option.id);
        appState.selection.floatingActionMenuId = null;
      });
      commitEditorChange();
      break;
    case "delete-node":
      deleteSelectedNode();
      break;
    case "clear-option-selection":
      appState.selection.paragraphId = null;
      appState.selection.optionId = null;
      appState.selection.optionMenuId = null;
      appState.selection.floatingActionMenuId = null;
      renderCreateView();
      break;
    case "duplicate-option-inline":
      duplicateNodeOption(actionElement.dataset.nodeId || appState.selection.nodeId, actionElement.dataset.optionId || appState.selection.optionId);
      break;
    case "delete-option":
      withSelectedNode((node) => {
        node.options = node.options.filter((option) => option.id !== appState.selection.optionId);
        appState.selection.optionId = null;
        appState.selection.optionMenuId = null;
        appState.selection.floatingActionMenuId = null;
      });
      commitEditorChange();
      break;
    case "delete-cluster":
      deleteSelectedCluster();
      break;
    case "duplicate-logic-node":
      duplicateLogicNode(appState.selection.logicNodeId);
      break;
    case "delete-logic-node":
      deleteSelectedLogicNode();
      break;
    case "move-option-up":
      moveOption(appState.selection.nodeId, appState.selection.optionId, -1);
      break;
    case "move-option-down":
      moveOption(appState.selection.nodeId, appState.selection.optionId, 1);
      break;
    case "add-paragraph-variable-check":
      withSelectedParagraph((paragraph, game) => {
        paragraph.requirements.push(createTrackerRequirement(game.trackers[0]?.id ?? null));
      });
      commitEditorChange();
      break;
    case "duplicate-paragraph-inline":
      duplicateParagraph(actionElement.dataset.nodeId || appState.selection.nodeId, actionElement.dataset.paragraphId || appState.selection.paragraphId);
      break;
    case "move-paragraph-up":
      moveParagraph(
        actionElement.dataset.nodeId || appState.selection.nodeId,
        actionElement.dataset.paragraphId || appState.selection.paragraphId,
        -1
      );
      break;
    case "move-paragraph-down":
      moveParagraph(
        actionElement.dataset.nodeId || appState.selection.nodeId,
        actionElement.dataset.paragraphId || appState.selection.paragraphId,
        1
      );
      break;
    case "delete-paragraph-inline":
      deleteParagraph(actionElement.dataset.nodeId || appState.selection.nodeId, actionElement.dataset.paragraphId || appState.selection.paragraphId);
      break;
    case "delete-option-inline": {
      const node = getNodeById(appState.createGame, actionElement.dataset.nodeId || appState.selection.nodeId);
      const optionId = actionElement.dataset.optionId || appState.selection.optionId;
      if (!node) {
        break;
      }
      node.options = node.options.filter((option) => option.id !== optionId);
      appState.selection.nodeId = node.id;
      appState.selection.paragraphId = null;
      appState.selection.optionId = null;
      appState.selection.optionMenuId = null;
      appState.selection.floatingActionMenuId = null;
      commitEditorChange();
      break;
    }
    case "add-variable-check":
      withSelectedOption((option, game) => {
        option.requirements.push(createTrackerRequirement(game.trackers[0]?.id ?? null));
      });
      commitEditorChange();
      break;
    case "remove-requirement":
      if (appState.selection.paragraphId) {
        withSelectedParagraph((paragraph) => {
          paragraph.requirements = paragraph.requirements.filter(
            (requirement) => requirement.id !== actionElement.dataset.requirementId
          );
        });
      } else {
        withSelectedOption((option) => {
          option.requirements = option.requirements.filter(
            (requirement) => requirement.id !== actionElement.dataset.requirementId
          );
        });
      }
      commitEditorChange();
      break;
    case "add-variable-effect":
      withSelectedOption((option, game) => {
        option.variableEffects.push(createVariableEffect("tracker", game.trackers[0]?.id ?? null));
      });
      commitEditorChange();
      break;
    case "remove-variable-effect":
      withSelectedOption((option) => {
        option.variableEffects = option.variableEffects.filter(
          (effect) => effect.id !== actionElement.dataset.variableEffectId
        );
      });
      commitEditorChange();
      break;
    case "add-logic-trigger":
      withSelectedLogicNode((logicNode) => {
        logicNode.triggers.push(createLogicTrigger("passSelf"));
      });
      commitEditorChange();
      break;
    case "remove-logic-trigger":
      withSelectedLogicNode((logicNode) => {
        logicNode.triggers = logicNode.triggers.filter((trigger) => trigger.id !== actionElement.dataset.logicTriggerId);
      });
      commitEditorChange();
      break;
    case "add-logic-action":
      withSelectedLogicNode((logicNode, game) => {
        const action = createLogicAction("emitEvent");
        action.variableId = game.trackers[0]?.id ?? null;
        logicNode.actions.push(action);
      });
      commitEditorChange();
      break;
    case "remove-logic-action":
      withSelectedLogicNode((logicNode) => {
        logicNode.actions = logicNode.actions.filter((entry) => entry.id !== actionElement.dataset.logicActionId);
      });
      commitEditorChange();
      break;
    default:
      break;
  }
}

function handleCreateTextInput(event) {
  if (!appState.createGame) {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return;
  }
  if (target.type === "checkbox" || target.type === "hidden" || target.dataset.nodeField === "id") {
    return;
  }

  if (applyLiveCreateTextValue(target)) {
    persistEditorDraft();
  }
}

function applyLiveCreateTextValue(target) {
  if (target.dataset.metaField) {
    appState.createGame.metadata[target.dataset.metaField] = target.value;
    return true;
  }

  if (target.dataset.nodeField && target.dataset.nodeId) {
    const node = getNodeById(appState.createGame, target.dataset.nodeId);
    if (!node) {
      return false;
    }
    node[target.dataset.nodeField] = target.value;
    return true;
  }

  if (target.dataset.paragraphField && target.dataset.nodeId && target.dataset.paragraphId) {
    const node = getNodeById(appState.createGame, target.dataset.nodeId);
    const paragraph = getParagraphById(node, target.dataset.paragraphId);
    if (!paragraph) {
      return false;
    }
    paragraph[target.dataset.paragraphField] = target.value;
    return true;
  }

  if (target.dataset.optionField) {
    if (target.dataset.nodeId && target.dataset.optionId) {
      const node = getNodeById(appState.createGame, target.dataset.nodeId);
      const option = getOptionById(node, target.dataset.optionId);
      if (!option) {
        return false;
      }
      option[target.dataset.optionField] = target.value;
      return true;
    }

    let applied = false;
    withSelectedOption((option) => {
      option[target.dataset.optionField] = target.value;
      applied = true;
    });
    return applied;
  }

  if (target.dataset.clusterField) {
    const cluster = getClusterById(appState.createGame, appState.selection.clusterId);
    if (!cluster) {
      return false;
    }
    cluster[target.dataset.clusterField] = target.value;
    return true;
  }

  if (target.dataset.logicNodeField) {
    let applied = false;
    withSelectedLogicNode((logicNode) => {
      logicNode[target.dataset.logicNodeField] = target.value;
      applied = true;
    });
    return applied;
  }

  if (target.dataset.trackerField) {
    const tracker = getTrackerById(appState.createGame, target.dataset.trackerId);
    if (!tracker) {
      return false;
    }
    tracker[target.dataset.trackerField] =
      target.dataset.trackerField === "startValue"
        ? parseNumberOrFallback(target.value, 0)
        : target.dataset.trackerField === "min" || target.dataset.trackerField === "max"
          ? parseNullableNumber(target.value)
          : target.value || null;
    return true;
  }

  if (target.dataset.groupField) {
    const group = getTrackerGroupById(appState.createGame, target.dataset.groupId);
    if (!group) {
      return false;
    }
    group[target.dataset.groupField] = target.value;
    return true;
  }

  if (target.dataset.flagField) {
    const flag = getFlagById(appState.createGame, target.dataset.flagId);
    if (!flag) {
      return false;
    }
    flag[target.dataset.flagField] = target.dataset.flagField === "states" ? parseStatesInput(target.value) : target.value;
    return true;
  }

  if (target.dataset.profileField) {
    const profile = getProfileById(appState.createGame, target.dataset.profileId);
    if (!profile) {
      return false;
    }
    profile[target.dataset.profileField] = target.value;
    return true;
  }

  if (target.dataset.profileStateField) {
    const profile = getProfileById(appState.createGame, target.dataset.profileId);
    const state = getProfileStateById(profile, target.dataset.profileStateId);
    if (!state) {
      return false;
    }
    state[target.dataset.profileStateField] = target.value;
    return true;
  }

  if (target.dataset.stringField) {
    const entry = appState.createGame.strings.find((item) => item.id === target.dataset.stringId);
    if (!entry) {
      return false;
    }
    entry[target.dataset.stringField] = target.value;
    return true;
  }

  return false;
}

function handleInspectorChange(event) {
  if (!appState.createGame) {
    return;
  }

  const target = event.target;

  if (target.dataset.nodeField) {
    if (target.dataset.nodeId) {
      const node = getNodeById(appState.createGame, target.dataset.nodeId);
      if (!node) {
        return;
      }

      if (target.dataset.nodeField === "id") {
        if (!renameNodeId(appState.createGame, node.id, target.value)) {
          renderCreateView();
          return;
        }
      } else {
        node[target.dataset.nodeField] = target.type === "checkbox" ? target.checked : target.value;
      }
      commitEditorChange();
      return;
    }

    withSelectedNode((node) => {
      if (target.dataset.nodeField === "id") {
        renameNodeId(appState.createGame, node.id, target.value);
        return;
      }
      node[target.dataset.nodeField] = target.type === "checkbox" ? target.checked : target.value;
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.paragraphField && target.dataset.nodeId && target.dataset.paragraphId) {
    const node = getNodeById(appState.createGame, target.dataset.nodeId);
    const paragraph = getParagraphById(node, target.dataset.paragraphId);
    if (!paragraph) {
      return;
    }

    paragraph[target.dataset.paragraphField] = target.value;
    commitEditorChange();
    return;
  }

  if (target.dataset.clusterField) {
    const cluster = getClusterById(appState.createGame, appState.selection.clusterId);
    if (!cluster) {
      return;
    }

    cluster[target.dataset.clusterField] = target.value || null;
    commitEditorChange();
    return;
  }

  if (target.dataset.logicNodeField) {
    withSelectedLogicNode((logicNode) => {
      logicNode[target.dataset.logicNodeField] =
        target.dataset.logicNodeField === "targetNodeId" ? target.value || null : target.value;
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.optionField) {
    if (target.dataset.nodeId && target.dataset.optionId) {
      const node = getNodeById(appState.createGame, target.dataset.nodeId);
      const option = getOptionById(node, target.dataset.optionId);
      if (!option) {
        return;
      }

      option[target.dataset.optionField] =
        target.dataset.optionField === "targetNodeId" ? target.value || null : target.value;
      if (target.dataset.optionField === "targetNodeId") {
        option.targetClusterId = null;
      }
      commitEditorChange();
      return;
    }

    withSelectedOption((option) => {
      option[target.dataset.optionField] =
        target.dataset.optionField === "targetNodeId" ? target.value || null : target.value;
      if (target.dataset.optionField === "targetNodeId") {
        option.targetClusterId = null;
      }
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.requirementId) {
    const applyRequirementChange = (container, game) => {
      const requirement = container.requirements.find((item) => item.id === target.dataset.requirementId);
      if (!requirement) {
        return;
      }

      const field = target.dataset.requirementField;
      if (field === "kind") {
        const joinMode = requirement.joinMode;
        Object.assign(
          requirement,
          target.value === "tracker"
            ? createTrackerRequirement(game.trackers[0]?.id ?? null, requirement.id)
            : target.value === "profile"
              ? createProfileRequirement(game.profiles[0]?.id ?? null, requirement.id)
              : createFlagRequirement(game.flags[0]?.id ?? null, requirement.id)
        );
        requirement.joinMode = joinMode;
      } else if (field === "value") {
        requirement.value = parseNumberOrFallback(target.value, 0);
      } else if (field === "state") {
        requirement.state = fromNullableSelectValue(target.value);
      } else {
        requirement[field] = target.value || null;
      }
    };

    if (appState.selection.paragraphId) {
      withSelectedParagraph(applyRequirementChange);
    } else {
      withSelectedOption(applyRequirementChange);
    }
    commitEditorChange();
    return;
  }

  if (target.dataset.variableEffectId) {
    withSelectedOption((option) => {
      const effect = option.variableEffects.find((item) => item.id === target.dataset.variableEffectId);
      if (!effect) {
        return;
      }

      const field = target.dataset.variableEffectField;
      if (field === "variableType") {
        Object.assign(effect, createVariableEffect(target.value, getFirstVariableId(appState.createGame, target.value), effect.id));
      } else if (field === "action") {
        effect.action = target.value;
      } else if (field === "value") {
        effect.value =
          effect.variableType === "flag" || effect.variableType === "profile"
            ? fromNullableSelectValue(target.value)
            : effect.variableType === "tracker"
              ? parseNumberOrFallback(target.value, 0)
              : target.value;
      } else {
        effect[field] = target.value || null;
      }
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.logicTriggerId) {
    withSelectedLogicNode((logicNode, game) => {
      const trigger = logicNode.triggers.find((entry) => entry.id === target.dataset.logicTriggerId);
      if (!trigger) {
        return;
      }

      const field = target.dataset.logicTriggerField;
      if (field === "kind") {
        const replacement = createLogicTrigger(target.value, trigger.id);
        replacement.variableId = getFirstVariableId(game, replacement.variableType);
        Object.assign(trigger, replacement);
      } else if (field === "variableType") {
        trigger.variableType = target.value;
        trigger.variableId = getFirstVariableId(game, target.value);
        trigger.value = target.value === "tracker" ? 0 : target.value === "string" ? "" : null;
        trigger.operator = "changed";
      } else if (field === "value") {
        trigger.value =
          trigger.variableType === "tracker"
            ? parseNumberOrFallback(target.value, 0)
            : trigger.variableType === "flag" || trigger.variableType === "profile"
              ? fromNullableSelectValue(target.value)
              : target.value;
      } else {
        trigger[field] = field === "eventName" ? target.value : target.value || null;
      }
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.logicActionId) {
    withSelectedLogicNode((logicNode, game) => {
      const action = logicNode.actions.find((entry) => entry.id === target.dataset.logicActionId);
      if (!action) {
        return;
      }

      const field = target.dataset.logicActionField;
      if (field === "kind") {
        const replacement = createLogicAction(target.value, action.id);
        replacement.variableId = getFirstVariableId(game, replacement.variableType);
        Object.assign(action, replacement);
      } else if (field === "variableType") {
        action.variableType = target.value;
        action.variableId = getFirstVariableId(game, target.value);
        action.value = target.value === "tracker" ? 0 : target.value === "string" ? "" : null;
        action.action = "set";
      } else if (field === "value") {
        action.value =
          action.variableType === "tracker"
            ? parseNumberOrFallback(target.value, 0)
            : action.variableType === "flag" || action.variableType === "profile"
              ? fromNullableSelectValue(target.value)
              : target.value;
      } else {
        action[field] = field === "eventName" ? target.value : target.value || null;
      }
    });
    commitEditorChange();
  }
}

function handleGraphChange(event) {
  if (!appState.createGame) {
    return;
  }

  const target = event.target;

  if (target.dataset.nodeField && target.dataset.nodeId) {
    const node = getNodeById(appState.createGame, target.dataset.nodeId);
    if (!node) {
      return;
    }

    if (target.dataset.nodeField === "id") {
      if (renameNodeId(appState.createGame, node.id, target.value)) {
        commitEditorChange();
      } else {
        renderCreateView();
      }
      return;
    }

    node[target.dataset.nodeField] = target.type === "checkbox" ? target.checked : target.value;
    commitEditorChange();
    return;
  }

  if (target.dataset.paragraphField && target.dataset.nodeId && target.dataset.paragraphId) {
    const node = getNodeById(appState.createGame, target.dataset.nodeId);
    const paragraph = getParagraphById(node, target.dataset.paragraphId);
    if (!paragraph) {
      return;
    }

    paragraph[target.dataset.paragraphField] = target.value;
    commitEditorChange();
    return;
  }

  if (target.dataset.optionField && target.dataset.nodeId && target.dataset.optionId) {
    const node = getNodeById(appState.createGame, target.dataset.nodeId);
    const option = getOptionById(node, target.dataset.optionId);
    if (!option) {
      return;
    }

    option[target.dataset.optionField] =
      target.dataset.optionField === "targetNodeId" ? target.value || null : target.value;
    if (target.dataset.optionField === "targetNodeId") {
      option.targetClusterId = null;
    }
    commitEditorChange();
    return;
  }

  handleInspectorChange(event);
}

function addTracker() {
  const tracker = createTracker();
  tracker.groupId = appState.createGame.trackerGroups[0]?.id ?? null;
  appState.createGame.trackers.push(tracker);
  appState.selection.trackerMenuId = null;
  commitEditorChange();
}

function duplicateTracker(trackerId) {
  const source = getTrackerById(appState.createGame, trackerId);
  if (!source) {
    return;
  }

  const tracker = createTracker();
  tracker.name = `${source.name} Copy`;
  tracker.startValue = source.startValue;
  tracker.visible = source.visible;
  tracker.min = source.min;
  tracker.max = source.max;
  tracker.direction = source.direction;
  tracker.sign = source.sign;
  tracker.groupId = source.groupId;
  appState.createGame.trackers.push(tracker);
  appState.selection.trackerMenuId = null;
  commitEditorChange();
}

function addTrackerGroup() {
  appState.createGame.trackerGroups.push(createTrackerGroup());
  commitEditorChange();
}

function deleteTrackerGroup(groupId) {
  appState.createGame.trackers.forEach((tracker) => {
    if (tracker.groupId === groupId) {
      tracker.groupId = null;
    }
  });
  appState.createGame.trackerGroups = appState.createGame.trackerGroups.filter((group) => group.id !== groupId);
  commitEditorChange();
}

function addFlag() {
  appState.createGame.flags.push(createFlag());
  commitEditorChange();
}

function addNodeAtViewportCenter() {
  if (!appState.createGame) {
    return;
  }

  const frame = getCanvasFocusFrame();
  const worldX = (frame.originX + frame.width / 2 - appState.graph.panX) / appState.graph.zoom;
  const worldY = (frame.originY + frame.height / 2 - appState.graph.panY) / appState.graph.zoom;
  const template = getNodeCreationTemplate(appState.createGame, appState.selection.nodeId);
  const node = createNode("", template);
  node.position.x = clamp(Math.round(worldX - NODE_WIDTH / 2), 0, GRAPH_WORLD_WIDTH - NODE_WIDTH - 40);
  node.position.y = clamp(Math.round(worldY - 120), 0, GRAPH_WORLD_HEIGHT - 220);
  appState.createGame.nodes.push(node);
  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  commitEditorChange();
}

function placeEndNodeAtViewportCenter() {
  if (!appState.createGame || appState.createGame.endNode?.placed) {
    return;
  }

  const frame = getCanvasFocusFrame();
  const worldX = (frame.originX + frame.width / 2 - appState.graph.panX) / appState.graph.zoom;
  const worldY = (frame.originY + frame.height / 2 - appState.graph.panY) / appState.graph.zoom;
  appState.createGame.endNode.placed = true;
  appState.createGame.endNode.position.x = clamp(
    Math.round(worldX - SPECIAL_NODE_WIDTH / 2),
    0,
    GRAPH_WORLD_WIDTH - SPECIAL_NODE_WIDTH - 40
  );
  appState.createGame.endNode.position.y = clamp(Math.round(worldY - 60), 0, GRAPH_WORLD_HEIGHT - 120);
  appState.selection.nodeId = null;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = "end";
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  commitEditorChange();
}

function addClusterAtViewportCenter() {
  if (!appState.createGame) {
    return;
  }

  const frame = getCanvasFocusFrame();
  const worldX = (frame.originX + frame.width / 2 - appState.graph.panX) / appState.graph.zoom;
  const worldY = (frame.originY + frame.height / 2 - appState.graph.panY) / appState.graph.zoom;
  const cluster = createCluster(`Cluster ${appState.createGame.clusters.length + 1}`);
  cluster.position.x = clamp(Math.round(worldX - 64), 0, GRAPH_WORLD_WIDTH - 180);
  cluster.position.y = clamp(Math.round(worldY - 32), 0, GRAPH_WORLD_HEIGHT - 120);
  appState.createGame.clusters.push(cluster);
  appState.selection.nodeId = null;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = cluster.id;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  commitEditorChange();
}

function addLogicNodeAtViewportCenter() {
  if (!appState.createGame) {
    return;
  }

  const frame = getCanvasFocusFrame();
  const worldX = (frame.originX + frame.width / 2 - appState.graph.panX) / appState.graph.zoom;
  const worldY = (frame.originY + frame.height / 2 - appState.graph.panY) / appState.graph.zoom;
  const logicNode = createLogicNode(`Logic ${appState.createGame.logicNodes.length + 1}`);
  logicNode.position.x = clamp(Math.round(worldX - 84), 0, GRAPH_WORLD_WIDTH - 220);
  logicNode.position.y = clamp(Math.round(worldY - 40), 0, GRAPH_WORLD_HEIGHT - 140);
  appState.createGame.logicNodes.push(logicNode);
  appState.selection.nodeId = null;
  appState.selection.logicNodeId = logicNode.id;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  appState.selection.logicNodeMenuId = logicNode.id;
  commitEditorChange();
}

function duplicateNode(nodeId) {
  if (!appState.createGame) {
    return;
  }

  const source = getNodeById(appState.createGame, nodeId);
  if (!source) {
    return;
  }

  const duplicate = createNode(source.name, {
    secondary: source.secondary,
  });
  duplicate.paragraphs = source.paragraphs.map(duplicateParagraphData);
  duplicate.editorNotes = source.editorNotes;
  duplicate.position.x = clamp(source.position.x + 44, 0, GRAPH_WORLD_WIDTH - NODE_WIDTH - 40);
  duplicate.position.y = clamp(source.position.y + 44, 0, GRAPH_WORLD_HEIGHT - 220);
  duplicate.options = source.options.map((option) => duplicateOption(option, source.id, duplicate.id));

  appState.createGame.nodes.push(duplicate);
  appState.selection.nodeId = duplicate.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  appState.selection.nodeMenuId = null;
  appState.selection.paragraphMenuId = null;
  appState.selection.optionMenuId = null;
  commitEditorChange();
}

function duplicateLogicNode(logicNodeId) {
  if (!appState.createGame) {
    return;
  }

  const source = getLogicNodeById(appState.createGame, logicNodeId);
  if (!source) {
    return;
  }

  const duplicate = createLogicNode(source.name ? `${source.name} Copy` : "Logic Node Copy");
  duplicate.targetNodeId = source.targetNodeId;
  duplicate.position.x = clamp(source.position.x + 44, 0, GRAPH_WORLD_WIDTH - 220);
  duplicate.position.y = clamp(source.position.y + 44, 0, GRAPH_WORLD_HEIGHT - 140);
  duplicate.triggers = source.triggers.map((trigger) => ({ ...clone(trigger), id: createId("logic-trigger") }));
  duplicate.actions = source.actions.map((action) => ({ ...clone(action), id: createId("logic-action") }));

  appState.createGame.logicNodes.push(duplicate);
  appState.selection.nodeId = null;
  appState.selection.logicNodeId = duplicate.id;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  appState.selection.logicNodeMenuId = duplicate.id;
  commitEditorChange();
}

function addParagraph(nodeId) {
  const node = getNodeById(appState.createGame, nodeId);
  if (!node) {
    return;
  }

  const paragraph = createParagraph("New paragraph");
  node.paragraphs.push(paragraph);
  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = paragraph.id;
  appState.selection.optionId = null;
  appState.selection.paragraphMenuId = buildParagraphMenuKey(node.id, paragraph.id);
  appState.selection.optionMenuId = null;
  commitEditorChange();
}

function duplicateParagraph(nodeId, paragraphId) {
  const node = getNodeById(appState.createGame, nodeId);
  const paragraph = getParagraphById(node, paragraphId);
  if (!paragraph) {
    return;
  }

  const duplicate = duplicateParagraphData(paragraph);
  const index = node.paragraphs.findIndex((entry) => entry.id === paragraphId);
  node.paragraphs.splice(index + 1, 0, duplicate);
  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = duplicate.id;
  appState.selection.optionId = null;
  appState.selection.paragraphMenuId = buildParagraphMenuKey(node.id, duplicate.id);
  appState.selection.optionMenuId = null;
  commitEditorChange();
}

function moveItemInArray(items, fromIndex, direction) {
  const toIndex = fromIndex + direction;
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return false;
  }

  const [item] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, item);
  return true;
}

function moveParagraph(nodeId, paragraphId, direction) {
  const node = getNodeById(appState.createGame, nodeId);
  if (!node) {
    return;
  }

  const index = node.paragraphs.findIndex((paragraph) => paragraph.id === paragraphId);
  if (!moveItemInArray(node.paragraphs, index, direction)) {
    return;
  }

  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = paragraphId;
  appState.selection.optionId = null;
  appState.selection.paragraphMenuId = buildParagraphMenuKey(node.id, paragraphId);
  appState.selection.optionMenuId = null;
  commitEditorChange();
}

function deleteParagraph(nodeId, paragraphId) {
  const node = getNodeById(appState.createGame, nodeId);
  if (!node || node.paragraphs.length === 1) {
    return;
  }

  node.paragraphs = node.paragraphs.filter((paragraph) => paragraph.id !== paragraphId);
  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = node.paragraphs[0]?.id || null;
  appState.selection.optionId = null;
  appState.selection.paragraphMenuId = null;
  appState.selection.optionMenuId = null;
  appState.selection.floatingActionMenuId = null;
  commitEditorChange();
}

function duplicateNodeOption(nodeId, optionId) {
  const node = getNodeById(appState.createGame, nodeId);
  const option = getOptionById(node, optionId);
  if (!option) {
    return;
  }

  const duplicate = duplicateOption(option, node.id, node.id);
  const index = node.options.findIndex((entry) => entry.id === optionId);
  node.options.splice(index + 1, 0, duplicate);
  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = duplicate.id;
  appState.selection.optionMenuId = buildOptionMenuKey(node.id, duplicate.id);
  appState.selection.floatingActionMenuId = null;
  commitEditorChange();
}

function moveOption(nodeId, optionId, direction) {
  const node = getNodeById(appState.createGame, nodeId);
  if (!node) {
    return;
  }

  const index = node.options.findIndex((option) => option.id === optionId);
  if (!moveItemInArray(node.options, index, direction)) {
    return;
  }

  appState.selection.nodeId = node.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = optionId;
  appState.selection.optionMenuId = buildOptionMenuKey(node.id, optionId);
  appState.selection.floatingActionMenuId = null;
  commitEditorChange();
}

function deleteSelectedNode() {
  if (!appState.createGame || appState.createGame.nodes.length === 1) {
    return;
  }

  const nodeId = appState.selection.nodeId;
  const remainingNodes = appState.createGame.nodes.filter((node) => node.id !== nodeId);
  const fallbackNode = remainingNodes[0];

  appState.createGame.nodes = remainingNodes;
  appState.createGame.clusters.forEach((cluster) => {
    if (cluster.targetNodeId === nodeId) {
      cluster.targetNodeId = null;
    }
  });
  appState.createGame.logicNodes.forEach((logicNode) => {
    if (logicNode.targetNodeId === nodeId) {
      logicNode.targetNodeId = null;
    }
    logicNode.triggers.forEach((trigger) => {
      if (trigger.targetNodeId === nodeId) {
        trigger.targetNodeId = null;
      }
    });
    logicNode.actions.forEach((action) => {
      if (action.targetNodeId === nodeId) {
        action.targetNodeId = null;
      }
    });
  });
  appState.createGame.nodes.forEach((node) => {
    node.options.forEach((option) => {
      if (option.targetNodeId === nodeId) {
        option.targetNodeId = null;
      }
    });
  });
  if (appState.createGame.startNode?.targetNodeId === nodeId) {
    appState.createGame.startNode.targetNodeId = fallbackNode?.id || null;
  }
  appState.selection.nodeId = fallbackNode.id;
  appState.selection.logicNodeId = null;
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  appState.selection.paragraphId = null;
  appState.selection.optionId = null;
  appState.selection.nodeMenuId = null;
  appState.selection.paragraphMenuId = null;
  appState.selection.optionMenuId = null;
  commitEditorChange();
}

function deleteSelectedCluster() {
  if (!appState.createGame || !appState.selection.clusterId) {
    return;
  }

  const clusterId = appState.selection.clusterId;
  appState.createGame.clusters = appState.createGame.clusters.filter((cluster) => cluster.id !== clusterId);
  appState.createGame.nodes.forEach((node) => {
    node.options.forEach((option) => {
      if (option.targetClusterId === clusterId) {
        option.targetClusterId = null;
      }
    });
  });
  appState.selection.clusterId = null;
  appState.selection.specialNodeKind = null;
  commitEditorChange();
}

function deleteSelectedLogicNode() {
  if (!appState.createGame || !appState.selection.logicNodeId) {
    return;
  }

  const logicNodeId = appState.selection.logicNodeId;
  appState.createGame.logicNodes = appState.createGame.logicNodes.filter((logicNode) => logicNode.id !== logicNodeId);
  appState.createGame.clusters.forEach((cluster) => {
    if (cluster.targetNodeId === logicNodeId) {
      cluster.targetNodeId = null;
    }
  });
  appState.createGame.nodes.forEach((node) => {
    node.options.forEach((option) => {
      if (option.targetNodeId === logicNodeId) {
        option.targetNodeId = null;
      }
    });
  });
  appState.createGame.logicNodes.forEach((logicNode) => {
    if (logicNode.targetNodeId === logicNodeId) {
      logicNode.targetNodeId = null;
    }
    logicNode.triggers.forEach((trigger) => {
      if (trigger.targetNodeId === logicNodeId) {
        trigger.targetNodeId = null;
      }
    });
    logicNode.actions.forEach((action) => {
      if (action.targetNodeId === logicNodeId) {
        action.targetNodeId = null;
      }
    });
  });
  appState.selection.logicNodeId = null;
  appState.selection.logicNodeMenuId = null;
  appState.selection.specialNodeKind = null;
  commitEditorChange();
}

function centerGraph() {
  if (!appState.createGame || (!appState.createGame.nodes.length && !appState.createGame.clusters.length && !appState.createGame.logicNodes.length)) {
    appState.graph.panX = 140;
    appState.graph.panY = 110;
    appState.graph.zoom = 1;
    renderCreateView();
    return;
  }

  const bounds = getGraphBounds([
    appState.createGame.startNode,
    ...(appState.createGame.endNode?.placed ? [appState.createGame.endNode] : []),
    ...appState.createGame.nodes,
    ...appState.createGame.clusters,
    ...appState.createGame.logicNodes,
  ]);
  const frame = getCanvasFocusFrame();
  const availableWidth = frame.width || 900;
  const availableHeight = frame.height || 600;
  const zoomX = availableWidth / Math.max(bounds.maxX - bounds.minX + 220, 1);
  const zoomY = availableHeight / Math.max(bounds.maxY - bounds.minY + 180, 1);
  appState.graph.zoom = clamp(Math.min(1, zoomX, zoomY), 0.45, 1.2);
  appState.graph.panX =
    frame.originX + availableWidth / 2 - ((bounds.minX + bounds.maxX) / 2 + NODE_WIDTH / 2) * appState.graph.zoom;
  appState.graph.panY =
    frame.originY + availableHeight / 2 - ((bounds.minY + bounds.maxY) / 2 + 80) * appState.graph.zoom;
  renderCreateView();
}

function zoomGraph(factor) {
  appState.graph.zoom = clamp(appState.graph.zoom * factor, 0.45, 1.8);
  renderCreateView();
}

function applyGraphTransform() {
  refs.graphWorld.style.transform = `translate(${appState.graph.panX}px, ${appState.graph.panY}px) scale(${appState.graph.zoom})`;
}

function getCanvasFocusFrame() {
  const rect = refs.graphViewport.getBoundingClientRect();
  const leftPanelRect = refs.graphViewport.querySelector(".create-panel-left")?.getBoundingClientRect();
  const rightPanelVisible = !refs.editorInspectorShell.classList.contains("hidden");
  const rightPanelRect = rightPanelVisible
    ? refs.graphViewport.querySelector(".create-panel-right")?.getBoundingClientRect()
    : null;
  const leftInset = leftPanelRect && leftPanelRect.width < rect.width * 0.6 ? leftPanelRect.width + 28 : 0;
  const rightInset = rightPanelRect && rightPanelRect.width < rect.width * 0.45 ? rightPanelRect.width + 28 : 0;

  return {
    originX: leftInset,
    originY: 0,
    width: Math.max(rect.width - leftInset - rightInset, 320),
    height: rect.height,
  };
}

function getNodeCreationTemplate(game, sourceNodeId) {
  const sourceNode =
    getNodeById(game, sourceNodeId) ||
    [...game.nodes].reverse().find((node) => node.secondary) ||
    null;

  if (!sourceNode) {
    return { secondary: "" };
  }

  return {
    secondary: "",
  };
}

function getGameStartNodeId(game) {
  if (game?.startNode?.targetNodeId && getPassTargetById(game, game.startNode.targetNodeId)) {
    return game.startNode.targetNodeId;
  }
  return null;
}

function sanitizeEditableNodeId(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 16);
}

function renameNodeId(game, previousId, requestedId) {
  const node = getNodeById(game, previousId);
  if (!node) {
    return false;
  }

  const nextId = sanitizeEditableNodeId(requestedId);
  if (!nextId) {
    window.alert("Story node reference IDs must contain only letters, numbers, dashes, or underscores.");
    return false;
  }
  if (nextId === previousId) {
    return true;
  }
  if (getNodeById(game, nextId) || getLogicNodeById(game, nextId) || getClusterById(game, nextId) || game?.endNode?.id === nextId || game?.startNode?.id === nextId) {
    window.alert(`The reference ID "${nextId}" is already in use.`);
    return false;
  }

  node.id = nextId;

  if (game.startNode?.targetNodeId === previousId) {
    game.startNode.targetNodeId = nextId;
  }

  game.nodes.forEach((entry) => {
    entry.options.forEach((option) => {
      if (option.targetNodeId === previousId) {
        option.targetNodeId = nextId;
      }
    });
  });

  game.clusters.forEach((cluster) => {
    if (cluster.targetNodeId === previousId) {
      cluster.targetNodeId = nextId;
    }
  });

  (game.logicNodes || []).forEach((logicNode) => {
    if (logicNode.targetNodeId === previousId) {
      logicNode.targetNodeId = nextId;
    }
    logicNode.triggers.forEach((trigger) => {
      if (trigger.targetNodeId === previousId) {
        trigger.targetNodeId = nextId;
      }
    });
    logicNode.actions.forEach((action) => {
      if (action.targetNodeId === previousId) {
        action.targetNodeId = nextId;
      }
    });
  });

  if (appState.selection.nodeId === previousId) {
    appState.selection.nodeId = nextId;
  }
  if (appState.selection.nodeMenuId === previousId) {
    appState.selection.nodeMenuId = nextId;
  }
  if (appState.selection.paragraphMenuId) {
    const [nodeId, paragraphId] = appState.selection.paragraphMenuId.split(":");
    if (nodeId === previousId) {
      appState.selection.paragraphMenuId = buildParagraphMenuKey(nextId, paragraphId);
    }
  }
  if (appState.selection.optionMenuId) {
    const [nodeId, optionId] = appState.selection.optionMenuId.split(":");
    if (nodeId === previousId) {
      appState.selection.optionMenuId = buildOptionMenuKey(nextId, optionId);
    }
  }
  if (appState.selection.floatingActionMenuId) {
    const [kind, nodeId, itemId] = appState.selection.floatingActionMenuId.split(":");
    if (nodeId === previousId) {
      appState.selection.floatingActionMenuId = buildFloatingActionMenuKey(kind, nextId, itemId);
    }
  }

  return true;
}

function withSelectedNode(mutator) {
  if (!appState.createGame || !appState.selection.nodeId) {
    return;
  }

  const node = getNodeById(appState.createGame, appState.selection.nodeId);
  if (node) {
    mutator(node, appState.createGame);
  }
}

function withSelectedOption(mutator) {
  withSelectedNode((node, game) => {
    const option = getOptionById(node, appState.selection.optionId);
    if (option) {
      mutator(option, game, node);
    }
  });
}

function withSelectedLogicNode(mutator) {
  if (!appState.createGame || !appState.selection.logicNodeId) {
    return;
  }

  const logicNode = getLogicNodeById(appState.createGame, appState.selection.logicNodeId);
  if (logicNode) {
    mutator(logicNode, appState.createGame);
  }
}

function withSelectedParagraph(mutator) {
  withSelectedNode((node, game) => {
    const paragraph = getParagraphById(node, appState.selection.paragraphId);
    if (paragraph) {
      mutator(paragraph, game, node);
    }
  });
}

function commitEditorChange() {
  normalizeEditorSelection();
  persistEditorDraft();
  renderCreateView();
}

function normalizeEditorSelection() {
  if (!appState.createGame) {
    appState.selection.nodeId = null;
    appState.selection.logicNodeId = null;
    appState.selection.clusterId = null;
    appState.selection.specialNodeKind = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.logicNodeMenuId = null;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
    return;
  }

  if (!getNodeById(appState.createGame, appState.selection.nodeId)) {
    appState.selection.nodeId = null;
    appState.selection.paragraphId = null;
    appState.selection.optionId = null;
    appState.selection.nodeMenuId = null;
    appState.selection.paragraphMenuId = null;
    appState.selection.optionMenuId = null;
    appState.selection.floatingActionMenuId = null;
    appState.selection.selectMenuId = null;
  }

  if (appState.selection.logicNodeId && !getLogicNodeById(appState.createGame, appState.selection.logicNodeId)) {
    appState.selection.logicNodeId = null;
    appState.selection.logicNodeMenuId = null;
  }

  if (appState.selection.clusterId && !getClusterById(appState.createGame, appState.selection.clusterId)) {
    appState.selection.clusterId = null;
  }

  if (appState.selection.specialNodeKind && !getSpecialNodeByKind(appState.createGame, appState.selection.specialNodeKind)) {
    appState.selection.specialNodeKind = null;
  }
  if (appState.selection.specialNodeKind === "end" && !appState.createGame.endNode?.placed) {
    appState.selection.specialNodeKind = null;
  }

  const node = getNodeById(appState.createGame, appState.selection.nodeId);
  if (!node || !getParagraphById(node, appState.selection.paragraphId)) {
    appState.selection.paragraphId = null;
  }
  if (!node || !getOptionById(node, appState.selection.optionId)) {
    appState.selection.optionId = null;
  }
  if (appState.selection.nodeMenuId && !getNodeById(appState.createGame, appState.selection.nodeMenuId)) {
    appState.selection.nodeMenuId = null;
  }
  if (appState.selection.logicNodeMenuId && !getLogicNodeById(appState.createGame, appState.selection.logicNodeMenuId)) {
    appState.selection.logicNodeMenuId = null;
  }
  if (appState.selection.paragraphMenuId) {
    const [nodeId, paragraphId] = appState.selection.paragraphMenuId.split(":");
    if (!getParagraphById(getNodeById(appState.createGame, nodeId), paragraphId)) {
      appState.selection.paragraphMenuId = null;
    }
  }
  if (appState.selection.optionMenuId) {
    const [nodeId, optionId] = appState.selection.optionMenuId.split(":");
    if (!getOptionById(getNodeById(appState.createGame, nodeId), optionId)) {
      appState.selection.optionMenuId = null;
    }
  }
  if (appState.selection.floatingActionMenuId) {
    const [kind, nodeId, itemId] = appState.selection.floatingActionMenuId.split(":");
    const nodeForMenu = getNodeById(appState.createGame, nodeId);
    const menuTarget =
      kind === "paragraph"
        ? getParagraphById(nodeForMenu, itemId)
        : kind === "option"
          ? getOptionById(nodeForMenu, itemId)
          : null;
    if (!menuTarget) {
      appState.selection.floatingActionMenuId = null;
    }
  }
  if (appState.selection.selectMenuId) {
    const menuExists =
      refs.editorSidebarContent.querySelector(`[data-select-menu-id="${escapeAttr(appState.selection.selectMenuId)}"]`) ||
      refs.editorInspector.querySelector(`[data-select-menu-id="${escapeAttr(appState.selection.selectMenuId)}"]`) ||
      refs.graphNodes.querySelector(`[data-select-menu-id="${escapeAttr(appState.selection.selectMenuId)}"]`);
    if (!menuExists) {
      appState.selection.selectMenuId = null;
    }
  }
}

function createGameScaffold() {
  resetIssuedIds();
  const group = createTrackerGroup("Core");
  const openingNode = createNode("");
  const startNode = createStartNode(openingNode.id);
  const endNode = createEndNode(false);

  return {
    format: GAME_FORMAT,
    version: GAME_VERSION,
    metadata: {
      name: "Untitled Game",
      description: "",
    },
    world: {
      clockFormat: "24",
      locations: [],
    },
    trackerGroups: [group],
    trackers: [],
    flags: [],
    profiles: [],
    strings: [],
    clusters: [],
    logicNodes: [],
    startNode,
    endNode,
    nodes: [openingNode],
  };
}

function createNode(name = "", template = {}) {
  return {
    id: createId("node"),
    name,
    secondary: template.secondary || "",
    paragraphs: [createParagraph("Write the system message here.")],
    position: {
      x: 160,
      y: 140,
    },
    editorNotes: "",
    options: [],
  };
}

function createStartNode(targetNodeId = null) {
  return {
    id: START_NODE_ID,
    kind: "start",
    name: "Start Node",
    targetNodeId,
    position: {
      x: 20,
      y: 200,
    },
  };
}

function createEndNode(placed = true) {
  return {
    id: END_NODE_ID,
    kind: "end",
    name: "End Node",
    placed,
    position: {
      x: 1880,
      y: 200,
    },
  };
}

function createCluster(name = "Cluster") {
  return {
    id: createId("cluster"),
    name,
    targetNodeId: null,
    position: {
      x: 240,
      y: 200,
    },
  };
}

function createLogicNode(name = "Logic Node") {
  return {
    id: createId("logic"),
    name,
    targetNodeId: null,
    position: {
      x: 300,
      y: 240,
    },
    triggers: [],
    actions: [],
  };
}

function createOption() {
  return {
    id: createId("option"),
    text: "New option",
    targetNodeId: null,
    targetClusterId: null,
    terminal: "target",
    failureMode: "disabled",
    requirementDisplayMode: "none",
    requirementDisplayText: "",
    effectDisplayMode: "none",
    effectDisplayText: "",
    requirements: [],
    variableEffects: [],
  };
}

function createParagraph(text = "Write the system message here.") {
  return {
    id: createId("paragraph"),
    text,
    requirements: [],
  };
}

function duplicateParagraphData(paragraph) {
  return {
    id: createId("paragraph"),
    text: paragraph.text,
    requirements: paragraph.requirements.map((requirement) => ({ ...clone(requirement), id: createId("req") })),
  };
}

function getParagraphById(node, paragraphId) {
  return node?.paragraphs?.find((paragraph) => paragraph.id === paragraphId) || null;
}

function buildParagraphMenuKey(nodeId, paragraphId) {
  return `${nodeId}:${paragraphId}`;
}

function buildOptionMenuKey(nodeId, optionId) {
  return `${nodeId}:${optionId}`;
}

function buildFloatingActionMenuKey(kind, nodeId, itemId) {
  return `${kind}:${nodeId}:${itemId}`;
}

function duplicateOption(option, sourceNodeId, duplicateNodeId) {
  return {
    ...clone(option),
    id: createId("option"),
    targetNodeId:
      option.targetNodeId === sourceNodeId
        ? duplicateNodeId
        : option.targetNodeId,
    requirements: option.requirements.map((requirement) => ({ ...clone(requirement), id: createId("req") })),
    variableEffects: option.variableEffects.map((effect) => ({ ...clone(effect), id: createId("ve") })),
  };
}

function createTrackerRequirement(targetId, id = createId("req")) {
  return {
    id,
    kind: "tracker",
    joinMode: "and",
    targetId,
    operator: ">=",
    value: 0,
    state: null,
  };
}

function createFlagRequirement(targetId, id = createId("req")) {
  return {
    id,
    kind: "flag",
    joinMode: "and",
    targetId,
    operator: "=",
    value: 0,
    state: null,
  };
}

function createProfileRequirement(targetId, id = createId("req")) {
  return {
    id,
    kind: "profile",
    joinMode: "and",
    targetId,
    operator: "=",
    value: 0,
    state: null,
  };
}

function createTrackerEffect(trackerId) {
  return {
    id: createId("te"),
    trackerId,
    delta: 1,
  };
}

function createFlagEffect(flagId) {
  return {
    id: createId("fe"),
    flagId,
    state: null,
  };
}

function createVariableEffect(variableType = "tracker", variableId = null, id = createId("ve")) {
  return {
    id,
    action: "set",
    variableType,
    variableId,
    value: variableType === "flag" || variableType === "profile" ? null : variableType === "string" ? "" : 0,
  };
}

function createLogicTrigger(kind = "passSelf", id = createId("logic-trigger")) {
  return {
    id,
    kind,
    targetNodeId: null,
    variableType: "tracker",
    variableId: null,
    operator: "changed",
    value: 0,
    eventName: "",
  };
}

function createLogicAction(kind = "emitEvent", id = createId("logic-action")) {
  return {
    id,
    kind,
    eventName: "",
    action: "set",
    variableType: "tracker",
    variableId: null,
    value: 0,
    targetNodeId: null,
  };
}

function getFirstVariableId(game, variableType) {
  if (variableType === "flag") {
    return game.flags[0]?.id ?? null;
  }
  if (variableType === "profile") {
    return game.profiles[0]?.id ?? null;
  }
  if (variableType === "string") {
    return game.strings[0]?.id ?? null;
  }
  return game.trackers[0]?.id ?? null;
}

function createTracker() {
  return {
    id: createId("tracker"),
    name: "New Integer",
    startValue: 0,
    visible: true,
    min: null,
    max: null,
    direction: "both",
    sign: "any",
    groupId: null,
  };
}

function createTrackerGroup(name = "New Group") {
  return {
    id: createId("group"),
    name,
  };
}

function createFlag() {
  return {
    id: createId("flag"),
    name: "New Enum",
    visible: false,
    states: ["set"],
  };
}

function createProfile(name = "New Profile") {
  return {
    id: createId("profile"),
    name,
    visible: false,
    startState: null,
    states: [createProfileState("default")],
  };
}

function createProfileState(name = "State") {
  return {
    id: createId("profile-state"),
    name,
    mappings: [],
  };
}

function createStringVariable() {
  return {
    id: createId("string"),
    name: "New String",
    startValue: "",
  };
}

function normalizeGame(rawGame) {
  if (!rawGame || typeof rawGame !== "object") {
    return createGameScaffold();
  }

  reserveRawIds(rawGame);

  const rawTrackerGroups = Array.isArray(rawGame.integerGroups)
    ? rawGame.integerGroups
    : Array.isArray(rawGame.trackerGroups)
      ? rawGame.trackerGroups
      : [];
  const rawTrackers = Array.isArray(rawGame.integers)
    ? rawGame.integers
    : Array.isArray(rawGame.trackers)
      ? rawGame.trackers
      : [];
  const rawFlags = Array.isArray(rawGame.enums)
    ? rawGame.enums
    : Array.isArray(rawGame.flags)
      ? rawGame.flags
      : [];
  const rawProfiles = Array.isArray(rawGame.profiles) ? rawGame.profiles : [];

  const normalized = {
    format: rawGame.format || GAME_FORMAT,
    version: rawGame.version || GAME_VERSION,
    metadata: {
      name: rawGame.metadata?.name || "Untitled Game",
      description: rawGame.metadata?.description || "",
    },
    world: {
      clockFormat: rawGame.world?.clockFormat === "12" ? "12" : "24",
      locations: Array.isArray(rawGame.world?.locations)
        ? rawGame.world.locations.filter((location) => typeof location === "string" && location.trim()).map((location) => location.trim())
        : [],
    },
    trackerGroups: rawTrackerGroups.length
      ? rawTrackerGroups.map((group, index) => ({
          id: takeId(group?.id, "group"),
          name: group?.name || `Group ${index + 1}`,
        }))
      : [],
    trackers: rawTrackers.length
        ? rawTrackers.map((tracker) => ({
          id: takeId(tracker?.id, "tracker"),
          name: tracker?.name || "Untitled Integer",
          startValue: parseNumberOrFallback(tracker?.startValue, 0),
          visible: tracker?.visible !== false,
          min: parseNullableNumber(tracker?.min),
          max: parseNullableNumber(tracker?.max),
          direction: DIRECTION_OPTIONS.some((item) => item.value === tracker?.direction)
            ? tracker.direction
            : "both",
          sign: SIGN_OPTIONS.some((item) => item.value === tracker?.sign) ? tracker.sign : "any",
          groupId: tracker?.groupId || null,
        }))
      : [],
    flags: rawFlags.length
        ? rawFlags.map((flag) => ({
          id: takeId(flag?.id, "flag"),
          name: flag?.name || "Untitled Enum",
          visible: Boolean(flag?.visible),
          states: Array.isArray(flag?.states)
            ? flag.states.filter((state) => typeof state === "string" && state.length)
            : [],
        }))
      : [],
    profiles: rawProfiles.length ? rawProfiles.map(normalizeProfile) : [],
    strings: Array.isArray(rawGame.strings)
      ? rawGame.strings.map((entry) => ({
          id: takeId(entry?.id, "string"),
          name: entry?.name || "Untitled String",
          startValue: typeof entry?.startValue === "string" ? entry.startValue : "",
        }))
      : [],
    clusters: Array.isArray(rawGame.clusters) ? rawGame.clusters.map(normalizeCluster) : [],
    logicNodes: Array.isArray(rawGame.logicNodes) ? rawGame.logicNodes.map(normalizeLogicNode) : [],
    nodes: Array.isArray(rawGame.nodes)
      ? rawGame.nodes.map((node, index) => normalizeNode(node, index, rawGame))
      : [],
  };

  if (!normalized.nodes.length) {
    const node = createNode("");
    normalized.nodes.push(node);
  }

  const legacyStartTargetId =
    rawGame.startNode?.targetNodeId ||
    rawGame.chapters?.[0]?.startNodeId ||
    rawGame.rootNodeId ||
    rawGame.nodes?.[0]?.id ||
    normalized.nodes[0]?.id ||
    null;
  normalized.startNode = normalizeStartNode(rawGame.startNode, legacyStartTargetId);
  normalized.endNode = normalizeEndNode(rawGame.endNode);

  normalized.nodes.forEach((node, index) => {
    if (!node.position) {
      node.position = { x: 120 + index * 40, y: 120 + index * 30 };
    }
  });

  normalized.logicNodes.forEach((logicNode, index) => {
    if (!logicNode.position) {
      logicNode.position = { x: 220 + index * 30, y: 180 + index * 24 };
    }
  });

  normalized.nodes.forEach((node) => {
    node.options.forEach((option) => {
      if (option.terminal !== "target") {
        option.terminal = "target";
        option.targetClusterId = null;
        option.targetNodeId = normalized.endNode.id;
      }
    });
  });

  registerGameIds(normalized);

  return normalized;
}

function normalizeNode(node, index, rawGame) {
  const paragraphs = Array.isArray(node?.paragraphs)
    ? node.paragraphs.map((paragraph, paragraphIndex) => normalizeParagraph(paragraph, node, paragraphIndex))
    : [normalizeParagraph({ text: node?.body || "" }, node, 0)];

  return {
    id: takeId(node?.id, "node"),
    name: typeof node?.name === "string" ? node.name : "",
    secondary: node?.secondary || "",
    time: typeof node?.time === "string" ? node.time : "",
    location: typeof node?.location === "string" ? node.location : "",
    paragraphs,
    position: {
      x: parseNumberOrFallback(node?.position?.x, 120 + index * 36),
      y: parseNumberOrFallback(node?.position?.y, 120 + index * 28),
    },
    editorNotes: node?.editorNotes || "",
    options: Array.isArray(node?.options) ? node.options.map(normalizeOption) : [],
  };
}

function normalizeProfile(profile, index) {
  const states = Array.isArray(profile?.states) ? profile.states.map(normalizeProfileState) : [];
  const startState =
    typeof profile?.startState === "string" || profile?.startState === null ? profile.startState ?? null : null;

  return {
    id: takeId(profile?.id, "profile"),
    name: profile?.name || `Profile ${index + 1}`,
    visible: Boolean(profile?.visible),
    startState: states.some((state) => state.name === startState) ? startState : null,
    states,
  };
}

function normalizeProfileState(state, index) {
  const rawMappings = Array.isArray(state?.setVariables)
    ? state.setVariables
    : Array.isArray(state?.mappings)
      ? state.mappings
      : Array.isArray(state?.variableEffects)
        ? state.variableEffects
        : [];

  return {
    id: takeId(state?.id, "profile-state"),
    name: state?.name || `State ${index + 1}`,
    mappings: rawMappings.map((effect) => ({
      id: takeId(effect?.id, "ve"),
      action: effect?.action || "set",
      variableType: effect?.variableType || "tracker",
      variableId: effect?.variableId || null,
      value:
        effect?.value ??
        (effect?.variableType === "string" ? "" : effect?.variableType === "flag" || effect?.variableType === "profile" ? null : 0),
    })),
  };
}

function normalizeParagraph(paragraph, node, index) {
  const rawRequirements = Array.isArray(paragraph?.variableChecks)
    ? paragraph.variableChecks
    : Array.isArray(paragraph?.requirements)
      ? paragraph.requirements
      : [];

  return {
    id: takeId(paragraph?.id, "paragraph"),
    text: typeof paragraph?.text === "string" ? paragraph.text : index === 0 ? node?.body || "" : "",
    requirements: rawRequirements.length
      ? rawRequirements
          .map((requirement) =>
            requirement?.kind === "flag"
              ? createFlagRequirement(requirement.targetId || null, takeId(requirement?.id, "req"))
              : requirement?.kind === "profile"
                ? createProfileRequirement(requirement.targetId || null, takeId(requirement?.id, "req"))
              : createTrackerRequirement(requirement.targetId || null, takeId(requirement?.id, "req"))
          )
          .map((requirement, requirementIndex) => normalizeRequirement(requirement, rawRequirements[requirementIndex]))
      : [],
  };
}

function normalizeOption(option) {
  const rawRequirements = Array.isArray(option?.variableChecks)
    ? option.variableChecks
    : Array.isArray(option?.requirements)
      ? option.requirements
      : [];
  const legacyVariableEffects = [
    ...(Array.isArray(option?.trackerEffects)
      ? option.trackerEffects.map((effect) => ({
          id: takeId(effect?.id, "ve"),
          action: parseNumberOrFallback(effect?.delta, 0) < 0 ? "decrease" : "increase",
          variableType: "tracker",
          variableId: effect?.trackerId || null,
          value: Math.abs(parseNumberOrFallback(effect?.delta, 0)),
        }))
      : []),
    ...(Array.isArray(option?.flagEffects)
      ? option.flagEffects.map((effect) => ({
          id: takeId(effect?.id, "ve"),
          action: "set",
          variableType: "flag",
          variableId: effect?.flagId || null,
          value: effect?.state ?? null,
        }))
      : []),
  ];

  return {
    id: takeId(option?.id, "option"),
    text: option?.text || "Untitled option",
    targetNodeId: option?.targetNodeId || null,
    targetClusterId: option?.targetClusterId || null,
    terminal: TERMINAL_OPTIONS.some((item) => item.value === option?.terminal) ? option.terminal : "target",
    failureMode: FAILURE_OPTIONS.some((item) => item.value === option?.failureMode)
      ? option.failureMode
      : "disabled",
    requirementDisplayMode: DISPLAY_OPTIONS.some((item) => item.value === option?.requirementDisplayMode)
      ? option.requirementDisplayMode
      : "none",
    requirementDisplayText: option?.requirementDisplayText || "",
    effectDisplayMode: DISPLAY_OPTIONS.some((item) => item.value === option?.effectDisplayMode)
      ? option.effectDisplayMode
      : "none",
    effectDisplayText: option?.effectDisplayText || "",
    requirements: rawRequirements.length
      ? rawRequirements.map((requirement) =>
          requirement?.kind === "flag"
            ? createFlagRequirement(requirement.targetId || null, takeId(requirement?.id, "req"))
            : requirement?.kind === "profile"
              ? createProfileRequirement(requirement.targetId || null, takeId(requirement?.id, "req"))
            : createTrackerRequirement(requirement.targetId || null, takeId(requirement?.id, "req"))
        ).map((requirement, index) => normalizeRequirement(requirement, rawRequirements[index]))
      : [],
    variableEffects: Array.isArray(option?.setVariables)
      ? option.setVariables.map((effect) => ({
          id: takeId(effect?.id, "ve"),
          action: effect?.action || "set",
          variableType: effect?.variableType || "tracker",
          variableId: effect?.variableId || null,
          value: effect?.value ?? (effect?.variableType === "string" ? "" : 0),
        }))
      : Array.isArray(option?.variableEffects)
        ? option.variableEffects.map((effect) => ({
          id: takeId(effect?.id, "ve"),
          action: effect?.action || "set",
          variableType: effect?.variableType || "tracker",
          variableId: effect?.variableId || null,
          value: effect?.value ?? (effect?.variableType === "string" ? "" : 0),
        }))
        : legacyVariableEffects,
  };
}

function normalizeCluster(cluster, index) {
  return {
    id: takeId(cluster?.id, "cluster"),
    name: cluster?.name || `Cluster ${index + 1}`,
    targetNodeId: cluster?.targetNodeId || null,
    position: {
      x: parseNumberOrFallback(cluster?.position?.x, 220 + index * 30),
      y: parseNumberOrFallback(cluster?.position?.y, 180 + index * 22),
    },
  };
}

function normalizeLogicNode(logicNode, index) {
  return {
    id: takeId(logicNode?.id, "logic"),
    name: logicNode?.name || `Logic ${index + 1}`,
    targetNodeId: logicNode?.targetNodeId || null,
    position: {
      x: parseNumberOrFallback(logicNode?.position?.x, 280 + index * 26),
      y: parseNumberOrFallback(logicNode?.position?.y, 220 + index * 22),
    },
    triggers: Array.isArray(logicNode?.triggers)
      ? logicNode.triggers.map((trigger, triggerIndex) => normalizeLogicTrigger(trigger, triggerIndex))
      : [],
    actions: Array.isArray(logicNode?.actions)
      ? logicNode.actions.map((action, actionIndex) => normalizeLogicAction(action, actionIndex))
      : [],
  };
}

function normalizeStartNode(startNode, fallbackTargetId) {
  return {
    id: START_NODE_ID,
    kind: "start",
    name: "Start Node",
    targetNodeId: startNode?.targetNodeId || fallbackTargetId || null,
    position: {
      x: parseNumberOrFallback(startNode?.position?.x, 20),
      y: parseNumberOrFallback(startNode?.position?.y, 200),
    },
  };
}

function normalizeEndNode(endNode) {
  return {
    id: END_NODE_ID,
    kind: "end",
    name: "End Node",
    placed: endNode ? endNode?.placed !== false : false,
    position: {
      x: parseNumberOrFallback(endNode?.position?.x, 1880),
      y: parseNumberOrFallback(endNode?.position?.y, 200),
    },
  };
}

function normalizeLogicTrigger(trigger, index) {
  const base = createLogicTrigger(
    ["passSelf", "passNode", "passAnyNode", "variableChange", "event"].includes(trigger?.kind)
      ? trigger.kind
      : "passSelf",
    takeId(trigger?.id, "logic-trigger")
  );
  const variableType = ["tracker", "flag", "profile", "string"].includes(trigger?.variableType)
    ? trigger.variableType
    : base.variableType;
  return {
    ...base,
    kind: base.kind,
    targetNodeId: trigger?.targetNodeId || null,
    variableType,
    variableId: trigger?.variableId || null,
    operator: typeof trigger?.operator === "string" ? trigger.operator : base.operator,
    value:
      variableType === "tracker"
        ? parseNumberOrFallback(trigger?.value, 0)
        : variableType === "flag" || variableType === "profile"
          ? trigger?.value ?? null
          : typeof trigger?.value === "string"
            ? trigger.value
            : "",
    eventName: typeof trigger?.eventName === "string" ? trigger.eventName : index === 0 ? "" : "",
  };
}

function normalizeLogicAction(action, index) {
  const base = createLogicAction(
    ["emitEvent", "changeVariable", "jumpToNode"].includes(action?.kind) ? action.kind : "emitEvent",
    takeId(action?.id, "logic-action")
  );
  const variableType = ["tracker", "flag", "profile", "string"].includes(action?.variableType)
    ? action.variableType
    : base.variableType;
  return {
    ...base,
    kind: base.kind,
    eventName: typeof action?.eventName === "string" ? action.eventName : index === 0 ? "" : "",
    action:
      action?.action === "increase" || action?.action === "decrease" || action?.action === "set"
        ? action.action
        : base.action,
    variableType,
    variableId: action?.variableId || null,
    value:
      variableType === "tracker"
        ? parseNumberOrFallback(action?.value, 0)
        : variableType === "flag" || variableType === "profile"
          ? action?.value ?? null
          : typeof action?.value === "string"
            ? action.value
            : "",
    targetNodeId: action?.targetNodeId || null,
  };
}

function normalizeRequirement(baseRequirement, rawRequirement) {
  return {
    ...baseRequirement,
    joinMode: REQUIREMENT_JOIN_OPTIONS.some((option) => option.value === rawRequirement?.joinMode)
      ? rawRequirement.joinMode
      : baseRequirement.joinMode,
    operator: TRACKER_OPERATORS.includes(rawRequirement?.operator) ? rawRequirement.operator : baseRequirement.operator,
    value: parseNumberOrFallback(rawRequirement?.value, baseRequirement.value),
    state: rawRequirement?.state ?? baseRequirement.state,
  };
}

function validateGame(game) {
  const issues = [];

  if (!game.metadata.name) {
    issues.push(makeIssue("error", "Game metadata is missing a name."));
  }
  if (!game.startNode?.targetNodeId) {
    issues.push(makeIssue("error", "The Start Node has no target."));
  } else if (!getPassTargetById(game, game.startNode.targetNodeId)) {
    issues.push(makeIssue("error", "The Start Node points to a missing target."));
  }

  collectDuplicateIssues(game.nodes, "id", "message id", issues);
  collectDuplicateIssues(game.clusters || [], "id", "cluster id", issues);
  collectDuplicateIssues(game.logicNodes || [], "id", "logic node id", issues);
  collectDuplicateIssues(game.trackers, "id", "integer id", issues);
  collectDuplicateIssues(game.flags, "id", "enum id", issues);
  collectDuplicateIssues(game.profiles, "id", "profile id", issues);
  collectDuplicateIssues(game.strings, "id", "string id", issues);
  collectDuplicateVariableNameIssues(game, issues);

  game.trackers.forEach((tracker) => {
    if (tracker.min !== null && tracker.max !== null && tracker.min > tracker.max) {
      issues.push(makeIssue("error", `Integer "${tracker.name}" has a minimum above its maximum.`, tracker.id));
    }
    if (tracker.min !== null && tracker.startValue < tracker.min) {
      issues.push(makeIssue("error", `Integer "${tracker.name}" starts below its minimum.`, tracker.id));
    }
    if (tracker.max !== null && tracker.startValue > tracker.max) {
      issues.push(makeIssue("error", `Integer "${tracker.name}" starts above its maximum.`, tracker.id));
    }
    if (tracker.sign === "nonNegative" && tracker.startValue < 0) {
      issues.push(makeIssue("error", `Integer "${tracker.name}" cannot start negative.`, tracker.id));
    }
    if (tracker.sign === "nonPositive" && tracker.startValue > 0) {
      issues.push(makeIssue("error", `Integer "${tracker.name}" cannot start positive.`, tracker.id));
    }
  });

  game.strings.forEach((entry) => {
    if (!entry.name.trim()) {
      issues.push(makeIssue("error", "A string variable is missing a name.", entry.id));
    }
  });

  game.profiles.forEach((profile) => {
    if (!profile.name.trim()) {
      issues.push(makeIssue("error", "A profile variable is missing a name.", profile.id));
    }
    if (profile.startState !== null && !profile.states.some((state) => state.name === profile.startState)) {
      issues.push(makeIssue("error", `Profile "${profile.name}" starts in a missing state.`, profile.id));
    }
    collectDuplicateIssues(profile.states, "name", `state name in profile "${profile.name}"`, issues);
    profile.states.forEach((state) => {
      if (!state.name.trim()) {
        issues.push(makeIssue("error", `Profile "${profile.name}" has an unnamed state.`, profile.id));
      }
      state.mappings.forEach((effect) => {
        if (effect.variableType === "tracker") {
          const tracker = getTrackerById(game, effect.variableId);
          if (!tracker) {
            issues.push(makeIssue("error", `Profile "${profile.name}" changes a missing integer.`, profile.id));
          }
          return;
        }
        if (effect.variableType === "flag") {
          const flag = getFlagById(game, effect.variableId);
          if (!flag) {
            issues.push(makeIssue("error", `Profile "${profile.name}" changes a missing enum.`, profile.id));
          } else if (effect.value !== null && !flag.states.includes(effect.value)) {
            issues.push(makeIssue("error", `Profile "${profile.name}" sets invalid enum state "${effect.value}".`, profile.id));
          }
          return;
        }
        if (effect.variableType === "profile") {
          const targetProfile = getProfileById(game, effect.variableId);
          if (!targetProfile) {
            issues.push(makeIssue("error", `Profile "${profile.name}" changes a missing profile.`, profile.id));
          } else if (effect.value !== null && !targetProfile.states.some((entry) => entry.name === effect.value)) {
            issues.push(makeIssue("error", `Profile "${profile.name}" sets invalid profile state "${effect.value}".`, profile.id));
          }
          return;
        }
        if (!game.strings.find((entry) => entry.id === effect.variableId)) {
          issues.push(makeIssue("error", `Profile "${profile.name}" changes a missing string.`, profile.id));
        }
      });
    });
  });

  game.clusters.forEach((cluster) => {
    if (cluster.targetNodeId && !getPassTargetById(game, cluster.targetNodeId)) {
      issues.push(makeIssue("error", `Cluster "${cluster.name}" points to a missing node.`, cluster.id));
    }
  });

  (game.logicNodes || []).forEach((logicNode) => {
    if (logicNode.targetNodeId && !getPassTargetById(game, logicNode.targetNodeId)) {
      issues.push(makeIssue("error", `Logic node "${logicNode.name}" points to a missing continue target.`, logicNode.id));
    }

    logicNode.triggers.forEach((trigger) => {
      if (trigger.kind === "passNode" && trigger.targetNodeId && !getPassTargetById(game, trigger.targetNodeId)) {
        issues.push(makeIssue("error", `Logic node "${logicNode.name}" watches a missing node.`, logicNode.id));
      }
      if (trigger.kind === "variableChange") {
        if (!getVariableById(game, trigger.variableType, trigger.variableId)) {
          issues.push(makeIssue("error", `Logic node "${logicNode.name}" watches a missing variable.`, logicNode.id));
        } else if ((trigger.variableType === "flag" || trigger.variableType === "profile") && !isValidStateValue(game, trigger.variableType, trigger.variableId, trigger.value) && !["changed"].includes(trigger.operator)) {
          issues.push(makeIssue("error", `Logic node "${logicNode.name}" watches an invalid state value.`, logicNode.id));
        }
      }
      if (trigger.kind === "event" && !String(trigger.eventName || "").trim()) {
        issues.push(makeIssue("error", `Logic node "${logicNode.name}" has an event trigger with no event name.`, logicNode.id));
      }
    });

    logicNode.actions.forEach((action) => {
      if (action.kind === "emitEvent" && !String(action.eventName || "").trim()) {
        issues.push(makeIssue("error", `Logic node "${logicNode.name}" emits an empty event name.`, logicNode.id));
      }
      if (action.kind === "changeVariable") {
        if (!getVariableById(game, action.variableType, action.variableId)) {
          issues.push(makeIssue("error", `Logic node "${logicNode.name}" changes a missing variable.`, logicNode.id));
        } else if ((action.variableType === "flag" || action.variableType === "profile") && !isValidStateValue(game, action.variableType, action.variableId, action.value)) {
          issues.push(makeIssue("error", `Logic node "${logicNode.name}" sets an invalid state value.`, logicNode.id));
        }
      }
      if (action.kind === "jumpToNode" && action.targetNodeId && !getPassTargetById(game, action.targetNodeId)) {
        issues.push(makeIssue("error", `Logic node "${logicNode.name}" jumps to a missing node.`, logicNode.id));
      }
    });
  });

  game.nodes.forEach((node) => {
    node.paragraphs.forEach((paragraph) => {
      paragraph.requirements.forEach((requirement) => {
        if (requirement.kind === "tracker") {
          const tracker = getTrackerById(game, requirement.targetId);
          if (!tracker) {
            issues.push(makeIssue("error", `A paragraph in "${node.name}" references a missing integer variable check.`, node.id));
          }
        } else if (requirement.kind === "profile") {
          const profile = getProfileById(game, requirement.targetId);
          if (!profile) {
            issues.push(makeIssue("error", `A paragraph in "${node.name}" references a missing profile variable check.`, node.id));
          } else if (requirement.state !== null && !profile.states.some((state) => state.name === requirement.state)) {
            issues.push(makeIssue("error", `A paragraph in "${node.name}" checks invalid profile state "${requirement.state}".`, node.id));
          }
        } else {
          const flag = getFlagById(game, requirement.targetId);
          if (!flag) {
            issues.push(makeIssue("error", `A paragraph in "${node.name}" references a missing enum variable check.`, node.id));
          } else if (requirement.state !== null && !flag.states.includes(requirement.state)) {
            issues.push(
              makeIssue("error", `A paragraph in "${node.name}" checks invalid enum state "${requirement.state}".`, node.id)
            );
          }
        }
      });
    });
    node.options.forEach((option) => {
      if (option.terminal === "target" && !option.targetNodeId) {
        if (!option.targetClusterId) {
          issues.push(makeIssue("error", `Option "${option.text}" has no target node.`, node.id));
        }
      }
      if (option.terminal === "target" && option.targetClusterId && !getClusterById(game, option.targetClusterId)) {
        issues.push(makeIssue("error", `Option "${option.text}" targets a missing cluster.`, node.id));
      }
      if (
        option.terminal === "target" &&
        option.targetClusterId &&
        getClusterById(game, option.targetClusterId) &&
        !resolveOptionTargetNodeId(game, option)
      ) {
        issues.push(makeIssue("error", `Option "${option.text}" targets a cluster with no target node.`, node.id));
      }
      if (option.terminal === "target" && resolveOptionTargetNodeId(game, option) && !getPassTargetById(game, resolveOptionTargetNodeId(game, option))) {
        issues.push(makeIssue("error", `Option "${option.text}" targets a missing node.`, node.id));
      }

      option.requirements.forEach((requirement) => {
        if (requirement.kind === "tracker") {
          const tracker = getTrackerById(game, requirement.targetId);
          if (!tracker) {
            issues.push(makeIssue("error", `Option "${option.text}" references a missing integer variable check.`, node.id));
          }
        } else if (requirement.kind === "profile") {
          const profile = getProfileById(game, requirement.targetId);
          if (!profile) {
            issues.push(makeIssue("error", `Option "${option.text}" references a missing profile variable check.`, node.id));
          } else if (requirement.state !== null && !profile.states.some((state) => state.name === requirement.state)) {
            issues.push(makeIssue("error", `Option "${option.text}" checks invalid profile state "${requirement.state}".`, node.id));
          }
        } else {
          const flag = getFlagById(game, requirement.targetId);
          if (!flag) {
            issues.push(makeIssue("error", `Option "${option.text}" references a missing enum variable check.`, node.id));
          } else if (requirement.state !== null && !flag.states.includes(requirement.state)) {
            issues.push(
              makeIssue("error", `Option "${option.text}" checks invalid enum state "${requirement.state}".`, node.id)
            );
          }
        }
      });

      option.variableEffects.forEach((effect) => {
        if (effect.variableType === "tracker") {
          const tracker = getTrackerById(game, effect.variableId);
          if (!tracker) {
            issues.push(makeIssue("error", `Option "${option.text}" changes a missing integer.`, node.id));
            return;
          }
          const delta =
            effect.action === "set"
              ? 0
              : effect.action === "decrease"
                ? -Math.abs(parseNumberOrFallback(effect.value, 0))
                : Math.abs(parseNumberOrFallback(effect.value, 0));
          if (tracker.direction === "increase" && delta < 0) {
            issues.push(makeIssue("warning", `Option "${option.text}" decreases integer "${tracker.name}" even though it only increases.`, node.id));
          }
          if (tracker.direction === "decrease" && delta > 0) {
            issues.push(makeIssue("warning", `Option "${option.text}" increases integer "${tracker.name}" even though it only decreases.`, node.id));
          }
          return;
        }

        if (effect.variableType === "flag") {
          const flag = getFlagById(game, effect.variableId);
          if (!flag) {
            issues.push(makeIssue("error", `Option "${option.text}" changes a missing enum.`, node.id));
          } else if (effect.value !== null && !flag.states.includes(effect.value)) {
            issues.push(makeIssue("error", `Option "${option.text}" sets invalid enum state "${effect.value}".`, node.id));
          }
          return;
        }

        if (effect.variableType === "profile") {
          const profile = getProfileById(game, effect.variableId);
          if (!profile) {
            issues.push(makeIssue("error", `Option "${option.text}" changes a missing profile.`, node.id));
          } else if (effect.value !== null && !profile.states.some((state) => state.name === effect.value)) {
            issues.push(makeIssue("error", `Option "${option.text}" sets invalid profile state "${effect.value}".`, node.id));
          }
          return;
        }

        if (!game.strings.find((entry) => entry.id === effect.variableId)) {
          issues.push(makeIssue("error", `Option "${option.text}" changes a missing string.`, node.id));
        }
      });
    });
  });

  getUnreachableNodes(game).forEach((target) => {
    issues.push(
      makeIssue(
        "warning",
        `${target.kind === "logic" ? "Logic node" : "Message"} "${target.name}" is unreachable from the opening path.`,
        target.id
      )
    );
  });

  return issues;
}

function getUnreachableNodes(game) {
  const reachableIds = new Set();
  const queue = [getGameStartNodeId(game)];

  while (queue.length) {
    const targetId = queue.shift();
    if (!targetId || reachableIds.has(targetId)) {
      continue;
    }

    const target = getPassTargetById(game, targetId);
    if (!target) {
      continue;
    }

    reachableIds.add(targetId);

    if (getNodeById(game, target.id)) {
      target.options.forEach((option) => {
        if (option.terminal === "target") {
          const nextTargetId = resolveOptionTargetNodeId(game, option);
          if (nextTargetId) {
            queue.push(nextTargetId);
          }
        }
      });
    } else if (target.targetNodeId) {
      queue.push(target.targetNodeId);
    }
  }

  return [
    ...game.nodes.filter((node) => !reachableIds.has(node.id)).map((node) => ({ ...node, kind: "message" })),
    ...(game.logicNodes || [])
      .filter((logicNode) => !reachableIds.has(logicNode.id))
      .map((logicNode) => ({ ...logicNode, kind: "logic" })),
  ];
}

function collectDuplicateIssues(items, field, label, issues) {
  const seen = new Map();
  items.forEach((item) => {
    const key = item[field];
    if (!key) {
      return;
    }

    if (seen.has(key)) {
      issues.push(makeIssue("error", `Duplicate ${label} "${key}" detected.`));
      return;
    }

    seen.set(key, true);
  });
}

function collectDuplicateVariableNameIssues(game, issues) {
  const seen = new Map();
  const variables = [
    ...game.trackers.map((entry) => ({ id: entry.id, kind: "integer", name: entry.name })),
    ...game.flags.map((entry) => ({ id: entry.id, kind: "enum", name: entry.name })),
    ...game.profiles.map((entry) => ({ id: entry.id, kind: "profile", name: entry.name })),
    ...game.strings.map((entry) => ({ id: entry.id, kind: "string", name: entry.name })),
  ];

  variables.forEach((entry) => {
    const key = String(entry.name || "").trim().toLowerCase();
    if (!key) {
      issues.push(makeIssue("error", `A ${entry.kind} variable is missing a name.`, entry.id));
      return;
    }

    if (seen.has(key)) {
      issues.push(
        makeIssue(
          "error",
          `Variable name "${entry.name}" is used by more than one variable. Interpolated text requires unique variable names.`,
          entry.id
        )
      );
      return;
    }

    seen.set(key, true);
  });
}

function makeIssue(severity, message, targetId = null) {
  return { severity, message, targetId };
}

function evaluateOptionAvailability(game, playState, option) {
  const passes = evaluateRequirementSet(game, playState, option.requirements);
  if (passes) {
    return { state: "selectable" };
  }

  return { state: option.failureMode === "hidden" ? "hidden" : "disabled" };
}

function evaluateRequirement(game, playState, requirement) {
  if (requirement.kind === "tracker") {
    const current = playState.trackers[requirement.targetId];
    return compareValues(current, requirement.operator, requirement.value);
  }

  if (requirement.kind === "profile") {
    return compareValues(playState.profiles[requirement.targetId], requirement.operator || "=", requirement.state);
  }

  return compareValues(playState.flags[requirement.targetId], requirement.operator || "=", requirement.state);
}

function evaluateRequirementSet(game, playState, requirements) {
  if (!requirements.length) {
    return true;
  }

  const andRequirements = requirements.filter((requirement) => requirement.joinMode !== "or");
  const orRequirements = requirements.filter((requirement) => requirement.joinMode === "or");
  const andPasses = andRequirements.every((requirement) => evaluateRequirement(game, playState, requirement));
  const orPasses = !orRequirements.length || orRequirements.some((requirement) => evaluateRequirement(game, playState, requirement));

  return andPasses && orPasses;
}

function evaluateParagraphVisibility(game, playState, paragraph) {
  return evaluateRequirementSet(game, playState, paragraph.requirements);
}

function compareValues(left, operator, right) {
  switch (operator) {
    case "=":
      return left === right;
    case "!=":
      return left !== right;
    case "<":
      return left < right;
    case ">":
      return left > right;
    case "<=":
      return left <= right;
    case ">=":
      return left >= right;
    default:
      return false;
  }
}

function buildOptionInlineNote(game, playState, option) {
  const parts = [];
  const requirementText = buildRequirementDisplay(game, playState, option);
  const effectText = buildEffectDisplay(game, option);

  if (requirementText) {
    parts.push(option.requirementDisplayMode === "custom" ? requirementText : `Checks ${requirementText}`);
  }
  if (effectText) {
    parts.push(option.effectDisplayMode === "custom" ? effectText : `Sets ${effectText}`);
  }

  return parts.join(" • ");
}

function buildRequirementDisplay(game, playState, option) {
  if (option.requirementDisplayMode === "none" || !option.requirements.length) {
    return "";
  }
  if (option.requirementDisplayMode === "custom") {
    return option.requirementDisplayText;
  }

  const andParts = [];
  const orParts = [];

  option.requirements.forEach((requirement) => {
    const text = buildSingleRequirementDisplay(game, playState, requirement);
    if (!text) {
      return;
    }

    if (requirement.joinMode === "or") {
      orParts.push(text);
    } else {
      andParts.push(text);
    }
  });

  const parts = [];
  if (andParts.length) {
    parts.push(andParts.length === 1 ? andParts[0] : `All: ${andParts.join(", ")}`);
  }
  if (orParts.length) {
    parts.push(orParts.length === 1 ? `Any: ${orParts[0]}` : `Any: ${orParts.join(" or ")}`);
  }

  return parts.join("; ");
}

function buildSingleRequirementDisplay(game, playState, requirement) {
  if (requirement.kind === "tracker") {
    const tracker = getTrackerById(game, requirement.targetId);
    if (!tracker || !tracker.visible) {
      return "";
    }

    const current = playState.trackers[tracker.id] ?? tracker.startValue;
    if (requirement.operator === ">=" && tracker.max !== null) {
      return `${tracker.name} ${current}/${requirement.value}`;
    }
    return `${tracker.name} ${formatPrettyOperator(requirement.operator)} ${requirement.value}`;
  }

  if (requirement.kind === "profile") {
    const profile = getProfileById(game, requirement.targetId);
    return profile && profile.visible
      ? `${profile.name} ${formatPrettyOperator(requirement.operator || "=")} ${requirement.state === null ? "null" : requirement.state}`
      : "";
  }

  const flag = getFlagById(game, requirement.targetId);
  return flag && flag.visible
    ? `${flag.name} ${formatPrettyOperator(requirement.operator || "=")} ${requirement.state === null ? "null" : requirement.state}`
    : "";
}

function buildEffectDisplay(game, option) {
  if (option.effectDisplayMode === "none") {
    return "";
  }
  if (option.effectDisplayMode === "custom") {
    return option.effectDisplayText;
  }

  const parts = [];
  option.variableEffects.forEach((effect) => {
    if (effect.variableType === "tracker") {
      const tracker = getTrackerById(game, effect.variableId);
      if (!tracker || !tracker.visible) {
        return;
      }

      if (effect.action === "set") {
        parts.push(`${tracker.name} = ${effect.value}`);
      } else {
        const delta = effect.action === "decrease" ? -Math.abs(effect.value) : Math.abs(effect.value);
        parts.push(`${tracker.name} ${delta > 0 ? "+" : ""}${delta}`);
      }
      return;
    }

    if (effect.variableType === "flag") {
      const flag = getFlagById(game, effect.variableId);
      if (!flag || !flag.visible) {
        return;
      }

      parts.push(`${flag.name} -> ${effect.value === null ? "null" : effect.value}`);
      return;
    }

    if (effect.variableType === "profile") {
      const profile = getProfileById(game, effect.variableId);
      if (!profile || !profile.visible) {
        return;
      }

      parts.push(`${profile.name} -> ${effect.value === null ? "null" : effect.value}`);
      return;
    }

    const entry = game.strings.find((item) => item.id === effect.variableId);
    if (entry) {
      parts.push(`${entry.name} -> ${effect.value}`);
    }
  });

  return parts.join(", ");
}

function buildTrackerDisplayGroups(game) {
  const grouped = game.trackerGroups.map((group) => ({
    id: group.id,
    name: group.name || "Unnamed Group",
    trackers: game.trackers.filter((tracker) => tracker.visible && tracker.groupId === group.id),
  }));
  const ungrouped = game.trackers.filter((tracker) => tracker.visible && !tracker.groupId);

  if (ungrouped.length) {
    grouped.push({
      id: "ungrouped",
      name: "Ungrouped",
      trackers: ungrouped,
    });
  }

  return grouped.filter((group) => group.trackers.length);
}

function createLogicExecutionContext(game, playState) {
  return {
    game,
    playState,
    steps: 0,
    pendingJumpTargetId: null,
  };
}

function maybeDispatchVariableChange(game, playState, logicContext, variableType, variableId, previousValue, nextValue) {
  if (!logicContext || previousValue === nextValue) {
    return;
  }

  dispatchLogicVariableChange(game, playState, logicContext, {
    variableType,
    variableId,
    previousValue,
    nextValue,
  });
}

function guardLogicExecution(logicContext) {
  if (!logicContext) {
    return true;
  }
  logicContext.steps += 1;
  if (logicContext.steps <= LOGIC_EXECUTION_LIMIT) {
    return true;
  }

  logicContext.playState.status = "error";
  logicContext.playState.log.push({
    type: "event",
    label: "Runtime error",
    text: "Logic node execution exceeded the safety limit.",
  });
  return false;
}

function dispatchLogicNodePass(game, playState, logicContext, passedTarget) {
  executeMatchingLogicNodes(
    game,
    playState,
    logicContext,
    (logicNode, trigger) =>
      trigger.kind === "passAnyNode" ||
      (trigger.kind === "passSelf" && logicNode.id === passedTarget.id && !getNodeById(game, passedTarget.id)) ||
      (trigger.kind === "passNode" && trigger.targetNodeId === passedTarget.id)
  );
}

function dispatchLogicVariableChange(game, playState, logicContext, change) {
  executeMatchingLogicNodes(
    game,
    playState,
    logicContext,
    (_logicNode, trigger) => {
      if (trigger.kind !== "variableChange") {
        return false;
      }
      if (trigger.variableType !== change.variableType || trigger.variableId !== change.variableId) {
        return false;
      }

      if (trigger.operator === "changed") {
        return true;
      }
      if (trigger.operator === "increase") {
        return typeof change.nextValue === "number" && typeof change.previousValue === "number" && change.nextValue > change.previousValue;
      }
      if (trigger.operator === "decrease") {
        return typeof change.nextValue === "number" && typeof change.previousValue === "number" && change.nextValue < change.previousValue;
      }
      return compareValues(change.nextValue, trigger.operator, trigger.value);
    }
  );
}

function dispatchLogicEvent(game, playState, logicContext, eventName) {
  executeMatchingLogicNodes(
    game,
    playState,
    logicContext,
    (_logicNode, trigger) => trigger.kind === "event" && String(trigger.eventName || "").trim() === String(eventName || "").trim()
  );
}

function executeMatchingLogicNodes(game, playState, logicContext, predicate) {
  for (const logicNode of game.logicNodes || []) {
    if (playState.status !== "active") {
      return;
    }
    if (!logicNode.triggers.some((trigger) => predicate(logicNode, trigger))) {
      continue;
    }
    if (!guardLogicExecution(logicContext)) {
      return;
    }
    executeLogicNodeActions(game, playState, logicNode, logicContext);
  }
}

function executeLogicNodeActions(game, playState, logicNode, logicContext) {
  for (const action of logicNode.actions) {
    if (playState.status !== "active") {
      return;
    }

    if (action.kind === "emitEvent") {
      const eventName = String(action.eventName || "").trim();
      if (eventName) {
        dispatchLogicEvent(game, playState, logicContext, eventName);
      }
      continue;
    }

    if (action.kind === "changeVariable") {
      applyVariableEffect(
        game,
        playState,
        {
          action: action.action,
          variableType: action.variableType,
          variableId: action.variableId,
          value: action.value,
        },
        new Set(),
        logicContext
      );
      continue;
    }

    if (action.kind === "jumpToNode" && action.targetNodeId) {
      logicContext.pendingJumpTargetId = action.targetNodeId;
    }
  }
}

function consumeLogicJumpTarget(logicContext) {
  if (!logicContext?.pendingJumpTargetId) {
    return null;
  }
  const targetId = logicContext.pendingJumpTargetId;
  logicContext.pendingJumpTargetId = null;
  return targetId;
}

function applyVariableEffect(game, playState, effect, profileStack = new Set(), logicContext = null) {
  if (effect.variableType === "tracker") {
    const tracker = getTrackerById(game, effect.variableId);
    if (!tracker) {
      return;
    }

    const before = playState.trackers[tracker.id];
    if (effect.action === "set") {
      playState.trackers[tracker.id] = sanitizeTrackerValue(tracker, parseNumberOrFallback(effect.value, 0));
      maybeDispatchVariableChange(game, playState, logicContext, effect.variableType, tracker.id, before, playState.trackers[tracker.id]);
      return;
    }

    const delta = effect.action === "decrease" ? -Math.abs(parseNumberOrFallback(effect.value, 0)) : Math.abs(parseNumberOrFallback(effect.value, 0));
    playState.trackers[tracker.id] = applyTrackerEffect(tracker, playState.trackers[tracker.id], delta);
    maybeDispatchVariableChange(game, playState, logicContext, effect.variableType, tracker.id, before, playState.trackers[tracker.id]);
    return;
  }

  if (effect.variableType === "flag") {
    if (!getFlagById(game, effect.variableId)) {
      return;
    }
    const before = playState.flags[effect.variableId];
    playState.flags[effect.variableId] = effect.value ?? null;
    maybeDispatchVariableChange(game, playState, logicContext, effect.variableType, effect.variableId, before, playState.flags[effect.variableId]);
    return;
  }

  if (effect.variableType === "profile") {
    setProfileState(game, playState, effect.variableId, effect.value ?? null, profileStack, logicContext);
    return;
  }

  const entry = game.strings.find((item) => item.id === effect.variableId);
  if (entry) {
    const before = playState.strings[entry.id];
    playState.strings[entry.id] = String(effect.value ?? "");
    maybeDispatchVariableChange(game, playState, logicContext, effect.variableType, entry.id, before, playState.strings[entry.id]);
  }
}

function applyProfileStartStates(game, playState) {
  game.profiles.forEach((profile) => {
    if (playState.profiles?.[profile.id] !== null && playState.profiles?.[profile.id] !== undefined) {
      setProfileState(game, playState, profile.id, playState.profiles[profile.id], new Set());
    }
  });
}

function setProfileState(game, playState, profileId, stateName, profileStack = new Set(), logicContext = null) {
  const profile = getProfileById(game, profileId);
  if (!profile) {
    return;
  }

  const previousState = playState.profiles[profile.id];
  playState.profiles[profile.id] = stateName ?? null;
  maybeDispatchVariableChange(game, playState, logicContext, "profile", profile.id, previousState, playState.profiles[profile.id]);
  if (stateName === null) {
    return;
  }

  const state = getProfileStateByName(profile, stateName);
  if (!state) {
    playState.profiles[profile.id] = null;
    return;
  }

  const stackKey = `${profile.id}:${state.name}`;
  if (profileStack.has(stackKey)) {
    return;
  }

  profileStack.add(stackKey);
  state.mappings.forEach((mapping) => {
    applyVariableEffect(game, playState, mapping, profileStack, logicContext);
  });
  profileStack.delete(stackKey);
}

function createPlayState(game) {
  const startNodeId = getGameStartNodeId(game);
  const state = {
    format: SAVE_FORMAT,
    version: GAME_VERSION,
    gameId: getGameCacheKey(game),
    currentNodeId: startNodeId,
    trackers: Object.fromEntries(game.trackers.map((tracker) => [tracker.id, normalizeTrackerStart(tracker)])),
    flags: Object.fromEntries(game.flags.map((flag) => [flag.id, null])),
    profiles: Object.fromEntries(game.profiles.map((profile) => [profile.id, profile.startState ?? null])),
    strings: Object.fromEntries(game.strings.map((entry) => [entry.id, entry.startValue])),
    log: [],
    history: [],
    notes: "",
    status: "active",
    updatedAt: new Date().toISOString(),
  };

  applyProfileStartStates(game, state);

  if (state.currentNodeId) {
    advancePlayStateToTarget(game, state, state.currentNodeId, createLogicExecutionContext(game, state));
  } else {
    state.status = "error";
    state.log.push({
      type: "event",
      label: "Runtime error",
      text: "The Start Node does not point to a valid target.",
    });
  }

  return state;
}

function normalizePlaySave(rawSave, game) {
  if (!rawSave || typeof rawSave !== "object") {
    return null;
  }

  const startNodeId = getGameStartNodeId(game);
  const state = {
    format: SAVE_FORMAT,
    version: rawSave.version || GAME_VERSION,
    gameId: rawSave.gameId || getGameCacheKey(game),
    currentNodeId: rawSave.currentNodeId || startNodeId,
    trackers: Object.fromEntries(
      game.trackers.map((tracker) => [
        tracker.id,
        typeof (rawSave.integers?.[tracker.id] ?? rawSave.trackers?.[tracker.id]) === "number"
          ? sanitizeTrackerValue(tracker, rawSave.integers?.[tracker.id] ?? rawSave.trackers?.[tracker.id])
          : normalizeTrackerStart(tracker),
      ])
    ),
    flags: Object.fromEntries(
      game.flags.map((flag) => [flag.id, rawSave.enums?.[flag.id] ?? rawSave.flags?.[flag.id] ?? null])
    ),
    profiles: Object.fromEntries(
      game.profiles.map((profile) => [profile.id, rawSave.profiles?.[profile.id] ?? profile.startState ?? null])
    ),
    strings: Object.fromEntries(
      game.strings.map((entry) => [entry.id, typeof rawSave.strings?.[entry.id] === "string" ? rawSave.strings[entry.id] : entry.startValue])
    ),
    log: Array.isArray(rawSave.log) ? rawSave.log : [],
    history: Array.isArray(rawSave.history) ? rawSave.history : [],
    notes: rawSave.notes || "",
    status: rawSave.status || "active",
    updatedAt: rawSave.updatedAt || new Date().toISOString(),
  };

  if (!state.log.length) {
    const currentNode = getNodeById(game, state.currentNodeId);
    if (currentNode) {
      appendMessageLog(state, currentNode);
    }
  }

  return state;
}

function persistEditorDraft() {
  if (!appState.createGame) {
    return;
  }

  window.localStorage.setItem(EDITOR_DRAFT_KEY, JSON.stringify(serializeGame(appState.createGame)));
}

function loadEditorDraft() {
  try {
    const raw = window.localStorage.getItem(EDITOR_DRAFT_KEY);
    if (!raw) {
      return null;
    }
    return normalizeGame(JSON.parse(raw));
  } catch (error) {
    console.error("Unable to load editor draft.", error);
    return null;
  }
}

function persistPlayCache() {
  if (!appState.playGame || !appState.playState) {
    return;
  }

  window.localStorage.setItem(
    `${PLAY_CACHE_PREFIX}${getGameCacheKey(appState.playGame)}`,
    JSON.stringify(appState.playState)
  );
}

function loadPlayCache(gameId) {
  try {
    const raw = window.localStorage.getItem(`${PLAY_CACHE_PREFIX}${gameId}`);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Unable to load cached play state.", error);
    return null;
  }
}

function serializeGame(game) {
  const serialized = clone(game);
  if (serialized.metadata) {
    delete serialized.metadata.id;
  }
  delete serialized.rootNodeId;
  serialized.integerGroups = serialized.trackerGroups ?? [];
  serialized.integers = serialized.trackers ?? [];
  serialized.enums = serialized.flags ?? [];
  delete serialized.trackerGroups;
  delete serialized.trackers;
  delete serialized.flags;
  serialized.nodes = (serialized.nodes || []).map((node) => ({
    ...node,
    paragraphs: (node.paragraphs || []).map((paragraph) => {
      const nextParagraph = { ...paragraph, variableChecks: paragraph.requirements ?? [] };
      delete nextParagraph.requirements;
      return nextParagraph;
    }),
    options: (node.options || []).map((option) => {
      const nextOption = {
        ...option,
        variableChecks: option.requirements ?? [],
        setVariables: option.variableEffects ?? [],
      };
      delete nextOption.requirements;
      delete nextOption.variableEffects;
      delete nextOption.trackerEffects;
      delete nextOption.flagEffects;
      return nextOption;
    }),
  }));
  serialized.logicNodes = serialized.logicNodes || [];
  serialized.profiles = (serialized.profiles || []).map((profile) => ({
    ...profile,
    states: (profile.states || []).map((state) => ({
      ...state,
      setVariables: state.mappings ?? [],
      mappings: undefined,
    })),
  }));
  serialized.profiles.forEach((profile) => {
    profile.states.forEach((state) => {
      delete state.mappings;
    });
  });
  return serialized;
}

function serializePlayState(playState) {
  const serialized = clone(playState);
  serialized.integers = serialized.trackers ?? {};
  serialized.enums = serialized.flags ?? {};
  delete serialized.trackers;
  delete serialized.flags;
  return serialized;
}

function getGameCacheKey(game) {
  const snapshot = serializeGame(game);
  snapshot.logicNodes = (snapshot.logicNodes || []).map((logicNode) => ({
    id: logicNode.id,
    name: logicNode.name,
    targetNodeId: logicNode.targetNodeId,
    triggers: logicNode.triggers,
    actions: logicNode.actions,
  }));
  snapshot.nodes = snapshot.nodes.map((node) => ({
    id: node.id,
    name: node.name,
    secondary: node.secondary,
    paragraphs: node.paragraphs,
    options: node.options,
  }));
  return hashString(JSON.stringify(snapshot));
}

function buildNodeSecondaryLine(game, node) {
  return node.secondary || "";
}

function getNodeById(game, nodeId) {
  return game?.nodes?.find((node) => node.id === nodeId) || null;
}

function getLogicNodeById(game, logicNodeId) {
  return game?.logicNodes?.find((logicNode) => logicNode.id === logicNodeId) || null;
}

function getPassTargetById(game, targetId) {
  if (game?.endNode?.id === targetId) {
    return game.endNode;
  }
  return getNodeById(game, targetId) || getLogicNodeById(game, targetId) || null;
}

function getClusterById(game, clusterId) {
  return game?.clusters?.find((cluster) => cluster.id === clusterId) || null;
}

function getOptionById(node, optionId) {
  return node?.options.find((option) => option.id === optionId) || null;
}

function getTrackerById(game, trackerId) {
  return game?.trackers.find((tracker) => tracker.id === trackerId) || null;
}

function getVariableById(game, variableType, variableId) {
  if (variableType === "flag") {
    return getFlagById(game, variableId);
  }
  if (variableType === "profile") {
    return getProfileById(game, variableId);
  }
  if (variableType === "string") {
    return game?.strings.find((entry) => entry.id === variableId) || null;
  }
  return getTrackerById(game, variableId);
}

function isValidStateValue(game, variableType, variableId, value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (variableType === "flag") {
    return Boolean(getFlagById(game, variableId)?.states.includes(value));
  }
  if (variableType === "profile") {
    return Boolean(getProfileById(game, variableId)?.states.some((state) => state.name === value));
  }
  return true;
}

function getTrackerGroupById(game, groupId) {
  return game?.trackerGroups.find((group) => group.id === groupId) || null;
}

function getFlagById(game, flagId) {
  return game?.flags.find((flag) => flag.id === flagId) || null;
}

function getProfileById(game, profileId) {
  return game?.profiles.find((profile) => profile.id === profileId) || null;
}

function getProfileStateById(profile, stateId) {
  return profile?.states.find((state) => state.id === stateId) || null;
}

function getProfileStateByName(profile, stateName) {
  return profile?.states.find((state) => state.name === stateName) || null;
}

function normalizeTrackerStart(tracker) {
  return sanitizeTrackerValue(tracker, tracker.startValue);
}

function applyTrackerEffect(tracker, currentValue, delta) {
  let next = typeof currentValue === "number" ? currentValue + delta : delta;

  if (tracker.direction === "increase" && delta < 0) {
    next = currentValue;
  }
  if (tracker.direction === "decrease" && delta > 0) {
    next = currentValue;
  }

  return sanitizeTrackerValue(tracker, next);
}

function sanitizeTrackerValue(tracker, value) {
  let next = value;

  if (tracker.sign === "nonNegative") {
    next = Math.max(0, next);
  }
  if (tracker.sign === "nonPositive") {
    next = Math.min(0, next);
  }
  if (tracker.min !== null) {
    next = Math.max(tracker.min, next);
  }
  if (tracker.max !== null) {
    next = Math.min(tracker.max, next);
  }

  return next;
}

function formatTrackerValue(tracker, value) {
  return tracker.max !== null ? `${value}/${tracker.max}` : String(value);
}

function formatTerminalLabel(terminal) {
  return terminal === "target" ? "Target" : terminal;
}

function formatPrettyOperator(operator) {
  if (operator === "<=") {
    return "≤";
  }
  if (operator === ">=") {
    return "≥";
  }
  return operator;
}

function moveItem(items, id, direction) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return;
  }
  const nextIndex = clamp(index + direction, 0, items.length - 1);
  if (index === nextIndex) {
    return;
  }
  const [item] = items.splice(index, 1);
  items.splice(nextIndex, 0, item);
}

function getGraphBounds(nodes) {
  const xs = nodes.map((node) => node.position.x);
  const ys = nodes.map((node) => node.position.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function parseNullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNumberOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseStatesInput(value) {
  return Array.from(
    new Set(
      String(value)
        .split(/[\n,]/)
        .map((state) => state.trim())
        .filter((state) => state && state.toLowerCase() !== "null")
    )
  );
}

function fromNullableSelectValue(value) {
  return value === "__NULL__" ? null : value;
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function formatTimestamp(isoString) {
  if (!isoString) {
    return "Never";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function timestampForFile() {
  return new Date().toISOString().replaceAll(":", "-");
}

function slugify(value) {
  return String(value || "game")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "game";
}

function resetIssuedIds() {
  ISSUED_IDS.clear();
  ISSUED_IDS.add(START_NODE_ID);
  ISSUED_IDS.add(END_NODE_ID);
}

function reserveRawIds() {
  resetIssuedIds();
}

function registerGameIds(game) {
  resetIssuedIds();
  collectIds(game).forEach((id) => ISSUED_IDS.add(id));
}

function collectIds(value, found = new Set()) {
  if (!value || typeof value !== "object") {
    return found;
  }

  if (typeof value.id === "string" && value.id.trim()) {
    found.add(value.id.trim());
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectIds(entry, found));
    return found;
  }

  Object.values(value).forEach((entry) => collectIds(entry, found));
  return found;
}

function isUsableId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,16}$/.test(value);
}

function takeId(rawId, prefix) {
  const candidate = typeof rawId === "string" ? rawId.trim() : "";
  if (isUsableId(candidate) && !ISSUED_IDS.has(candidate)) {
    ISSUED_IDS.add(candidate);
    return candidate;
  }
  return createId(prefix);
}

function createId(prefix) {
  const prefixMap = {
    node: "N",
    cluster: "C",
    logic: "L",
    option: "O",
    paragraph: "P",
    req: "R",
    ve: "V",
    tracker: "T",
    group: "G",
    flag: "E",
    profile: "F",
    "profile-state": "S",
    string: "X",
    "logic-trigger": "LT",
    "logic-action": "LA",
    te: "TE",
    fe: "FE",
  };
  const label = prefixMap[prefix] || String(prefix || "ID").slice(0, 2).toUpperCase();
  let candidate = "";

  do {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const random =
      ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    candidate = `${label}-${random.toString(36).padStart(7, "0").slice(-7).toUpperCase()}`;
  } while (ISSUED_IDS.has(candidate));

  ISSUED_IDS.add(candidate);
  return candidate;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `g${(hash >>> 0).toString(36)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}
