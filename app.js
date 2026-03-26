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

const CREATE_TABS = [
  { id: "metadata", label: "Metadata" },
  { id: "chapters", label: "Chapters" },
  { id: "trackers", label: "Trackers" },
  { id: "groups", label: "Groups" },
  { id: "flags", label: "Flags" },
  { id: "validation", label: "Validation" },
];

const TRACKER_OPERATORS = ["=", "<", ">", "<=", ">="];
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
  { value: "target", label: "Go to target message" },
  { value: "chapterEnd", label: "End chapter and advance" },
  { value: "gameEnd", label: "End game" },
  { value: "endpoint", label: "Authored endpoint" },
];

const refs = {
  homeView: document.getElementById("homeView"),
  playView: document.getElementById("playView"),
  createView: document.getElementById("createView"),
  playGameInput: document.getElementById("playGameInput"),
  createGameInput: document.getElementById("createGameInput"),
  playSaveInput: document.getElementById("playSaveInput"),
  playGameName: document.getElementById("playGameName"),
  playChapterName: document.getElementById("playChapterName"),
  playMetaSummary: document.getElementById("playMetaSummary"),
  playSessionInfo: document.getElementById("playSessionInfo"),
  playValidationSummary: document.getElementById("playValidationSummary"),
  playLog: document.getElementById("playLog"),
  playCurrentMessage: document.getElementById("playCurrentMessage"),
  playOptions: document.getElementById("playOptions"),
  playNotes: document.getElementById("playNotes"),
  playTrackerGroups: document.getElementById("playTrackerGroups"),
  playFlags: document.getElementById("playFlags"),
  playLoadGameButton: document.getElementById("playLoadGameButton"),
  playImportSaveButton: document.getElementById("playImportSaveButton"),
  playExportSaveButton: document.getElementById("playExportSaveButton"),
  playRestartButton: document.getElementById("playRestartButton"),
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
  graphCenterButton: document.getElementById("graphCenterButton"),
  graphZoomOutButton: document.getElementById("graphZoomOutButton"),
  graphZoomLabel: document.getElementById("graphZoomLabel"),
  graphZoomInButton: document.getElementById("graphZoomInButton"),
  graphViewport: document.getElementById("graphViewport"),
  graphWorld: document.getElementById("graphWorld"),
  graphConnections: document.getElementById("graphConnections"),
  graphNodes: document.getElementById("graphNodes"),
  editorInspector: document.getElementById("editorInspector"),
};

const appState = {
  view: "home",
  createGame: loadEditorDraft(),
  playGame: null,
  playState: null,
  playValidation: [],
  playError: null,
  createTab: "metadata",
  selection: {
    nodeId: null,
    optionId: null,
  },
  graph: {
    panX: 140,
    panY: 110,
    zoom: 1,
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
  refs.playBackHomeButton.addEventListener("click", () => switchView("home"));
  refs.playGameInput.addEventListener("change", handlePlayGameImport);
  refs.createGameInput.addEventListener("change", handleCreateGameImport);
  refs.playSaveInput.addEventListener("change", handlePlaySaveImport);
  refs.playOptions.addEventListener("click", handlePlayOptionClick);
  refs.playNotes.addEventListener("input", handlePlayNotesInput);

  refs.editorNewButton.addEventListener("click", () => {
    appState.createGame = createGameScaffold();
    normalizeEditorSelection();
    centerGraph();
    persistEditorDraft();
    switchView("create");
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
  refs.editorSidebarContent.addEventListener("change", handleSidebarChange);
  refs.editorInspector.addEventListener("click", handleInspectorClick);
  refs.editorInspector.addEventListener("change", handleInspectorChange);
  refs.graphAddNodeButton.addEventListener("click", addNodeAtViewportCenter);
  refs.graphCenterButton.addEventListener("click", centerGraph);
  refs.graphZoomInButton.addEventListener("click", () => zoomGraph(1.12));
  refs.graphZoomOutButton.addEventListener("click", () => zoomGraph(1 / 1.12));
  refs.graphNodes.addEventListener("click", handleGraphSelection);
  refs.graphNodes.addEventListener("mousedown", handleNodeDragStart);
  refs.graphViewport.addEventListener("mousedown", handleViewportPanStart);
  refs.graphViewport.addEventListener("wheel", handleGraphWheel, { passive: false });

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
}

function renderHomeView() {
  const draft = appState.createGame;
  const draftSummary = draft
    ? `${draft.chapters.length} chapters · ${draft.nodes.length} messages · ${validateGame(draft).filter((issue) => issue.severity === "error").length} errors`
    : "No local draft stored yet.";

  refs.homeView.innerHTML = `
    <div class="home-shell">
      <section class="home-hero">
        <article class="mode-card">
          <p class="eyebrow">Unified Tool</p>
          <h1>${APP_NAME}</h1>
          <p class="copy">
            Author and play single-file chapter-based text games from the same web app. The editor works on a directed graph of messages and options; the player runs the same authored data with trackers, flags, saves, notes, and validation-aware playback.
          </p>
        </article>

        <article class="mode-card">
          <p class="eyebrow">Format</p>
          <div class="badge-row" style="margin-top: 14px;">
            <span class="chip">Single game file</span>
            <span class="chip">Ordered chapters</span>
            <span class="chip">Trackers + flags</span>
            <span class="chip">Conditional options</span>
            <span class="chip">Create + Play</span>
          </div>
          <p class="copy">
            Chapters are the only built-in structural subdivision. Nodes hold authored messages. Options hold rules, effects, and graph transitions.
          </p>
        </article>
      </section>

      <section class="home-actions">
        <article class="mode-card">
          <p class="eyebrow">Play</p>
          <h2>Load and run a game</h2>
          <p class="copy">
            Import a game file, validate it, initialize a live state object, and play it in the three-pane runtime.
          </p>
          <div class="mode-grid" style="margin-top: 14px;">
            <div class="mode-action">
              <h3>Load game file</h3>
              <p class="copy">Choose a `.json` file and start a run with validation before play begins.</p>
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
          <h2>Build and edit games</h2>
          <p class="copy">
            Work in the node graph, edit global structures, validate authored data, and test-play the current draft without leaving the tool.
          </p>
          <div class="mode-grid" style="margin-top: 14px;">
            <div class="mode-action">
              <h3>Local draft</h3>
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
      </section>
    </div>
  `;
}

function renderPlayView() {
  const game = appState.playGame;
  const playState = appState.playState;
  const validation = appState.playValidation;
  const currentNode = game && playState ? getNodeById(game, playState.currentNodeId) : null;
  const currentChapter = game && playState ? getChapterById(game, playState.currentChapterId) : null;

  refs.playGameName.textContent = game?.metadata.name ?? "No game loaded";
  refs.playChapterName.textContent = currentChapter ? currentChapter.name : "";
  refs.playMetaSummary.textContent =
    game?.metadata.description ||
    (appState.playError
      ? "This game failed validation and was not allowed to start."
      : "Load a game file to begin.");

  refs.playSessionInfo.innerHTML = game
    ? [
        renderSessionRow("Game ID", game.metadata.id),
        renderSessionRow(
          "Chapter",
          currentChapter
            ? `${getChapterIndex(game, currentChapter.id) + 1} of ${game.chapters.length}`
            : "Not active"
        ),
        renderSessionRow("Current message", currentNode?.name ?? "Unavailable"),
        renderSessionRow("Autosave", playState ? formatTimestamp(playState.updatedAt) : "Not started"),
      ].join("")
    : `<div class="session-row">No session active.</div>`;

  const errors = validation.filter((issue) => issue.severity === "error");
  const warnings = validation.filter((issue) => issue.severity === "warning");

  refs.playValidationSummary.innerHTML = game
    ? `
        <div class="validation-item">
          <strong class="${errors.length ? "status-bad" : "status-good"}">${errors.length} error${errors.length === 1 ? "" : "s"}</strong>
          <p class="copy">${errors.length ? "Fix these in create mode before playback." : "Game file passed the required validation checks."}</p>
        </div>
        <div class="validation-item">
          <strong class="${warnings.length ? "status-warn" : ""}">${warnings.length} warning${warnings.length === 1 ? "" : "s"}</strong>
          <p class="copy">${warnings.length ? warnings[0].message : "No warnings."}</p>
        </div>
      `
    : `<div class="validation-item">Validation appears here after a game is loaded.</div>`;

  renderPlayLog();
  renderPlayCurrentMessage(currentNode);
  renderPlayOptions(currentNode);
  renderPlayTrackerGroups();
  renderPlayFlags();
  refs.playNotes.value = playState?.notes ?? "";
}

function renderSessionRow(label, value) {
  return `<div class="session-row inline-row"><span>${escapeHtml(label)}</span><span class="value">${escapeHtml(
    value
  )}</span></div>`;
}

function renderPlayLog() {
  if (appState.playError?.length) {
    refs.playLog.innerHTML = `<div class="paper-note">Playback is blocked because the loaded game has validation errors. Review the summary on the left or open the game in create mode.</div>`;
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
          ${entry.secondary ? `<p class="meta">${escapeHtml(entry.secondary)}</p>` : ""}
          <h3>${escapeHtml(entry.name)}</h3>
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
    refs.playCurrentMessage.innerHTML = `<div class="paper-note">The game did not start because required validation checks failed.</div>`;
    return;
  }

  if (!appState.playGame || !appState.playState) {
    refs.playCurrentMessage.innerHTML = `<div class="paper-note">No game is active.</div>`;
    return;
  }

  if (!currentNode) {
    refs.playCurrentMessage.innerHTML = `<div class="paper-note">The active message could not be found.</div>`;
    return;
  }

  refs.playCurrentMessage.innerHTML = `
    ${currentNode.secondary ? `<p class="message-secondary">${escapeHtml(currentNode.secondary)}</p>` : ""}
    <p class="message-body">${escapeHtml(currentNode.body)}</p>
  `;
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

      return `
        <button
          class="play-option"
          type="button"
          data-option-id="${escapeAttr(option.id)}"
          ${availability.state === "disabled" ? "disabled" : ""}
        >
          ${escapeHtml(option.text)}
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
    refs.playTrackerGroups.innerHTML = `<div class="paper-note">Trackers appear once a game is running.</div>`;
    return;
  }

  const groups = buildTrackerDisplayGroups(game);

  refs.playTrackerGroups.innerHTML = groups.length
    ? groups
        .map((group) => {
          return `
            <div class="tracker-group-card">
              <strong>${escapeHtml(group.name)}</strong>
              <div style="margin-top: 10px;">
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
            </div>
          `;
        })
        .join("")
    : `<div class="paper-note">This game has no trackers defined.</div>`;
}

function renderPlayFlags() {
  const game = appState.playGame;
  const playState = appState.playState;

  if (!game || !playState) {
    refs.playFlags.innerHTML = `<div class="paper-note">Flags appear once a game is running.</div>`;
    return;
  }

  refs.playFlags.innerHTML = game.flags.length
    ? game.flags
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
    : `<div class="paper-note">This game has no flags defined.</div>`;
}

function renderCreateView() {
  const game = appState.createGame;

  if (!game) {
    refs.editorGameName.textContent = "Untitled Game";
    refs.editorStatus.textContent = "Start a new game or load a file.";
    refs.editorTabButtons.innerHTML = "";
    refs.editorSidebarContent.innerHTML = `<div class="paper-note">No editor draft loaded.</div>`;
    refs.editorInspector.innerHTML = `<div class="paper-note">Select or create a message to inspect it.</div>`;
    refs.graphNodes.innerHTML = `<div class="empty-graph">Create a new game to begin authoring.</div>`;
    refs.graphConnections.innerHTML = "";
    refs.graphZoomLabel.textContent = `${Math.round(appState.graph.zoom * 100)}%`;
    applyGraphTransform();
    return;
  }

  const validation = validateGame(game);
  const errors = validation.filter((issue) => issue.severity === "error").length;
  const warnings = validation.filter((issue) => issue.severity === "warning").length;

  refs.editorGameName.textContent = game.metadata.name || "Untitled Game";
  refs.editorStatus.textContent = `${game.nodes.length} messages · ${game.chapters.length} chapters · ${errors} error${errors === 1 ? "" : "s"} · ${warnings} warning${warnings === 1 ? "" : "s"}`;

  renderEditorTabs();
  renderEditorSidebar(game, validation);
  renderGraph(game);
  renderInspector(game, validation);
}

function renderEditorTabs() {
  refs.editorTabButtons.innerHTML = CREATE_TABS.map((tab) => {
    const active = appState.createTab === tab.id ? "active" : "";
    return `<button class="tab-button ${active}" type="button" data-action="switch-tab" data-tab-id="${escapeAttr(
      tab.id
    )}">${escapeHtml(tab.label)}</button>`;
  }).join("");
}

