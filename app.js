const SAVE_STORAGE_KEY = "ponderosa-chapter-one-save-v1";
const SAVE_FILE_PREFIX = "ponderosa-chapter-one-save";
const GAME_TITLE = "Ponderosa - Chapter One";

const ATTRIBUTE_LABELS = {
  athleticism: "Athleticism",
  grace: "Grace",
  arcanism: "Arcanism",
  perception: "Perception",
};

const FACTION_LABELS = {
  crown: "The Crown",
  university: "The University",
  apostles: "House of Apostles",
};

const ITEM_DATA = {
  rapier: {
    display: "rapier",
    attribute: "grace",
    firstLabel: "Reach first for the rapier Angelica has already polished. (+2 Grace)",
    secondLabel: "Take the rapier second. (+1 Grace)",
    firstResponse: "The rapier first. If the city wants a performance, it may have precision.",
    secondResponse: "Then the rapier. Precision can come after priorities.",
  },
  longsword: {
    display: "longsword",
    attribute: "athleticism",
    firstLabel: "Reach first for the practice longsword Henry left by the wardrobe. (+2 Athleticism)",
    secondLabel: "Take the longsword second. (+1 Athleticism)",
    firstResponse: "The longsword first. Better to feel the day's weight properly.",
    secondResponse: "Then the longsword. No point going soft before noon.",
  },
  mandolin: {
    display: "mandolin",
    attribute: "arcanism",
    firstLabel: "Reach first for the yew-hewn mandolin resting beside the mirror. (+2 Arcanism)",
    secondLabel: "Take the mandolin second. (+1 Arcanism)",
    firstResponse: "The mandolin first. If the day becomes political, music may yet make it honest.",
    secondResponse: "Then the mandolin. One should never meet clergy unprepared.",
  },
  notebook: {
    display: "notebook",
    attribute: "perception",
    firstLabel: "Reach first for the field notebook with its loose pressed-map corners. (+2 Perception)",
    secondLabel: "Take the notebook second. (+1 Perception)",
    firstResponse: "The notebook first. Someone is lying already, and I would rather know who.",
    secondResponse: "Then the notebook. Someone should remember what is actually said today.",
  },
};

const FIRST_PICK_TEXT = {
  rapier:
    "Eve's fingers find the rapier first, the guard cool and familiar against her palm. Angelica gives the smallest approving nod; if Silver Street insists on producing aristocrats, at least House d'Fontaine has raised one with point control. From the corridor Henry remarks that breakfast duels remain unfashionable in civilized provinces. What does Eve take second?",
  longsword:
    "The practice longsword comes off its rest before anything else, and the movement draws a low laugh from the hall. Henry approves immediately; Angelica does not bother pretending surprise. The blade is heavier than anything polite society expects of a young lady, which is precisely why Eve likes it. What does she take second?",
  mandolin:
    "Eve lifts the mandolin first, thumb brushing the yew body where old warding marks shine faintly in the grain. Angelica exhales through her nose in patient resignation. Henry, from beyond the door, says that if the strings start humming before tea he will consider it an attack. What comes second?",
  notebook:
    "The notebook leaves the dressing table first, already swollen with half-legible field notes and names circled three times. Angelica says that rummaging through facts before breakfast is a terrible habit. Eve replies that it is still better than rummaging through rumors after lunch. What does she take second?",
};

const elements = {
  chapterLabel: document.getElementById("chapterLabel"),
  sectionLabel: document.getElementById("sectionLabel"),
  saveState: document.getElementById("saveState"),
  attributesList: document.getElementById("attributesList"),
  allegiancesList: document.getElementById("allegiancesList"),
  transcript: document.getElementById("transcript"),
  choicesContainer: document.getElementById("choicesContainer"),
  tensionText: document.getElementById("tensionText"),
  newGameButton: document.getElementById("newGameButton"),
  saveButton: document.getElementById("saveButton"),
  loadButton: document.getElementById("loadButton"),
  loadInput: document.getElementById("loadInput"),
};

const NODE_BUILDERS = {
  s1_root: buildSectionOneRoot,
  s1_second: buildSectionOneSecondPick,
  s1_departure: buildSectionOneDeparture,
  s2_root: buildSectionTwoRoot,
  s2_followup: buildSectionTwoFollowup,
  s3_root: buildSectionThreeRoot,
  s3_interruption: buildSectionThreeInterruption,
  s3_return: buildSectionThreeReturn,
  advancement_single: buildAdvancementSingle,
  advancement_double_first: buildAdvancementDoubleFirst,
  advancement_double_second: buildAdvancementDoubleSecond,
  chapter_complete: buildChapterComplete,
};

let state = loadState() ?? createInitialState();
if (!state.transcript.length) {
  appendSystemEntry(getCurrentNode(state));
  persistState();
}
render();

elements.newGameButton.addEventListener("click", () => {
  if (!window.confirm("Restart Chapter One and replace the current autosave?")) {
    return;
  }

  state = createInitialState();
  appendSystemEntry(getCurrentNode(state));
  persistState();
  render();
  elements.saveState.textContent = "Chapter reset and autosaved.";
});

elements.saveButton.addEventListener("click", downloadSaveFile);
elements.loadButton.addEventListener("click", () => elements.loadInput.click());
elements.loadInput.addEventListener("change", importSaveFile);

