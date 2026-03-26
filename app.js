const SAVE_STORAGE_KEY = "on-dark-moon-waters-save-v1";
const SAVE_FILE_PREFIX = "on-dark-moon-waters-save";
const MAX_LOG_ENTRIES = 8;

const storyNodes = {
  intro: {
    title: "The Last Ferry",
    text:
      "Black water folds around your skiff as the bell tower of Saint Arken tilts above the drowned marsh. A dead moon stares through the mist. You came to collect a debt from the abbey ruin, but something below the hull has already learned your name.",
    choices: [
      {
        label: "Dock at the abbey causeway",
        next: "causeway",
        effects: {
          resolve: 1,
          moonwater: 1,
          log: "You moor beneath the abbey stones and bottle a little moonwater from the wake.",
        },
      },
      {
        label: "Follow the singing under the water",
        next: "undertow",
        effects: {
          health: -1,
          moonwater: 2,
          log: "The water-song drags your skiff into deeper dark. Cold fingers brush your wrist.",
        },
      },
    ],
  },
  causeway: {
    title: "Broken Saints",
    text:
      "The abbey courtyard is half swamp, half graveyard. Iron prayer-lanterns hang from split arches. One still holds a coal, faint as an eye that refuses to close.",
    choices: [
      {
        label: "Light your lantern from the coal",
        next: "archive",
        condition: (state) => !state.flags.lanternLit,
        effects: {
          flags: { lanternLit: true },
          inventoryAdd: "Lantern of Saint Arken",
          log: "A patient flame wakes inside your lantern. The marsh recoils a little.",
        },
      },
      {
        label: "Search the sunken alms box",
        next: "archive",
        effects: {
          silver: 2,
          health: -1,
          log: "You pry loose old silver from the mire, but something barbed bites your palm.",
        },
      },
      {
        label: "Return to the skiff and drift elsewhere",
        next: "undertow",
        effects: {
          log: "You leave the stones behind and let the current make the next choice.",
        },
      },
    ],
  },
  undertow: {
    title: "Choir Below",
    text:
      "Shapes travel under the water with the rhythm of kneeling monks. Their song offers bargains in a language older than churches: a safe passage, a secret name, a debt forgiven.",
    choices: [
      {
        label: "Offer one silver for a whispered route",
        next: "archive",
        condition: (state) => state.silver >= 1,
        effects: {
          silver: -1,
          resolve: 1,
          flags: { heardTrueName: true },
          log: "The choir takes a coin and answers with a route only the dead should know.",
        },
      },
      {
        label: "Draw moonwater into a vial and resist the song",
        next: "archive",
        effects: {
          moonwater: 1,
          resolve: 1,
          log: "You trap silver water in glass and force your breathing back into your own body.",
        },
      },
      {
        label: "Lean closer and listen too long",
        next: "wound",
        effects: {
          health: -2,
          resolve: -1,
          log: "The voices kiss your ear and take something warm away with them.",
        },
      },
    ],
  },
  archive: {
    title: "Flooded Archive",
    text:
      "Inside the abbey archive, swollen books drift against chained desks. At the far wall rests the tithe chest you came for, sealed with wax and a moon-shaped lock.",
    choices: [
      {
        label: "Break the chest open",
        next: "sanctum",
        effects: {
          silver: 4,
          flags: { angeredAbbey: true },
          log: "The wax snaps. Silver spills out with a sigh that sounds too human.",
        },
      },
      {
        label: "Use moonwater to reveal the hidden key-glyph",
        next: "sanctum",
        condition: (state) => state.moonwater >= 1,
        effects: {
          moonwater: -1,
          resolve: 1,
          inventoryAdd: "Tithe Seal",
          log: "Moonwater traces a key in cold light. The chest opens without complaint.",
        },
      },
      {
        label: "Search the chained desks for forbidden charts",
        next: "chartRoom",
        effects: {
          inventoryAdd: "Drowned Chart",
          log: "You find a tide-chart marked with circles where islands should be.",
        },
      },
    ],
  },
  wound: {
    title: "Blood in the Wake",
    text:
      "You come back to yourself with your hand in the water and your reflection gone. The skiff still points toward the abbey, but the marsh now knows you can be opened.",
    choices: [
      {
        label: "Force yourself toward the archive",
        next: "archive",
        effects: {
          resolve: 1,
          log: "Pain steadies you better than prayer ever did.",
        },
      },
      {
        label: "Drink a measure of moonwater",
        next: "archive",
        condition: (state) => state.moonwater >= 1,
        effects: {
          moonwater: -1,
          health: 2,
          log: "Moonwater burns like winter and seals what the choir opened.",
        },
      },
    ],
  },
  chartRoom: {
    title: "The Cartographer's Cell",
    text:
      "A narrow room leans over the marsh, its walls stitched with maps made from vellum and fish skin. One chart ends at a circle labeled only with the word Below.",
    choices: [
      {
        label: "Pocket the cartographer's relic compass",
        next: "sanctum",
        effects: {
          inventoryAdd: "Relic Compass",
          flags: { hasCompass: true },
          log: "The relic compass turns once toward the water below the abbey and then goes still.",
        },
      },
      {
        label: "Burn the room and deny the maps to the marsh",
        next: "sanctum",
        effects: {
          resolve: 2,
          health: -1,
          flags: { burnedCharts: true },
          log: "Smoke climbs through the rafters. For a moment the singing under the abbey falters.",
        },
      },
    ],
  },
  sanctum: {
    title: "Moonwell Sanctum",
    text:
      "Below the abbey altar lies a round chamber cut into the bedrock. A moonwell turns slowly at its center, though there is no mechanism and no wind. Inside the water you see the drowned abbot waiting with empty hands.",
    choices: [
      {
        label: "Cast silver into the moonwell and ask safe passage",
        next: "endingPassage",
        condition: (state) => state.silver >= 3,
        effects: {
          silver: -3,
          ending: "passage",
          log: "The well accepts your silver. The drowned abbot bows and opens the old channel home.",
        },
      },
      {
        label: "Use the tithe seal to bind what lives below",
        next: "endingSeal",
        condition: (state) => state.inventory.includes("Tithe Seal"),
        effects: {
          resolve: 1,
          ending: "seal",
          log: "You press the seal into the turning water and the chamber answers with a scream.",
        },
      },
      {
        label: "Follow the relic compass into the water",
        next: "endingBelow",
        condition: (state) => state.flags.hasCompass,
        effects: {
          ending: "below",
          log: "You trust the relic compass and step into the well as if it were a road.",
        },
      },
      {
        label: "Stare into the well and speak the true name back",
        next: "endingName",
        condition: (state) => state.flags.heardTrueName,
        effects: {
          resolve: 2,
          ending: "name",
          log: "The name leaves your mouth like a stolen oath. The marsh finally listens.",
        },
      },
      {
        label: "Back away with what you can still carry",
        next: "endingFlee",
        effects: {
          ending: "flee",
          log: "You refuse the well. Some debts can remain unpaid if you leave fast enough.",
        },
      },
    ],
  },
  endingPassage: {
    title: "Ending: The Paid Tide",
    text:
      "The current gentles. Your skiff finds a river that no map kept. By dawn you are home, richer than before and older in ways silver cannot weigh. On quiet nights, though, you still hear the abbey bell ringing far under the water.",
    choices: [
      {
        label: "Begin again from the ferry",
        next: "intro",
        effects: {
          restart: true,
        },
      },
    ],
  },
  endingSeal: {
    title: "Ending: The Bound Deep",
    text:
      "The moonwell freezes mid-turn. The drowned abbot cracks apart like wet plaster, and the song under the marsh falls silent for the first time in centuries. Fishermen will call this season a miracle. You will know it was only a pause.",
    choices: [
      {
        label: "Begin again from the ferry",
        next: "intro",
        effects: {
          restart: true,
        },
      },
    ],
  },
  endingBelow: {
    title: "Ending: The Road Under Water",
    text:
      "The moonwell accepts your weight and opens beneath your feet. You walk through drowned halls lit by stars that belong to no sky above the marsh. The ferry is never seen again, but the route you find becomes legend among the dead.",
    choices: [
      {
        label: "Begin again from the ferry",
        next: "intro",
        effects: {
          restart: true,
        },
      },
    ],
  },
  endingName: {
    title: "Ending: The Answering Marsh",
    text:
      "The water stills to hear you. Reeds bend. Bells stop. The thing in the deep gives back every stolen name except its own, and for one moonless hour the drowned rise only to kneel. When the spell breaks, the marsh remembers you as kin.",
    choices: [
      {
        label: "Begin again from the ferry",
        next: "intro",
        effects: {
          restart: true,
        },
      },
    ],
  },
  endingFlee: {
    title: "Ending: The Unpaid Debt",
    text:
      "You leave the moonwell turning in the dark and row for open water before your nerve hardens into folly. The abbey keeps its deepest secret, but you keep your life, your skiff, and enough silver to make the lie sound true when you tell it onshore.",
    choices: [
      {
        label: "Begin again from the ferry",
        next: "intro",
        effects: {
          restart: true,
        },
      },
    ],
  },
  endingDeath: {
    title: "Ending: Sunk Name",
    text:
      "The marsh takes its due. Black water closes over the skiff, the abbey, and the shape you used to call yourself. By morning only the ferry pole drifts above the reeds, tapping once against the stone as if asking to be let in.",
    choices: [
      {
        label: "Begin again from the ferry",
        next: "intro",
        effects: {
          restart: true,
        },
      },
    ],
  },
};

