import type { SceneWeaverResult, RefinementAction } from "@/types/sceneweaver";

// ── SceneWeaver — Mock/Fallback Data ───────────────────────────────────────
// Used when no AI provider is configured or as development fallback.

type MockScene = Omit<SceneWeaverResult, "prompt">;

// ── Scene 1: Train Station Goodbye ──────────────────────────────────────────

const TRAIN_STATION: MockScene = {
  title: "The Weight of Staying",
  sceneSummary: {
    logline:
      "Two figures stand on a rain-slicked platform as the last train pulls away — neither moves to board it, and neither speaks about why.",
    emotionalCore:
      "The ache of choosing to feel nothing because feeling everything would break you.",
    worldIn2Words: "numb departure",
  },
  emotionalArc: {
    opening:
      "It starts in the body — a heaviness in the coat, wet shoes, the particular exhaustion of having already decided.",
    tension:
      "The train arrives and the moment contracts. Everything that was ambient becomes specific: the hiss of brakes, a breath held too long.",
    peak:
      "The doors open, and neither person moves. The platform empties around them. The camera holds. The absence of action becomes the loudest thing in the scene.",
    resolution:
      "The train pulls away. The platform lights flicker once. One of them turns, not toward the other, but toward the exit. It is not a goodbye — it is a slow, quiet erosion.",
  },
  narrativeTension: {
    centralConflict:
      "The desire to feel versus the self-preservation of numbness. Both characters have already grieved this ending — they are now performing the formality of it.",
    subtext:
      "Every gesture is a negotiation with memory. The way one adjusts a bag strap, the way the other looks at the departures board instead of at them.",
    stakes:
      "If either one speaks honestly, the careful architecture of their emotional distance will collapse.",
  },
  visualLanguage: {
    dominantImagery: [
      "Condensation on train windows catching sodium light",
      "A hand in a coat pocket, fingers curled around nothing",
      "Platform edge reflected in a shallow puddle",
      "Overhead fluorescents humming in an empty waiting room",
      "A scarf end caught by the train's departing draft",
      "Two parallel sets of footprints on wet concrete, slowly dissolving",
    ],
    motionQuality:
      "Everything moves at the speed of reluctance. Slow turns, delayed reactions, the particular weight of someone who has rehearsed this moment so many times that the real version feels like a copy.",
    textureNotes:
      "Wet wool, brushed steel handrails dulled by hands, the cracked leather of a watch strap. Everything is tactile and slightly worn — surfaces that carry the memory of repeated contact.",
  },
  cameraDirection: {
    style:
      "Locked-off with occasional slow drift. Think Chung-hoon Chung shooting for Park Chan-wook — precision that contains emotional devastation. No handheld. No urgency. The stillness is the point.",
    keyShots: [
      "Wide: two figures on an empty platform, dead centre, balanced like a diptych. 40mm anamorphic. Locked.",
      "Close-up: back of a neck, just below the hairline. Shallow focus. A single droplet of rain traces the skin. 85mm.",
      "Insert: two train tickets on a bench, side by side, both unused. Top-down. Macro lens.",
      "Medium: one figure reflected in the dark window of the departing train. The reflection stretches and distorts as the train accelerates. 50mm, Steadicam drift.",
      "Final: extreme wide of the empty platform. Hold for 8 seconds after the last figure exits frame. 24mm.",
    ],
    movement:
      "The camera is patient. It arrives before the characters and stays after they leave. It does not follow — it observes, like a witness with no stake in the outcome.",
  },
  lightingAndColour: {
    mood:
      "Low-key, predominantly practical sources. The scene is lit by the infrastructure of departure — platform lights, digital displays, the fading glow of the train itself.",
    keyLightSources: [
      "Sodium vapour platform lights — warm amber wash from above",
      "LED departures board casting cold blue-white on one face",
      "The departing train's interior glow, pulling warm light across the platform as it leaves",
      "A single vending machine at the platform edge — the only saturated light source",
      "Phone screen in a pocket, briefly illuminating fabric texture",
    ],
    contrast:
      "High contrast, deep shadows. Faces are half-lit. The emotional register is in what the light doesn't reach.",
    palette: [
      "Sodium amber",
      "Rain-wet charcoal",
      "Departures-board blue",
      "Cigarette filter beige",
      "Bruise violet",
      "Steel wool grey",
      "Nicotine yellow",
    ],
    temperature:
      "Predominantly cool with isolated pockets of sickly warmth. The amber is never comforting — it is the colour of institutional lighting, not firelight.",
    grade:
      "Desaturated mid-tones, crushed blacks with a slight blue lift. Think the grade on In the Mood for Love if it were set in a Northern European city. Skin tones left slightly cool.",
  },
  soundTexture: {
    ambience: [
      "Distant platform announcement — words indistinct, just the cadence of departure",
      "Rain on the metal canopy overhead — irregular, percussive",
      "The electric hum of departures board updating",
      "Coat fabric against a metal railing as someone shifts weight",
      "A single set of footsteps receding on wet concrete",
      "The low drone of the departing train fading into subsonic",
    ],
    musicDirection:
      "If there is music, it enters late and leaves early. Something in the territory of Jonny Greenwood's score for Phantom Thread — strings that ache without sentimentality. Or nothing at all.",
    silenceNotes:
      "Silence is structural. The longest silence should fall in the 4 seconds after the train doors close and before it moves. That silence is the scene.",
  },
  pacingAndRhythm: {
    overallTempo:
      "Glacial. Each beat is held 30% longer than comfort allows. The audience should feel time the way the characters do — as something heavy that is passing whether you want it to or not.",
    editStyle:
      "Long takes. Minimal cuts within the core scene. When cuts happen, they are precise — match cuts on gesture, not on action. The edit breathes the way a person breathes when trying not to cry.",
    breathingRoom:
      "The scene exhales in the final platform wide shot. Everything before it has been held breath.",
  },
  motifsAndSymbolism: {
    motifs: [
      "Unused tickets — decisions made and un-made",
      "Reflections in wet surfaces — distorted doubles, the self we show to others",
      "The departing train — time moving regardless of emotional readiness",
      "Fluorescent flicker — the unreliability of seeing clearly",
      "Parallel lines (tracks, platform edges, rain streaks) — proximity without convergence",
    ],
    symbolism:
      "The station is a liminal space — neither arrival nor departure, but the moment between. The characters are already gone from each other; the physical leaving is a formality.",
    recurringElements:
      "The sound of the departures board updating recurs three times. Each time, the character closest to it turns slightly toward it — a reflex, as if their own departure is being announced.",
  },
  alternateDirections: [
    {
      title: "Delayed Reunion",
      angle:
        "Re-read the scene as two people who haven't seen each other in years, meeting by accident on this platform. The numbness is not about ending — it is about the impossibility of beginning again.",
      shift: "The emotional weight shifts from grief to possibility crushed by realism.",
    },
    {
      title: "Internal Monologue",
      angle:
        "Both figures are the same person — a scene about self-separation, the moment you become estranged from your own emotional life. One version boards the train, one stays.",
      shift: "The scene becomes a psychological interior rather than a relational exterior.",
    },
    {
      title: "Post-Catastrophe Calm",
      angle:
        "Something enormous has just happened — offscreen, before the scene begins. This is not a goodbye between two people, but two survivors in the aftermath.",
      shift: "The stakes become existential rather than intimate.",
    },
  ],
  dialogueTone: {
    style:
      "Minimal, almost whispered. When characters speak, they say factual things that carry emotional weight — the time of the next train, whether it is still raining.",
    sampleLine: '"The 23:40 is the last one." (Beat.) "I know."',
    silenceVsDialogue:
      "80% silence. Dialogue surfaces only when silence becomes unbearable, and disappears before it resolves anything.",
  },
  adaptationModes: [
    {
      format: "Music Video",
      description:
        "A durational video that begins at the platform and never leaves it. The camera finds details — hands, reflections, rain, light — while two figures remain at the edge of frame.",
      twist: "The figures never face each other. The viewer realises they may not even know each other.",
    },
    {
      format: "Short Film (12 min)",
      description:
        "A two-hander with no flashbacks. The entire film takes place on the platform in real time. Dialogue surfaces in the final three minutes.",
      twist: "The final line reveals the meeting was planned — they have been performing spontaneity.",
    },
    {
      format: "Fashion Film",
      description:
        "A campaign film for winter outerwear. The garments become characters — the weight of a coat, the way a scarf catches wind. No dialogue, no product shots.",
      twist: "The final shot rack focuses to the garment label, half-hidden at the collar.",
    },
    {
      format: "Photo Essay",
      description:
        "A 12-image series on medium format film. Grain, shallow depth, available light only. Each image is a single detail — never a full figure.",
      twist: "The final image is the empty platform, shot from the POV of the departing train.",
    },
  ],
  tags: ["nocturnal", "slow burn", "practical lighting", "two-hander", "liminal space", "non-verbal", "muted grief"],
  followUpPrompts: [
    "What if this scene took place at dawn instead of night — how does hope change the frame?",
    "Rewrite as a single unbroken 4-minute Steadicam shot through an airport terminal",
    "Explore the same emotional core but set in a Tokyo convenience store at 3am",
    "Push into magical realism — the train never arrives, the platform slowly floods with light",
  ],
};