function createInitialState() {
  return {
    version: 1,
    stage: "s1_root",
    attributes: {
      athleticism: 1,
      grace: 1,
      arcanism: 1,
      perception: 1,
    },
    allegiances: {
      crown: 0,
      university: 0,
      apostles: 0,
    },
    flags: {
      firstPick: null,
      secondPick: null,
      morningApproach: null,
      universityApproach: null,
      universityFollowup: null,
      cathedralGreeting: null,
      interruptionResponse: null,
      advancementMode: null,
      firstAdvance: null,
      secondAdvance: null,
    },
    transcript: [],
    updatedAt: new Date().toISOString(),
  };
}

function buildSectionOneRoot() {
  return {
    id: "s1_root_waking",
    chapterLabel: "Chapter One",
    sectionLabel: "Section I · Silver Street Morning",
    overline: "Section I · Silver Street Morning",
    title: "A Bell Before Dawn",
    focus:
      "Angelica wants Eve dressed and moving before the city can begin making demands.",
    text:
      "Morning gathers pale over Silver Street. The Giene throws a wavering pane of light across the ceiling of House d'Fontaine's old townhouse while bells from the Grand Ponderosán Cathedral count out the hour.\n\nAngelica is already at the wardrobe laying out Eve's riding things in ruthless order, Azzurra has somehow become tangled in the half-cloak again, and Cobalt watches from the window latch with the judgment of a senior clerk. \"Up,\" Angelica says, not unkindly. \"You have the University before noon, a Bishop before supper, and enough rank to make both exhausting.\" Beyond the door Henry's measured footfalls announce that the carriage is already being readied.\n\nWhat does Eve reach for first?",
    choices: Object.entries(ITEM_DATA).map(([itemKey, item]) => ({
      key: `first_${itemKey}`,
      label: item.firstLabel,
      response: item.firstResponse,
      apply(currentState) {
        currentState.flags.firstPick = itemKey;
        boostAttribute(currentState, item.attribute, 2);
        currentState.stage = "s1_second";
      },
    })),
  };
}

function buildSectionOneSecondPick(currentState) {
  const firstPick = currentState.flags.firstPick;
  const remainingItems = Object.entries(ITEM_DATA).filter(([itemKey]) => itemKey !== firstPick);

  return {
    id: `s1_second_${firstPick}`,
    chapterLabel: "Chapter One",
    sectionLabel: "Section I · Silver Street Morning",
    overline: "Section I · Silver Street Morning",
    title: "A Habit Declared",
    focus:
      "The order in which Eve arms herself says nearly as much as anything she might say aloud.",
    text: FIRST_PICK_TEXT[firstPick],
    choices: remainingItems.map(([itemKey, item]) => ({
      key: `second_${itemKey}`,
      label: item.secondLabel,
      response: item.secondResponse,
      apply(nextState) {
        nextState.flags.secondPick = itemKey;
        boostAttribute(nextState, item.attribute, 1);
        nextState.stage = "s1_departure";
      },
    })),
  };
}

function buildSectionOneDeparture(currentState) {
  return {
    id: `s1_departure_${currentState.flags.firstPick}_${currentState.flags.secondPick}`,
    chapterLabel: "Chapter One",
    sectionLabel: "Section I · Silver Street Morning",
    overline: "Section I · Silver Street Morning",
    title: "The Last Quiet Minute",
    focus:
      "The morning can still lean toward scholarship, devotion, command, or mischief before the carriage leaves.",
    text:
      `${describeLoadout(currentState)} Angelica settles the rest of Eve's things into their cases, because even headstrong heiresses must eventually be practical, and Henry appears in a dark travel coat rather than full ceremonial plate with the carriage report already in hand.\n\nThe route to the University will take them from Silver Street through the North Promenade and down into the Boulevard, straight toward the day's first round of competing demands. Before the door shuts, how does Eve spend the final quiet minute of the morning?`,
    choices: [
      {
        key: "morning_briefing",
        label:
          "Have Angelica walk you through the Bishop's invitation before you leave. [Perception 2] [House of Apostles +]",
        response:
          "Angelica, tell me what the Bishop wants before the city has the chance to improvise.",
        requirements: {
          attributes: { perception: 2 },
        },
        apply(nextState) {
          nextState.flags.morningApproach = "briefing";
          shiftAllegiance(nextState, "apostles", 1);
          nextState.stage = "s2_root";
        },
      },
      {
        key: "morning_wards",
        label:
          "Tune the carriage's ward-lanterns yourself while Henry waits by the gate. [Arcanism 2] [The University +]",
        response:
          "Give me the ward pegs. If I am being summoned around the city, I would rather the route be properly charmed.",
        requirements: {
          attributes: { arcanism: 2 },
        },
        apply(nextState) {
          nextState.flags.morningApproach = "wards";
          shiftAllegiance(nextState, "university", 1);
          nextState.stage = "s2_root";
        },
      },
      {
        key: "morning_flourish",
        label:
          "Steal a quick practice pass against Henry's scabbard before the footman can announce the carriage. [Grace 3]",
        response:
          "One pass only, Henry. If I do not move before breakfast, I become insufferable.",
        requirements: {
          attributes: { grace: 3 },
        },
        apply(nextState) {
          nextState.flags.morningApproach = "flourish";
          nextState.stage = "s2_root";
        },
      },
      {
        key: "morning_stride",
        label:
          "Take the stairs two at a time and beat everyone to the gate. [Athleticism 3] [The Crown +]",
        response:
          "If the Governor insists on scheduling my day, he can at least do it at my pace.",
        requirements: {
          attributes: { athleticism: 3 },
        },
        apply(nextState) {
          nextState.flags.morningApproach = "stride";
          shiftAllegiance(nextState, "crown", 1);
          nextState.stage = "s2_root";
        },
      },
      {
        key: "morning_listen",
        label:
          "Let Angelica and Henry brief you while the household folds around the routine.",
        response:
          "Very well. Brief me properly and try not to sound so pleased about it.",
        apply(nextState) {
          nextState.flags.morningApproach = "listen";
          nextState.stage = "s2_root";
        },
      },
    ],
  };
}