function renderEditorSidebar(game, validation) {
  switch (appState.createTab) {
    case "metadata":
      refs.editorSidebarContent.innerHTML = renderMetadataTab(game);
      break;
    case "chapters":
      refs.editorSidebarContent.innerHTML = renderChaptersTab(game);
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
    case "validation":
      refs.editorSidebarContent.innerHTML = renderValidationTab(validation);
      break;
    default:
      refs.editorSidebarContent.innerHTML = "";
  }
}

function renderMetadataTab(game) {
  return `
    <div class="form-block">
      <div class="field-group">
        <label>Game identifier</label>
        <input class="field" data-meta-field="id" value="${escapeAttr(game.metadata.id)}" />
      </div>
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
      <div class="field-group">
        <label>Root message</label>
        <select class="field" data-root-node-select>
          ${renderNodeOptions(game, game.rootNodeId)}
        </select>
      </div>
      <div class="paper-note">
        A game is a single authored file. Chapters remain ordered inside that file; the runtime moves across nodes, and chapter-end options can advance into the next chapter start.
      </div>
    </div>
  `;
}

function renderChaptersTab(game) {
  return `
    <div class="button-stack slim">
      <button class="button" type="button" data-action="add-chapter">Add Chapter</button>
    </div>
    ${game.chapters
      .map((chapter, index) => {
        const nodeCount = game.nodes.filter((node) => node.chapterId === chapter.id).length;
        return `
          <div class="item-card">
            <div class="inline-row">
              <strong>Chapter ${index + 1}</strong>
              <div class="item-actions">
                <button class="button small secondary" type="button" data-action="move-chapter-up" data-chapter-id="${escapeAttr(
                  chapter.id
                )}" ${index === 0 ? "disabled" : ""}>Up</button>
                <button class="button small secondary" type="button" data-action="move-chapter-down" data-chapter-id="${escapeAttr(
                  chapter.id
                )}" ${index === game.chapters.length - 1 ? "disabled" : ""}>Down</button>
                <button class="button small ghost" type="button" data-action="delete-chapter" data-chapter-id="${escapeAttr(
                  chapter.id
                )}" ${game.chapters.length === 1 ? "disabled" : ""}>Delete</button>
              </div>
            </div>
            <div class="field-group">
              <label>Name</label>
              <input class="field" data-chapter-field="name" data-chapter-id="${escapeAttr(
                chapter.id
              )}" value="${escapeAttr(chapter.name)}" />
            </div>
            <div class="field-group">
              <label>Start message</label>
              <select class="field" data-chapter-field="startNodeId" data-chapter-id="${escapeAttr(chapter.id)}">
                <option value="">Unassigned</option>
                ${renderNodeOptions(game, chapter.startNodeId, chapter.id)}
              </select>
            </div>
            <div class="inline-row">
              <span class="muted">${nodeCount} assigned message${nodeCount === 1 ? "" : "s"}</span>
              <span class="chip">${escapeHtml(chapter.id)}</span>
            </div>
          </div>
        `;
      })
      .join("")}
  `;
}

function renderTrackersTab(game) {
  return `
    <div class="button-stack slim">
      <button class="button" type="button" data-action="add-tracker">Add Tracker</button>
    </div>
    ${
      game.trackers.length
        ? game.trackers
            .map((tracker) => {
              return `
                <div class="item-card">
                  <div class="inline-row">
                    <strong>${escapeHtml(tracker.name || "New tracker")}</strong>
                    <button class="button small ghost" type="button" data-action="delete-tracker" data-tracker-id="${escapeAttr(
                      tracker.id
                    )}">Delete</button>
                  </div>
                  <div class="field-group">
                    <label>Name</label>
                    <input class="field" data-tracker-field="name" data-tracker-id="${escapeAttr(
                      tracker.id
                    )}" value="${escapeAttr(tracker.name)}" />
                  </div>
                  <div class="inline-form">
                    <div class="field-group">
                      <label>Start value</label>
                      <input class="field" type="number" data-tracker-field="startValue" data-tracker-id="${escapeAttr(
                        tracker.id
                      )}" value="${escapeAttr(String(tracker.startValue))}" />
                    </div>
                    <div class="field-group">
                      <label>Group</label>
                      <select class="field" data-tracker-field="groupId" data-tracker-id="${escapeAttr(tracker.id)}">
                        <option value="">Ungrouped</option>
                        ${game.trackerGroups
                          .map(
                            (group) =>
                              `<option value="${escapeAttr(group.id)}" ${
                                tracker.groupId === group.id ? "selected" : ""
                              }>${escapeHtml(group.name || group.id)}</option>`
                          )
                          .join("")}
                      </select>
                    </div>
                  </div>
                  <div class="inline-form">
                    <div class="field-group">
                      <label>Lower bound</label>
                      <input class="field" type="number" data-tracker-field="min" data-tracker-id="${escapeAttr(
                        tracker.id
                      )}" value="${tracker.min === null ? "" : escapeAttr(String(tracker.min))}" />
                    </div>
                    <div class="field-group">
                      <label>Upper bound</label>
                      <input class="field" type="number" data-tracker-field="max" data-tracker-id="${escapeAttr(
                        tracker.id
                      )}" value="${tracker.max === null ? "" : escapeAttr(String(tracker.max))}" />
                    </div>
                  </div>
                  <div class="field-group">
                    <label>Directional restriction</label>
                    <select class="field" data-tracker-field="direction" data-tracker-id="${escapeAttr(tracker.id)}">
                      ${DIRECTION_OPTIONS.map(
                        (option) =>
                          `<option value="${option.value}" ${
                            tracker.direction === option.value ? "selected" : ""
                          }>${escapeHtml(option.label)}</option>`
                      ).join("")}
                    </select>
                  </div>
                  <div class="field-group">
                    <label>Sign restriction</label>
                    <select class="field" data-tracker-field="sign" data-tracker-id="${escapeAttr(tracker.id)}">
                      ${SIGN_OPTIONS.map(
                        (option) =>
                          `<option value="${option.value}" ${
                            tracker.sign === option.value ? "selected" : ""
                          }>${escapeHtml(option.label)}</option>`
                      ).join("")}
                    </select>
                  </div>
                </div>
              `;
            })
            .join("")
        : '<div class="paper-note">No trackers defined yet.</div>'
    }
  `;
}