const elements = {
  healthStat: document.getElementById("healthStat"),
  resolveStat: document.getElementById("resolveStat"),
  silverStat: document.getElementById("silverStat"),
  moonwaterStat: document.getElementById("moonwaterStat"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneText: document.getElementById("sceneText"),
  saveState: document.getElementById("saveState"),
  inventoryList: document.getElementById("inventoryList"),
  choicesContainer: document.getElementById("choicesContainer"),
  logList: document.getElementById("logList"),
  endingBadge: document.getElementById("endingBadge"),
  newGameButton: document.getElementById("newGameButton"),
  saveButton: document.getElementById("saveButton"),
  loadButton: document.getElementById("loadButton"),
  loadInput: document.getElementById("loadInput"),
};

function createInitialState() {
  return {
    currentNode: "intro",
    health: 6,
    resolve: 3,
    silver: 2,
    moonwater: 0,
    inventory: ["Ferryman's Pole"],
    flags: {},
    log: ["The ferry leaves shore under a dead moon."],
    ending: null,
    updatedAt: new Date().toISOString(),
  };
}

const loadedState = loadState();
let state = loadedState ?? createInitialState();
render();
if (!loadedState) {
  persistState();
}

elements.newGameButton.addEventListener("click", () => {
  if (!window.confirm("Start over and replace the current autosave?")) {
    return;
  }

  state = createInitialState();
  persistState("A new crossing begins.");
  render();
});

elements.saveButton.addEventListener("click", downloadSaveFile);
elements.loadButton.addEventListener("click", () => elements.loadInput.click());
elements.loadInput.addEventListener("change", importSaveFile);

function choose(index) {
  const node = storyNodes[state.currentNode];
  const availableChoices = node.choices.filter((choice) => isChoiceVisible(choice, state));
  const selectedChoice = availableChoices[index];

  if (!selectedChoice) {
    return;
  }

  const nextState = applyEffects(structuredClone(state), selectedChoice.effects ?? {});

  if (nextState.health <= 0) {
    state = {
      ...createInitialState(),
      currentNode: "endingDeath",
      health: 1,
      resolve: 1,
      silver: 0,
      moonwater: 0,
      inventory: ["Ferryman's Pole"],
      ending: "death",
      log: [
        "The marsh takes its due. Another ferryman's story sinks into the black water.",
      ],
    };
    persistState("The marsh closed over your trail.");
    render();
    return;
  }

  if (selectedChoice.effects?.restart) {
    state = createInitialState();
    persistState("The dead moon rises on a fresh crossing.");
    render();
    return;
  }

  state = {
    ...nextState,
    currentNode: selectedChoice.next,
    updatedAt: new Date().toISOString(),
  };

  persistState();
  render();
}

function applyEffects(nextState, effects) {
  if (typeof effects.health === "number") {
    nextState.health = clamp(nextState.health + effects.health, 0, 9);
  }

  if (typeof effects.resolve === "number") {
    nextState.resolve = clamp(nextState.resolve + effects.resolve, 0, 9);
  }

  if (typeof effects.silver === "number") {
    nextState.silver = Math.max(0, nextState.silver + effects.silver);
  }

  if (typeof effects.moonwater === "number") {
    nextState.moonwater = Math.max(0, nextState.moonwater + effects.moonwater);
  }

  if (effects.inventoryAdd && !nextState.inventory.includes(effects.inventoryAdd)) {
    nextState.inventory.push(effects.inventoryAdd);
  }

  if (effects.flags) {
    nextState.flags = { ...nextState.flags, ...effects.flags };
  }

  if (effects.ending) {
    nextState.ending = effects.ending;
  }

  if (effects.log) {
    nextState.log = [effects.log, ...nextState.log].slice(0, MAX_LOG_ENTRIES);
  }

  return nextState;
}

function render() {
  const node = storyNodes[state.currentNode];
  const availableChoices = node.choices.filter((choice) => isChoiceVisible(choice, state));

  elements.healthStat.textContent = String(state.health);
  elements.resolveStat.textContent = String(state.resolve);
  elements.silverStat.textContent = String(state.silver);
  elements.moonwaterStat.textContent = String(state.moonwater);
  elements.sceneTitle.textContent = node.title;
  elements.sceneText.textContent = node.text;
  elements.saveState.textContent = formatSaveStamp(state.updatedAt);
  elements.endingBadge.hidden = !state.ending;

  renderInventory();
  renderChoices(availableChoices);
  renderLog();
}

function renderInventory() {
  elements.inventoryList.innerHTML = "";

  const entries = state.inventory.length ? state.inventory : ["No relics carried."];
  entries.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    elements.inventoryList.appendChild(listItem);
  });
}