function buildSectionTwoRoot(currentState) {
  return {
    id: "s2_root_university_steps",
    chapterLabel: "Chapter One",
    sectionLabel: "Section II · The University",
    overline: "Section II · The University",
    title: "University Steps",
    focus:
      "By the time Eve steps from the carriage, the University, the Church, and the provincial government are already standing in the same square.",
    text:
      `The carriage rolls west from Silver Street, skirts the quiet elegance of the North Promenade, and drops at last into the Boulevard where shopfronts, lecture bills, church placards, and ministry notices all compete for the same walls. By the time Henry steps down and offers Eve his hand at Ponderosán University, the square is already divided between students in ink-stained coats, a pair of provincial constables in the Governor's blue, and chapel sisters carrying sealed correspondence.\n\n${describeArrivalTone(currentState)} Angelica smooths a crease from Eve's sleeve. Henry glances across the quad with the expression of a man counting exits without meaning to.\n\nWhere does Eve turn first?`,
    choices: [
      {
        key: "university_students",
        label:
          "Cross to the students gathered at the gate and hear what the Governor's new levy has done to the faculty. [The University +] [The Crown -]",
        response:
          "The students first. Agitation is always loudest at the precise moment it becomes useful.",
        apply(nextState) {
          nextState.flags.universityApproach = "students";
          shiftAllegiance(nextState, "university", 1);
          shiftAllegiance(nextState, "crown", -1);
          nextState.stage = "s2_followup";
        },
      },
      {
        key: "university_rector",
        label:
          "Go straight with Henry to the rector's office and collect the sealed order waiting there. [The Crown +]",
        response:
          "We take the official route. If the Governor wants something, I prefer to read the wax before I read the man.",
        apply(nextState) {
          nextState.flags.universityApproach = "rector";
          shiftAllegiance(nextState, "crown", 1);
          nextState.stage = "s2_followup";
        },
      },
      {
        key: "university_chapel",
        label:
          "Let Angelica draw you through the university chapel and inspect the Bishop's summons before the audience. [House of Apostles +]",
        response:
          "The summons before the gossip. Angelica, show me what the Bishop thought worth sealing twice.",
        apply(nextState) {
          nextState.flags.universityApproach = "chapel";
          shiftAllegiance(nextState, "apostles", 1);
          nextState.stage = "s2_followup";
        },
      },
    ],
  };
}

