export type Book = {
  id: string;
  title: string;
  wordCount: number;
  coverUrl: string;
  bookId: string;
  tags: string;
};

export type Word = {
  id: number;
  wordRank: number;
  headWord: string;
  bookId: string;
  content: {
    word: {
      wordHead: string;
      content: {
        usphone?: string;
        ukphone?: string;
        trans: { tranCn: string; tranOther?: string }[];
        sentence: { sentences: { sContent: string; sCn: string }[] };
        syno?: { synos: { pos: string; tran: string; hwds: { w: string }[] }[] };
        relWord?: { rels: { pos: string; words: { hwd: string; tran: string }[] }[] };
        remMethod?: { val: string };
      };
    };
  };
};

export const books: Book[] = [
  { id: "book-001", title: "人教版小学英语 · 三年级下册", wordCount: 64, coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85", bookId: "PEPXiaoXue3_1", tags: "小学,人教版,英语" },
  { id: "book-002", title: "大学英语四级核心词汇", wordCount: 1200, coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=85", bookId: "CET4_CORE", tags: "大学,四级,考试" },
  { id: "book-003", title: "旅行场景实用词汇", wordCount: 380, coverUrl: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=85", bookId: "TRAVEL_ESSENTIAL", tags: "旅行,场景,口语" },
  { id: "book-004", title: "托福学术词汇精选", wordCount: 860, coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=900&q=85", bookId: "TOEFL_ACADEMIC", tags: "托福,学术,考试" },
];

const details = [
  ["ruler", "'rulɚ", "'ruːlə", "尺子", "a long flat straight piece used for measuring things", "a 12-inch ruler", "一把12英寸的尺子"],
  ["pencil", "'pɛnsl", "'pensəl", "铅笔", "an instrument used for writing or drawing", "a sharp pencil", "尖尖的铅笔"],
  ["eraser", "ɪ'resɚ", "ɪ'reɪzə", "橡皮", "a small piece of rubber used to remove marks", "Trust is like an eraser.", "信任就像橡皮擦。"],
  ["crayon", "kreən", "ˈkreɪən", "蜡笔", "a stick of coloured wax used for drawing", "He coloured the picture with crayon.", "他用蜡笔给画上色。"],
  ["bag", "bæɡ", "bæɡ", "包", "a flexible container with a single opening", "I took the gift out of my bag.", "我把礼物从我的包里拿出来。"],
  ["pen", "pɛn", "pen", "钢笔", "an instrument for writing or drawing with ink", "a ballpoint pen", "圆珠笔"],
];

export const words: Word[] = details.map((item, index) => ({
  id: index + 1,
  wordRank: index + 1,
  headWord: item[0],
  bookId: "PEPXiaoXue3_1",
  content: { word: { wordHead: item[0], content: { usphone: item[1], ukphone: item[2], trans: [{ tranCn: item[3], tranOther: item[4] }], sentence: { sentences: [{ sContent: item[5], sCn: item[6] }] }, syno: { synos: [{ pos: "n", tran: item[3], hwds: [{ w: item[0] }] }] }, relWord: { rels: [{ pos: "n", words: [{ hwd: `${item[0]}ing`, tran: `related to ${item[0]}` }] }] }, remMethod: { val: `把 ${item[0]} 放进你的日常场景里，记忆会更牢。` } } } },
}));

export const mockProgress: Record<string, number> = { "book-001": 25, "book-002": 0, "book-003": 86, "book-004": 12 };
