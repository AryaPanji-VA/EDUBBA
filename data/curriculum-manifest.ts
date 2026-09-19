// Phase 13.3: typed curriculum manifest — STRUCTURE and PROVENANCE only.
// This is the ingestion-side representation of the official curriculum:
// Semester -> Course -> Module -> Lesson. It deliberately does NOT carry
// lesson learning content (activities, mastery, Robin Check configuration);
// those live in the lesson architecture and are never curriculum data.
//
// Provenance answers "where did this structure come from?":
//   - official      : trusted university curriculum data
//   - instructor    : lecturer-provided material
//   - study-context : useful material that is NOT an official course/module
//   - robin         : ROBIN-created learning structure or content
// A ROBIN-generated entry never automatically becomes official curriculum.
//
// `currentCurriculumManifest` mirrors the CURRENT database state exactly
// (database/seed.sql, phase4-seed.sql, phase13-semesters.sql). It is the
// baseline snapshot for future ingestion diffs — it does not create anything.

export const curriculumProvenanceSourceTypes = ["official", "instructor", "study-context", "robin"] as const;
export type CurriculumProvenanceSourceType = (typeof curriculumProvenanceSourceTypes)[number];

export type CurriculumProvenance = {
  sourceType: CurriculumProvenanceSourceType;
  sourceLabel: string;
  sourceUrl?: string;
  verifiedAt?: string;
};

export type LessonManifest = {
  slug: string;
  title: string;
  summary?: string;
  estimatedMinutes?: number;
  position: number;
  provenance: CurriculumProvenance;
};

export type ModuleManifest = {
  slug: string;
  title: string;
  description?: string;
  position: number;
  lessons: LessonManifest[];
  provenance: CurriculumProvenance;
};

export type CourseManifest = {
  slug: string;
  title: string;
  description: string;
  totalLessons?: number;
  modules: ModuleManifest[];
  provenance: CurriculumProvenance;
};

export type SemesterManifest = {
  number: number;
  title: string;
  courses: CourseManifest[];
  provenance?: CurriculumProvenance;
};

export type CurriculumManifest = {
  semesters: SemesterManifest[];
};

// --- Provenance labels for the current known database state ---

const officialProgramStructure: CurriculumProvenance = {
  sourceType: "official",
  sourceLabel: "Official 8-semester program structure (database/phase13-semesters.sql)",
};

const officialSemester1Courses: CurriculumProvenance = {
  sourceType: "official",
  sourceLabel: "Official Semester 1 course list (database/seed.sql)",
};

// Programming's module/lesson structure is ROBIN's learning organization of
// the official course — the official curriculum specifies the course, ROBIN
// provides the learning structure. This distinction is intentional.
const robinLearningStructure: CurriculumProvenance = {
  sourceType: "robin",
  sourceLabel: "ROBIN learning structure for the official course (database/phase4-seed.sql)",
};

// Same honest provenance for the Phase 14B Discrete Mathematics structure:
// the official curriculum specifies the course; the Logic Foundations module
// and the Propositions lesson are ROBIN's learning structure, never official.
const robinDiscreteMathStructure: CurriculumProvenance = {
  sourceType: "robin",
  sourceLabel: "ROBIN learning structure for the official Discrete Mathematics course (Phase 14B)",
};

// Phase 15: ROBIN-created introductory learning structure for the remaining
// official Semester 1 courses. The official curriculum specifies the courses;
// every module and lesson below is ROBIN's own learning design, never
// official university curriculum.
const robinPhase15Structure: CurriculumProvenance = {
  sourceType: "robin",
  sourceLabel: "ROBIN learning structure for the official course (Phase 15)",
};

// --- Current known curriculum state (mirrors the database) ---