function buildSectionTwoFollowup(currentState) {
  const approach = currentState.flags.universityApproach;

  if (approach === "students") {
    return {
      id: "s2_students_petition",
      chapterLabel: "Chapter One",
      sectionLabel: "Section II · The University",
      overline: "Section II · The University",
      title: "The Petition Knot",
      focus:
        "The University wants protection, but everyone in the crowd means something different by the word.",
      text:
        "A cluster of junior lecturers and students closes around Eve the moment they recognize her. Someone pushes a printed notice into her hands: Governor Baptiste Vassal is proposing a provincial levy on private expeditions and a fresh layer of civil review over anything dug from pre-imperial sites.\n\nThe crowd wants a noble voice. Henry wants room to move. Angelica wants the entire square to rediscover moderation.\n\nHow does Eve handle them?",
      choices: [
        {
          key: "students_charter",
          label:
            "Quote the field charter from memory and sort rumor from law. [Perception 2] [The University +]",
          response:
            "Show me the charter. If the Governor is bluffing, I want the exact clause he expects you not to read.",
          requirements: {
            attributes: { perception: 2 },
          },
          apply(nextState) {
            nextState.flags.universityFollowup = "students_charter";
            shiftAllegiance(nextState, "university", 1);
            nextState.stage = "s3_root";
          },
        },
        {
          key: "students_song",
          label:
            "Use a quick mandolin phrase to settle the crowd before anyone starts shouting over the facts. [Arcanism 2] [The University +]",
          response:
            "One note at a time. If you intend to panic, at least do it in key.",
          requirements: {
            attributes: { arcanism: 2 },
          },
          apply(nextState) {
            nextState.flags.universityFollowup = "students_song";
            shiftAllegiance(nextState, "university", 1);
            nextState.stage = "s3_root";
          },
        },
        {
          key: "students_promise",
          label:
            "Promise the dispute will be heard in the right room before the day is over. [The Crown +]",
          response:
            "You will have your answer, but not in a courtyard. Let the officials commit themselves where I can hear them properly.",
          apply(nextState) {
            nextState.flags.universityFollowup = "students_promise";
            shiftAllegiance(nextState, "crown", 1);
            nextState.stage = "s3_root";
          },
        },
      ],
    };
  }

  if (approach === "rector") {
    return {
      id: "s2_rector_desk",
      chapterLabel: "Chapter One",
      sectionLabel: "Section II · The University",
      overline: "Section II · The University",
      title: "Wax and Signatures",
      focus:
        "Every institution in the city has arrived at the rector's desk ahead of Eve.",
      text:
        "Henry gets Eve through the main hall before the gossip can seize her. Inside the rector's office, three seals dominate the desk: the University crest, the Governor's office, and a black-and-white strip from the House of Apostles.\n\nThe rector explains with exhausted courtesy that each party wants Eve committed before the others can name her. Angelica's face gives nothing away. Henry's silence suggests he dislikes every seal equally.\n\nWhat does Eve press first?",
      choices: [
        {
          key: "rector_wording",
          label:
            "Read the Governor's order line by line before accepting anything. [Perception 2] [The Crown +]",
          response:
            "I will not be requisitioned by adjective. Let me see the wording.",
          requirements: {
            attributes: { perception: 2 },
          },
          apply(nextState) {
            nextState.flags.universityFollowup = "rector_wording";
            shiftAllegiance(nextState, "crown", 1);
            nextState.stage = "s3_root";
          },
        },
        {
          key: "rector_charter",
          label:
            "Challenge the order on academic grounds before the ink has time to dry. [Arcanism 2] [The University +]",
          response:
            "If they want relics catalogued, they may start by admitting scholarship has standing.",
          requirements: {
            attributes: { arcanism: 2 },
          },
          apply(nextState) {
            nextState.flags.universityFollowup = "rector_charter";
            shiftAllegiance(nextState, "university", 1);
            nextState.stage = "s3_root";
          },
        },
        {
          key: "rector_pass",
          label:
            "Take the sealed pass, keep the University from losing the whole morning, and move. [The Crown +]",
          response:
            "Give me the pass. If the day intends to be political, let us at least keep it punctual.",
          apply(nextState) {
            nextState.flags.universityFollowup = "rector_pass";
            shiftAllegiance(nextState, "crown", 1);
            nextState.stage = "s3_root";
          },
        },
      ],
    };
  }

  return {
    id: "s2_chapel_summons",
    chapterLabel: "Chapter One",
    sectionLabel: "Section II · The University",
    overline: "Section II · The University",
    title: "The Quiet Chapel",
    focus:
      "Angelica reads the church's intentions with the patience of someone who was formed inside its walls.",
    text:
      "Angelica turns Eve beneath the arcade into the small university chapel, where incense and dust soften the sharpness of the square outside. Bishop Severin Clairmont's invitation waits on the altar rail, countersigned in a neat provincial hand. Someone in the Governor's office wanted the cathedral audience witnessed before it even began.\n\nAngelica studies the seals with the old, exact patience of a matron who spent half her life in abbey halls. Henry remains by the door, more interested in the extra guards across the quad than in the saints.\n\nWhat does Eve press first?",
    choices: [
      {
        key: "chapel_angelica",
        label:
          "Ask Angelica what Bishop Severin actually wants from you. [House of Apostles +]",
        response:
          "Translate the church for me, Angelica. He did not summon me merely to exchange niceties.",
        apply(nextState) {
          nextState.flags.universityFollowup = "chapel_angelica";
          shiftAllegiance(nextState, "apostles", 1);
          nextState.stage = "s3_root";
        },
      },
      {
        key: "chapel_margins",
        label:
          "Read the illuminated margins and hidden citations for yourself. [Perception 2] [House of Apostles +]",
        response:
          "Hold it steady. If there is a second message in the margins, I would like it before the Bishop receives me.",
        requirements: {
          attributes: { perception: 2 },
        },
        apply(nextState) {
          nextState.flags.universityFollowup = "chapel_margins";
          shiftAllegiance(nextState, "apostles", 1);
          nextState.stage = "s3_root";
        },
      },
      {
        key: "chapel_guards",
        label:
          "Ask Henry what the extra guards imply about the Governor's mood. [Grace 2] [The Crown +]",
        response:
          "Henry, stop watching the saints and tell me what the guards are saying without speaking.",
        requirements: {
          attributes: { grace: 2 },
        },
        apply(nextState) {
          nextState.flags.universityFollowup = "chapel_guards";
          shiftAllegiance(nextState, "crown", 1);
          nextState.stage = "s3_root";
        },
      },
    ],
  };
}

function buildSectionThreeRoot(currentState) {
  return {
    id: `s3_root_${currentState.flags.universityApproach}_${currentState.flags.universityFollowup}`,
    chapterLabel: "Chapter One",
    sectionLabel: "Section III · The Palisades",
    overline: "Section III · The Palisades",
    title: "Before the Bishop",
    focus:
      "The cathedral audience looks ceremonial from outside, but every sign in the room suggests negotiation instead.",
    text:
      `From the University the carriage climbs into the Palisades, where the streets widen and every facade behaves as if it expects to be painted. The Grand Ponderosán Cathedral rises over the district like a verdict in pale stone. Angelica stands visibly straighter the closer they draw; Henry becomes quieter in the way he only does when a room matters.\n\nBishop Severin Clairmont receives Eve not in the nave but in a sunlit audience chamber lined with reliquaries, survey maps, and glass-fronted cabinets of recovered fragments. ${describeBishopContext(currentState)}\n\nHow does Eve open the conversation?`,
    choices: [
      {
        key: "greeting_apostles",
        label:
          "Open through Angelica and the old courtesies of the House of Apostles. [House of Apostles +]",
        response:
          "If we are to do this properly, Your Excellency, let us begin by allowing Angelica the respect she is owed in this room.",
        apply(nextState) {
          nextState.flags.cathedralGreeting = "apostles";
          shiftAllegiance(nextState, "apostles", 1);
          nextState.stage = "s3_interruption";
        },
      },
      {
        key: "greeting_university",
        label:
          "Open as a University researcher and name the relic question immediately. [The University +]",
        response:
          "I would rather begin with the dig rights, Bishop, since everyone in Ponderosa seems to be circling them already.",
        apply(nextState) {
          nextState.flags.cathedralGreeting = "university";
          shiftAllegiance(nextState, "university", 1);
          nextState.stage = "s3_interruption";
        },
      },
      {
        key: "greeting_crown",
        label:
          "Open as House d'Fontaine's heir and remind the room you understand provincial obligations. [The Crown +]",
        response:
          "House d'Fontaine has served the province long enough to dislike surprises. Let us be plain with one another.",
        apply(nextState) {
          nextState.flags.cathedralGreeting = "crown";
          shiftAllegiance(nextState, "crown", 1);
          nextState.stage = "s3_interruption";
        },
      },
    ],
  };
}