function renderChoices(choices) {
  elements.choicesContainer.innerHTML = "";

  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.textContent = choice.label;
    button.addEventListener("click", () => choose(index));
    elements.choicesContainer.appendChild(button);
  });
}

function renderLog() {
  elements.logList.innerHTML = "";

  state.log.forEach((entry) => {
    const listItem = document.createElement("li");
    listItem.textContent = entry;
    elements.logList.appendChild(listItem);
  });
}

function isChoiceVisible(choice, currentState) {
  return typeof choice.condition !== "function" || choice.condition(currentState);
}

function persistState(message) {
  state.updatedAt = new Date().toISOString();
  window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
  elements.saveState.textContent = message ?? formatSaveStamp(state.updatedAt);
}

function loadState() {
  try {
    const rawState = window.localStorage.getItem(SAVE_STORAGE_KEY);

    if (!rawState) {
      return null;
    }

    const parsedState = JSON.parse(rawState);

    if (!isValidSave(parsedState)) {
      return null;
    }

    return parsedState;
  } catch (error) {
    console.error("Unable to read autosave", error);
    return null;
  }
}

function downloadSaveFile() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    game: "On Dark Moon Waters",
    state,
  };
  const content = JSON.stringify(payload, null, 2);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().replaceAll(":", "-");

  anchor.href = href;
  anchor.download = `${SAVE_FILE_PREFIX}-${stamp}.txt`;
  anchor.click();

  URL.revokeObjectURL(href);
  elements.saveState.textContent = "Save file downloaded.";
}

function importSaveFile(event) {
  const [file] = event.target.files ?? [];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const importedState = parsed.state ?? parsed;

      if (!isValidSave(importedState)) {
        throw new Error("Invalid save format.");
      }

      state = importedState;
      persistState("Imported save restored.");
      render();
    } catch (error) {
      console.error(error);
      window.alert("That save file could not be read.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

function isValidSave(candidate) {
  return Boolean(
    candidate &&
      typeof candidate.currentNode === "string" &&
      storyNodes[candidate.currentNode] &&
      Array.isArray(candidate.inventory) &&
      Array.isArray(candidate.log) &&
      typeof candidate.flags === "object" &&
      typeof candidate.health === "number" &&
      typeof candidate.resolve === "number" &&
      typeof candidate.silver === "number" &&
      typeof candidate.moonwater === "number"
  );
}

function formatSaveStamp(timestamp) {
  if (!timestamp) {
    return "Autosave ready";
  }

  const formatted = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

  return `Autosaved ${formatted}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