function renderGroupsTab(game) {
  return `
    <div class="button-stack slim">
      <button class="button" type="button" data-action="add-group">Add Tracker Group</button>
    </div>
    ${
      game.trackerGroups.length
        ? game.trackerGroups
            .map((group, index) => {
              return `
                <div class="item-card">
                  <div class="inline-row">
                    <strong>Group ${index + 1}</strong>
                    <div class="item-actions">
                      <button class="button small secondary" type="button" data-action="move-group-up" data-group-id="${escapeAttr(
                        group.id
                      )}" ${index === 0 ? "disabled" : ""}>Up</button>
                      <button class="button small secondary" type="button" data-action="move-group-down" data-group-id="${escapeAttr(
                        group.id
                      )}" ${index === game.trackerGroups.length - 1 ? "disabled" : ""}>Down</button>
                      <button class="button small ghost" type="button" data-action="delete-group" data-group-id="${escapeAttr(
                        group.id
                      )}">Delete</button>
                    </div>
                  </div>
                  <div class="field-group">
                    <label>Display name</label>
                    <input class="field" data-group-field="name" data-group-id="${escapeAttr(
                      group.id
                    )}" value="${escapeAttr(group.name)}" />
                  </div>
                  <p class="copy">${game.trackers.filter((tracker) => tracker.groupId === group.id).length} tracker(s) assigned</p>
                </div>
              `;
            })
            .join("")
        : '<div class="paper-note">No tracker groups defined. Trackers can still appear as Ungrouped.</div>'
    }
  `;
}

function renderFlagsTab(game) {
  return `
    <div class="button-stack slim">
      <button class="button" type="button" data-action="add-flag">Add Flag</button>
    </div>
    ${
      game.flags.length
        ? game.flags
            .map((flag) => {
              return `
                <div class="item-card">
                  <div class="inline-row">
                    <strong>${escapeHtml(flag.name || "New flag")}</strong>
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
                  <div class="field-group">
                    <label>Custom states</label>
                    <textarea class="textarea" data-flag-field="states" data-flag-id="${escapeAttr(
                      flag.id
                    )}" placeholder="Comma or newline separated states">${escapeHtml(flag.states.join(", "))}</textarea>
                  </div>
                  <p class="copy">The null state is implicit and always available at runtime.</p>
                </div>
              `;
            })
            .join("")
        : '<div class="paper-note">No flags defined yet.</div>'
    }
  `;
}

function renderValidationTab(validation) {
  if (!validation.length) {
    return `<div class="paper-note">No validation issues.</div>`;
  }

  return validation
    .map(
      (issue) => `
        <div class="validation-item">
          <strong class="${issue.severity === "error" ? "status-bad" : "status-warn"}">${escapeHtml(
            issue.severity.toUpperCase()
          )}</strong>
          <p class="copy">${escapeHtml(issue.message)}</p>
        </div>
      `
    )
    .join("");
}

function renderInspector(game, validation) {
  const node = appState.selection.nodeId ? getNodeById(game, appState.selection.nodeId) : null;
  const option = node && appState.selection.optionId ? getOptionById(node, appState.selection.optionId) : null;

  if (!node) {
    refs.editorInspector.innerHTML = `<div class="paper-note">Select a message node to edit its content. Select one of its options to edit transition logic, requirements, and effects.</div>`;
    return;
  }

  refs.editorInspector.innerHTML = option
    ? renderOptionInspector(game, node, option)
    : renderNodeInspector(game, node, validation);
}

function renderNodeInspector(game, node, validation) {
  const chapter = getChapterById(game, node.chapterId);
  const chapterStart = chapter?.startNodeId === node.id;
  const isRoot = game.rootNodeId === node.id;
  const nodeIssues = validation.filter((issue) => issue.targetId === node.id);

  return `
    <div class="form-block">
      <div class="badge-row">
        ${isRoot ? '<span class="chip">Game root</span>' : ""}
        ${chapterStart ? '<span class="chip">Chapter start</span>' : ""}
        ${node.isEndpoint ? '<span class="chip">Endpoint</span>' : ""}
      </div>

      <div class="field-group">
        <label>Message name</label>
        <input class="field" data-node-field="name" value="${escapeAttr(node.name)}" />
      </div>

      <div class="field-group">
        <label>Chapter</label>
        <select class="field" data-node-field="chapterId">
          ${game.chapters
            .map(
              (chapterOption) =>
                `<option value="${escapeAttr(chapterOption.id)}" ${
                  node.chapterId === chapterOption.id ? "selected" : ""
                }>${escapeHtml(chapterOption.name)}</option>`
            )
            .join("")}
        </select>
      </div>

      <div class="field-group">
        <label>Secondary information</label>
        <input class="field" data-node-field="secondary" value="${escapeAttr(node.secondary)}" />
      </div>

      <div class="field-group">
        <label>Body text</label>
        <textarea class="textarea" data-node-field="body">${escapeHtml(node.body)}</textarea>
      </div>

      <div class="field-group">
        <label>Editor notes</label>
        <textarea class="textarea" data-node-field="editorNotes">${escapeHtml(
          node.editorNotes
        )}</textarea>
      </div>

      <div class="field-group">
        <label>
          <input type="checkbox" data-node-field="isEndpoint" ${node.isEndpoint ? "checked" : ""} />
          Treat as endpoint
        </label>
      </div>

      <div class="item-actions">
        <button class="button small" type="button" data-action="add-option">Add Option</button>
        <button class="button small ghost" type="button" data-action="delete-node" ${
          game.nodes.length === 1 ? "disabled" : ""
        }>Delete Message</button>
      </div>

      ${
        nodeIssues.length
          ? `
            <div class="item-card">
              <strong class="status-warn">Node issues</strong>
              ${nodeIssues.map((issue) => `<p class="copy">${escapeHtml(issue.message)}</p>`).join("")}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function renderOptionInspector(game, node, option) {
  return `
    <div class="form-block">
      <div class="inline-row">
        <strong>${escapeHtml(node.name)}</strong>
        <button class="button small ghost" type="button" data-action="clear-option-selection">Back to Message</button>
      </div>

      <div class="field-group">
        <label>Option text</label>
        <textarea class="textarea" data-option-field="text">${escapeHtml(option.text)}</textarea>
      </div>

      <div class="field-group">
        <label>Target behavior</label>
        <select class="field" data-option-field="terminal">
          ${TERMINAL_OPTIONS.map(
            (terminal) =>
              `<option value="${terminal.value}" ${
                option.terminal === terminal.value ? "selected" : ""
              }>${escapeHtml(terminal.label)}</option>`
          ).join("")}
        </select>
      </div>

      ${
        option.terminal === "target"
          ? `
            <div class="field-group">
              <label>Target message</label>
              <select class="field" data-option-field="targetNodeId">
                <option value="">Unassigned</option>
                ${renderNodeOptions(game, option.targetNodeId)}
              </select>
            </div>
          `
          : ""
      }

      <div class="field-group">
        <label>Failed requirements behavior</label>
        <select class="field" data-option-field="failureMode">
          ${FAILURE_OPTIONS.map(
            (failure) =>
              `<option value="${failure.value}" ${
                option.failureMode === failure.value ? "selected" : ""
              }>${escapeHtml(failure.label)}</option>`
          ).join("")}
        </select>
      </div>

      <div class="field-group">
        <label>Requirement display</label>
        <select class="field" data-option-field="requirementDisplayMode">
          ${DISPLAY_OPTIONS.map(
            (display) =>
              `<option value="${display.value}" ${
                option.requirementDisplayMode === display.value ? "selected" : ""
              }>${escapeHtml(display.label)}</option>`
          ).join("")}
        </select>
      </div>

      ${
        option.requirementDisplayMode === "custom"
          ? `
            <div class="field-group">
              <label>Custom requirement text</label>
              <input class="field" data-option-field="requirementDisplayText" value="${escapeAttr(
                option.requirementDisplayText
              )}" />
            </div>
          `
          : ""
      }

      <div class="field-group">
        <label>Effect display</label>
        <select class="field" data-option-field="effectDisplayMode">
          ${DISPLAY_OPTIONS.map(
            (display) =>
              `<option value="${display.value}" ${
                option.effectDisplayMode === display.value ? "selected" : ""
              }>${escapeHtml(display.label)}</option>`
          ).join("")}
        </select>
      </div>

      ${
        option.effectDisplayMode === "custom"
          ? `
            <div class="field-group">
              <label>Custom effect text</label>
              <input class="field" data-option-field="effectDisplayText" value="${escapeAttr(
                option.effectDisplayText
              )}" />
            </div>
          `
          : ""
      }

      <div class="item-card">
        <div class="inline-row">
          <strong>Requirements</strong>
          <div class="item-actions">
            <button class="button small secondary" type="button" data-action="add-tracker-requirement">+ Tracker</button>
            <button class="button small secondary" type="button" data-action="add-flag-requirement">+ Flag</button>
          </div>
        </div>
        ${
          option.requirements.length
            ? option.requirements.map((requirement) => renderRequirementEditor(game, requirement)).join("")
            : '<p class="copy">No requirements.</p>'
        }
      </div>

      <div class="item-card">
        <div class="inline-row">
          <strong>Tracker effects</strong>
          <button class="button small secondary" type="button" data-action="add-tracker-effect">Add effect</button>
        </div>
        ${
          option.trackerEffects.length
            ? option.trackerEffects.map((effect) => renderTrackerEffectEditor(game, effect)).join("")
            : '<p class="copy">No tracker effects.</p>'
        }
      </div>

      <div class="item-card">
        <div class="inline-row">
          <strong>Flag effects</strong>
          <button class="button small secondary" type="button" data-action="add-flag-effect">Add effect</button>
        </div>
        ${
          option.flagEffects.length
            ? option.flagEffects.map((effect) => renderFlagEffectEditor(game, effect)).join("")
            : '<p class="copy">No flag effects.</p>'
        }
      </div>

      <div class="item-actions">
        <button class="button small ghost" type="button" data-action="delete-option">Delete Option</button>
      </div>
    </div>
  `;
}