// ── Scene 2: Fire Escape at Midnight ────────────────────────────────────────

const FIRE_ESCAPE: MockScene = {
  title: "Borrowed Warmth",
  sceneSummary: {
    logline:
      "Two strangers share a cigarette on a fire escape during a citywide blackout — the only light is the ember and the distant glow of emergency vehicles.",
    emotionalCore:
      "The terrifying intimacy of being honest with someone you'll never see again.",
    worldIn2Words: "dark confessional",
  },
  emotionalArc: {
    opening:
      "Discomfort. Two people who don't know each other, forced into proximity by circumstance. The city has gone quiet in a way it never does.",
    tension:
      "One of them starts talking — not to the other, but to the dark. The other listens without turning. The conversation becomes confessional by accident.",
    peak:
      "A detail is shared that is too real, too specific. The silence that follows is not awkward — it is sacred. Neither person looks at the other.",
    resolution:
      "The lights come back on, block by block, approaching like a wave. They exchange a look — the only one — and the spell breaks. One goes inside. The other stays.",
  },
  narrativeTension: {
    centralConflict:
      "The freedom of anonymity versus the human hunger for witness. Both characters use the darkness as permission to be seen.",
    subtext:
      "The blackout is not just electrical — it is the suspension of social performance. In the dark, you can say things that daylight would never allow.",
    stakes:
      "The returning light threatens to restore the walls that darkness dissolved.",
  },
  visualLanguage: {
    dominantImagery: [
      "A cigarette ember tracing a slow arc in total darkness",
      "Silhouettes against a skyline of dead windows",
      "Emergency vehicle lights painting the building in rotating red-blue",
      "Breath visible in cold air, backlit by nothing",
      "A phone screen, face-down on metal grating, vibrating silently",
      "The city lights returning, one grid block at a time, like a sunrise made of sodium",
    ],
    motionQuality:
      "Barely perceptible. The only movement is breathing, smoking, and the slow rotation of distant emergency lights. Stillness is the visual register.",
    textureNotes:
      "Rusted fire escape metal under bare hands. The rough weave of a borrowed jacket. Cold air. The gritty surface sounds of a city sleeping involuntarily.",
  },
  cameraDirection: {
    style:
      "Extremely tight framing in near-total darkness. Think Bradford Young's work on Arrival — shapes suggested by absence of light. The camera should feel like another person sharing the fire escape.",
    keyShots: [
      "Extreme close-up: a cigarette ember in pure black. Slow rack focus reveals the faint outline of a face behind it. 100mm macro.",
      "Wide (overhead): the fire escape as a geometry of metal lines. Two small figures, visible only as heat signatures would be. Drone, 14mm.",
      "Medium: one figure in profile, lit only by distant emergency vehicle light — the face strobes between visibility and shadow. 50mm, locked.",
      "Insert: two hands on the railing, close but not touching. The space between them is the entire frame. 85mm, shallow.",
      "Final: the window behind them fills with warm apartment light. Their silhouettes are suddenly legible. Hold. 35mm.",
    ],
    movement:
      "The camera does not move until the lights return. When it finally shifts, it is a slow pan — as if the camera itself is reluctantly leaving the darkness.",
  },
  lightingAndColour: {
    mood:
      "Near-total darkness with isolated practical sources. The blackout is not just a setting — it is the lighting design. Light is scarce, precious, and temporary.",
    keyLightSources: [
      "Cigarette ember — the warmest, most intimate source",
      "Distant emergency vehicle lights — cold, rotating, impersonal",
      "A candle in a window three floors below — barely visible, warm",
      "Phone notification glow from a pocket — brief, clinical blue-white",
      "The returning power grid — harsh, fluorescent, unwelcome",
    ],
    contrast:
      "Extreme. Most of the frame is pure black. Detail exists only in fragments — a chin lit by ember glow, an ear catching reflected emergency light.",
    palette: [
      "Absolute black",
      "Ember orange",
      "Emergency red-blue strobe",
      "Candle glow amber",
      "Phone notification blue",
      "Returning-power fluorescent white",
    ],
    temperature:
      "Begins warm (ember, candle, body heat) and ends cold (fluorescent, clinical, exposed).",
    grade:
      "Pushed deep into underexposure. The grade should feel like the film was shot at the absolute edge of the sensor's capability. Noise becomes texture. Think Chivo's night work on The Revenant.",
  },
  soundTexture: {
    ambience: [
      "The eerie silence of a city without electricity — no hum, no refrigerators, no streetlights buzzing",
      "Distant sirens, multiple directions, echoing off dead buildings",
      "The particular creak of a fire escape expanding in cold air",
      "A lighter clicking — three attempts before it catches",
      "Someone laughing in a dark apartment below, muffled and strange",
    ],
    musicDirection:
      "No score. The city in blackout is the score. If anything, the faintest hint of Grouper or Julianna Barwick — voices that exist at the edge of perception.",
    silenceNotes:
      "The silence is the character. A city of 8 million people, suddenly quiet enough to hear someone breathe on a fire escape. That wrongness is the emotional texture.",
  },
  pacingAndRhythm: {
    overallTempo:
      "Real-time. The scene unfolds at the pace of a conversation that nobody planned to have. Long pauses are not edited down — they are the point.",
    editStyle:
      "Invisible cuts. Long takes that feel continuous. When you realise a cut has happened, you can't identify where. The edit disappears into the darkness.",
    breathingRoom:
      "Every beat is breathing room. The scene is one long exhale.",
  },
  motifsAndSymbolism: {
    motifs: [
      "The cigarette as shared ritual — permission to be present",
      "Darkness as a confessional screen",
      "The returning light as loss of innocence",
      "Emergency vehicles as ambient threat — the world continuing without you",
      "Metal grating patterns — grids, structure, things that hold you above the void",
    ],
    symbolism:
      "The blackout strips the city to its emotional core, the same way the conversation strips both characters to theirs. When the lights return, the construction goes back up.",
    recurringElements:
      "The cigarette is passed three times. Each pass marks a new depth of honesty. The third pass is the moment of real vulnerability.",
  },
  alternateDirections: [
    {
      title: "The Neighbours",
      angle:
        "These two know each other — they've shared a fire escape wall for years but never spoken. The blackout is the excuse they've been waiting for.",
      shift: "The scene becomes about courage delayed rather than spontaneous intimacy.",
    },
    {
      title: "After the Call",
      angle:
        "One character has just received devastating news by phone. The other came outside for air. The stranger becomes an accidental grief counsellor.",
      shift: "The emotional weight becomes asymmetric — one carries, one receives.",
    },
    {
      title: "Last Night in the City",
      angle:
        "One of them is leaving tomorrow — moving across the country. The blackout is their private farewell to the city itself. The stranger is just the city's voice.",
      shift: "The scale expands from two people to an entire relationship with a place.",
    },
  ],
  dialogueTone: {
    style:
      "Halting, then flowing, then halting again. Sentences start in the middle. Neither person bothers with context or backstory. They speak in present tense.",
    sampleLine:
      '"I keep meaning to quit." (Inhale.) "I keep meaning to do a lot of things."',
    silenceVsDialogue:
      "60/40 silence. But the dialogue is never performative — it is the sound of someone thinking out loud near someone else.",
  },
  adaptationModes: [
    {
      format: "Podcast Drama",
      description:
        "Pure audio. No narration. Just two voices in the dark and the ambient sound of a blacked-out city. The listener becomes the fire escape.",
      twist: "The recording quality shifts — as if one character is recording on their phone, secretly.",
    },
    {
      format: "Installation Art",
      description:
        "A dark room with two chairs and a cigarette smell. Audio plays from speakers mounted at sitting height. Visitors experience the scene as a body, not a screen.",
      twist: "At 8 minutes, the room lights slowly come on. The spell breaks for the visitor too.",
    },
    {
      format: "Animated Short",
      description:
        "Rotoscope animation in near-total black. Only the edges of forms are traced in light. The cigarette ember is the only colour.",
      twist: "When the lights return, the animation becomes full colour — overwhelming and unwelcome.",
    },
  ],
  tags: ["blackout", "strangers", "confessional", "urban intimacy", "ember light", "real-time", "quiet devastation"],
  followUpPrompts: [
    "The same fire escape, but it's July and suffocatingly hot. A heatwave instead of a blackout.",
    "What if one of them speaks a different language? The connection happens without translation.",
    "Push into surrealism — the blackout never ends. The city stays dark. They stay on the fire escape.",
    "Adapt as a two-person stage play. No set, no props, just two actors and a single light.",
  ],
};