function buildSectionThreeInterruption(currentState) {
  return {
    id: `s3_interruption_${currentState.flags.cathedralGreeting}`,
    chapterLabel: "Chapter One",
    sectionLabel: "Section III · The Palisades",
    overline: "Section III · The Palisades",
    title: "A Polite Ambush",
    focus:
      "Whatever the audience was meant to be, it has become a contest over who gets to define Eve's usefulness first.",
    text:
      `${describeGreetingOutcome(currentState)} Bishop Severin speaks of recovered shrines, apostolic relics traveling too quickly into private hands, and the need for someone with Eve's learning and name to stand between scholarship and vulgar acquisition.\n\nHe gets no further. The chamber doors open without sufficient announcement and Governor Baptiste Vassal enters with two aides and the confident impatience of a man used to being the newest authority in any room. He wants the same frontier ruins, but under provincial seal and civil commission. Angelica's expression goes flat enough to cut glass. Henry has already shifted a half-step closer to Eve.\n\nWhat does she do?`,
    choices: [
      {
        key: "response_apostles_grace",
        label:
          "Hold the Bishop to his invitation before the Governor can seize the room. [Grace 3] [House of Apostles +]",
        response:
          "Governor, in another moment. The Bishop had the courtesy to summon me first; I intend to let him finish.",
        requirements: {
          attributes: { grace: 3 },
        },
        apply(nextState) {
          nextState.flags.interruptionResponse = "apostles_grace";
          shiftAllegiance(nextState, "apostles", 1);
          nextState.stage = "s3_return";
        },
      },
      {
        key: "response_crown_perception",
        label:
          "Ask the Governor what he wants stripped of ceremony and title. [Perception 2] [The Crown +]",
        response:
          "Spare me the posture, Governor. What does the Crown actually need from me that it cannot obtain elsewhere?",
        requirements: {
          attributes: { perception: 2 },
        },
        apply(nextState) {
          nextState.flags.interruptionResponse = "crown_perception";
          shiftAllegiance(nextState, "crown", 1);
          nextState.stage = "s3_return";
        },
      },
      {
        key: "response_university_arcanism",
        label:
          "Invoke the University's expeditionary charter before either side can claim the relics. [Arcanism 2] [The University +]",
        response:
          "Before either of you names ownership, remember the University still has lawful standing over any proper expedition.",
        requirements: {
          attributes: { arcanism: 2 },
        },
        apply(nextState) {
          nextState.flags.interruptionResponse = "university_arcanism";
          shiftAllegiance(nextState, "university", 1);
          nextState.stage = "s3_return";
        },
      },
      {
        key: "response_apostles_favor",
        label:
          "Use the goodwill you've already built with the House of Apostles and have Angelica clear the chamber. [House of Apostles 2] [House of Apostles +]",
        response:
          "Angelica, if the House of Apostles still keeps order with dignity, now would be a fine time to demonstrate it.",
        requirements: {
          allegiances: { apostles: 2 },
        },
        apply(nextState) {
          nextState.flags.interruptionResponse = "apostles_favor";
          shiftAllegiance(nextState, "apostles", 1);
          nextState.stage = "s3_return";
        },
      },
      {
        key: "response_crown_favor",
        label:
          "Use the deference you've already earned with provincial officials and set Henry to close the doors. [The Crown 2] [The Crown +]",
        response:
          "Henry, the doors. Governor, if you wish to requisition my day, you may at least do it in a room with one conversation in it.",
        requirements: {
          allegiances: { crown: 2 },
        },
        apply(nextState) {
          nextState.flags.interruptionResponse = "crown_favor";
          shiftAllegiance(nextState, "crown", 1);
          nextState.stage = "s3_return";
        },
      },
      {
        key: "response_plain",
        label: "Refuse the pace of the interruption and make both men state their business plainly.",
        response:
          "No one will rush me into service this morning. Start again, both of you, and this time be honest.",
        apply(nextState) {
          nextState.flags.interruptionResponse = "plain";
          nextState.stage = "s3_return";
        },
      },
    ],
  };
}

function buildSectionThreeReturn(currentState) {
  return {
    id: `s3_return_${currentState.flags.cathedralGreeting}_${currentState.flags.interruptionResponse}`,
    chapterLabel: "Chapter One",
    sectionLabel: "Section III · The Palisades",
    overline: "Section III · The Palisades",
    title: "Home After Vespers",
    focus:
      "The first audience of the story is over, and Eve now has to decide what kind of lesson the day leaves behind.",
    text:
      `${describeMeetingOutcome(currentState)}\n\nBy the time the carriage returns to Silver Street, evening has settled blue over the river. Angelica removes Eve's gloves with the careful severity that means she is worried even when she refuses to say so. Henry remains by the hearth rather than the door, which is the closest he comes to admitting the danger has passed.\n\nBetween them, the day reduces itself into a lesson. What does Eve carry forward from it?`,
    choices: [
      {
        key: "advance_single",
        label: "Let the day sharpen one discipline. (+2 to one attribute)",
        response: "One lesson, hard learned, will do more for me than a dozen softer ones.",
        apply(nextState) {
          nextState.flags.advancementMode = "single";
          nextState.flags.secondAdvance = null;
          nextState.stage = "advancement_single";
        },
      },
      {
        key: "advance_double",
        label: "Spread the day across two disciplines. (+1 to two attributes)",
        response: "No single lesson owns the day. I will take two and keep them both.",
        apply(nextState) {
          nextState.flags.advancementMode = "double";
          nextState.flags.firstAdvance = null;
          nextState.flags.secondAdvance = null;
          nextState.stage = "advancement_double_first";
        },
      },
    ],
  };
}