function renderRequirementEditor(game, requirement) {
  if (requirement.kind === "tracker") {
    return `
      <div class="item-card">
        <div class="inline-form">
          <div class="field-group">
            <label>Tracker</label>
            <select class="field" data-requirement-id="${escapeAttr(requirement.id)}" data-requirement-field="targetId">
              ${game.trackers
                .map(
                  (tracker) =>
                    `<option value="${escapeAttr(tracker.id)}" ${
                      requirement.targetId === tracker.id ? "selected" : ""
                    }>${escapeHtml(tracker.name)}</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="field-group">
            <label>Operator</label>
            <select class="field" data-requirement-id="${escapeAttr(requirement.id)}" data-requirement-field="operator">
              ${TRACKER_OPERATORS.map(
                (operator) =>
                  `<option value="${operator}" ${
                    requirement.operator === operator ? "selected" : ""
                  }>${escapeHtml(operator)}</option>`
              ).join("")}
            </select>
          </div>
        </div>
        <div class="inline-form">
          <div class="field-group">
            <label>Value</label>
            <input class="field" type="number" data-requirement-id="${escapeAttr(
              requirement.id
            )}" data-requirement-field="value" value="${escapeAttr(String(requirement.value))}" />
          </div>
          <div class="field-group">
            <label>Type</label>
            <select class="field" data-requirement-id="${escapeAttr(requirement.id)}" data-requirement-field="kind">
              <option value="tracker" selected>Tracker</option>
              <option value="flag">Flag</option>
            </select>
          </div>
        </div>
        <div class="item-actions">
          <button class="button small ghost" type="button" data-action="remove-requirement" data-requirement-id="${escapeAttr(
            requirement.id
          )}">Remove</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="item-card">
      <div class="inline-form">
        <div class="field-group">
          <label>Flag</label>
          <select class="field" data-requirement-id="${escapeAttr(requirement.id)}" data-requirement-field="targetId">
            ${game.flags
              .map(
                (flag) =>
                  `<option value="${escapeAttr(flag.id)}" ${
                    requirement.targetId === flag.id ? "selected" : ""
                  }>${escapeHtml(flag.name)}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="field-group">
          <label>Required state</label>
          <select class="field" data-requirement-id="${escapeAttr(requirement.id)}" data-requirement-field="state">
            ${renderFlagStateOptions(game, requirement.targetId, requirement.state)}
          </select>
        </div>
      </div>
      <div class="field-group">
        <label>Type</label>
        <select class="field" data-requirement-id="${escapeAttr(requirement.id)}" data-requirement-field="kind">
          <option value="tracker">Tracker</option>
          <option value="flag" selected>Flag</option>
        </select>
      </div>
      <div class="item-actions">
        <button class="button small ghost" type="button" data-action="remove-requirement" data-requirement-id="${escapeAttr(
          requirement.id
        )}">Remove</button>
      </div>
    </div>
  `;
}

function renderTrackerEffectEditor(game, effect) {
  return `
    <div class="item-card">
      <div class="inline-form">
        <div class="field-group">
          <label>Tracker</label>
          <select class="field" data-tracker-effect-id="${escapeAttr(effect.id)}" data-tracker-effect-field="trackerId">
            ${game.trackers
              .map(
                (tracker) =>
                  `<option value="${escapeAttr(tracker.id)}" ${
                    effect.trackerId === tracker.id ? "selected" : ""
                  }>${escapeHtml(tracker.name)}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="field-group">
          <label>Delta</label>
          <input class="field" type="number" data-tracker-effect-id="${escapeAttr(
            effect.id
          )}" data-tracker-effect-field="delta" value="${escapeAttr(String(effect.delta))}" />
        </div>
      </div>
      <div class="item-actions">
        <button class="button small ghost" type="button" data-action="remove-tracker-effect" data-tracker-effect-id="${escapeAttr(
          effect.id
        )}">Remove</button>
      </div>
    </div>
  `;
}

function renderFlagEffectEditor(game, effect) {
  return `
    <div class="item-card">
      <div class="inline-form">
        <div class="field-group">
          <label>Flag</label>
          <select class="field" data-flag-effect-id="${escapeAttr(effect.id)}" data-flag-effect-field="flagId">
            ${game.flags
              .map(
                (flag) =>
                  `<option value="${escapeAttr(flag.id)}" ${
                    effect.flagId === flag.id ? "selected" : ""
                  }>${escapeHtml(flag.name)}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="field-group">
          <label>New state</label>
          <select class="field" data-flag-effect-id="${escapeAttr(effect.id)}" data-flag-effect-field="state">
            ${renderFlagStateOptions(game, effect.flagId, effect.state)}
          </select>
        </div>
      </div>
      <div class="item-actions">
        <button class="button small ghost" type="button" data-action="remove-flag-effect" data-flag-effect-id="${escapeAttr(
          effect.id
        )}">Remove</button>
      </div>
    </div>
  `;
}

function renderNodeOptions(game, selectedNodeId, chapterFilterId = null) {
  return game.nodes
    .filter((node) => !chapterFilterId || node.chapterId === chapterFilterId)
    .map(
      (node) =>
        `<option value="${escapeAttr(node.id)}" ${
          node.id === selectedNodeId ? "selected" : ""
        }>${escapeHtml(node.name)}</option>`
    )
    .join("");
}

function renderFlagStateOptions(game, flagId, selectedState) {
  const flag = getFlagById(game, flagId);
  const states = [null, ...(flag?.states ?? [])];

  return states
    .map((state) => {
      const value = state === null ? "__NULL__" : state;
      const label = state === null ? "null" : state;
      return `<option value="${escapeAttr(value)}" ${
        selectedState === state ? "selected" : ""
      }>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function renderGraph(game) {
  refs.graphZoomLabel.textContent = `${Math.round(appState.graph.zoom * 100)}%`;
  applyGraphTransform();

  if (!game.nodes.length) {
    refs.graphNodes.innerHTML = `<div class="empty-graph">Add a message node to begin authoring.</div>`;
    refs.graphConnections.innerHTML = "";
    return;
  }

  refs.graphNodes.innerHTML = game.nodes
    .map((node) => {
      const selectedNode = appState.selection.nodeId === node.id;
      const chapter = getChapterById(game, node.chapterId);
      const optionRows = node.options.length
        ? node.options
            .map((option) => {
              const selectedOption = selectedNode && appState.selection.optionId === option.id;
              const targetLabel =
                option.terminal === "target"
                  ? getNodeById(game, option.targetNodeId)?.name || "Unassigned target"
                  : formatTerminalLabel(option.terminal);

              return `
                <button
                  class="node-option ${selectedOption ? "selected" : ""}"
                  type="button"
                  data-node-id="${escapeAttr(node.id)}"
                  data-option-id="${escapeAttr(option.id)}"
                >
                  ${escapeHtml(option.text || "Untitled option")}
                  <small>${escapeHtml(targetLabel)}</small>
                </button>
              `;
            })
            .join("")
        : `<div class="node-option"><strong>No options yet.</strong><small>Add one from the inspector.</small></div>`;

      return `
        <article
          class="graph-node ${selectedNode ? "selected" : ""}"
          data-node-id="${escapeAttr(node.id)}"
          style="transform: translate(${node.position.x}px, ${node.position.y}px);"
        >
          <div class="node-header" data-node-id="${escapeAttr(node.id)}">
            <p class="eyebrow">${escapeHtml(chapter?.name || "Unassigned chapter")}</p>
            <h3>${escapeHtml(node.name || "Untitled message")}</h3>
            <p class="node-meta">${escapeHtml(node.secondary || "No secondary information")}</p>
          </div>
          <div class="node-options">${optionRows}</div>
        </article>
      `;
    })
    .join("");

  refs.graphConnections.innerHTML = buildConnectionPaths(game);
}

function buildConnectionPaths(game) {
  const nodeMap = new Map(game.nodes.map((node) => [node.id, node]));

  return game.nodes
    .flatMap((node) =>
      node.options.map((option, index) => {
        if (option.terminal !== "target" || !option.targetNodeId) {
          return "";
        }

        const target = nodeMap.get(option.targetNodeId);
        if (!target) {
          return "";
        }

        const startX = node.position.x + NODE_WIDTH;
        const startY = node.position.y + NODE_HEADER_HEIGHT + index * NODE_OPTION_HEIGHT + 18;
        const endX = target.position.x;
        const endY = target.position.y + 52;
        const handle = Math.max(70, Math.abs(endX - startX) / 2);

        return `<path class="connection-path" d="M ${startX} ${startY} C ${startX + handle} ${startY}, ${
          endX - handle
        } ${endY}, ${endX} ${endY}" />`;
      })
    )
    .join("");
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
      centerGraph();
      persistEditorDraft();
      switchView("create");
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

    if (!save || save.gameId !== appState.playGame.metadata.id) {
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

  if (errors.length) {
    appState.playState = null;
    appState.playError = errors;
    switchView("play");
    return;
  }

  const cached = loadPlayCache(game.metadata.id);
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

  playState.history.push({
    nodeId: currentNode.id,
    optionId: option.id,
  });
  playState.log.push({
    type: "choice",
    text: option.text,
  });

  option.trackerEffects.forEach((effect) => {
    const tracker = getTrackerById(game, effect.trackerId);
    if (!tracker) {
      return;
    }

    playState.trackers[tracker.id] = applyTrackerEffect(tracker, playState.trackers[tracker.id], effect.delta);
  });

  option.flagEffects.forEach((effect) => {
    if (!getFlagById(game, effect.flagId)) {
      return;
    }

    playState.flags[effect.flagId] = effect.state;
  });

  const transition = resolveTransition(game, playState, currentNode, option);
  playState.updatedAt = new Date().toISOString();

  if (transition.type === "node") {
    const nextNode = getNodeById(game, transition.nodeId);
    if (!nextNode) {
      playState.status = "error";
      playState.log.push({
        type: "event",
        label: "Runtime error",
        text: "The option target could not be resolved.",
      });
      return;
    }

    playState.currentNodeId = nextNode.id;
    playState.currentChapterId = nextNode.chapterId;
    appendMessageLog(playState, nextNode);
    maybeCompleteOnEndpoint(playState, nextNode);
    return;
  }

  if (transition.type === "chapterEnd") {
    const nextChapter = getNextChapter(game, currentNode.chapterId);
    if (!nextChapter || !nextChapter.startNodeId) {
      playState.status = "complete";
      playState.log.push({
        type: "event",
        label: "Chapter end",
        text: "The chapter ended and no later chapter start was configured.",
      });
      return;
    }

    const nextNode = getNodeById(game, nextChapter.startNodeId);
    if (!nextNode) {
      playState.status = "error";
      playState.log.push({
        type: "event",
        label: "Runtime error",
        text: "The next chapter start node is missing.",
      });
      return;
    }

    playState.log.push({
      type: "event",
      label: "Chapter complete",
      text: `Advancing to ${nextChapter.name}.`,
    });
    playState.currentChapterId = nextChapter.id;
    playState.currentNodeId = nextNode.id;
    appendMessageLog(playState, nextNode);
    maybeCompleteOnEndpoint(playState, nextNode);
    return;
  }

  if (transition.type === "gameEnd") {
    playState.status = "complete";
    playState.log.push({
      type: "event",
      label: "Game end",
      text: "The game has reached an authored ending.",
    });
    return;
  }

  if (transition.type === "endpoint") {
    playState.status = "complete";
    playState.log.push({
      type: "event",
      label: "Endpoint",
      text: "This branch ends here.",
    });
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
    secondary: node.secondary,
    body: node.body,
  });
}

