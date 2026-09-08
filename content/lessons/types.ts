export type CodeExample = {
  title: string;
  language: string;
  code: string;
  explanation?: string;
};

export type KeyTerm = {
  term: string;
  definition: string;
};

export type CommonMistake = {
  title: string;
  explanation: string;
};

export type QuickCheck = {
  question: string;
  code?: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type LessonContent = {
  slug: string;
  intuitiveExplanation: string[];
  academicExplanation: string[];
  codeExamples: CodeExample[];
  keyTerms: KeyTerm[];
  commonMistakes: CommonMistake[];
  quickChecks: QuickCheck[];
};

export type LessonSource = {
  title: string;
  publisher: string | null;
  url: string;
  sourceType: "documentation" | "textbook" | "course" | "article";
  relevanceNote: string | null;
};

export type DeliveredLesson = {
  slug: string;
  title: string;
  summary: string | null;
  estimatedMinutes: number;
  module: {
    slug: string;
    title: string;
    position: number;
  };
  content: LessonContent;
  sources: LessonSource[];
};
