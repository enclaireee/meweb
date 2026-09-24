/**
 * What the worker says (decisions.md, "he talks"). Hardcoded on purpose: flavour, never facts about
 * Fatih beyond what the cards already say. Short enough for a paper bubble (≈ 60 characters).
 */
import type { ActionName } from "./actions";

/** Right after the curtain opens. */
export const hello = [
  "Oh! A visitor. Come in, come in.",
  "Evening! Mind the scraps on the floor.",
  "You're just in time. I've swept.",
  "Welcome to the workshop. Scroll and I'll lead.",
  "Ah, company. Follow me, it's this way.",
  "Lights on, glue's dry. Let's go.",
];

/** On his own, in each room (by station index). */
export const rooms: string[][] = [
  // 00 Desk
  [
    "This is where it all starts. Mostly with coffee.",
    "That notebook's full. Don't tell him.",
    "Electrical engineering. The good kind of shocking.",
    "Every station started as a sketch on this desk.",
    "The lamp follows your cursor. Try it.",
    "I cut every one of these bits by hand. Well. Mostly.",
    "Tidy desk, tidy mind. This is a messy desk.",
    "Scroll down. There's a lot more workshop back there.",
  ],
  // 01 Storeroom (DemandX)
  [
    "Crates, crates, crates. Each one has a forecast.",
    "Croston for the lumpy ones. Don't ask me why.",
    "Too much stock is a crime. Too little is worse.",
    "Every product gets the model that actually won.",
    "I counted these crates. Then the model counted them better.",
    "Backtested, so we don't guess.",
    "Careful, that stack's been forecast to fall over.",
  ],
  // 02 Control room (OT lab)
  [
    "Don't touch the red button. Or any button.",
    "Four kinds of plant gear, one catalogue.",
    "The alarms write themselves now. I'm redundant.",
    "Hear that hum? That's telemetry.",
    "Pressure's fine. Probably. Let me check the gauge.",
    "Zabbix is watching. Always watching.",
    "Righty tighty, lefty loosey.",
  ],
  // 03 Arcade (Refocus)
  [
    "This game reads your focus. Mine's on snacks.",
    "Second place at ProtoTech! I cheered the loudest.",
    "It listens to your brainwaves. Behave.",
    "One more round. Then work. Promise.",
    "High score's still mine. Don't check.",
    "EEG in, game out. Magic, basically.",
  ],
  // 04 Drafting table (KOMAT)
  [
    "A whole national maths competition, drafted right here.",
    "Measure twice, cut once, deploy on Friday.",
    "Straight lines are harder than they look.",
    "It was built, and then it stayed up.",
    "Do you know the answer to question seven? No? Me neither.",
    "Blueprints are just fancy doodles.",
  ],
  // 05 Sill (solar)
  [
    "Sunlight in, lamplight out.",
    "The panel's a bit dusty. Hold on.",
    "Free electricity! Well, after the parts.",
    "The little screen keeps count. It's very proud.",
    "It runs on sun. I run on biscuits.",
    "Batteries charged. Unlike me.",
  ],
  // 06 Wall (experience & skills)
  [
    "Everything he's done, pinned up where you can see it.",
    "SCADA, forecasting, teaching... busy fellow.",
    "Tap a role on the board, there's more to it.",
    "These ribbons don't dust themselves.",
    "That pegboard's got a tool for everything.",
    "Python, TypeScript and an Arduino. Good kit.",
  ],
  // 07 Bedroom (contact)
  [
    "Last room. My favourite. There's a bed.",
    "Say hello to him! The links are right there.",
    "An email goes straight to him.",
    "Look at the moon tonight.",
    "The fairy lights were my idea.",
    "Mind the slippers.",
    "The door's always open. Metaphorically.",
    "You made it to the end. Want a biscuit?",
  ],
];

/** Anywhere, when nothing else fits. */
export const idle = [
  "Paper cuts are an occupational hazard.",
  "Everything here is paper. Even me.",
  "Hmm, hmm, hmm.",
  "Did I leave the glue open?",
  "I'm not lost, I'm exploring.",
  "Nice cursor you've got there.",
  "Split pins at every joint. Very flexible.",
  "Still here? I like you.",
  "If you need me I'll be... right here.",
  "Every room's hand cut. Took ages.",
  "Scroll on, there's more.",
  "Whistle while you work. I can't whistle.",
];

/** When the cursor lands on him (or he's focused). */
export const hover = [
  "Hi there!",
  "Oi, that tickles.",
  "Click me and I'll take you to the next room.",
  "Yes? Need directions?",
  "Careful, I'm only paper.",
  "Hello! Want the tour?",
  "Boop.",
  "You found me!",
  "Psst. Click. I'll walk you on.",
  "I'm working, I promise.",
  "Don't crumple me.",
  "Handsome, aren't I? Hand cut, too.",
];

/** Clicked: he's off to the next room. */
export const poke = [
  "Right, this way!",
  "Onwards!",
  "Follow me!",
  "Next room, coming up.",
  "Hup! Let's go.",
  "Off we go!",
];

/** When he starts a job; not every time. */
export const acts: Partial<Record<ActionName, string[]>> = {
  write: ["Let me just note that down.", "Dear diary...", "Two crates, carry the one..."],
  scratch: ["Hmm. Where did I put that?", "Now what was I doing?"],
  valve: ["Righty tighty...", "Nearly... there...", "Pressure's up!"],
  play: ["Watch this!", "Don't distract me, I'm winning."],
  lift: ["Lift with the knees...", "Oof. Heavy forecast."],
  reach: ["Can't... quite...", "Who put this up so high?"],
  wipe: ["Squeaky clean.", "Dust off, sun in."],
  pin: ["Pinned!", "There. Nice and straight."],
  draw: ["A straight line. Nailed it.", "Just a little doodle."],
  inspect: ["Needle's in the green. Good.", "Let's have a look..."],
  lookUp: ["Look at that.", "Lovely up there."],
  stretch: ["Ahh, that's better.", "Good for the back."],
  dance: ["Victory dance!", "Can't stop me now!"],
  sit: ["Just resting my eyes...", "Ooh, comfy.", "Five more minutes."],
  yawn: ["*yawn* Long day.", "Is it bedtime yet?"],
};

/** The lamp dial flips the light. */
export const light = {
  morning: ["Morning already?", "Ah, sunshine!", "Rise and shine!"],
  night: ["Back to night shift.", "Lights low. Cosy.", "Ooh, the city's lit up."],
};

/** You scrolled fast and he had to jog. */
export const rush = ["Whoa, slow down!", "Wait for me!", "Puff, puff...", "In a hurry, are we?", "My little legs!"];

/** You went back a room. */
export const back = ["Forgot something?", "Back again? Sure.", "Oh, this one again. I like it too."];