function buildAdvancementSingle() {
  return {
    id: "advancement_single",
    chapterLabel: "Chapter One",
    sectionLabel: "Chapter Close",
    overline: "Chapter Close",
    title: "Choose One Discipline",
    focus:
      "A single sharpened strength will carry extra weight into the next chapter.",
    text:
      "If the day condenses into one hard lesson, where does Eve feel it settle most clearly?",
    choices: Object.entries(ATTRIBUTE_LABELS).map(([attribute, label]) => ({
      key: `single_${attribute}`,
      label: `Sharpen ${label}. (+2 ${label})`,
      response: `${label} takes the lesson whole.`,
      apply(nextState) {
        boostAttribute(nextState, attribute, 2);
        nextState.flags.firstAdvance = attribute;
        nextState.flags.secondAdvance = null;
        nextState.stage = "chapter_complete";
      },
    })),
  };
}

function buildAdvancementDoubleFirst() {
  return {
    id: "advancement_double_first",
    chapterLabel: "Chapter One",
    sectionLabel: "Chapter Close",
    overline: "Chapter Close",
    title: "Choose the First Lesson",
    focus:
      "The first of two smaller gains sets the tone for the second.",
    text:
      "The day offered more than one lesson. Which discipline receives the first increment of that experience?",
    choices: Object.entries(ATTRIBUTE_LABELS).map(([attribute, label]) => ({
      key: `double_first_${attribute}`,
      label: `Take the first lesson in ${label}. (+1 ${label})`,
      response: `${label} takes the first share of the day's instruction.`,
      apply(nextState) {
        boostAttribute(nextState, attribute, 1);
        nextState.flags.firstAdvance = attribute;
        nextState.flags.secondAdvance = null;
        nextState.stage = "advancement_double_second";
      },
    })),
  };
}

function buildAdvancementDoubleSecond(currentState) {
  return {
    id: `advancement_double_second_${currentState.flags.firstAdvance}`,
    chapterLabel: "Chapter One",
    sectionLabel: "Chapter Close",
    overline: "Chapter Close",
    title: "Choose the Second Lesson",
    focus:
      "The second lesson should complement the first rather than repeat it.",
    text:
      `The first lesson has already gone to ${ATTRIBUTE_LABELS[currentState.flags.firstAdvance]}. Where does the second one land?`,
    choices: Object.entries(ATTRIBUTE_LABELS)
      .filter(([attribute]) => attribute !== currentState.flags.firstAdvance)
      .map(([attribute, label]) => ({
        key: `double_second_${attribute}`,
        label: `Take the second lesson in ${label}. (+1 ${label})`,
        response: `${label} receives the second and quieter share of the day's gains.`,
        apply(nextState) {
          boostAttribute(nextState, attribute, 1);
          nextState.flags.secondAdvance = attribute;
          nextState.stage = "chapter_complete";
        },
      })),
  };
}

function buildChapterComplete(currentState) {
  return {
    id: `chapter_complete_${currentState.flags.advancementMode}_${currentState.flags.firstAdvance}_${currentState.flags.secondAdvance}`,
    chapterLabel: "Chapter One Complete",
    sectionLabel: "End of Chapter",
    overline: "End of Chapter",
    title: "Chapter One Complete",
    focus:
      "The day has set the board: the Governor, the Bishop, and the University now all know Eve by how she answered.",
    text:
      `${describeChapterEnd(currentState)}\n\nChapter One is complete. Your progress is cached in the browser, and you can export this save at any time for later import.`,
    choices: [],
  };
}

function getCurrentNode(currentState) {
  const builder = NODE_BUILDERS[currentState.stage];

  if (!builder) {
    throw new Error(`Unknown stage: ${currentState.stage}`);
  }

  return builder(currentState);
}

function choose(choiceKey) {
  const node = getCurrentNode(state);
  const choice = node.choices
    .filter((candidate) => isChoiceAvailable(candidate, state))
    .find((candidate) => candidate.key === choiceKey);

  if (!choice) {
    return;
  }

  appendPlayerEntry(choice.response);
  choice.apply(state);
  persistState();
  appendSystemEntry(getCurrentNode(state));
  persistState();
  render();
}

function appendSystemEntry(node) {
  state.transcript.push({
    id: `${node.id}:${state.transcript.length}`,
    type: "system",
    overline: node.overline,
    title: node.title,
    text: node.text,
  });
}

function appendPlayerEntry(text) {
  state.transcript.push({
    id: `player:${state.transcript.length}`,
    type: "player",
    text,
  });
}

function render() {
  const node = getCurrentNode(state);

  elements.chapterLabel.textContent = node.chapterLabel;
  elements.sectionLabel.textContent = `${node.sectionLabel} — ${node.title}`;
  elements.saveState.textContent = formatSaveStamp(state.updatedAt);
  elements.tensionText.textContent = node.focus;

  renderStatList(elements.attributesList, ATTRIBUTE_LABELS, state.attributes, false);
  renderStatList(elements.allegiancesList, FACTION_LABELS, state.allegiances, true);
  renderTranscript();
  renderChoices(node);

  requestAnimationFrame(() => {
    elements.transcript.scrollTop = elements.transcript.scrollHeight;
  });
}

