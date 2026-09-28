export type ClueKind = "document" | "testimony" | "object" | "observation";

export interface Clue {
  id: string;
  kind: ClueKind;
  title: string;
  text: string;
}

/**
 * Every piece of evidence Arun can gather in the one day of the trial. Episode
 * files reference these ids; nothing else should invent new ones without adding
 * them here.
 */
export const CLUES: Clue[] = [
  // ── the arrest ──
  { id: "balcony-watcher", kind: "observation", title: "Ranadhir on the Balcony", text: "At the last watch, while the prisoner was led through the courtyard, my brother watched from the east balcony. When she looked up at him, he stepped back into the dark." },
  { id: "arrest-report", kind: "testimony", title: "Captain Vikram's Report", text: "Taken at the western ford at dusk, three days ago. Vikram says she was riding west, toward Meghadurg. Her satchel was sealed; he delivered it unopened to the Minister." },
  { id: "early-warrant", kind: "testimony", title: "The Early Warrant", text: "The Minister's warrant for her arrest was signed three days before she was seen at the border. Someone knew she was coming." },
  { id: "new-horseshoes", kind: "observation", title: "Meghadurg Horseshoes", text: "Her horse wears river-country shoes — broad, flat-nailed, the kind no smith in Vajragarh makes. Fresh: a week at most. She had been in Meghadurg and was on her way back." },
  { id: "chaya-said-east", kind: "testimony", title: "“I Was Coming Home”", text: "When I told her about the horseshoes, the prisoner said only: “I was coming home.” Not fleeing west. Riding east, into Vajragarh." },
  { id: "satchel-empty", kind: "document", title: "Logged Empty", text: "The Chancery's register records the courier's satchel as received sealed and found empty. The Minister calls this proof she had already delivered her secrets." },
  { id: "cut-lining", kind: "object", title: "The Cut Lining", text: "The satchel's lining has been slit and roughly re-stitched. Something was sewn inside it, and someone removed it before it was logged as empty." },
  // ── the ashes ──
  { id: "burning-at-dawn", kind: "observation", title: "The Minister's Brazier", text: "Before first bell, Mantri Kaushal fed papers into the Chancery brazier by lamplight, one sheet at a time, reading each before he burned it." },
  { id: "ash-fragment", kind: "document", title: "The Ash Fragment", text: "Five half-burned pieces from the brazier, fitted together: an address line — “for Nilkanth, by the courier's hand” — above three lines of cipher." },
  { id: "cipher-lines", kind: "document", title: "The Cipher Lines", text: "Three lines of letters that make no words. The shape of it is a wheel cipher — each letter turned some number of places around a ring." },
  { id: "nilkanth", kind: "document", title: "Nilkanth", text: "The name the burned letter was addressed to. I have never heard it used for any person at court." },
  { id: "decoded-fragment", kind: "document", title: "The Decoded Lines", text: "“The road west stays open. Tell Nilkanth the boy asks questions. Get him out before the wheel turns.”" },
  { id: "courier-copy", kind: "observation", title: "A Courier's Copy", text: "The ash fragment is in Chaya's hand. Royal couriers re-copy ciphered letters in their own hand so the true writer can't be traced. Whoever wrote it, it wasn't her — though the loop of the N in Nilkanth is the loop my mother taught me." },
  { id: "river-ink", kind: "observation", title: "River Ink", text: "Vidyadhar says the fragment was written in blue-green river ink, pressed from a plant that grows only on Meghadurg's side of the water." },
  // ── the queen ──
  { id: "chaya-queens-courier", kind: "testimony", title: "The Queen's Courier", text: "Sumitra: Chaya carried my mother's private letters for years. She was dismissed four years ago — two years after my mother's death — “for a letter she wouldn't burn.”" },
  { id: "nilkanth-lullaby", kind: "testimony", title: "The Lullaby", text: "Sumitra: Nilkanth is the blue-throated one, who swallowed the poison so the world could live. My mother sang it to both her sons at bedtime. Nobody else at court would know it as a name." },
  { id: "queen-door-resealed", kind: "observation", title: "The Resealed Door", text: "The wax on my mother's apartment door was broken and remade — recently, hurriedly, in a slightly darker wax. Someone has been inside her rooms." },
  { id: "missing-wheel", kind: "observation", title: "The Shape in the Dust", text: "On my mother's writing desk, six years of dust — except for a clean ring the size of a palm, where something round lay until a few days ago. Her brass cipher wheel is gone." },
  { id: "queen-lesson", kind: "testimony", title: "Her Lesson", text: "What she told me at that desk when I was seven: “Turn the wheel once around for every spoke, little one. Eight spokes, eight letters on. A whole wheel.”" },
  { id: "closed-pyre", kind: "testimony", title: "The Closed Pyre", text: "Sumitra was told she had washed the queen for her pyre. She never washed anyone. The body was brought in wrapped, and the pyre was lit closed, by the king's order, before anyone saw her face." },
  { id: "lullaby-verse", kind: "document", title: "The Hidden Verse", text: "Put in order, the lullaby tells where something was hidden: “under the blue stone, where the river bends” — the blue tile at the bend of the garden channel." },
  { id: "queens-box-letter", kind: "document", title: "Her Letter to Me", text: "From the iron box under the blue stone, in my mother's hand, six years old: “If they tell you I died, do not believe the manner of it. Believe the love. Ask Vidyadhar about the night of the Accession. And look after your brother — he is braver than he lets anyone see.”" },
  // ── the seal ──
  { id: "old-charters", kind: "document", title: "The Eight Spokes", text: "Every royal charter in the archive older than twenty-two years bears the wheel whole: eight spokes. Every one since bears seven. The change came in the year of the Accession." },
  { id: "mourning-story", kind: "testimony", title: "The Mourning Story", text: "Kaushal: a spoke was cut from the royal wheel in mourning for the old king, “so the realm would remember its loss every time it pressed wax.”" },
  { id: "temple-register", kind: "document", title: "The Temple Register", text: "The priests' register of royal rites: the new seven-spoked seal was consecrated three days BEFORE the old king's funeral rites. The spoke was not cut in mourning. It was cut before anyone was told he had died." },
  { id: "accession-night", kind: "testimony", title: "The Night of the Accession", text: "Devashrava, frightened: “There was a night. The old king's line did not end in its bed.” He would say nothing more." },
  // ── the villages ──
  { id: "padmavati-caravans", kind: "testimony", title: "The Salt Caravans", text: "Rani Padmavati's salt caravans have run the western road every month for ten years. In all that time, not one of her drivers has seen a Meghadurg rider on it." },
  { id: "jaswant-land", kind: "testimony", title: "Jaswant's Fields", text: "Rao Jaswant was granted the lands of the six burned border villages the year after they burned. He calls it his reward for avenging the queen." },
  { id: "burned-remission", kind: "document", title: "The Remission", text: "The official treasury ledger: tax remitted on six border villages “burned by Meghadurg riders,” in the year of my mother's death." },
  { id: "soldiers-bounty", kind: "document", title: "Payment for Clearing", text: "Thakur Bhairav's private ledger: silver paid to the Senapati's Third Company “for clearing,” on the same six dates, for the same six villages." },
  { id: "ledger-page", kind: "object", title: "The Torn Page", text: "The page itself, torn from Bhairav's private book. Proof in ink — if I dare show it." },
  { id: "soldier-confession", kind: "testimony", title: "Bhola's Story", text: "An old soldier of the Third Company, drunk at noon: they rode out in unmarked cloaks, and they were told to shout in the river dialect while they did it." },
  { id: "ugrasen-guilt", kind: "testimony", title: "The Senapati's Admission", text: "Ugrasen: “I burned them. On your father's order. The riders your mother supposedly died to avenge were mine.”" },
  // ── the night visitor ──
  { id: "dungeon-visitor", kind: "testimony", title: "The Night Visitor", text: "Karan the gaoler: at the last watch someone came down the stair with a royal token and sent him up to the guardroom. He didn't see a face. He smelled oil — sandalwood." },
  { id: "missing-key", kind: "testimony", title: "The Missing Key", text: "For an hour of the last watch, the key to cell three was not on Karan's ring. It was back by first bell. He swears he never took it off." },
  { id: "king-token", kind: "observation", title: "The Royal Token", text: "Only three people carry a token that opens the lower cells without question: the king, the Minister, and the heir." },
  { id: "sandal-oil", kind: "observation", title: "Sandalwood Oil", text: "The temple burns sandalwood with agar resin — smoke, not oil. Pure sandalwood oil is what Ranadhir has worn since he was fifteen." },
  { id: "ranadhir-ink", kind: "observation", title: "Blue-Green Fingers", text: "At the noon meal my brother's writing fingers were stained blue-green — not the soot-black ink of the Chancery." },
  { id: "heir-countersign", kind: "document", title: "The Countersign", text: "Captain Vikram's copy of the arrest warrant bears the Minister's seal — and the heir's countersign. Ranadhir signed the order that brought her in." },
  { id: "ranadhir-flinch", kind: "observation", title: "The Flinch", text: "When Chaya said “Nilkanth” in open court, only one person in the hall reacted. My brother's hand closed on the rail." },
  // ── the king's plan ──
  { id: "king-test", kind: "testimony", title: "The King's Test", text: "Ugrasen, quoting the king: “If the boy cannot end one life, he has no business with a crown.” The execution is not about her. It is about me." },
  { id: "horse-readied", kind: "testimony", title: "A Horse for the Prince", text: "Moti: the grey was ordered saddled and fed for a long road, ready at the gate by dusk — “for the prince.” Ordered this morning, before the trial began." },
  { id: "king-draft", kind: "document", title: "The Draft Sentence", text: "In the Minister's desk, dated this morning, before the trial: “The prince Arunveer, having refused the king's justice, shall be sent west with nothing…” The sentence was written before I was asked to do anything." },
  { id: "heir-proposed", kind: "document", title: "“As the Heir Proposed”", text: "A note in the margin of the draft, in Kaushal's hand: “the errand to Meghadurg — as the heir proposed.” My brother suggested my exile." },
  { id: "mountain-road", kind: "testimony", title: "A Mountain Road", text: "Nandini overheard two of Kaushal's men: before this errand was proposed, there was talk of the prince having “an accident on a mountain road.”" },
];

export const CLUE_BY_ID: Record<string, Clue> = Object.fromEntries(CLUES.map((c) => [c.id, c]));
