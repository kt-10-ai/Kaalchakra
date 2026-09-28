import { choice, flag, fx, gain, has, hasAny, is, line, or, puzzle, say, set, stat, sus, talk, trust, when } from "../dsl";
import type { CourtState, Episode, Fx } from "../types";

/** Count how many pieces of evidence Arun has laid in front of his brother (e71). */
const pressed: Fx = (s) => set("pressedBrother", ((s.flags.pressedBrother as number) ?? 0) + 1)(s);
const pressedAt = (n: number) => (s: CourtState) => ((s.flags.pressedBrother as number) ?? 0) >= n;

export const CHAPTER_8: Episode[] = [
  // ─────────────────────────── 71. RANADHIR'S DOOR ───────────────────────────
  {
    n: 71,
    id: "e071-ranadhirs-door",
    chapter: 8,
    title: "भाई का द्वार · Ranadhir's Door",
    location: "ranadhir",
    objective: "Go to your brother's quarters in the west wing",
    cast: ["ranadhir"],
    beats: [
      say("His steward opens the door before I knock, as if he has been standing behind it all afternoon. Perhaps he has. He looks at my face and leaves without being told."),
      say("Ranadhir is at the window with his back to the room, a cup in his hand. He does not turn round. He knows my step as well as I know his."),
      line("ranadhir", "You've come to tell me about the verdict. I was there. I heard it."),
      when(is("tookInk"), [
        line("ranadhir", "And while you're here, you can put back the ink pot. My man says someone has been at my writing box. I said it was the cat. We don't have a cat."),
        say("I say nothing. He says nothing about my saying nothing. That is how we have always fought."),
      ]),
      fx(set("pressedBrother", 0)),
      talk(
        "ranadhir",
        "I have carried it all day, one piece at a time. A scent. A token. A signature. I lay them out in front of him like coins on a table and watch to see which ones he picks up.",
        [
          {
            id: "why",
            label: "“I didn't come about the verdict.”",
            required: true,
            reply: [
              line("arun", "I didn't come about the verdict. I came about you."),
              line("ranadhir", "Then you've wasted a walk. I'm the least interesting thing in this fortress today. Ask your questions. Quickly. I have to dress for an execution."),
            ],
          },
          {
            id: "balcony",
            label: "Show: Ranadhir on the Balcony",
            requires: has("balcony-watcher"),
            reply: [
              line("arun", "At the last watch she looked up at the east balcony. You were on it. You stepped back into the dark."),
              line("ranadhir", "The iron bell rang. I went to see what it rang for. So did you, from what I hear, in your good silks or your bad cloak."),
              line("ranadhir", "I stepped back because a prisoner was looking at me. Would you have waved?"),
              fx(pressed),
            ],
          },
          {
            id: "ink",
            label: "Show: Blue-Green Fingers",
            requires: has("ranadhir-ink"),
            reply: [
              line("arun", "Your fingers at the noon meal. Blue-green. River ink. It only grows on their side of the water."),
              line("ranadhir", "Rani Padmavati's caravans bring it over by the jar. Half the women of this court write love letters in it. I write orders for the kennels in it. It was cheap."),
              say("He holds up his hand to the window. The stain is gone. He has scrubbed it with something that took the skin with it."),
              fx(pressed),
            ],
          },
          {
            id: "oil",
            label: "Show: Sandalwood Oil",
            requires: has("sandal-oil"),
            reply: [
              line("arun", "Karan smelled sandalwood on the stair at the last watch. Oil, not temple smoke. You've worn it since you were fifteen."),
              line("ranadhir", "And every young man at court who wanted to be mistaken for me has worn it since I was sixteen. Ask the steward how many bottles he orders. Then accuse the barracks."),
              fx(pressed),
            ],
          },
          {
            id: "token",
            label: "Show: The Royal Token",
            requires: has("king-token"),
            reply: [
              line("arun", "Someone went down to the cells with a royal token. Three people carry one. You're one of them."),
              line("ranadhir", "Father, the Minister and me. Accuse the Minister. You'd enjoy it more, and you'd have half the court behind you."),
              say("His token hangs on the hook by the door where I saw it at noon. He doesn't look at it. I notice him not looking."),
              fx(pressed),
            ],
          },
          {
            id: "countersign",
            label: "Show: The Countersign",
            requires: has("heir-countersign"),
            reply: [
              line("arun", "You countersigned her warrant. Three days before anyone saw her at the ford."),
              line("ranadhir", "I countersign everything the Chancery sends up. I signed forty things that day. If Kaushal slipped your death warrant into the pile, I'd sign that too, and so would you, if you'd ever done an hour's work in your life."),
              fx(pressed),
            ],
          },
          {
            id: "proposed",
            label: "Show: “As the Heir Proposed”",
            requires: has("heir-proposed"),
            reply: [
              line("arun", "The sentence was drafted this morning. The errand west. In the margin: as the heir proposed."),
              line("ranadhir", "Yes."),
              say("That is all. No denial. He lets the word stand on its own, like a man leaving a door open to show there is nothing in the room."),
              line("ranadhir", "You are no use to anyone here. Somewhere else you might be. I told Father so. He agreed. He rarely agrees with me. I took it as a compliment."),
              fx(pressed, trust("ranadhir", -1)),
            ],
          },
          {
            id: "lullaby",
            label: "Show: The Lullaby",
            requires: has("nilkanth-lullaby"),
            reply: [
              line("arun", "Nilkanth. The blue-throated one. Sumitra says Mother sang it to both of us. No one else at court would know it as a name."),
              say("He is pouring from the jug as I say it. The wine goes over the rim of the cup and across the table, a thin dark line toward the edge."),
              say("He watches it reach the edge and drip. Then he sets the jug down, very carefully, in the middle of the spill."),
              line("arun", "You've spilled it."),
              line("ranadhir", "So I have. It's a lullaby, Arun. I told you so at noon. Mother sang us a great many things. She also told you the moon was a lamp. Grow up."),
              say("His voice is perfect. His hand is still flat on the table, in the wine, and he has not noticed."),
              fx(pressed, set("brotherCracked", true)),
            ],
          },
          {
            id: "flinch",
            label: "Show: The Flinch",
            requires: has("ranadhir-flinch"),
            reply: [
              line("arun", "When she said the name in the hall, only one man moved. Your hand closed on the rail."),
              line("ranadhir", "The hall was hot, the rail was there, and a traitor was saying gods' names to my father's face. You are building a gallows out of splinters, little brother."),
              fx(pressed),
            ],
          },
          {
            id: "letter",
            label: "Show: Her Letter to Me",
            requires: has("queens-box-letter"),
            reply: [
              line("arun", "She left me a letter. Six years old. She says to look after you. She says you are braver than you let anyone see."),
              line("ranadhir", "Mother was a kind woman who was wrong about people. It's what killed her. Keep the letter. Don't show it to anyone else. Don't show it to me again."),
              fx(pressed),
            ],
          },
        ],
        (s) =>
          pressedAt(5)(s)
            ? "He has an answer for every one. Each is plausible. Each is cold. Laid end to end, they make the shape of a man who has rehearsed."
            : pressedAt(2)(s)
              ? "He has an answer for each thing I show him. They are good answers. I have heard him give worse ones about horses."
              : "I have almost nothing to put in front of him, and he knows it. He is patient with me, the way you are patient with a dog that has found a bone it cannot carry.",
      ),
    ],
  },

  // ─────────────────────────── 72. THE BROTHER'S ANSWER ───────────────────────────
  {
    n: 72,
    id: "e072-the-brothers-answer",
    chapter: 8,
    title: "भाई का उत्तर · The Brother's Answer",
    location: "ranadhir",
    objective: "Lay the whole case before your brother",
    cast: ["ranadhir"],
    beats: [
      line("ranadhir", "Is that everything? Then put it together, if you can. Say it to my face. I'd like to hear what my brother thinks I am."),
      say("He sits, finally, across the table from me, and folds his hands. There is wine drying on one of them."),
      puzzle(
        {
          kind: "deduce",
          title: "The Brother's Answer",
          prompt: "Say it aloud, one piece at a time, from what is in your Case Book.",
          slots: [
            { q: "Who opened cell three at the last watch?", answer: ["sandal-oil", "king-token", "missing-key"] },
            { q: "Who proposed my exile?", answer: "heir-proposed" },
            { q: "Who writes in river ink?", answer: ["ranadhir-ink", "river-ink"] },
          ],
          hint: "A scent on the stair, a token that opens the lower cells, a key gone for an hour. A margin note in the Minister's hand. Stained fingers at the noon meal.",
        },
        [
          line("arun", "Someone came down to cell three at the last watch with the heir's token, smelling of your oil, and the key was gone for an hour. The sentence that sends me west has your name in its margin. And you write in ink that grows only in Meghadurg."),
          say("I say it evenly. I have never said anything to him evenly in my life. It comes out sounding like our father."),
          say("He listens to the end without moving. Then he smiles, which is worse than anything he could have said."),
          line("ranadhir", "You think you've found a traitor. You've found a brother who does what he's told."),
          line("ranadhir", "Every piece of that is true, and none of it is what you think. That's all you'll get from me. That's more than I've given anyone."),
          fx(set("ranadhirCornered", true), set("suspectsBrother", true), stat({ cunning: 1 })),
        ],
        [
          say("I start to say it and it comes apart in my mouth. A smell. A key. A signature on a page with forty others. Aloud, in his room, it sounds like what he said it was: splinters."),
          line("ranadhir", "No? Then you have a feeling and a grudge, and I've had both of those about you since you were born. Neither of us has hanged the other yet."),
          fx(sus(-1)),
        ],
      ),
      when(is("brotherCracked"), [say("His hand is still stained where it lay in the wine. He has not wiped it. I don't think he knows.")]),
    ],
  },

  // ─────────────────────────── 73. THREE ROADS ───────────────────────────
  {
    n: 73,
    id: "e073-three-roads",
    chapter: 8,
    title: "तीन रास्ते · Three Roads",
    location: "ranadhir",
    objective: "Decide what to do about your brother",
    cast: ["ranadhir"],
    beats: [
      say("Below the window, a groom walks a horse across the yard. The shadows of the west wing reach all the way to the stables now. There is perhaps an hour and a half of light."),
      say((s) =>
        s.flags.ranadhirCornered
          ? "I have said it to his face and he has not denied it. He has only refused to let it mean what it means. That is not the same as innocence. It is not the same as guilt."
          : "I could not make it fit aloud. But I know what I saw on the balcony, and I know what I smelled on nobody's stair, and I know my brother."),
      line("ranadhir", "Well? You've a face like Father's when he's deciding which hand to cut off. Decide. I'm busy."),
      choice("Three roads out of this room. Only one of them comes back.", [
        {
          label: "Go to the king",
          detail: "Tell him your brother corresponds with Meghadurg. This will end something.",
          fx: (s) => set("brother", "betrayed")(stat({ ruthlessness: 3 })(s)),
          then: [
            line("arun", "I'm going to tell him. Whatever you are, he should know it from me."),
            say("Ranadhir looks at me for a long moment. I wait for the anger. It doesn't come. Something else comes instead, and goes, before I can name it."),
            line("ranadhir", "Then go. Don't run. Walk, so they see you walking."),
            say("I walk. The west wing, the colonnade, the small door behind the throne. The guards let me through because I am his son."),
            line("arun", "Majesty. My brother writes to Meghadurg. In their ink, under a god's name. He opened her cell at the last watch."),
            say("My father hears all of it without interrupting. When I am finished he puts down his cup, and for the first time in my life he looks at me as if I have given him something he wanted."),
            line("bhanusen", "Thank you, Arunveer. Go to your rooms."),
            { t: "end", ending: "brother-betrayed" },
          ],
        },
        {
          label: "Keep his secret",
          detail: "Whatever it is, it stays in this room.",
          fx: (s) => set("brother", "secret")(sus(-1)(s)),
          then: [
            line("arun", "I don't know what you are. I'm not going to find out from the executioner."),
            line("ranadhir", "Generous. Close the door on your way out. The steward listens at it."),
            say("That is the whole of his thanks. I close the door. I do not look back to see whether he has turned round, because I know he has not."),
          ],
        },
        {
          label: "“Whatever you're doing, I'll follow your lead.”",
          detail: "Trust him blind.",
          fx: (s) => set("brother", "follow")(trust("ranadhir", 3)(s)),
          then: [
            line("arun", "Whatever you're doing, I'll follow your lead."),
            say("For a moment my brother is not there. There is only a boy of twelve on the other side of the table, the one who used to take the blame for my broken things before Father could ask."),
            say("He opens his mouth. Closes it. Looks at the door, where the steward's shadow sits under the gap."),
            line("ranadhir", "Then do exactly what Father asks tonight. And then do exactly what he tells you after."),
            say("He stands, and he is the heir again, all of him, fitted and cold."),
            line("ranadhir", "Get out. And if anyone asks, we quarrelled. Make it a loud one on the stair."),
            say("I slam his door hard enough that the steward jumps. It is the first thing he has ever asked of me."),
          ],
        },
      ]),
    ],
  },

  // ─────────────────────────── 74. THE KING'S STUDY ───────────────────────────
  {
    n: 74,
    id: "e074-the-kings-study",
    chapter: 8,
    title: "राजा का कक्ष · The King's Study",
    location: "hall",
    objective: "Answer the king's summons to the room behind the throne",
    cast: ["bhanusen"],
    beats: [
      say("A page finds me on the stair. The king will see his son. Alone. In the small room behind the throne, which I have been inside twice in my life, both times to be told that someone had died."),
      say("It is warm, and plain, and smells of lamp oil and cedar. My father sits in his shirt. His crown is on the table beside the wine, like a bowl someone forgot to clear."),
      line("bhanusen", "Sit. Drink. You have had a long day, and I have made it longer. That was the purpose of it."),
      say((s) =>
        s.flags.kingStory === "pressed"
          ? "At noon I called him a liar across his own table. He pours for me now with the same hand, and it does not shake."
          : s.flags.fragment === "king"
            ? "The folded fragment I gave him in the hall is beside the crown. He has not unfolded it again. He does not need to."
            : "He pours for me himself. I have never seen him pour for anyone."),
      line("bhanusen", "Do you love your brother?"),
      choice("He asks it the way he asks about the weather in the passes.", [
        {
          label: "“Yes.”",
          fx: (s) => set("kingAskedBrother", "yes")(s),
          then: [
            line("arun", "Yes."),
            line("bhanusen", "Good. Love is useful. It tells a man what things cost. A king should know the price of everything he has before he is asked to pay it."),
            say("He drinks, and does not say what he paid, or for what."),
          ],
        },
        {
          label: "“He makes it difficult.”",
          fx: (s) => set("kingAskedBrother", "difficult")(sus(-1)(s)),
          then: [
            line("arun", "He makes it difficult."),
            line("bhanusen", "He was meant to. I made him that way. One of you had to be hard. I did not think the other would take it so much to heart."),
          ],
        },
        {
          label: "“Do you, Majesty?”",
          detail: "Turn it back on him.",
          fx: (s) => set("kingAskedBrother", "turned")(stat({ renown: 1 })(sus(1)(s))),
          then: [
            line("arun", "Do you, Majesty?"),
            say("He almost smiles. It is the nearest I have come to pleasing him in a year."),
            line("bhanusen", "I love what he will be. I have not yet decided about you."),
          ],
        },
      ]),
      line("bhanusen", "A crown is paid for once, Arunveer, in full, on one night. And then every day after, in small coin. The first payment is the only one anyone remembers. The rest you make alone, in rooms like this."),
      line("bhanusen", "Tonight you make your first. It is not a large one. A woman nobody will miss."),
      when(
        has("temple-register"),
        [say("A spoke cut three days before a funeral. I think of it, and of what he paid on his first night, and I keep my eyes on my cup.")],
      ),
      say("He reaches across and puts his hand on the back of my neck, the way he did when I was small and had fallen from something. It is warm. It is heavy. It is the most frightening thing he has done today."),
      line("bhanusen", "You were always hers. I would like, before I die, to see something of mine in you. Go and rest."),
      choice("The wine is still in the cup.", [
        {
          label: "Drink it",
          fx: (s) => sus(-1)(s),
          then: [say("I drink it down. It is very good. He watches me do it and nods, as if something has been signed.")],
        },
        {
          label: "Leave it untouched",
          fx: (s) => stat({ renown: 1 })(s),
          then: [say("I set the cup down full, and stand, and bow. He looks at the cup, not at me. When the door closes I hear him pour it back into the jug.")],
        },
      ]),
    ],
  },

  // ─────────────────────────── 75. THE SWORD'S WEIGHT ───────────────────────────
  {
    n: 75,
    id: "e075-the-swords-weight",
    chapter: 8,
    title: "तलवार का भार · The Sword's Weight",
    location: "barracks",
    objective: "Go to the barracks; the Senapati has the king's sword",
    cast: ["ugrasen"],
    beats: [
      say("The barracks yard is empty. The Company has been sent to line the hall. Ugrasen sits alone on the mounting block with the king's sword across his knees, wiping a last film of oil from the blade."),
      line("ugrasen", (s) =>
        has("ugrasen-guilt")(s)
          ? "Prince. You know what I am now. It doesn't change what this is. Take it. You should feel it once before the hall does."
          : "Prince. Take it. You should feel it once before the hall does. A blade in front of people is heavier than a blade in a yard."),
      say("He holds it out hilt first, as my father will. I take it. It is heavier than any sword I have held, and balanced so well that the weight seems to belong to my own arm."),
      when(
        is("swordLesson", "learned"),
        [say("My wrist remembers the stroke he showed me this morning. I wish it didn't.")],
        [say("This morning I would not touch it. Now it is in my hands and nothing has happened. Nothing ever happens, until it does.")],
      ),
      line("ugrasen", "I was sixteen. A deserter from the Second Company, not much older. My captain said: don't look at the neck, look at the ground a hand past it. Strike the ground. The neck is only in the way."),
      line("ugrasen", "I did it well. Everyone said so. I have done it well every time since. I can't tell you his name. I've tried, most nights, for forty years."),
      choice("The practice post stands in the corner of the yard, scarred to the height of a kneeling man.", [
        {
          label: "Practise the stroke on the post",
          fx: (s) => set("swordWeight", "practised")(stat({ ruthlessness: 1 })(s)),
          then: [
            say("I step to the post, look a hand past it, and strike the ground. The blade goes through the old wood as if through water, and the top of the post drops into the dust."),
            line("ugrasen", "Clean. You have his arm."),
            say("He does not say whose. He does not need to."),
          ],
        },
        {
          label: "Hand it back",
          fx: (s) => set("swordWeight", "returned")(trust("ugrasen", 1)(s)),
          then: [
            say("I turn it in my hands, hilt toward him, and wait until he takes it."),
            line("ugrasen", "Good. It'll be heavier in the hall. Remember that it was lighter here, and that you gave it back."),
          ],
        },
      ]),
      when(is("ugrasenSpeaks"), [line("ugrasen", "I said I'd stand for you. I still will. Whatever you do with this.")]),
    ],
  },

  // ─────────────────────────── 76. NANDINI'S WARNING ───────────────────────────
  {
    n: 76,
    id: "e076-nandinis-warning",
    chapter: 8,
    title: "नंदिनी की चेतावनी · Nandini's Warning",
    location: "chambers",
    objective: "Return to your chambers; Nandini is waiting",
    cast: ["nandini"],
    beats: [
      say("Nandini is in my rooms with the shutters closed, which she never does before the lamps. She is sitting on the edge of the chest by the door, and she stands too quickly when I come in."),
      line("nandini", "My lord. I was in the Chancery passage with the linen. Two of the Minister's men were on the other side of the screen. They didn't see me. People don't."),
      line("nandini", "One of them said it was a pity about the errand. He said before the errand was thought of, there was talk of the prince having an accident. On a mountain road. He said it the way you'd talk about a horse that went lame."),
      fx(gain("mountain-road")),
      say("She has kept my notes since she was nine. Her hand shakes as she gives me this one."),
      when(has("heir-proposed"), [
        say("Before the errand was proposed. And the errand was proposed by my brother. I hold the two things side by side in my head, and I do not let them touch."),
      ]),
      line("nandini", "They know I'm yours, my lord. Everyone knows. If they want to know where you've been all day, they'll ask me. And they won't ask nicely."),
      choice("She is sixteen and frightened, and she has been braver today than I have.", [
        {
          label: "Send her away from the palace tonight",
          detail: "To her mother's village, after the sunset bell. Safe, and out of it.",
          fx: (s) => set("nandiniAway", true)(trust("nandini", 2)(s)),
          then: [
            line("arun", "When the sunset bell has rung, go to your mother. Tonight. Take the east gate, not the west. Don't come back until someone you trust tells you to."),
            line("nandini", "And who will keep your notes?"),
            line("arun", "No one. That's the point."),
            say("She stares at me as if I have struck her. Then she nods, once, the way a soldier does."),
          ],
        },
        {
          label: "Ask her to keep watching",
          detail: "You need her eyes, and she knows it.",
          fx: (s) => set("nandiniWatch", true)(trust("nandini", 1)(s)),
          then: [
            line("arun", "I need your eyes a little longer. Until the bell. Then stop."),
            line("nandini", "I'll keep watching, my lord. I always have. You just didn't know which ones were mine."),
          ],
        },
      ]),
    ],
  },

  // ─────────────────────────── 77. SUMITRA'S BUNDLE ───────────────────────────
  {
    n: 77,
    id: "e077-sumitras-bundle",
    chapter: 8,
    title: "सुमित्रा की पोटली · Sumitra's Bundle",
    location: "kitchens",
    objective: "Go down to the kitchens",
    cast: ["sumitra"],
    beats: [
      say("The kitchens are loud with the evening meal that no one will eat until the thing in the hall is done. Sumitra stands apart from it at the far table, tying a cloth with a knot I have seen her tie all my life."),
      when(
        is("sumitraBread"),
        [
          line("sumitra", "You said yes to bread this morning. I've been generous with the word. Two loaves, the hard kind that keeps. Salt. Onions. And this."),
          say("She lays a small knife on the cloth. A kitchen knife, worn thin at the edge from years of stone, with a handle bound in cord."),
        ],
        [
          line("sumitra", "You told me this morning you weren't going anywhere. I packed it anyway. Old women are allowed to be stubborn about bread."),
          say("Two loaves, hard ones, and a twist of salt. On top of them, a small kitchen knife with a cord-bound handle, its edge worn thin by years of stone."),
        ],
      ),
      line("sumitra", "It was hers. She cut her own bread with it when she was a girl, before anyone let her be a queen. She'd want it to do something useful."),
      line("sumitra", "She would have set the sword down too, you know. She'd have set it down and then picked up the bread knife and told them all what she thought of them."),
      choice("The bundle is on the table between us. The knot is already tied.", [
        {
          label: "Take all of it",
          detail: "The bread and her knife.",
          fx: (s) => set("sumitraBread", true)(set("sumitraKnife", true)(trust("sumitra", 1)(s))),
          then: [
            say("I take it. It weighs almost nothing. She puts her floury hand flat on my chest for a moment, the way you'd test whether a loaf is done."),
            line("sumitra", "There. Now go and be stupid in a way she'd be proud of."),
          ],
        },
        {
          label: "Take the knife, leave the bread",
          detail: "Bread is for a road. You haven't admitted to a road.",
          fx: (s) => set("sumitraKnife", true)(trust("sumitra", 1)(s)),
          then: [
            line("arun", "Keep the bread. I'll take the knife."),
            line("sumitra", "Proud, like him. Fine. The bread will be at the gate anyway, if there's a gate. I'm not asking."),
          ],
        },
        {
          label: "Take nothing",
          detail: "If you take it, you've already agreed to go.",
          fx: (s) => set("sumitraRefused", true)(s),
          then: [
            line("arun", "I can't, Sumitra. If I take it, it means I know."),
            line("sumitra", "You do know. You've known since noon. You've got her face when you're lying to yourself."),
            say("She unties the knot, and ties it again, tighter, and puts the bundle on the shelf by the door where I will pass it."),
          ],
        },
      ]),
    ],
  },

  // ─────────────────────────── 78. VIDYADHAR'S GIFT ───────────────────────────
  {
    n: 78,
    id: "e078-vidyadhars-gift",
    chapter: 8,
    title: "विद्याधर का उपहार · Vidyadhar's Gift",
    location: "archive",
    objective: "Find Vidyadhar in the archive",
    cast: ["vidyadhar"],
    beats: [
      say("The archive is dim already. Vidyadhar does not light lamps for himself; he says the dark is the same to him and the oil is not. He is sitting at the long table with a sheet of vellum and a pen, and his face almost on the page."),
      line("vidyadhar", "I know your step. Sit. Don't touch that, it's wet."),
      say("It is a charter. An old one, copied fresh: a grant of grazing rights to a village that no longer exists, in the year before the Accession. At the foot, drawn with great care in red ink, is the royal wheel. All eight spokes."),
      line("vidyadhar", "I copied it this afternoon. It took me four hours. It used to take me one. The original stays here, where it's safe. The copy can go where it isn't."),
      when(
        or(has("queens-box-letter"), has("accession-night")),
        [
          line("arun", "She wrote that I should ask you about the night of the Accession."),
          say("His pen stops. For a moment the old man is perfectly still, like something in a field that has heard a hawk."),
          line("vidyadhar", "Not tonight. Not here, with the walls listening. Ask me when you come back. If you come back, I'll still be here. I'm always here."),
        ],
      ),
      line("vidyadhar", "Your mother would have said: carry the whole wheel. Not the one they cut. The whole one. Then when someone shows you the other, you'll know what's missing."),
      choice("He holds it out to me, blowing gently on the ink.", [
        {
          label: "Accept it",
          fx: (s) => set("charterCopy", true)(trust("vidyadhar", 1)(s)),
          then: [
            say("I take it by the edges. He folds my fingers over it with his own, dry and light as paper."),
            line("vidyadhar", "Keep it flat. Keep it dry. Don't show it to anyone who knows what it means until you know what it means."),
          ],
        },
        {
          label: "Decline it",
          detail: "An eight-spoked seal, in the hands of a prince who asks questions.",
          fx: (s) => sus(-1)(s),
          then: [
            line("arun", "If they search me tonight and find that, it's your hand on it."),
            line("vidyadhar", "My hand has been on worse. But you're right, and she'd have said the same, and been annoyed about it."),
            say("He rolls it up and puts it in a pigeonhole among a thousand others. I will never find it again. That, I think, is the point."),
          ],
        },
      ]),
    ],
  },

  // ─────────────────────────── 79. CHAYA'S LAST VISIT ───────────────────────────
  {
    n: 79,
    id: "e079-chayas-last-visit",
    chapter: 8,
    title: "अंतिम भेंट · Chaya's Last Visit",
    location: "dungeon",
    objective: "Go down to cell three before the lamps",
    cast: ["karan", "chaya"],
    beats: [
      line("karan", "A little while, Highness. I'll be on the stair, counting. I count slow."),
      say("They have washed her, and bound her hair up high and tight, away from the neck. It makes her look younger and more like what she is: someone who was sent a long way and came back."),
      say((s) =>
        s.flags.chayaGift === "bread"
          ? "The heel of bread is gone. There is a single crumb of it on her knee, and she has not brushed it off."
          : s.flags.chayaGift === "water"
            ? "The clay cup is on the floor by the bars where she set it. She has turned it upside down, as travellers do at an inn when they mean to come back."
            : "She sees me and does not get up. There is no reason she should."),
      talk(
        "chaya",
        "She comes to the bars and folds her arms on the crossbar, as if we were leaning on a fence at the edge of a field.",
        [
          {
            id: "wont",
            label: "“I won't do it.”",
            required: true,
            reply: [
              line("arun", "I won't do it."),
              line("chaya", "Then they'll do something worse to you. And someone else will do it to me, less tidily. Don't say it for my sake. Say it only if it's yours."),
            ],
          },
          {
            id: "door",
            label: "“Who opened your door?”",
            required: true,
            reply: [
              line("arun", "Last night. Someone came down that stair with a token and took the key off Karan's ring. Who opened your door?"),
              line("chaya", "Someone who could not be seen doing it."),
              say("She says it exactly as she said it this morning, word for word, like a password."),
              when(flag("ranadhirCornered"), [
                line("arun", "My brother."),
                line("chaya", "You have a brother. Be glad of it. I've said all I'm going to say about anyone's brother."),
              ]),
            ],
          },
          {
            id: "name",
            label: "The name",
            requires: has("nilkanth"),
            reply: [
              line("arun", "Nilkanth."),
              say("She doesn't tell me not to say it here, as she did this morning. She looks at the stair, where Karan is counting, and leans closer."),
              line("chaya", "Remember it. If you're sent west — remember it."),
              when(has("nilkanth-lullaby"), [say("The blue-throated one, who swallowed the poison. I know what it means. I do not know, yet, who.")]),
            ],
          },
          {
            id: "wheel",
            label: "“I read her wheel.”",
            requires: has("decoded-fragment"),
            reply: [
              line("arun", "Get him out before the wheel turns. That was about me."),
              line("chaya", "I carry letters. I don't read them. That's the whole of the job, and the whole of the danger."),
              line("chaya", "You turn it the way she did. Eight on. I watched you in the hall. You counted on your fingers."),
              fx(trust("chaya", 1)),
            ],
          },
          {
            id: "promise",
            label: "“This morning I promised you something.”",
            requires: or(is("promisedChaya", "free"), is("promisedChaya", "truth")),
            reply: [
              line("arun", (s) =>
                s.flags.promisedChaya === "free" ? "I promised to get you out. I haven't." : "I promised the truth would be said aloud in that hall."),
              line("chaya", (s) =>
                s.flags.promisedChaya === "free"
                  ? "No. You haven't. I didn't believe you. I'm glad you meant it. Those are two different things."
                  : s.flags.fragment === "read" || s.flags.ledger === "exposed" || s.flags.kaushalCaught
                    ? "Some of it was. More than anyone has said aloud in that hall in twenty years. It didn't help me. It wasn't meant to."
                    : "It wasn't. It rarely is. You'll get other halls."),
            ],
          },
        ],
        "Karan's voice on the stair, counting, has reached a number he pretends is higher than it is.",
      ),
      choice("Karan is coming down. One more thing to say through the bars.", [
        {
          label: "“I'll refuse. I promise you.”",
          fx: (s) => set("chayaFarewell", "refuse")(trust("chaya", 1)(s)),
          then: [
            line("arun", "I'll refuse. Whatever they do. I promise you that."),
            say("She looks at me for a long time, the way she looked at me in the courtyard when I was only a face in the torchlight."),
            line("chaya", "Then I'll look at you, when it comes. So you know I'm there."),
          ],
        },
        {
          label: "Promise nothing",
          fx: (s) => set("chayaFarewell", "nothing")(s),
          then: [
            say("I don't promise. I have made enough promises today that the stone swallowed."),
            line("chaya", "Good. Then there'll be nothing to forgive. Go on. You smell of the kitchens. Sumitra's fennel."),
          ],
        },
        {
          label: "“Run. When they open the door, run.”",
          fx: (s) => set("chayaFarewell", "run")(sus(1)(s)),
          then: [
            line("arun", "When they open that door, run. I'll make a noise. They'll look at me."),
            line("chaya", "Not yet."),
            say("She says it as if it were a date and a place, already arranged, and I was not invited."),
          ],
        },
      ]),
      line("karan", "Time, Highness. I'm sorry. I'm sorry about all of it."),
    ],
  },

  // ─────────────────────────── 80. DUSK ON THE WALLS ───────────────────────────
  {
    n: 80,
    id: "e080-dusk-on-the-walls",
    chapter: 8,
    title: "प्राचीर पर संध्या · Dusk on the Walls",
    location: "walls",
    objective: "Climb to the western rampart before the bell",
    cast: [],
    beats: [
      say("I climb the stair to the western rampart because it is the only place in Vajragarh where no one has ever come looking for me. The sentries have been called down to line the hall. The wall is mine."),
      say("The sun is low over the western ridge, fat and orange. Below it the road runs down out of the pass and along the river and out of sight, toward Meghadurg. From here it looks like a thread someone has dropped."),
      when(has("mountain-road"), [say("An accident on a mountain road. From up here I can see four mountain roads. I have ridden all of them. I will be careful not to count which ones have a long drop.")]),
      when(
        hasAny("burned-remission", "soldiers-bounty", "soldier-confession", "ugrasen-guilt"),
        [say("To the south, where the six villages stood, there is nothing. From this height you can see the shapes where the fields were. The grass has never grown back quite the same colour.")],
      ),
      when(is("brother", "follow"), [say("Do exactly what Father asks tonight. And then do exactly what he tells you after. I have turned it over a dozen times since, and it opens a different way every time.")]),
      say("In a quarter of an hour the bell will ring. I will go down the stair and across the courtyard and into my father's hall, and he will hold out his sword."),
      choice("How will you walk in?", [
        {
          label: "Calm",
          detail: "Give them nothing to read.",
          fx: (s) => set("stance", "calm")(stat({ cunning: 1 })(sus(-1)(s))),
          then: [say("I breathe until my hands stop. I will walk in the way my father walks in: as though the hall was built for this and I am only arriving at it. Let them look. There will be nothing on my face they can use.")],
        },
        {
          label: "Defiant",
          detail: "Let them see you've made up your mind.",
          fx: (s) => set("stance", "defiant")(stat({ renown: 1 })(sus(1)(s))),
          then: [say("I will walk in with my head up and my eyes on his. Let every lord along the wall see that the king's second son decided something on the wall at sunset, and did not come down to ask permission.")],
        },
        {
          label: "Grieving",
          detail: "For her, for Mother, for all of it.",
          fx: (s) => set("stance", "grieving")(trust("chaya", 1)(stat({ ruthlessness: -1 })(s))),
          then: [say("I let it come, up here where no one can see. For the villages. For a closed pyre. For a woman kneeling with her hair bound up off her neck. When it has gone through me I wipe my face, and I will walk in carrying it, and I will not put it down.")],
        },
      ]),
      say("The sun touches the ridge. Far below, in the courtyard, someone begins to light the lamps."),
    ],
  },
];