export const currentCurriculumManifest: CurriculumManifest = {
  semesters: [
    {
      number: 1,
      title: "Semester 1",
      provenance: officialProgramStructure,
      courses: [
        {
          slug: "programming",
          title: "Foundations of Programming Language",
          description: "Build the mental model behind code, from values and variables to functions.",
          totalLessons: 16,
          provenance: officialSemester1Courses,
          modules: [
            {
              slug: "programming-fundamentals",
              title: "Programming Fundamentals",
              description: "Core ideas and vocabulary behind programming.",
              position: 1,
              provenance: robinLearningStructure,
              lessons: [
                { slug: "what-is-programming", title: "What is Programming?", summary: "Build a useful definition of programming.", estimatedMinutes: 10, position: 1, provenance: robinLearningStructure },
                { slug: "hello-python", title: "Kenalan dengan Python", summary: "Kenali Python sebagai bahasa, tulis instruksi pertama, dan lihat code berubah jadi output.", estimatedMinutes: 12, position: 2, provenance: robinLearningStructure },
                { slug: "print-output", title: "Output with print()", summary: "Minta Python menampilkan sesuatu dengan print(), dan bedakan code dari output.", estimatedMinutes: 12, position: 3, provenance: robinLearningStructure },
                { slug: "syntax-indentation", title: "Syntax & Indentation", summary: "Python peduli bagaimana code ditulis dan disusun — kenal syntax dan indentation.", estimatedMinutes: 12, position: 4, provenance: robinLearningStructure },
                { slug: "comments", title: "Comments", summary: "Tinggalkan catatan untuk manusia di dalam code — dan lihat Python melewatinya.", estimatedMinutes: 10, position: 5, provenance: robinLearningStructure },
                { slug: "understanding-errors", title: "Understanding Errors", summary: "Error itu petunjuk, bukan kegagalan — baca pesannya, perbaiki, jalankan lagi.", estimatedMinutes: 12, position: 6, provenance: robinLearningStructure },
                { slug: "programming-languages", title: "Programming Languages", summary: "See why different programming languages exist.", estimatedMinutes: 12, position: 7, provenance: robinLearningStructure },
                { slug: "syntax-vs-semantics", title: "Syntax vs Semantics", summary: "Separate how code is written from what it means.", estimatedMinutes: 12, position: 8, provenance: robinLearningStructure },
              ],
            },
            {
              slug: "how-programs-run",
              title: "How Programs Run",
              description: "Follow source code as a computer turns it into instructions.",
              position: 2,
              provenance: robinLearningStructure,
              lessons: [
                { slug: "compiler-vs-interpreter", title: "Compiler vs Interpreter", summary: "Compare two ways source code becomes executable work.", estimatedMinutes: 14, position: 1, provenance: robinLearningStructure },
                { slug: "source-code-to-program-execution", title: "Source Code to Program Execution", summary: "Trace the journey from a file to a running program.", estimatedMinutes: 14, position: 2, provenance: robinLearningStructure },
              ],
            },
            {
              slug: "programming-building-blocks",
              title: "Programming Building Blocks",
              description: "The reusable pieces found in everyday programs.",
              position: 3,
              provenance: robinLearningStructure,
              lessons: [
                { slug: "variables", title: "Variables", summary: "Give values names so a program can reuse them.", estimatedMinutes: 18, position: 1, provenance: robinLearningStructure },
                { slug: "data-types", title: "Data Types", summary: "Describe the kinds of values a program can handle.", estimatedMinutes: 14, position: 2, provenance: robinLearningStructure },
                { slug: "operators", title: "Operators", summary: "Transform and compare values with operators.", estimatedMinutes: 12, position: 3, provenance: robinLearningStructure },
                { slug: "conditionals", title: "Conditionals", summary: "Let a program choose what happens next.", estimatedMinutes: 16, position: 4, provenance: robinLearningStructure },
                { slug: "loops", title: "Loops", summary: "Repeat work without repeating code by hand.", estimatedMinutes: 16, position: 5, provenance: robinLearningStructure },
                { slug: "functions", title: "Functions", summary: "Package reusable behavior behind a clear name.", estimatedMinutes: 18, position: 6, provenance: robinLearningStructure },
              ],
            },
          ],
        },
        {
          slug: "design-thinking",
          title: "Design Thinking",
          description: "Turn fuzzy human problems into ideas you can test and improve.",
          totalLessons: 8,
          provenance: officialSemester1Courses,
          modules: [
            {
              slug: "design-thinking-foundations",
              title: "Design Thinking Foundations",
              description: "The human-centered, iterative loop from problem to tested idea.",
              position: 1,
              provenance: robinPhase15Structure,
              lessons: [
                { slug: "what-is-design-thinking", title: "What is Design Thinking?", summary: "Human-centered and iterative: the loop, not the pipeline.", estimatedMinutes: 14, position: 1, provenance: robinPhase15Structure },
                { slug: "empathy-and-define", title: "Empathy and Define", summary: "Separate observations from assumptions; write a POV problem statement.", estimatedMinutes: 16, position: 2, provenance: robinPhase15Structure },
                { slug: "ideate-prototype-test", title: "Ideate, Prototype, Test", summary: "Diverge before converging; prototype one question; test by watching.", estimatedMinutes: 16, position: 3, provenance: robinPhase15Structure },
              ],
            },
          ],
        },
        {
          slug: "discrete-math",
          title: "Discrete Mathematics",
          description: "Logic, sets, relations, and the mathematical language of computing.",
          totalLessons: 12,
          provenance: officialSemester1Courses,
          modules: [
            {
              slug: "logic-foundations",
              title: "Logic Foundations",
              description: "Propositions and the basic connectives of propositional logic.",
              position: 1,
              provenance: robinDiscreteMathStructure,
              lessons: [
                { slug: "propositions", title: "Propositions and Connectives", summary: "Distinguish propositions and evaluate negation, conjunction, and disjunction.", estimatedMinutes: 16, position: 1, provenance: robinDiscreteMathStructure },
                { slug: "implication", title: "Implication and Equivalence", summary: "Truth conditions of p → q, vacuous truth, the converse, and p ↔ q.", estimatedMinutes: 16, position: 2, provenance: robinPhase15Structure },
              ],
            },
            {
              slug: "sets-and-relations",
              title: "Sets and Relations",
              description: "Sets, membership, subsets, and the beginnings of relations.",
              position: 2,
              provenance: robinPhase15Structure,
              lessons: [
                { slug: "sets-intro", title: "Introduction to Sets", summary: "Sets, membership (∈), subsets (⊆), and the empty set.", estimatedMinutes: 14, position: 1, provenance: robinPhase15Structure },
              ],
            },
          ],
        },
        {
          slug: "hci",
          title: "Human-Computer Interaction",
          description: "Understand how people experience, use, and sometimes fight with software.",
          totalLessons: 9,
          provenance: officialSemester1Courses,
          modules: [
            {
              slug: "hci-foundations",
              title: "HCI Foundations",
              description: "Usability, the interaction, affordances, feedback, and evaluation.",
              position: 1,
              provenance: robinPhase15Structure,
              lessons: [
                { slug: "hci-intro", title: "What HCI Studies", summary: "Usability lives in the interaction, not in the user.", estimatedMinutes: 14, position: 1, provenance: robinPhase15Structure },
                { slug: "affordances-and-feedback", title: "Affordances and Feedback", summary: "What form promises and what systems must answer.", estimatedMinutes: 15, position: 2, provenance: robinPhase15Structure },
                { slug: "interface-evaluation", title: "Evaluating Interfaces", summary: "Usability testing and heuristic evaluation, combined.", estimatedMinutes: 15, position: 3, provenance: robinPhase15Structure },
              ],
            },
          ],
        },
        {
          slug: "algorithms",
          title: "Algorithms Foundations",
          description: "Learn to describe, compare, and reason about problem-solving procedures.",
          totalLessons: 11,
          provenance: officialSemester1Courses,
          modules: [
            {
              slug: "algorithmic-thinking",
              title: "Algorithmic Thinking",
              description: "Procedures, their notation, execution by hand, and the feel of cost.",
              position: 1,
              provenance: robinPhase15Structure,
              lessons: [
                { slug: "what-is-an-algorithm", title: "What is an Algorithm?", summary: "Defined input, unambiguous steps, guaranteed output, termination.", estimatedMinutes: 14, position: 1, provenance: robinPhase15Structure },
                { slug: "pseudocode-and-tracing", title: "Pseudocode and Tracing", summary: "Write the plan precisely; check it by executing on paper.", estimatedMinutes: 16, position: 2, provenance: robinPhase15Structure },
                { slug: "efficiency-intuition", title: "Efficiency Intuition", summary: "Count growth, not seconds: linear vs logarithmic work.", estimatedMinutes: 15, position: 3, provenance: robinPhase15Structure },
              ],
            },
          ],
        },
        {
          slug: "parallel",
          title: "Parallel and Distributed Computing",
          description: "Explore how many computers and processes coordinate useful work.",
          totalLessons: 10,
          provenance: officialSemester1Courses,
          modules: [
            {
              slug: "parallel-and-distributed-foundations",
              title: "Parallel and Distributed Foundations",
              description: "Independence, coordination, and partial failure across machines.",
              position: 1,
              provenance: robinPhase15Structure,
              lessons: [
                { slug: "sequential-vs-parallel", title: "Sequential vs Parallel", summary: "Independence buys time; the sequential part sets the floor.", estimatedMinutes: 15, position: 1, provenance: robinPhase15Structure },
                { slug: "distributed-basics", title: "Distributed Basics", summary: "Machines coordinating by messages, surviving partial failure.", estimatedMinutes: 16, position: 2, provenance: robinPhase15Structure },
              ],
            },
          ],
        },
        {
          slug: "networking",
          title: "Networking and Communication",
          description: "Follow data as it moves between devices, protocols, and people.",
          totalLessons: 10,
          provenance: officialSemester1Courses,
          modules: [
            {
              slug: "network-foundations",
              title: "Network Foundations",
              description: "Nodes, links, protocols, packets, clients, servers, and layers.",
              position: 1,
              provenance: robinPhase15Structure,
              lessons: [
                { slug: "what-is-a-network", title: "What is a Network?", summary: "Nodes, links, and the protocols that make connection into communication.", estimatedMinutes: 14, position: 1, provenance: robinPhase15Structure },
                { slug: "packets-and-protocols", title: "Packets and Protocols", summary: "Small numbered envelopes: independent routing, local loss.", estimatedMinutes: 15, position: 2, provenance: robinPhase15Structure },
                { slug: "client-server-and-layers", title: "Client-Server and Layers", summary: "Who asks, who answers, and why the stack is layered.", estimatedMinutes: 15, position: 3, provenance: robinPhase15Structure },
              ],
            },
          ],
        },
      ],
    },
    { number: 2, title: "Semester 2", courses: [], provenance: officialProgramStructure },
    { number: 3, title: "Semester 3", courses: [], provenance: officialProgramStructure },
    { number: 4, title: "Semester 4", courses: [], provenance: officialProgramStructure },
    { number: 5, title: "Semester 5", courses: [], provenance: officialProgramStructure },
    { number: 6, title: "Semester 6", courses: [], provenance: officialProgramStructure },
    { number: 7, title: "Semester 7", courses: [], provenance: officialProgramStructure },
    { number: 8, title: "Semester 8", courses: [], provenance: officialProgramStructure },
  ],
};