// ── Scene 3: Dancer in a Warehouse ──────────────────────────────────────────

const WAREHOUSE_DANCER: MockScene = {
  title: "The Break in the Body",
  sceneSummary: {
    logline:
      "A dancer rehearses alone in an industrial warehouse — the choreography keeps breaking down at the exact same moment, as if the body remembers something the mind won't name.",
    emotionalCore:
      "The violence of muscle memory — the body storing what the heart has archived.",
    worldIn2Words: "stored grief",
  },
  emotionalArc: {
    opening:
      "Precision. The movement is clean, controlled, almost mechanical. This is a person who has disciplined their body into a language. The warehouse is empty. The floor is dusty.",
    tension:
      "The sequence begins to fragment. At the same eight-count every time, something disrupts — a hesitation, a stumble, a flinch that isn't choreographed. The dancer resets. Begins again.",
    peak:
      "The body finally wins. The choreography dissolves into something raw and unplanned — movement that is not dance but grief expressing itself through the only vocabulary this person has.",
    resolution:
      "Stillness. The dancer on the floor, breathing. The warehouse holds the sound. Then, slowly, the dancer stands and begins the sequence again — from the top. But differently now.",
  },
  narrativeTension: {
    centralConflict:
      "Control versus release. The dancer has built an identity on precision, and the body is staging a revolt — demanding to feel what has been choreographed over.",
    subtext:
      "The dance was made for someone. The someone is gone. The body knows this. The dancer is still performing as if they're watching.",
    stakes:
      "If the dancer lets the sequence complete without breaking, they lose the last physical trace of what this movement meant.",
  },
  visualLanguage: {
    dominantImagery: [
      "Dust particles suspended in a column of warehouse light",
      "Pointe shoes leaving clean arcs on a dusty concrete floor",
      "A phone propped against a wall, playing the music, screen cracked",
      "Shadow of the dancer, distorted and enormous on corrugated metal",
      "Sweat pooling in the hollow of a collarbone",
      "An industrial chain hanging from a ceiling beam, swaying slightly in the draft created by movement",
    ],
    motionQuality:
      "Sharp and controlled, then increasingly irregular. The body code-switches between training and instinct. Movement becomes a language breaking its own grammar.",
    textureNotes:
      "Raw concrete dust, industrial rust, the sheen of sweat on skin. Athletic tape fraying at the edges. Everything in the space is hard surfaces — the body is the only soft thing.",
  },
  cameraDirection: {
    style:
      "Observational at first — wide and distant, almost surveillance-like. As the emotional register shifts, the camera closes in and begins to move with the body, not around it.",
    keyShots: [
      "Establishing: extreme wide of the warehouse. The dancer is a small figure near the centre. 16mm, locked on tripod. Hold for 30 seconds before the first movement.",
      "Tracking: camera at floor level, moving laterally with the dancer's feet. We see only legs and floor and dust. 35mm on dolly.",
      "Close-up: the hand that breaks the sequence — the moment of dysfunction, shot on the third repetition. 100mm, handheld.",
      "Overhead: dancer on the floor after the breakdown. Body in foetal position. The floor around them is marked with footprints and sweat. Drone, 24mm.",
      "Final: the same wide as the opening. But the dancer's posture has changed — something in the spine is different. 16mm. The sequence begins again.",
    ],
    movement:
      "The camera earns its closeness. It starts far away and only approaches as the dancer's control slips. By the breakdown, the camera and the body are in the same rhythm.",
  },
  lightingAndColour: {
    mood:
      "A single massive source — afternoon sun through warehouse skylights, diffused by decades of grime. The light is geological. It doesn't care about the performance.",
    keyLightSources: [
      "Skylight sun — a thick column of dusty gold, angled across the floor",
      "Bounce light from bare concrete walls — cool, diffuse, flat",
      "Phone screen glow when the music restarts — small and clinical",
      "An open loading dock door at the far end — blown-out white rectangle",
    ],
    contrast:
      "The skylight column creates a natural spotlight. Inside it: warm, detailed, alive. Outside it: cool, flat, abandoned. The dancer moves between these two worlds.",
    palette: [
      "Warehouse dust gold",
      "Concrete grey",
      "Sweat-sheen silver",
      "Athletic tape white",
      "Industrial rust",
      "Loading-dock blown white",
    ],
    temperature:
      "Warm inside the light column, cool in the shadows. The body temperature of the scene rises as the dancer's emotional temperature rises.",
    grade:
      "Lifted shadows, desaturated everything except the skin. Think the palette of Pina Bausch documentary footage — where the body is the only colour that matters.",
  },
  soundTexture: {
    ambience: [
      "The music — a piano piece, repetitive, slightly too fast for the choreography",
      "Feet on concrete — the sharp slap of impact, the scrape of a pivot",
      "Breathing that escalates from controlled to ragged",
      "The creak of the warehouse structure expanding in afternoon heat",
      "Birds in the rafters, disturbed by sudden movement",
    ],
    musicDirection:
      "The rehearsal music is diegetic — a phone speaker, tinny and small in the vast space. When the breakdown happens, the music continues playing but the dancer has stopped moving to it. The gap between music and body is the emotional space.",
    silenceNotes:
      "The moment after the dancer falls. The music is still playing from the phone. The dancer is still. That gap — movement ended, music continuing — is unbearable.",
  },
  pacingAndRhythm: {
    overallTempo:
      "Repetitive. The same sequence three times, each with escalating dysfunction. The repetition is not boring — it is a pressure build. The audience knows the break is coming but not what it will look like.",
    editStyle:
      "Cuts match the rhythm of the choreography in the first two attempts. On the third, the edit detaches — it starts to find its own rhythm, independent of the music.",
    breathingRoom:
      "The overhead shot of the dancer on the floor. The camera holds. The dust settles. The music plays. Nothing moves.",
  },
  motifsAndSymbolism: {
    motifs: [
      "Repetition as ritual — the sequence as a prayer that keeps breaking",
      "Dust as memory — particles disturbed by movement, settling again",
      "The phone as audience — the absent witness, the person this was for",
      "The skylight as judgement — light that illuminates without warming",
    ],
    symbolism:
      "The warehouse is an interior. Not a building — a psychological space. The dancer has come here to rehearse something that cannot be performed. The choreography is a container for a feeling that has no other form.",
    recurringElements:
      "The eight-count where the break occurs. Each repetition, the body arrives at this moment and something different happens — hesitation, then flinch, then collapse. The eighth beat is a door the body can't walk through.",
  },
  alternateDirections: [
    {
      title: "The Understudy",
      angle:
        "The dancer is learning someone else's choreography — someone who is injured, or dead, or simply gone. Every break in the sequence is a moment where their body refuses the other person's movement.",
      shift: "The conflict becomes between two bodies, one present and one absent.",
    },
    {
      title: "The Audition Tape",
      angle:
        "The phone is recording. This is an audition for something. The dancer is trying to produce a clean take and failing. The stakes become professional alongside personal.",
      shift: "A second layer of performance anxiety enters — being watched through a lens.",
    },
  ],
  dialogueTone: {
    style:
      "No dialogue. The only voice is the dancer's breathing and the occasional whispered count — 'five, six, seven, eight' — that becomes less audible with each repetition.",
    sampleLine:
      '"... seven, eight—" (The body stops. The count dies in the throat.)',
    silenceVsDialogue:
      "95% silence. The 5% is breathing and counting. The body is the entire dialogue.",
  },
  adaptationModes: [
    {
      format: "Dance Film",
      description:
        "Shot in a single afternoon, in a real warehouse, with a real dancer who has been told only the emotional situation. The choreography is improvised. The camera follows.",
      twist: "No rehearsal. The breakdown is real because the dancer discovers it in the moment.",
    },
    {
      format: "VR Experience",
      description:
        "The viewer stands in the warehouse. The dancer rehearses around them, through them. The viewer can't move but can look in any direction.",
      twist: "In the breakdown moment, the dancer looks directly into the viewer's eyes.",
    },
  ],
  tags: ["solo", "physical", "repetition as grief", "industrial light", "body memory", "silent", "dust and sweat"],
  followUpPrompts: [
    "What if the music stops mid-sequence and the dancer has to find the rhythm in their own body?",
    "Two dancers, same warehouse, same choreography, but they never rehearse at the same time — only traces remain.",
    "Push into body horror — the eighth count causes a physical transformation, not just a break.",
  ],
};