function renderStatList(container, labels, values, signed) {
  container.innerHTML = "";

  Object.entries(labels).forEach(([key, label]) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const name = document.createElement("dt");
    name.className = "stat-name";
    name.textContent = label;

    const value = document.createElement("dd");
    value.className = "stat-value";
    value.textContent = signed ? formatSigned(values[key]) : String(values[key]);

    row.append(name, value);
    container.appendChild(row);
  });
}

function renderTranscript() {
  elements.transcript.innerHTML = "";

  state.transcript.forEach((entry) => {
    const article = document.createElement("article");
    article.className = `entry ${entry.type === "player" ? "entry-player" : "entry-system"}`;

    if (entry.type === "system") {
      const overline = document.createElement("p");
      overline.className = "entry-overline";
      overline.textContent = entry.overline;

      const title = document.createElement("h3");
      title.className = "entry-title";
      title.textContent = entry.title;

      const text = document.createElement("p");
      text.className = "entry-text";
      text.textContent = entry.text;

      article.append(overline, title, text);
    } else {
      const text = document.createElement("p");
      text.className = "entry-text";
      text.textContent = entry.text;
      article.appendChild(text);
    }

    elements.transcript.appendChild(article);
  });
}

function renderChoices(node) {
  elements.choicesContainer.innerHTML = "";

  const visibleChoices = node.choices.filter((choice) => isChoiceAvailable(choice, state));

  if (!visibleChoices.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "choice-empty";
    emptyState.textContent =
      state.stage === "chapter_complete"
        ? "Chapter One is finished. Export the save or restart when you want another pass."
        : "No choices are available here.";
    elements.choicesContainer.appendChild(emptyState);
    return;
  }

  visibleChoices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice.label;
    button.addEventListener("click", () => choose(choice.key));
    elements.choicesContainer.appendChild(button);
  });
}

function isChoiceAvailable(choice, currentState) {
  if (!choice.requirements) {
    return true;
  }

  const { attributes, allegiances } = choice.requirements;

  if (attributes) {
    const failedAttribute = Object.entries(attributes).some(
      ([attribute, minimum]) => currentState.attributes[attribute] < minimum
    );

    if (failedAttribute) {
      return false;
    }
  }

  if (allegiances) {
    const failedAllegiance = Object.entries(allegiances).some(
      ([faction, minimum]) => currentState.allegiances[faction] < minimum
    );

    if (failedAllegiance) {
      return false;
    }
  }

  return true;
}

function boostAttribute(currentState, attribute, amount) {
  currentState.attributes[attribute] = clamp(
    currentState.attributes[attribute] + amount,
    1,
    10
  );
}

function shiftAllegiance(currentState, faction, amount) {
  currentState.allegiances[faction] = clamp(
    currentState.allegiances[faction] + amount,
    -10,
    10
  );
}

function describeLoadout(currentState) {
  const firstItem = ITEM_DATA[currentState.flags.firstPick].display;
  const secondItem = ITEM_DATA[currentState.flags.secondPick].display;

  return `The ${firstItem} came first and the ${secondItem} second; the order says nearly as much about Eve as any formal introduction. Once the preference is declared, she gathers the rest as well, because Ponderosa has a talent for demanding every version of her before dusk.`;
}

function describeArrivalTone(currentState) {
  const approach = currentState.flags.morningApproach;

  if (approach === "briefing") {
    return "Angelica has already supplied a quiet outline of Bishop Severin's standing, the House of Apostles' likely expectations, and the reasons such invitations are rarely only devotional.";
  }

  if (approach === "wards") {
    return "The carriage lanterns still hold the faint harmonic shimmer of Eve's touch, and Angelica has spent the route pretending not to approve of practical magic done well.";
  }

  if (approach === "flourish") {
    return "Henry is still faintly offended that Eve clipped his scabbard cleanly before sunrise, which means the morning has at least begun honestly.";
  }

  if (approach === "stride") {
    return "Having beaten the household to the gate, Eve arrives with the kind of energy that makes clerks nervous and soldiers attentive.";
  }

  return "Angelica and Henry have spent the route in low disagreement over which summons is more dangerous, which is how Eve knows both of them are worried.";
}

function describeBishopContext(currentState) {
  const approach = currentState.flags.universityApproach;
  const followup = currentState.flags.universityFollowup;

  if (approach === "students") {
    return followup === "students_song"
      ? "Word of the scene at the university gate appears to have reached the cathedral before the carriage did; the Bishop studies Eve with the alert interest one reserves for people who can still a crowd without raising their voice."
      : "The Bishop has plainly heard something of the unrest on campus already, and the presence of survey maps rather than devotional texts makes it clear that his concerns are not confined to the soul.";
  }

  if (approach === "rector") {
    return "There are official copies of both university permits and provincial orders on the side table, which means the cathedral has already been comparing seals before Eve arrived.";
  }

  return followup === "chapel_angelica"
    ? "Angelica's expression says she recognizes more of this room than she likes, and the Bishop receives her with the faint courtesy reserved for someone who once belonged to the same world."
    : "The summons from the chapel is no abstraction now; it has become a room full of artifacts, ledgers, and a Bishop who seems to know exactly how many institutions are tugging at the same thread.";
}