function maybeCompleteOnEndpoint(playState, node) {
  if (node.isEndpoint && node.options.length === 0) {
    playState.status = "complete";
    playState.log.push({
      type: "event",
      label: "Endpoint",
      text: "This message is marked as an endpoint.",
    });
  }
}

function resolveTransition(game, playState, currentNode, option) {
  if (option.terminal === "target") {
    return option.targetNodeId ? { type: "node", nodeId: option.targetNodeId } : { type: "error" };
  }

  if (option.terminal === "chapterEnd") {
    return { type: "chapterEnd" };
  }

  if (option.terminal === "gameEnd") {
    return { type: "gameEnd" };
  }

  if (option.terminal === "endpoint") {
    return { type: "endpoint" };
  }

  return { type: "error" };
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

function exportPlaySave() {
  if (!appState.playState || !appState.playGame) {
    return;
  }

  const payload = {
    format: SAVE_FORMAT,
    version: GAME_VERSION,
    savedAt: new Date().toISOString(),
    gameId: appState.playGame.metadata.id,
    state: appState.playState,
  };
  const filename = `${slugify(appState.playGame.metadata.name)}-save-${timestampForFile()}.json`;
  downloadTextFile(filename, JSON.stringify(payload, null, 2));
}

function exportEditorGame() {
  if (!appState.createGame) {
    return;
  }

  const filename = `${slugify(appState.createGame.metadata.name)}.json`;
  downloadTextFile(filename, JSON.stringify(appState.createGame, null, 2));
}

function handleTabClick(event) {
  const button = event.target.closest("[data-tab-id]");
  if (!button) {
    return;
  }

  appState.createTab = button.dataset.tabId;
  renderCreateView();
}

function handleSidebarClick(event) {
  const actionElement = event.target.closest("[data-action]");
  const action = actionElement?.dataset.action;
  if (!action || !appState.createGame) {
    return;
  }

  switch (action) {
    case "add-chapter":
      addChapter();
      break;
    case "move-chapter-up":
      moveItem(appState.createGame.chapters, actionElement.dataset.chapterId, -1);
      commitEditorChange();
      break;
    case "move-chapter-down":
      moveItem(appState.createGame.chapters, actionElement.dataset.chapterId, 1);
      commitEditorChange();
      break;
    case "delete-chapter":
      deleteChapter(actionElement.dataset.chapterId);
      break;
    case "add-tracker":
      addTracker();
      break;
    case "delete-tracker":
      appState.createGame.trackers = appState.createGame.trackers.filter(
        (tracker) => tracker.id !== actionElement.dataset.trackerId
      );
      commitEditorChange();
      break;
    case "add-group":
      addTrackerGroup();
      break;
    case "move-group-up":
      moveItem(appState.createGame.trackerGroups, actionElement.dataset.groupId, -1);
      commitEditorChange();
      break;
    case "move-group-down":
      moveItem(appState.createGame.trackerGroups, actionElement.dataset.groupId, 1);
      commitEditorChange();
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

  if (target.hasAttribute("data-root-node-select")) {
    appState.createGame.rootNodeId = target.value;
    normalizeEditorSelection();
    commitEditorChange();
    return;
  }

  if (target.dataset.chapterField) {
    const chapter = getChapterById(appState.createGame, target.dataset.chapterId);
    if (!chapter) {
      return;
    }

    chapter[target.dataset.chapterField] = target.value || null;
    commitEditorChange();
    return;
  }

  if (target.dataset.trackerField) {
    const tracker = getTrackerById(appState.createGame, target.dataset.trackerId);
    if (!tracker) {
      return;
    }

    tracker[target.dataset.trackerField] =
      target.dataset.trackerField === "startValue"
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
      target.dataset.flagField === "states" ? parseStatesInput(target.value) : target.value;
    commitEditorChange();
  }
}

function handleInspectorClick(event) {
  const actionElement = event.target.closest("[data-action]");
  const action = actionElement?.dataset.action;
  if (!action || !appState.createGame) {
    return;
  }

  switch (action) {
    case "add-option":
      withSelectedNode((node) => {
        const option = createOption();
        node.options.push(option);
        appState.selection.optionId = option.id;
      });
      commitEditorChange();
      break;
    case "delete-node":
      deleteSelectedNode();
      break;
    case "clear-option-selection":
      appState.selection.optionId = null;
      renderCreateView();
      break;
    case "delete-option":
      withSelectedNode((node) => {
        node.options = node.options.filter((option) => option.id !== appState.selection.optionId);
        appState.selection.optionId = null;
      });
      commitEditorChange();
      break;
    case "add-tracker-requirement":
      withSelectedOption((option, game) => {
        option.requirements.push(createTrackerRequirement(game.trackers[0]?.id ?? null));
      });
      commitEditorChange();
      break;
    case "add-flag-requirement":
      withSelectedOption((option, game) => {
        option.requirements.push(createFlagRequirement(game.flags[0]?.id ?? null));
      });
      commitEditorChange();
      break;
    case "remove-requirement":
      withSelectedOption((option) => {
        option.requirements = option.requirements.filter(
          (requirement) => requirement.id !== actionElement.dataset.requirementId
        );
      });
      commitEditorChange();
      break;
    case "add-tracker-effect":
      withSelectedOption((option, game) => {
        option.trackerEffects.push(createTrackerEffect(game.trackers[0]?.id ?? null));
      });
      commitEditorChange();
      break;
    case "remove-tracker-effect":
      withSelectedOption((option) => {
        option.trackerEffects = option.trackerEffects.filter(
          (effect) => effect.id !== actionElement.dataset.trackerEffectId
        );
      });
      commitEditorChange();
      break;
    case "add-flag-effect":
      withSelectedOption((option, game) => {
        option.flagEffects.push(createFlagEffect(game.flags[0]?.id ?? null));
      });
      commitEditorChange();
      break;
    case "remove-flag-effect":
      withSelectedOption((option) => {
        option.flagEffects = option.flagEffects.filter(
          (effect) => effect.id !== actionElement.dataset.flagEffectId
        );
      });
      commitEditorChange();
      break;
    default:
      break;
  }
}

function handleInspectorChange(event) {
  if (!appState.createGame) {
    return;
  }

  const target = event.target;

  if (target.dataset.nodeField) {
    withSelectedNode((node) => {
      node[target.dataset.nodeField] =
        target.type === "checkbox" ? target.checked : target.value;
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.optionField) {
    withSelectedOption((option) => {
      option[target.dataset.optionField] =
        target.dataset.optionField === "targetNodeId" ? target.value || null : target.value;
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.requirementId) {
    withSelectedOption((option, game) => {
      const requirement = option.requirements.find((item) => item.id === target.dataset.requirementId);
      if (!requirement) {
        return;
      }

      const field = target.dataset.requirementField;
      if (field === "kind") {
        Object.assign(
          requirement,
          target.value === "tracker"
            ? createTrackerRequirement(game.trackers[0]?.id ?? null, requirement.id)
            : createFlagRequirement(game.flags[0]?.id ?? null, requirement.id)
        );
      } else if (field === "value") {
        requirement.value = parseNumberOrFallback(target.value, 0);
      } else if (field === "state") {
        requirement.state = fromNullableSelectValue(target.value);
      } else {
        requirement[field] = target.value || null;
      }
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.trackerEffectId) {
    withSelectedOption((option) => {
      const effect = option.trackerEffects.find((item) => item.id === target.dataset.trackerEffectId);
      if (!effect) {
        return;
      }

      effect[target.dataset.trackerEffectField] =
        target.dataset.trackerEffectField === "delta"
          ? parseNumberOrFallback(target.value, 0)
          : target.value || null;
    });
    commitEditorChange();
    return;
  }

  if (target.dataset.flagEffectId) {
    withSelectedOption((option) => {
      const effect = option.flagEffects.find((item) => item.id === target.dataset.flagEffectId);
      if (!effect) {
        return;
      }

      effect[target.dataset.flagEffectField] =
        target.dataset.flagEffectField === "state" ? fromNullableSelectValue(target.value) : target.value || null;
    });
    commitEditorChange();
  }
}

function handleGraphSelection(event) {
  const optionButton = event.target.closest("[data-option-id]");
  if (optionButton) {
    appState.selection.nodeId = optionButton.dataset.nodeId;
    appState.selection.optionId = optionButton.dataset.optionId;
    renderCreateView();
    return;
  }

  const nodeElement = event.target.closest("[data-node-id]");
  if (nodeElement) {
    appState.selection.nodeId = nodeElement.dataset.nodeId;
    appState.selection.optionId = null;
    renderCreateView();
  }
}

function handleNodeDragStart(event) {
  const header = event.target.closest(".node-header");
  if (!header || !appState.createGame) {
    return;
  }

  const node = getNodeById(appState.createGame, header.dataset.nodeId);
  if (!node) {
    return;
  }

  appState.selection.nodeId = node.id;
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

  if (event.target.closest(".graph-node")) {
    return;
  }

  appState.drag = {
    type: "pan",
    startX: event.clientX,
    startY: event.clientY,
    originX: appState.graph.panX,
    originY: appState.graph.panY,
  };
  refs.graphViewport.classList.add("dragging");
  event.preventDefault();
}

function handleGraphWheel(event) {
  if (appState.view !== "create") {
    return;
  }

  event.preventDefault();

  const factor = event.deltaY < 0 ? 1.08 : 1 / 1.08;
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
    appState.graph.panX = appState.drag.originX + (event.clientX - appState.drag.startX);
    appState.graph.panY = appState.drag.originY + (event.clientY - appState.drag.startY);
    applyGraphTransform();
    refs.graphZoomLabel.textContent = `${Math.round(appState.graph.zoom * 100)}%`;
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
  }
}

function handleDocumentDragEnd() {
  if (!appState.drag) {
    return;
  }

  if (appState.drag.type === "node") {
    persistEditorDraft();
  }

  appState.drag = null;
  refs.graphViewport.classList.remove("dragging");
}

function addChapter() {
  const chapter = createChapter(`Chapter ${appState.createGame.chapters.length + 1}`);
  appState.createGame.chapters.push(chapter);
  commitEditorChange();
}

function deleteChapter(chapterId) {
  if (!appState.createGame || appState.createGame.chapters.length === 1) {
    return;
  }

  const chapterIndex = appState.createGame.chapters.findIndex((chapter) => chapter.id === chapterId);
  if (chapterIndex === -1) {
    return;
  }

  const fallback = appState.createGame.chapters[chapterIndex === 0 ? 1 : chapterIndex - 1];
  appState.createGame.nodes.forEach((node) => {
    if (node.chapterId === chapterId) {
      node.chapterId = fallback.id;
    }
  });
  appState.createGame.chapters = appState.createGame.chapters.filter((chapter) => chapter.id !== chapterId);
  commitEditorChange();
}

function addTracker() {
  const tracker = createTracker();
  tracker.groupId = appState.createGame.trackerGroups[0]?.id ?? null;
  appState.createGame.trackers.push(tracker);
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

  const rect = refs.graphViewport.getBoundingClientRect();
  const worldX = (rect.width / 2 - appState.graph.panX) / appState.graph.zoom;
  const worldY = (rect.height / 2 - appState.graph.panY) / appState.graph.zoom;
  const chapterId = appState.selection.nodeId
    ? getNodeById(appState.createGame, appState.selection.nodeId)?.chapterId
    : appState.createGame.chapters[0]?.id;

  const node = createNode(chapterId);
  node.position.x = clamp(Math.round(worldX - NODE_WIDTH / 2), 0, GRAPH_WORLD_WIDTH - NODE_WIDTH - 40);
  node.position.y = clamp(Math.round(worldY - 120), 0, GRAPH_WORLD_HEIGHT - 220);
  appState.createGame.nodes.push(node);
  appState.selection.nodeId = node.id;
  appState.selection.optionId = null;
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
  appState.createGame.nodes.forEach((node) => {
    node.options.forEach((option) => {
      if (option.targetNodeId === nodeId) {
        option.targetNodeId = null;
      }
    });
  });
  if (appState.createGame.rootNodeId === nodeId) {
    appState.createGame.rootNodeId = fallbackNode.id;
  }
  appState.createGame.chapters.forEach((chapter) => {
    if (chapter.startNodeId === nodeId) {
      chapter.startNodeId = fallbackNode.chapterId === chapter.id ? fallbackNode.id : null;
    }
  });
  appState.selection.nodeId = fallbackNode.id;
  appState.selection.optionId = null;
  commitEditorChange();
}

function centerGraph() {
  if (!appState.createGame || !appState.createGame.nodes.length) {
    appState.graph.panX = 140;
    appState.graph.panY = 110;
    appState.graph.zoom = 1;
    renderCreateView();
    return;
  }

  const bounds = getGraphBounds(appState.createGame.nodes);
  const rect = refs.graphViewport.getBoundingClientRect();
  const availableWidth = rect.width || 900;
  const availableHeight = rect.height || 600;
  const zoomX = availableWidth / Math.max(bounds.maxX - bounds.minX + 220, 1);
  const zoomY = availableHeight / Math.max(bounds.maxY - bounds.minY + 180, 1);
  appState.graph.zoom = clamp(Math.min(1, zoomX, zoomY), 0.45, 1.2);
  appState.graph.panX =
    availableWidth / 2 - ((bounds.minX + bounds.maxX) / 2 + NODE_WIDTH / 2) * appState.graph.zoom;
  appState.graph.panY =
    availableHeight / 2 - ((bounds.minY + bounds.maxY) / 2 + 80) * appState.graph.zoom;
  renderCreateView();
}

function zoomGraph(factor) {
  appState.graph.zoom = clamp(appState.graph.zoom * factor, 0.45, 1.8);
  renderCreateView();
}

function applyGraphTransform() {
  refs.graphWorld.style.transform = `translate(${appState.graph.panX}px, ${appState.graph.panY}px) scale(${appState.graph.zoom})`;
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

function commitEditorChange() {
  normalizeEditorSelection();
  persistEditorDraft();
  renderCreateView();
}

function normalizeEditorSelection() {
  if (!appState.createGame) {
    appState.selection.nodeId = null;
    appState.selection.optionId = null;
    return;
  }

  if (!getNodeById(appState.createGame, appState.selection.nodeId)) {
    appState.selection.nodeId = appState.createGame.rootNodeId || appState.createGame.nodes[0]?.id || null;
    appState.selection.optionId = null;
  }

  const node = getNodeById(appState.createGame, appState.selection.nodeId);
  if (!node || !getOptionById(node, appState.selection.optionId)) {
    appState.selection.optionId = null;
  }
}

function createGameScaffold() {
  const chapter = createChapter("Chapter 1");
  const group = createTrackerGroup("Core");
  const rootNode = createNode(chapter.id, "root");
  chapter.startNodeId = rootNode.id;

  return {
    format: GAME_FORMAT,
    version: GAME_VERSION,
    metadata: {
      id: `game-${Date.now().toString(36)}`,
      name: "Untitled Game",
      description: "",
    },
    rootNodeId: rootNode.id,
    chapters: [chapter],
    trackerGroups: [group],
    trackers: [],
    flags: [],
    nodes: [rootNode],
  };
}

function createChapter(name = "New Chapter") {
  return {
    id: createId("chapter"),
    name,
    startNodeId: null,
  };
}

function createNode(chapterId, name = "new_message") {
  return {
    id: createId("node"),
    name,
    chapterId,
    secondary: "",
    body: "Write the system message here.",
    position: {
      x: 160,
      y: 140,
    },
    isEndpoint: false,
    editorNotes: "",
    options: [],
  };
}

function createOption() {
  return {
    id: createId("option"),
    text: "New option",
    targetNodeId: null,
    terminal: "target",
    failureMode: "disabled",
    requirementDisplayMode: "none",
    requirementDisplayText: "",
    effectDisplayMode: "none",
    effectDisplayText: "",
    requirements: [],
    trackerEffects: [],
    flagEffects: [],
  };
}

function createTrackerRequirement(targetId, id = createId("req")) {
  return {
    id,
    kind: "tracker",
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

function createTracker() {
  return {
    id: createId("tracker"),
    name: "New Tracker",
    startValue: 0,
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
    name: "New Flag",
    states: ["set"],
  };
}

function normalizeGame(rawGame) {
  if (!rawGame || typeof rawGame !== "object") {
    return createGameScaffold();
  }

  const normalized = {
    format: rawGame.format || GAME_FORMAT,
    version: rawGame.version || GAME_VERSION,
    metadata: {
      id: rawGame.metadata?.id || `game-${Date.now().toString(36)}`,
      name: rawGame.metadata?.name || "Untitled Game",
      description: rawGame.metadata?.description || "",
    },
    rootNodeId: rawGame.rootNodeId || null,
    chapters: Array.isArray(rawGame.chapters)
      ? rawGame.chapters.map((chapter, index) => ({
          id: chapter?.id || createId("chapter"),
          name: chapter?.name || `Chapter ${index + 1}`,
          startNodeId: chapter?.startNodeId || null,
        }))
      : [],
    trackerGroups: Array.isArray(rawGame.trackerGroups)
      ? rawGame.trackerGroups.map((group, index) => ({
          id: group?.id || createId("group"),
          name: group?.name || `Group ${index + 1}`,
        }))
      : [],
    trackers: Array.isArray(rawGame.trackers)
      ? rawGame.trackers.map((tracker) => ({
          id: tracker?.id || createId("tracker"),
          name: tracker?.name || "Untitled Tracker",
          startValue: parseNumberOrFallback(tracker?.startValue, 0),
          min: parseNullableNumber(tracker?.min),
          max: parseNullableNumber(tracker?.max),
          direction: DIRECTION_OPTIONS.some((item) => item.value === tracker?.direction)
            ? tracker.direction
            : "both",
          sign: SIGN_OPTIONS.some((item) => item.value === tracker?.sign) ? tracker.sign : "any",
          groupId: tracker?.groupId || null,
        }))
      : [],
    flags: Array.isArray(rawGame.flags)
      ? rawGame.flags.map((flag) => ({
          id: flag?.id || createId("flag"),
          name: flag?.name || "Untitled Flag",
          states: Array.isArray(flag?.states)
            ? flag.states.filter((state) => typeof state === "string" && state.length)
            : [],
        }))
      : [],
    nodes: Array.isArray(rawGame.nodes)
      ? rawGame.nodes.map((node, index) => normalizeNode(node, index, rawGame))
      : [],
  };

  if (!normalized.chapters.length) {
    normalized.chapters.push(createChapter("Chapter 1"));
  }

  if (!normalized.nodes.length) {
    const node = createNode(normalized.chapters[0].id, "root");
    normalized.nodes.push(node);
    normalized.rootNodeId = node.id;
    normalized.chapters[0].startNodeId = node.id;
  }

  if (!normalized.rootNodeId || !getNodeById(normalized, normalized.rootNodeId)) {
    normalized.rootNodeId = normalized.nodes[0].id;
  }

  normalized.nodes.forEach((node, index) => {
    if (!getChapterById(normalized, node.chapterId)) {
      node.chapterId = normalized.chapters[0].id;
    }
    if (!node.position) {
      node.position = { x: 120 + index * 40, y: 120 + index * 30 };
    }
  });

  normalized.chapters.forEach((chapter) => {
    if (!chapter.startNodeId || !getNodeById(normalized, chapter.startNodeId)) {
      chapter.startNodeId =
        normalized.nodes.find((node) => node.chapterId === chapter.id)?.id || null;
    }
  });

  return normalized;
}

function normalizeNode(node, index, rawGame) {
  return {
    id: node?.id || createId("node"),
    name: node?.name || `message_${index + 1}`,
    chapterId: node?.chapterId || rawGame?.chapters?.[0]?.id || null,
    secondary: node?.secondary || "",
    body: node?.body || "",
    position: {
      x: parseNumberOrFallback(node?.position?.x, 120 + index * 36),
      y: parseNumberOrFallback(node?.position?.y, 120 + index * 28),
    },
    isEndpoint: Boolean(node?.isEndpoint),
    editorNotes: node?.editorNotes || "",
    options: Array.isArray(node?.options) ? node.options.map(normalizeOption) : [],
  };
}

function normalizeOption(option) {
  return {
    id: option?.id || createId("option"),
    text: option?.text || "Untitled option",
    targetNodeId: option?.targetNodeId || null,
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
    requirements: Array.isArray(option?.requirements)
      ? option.requirements.map((requirement) =>
          requirement?.kind === "flag"
            ? createFlagRequirement(requirement.targetId || null, requirement.id || createId("req"))
            : createTrackerRequirement(requirement.targetId || null, requirement.id || createId("req"))
        ).map((requirement, index) => normalizeRequirement(requirement, option.requirements[index]))
      : [],
    trackerEffects: Array.isArray(option?.trackerEffects)
      ? option.trackerEffects.map((effect) => ({
          id: effect?.id || createId("te"),
          trackerId: effect?.trackerId || null,
          delta: parseNumberOrFallback(effect?.delta, 0),
        }))
      : [],
    flagEffects: Array.isArray(option?.flagEffects)
      ? option.flagEffects.map((effect) => ({
          id: effect?.id || createId("fe"),
          flagId: effect?.flagId || null,
          state: effect?.state ?? null,
        }))
      : [],
  };
}

function normalizeRequirement(baseRequirement, rawRequirement) {
  return {
    ...baseRequirement,
    operator: TRACKER_OPERATORS.includes(rawRequirement?.operator) ? rawRequirement.operator : baseRequirement.operator,
    value: parseNumberOrFallback(rawRequirement?.value, baseRequirement.value),
    state: rawRequirement?.state ?? baseRequirement.state,
  };
}

function validateGame(game) {
  const issues = [];

  if (!game.metadata.id) {
    issues.push(makeIssue("error", "Game metadata is missing an identifier."));
  }
  if (!game.metadata.name) {
    issues.push(makeIssue("error", "Game metadata is missing a name."));
  }
  if (!game.rootNodeId) {
    issues.push(makeIssue("error", "The game is missing a root message."));
  } else if (!getNodeById(game, game.rootNodeId)) {
    issues.push(makeIssue("error", "The configured root message does not exist."));
  }
  if (!game.chapters.length) {
    issues.push(makeIssue("error", "The game has no chapters."));
  }

  collectDuplicateIssues(game.nodes, "name", "message name", issues);
  collectDuplicateIssues(game.chapters, "id", "chapter id", issues);
  collectDuplicateIssues(game.trackers, "id", "tracker id", issues);
  collectDuplicateIssues(game.flags, "id", "flag id", issues);

  game.chapters.forEach((chapter) => {
    const chapterNodes = game.nodes.filter((node) => node.chapterId === chapter.id);
    if (!chapterNodes.length) {
      issues.push(makeIssue("error", `Chapter "${chapter.name}" has no assigned messages.`, chapter.id));
    }
    if (!chapter.startNodeId) {
      issues.push(makeIssue("error", `Chapter "${chapter.name}" has no start message.`, chapter.id));
    } else {
      const startNode = getNodeById(game, chapter.startNodeId);
      if (!startNode) {
        issues.push(makeIssue("error", `Chapter "${chapter.name}" points to a missing start message.`, chapter.id));
      } else if (startNode.chapterId !== chapter.id) {
        issues.push(
          makeIssue(
            "error",
            `Chapter "${chapter.name}" starts at a message assigned to a different chapter.`,
            chapter.startNodeId
          )
        );
      }
    }
  });

  game.trackers.forEach((tracker) => {
    if (tracker.min !== null && tracker.max !== null && tracker.min > tracker.max) {
      issues.push(makeIssue("error", `Tracker "${tracker.name}" has a minimum above its maximum.`, tracker.id));
    }
    if (tracker.min !== null && tracker.startValue < tracker.min) {
      issues.push(makeIssue("error", `Tracker "${tracker.name}" starts below its minimum.`, tracker.id));
    }
    if (tracker.max !== null && tracker.startValue > tracker.max) {
      issues.push(makeIssue("error", `Tracker "${tracker.name}" starts above its maximum.`, tracker.id));
    }
    if (tracker.sign === "nonNegative" && tracker.startValue < 0) {
      issues.push(makeIssue("error", `Tracker "${tracker.name}" cannot start negative.`, tracker.id));
    }
    if (tracker.sign === "nonPositive" && tracker.startValue > 0) {
      issues.push(makeIssue("error", `Tracker "${tracker.name}" cannot start positive.`, tracker.id));
    }
  });

  game.nodes.forEach((node) => {
    if (!getChapterById(game, node.chapterId)) {
      issues.push(makeIssue("error", `Message "${node.name}" is assigned to a missing chapter.`, node.id));
    }
    node.options.forEach((option) => {
      if (option.terminal === "target" && !option.targetNodeId) {
        issues.push(makeIssue("error", `Option "${option.text}" has no target message.`, node.id));
      }
      if (option.terminal === "target" && option.targetNodeId && !getNodeById(game, option.targetNodeId)) {
        issues.push(makeIssue("error", `Option "${option.text}" targets a missing message.`, node.id));
      }

      option.requirements.forEach((requirement) => {
        if (requirement.kind === "tracker") {
          const tracker = getTrackerById(game, requirement.targetId);
          if (!tracker) {
            issues.push(makeIssue("error", `Option "${option.text}" references a missing tracker requirement.`, node.id));
          }
        } else {
          const flag = getFlagById(game, requirement.targetId);
          if (!flag) {
            issues.push(makeIssue("error", `Option "${option.text}" references a missing flag requirement.`, node.id));
          } else if (requirement.state !== null && !flag.states.includes(requirement.state)) {
            issues.push(
              makeIssue("error", `Option "${option.text}" requires an invalid flag state "${requirement.state}".`, node.id)
            );
          }
        }
      });

      option.trackerEffects.forEach((effect) => {
        const tracker = getTrackerById(game, effect.trackerId);
        if (!tracker) {
          issues.push(makeIssue("error", `Option "${option.text}" changes a missing tracker.`, node.id));
          return;
        }
        if (tracker.direction === "increase" && effect.delta < 0) {
          issues.push(makeIssue("warning", `Option "${option.text}" decreases tracker "${tracker.name}" even though it only increases.`, node.id));
        }
        if (tracker.direction === "decrease" && effect.delta > 0) {
          issues.push(makeIssue("warning", `Option "${option.text}" increases tracker "${tracker.name}" even though it only decreases.`, node.id));
        }
      });

      option.flagEffects.forEach((effect) => {
        const flag = getFlagById(game, effect.flagId);
        if (!flag) {
          issues.push(makeIssue("error", `Option "${option.text}" changes a missing flag.`, node.id));
        } else if (effect.state !== null && !flag.states.includes(effect.state)) {
          issues.push(makeIssue("error", `Option "${option.text}" sets invalid flag state "${effect.state}".`, node.id));
        }
      });
    });
  });

  getUnreachableNodes(game).forEach((node) => {
    issues.push(makeIssue("warning", `Message "${node.name}" is unreachable from the game root.`, node.id));
  });

  return issues;
}

function getUnreachableNodes(game) {
  const reachableIds = new Set();
  const queue = [game.rootNodeId];

  while (queue.length) {
    const nodeId = queue.shift();
    if (!nodeId || reachableIds.has(nodeId)) {
      continue;
    }

    const node = getNodeById(game, nodeId);
    if (!node) {
      continue;
    }

    reachableIds.add(nodeId);

    node.options.forEach((option) => {
      if (option.terminal === "target" && option.targetNodeId) {
        queue.push(option.targetNodeId);
      }
      if (option.terminal === "chapterEnd") {
        const nextChapter = getNextChapter(game, node.chapterId);
        if (nextChapter?.startNodeId) {
          queue.push(nextChapter.startNodeId);
        }
      }
    });
  }

  return game.nodes.filter((node) => !reachableIds.has(node.id));
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

function makeIssue(severity, message, targetId = null) {
  return { severity, message, targetId };
}

function evaluateOptionAvailability(game, playState, option) {
  const passes = option.requirements.every((requirement) => evaluateRequirement(game, playState, requirement));
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

  return playState.flags[requirement.targetId] === requirement.state;
}

function compareValues(left, operator, right) {
  switch (operator) {
    case "=":
      return left === right;
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
    parts.push(`Requires ${requirementText}`);
  }
  if (effectText) {
    parts.push(`Effects ${effectText}`);
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

  return option.requirements
    .map((requirement) => {
      if (requirement.kind === "tracker") {
        const tracker = getTrackerById(game, requirement.targetId);
        if (!tracker) {
          return "";
        }

        const current = playState.trackers[tracker.id] ?? tracker.startValue;
        if (requirement.operator === ">=" && tracker.max !== null) {
          return `${tracker.name} ${current}/${requirement.value}`;
        }
        return `${tracker.name} ${formatPrettyOperator(requirement.operator)} ${requirement.value}`;
      }

      const flag = getFlagById(game, requirement.targetId);
      return flag ? `${flag.name}: ${requirement.state === null ? "null" : requirement.state}` : "";
    })
    .filter(Boolean)
    .join(", ");
}

function buildEffectDisplay(game, option) {
  if (option.effectDisplayMode === "none") {
    return "";
  }
  if (option.effectDisplayMode === "custom") {
    return option.effectDisplayText;
  }

  const parts = [];
  option.trackerEffects.forEach((effect) => {
    const tracker = getTrackerById(game, effect.trackerId);
    if (!tracker) {
      return;
    }

    if (effect.delta === 1) {
      parts.push(`${tracker.name} +`);
    } else if (effect.delta === -1) {
      parts.push(`${tracker.name} -`);
    } else {
      parts.push(`${tracker.name} ${effect.delta > 0 ? "+" : ""}${effect.delta}`);
    }
  });

  option.flagEffects.forEach((effect) => {
    const flag = getFlagById(game, effect.flagId);
    if (!flag) {
      return;
    }

    parts.push(`${flag.name} -> ${effect.state === null ? "null" : effect.state}`);
  });

  return parts.join(", ");
}

function buildTrackerDisplayGroups(game) {
  const grouped = game.trackerGroups.map((group) => ({
    id: group.id,
    name: group.name || "Unnamed Group",
    trackers: game.trackers.filter((tracker) => tracker.groupId === group.id),
  }));
  const ungrouped = game.trackers.filter((tracker) => !tracker.groupId);

  if (ungrouped.length) {
    grouped.push({
      id: "ungrouped",
      name: "Ungrouped",
      trackers: ungrouped,
    });
  }

  return grouped.filter((group) => group.trackers.length);
}

function createPlayState(game) {
  const state = {
    format: SAVE_FORMAT,
    version: GAME_VERSION,
    gameId: game.metadata.id,
    currentChapterId: getNodeById(game, game.rootNodeId)?.chapterId || game.chapters[0]?.id || null,
    currentNodeId: game.rootNodeId,
    trackers: Object.fromEntries(game.trackers.map((tracker) => [tracker.id, normalizeTrackerStart(tracker)])),
    flags: Object.fromEntries(game.flags.map((flag) => [flag.id, null])),
    log: [],
    history: [],
    notes: "",
    status: "active",
    updatedAt: new Date().toISOString(),
  };

  const startNode = getNodeById(game, state.currentNodeId);
  if (startNode) {
    appendMessageLog(state, startNode);
    maybeCompleteOnEndpoint(state, startNode);
  } else {
    state.status = "error";
    state.log.push({
      type: "event",
      label: "Runtime error",
      text: "The configured root message could not be found.",
    });
  }

  return state;
}

function normalizePlaySave(rawSave, game) {
  if (!rawSave || typeof rawSave !== "object") {
    return null;
  }

  const state = {
    format: SAVE_FORMAT,
    version: rawSave.version || GAME_VERSION,
    gameId: rawSave.gameId || game.metadata.id,
    currentChapterId: rawSave.currentChapterId || getNodeById(game, rawSave.currentNodeId)?.chapterId || game.chapters[0]?.id || null,
    currentNodeId: rawSave.currentNodeId || game.rootNodeId,
    trackers: Object.fromEntries(
      game.trackers.map((tracker) => [
        tracker.id,
        typeof rawSave.trackers?.[tracker.id] === "number"
          ? sanitizeTrackerValue(tracker, rawSave.trackers[tracker.id])
          : normalizeTrackerStart(tracker),
      ])
    ),
    flags: Object.fromEntries(
      game.flags.map((flag) => [flag.id, rawSave.flags?.[flag.id] ?? null])
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

  window.localStorage.setItem(EDITOR_DRAFT_KEY, JSON.stringify(appState.createGame));
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
    `${PLAY_CACHE_PREFIX}${appState.playGame.metadata.id}`,
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

function getNodeById(game, nodeId) {
  return game?.nodes.find((node) => node.id === nodeId) || null;
}

function getOptionById(node, optionId) {
  return node?.options.find((option) => option.id === optionId) || null;
}

function getChapterById(game, chapterId) {
  return game?.chapters.find((chapter) => chapter.id === chapterId) || null;
}

function getChapterIndex(game, chapterId) {
  return game.chapters.findIndex((chapter) => chapter.id === chapterId);
}

function getNextChapter(game, chapterId) {
  const index = getChapterIndex(game, chapterId);
  return index >= 0 ? game.chapters[index + 1] || null : null;
}

function getTrackerById(game, trackerId) {
  return game?.trackers.find((tracker) => tracker.id === trackerId) || null;
}

function getTrackerGroupById(game, groupId) {
  return game?.trackerGroups.find((group) => group.id === groupId) || null;
}

function getFlagById(game, flagId) {
  return game?.flags.find((flag) => flag.id === flagId) || null;
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
  switch (terminal) {
    case "chapterEnd":
      return "Chapter end";
    case "gameEnd":
      return "Game end";
    case "endpoint":
      return "Endpoint";
    default:
      return "Target";
  }
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

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
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