// ── Scene picker ────────────────────────────────────────────────────────────

const MOCK_POOL: { keywords: string[]; scene: MockScene }[] = [
  { keywords: ["fire escape", "blackout", "strangers", "cigarette", "smoke"], scene: FIRE_ESCAPE },
  { keywords: ["dancer", "warehouse", "rehearse", "choreography", "dance"], scene: WAREHOUSE_DANCER },
];

function pickBaseScene(prompt: string): MockScene {
  const lower = prompt.toLowerCase();
  for (const { keywords, scene } of MOCK_POOL) {
    if (keywords.some((k) => lower.includes(k))) return scene;
  }
  return TRAIN_STATION;
}

function cloneScene(scene: MockScene): MockScene {
  return JSON.parse(JSON.stringify(scene)) as MockScene;
}

function dedupeStrings(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function parseExistingContext(existingContext?: string): MockScene | null {
  if (!existingContext) return null;
  try {
    const parsed = JSON.parse(existingContext) as Partial<SceneWeaverResult>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.sceneSummary || !parsed.emotionalArc || !parsed.cameraDirection) return null;

    const { prompt: _prompt, ...scene } = parsed as SceneWeaverResult;
    return cloneScene(scene);
  } catch {
    return null;
  }
}

function applyRefinement(scene: MockScene, refinement: RefinementAction): MockScene {
  const next = cloneScene(scene);

  switch (refinement) {
    case "darker": {
      next.title = `After Midnight, ${next.title}`;
      next.sceneSummary.emotionalCore = `${next.sceneSummary.emotionalCore} The emotional center now leans into dread, suppression, and moral fog.`;
      next.visualLanguage.motionQuality = "Movement is withheld and heavy. Bodies pause before committing, as if every action has a cost.";
      next.lightingAndColour.mood = "Lighting falls off aggressively. Faces are frequently half-lost to shadow; practicals feel unstable and sparse.";
      next.lightingAndColour.palette = dedupeStrings([
        "tar black",
        "bruise blue",
        "oxidized amber",
        ...next.lightingAndColour.palette,
      ]).slice(0, 7);
      next.soundTexture.musicDirection = "Low-frequency pressure dominates. Sparse, ominous tones or near-silence with threatening room tone.";
      next.soundTexture.silenceNotes = "Silence is oppressive and prolonged; each gap feels like consequence, not calm.";
      next.pacingAndRhythm.overallTempo = "Slow-burn and weighted. Beats hang long enough to feel uncomfortable.";
      next.motifsAndSymbolism.motifs = dedupeStrings([
        ...next.motifsAndSymbolism.motifs,
        "occluded faces",
        "failing practical lights",
      ]).slice(0, 5);
      next.tags = dedupeStrings([...next.tags, "darker", "shadow-forward", "heavy tone"]).slice(0, 8);
      break;
    }

    case "more-intimate": {
      next.title = `Closer, ${next.title}`;
      next.sceneSummary.logline = `${next.sceneSummary.logline} The scene now privileges private gestures over environmental spectacle.`;
      next.cameraDirection.style = "Close, subjective, and breathing with the characters. Favor 50mm-100mm intimacy with shallow depth.";
      next.cameraDirection.movement = "Subtle handheld drift and micro-reframes that feel body-proximate rather than observational.";
      next.dialogueTone.style = "Soft, halting, and direct. Speech feels confessional and physically close to the mic.";
      next.dialogueTone.silenceVsDialogue = "Silence remains present, but when dialogue appears it is immediate and emotionally exposed.";
      next.soundTexture.ambience = dedupeStrings([
        "close-mic breath and fabric movement",
        ...next.soundTexture.ambience,
      ]).slice(0, 6);
      next.pacingAndRhythm.breathingRoom = "Breathing room sits in held close-ups where tiny reactions carry the emotional turn.";
      next.tags = dedupeStrings([...next.tags, "intimate", "close framing", "soft focus"]).slice(0, 8);
      break;
    }

    case "more-surreal": {
      next.title = `Dream Logic: ${next.title}`;
      next.sceneSummary.worldIn2Words = "slipping reality";
      next.narrativeTension.subtext = "Causality starts to bend. Symbols interrupt realism and emotional logic outruns literal events.";
      next.visualLanguage.dominantImagery = dedupeStrings([
        "time-skipped gestures repeating out of sequence",
        "objects appearing where they should not be",
        ...next.visualLanguage.dominantImagery,
      ]).slice(0, 6);
      next.visualLanguage.motionQuality = "Movement becomes uncanny: elastic timing, abrupt stillness, and impossible continuity between frames.";
      next.pacingAndRhythm.editStyle = "Associative, discontinuous, and image-led. Match cuts on metaphor rather than action.";
      next.soundTexture.musicDirection = "Textural and hypnotic. Reversed fragments, stretched tones, and rhythmic motifs that feel half-remembered.";
      next.motifsAndSymbolism.motifs = dedupeStrings([
        ...next.motifsAndSymbolism.motifs,
        "doubles and mirrors",
        "recurring impossible object",
      ]).slice(0, 5);
      next.tags = dedupeStrings([...next.tags, "surreal", "dream logic", "symbolic abstraction"]).slice(0, 8);
      break;
    }

    case "adapt-music-video": {
      next.title = `${next.title} (MV Cut)`;
      next.sceneSummary.logline = `${next.sceneSummary.logline} Reframed as a rhythm-led visual progression with motif repetition and escalating image grammar.`;
      next.cameraDirection.style = "Performance-adjacent and rhythm-sensitive. Build visual hooks that recur and evolve each phrase.";
      next.cameraDirection.keyShots = [
        "Opening icon frame that returns in final beat with altered meaning",
        "Rhythm-synced push-in on emotional trigger object",
        "Repeating location pass with wardrobe/light variation",
        ...next.cameraDirection.keyShots,
      ].slice(0, 5);
      next.pacingAndRhythm.overallTempo = "Musically structured with clear phrase transitions, drops, and visual choruses.";
      next.pacingAndRhythm.editStyle = "Cut to rhythm with selective off-beat ruptures to create surprise and escalation.";
      next.adaptationModes = [
        {
          format: "Music Video",
          description: "Image-first progression built around repeating motifs, rhythmic cuts, and performance fragments that evolve per section.",
          twist: "A single recurring visual icon mutates each chorus until it resolves in the final frame.",
        },
        ...next.adaptationModes,
      ].slice(0, 4);
      next.tags = dedupeStrings([...next.tags, "music video", "rhythm cut", "image-led"]).slice(0, 8);
      break;
    }

    case "adapt-short-film": {
      next.title = `${next.title} (Short Film)`;
      next.sceneSummary.logline = `${next.sceneSummary.logline} Structured as a compact narrative scene with a grounded setup, escalation, and lingering emotional resolution.`;
      next.narrativeTension.stakes = "Character stakes become explicit and narrative-facing: what changes if this moment is avoided.";
      next.cameraDirection.style = "Narrative-first coverage with intentional economy: wides for context, mediums for dynamics, close-ups for turns.";
      next.pacingAndRhythm.overallTempo = "Measured and story-driven, with purposeful transitions between beats rather than purely atmospheric drift.";
      next.pacingAndRhythm.breathingRoom = "A final held beat after the narrative turn lets the emotional consequence settle.";
      next.dialogueTone.style = "Grounded, sparse, and character-specific. Dialogue advances relationship and reveals pressure under the surface.";
      next.adaptationModes = [
        {
          format: "Short Film",
          description: "8-15 minute narrative version with a clear emotional turn and scene consequence that carries into an afterimage ending.",
          twist: "The final action reframes the opening image without explaining it outright.",
        },
        ...next.adaptationModes,
      ].slice(0, 4);
      next.tags = dedupeStrings([...next.tags, "short film", "narrative arc", "grounded drama"]).slice(0, 8);
      break;
    }

    case "reweave": {
      const titleVariants = ["Second Reading", "Alternate Cut", "New Angle", "Other Version"];
      const worldVariants = ["tense stillness", "fractured tenderness", "electric ache", "controlled chaos"];
      const shift = Math.floor(Math.random() * titleVariants.length);

      next.title = `${titleVariants[shift]}: ${next.title}`;
      next.sceneSummary.worldIn2Words = worldVariants[shift];
      next.sceneSummary.logline = `${next.sceneSummary.logline} This pass reframes the same emotional seed with a different directorial point of view.`;
      next.visualLanguage.dominantImagery = [...next.visualLanguage.dominantImagery].reverse();
      next.cameraDirection.keyShots = [...next.cameraDirection.keyShots].reverse();
      next.alternateDirections = [...next.alternateDirections].reverse();
      next.followUpPrompts = next.followUpPrompts.map((item, i) => `Variation ${i + 1}: ${item}`);
      next.tags = dedupeStrings([...next.tags, "reweave", "fresh pass"]).slice(0, 8);
      break;
    }
  }

  next.followUpPrompts = dedupeStrings(next.followUpPrompts).slice(0, 4);
  return next;
}

export function generateMockSceneWeaver(
  prompt: string,
  refinement?: RefinementAction,
  existingContext?: string,
): Omit<SceneWeaverResult, "prompt"> {
  const fromContext = parseExistingContext(existingContext);
  const base = fromContext ?? cloneScene(pickBaseScene(prompt));

  if (!refinement) {
    return base;
  }

  return applyRefinement(base, refinement);
}