function describeGreetingOutcome(currentState) {
  const greeting = currentState.flags.cathedralGreeting;

  if (greeting === "apostles") {
    return "Bishop Severin acknowledges Angelica first, and the chamber softens by a visible degree. It is not affection, exactly, but the older form of respect that comes from knowing someone's discipline was forged in the same institution as your own.";
  }

  if (greeting === "university") {
    return "The Bishop's interest sharpens the moment Eve leads with the University's claim, as if he expected defiance and finds scholarship more useful. Angelica says nothing; Henry watches both of them like a man anticipating the first thrown object.";
  }

  return "The Bishop answers the name of House d'Fontaine with impeccable grace, but not submission. For one measured exchange the room behaves as though noble standing might actually simplify matters.";
}

function describeMeetingOutcome(currentState) {
  const response = currentState.flags.interruptionResponse;

  if (response === "apostles_grace") {
    return "Grace keeps the Governor from taking the room by sheer momentum. Bishop Severin finishes his case in full, and by the time Governor Vassal is permitted to answer, he is arguing uphill against both courtesy and timing. The House of Apostles leaves the chamber believing Eve can be trusted with more than polite attendance.";
  }

  if (response === "crown_perception") {
    return "Once stripped of ceremony, the Governor admits he wants a d'Fontaine name attached to a provincial recovery commission before the University can claim sole jurisdiction. The honesty does not make him gentler, but it does make him legible, and Eve leaves with the Crown's interest stated aloud instead of hidden behind velvet phrasing.";
  }

  if (response === "university_arcanism") {
    return "The University charter changes the room the instant Eve names it. Bishop and Governor alike are forced to reckon with scholarship as more than a decorative excuse. Henry looks relieved for the first time all afternoon; Angelica looks annoyed that legal literacy remains so effective.";
  }

  if (response === "apostles_favor") {
    return "Angelica steps into the old cadence of the House of Apostles as if she had never left it. The aides withdraw, the doors close, and the Governor learns the unpleasant distinction between entering a room and owning it. The Bishop notices. So does Eve.";
  }

  if (response === "crown_favor") {
    return "Henry shuts the doors with the grave obedience of a knight acting under a noble command, and Governor Vassal accepts the correction because by then refusing it would cost him more authority than yielding. The Crown does not become kinder, but it does become more willing to negotiate on Eve's terms.";
  }

  return "For one long and dangerous minute Eve refuses everyone else's tempo, and the room is forced to reset around her. Neither Bishop nor Governor gets the clean victory he expected, but both are left certain that House d'Fontaine's heir is not a piece to be moved without consent.";
}

function describeChapterEnd(currentState) {
  const strongestFaction = getStrongestFaction(currentState.allegiances);
  const advancementText = describeAdvancement(currentState);

  const factionLine = strongestFaction
    ? `${FACTION_LABELS[strongestFaction]} carries the strongest impression of the day, though the others have not withdrawn their claims.`
    : "No faction owns the day outright yet, which may be the most useful outcome Eve could have asked for.";

  return `Night settles over Silver Street and the household finally exhales. ${factionLine} ${advancementText}`;
}

function describeAdvancement(currentState) {
  if (currentState.flags.advancementMode === "single") {
    return `${ATTRIBUTE_LABELS[currentState.flags.firstAdvance]} has been sharpened the hard way and will carry into the next chapter.`;
  }

  return `${ATTRIBUTE_LABELS[currentState.flags.firstAdvance]} and ${ATTRIBUTE_LABELS[currentState.flags.secondAdvance]} now bear the clearest imprint of the day.`;
}

function getStrongestFaction(allegiances) {
  const sorted = Object.entries(allegiances).sort((left, right) => right[1] - left[1]);

  if (!sorted.length || sorted[0][1] <= 0) {
    return null;
  }

  return sorted[0][0];
}

function persistState() {
  state.updatedAt = new Date().toISOString();
  window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const rawState = window.localStorage.getItem(SAVE_STORAGE_KEY);

    if (!rawState) {
      return null;
    }

    const parsedState = JSON.parse(rawState);
    return isValidSave(parsedState) ? normalizeState(parsedState) : null;
  } catch (error) {
    console.error("Unable to load local save.", error);
    return null;
  }
}

function downloadSaveFile() {
  const payload = {
    version: 1,
    game: GAME_TITLE,
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().replaceAll(":", "-");

  anchor.href = url;
  anchor.download = `${SAVE_FILE_PREFIX}-${stamp}.txt`;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(url), 0);
  elements.saveState.textContent = "Save exported just now.";
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

      state = normalizeState(importedState);
      if (!state.transcript.length) {
        appendSystemEntry(getCurrentNode(state));
      }
      persistState();
      render();
      elements.saveState.textContent = "Imported save restored.";
    } catch (error) {
      console.error(error);
      window.alert("That save file could not be imported.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

function isValidSave(candidate) {
  return Boolean(
    candidate &&
      typeof candidate.version === "number" &&
      typeof candidate.stage === "string" &&
      NODE_BUILDERS[candidate.stage] &&
      candidate.attributes &&
      candidate.allegiances &&
      candidate.flags &&
      Array.isArray(candidate.transcript) &&
      Object.keys(ATTRIBUTE_LABELS).every(
        (attribute) => typeof candidate.attributes[attribute] === "number"
      ) &&
      Object.keys(FACTION_LABELS).every(
        (faction) => typeof candidate.allegiances[faction] === "number"
      )
  );
}

function normalizeState(candidate) {
  return {
    ...candidate,
    flags: {
      ...createInitialState().flags,
      ...candidate.flags,
    },
  };
}

function formatSaveStamp(timestamp) {
  if (!timestamp) {
    return "Autosave ready.";
  }

  return `Autosaved ${new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp))}`;
}

function formatSigned(value) {
  return value > 0 ? `+${value}` : String(value);
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}
