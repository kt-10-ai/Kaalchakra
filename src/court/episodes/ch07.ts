import { choice, fx, gain, has, hasAny, is, line, or, puzzle, say, set, stat, statAt, supply, sus, suspicionAt, trust, trusts, when } from "../dsl";
import type { CharId, CourtState, Episode } from "../types";

const HALL: CharId[] = ["bhanusen", "kaushal", "chaya", "ranadhir", "jaswant", "padmavati", "bhairav", "ugrasen", "devashrava", "vikram"];

const tr = (s: CourtState, who: CharId) => s.trust[who] ?? 0;

/** Lords (and officers) who will speak for mercy in e67. */
const mercyFrom = {
  padmavati: (s: CourtState) => s.flags.padmavatiDeal === true || tr(s, "padmavati") >= 2,
  bhairav: (s: CourtState) => s.flags.bhairavWay === "owned" || tr(s, "bhairav") >= 2,
  ugrasen: (s: CourtState) => s.flags.ugrasenSpeaks === true || tr(s, "ugrasen") >= 2,
  devashrava: (s: CourtState) => tr(s, "devashrava") >= 2,
  vikram: (s: CourtState) => (s.flags.vikramBroken === true && tr(s, "vikram") >= 1) || tr(s, "vikram") >= 2,
  jaswant: (s: CourtState) => tr(s, "jaswant") >= 3 && s.flags.jaswantShamed !== true,
};
const mercyCount = (s: CourtState) => Object.values(mercyFrom).filter((f) => f(s)).length;

const food = (n: number) => (s: CourtState) => s.supplies.food >= n;

