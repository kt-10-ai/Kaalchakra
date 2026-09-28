import type { Episode } from "../types";
import { CHAPTER_1 } from "./ch01";
import { CHAPTER_2 } from "./ch02";
import { CHAPTER_3 } from "./ch03";
import { CHAPTER_4 } from "./ch04";
import { CHAPTER_5 } from "./ch05";
import { CHAPTER_6 } from "./ch06";
import { CHAPTER_7 } from "./ch07";
import { CHAPTER_8 } from "./ch08";
import { CHAPTER_9 } from "./ch09";
import { CHAPTER_10 } from "./ch10";

export const EPISODES: Episode[] = [
  ...CHAPTER_1,
  ...CHAPTER_2,
  ...CHAPTER_3,
  ...CHAPTER_4,
  ...CHAPTER_5,
  ...CHAPTER_6,
  ...CHAPTER_7,
  ...CHAPTER_8,
  ...CHAPTER_9,
  ...CHAPTER_10,
].sort((a, b) => a.n - b.n);

export const CHAPTERS: { n: number; title: string; hour: number }[] = [
  { n: 1, title: "रात्रि का अंतिम पहर · The Last Watch", hour: 4.6 },
  { n: 2, title: "प्रातः सभा · The Morning Court", hour: 7 },
  { n: 3, title: "अभिलेखागार · The Archive", hour: 9 },
  { n: 4, title: "रानी का उपवन · The Queen's Garden", hour: 10.5 },
  { n: 5, title: "मध्याह्न · Noon", hour: 12 },
  { n: 6, title: "सेना और प्राचीर · The Barracks & the Walls", hour: 14 },
  { n: 7, title: "दूसरी सभा · The Afternoon Court", hour: 15.5 },
  { n: 8, title: "भाई · The Brother", hour: 16.6 },
  { n: 9, title: "संध्या · Before Sunset", hour: 17.6 },
  { n: 10, title: "तलवार · The Sword", hour: 18.3 },
];