export const CHAPTER_7: Episode[] = [
  // ─────────────────────────── 61. THE MINISTER'S CASE ───────────────────────────
  {
    n: 61,
    id: "e061-the-ministers-case",
    chapter: 7,
    title: "मंत्री का पक्ष · The Minister's Case",
    location: "hall",
    objective: "Hear the Minister lay out his case",
    cast: HALL,
    beats: [
      say("The afternoon light comes in low through the west windows and lies across the floor in bars. Chaya kneels in one of them. Someone has given her water since the morning. Someone has not given her a chair."),
      line("kaushal", "Majesty. My lords. I will be brief, because the matter is simple. A dismissed courier, riding the Meghadurg road with a royal satchel she had no right to carry. I will state the facts. The prince may test them, if he likes. He has been testing things all day."),
      when(
        suspicionAt(6),
        [say("He does not look at me when he says it. He does not need to. Half the hall does it for him.")],
        [say("A ripple of polite amusement along the walls. My father's face does not move.")],
      ),
      puzzle(
        {
          kind: "testimony",
          title: "The Minister's Case",
          witness: "kaushal",
          prompt: "Kaushal states his case in four clean sentences. One of them is a lie I watched him tell with my own eyes. Press where you like. Present evidence where it breaks.",
          statements: [
            {
              text: "The courier was taken on the western road, bearing correspondence of this realm that she had no right to carry.",
              press: "The Captain's report says as much. If the Captain has since remembered it differently, the Captain may explain himself to the king.",
            },
            {
              text: "The satchel came to me sealed. It was opened before my clerks, and it was empty.",
              press: "Empty, my prince. Whatever its lining may have been, it held nothing by the time it reached my table. I cannot log what is not there.",
            },
            {
              text: "I have burned nothing belonging to this case.",
              press: "Nothing. The Chancery keeps what the Chancery is given. That is what the Chancery is for.",
              breaks: "burning-at-dawn",
            },
            {
              text: "The warrant was issued in the ordinary way, on intelligence received.",
              press: "Vajragarh has friends, my prince. Friends do not care to have their names read aloud in a hall this size.",
            },
          ],
          hint: "Where was the Minister before first bell, and what was he doing with papers he read one sheet at a time?",
        },
        [
          line("arun", "Before first bell, Mantri, you stood at your brazier and fed it papers. One sheet at a time. You read each one before it burned."),
          say("For the length of a breath the Minister of Vajragarh has no face at all. Then it comes back, courteous and entire."),
          line("kaushal", "The Chancery burns seditious papers every dawn, my prince, by a law older than either of us. If the prince spends his nights at my shutters, he will see me do it again tomorrow."),
          say("It is a good answer. It is also an admission, and every lord along the wall heard the difference."),
          fx(stat({ renown: 2 }), sus(2), set("kaushalCaught", true)),
          when(has("cut-lining"), [
            choice("He has given ground. I could take more of it — the slit lining is still in my Case Book.", [
              {
                label: "“And the lining of the satchel? Was that burned by law too?”",
                detail: "Press while he's off balance. It will cost you.",
                fx: (s) => stat({ renown: 1 })(sus(1)(s)),
                then: [
                  line("kaushal", "Satchels wear, my prince. Couriers mend them. I am not a tailor."),
                  say("Rani Padmavati laughs once, softly, behind her fan. It is not at me."),
                ],
              },
              {
                label: "Let him have the last word",
                detail: "One wound is enough for one afternoon.",
                fx: sus(-1),
                then: [say("I incline my head a finger's width, as though I am satisfied. Kaushal returns the courtesy exactly. We both know what it cost him.")],
              },
            ]),
          ]),
        ],
        [
          say("I let the sentence pass. It sits in the air of the hall, smooth as oil, and no one wipes it away."),
          line("kaushal", "I thank the prince for his attention. It has been close."),
          fx(sus(-1)),
        ],
      ),
      line("bhanusen", "Go on, Mantri."),
    ],
  },

  // ─────────────────────────── 62. SHOW THE ASHES ───────────────────────────
  {
    n: 62,
    id: "e062-show-the-ashes",
    chapter: 7,
    title: "राख का पाठ · Show the Ashes",
    location: "hall",
    objective: "Decide what to do with what you saved from the brazier",
    cast: HALL,
    beats: [
      say("Kaushal speaks for a while of loyalty and roads. I am not listening. My hand is inside my sleeve, and my fingers are on what I took out of his ashes this morning."),
      when(
        has("decoded-fragment"),
        [
          say("Three lines of nonsense, turned eight places back around my mother's wheel, and they stop being nonsense. I have carried the plain words since the archive. They are heavier than the paper they are written on."),
          when(suspicionAt(7), [say("Two of the Minister's men have moved along the wall since the bell. They are nearer the steps than they were. Whatever I do next, it will be the last loud thing I can afford.")]),
          choice("The fragment: the road west, a name, a boy who asks questions.", [
            {
              label: "Read it aloud to the court",
              detail: "Everyone will hear it. Everyone. (Very dangerous.)",
              fx: (s) => set("fragment", "read")(sus(3)(stat({ renown: 1 })(s))),
              then: [
                line("arun", "Majesty. This was in the Minister's brazier at dawn. A letter in cipher, addressed by the courier's hand. I have read it. I will read it to you."),
                line("arun", "“The road west stays open. Tell Nilkanth the boy asks questions. Get him out before the wheel turns.”"),
                say("The hall has been quiet all day. This is a different quiet. It has a shape, and the shape is my father turning his head, slowly, first to me, and then to the steps where my brother stands."),
                say("Ranadhir has gone the colour of the stone behind him. He does not move. He does not look at me. He looks at the doors."),
                line("kaushal", "The prince has read us a spy's letter to her masters. I thank him. I could not have made the case better myself."),
                say("He is right, and he is not, and I do not know yet which is worse. Chaya has closed her eyes."),
                line("bhanusen", "Nilkanth."),
                say("He says it once, as if tasting it, and gives nothing back. Then he gestures for Kaushal to continue."),
              ],
            },
            {
              label: "Keep it",
              detail: "What you know is worth more while no one knows you know it.",
              fx: (s) => set("fragment", "kept")(stat({ cunning: 1 })(s)),
              then: [
                say("I take my hand out of my sleeve, empty. The fragment stays against my wrist, warm as a second pulse."),
                say("If anyone in this hall is waiting for me to say that name, they will wait until I choose the room."),
              ],
            },
            {
              label: "Hand it to the king, privately",
              detail: "Let him read it without the court watching him read it.",
              fx: (s) => set("fragment", "king")(sus(1)(s)),
              then: [
                say("I climb three steps, which is further than I am permitted, and hold out the paper at the height of his hand. The hall watches the paper, not the words."),
                say("My father reads it. He reads it twice. Then he folds it once, and again, and puts it inside his sleeve, and says nothing at all."),
                say("On the steps, my brother's eyes follow the paper into the king's sleeve and stay there."),
                line("bhanusen", "Sit down, Arunveer."),
              ],
            },
          ]),
        ],
        [
          when(
            hasAny("ash-fragment", "cipher-lines"),
            [
              say("Letters that make no words, and an address line in a courier's hand: for Nilkanth. I never turned the wheel on them. They are still nonsense, and nonsense is easy to laugh at in a hall."),
              choice("The unread cipher is in my sleeve.", [
                {
                  label: "Hold up the lines and name the address",
                  detail: "The Minister burned it. That much is true, even if you can't read it.",
                  fx: (s) => set("fragment", "read")(sus(2)(s)),
                  then: [
                    line("arun", "From the Minister's brazier, Majesty. Addressed “for Nilkanth, by the courier's hand.” Whatever it says, he wanted it gone."),
                    line("kaushal", "A page of gibberish from my ashes. The prince has become a sweep. I congratulate him on his new trade."),
                    say("They laugh, because they are permitted to. On the steps my brother does not laugh. I notice it only afterwards."),
                  ],
                },
                {
                  label: "Quote the one line you half-read",
                  detail: "Vidyadhar made out a few words. “The boy asks questions.”",
                  showIf: is("partialDecode"),
                  fx: (s) => set("fragment", "read")(sus(1)(stat({ renown: 1 })(s))),
                  then: [
                    line("arun", "A letter the Minister burned at dawn, Majesty. Most of it is cipher. But one line reads: “the boy asks questions.”"),
                    say("My father looks at me for a long moment, as though he agrees with the letter."),
                    line("bhanusen", "So he does."),
                  ],
                },
                {
                  label: "Keep it in your sleeve",
                  fx: (s) => set("fragment", "kept")(s),
                  then: [say("Nonsense is not evidence. I leave it where it is and hate myself a little for not sitting longer at Vidyadhar's table.")],
                },
              ]),
            ],
            [
              say("There is nothing in my sleeve. Whatever the Minister burned this morning, it is smoke, and I cannot hold smoke up to a king."),
              choice("Kaushal is watching me, waiting to see whether I have anything.", [
                {
                  label: "Meet his eyes as though you do",
                  detail: "A bluff. He cannot be sure what you saw.",
                  fx: (s) => set("fragment", "kept")(stat({ cunning: 1 })(sus(1)(s))),
                  then: [say("I hold his gaze and touch my sleeve, once, where a paper would be. His voice falters on the next word. Only one. It is enough to know he has something to fear.")],
                },
                {
                  label: "Look down",
                  fx: (s) => sus(-1)(s),
                  then: [say("I study the floor. Kaushal's voice goes on, smooth and unhurried, the voice of a man who has already been told there is nothing in anyone's sleeve.")],
                },
              ]),
            ],
          ),
        ],
      ),
    ],
  },

  // ─────────────────────────── 63. THE BURNED VILLAGES ───────────────────────────
  {
    n: 63,
    id: "e063-the-burned-villages",
    chapter: 7,
    title: "जले गाँव · The Burned Villages",
    location: "hall",
    objective: "Decide whether the court hears about the six villages",
    cast: HALL,
    beats: [
      line("kaushal", "And let no one forget what Meghadurg is. Six villages on our border, burned to the stone the year our queen was taken. We remember them every time we raise a cup."),
      say("There is a murmur of assent along the wall, the sound of men who have said this so often it has worn smooth in their mouths. Rao Jaswant strikes the floor once with his heel."),
      when(
        hasAny("soldiers-bounty", "ledger-page", "ugrasen-guilt"),
        [
          say((s) =>
            s.clues.includes("ledger-page")
              ? "The torn page is folded inside my belt. Six dates, six villages, silver to the Third Company for clearing. I can feel its edge every time I breathe."
              : s.clues.includes("soldiers-bounty")
                ? "Six dates in Bhairav's private hand. Six villages. Silver to the Third Company, for clearing. I don't have the page. I have the numbers, and I have the Treasurer's face across the hall."
                : "“I burned them. On your father's order.” The Senapati's words, said to me alone in a barracks that smelled of oil and iron. He is standing ten paces from the throne.",
          ),
          say("Senapati Ugrasen stands against the far pillar with his arms folded. He has not looked at me since the bell. I think he has been waiting for this moment since noon, the way a man waits for rain on a bad roof."),
          when(suspicionAt(6), [say("I know the arithmetic of this hall now. Another loud thing and I may not walk out of it on my own feet.")]),
          choice("The villages. Meghadurg did not burn them. My father's soldiers did.", [
            {
              label: "Expose it, here, now",
              detail: "The whole court hears who burned the villages. The king will not forgive it. (Extremely dangerous.)",
              fx: (s) => set("ledger", "exposed")(stat({ renown: 3 })(sus(s.flags.ugrasenSpeaks ? 3 : 4)(s))),
              then: [
                line("arun", "The villages were not burned by Meghadurg. They were burned by the Third Company, on six dates, for silver paid out of this treasury — for clearing."),
                when(has("ledger-page"), [
                  say("I unfold the page and hold it up to the light from the west windows. Bhairav's own hand. Bhairav's own columns. On the far wall the Treasurer has gone the grey of old dough."),
                ]),
                when(is("bhairavWay", "sworn"), [
                  say("I swore him silence at noon. I have just spent it in front of the king. He will not look at me again, I think, as long as he lives."),
                  fx(trust("bhairav", -3)),
                ]),
                line("jaswant", "Lies. Lies. My lord king — this boy — those villages were my people's kin — I rode against the river lords for them —"),
                say("He is roaring, and it is a real roar, and under it is something thinner: a man remembering who gave him the fields."),
                when(
                  is("ugrasenSpeaks"),
                  [
                    say("And then Ugrasen unfolds his arms, and steps out from the pillar, and the roar stops as if someone had closed a door on it."),
                    line("ugrasen", "The prince is right. I led the Third Company. We wore no colours. We shouted in the river tongue. I burned them."),
                    say("He does not say on whose order. He does not need to. He is looking at the throne."),
                    fx(trust("ugrasen", 1), set("ugrasenConfessed", true)),
                  ],
                  [
                    say("I look to the far pillar. Ugrasen is looking at the floor. Whatever he told me in the barracks, he is not going to tell the king's hall."),
                    line("kaushal", "A torn page. A drunk's story. Ledgers can be written by anyone with ink, my prince, as you of all people should know."),
                  ],
                ),
                say("My father lets the silence run until it is uncomfortable, and then a little further. Then he speaks, not loudly."),
                line("bhanusen", "This court tries a courier, not a king."),
                say("That is all. It is not a denial. Every lord along the wall hears that it is not a denial, and every one of them decides, at once, not to have heard."),
              ],
            },
            {
              label: "Hold it",
              detail: "Not in this room. Not yet. Evidence kept is evidence that can still be used.",
              fx: (s) => set("ledger", "held")(stat({ cunning: 1 })(s)),
              then: [
                say("I keep my mouth closed while Kaushal talks about the smell of burning thatch, which he has never smelled. Across the hall, Ugrasen's shoulders come down a finger's width."),
                when(has("ugrasen-guilt"), [fx(trust("ugrasen", 1))]),
              ],
            },
            {
              label: "Burn the page in the lamp beside you",
              detail: "Nobody will ever be able to use it. Not you. Not anyone.",
              showIf: has("ledger-page"),
              fx: (s) => set("ledger", "burned")(stat({ ruthlessness: 1 })(s)),
              then: [
                say("There is a brass lamp on the stand at my elbow. I feed the corner of the page into it while Kaushal talks about remembrance. It burns quickly. Bhairav's figures curl and go."),
                say("Across the hall the Treasurer watches the smoke rise and understands exactly what it is. I think he would kneel to me, if kneeling could be done without anyone seeing."),
                say("I have just done, for my own reasons, precisely what I caught the Minister doing at dawn. I note it. I don't let myself feel it yet."),
                fx(trust("bhairav", 2)),
              ],
            },
          ]),
        ],
        [
          when(
            hasAny("burned-remission", "jaswant-land", "soldier-confession"),
            [
              say("I know something is wrong with the story. A tax remitted, a lord's new fields, a soldier's mumbling — pieces, not proof. Not enough to say who held the torch."),
              choice("Kaushal's word hangs in the air: Meghadurg.", [
                {
                  label: "Ask who received the burned villages' lands",
                  detail: "A question, not an accusation. Lords hear the difference.",
                  fx: (s) => set("ledger", "held")(stat({ renown: 1 })(sus(1)(s))),
                  then: [
                    line("arun", "A small question, Mantri. When the villages were burned, to whom did their lands go?"),
                    say("Kaushal does not answer. He does not need to; Rao Jaswant answers for him, by turning red."),
                  ],
                },
                {
                  label: "Let the old story stand",
                  fx: (s) => set("ledger", "held")(sus(-1)(s)),
                  then: [say("I let it stand. It has stood for six years. It will stand another hour.")],
                },
              ]),
            ],
            [
              say("I have heard of the burned villages all my life. I have never once thought to ask who told me."),
              choice("The court remembers its six villages.", [
                {
                  label: "Bow your head with the court",
                  fx: (s) => sus(-1)(s),
                  then: [say("I bow my head with everyone else. It is the easiest thing I have done all day, which ought to have worried me more than it did.")],
                },
                {
                  label: "Watch Ugrasen while they remember",
                  fx: (s) => stat({ cunning: 1 })(s),
                  then: [say("Every head in the hall bows. The Senapati's does too — but he closes his eyes to do it, like a man with a pain in his side.")],
                },
              ]),
            ],
          ),
        ],
      ),
    ],
  },

  // ─────────────────────────── 64. RAO JASWANT DEMANDS BLOOD ───────────────────────────
  {
    n: 64,
    id: "e064-jaswant-demands-blood",
    chapter: 7,
    title: "रक्त की माँग · Rao Jaswant Demands Blood",
    location: "hall",
    objective: "Answer Rao Jaswant, or let him speak",
    cast: HALL,
    beats: [
      say((s) =>
        s.flags.ledger === "exposed"
          ? "Rao Jaswant asks leave to speak. He is still breathing hard. I think he needs her dead now more than he did this morning; a dead spy makes a very good wall to stand behind."
          : "Rao Jaswant asks leave to speak, and is given it, and steps into the middle of the floor as if it were his own courtyard.",
      ),
      line("jaswant", "Majesty. I buried cousins on that border. Six villages of them. Every month since, Meghadurg has sent its creatures up our roads to count our walls. Here is one. She was caught with the satchel on her shoulder."),
      line("jaswant", "I do not need a cipher to know what she is. Let the prince do his duty at sunset. Let the river lords hear of it by the next moon. Let them know Vajragarh still has teeth."),
      say("The hill lords stamp. It is a good speech. He has given it before, in other halls, over other prisoners."),
      choice("Every eye turns, as they have all day, to see whether the king's second son will answer.", [
        {
          label: "“Rao Jaswant speaks for the burned villages. He also farms them.”",
          detail: "His fields were the villages' fields.",
          requires: has("jaswant-land"),
          lockedReason: "You don't know where the villages' land went.",
          fx: (s) => set("jaswantShamed", true)(trust("padmavati", 1)(trust("jaswant", -2)(stat({ renown: 1 })(s)))),
          then: [
            line("arun", "The year after they burned, the Rao was granted their lands. He has grown rich on the ashes he is so eager to avenge. I wonder that he wants more fire."),
            say("Jaswant's mouth opens and nothing comes out. It is the only time I have ever seen that happen. The stamping stops."),
            line("jaswant", "The king rewarded my service —"),
            say("And there he stops, because it is not a thing a man can say twice in front of the king who did the rewarding."),
          ],
        },
        {
          label: "“Ask the salt caravans how many riders they have seen on that road.”",
          detail: "Ten years of Padmavati's drivers. Not one Meghadurg rider.",
          requires: has("padmavati-caravans"),
          lockedReason: "You have nothing on the western road but rumour.",
          fx: (s) => set("jaswantShamed", true)(trust("jaswant", -1)(stat({ renown: 1 })(s))),
          then: [
            line("arun", "The Rao speaks of creatures on our roads every month. Rani Padmavati's salt has gone down that road every month for ten years. Rani — how many Meghadurg riders have your drivers met?"),
            when(
              trusts("padmavati", 1),
              [
                line("padmavati", "None, my prince. Not one in ten years. I would have heard. I charge extra for danger."),
                say("There is a laugh from somewhere along the wall, quickly strangled. Jaswant's neck goes dark above his collar."),
                fx(trust("padmavati", 1)),
              ],
              [
                say("Padmavati looks at me for a long moment, the way she looks at a clerk who has quoted her prices to a rival. Then she answers, because it is true, and truth is cheaper than the alternative."),
                line("padmavati", "None."),
                fx(trust("padmavati", -1)),
              ],
            ),
          ],
        },
        {
          label: "Speak for her anyway",
          detail: "No evidence. Just a prince's word.",
          fx: (s) => sus(1)(s),
          then: [
            line("arun", "The Rao's grief is real. It does not make her guilty."),
            line("jaswant", "The prince has a soft heart. His mother had one. We know where it took her."),
            say("He has said it to hurt me, and he has succeeded, and the hall watches me be hurt, and I let it."),
          ],
        },
        {
          label: "Say nothing",
          detail: "Let the hill lords have their noise.",
          fx: (s) => sus(-1)(s),
          then: [say("I let him finish and bow to the throne. Jaswant looks almost disappointed. He had a second speech ready.")],
        },
      ]),
    ],
  },

  // ─────────────────────────── 65. THE PRIEST'S HESITATION ───────────────────────────
  {
    n: 65,
    id: "e065-the-priests-hesitation",
    chapter: 7,
    title: "पुरोहित का संकोच · The Priest's Hesitation",
    location: "hall",
    objective: "Watch the Rajpurohit answer the king",
    cast: HALL,
    beats: [
      line("bhanusen", "Rajpurohit. The sword will be blessed at sunset."),
      say("It is not a question. The king does not often ask questions in his hall. Devashrava steps forward in his saffron with the ash still on his brow from the noon rite."),
      when(
        or(is("priestTold"), trusts("devashrava", 2)),
        [
          line("devashrava", "It — it will, Majesty. At the lamp hour. The sword, the sacred thread, the — the wheel —"),
          say("He has stopped. His hand has gone to the seal-ring on his chain — the royal wheel, seven spokes — and he is looking at it as though he has never seen it before."),
          line("devashrava", "The rite asks that the wheel be whole, Majesty. The old texts ask — that is, the old rite asked —"),
          say("Kaushal has turned his head. So has my father. Very slowly, the whole hall is becoming aware that the Rajpurohit is frightened of something, and that it isn't the courier."),
          choice("He is drowning, in public, and he knows I know why.", [
            {
              label: "Rescue him",
              detail: "“The Rajpurohit means the rite needs the full sunset hour.”",
              fx: (s) => trust("devashrava", 2)(stat({ cunning: 1 })(s)),
              then: [
                line("arun", "The Rajpurohit told me this morning, Majesty, that the old rite asks for the whole of the sunset hour, not part of it. He is worried the court will run long."),
                line("devashrava", "Yes. Yes. The whole hour."),
                say("My father looks at me, and then at him, and lets it go. Devashrava does not look at me at all. His hands are shaking, and he folds them into his sleeves so that no one sees."),
              ],
            },
            {
              label: "Let him stumble",
              detail: "Every eye on him is an eye off you.",
              fx: (s) => sus(-1)(trust("devashrava", -1)(s)),
              then: [
                say("I say nothing. He stumbles on through three more half-sentences before Kaushal, gently, finishes the last one for him."),
                line("kaushal", "The Rajpurohit is tired. It has been a long day for the gods."),
                say("The eyes that were on me this afternoon are on him now. I feel them go. I am ashamed of how light it feels."),
              ],
            },
            {
              label: "“The wheel was cut before the funeral, wasn't it, Rajpurohit?”",
              detail: "Say it in front of the king. (Very dangerous. He will not forgive you.)",
              showIf: has("temple-register"),
              fx: (s) => set("registerSpoken", true)(trust("devashrava", -2)(stat({ renown: 2 })(sus(3)(s)))),
              then: [
                line("arun", "Your own register, Rajpurohit. The seven-spoked seal was consecrated three days before the old king's funeral rites. The spoke was not cut in mourning."),
                say("Devashrava looks at me as though I have taken a knife out of his own belt. He does not answer. He cannot."),
                line("bhanusen", "The Rajpurohit is unwell. See him to the temple."),
                say("Two guards come forward and take him gently by the elbows. My father has not raised his voice. He has not looked at me. That is how I know how badly I have done."),
              ],
            },
          ]),
        ],
        [
          line("devashrava", "It will, Majesty. At the lamp hour, with the sacred thread and the ghee lamp, as it was done for your father's sword, and his father's."),
          say("He says it smoothly, like a man reciting a list, and steps back. Whatever he fears about the wheel, he has not let me near enough to see it."),
          choice("He has blessed a great many swords.", [
            {
              label: "Ask whether the gods will bless this one",
              detail: "A question a priest cannot answer in this hall.",
              fx: (s) => stat({ renown: 1 })(sus(1)(s)),
              then: [
                line("arun", "Will they bless it, Rajpurohit? Your gods?"),
                line("devashrava", "The gods bless what kings ask them to, my prince. That is why there are kings."),
                say("He meant it as a rebuke. I think, afterwards, that he also meant it as an answer."),
              ],
            },
            {
              label: "Keep silent",
              fx: (s) => sus(-1)(s),
              then: [say("I keep silent. The sword is blessed already, in every way that matters in this room.")],
            },
          ]),
        ],
      ),
    ],
  },

  // ─────────────────────────── 66. THE PRISONER SPEAKS ───────────────────────────
  {
    n: 66,
    id: "e066-the-prisoner-speaks",
    chapter: 7,
    title: "बंदिनी बोलती है · The Prisoner Speaks",
    location: "hall",
    objective: "Ask the prisoner your one question",
    cast: HALL,
    beats: [
      line("bhanusen", "The prisoner may speak once. And my son may ask her one thing. One."),
      say("Chaya lifts her head. The bar of light has moved while we talked; it lies across her shoulders now, and her face is in shadow. Her voice is hoarse, but it carries. Couriers learn to be heard across a yard."),
      line("chaya", "I am Chaya. I carried letters for this house for ten years. I carried the last one I was given. I have never in my life opened a letter that was not mine. That is all I have to say."),
      when(is("promisedChaya", "truth"), [
        say("She looks at me when she finishes. I promised her this morning the truth would be said aloud in this hall. She is waiting to see whether I am a man who keeps that kind of promise."),
      ]),
      when(is("promisedChaya", "free"), [
        say("She doesn't look at me. I promised her this morning I would get her out. I think she has decided, sensibly, not to watch me fail."),
      ]),
      choice("One question. The whole court is listening.", [
        {
          label: "“Which way were you riding?”",
          fx: (s) => trust("chaya", 1)(s),
          then: [
            line("chaya", "Home."),
            when(
              is("vikramBroken"),
              [say("One word. Along the wall, the lords who heard Captain Vikram this morning look at each other. East. Into Vajragarh. Nobody flees home.")],
              [say("One word. It means nothing to anyone who has not stood at a stable and looked at a horse's feet. It means a great deal to me.")],
            ),
            fx(stat({ renown: 1 })),
          ],
        },
        {
          label: "“Who is Nilkanth?”",
          detail: "Say the name in open court.",
          requires: has("nilkanth"),
          lockedReason: "You have no name to ask about.",
          fx: (s) => sus(1)(s),
          then: [
            say("She is quiet so long that the king's fingers begin to move on the arm of his throne."),
            line("chaya", "A god."),
            when(
              statAt("cunning", 6),
              [
                say("I am not looking at her when she says it. I have learned something today, about where to look. I am looking at the hall."),
                say("Nobody moves. The lords don't know the name. Kaushal only narrows his eyes. And on the steps, one hand closes on the rail until the knuckles show pale."),
                say("My brother's hand."),
                fx(gain("ranadhir-flinch")),
              ],
              [
                say("I watch her face for the lie, and there isn't one, or there is and I can't find it. Somewhere behind me a rail creaks. By the time I turn, whatever it was is over."),
              ],
            ),
          ],
        },
        {
          label: "“Did you carry secrets out of Vajragarh?”",
          fx: (s) => stat({ renown: 1 })(s),
          then: [
            line("chaya", "I carried them in."),
            line("kaushal", "The prisoner will be silent."),
            say("She is silent. She has said four words and made the Minister of Vajragarh raise his voice, which I have not managed all day."),
          ],
        },
      ]),
      say("The guards step back to either side of her. She has had her one statement. I have had my one question. My father considers us both, and I cannot tell which of us he finds more tiresome."),
    ],
  },

  // ─────────────────────────── 67. THE VOICE OF THE LORDS ───────────────────────────
  {
    n: 67,
    id: "e067-the-voice-of-the-lords",
    chapter: 7,
    title: "सामंतों का मत · The Voice of the Lords",
    location: "hall",
    objective: "Hear the lords give their voices",
    cast: HALL,
    beats: [
      line("bhanusen", "I will hear my lords. Briefly."),
      say("It is a custom, not a law. He does not have to ask, and he does not have to listen. But he will remember who said what, and so will they."),
      choice("Before they speak, there is a moment when each of them looks for somewhere to put their eyes.", [
        {
          label: "Catch Rani Padmavati's eye",
          fx: (s) => trust("padmavati", 1)(s),
          then: [say("Padmavati meets my look and holds it, as if we were both bidding on the same cargo. Then she inclines her head. A small sum, pledged.")],
        },
        {
          label: "Catch Thakur Bhairav's eye",
          fx: (s) => trust("bhairav", 1)(s),
          then: [say("Bhairav is dabbing at his neck with a cloth. When he sees me looking, he stops, and lowers the cloth, and for once he doesn't look away.")],
        },
        {
          label: "Catch Senapati Ugrasen's eye",
          fx: (s) => trust("ugrasen", 1)(s),
          then: [say("The old soldier looks back at me across the hall the way he looked at me over the whetstone this morning. Measuring the edge.")],
        },
        {
          label: "Catch Rao Jaswant's eye",
          fx: (s) => trust("jaswant", 1)(s),
          then: [say("Jaswant stares back. Something in his jaw works, as though he is chewing on something he cannot swallow.")],
        },
        {
          label: "Look at no one",
          detail: "Let the lords be lords. Don't be seen canvassing.",
          fx: (s) => sus(-1)(s),
          then: [say("I look at the floor between my feet. If they speak for her, let it not be because the prince was seen asking.")],
        },
      ]),
      when(
        mercyFrom.jaswant,
        [line("jaswant", "I have spoken for death all afternoon. I — let the king decide. And let it be quick, whoever does it.")],
        [
          when(
            is("jaswantShamed"),
            [say("Rao Jaswant, when his turn comes, says only: “The king knows my mind.” He does not look up from his boots.")],
            [line("jaswant", "Death. By sunset. As the king has said.")],
          ),
        ],
      ),
      when(
        mercyFrom.padmavati,
        [line("padmavati", "Mercy, Majesty. Or if not mercy, patience. A dead courier tells no one anything, and I have never known silence to be good for trade.")],
        [line("padmavati", "The Rani of Sonkot has no voice in the king's justice, Majesty. Only in his customs duties.")],
      ),
      when(
        mercyFrom.bhairav,
        [
          line("bhairav", (s) =>
            s.flags.bhairavWay === "owned"
              ? "The treasury — the treasury sees no profit in her death, Majesty. None. I am — quite sure of it."
              : "Mercy, Majesty. I have counted a great many things today. I cannot make her guilt add up."),
        ],
        [line("bhairav", "The treasury has no opinion, Majesty. The treasury never has an opinion.")],
      ),
      when(
        mercyFrom.ugrasen,
        [line("ugrasen", "I have ended a great many lives on this kingdom's orders, Majesty. Not this one. Not by his hand. Mercy.")],
        [say("Senapati Ugrasen says nothing when his turn comes. He only looks at the sword across the king's knees, which he sharpened himself this morning.")],
      ),
      when(
        mercyFrom.devashrava,
        [line("devashrava", "The gods are slow to forgive a blood that is not owed, Majesty. I ask for mercy — as a priest, and as nothing more.")],
        [say("The Rajpurohit keeps his eyes lowered and his hands in his sleeves. The gods, it seems, abstain.")],
      ),
      when(
        mercyFrom.vikram,
        [line("vikram", "I took her, Majesty. She did not resist. She was riding east. I ask — mercy.")],
        [say("Captain Vikram, at the doors, stands like a spear and says nothing. It is not his place, and he knows it.")],
      ),
      fx((s) => set("mercyVoices", mercyCount(s))(s)),
      when(
        (s) => mercyCount(s) >= 3,
        [
          say((s) => `${mercyCount(s)} voices for mercy, in a hall where I would have wagered on none. I did not do it alone. I did not know, until I heard them, that I had done it at all.`),
          line("bhanusen", "This is not a council. It is my court."),
          say("He says it mildly. It is the first time today anyone has made him say anything he did not intend to."),
          fx(stat({ renown: 1 })),
        ],
        [
          when(
            (s) => mercyCount(s) >= 1,
            [say("A voice or two for mercy, soft in the long hall. My father listens to them the way he listens to rain against the shutters: without concern, and without hurry.")],
            [say("Not one voice for her. The hall has decided what it saw this morning, and nothing I did since has changed its mind.")],
          ),
        ],
      ),
    ],
  },

  // ─────────────────────────── 68. THE VERDICT ───────────────────────────
  {
    n: 68,
    id: "e068-the-verdict",
    chapter: 7,
    title: "निर्णय · The Verdict",
    location: "hall",
    objective: "Stand for the king's verdict",
    cast: HALL,
    beats: [
      say("My father rises. When he rises, everyone else in the hall becomes, briefly, a little shorter."),
      say((s) =>
        s.flags.kaushalCaught || s.flags.ledger === "exposed" || s.flags.fragment === "read" || mercyCount(s) >= 3
          ? "I have cut holes in the Minister's case all afternoon. The lords have watched me do it. I know, as he draws breath, that it has made no difference at all, because it was never the Minister's case."
          : "Nothing I have done today has touched the shape of this. I know it as he draws breath. I think I have known it since the bell.",
      ),
      line("bhanusen", "The court finds the courier Chaya guilty of carrying the realm's secrets to its enemy. She will die at sunset, in this hall. My son Arunveer will carry out the sentence, with my own sword."),
      say("Chaya does not move. She had not expected anything else. Of everyone in the hall, she is the only one who does not look at me."),
      choice("The hall is waiting to see what the king's second son does with his face.", [
        {
          label: "Bow",
          detail: "Let him think the lesson is being learned.",
          fx: (s) => sus(-1)(s),
          then: [
            say("I bow. It is the correct depth. I have been practising it since I was four."),
            line("bhanusen", "Good."),
          ],
        },
        {
          label: "Protest",
          detail: "Say it in front of them all. (Dangerous.)",
          fx: (s) => stat({ renown: 1 })(sus(2)(s)),
          then: [
            line("arun", "Majesty, the court has heard that she was riding home, that her papers were burned, that —"),
            line("bhanusen", "Noted."),
            say("One word, and the hall is over. He has not even looked at me. The lords file out past me as though I am a pillar."),
          ],
        },
        {
          label: "Look at Chaya",
          fx: (s) => trust("chaya", 1)(s),
          then: [
            say("I look at her, since no one else in the hall will."),
            when(
              is("promisedChaya", "free"),
              [say("She lifts her eyes once to mine and shakes her head, very slightly. Not a reproach. A release. You tried, it says. Stop.")],
              [say("After a long moment she looks back. There is no fear in it that I can see. Only a kind of patient interest, as though I am a road she hasn't finished travelling.")],
            ),
          ],
        },
      ]),
      say("The guards take her out by the side door. The bell sounds the end of the session. The sun is a hand's width lower than it was when we began."),
    ],
  },

  // ─────────────────────────── 69. KAUSHAL'S OFFER ───────────────────────────
  {
    n: 69,
    id: "e069-kaushals-offer",
    chapter: 7,
    title: "मंत्री का प्रस्ताव · Kaushal's Offer",
    location: "chancery",
    objective: "Answer the Minister's summons to the Chancery",
    cast: ["kaushal"],
    beats: [
      say("A clerk finds me in the colonnade: the Mantri asks whether the prince might spare him a moment. It is phrased as a question in the way the verdict was phrased as a verdict."),
      say((s) =>
        s.flags.brazier === "interrupted"
          ? "The brazier in the corner is cold now, and closed. He sees me look at it. He remembers this morning. So do I."
          : "The brazier in the corner is cold, its lid shut. The room smells of wax and old paper and, faintly, of ash.",
      ),
      line("kaushal", (s) =>
        s.flags.kaushalCaught
          ? "You embarrassed me today, my prince. I have not been embarrassed in a very long time. I found it instructive. Sit."
          : "You were very busy today, my prince. I admire industry. Sit."),
      line("kaushal", "I will be plain, since you like plainness. Your father wants to know if you can be a king. Strike tonight, cleanly, and I will see to it that the throne passes to you — over your brother. The king wills it. He only needs to be shown."),
      say("He lets it sit between us, a gift in good wrapping. Behind him, the lattice throws small diamonds of late light across his desk. One of them lies on the drawer I may or may not have opened."),
      choice("The Minister of Vajragarh is offering me my brother's crown.", [
        {
          label: "Accept",
          detail: "Say yes, whatever you mean by it.",
          fx: (s) => set("kaushalDeal", true)(stat({ ruthlessness: 2 })(sus(-1)(s))),
          then: [
            line("arun", "Then we understand each other, Mantri."),
            line("kaushal", "We do. My men will find other things to watch for an hour or two. Go and rest. You have a long evening."),
            say("I walk out into the colonnade and do not know, for the length of it, whether I have lied."),
          ],
        },
        {
          label: "Refuse",
          fx: (s) => trust("kaushal", -1)(s),
          then: [
            line("arun", "I won't buy a crown with her."),
            line("kaushal", "You will not be buying it, my prince. You will be refusing it. There is a difference in price. You will find that out."),
            say("He rises, which means I am dismissed. He opens the door for me himself. It is the most frightening courtesy I have ever been shown."),
          ],
        },
        {
          label: "“My brother proposed my exile.”",
          detail: "You read the margin of the draft.",
          requires: has("heir-proposed"),
          lockedReason: "You have no reason to think so.",
          then: [
            line("kaushal", "Your brother has proposed many things."),
            say("He says it without surprise, as though I have told him it is going to rain. He doesn't ask how I know. That is worse."),
            line("kaushal", "Some of them I have agreed with. Consider that he wants you gone, my prince, and I would prefer you stayed. Which of us is your friend?"),
            choice("His offer is still on the desk.", [
              {
                label: "Accept",
                fx: (s) => set("kaushalDeal", true)(stat({ ruthlessness: 2 })(sus(-1)(s))),
                then: [
                  line("arun", "Then we understand each other."),
                  line("kaushal", "We do. My men will look elsewhere for an hour. Rest."),
                ],
              },
              {
                label: "Refuse",
                fx: (s) => trust("kaushal", -1)(stat({ cunning: 1 })(s)),
                then: [
                  line("arun", "Neither of you, Mantri."),
                  line("kaushal", "A sound answer. It will not save you, but it is sound."),
                ],
              },
            ]),
          ],
        },
      ]),
    ],
  },

  // ─────────────────────────── 70. THE GAOL STAIR ───────────────────────────
  {
    n: 70,
    id: "e070-the-gaol-stair",
    chapter: 7,
    title: "कारागार की सीढ़ी · The Gaol Stair",
    location: "dungeon",
    objective: "Go down to the gaol",
    cast: ["karan", "chaya"],
    beats: [
      say("The stair is cooler than the hall. Down here the afternoon doesn't reach, and nobody has told the torches it is almost evening."),
      line("karan", (s) =>
        s.flags.karanWay === "wine"
          ? "Prince. Thought you'd come. I kept a cup back. No? Well. They've told me to have her washed and her hair bound. For the sword. So it doesn't catch."
          : s.flags.karanWay === "bribed"
            ? "Prince. You've paid for the stair once today, you needn't again. They've told me to have her washed and her hair bound. So it doesn't catch the blade."
            : "Highness. They've told me to have her washed and her hair bound before sunset. So it doesn't catch the blade. I'm to allow you a visit before then. Short."),
      line("karan", "The key's stayed on my ring since this morning, if you were going to ask. I've been sleeping with my hand on it. Not that I sleep."),
      say("Through the grille I can see her sitting against the back wall of cell three, knees drawn up, looking at nothing. She has heard every word. She's heard them all day."),
      choice("I have a few minutes and nothing that can change anything. Only small things.", [
        {
          label: "Bring her water",
          fx: (s) => set("chayaGift", "water")(trust("chaya", 1)(s)),
          then: [
            say("Karan fills a clay cup from the guardroom jar and gives it to me, not to her, so that it's mine to give. I pass it through the bars."),
            line("chaya", "The hall is dry. They never think of that."),
            say("She drinks all of it, slowly, and hands the cup back empty."),
          ],
        },
        {
          label: "Bring her bread",
          detail: "Sumitra's bread, or something from your own pocket.",
          requires: or(is("sumitraBread"), food(1)),
          lockedReason: "You have nothing to bring.",
          fx: (s) => {
            let t = set("chayaGift", "bread")(trust("chaya", 2)(s));
            if (!s.flags.sumitraBread) t = supply({ food: -1 })(t);
            return t;
          },
          then: [
            say((s) =>
              s.flags.sumitraBread
                ? "I break off the end of Sumitra's loaf — she will scold me for it, and then pack another — and pass it through the bars."
                : "I have a heel of bread in my pocket I meant for the road. I pass it through the bars instead."),
            say("Chaya holds it for a moment without eating. Then she smells it, and something in her face comes briefly undone."),
            line("chaya", "Kitchen bread. Sumitra's kitchen. She puts fennel in it. She always did."),
            say("She eats. I look away, because it seems the decent thing."),
          ],
        },
        {
          label: "Bring nothing",
          detail: "Gifts are for people you expect to see again.",
          fx: (s) => set("chayaGift", "nothing")(s),
          then: [
            say("I stand at the grille with empty hands. She looks up at them, then at me."),
            line("chaya", "Good. Don't start pretending now. It doesn't suit you."),
          ],
        },
      ]),
      line("karan", "Later, Highness. Before the lamps. I'll let you have her a little while. Not long."),
    ],
  },
];

