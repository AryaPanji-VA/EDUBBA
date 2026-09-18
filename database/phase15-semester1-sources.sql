-- Phase 15: Sources for all Phase 15 Semester 1 lessons.
-- REQUIRES database/phase15-semester1-structure.sql first (module + lesson rows).
-- Run manually in Supabase SQL Editor. Idempotent on repeated runs.
-- These sources support ROBIN's lesson content; they do NOT make any lesson
-- an official university lesson (provenance remains: robin).

insert into public.sources (title, url, publisher, source_type)
values
  -- Discrete Mathematics
  ('forall x: Calgary, An Introduction to Formal Logic', 'https://forallx.openlogicproject.org/', 'P.D. Magnus and Tim Button, Open Logic Project', 'textbook'),
  ('Book of Proof', 'https://www.people.vcu.edu/~rhammack/BookOfProof/', 'Richard Hammack, Virginia Commonwealth University', 'textbook'),
  -- Design Thinking
  ('An Introduction to Design Thinking Process Guide', 'https://dschool.stanford.edu/resources/an-introduction-to-design-thinking-process-guide', 'Hasso Plattner Institute of Design at Stanford (d.school)', 'course'),
  ('The Field Guide to Human-Centered Design', 'https://www.designkit.org/', 'IDEO.org', 'course'),
  -- HCI
  ('Interaction Design: Beyond Human-Computer Interaction', 'https://interaction-design.org/literature/book/interaction-design-beyond-human-computer-interaction', 'Rogers, Sharp, and Preece / IxDF', 'textbook'),
  ('About Face: The Essentials of Interaction Design', 'https://www.wiley.com/en-us/About+Face%3A+The+Essentials+of+Interaction+Design-p-9781119546590', 'Alan Cooper et al., Wiley', 'textbook'),
  -- Algorithms
  ('Problem Solving with Algorithms and Data Structures', 'https://runestone.academy/ns/books/published/pythonds/index.html', 'Bradley Miller and David Ranum, Runestone Interactive', 'textbook'),
  ('Open Data Structures', 'https://opendatastructures.org/', 'Pat Morin, Athabasca University', 'textbook'),
  -- Parallel and Distributed
  ('Introduction to Parallel Computing', 'https://hpc.llnl.gov/documentation/tutorials/introduction-parallel-computing-tutorial', 'Lawrence Livermore National Laboratory (HPC tutorials)', 'course'),
  ('Distributed Systems (van Steen & Tanenbaum)', 'https://www.distributed-systems.net/', 'Andrew Tanenbaum and Maarten van Steen', 'textbook'),
  -- Networking
  ('Computer Networking: A Top-Down Approach', 'https://gaia.cs.umass.edu/kurose_ross/', 'Kurose and Ross, University of Massachusetts Amherst', 'textbook'),
  ('High Performance Browser Networking', 'https://hpbn.co/', 'Ilya Grigorik', 'textbook')
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_type = excluded.source_type;

-- Lesson-source links. One relevance note per lesson per source.
insert into public.lesson_sources (lesson_id, source_id, relevance_note)
select
  l.id,
  s.id,
  source_link.relevance_note
from public.courses c
join public.modules m on m.course_id = c.id
join public.lessons l on l.module_id = m.id
cross join (
  values
    -- discrete-math / logic-foundations
    ('discrete-math', 'logic-foundations', 'implication', 'https://forallx.openlogicproject.org/', 'Truth tables and truth conditions for the conditional and biconditional.'),
    ('discrete-math', 'logic-foundations', 'implication', 'https://www.people.vcu.edu/~rhammack/BookOfProof/', 'Chapter 2 covers implication, its converse, and common misreadings.'),
    ('discrete-math', 'sets-and-relations', 'sets-intro', 'https://www.people.vcu.edu/~rhammack/BookOfProof/', 'Chapter 1 introduces sets, membership, subsets, and the empty set.'),
    ('discrete-math', 'sets-and-relations', 'sets-intro', 'https://forallx.openlogicproject.org/', 'Sets and their notation as used alongside formal logic.'),
    -- design-thinking
    ('design-thinking', 'design-thinking-foundations', 'what-is-design-thinking', 'https://dschool.stanford.edu/resources/an-introduction-to-design-thinking-process-guide', 'The origin of the five-mode description of the design thinking process.'),
    ('design-thinking', 'design-thinking-foundations', 'what-is-design-thinking', 'https://www.designkit.org/', 'Human-centered design mindsets in practice.'),
    ('design-thinking', 'design-thinking-foundations', 'empathy-and-define', 'https://www.designkit.org/', 'Field methods for empathy and framing a design challenge.'),
    ('design-thinking', 'design-thinking-foundations', 'empathy-and-define', 'https://dschool.stanford.edu/resources/an-introduction-to-design-thinking-process-guide', 'Empathize and Define modes, including POV statements.'),
    ('design-thinking', 'design-thinking-foundations', 'ideate-prototype-test', 'https://dschool.stanford.edu/resources/an-introduction-to-design-thinking-process-guide', 'Ideate, Prototype, and Test modes with low-resolution prototyping.'),
    ('design-thinking', 'design-thinking-foundations', 'ideate-prototype-test', 'https://www.designkit.org/', 'Rapid prototyping and learning from users.'),
    -- hci
    ('hci', 'hci-foundations', 'hci-intro', 'https://interaction-design.org/literature/book/interaction-design-beyond-human-computer-interaction', 'Foundational chapters on what interaction design is and who users are.'),
    ('hci', 'hci-foundations', 'hci-intro', 'https://www.designkit.org/', 'Human-centered design as the shared root of HCI practice.'),
    ('hci', 'hci-foundations', 'affordances-and-feedback', 'https://www.wiley.com/en-us/About+Face%3A+The+Essentials+of+Interaction+Design-p-9781119546590', 'Goal-directed design: feedback, visibility, and communication.'),
    ('hci', 'hci-foundations', 'affordances-and-feedback', 'https://interaction-design.org/literature/book/interaction-design-beyond-human-computer-interaction', 'Affordances, signifiers, and feedback as interaction concepts.'),
    ('hci', 'hci-foundations', 'interface-evaluation', 'https://interaction-design.org/literature/book/interaction-design-beyond-human-computer-interaction', 'Evaluation chapter: usability testing and heuristic evaluation.'),
    ('hci', 'hci-foundations', 'interface-evaluation', 'https://dschool.stanford.edu/resources/an-introduction-to-design-thinking-process-guide', 'Testing mode: observing real users with rough artifacts.'),
    -- algorithms
    ('algorithms', 'algorithmic-thinking', 'what-is-an-algorithm', 'https://runestone.academy/ns/books/published/pythonds/index.html', 'What an algorithm is: properties and problem-solving framing.'),
    ('algorithms', 'algorithmic-thinking', 'what-is-an-algorithm', 'https://opendatastructures.org/', 'Algorithms as precise procedures with correctness and cost.'),
    ('algorithms', 'algorithmic-thinking', 'pseudocode-and-tracing', 'https://runestone.academy/ns/books/published/pythonds/index.html', 'Programs as expressions of algorithms; tracing execution.'),
    ('algorithms', 'algorithmic-thinking', 'pseudocode-and-tracing', 'https://opendatastructures.org/', 'Pseudocode conventions used throughout algorithm texts.'),
    ('algorithms', 'algorithmic-thinking', 'efficiency-intuition', 'https://runestone.academy/ns/books/published/pythonds/index.html', 'Big-O intuition and comparing algorithm growth.'),
    ('algorithms', 'algorithmic-thinking', 'efficiency-intuition', 'https://opendatastructures.org/', 'Growth-rate analysis and the cost of operations.'),
    -- parallel
    ('parallel', 'parallel-and-distributed-foundations', 'sequential-vs-parallel', 'https://hpc.llnl.gov/documentation/tutorials/introduction-parallel-computing-tutorial', 'Parallelism concepts, dependencies, and limits on speedup.'),
    ('parallel', 'parallel-and-distributed-foundations', 'sequential-vs-parallel', 'https://runestone.academy/ns/books/published/pythonds/index.html', 'Everyday examples of sequential vs parallel work.'),
    ('parallel', 'parallel-and-distributed-foundations', 'distributed-basics', 'https://www.distributed-systems.net/', 'Distributed systems: definition, partial failure, coordination.'),
    ('parallel', 'parallel-and-distributed-foundations', 'distributed-basics', 'https://hpc.llnl.gov/documentation/tutorials/introduction-parallel-computing-tutorial', 'From parallel computers to distributed clusters.'),
    -- networking
    ('networking', 'network-foundations', 'what-is-a-network', 'https://gaia.cs.umass.edu/kurose_ross/', 'Network basics: nodes, links, protocols, and the Internet structure.'),
    ('networking', 'network-foundations', 'what-is-a-network', 'https://hpbn.co/', 'Networks as the platform everything rides on.'),
    ('networking', 'network-foundations', 'packets-and-protocols', 'https://gaia.cs.umass.edu/kurose_ross/', 'Packet switching, headers, and the protocol layer model.'),
    ('networking', 'network-foundations', 'packets-and-protocols', 'https://hpbn.co/', 'Packets, delays, and how reliability is built on best-effort delivery.'),
    ('networking', 'network-foundations', 'client-server-and-layers', 'https://hpbn.co/', 'Client-server model, DNS, and the layered stack in practice.'),
    ('networking', 'network-foundations', 'client-server-and-layers', 'https://gaia.cs.umass.edu/kurose_ross/', 'Layering and protocol reference models.')
) as source_link(course_slug, module_slug, lesson_slug, url, relevance_note)
join public.sources s on s.url = source_link.url
where c.slug = source_link.course_slug
  and m.slug = source_link.module_slug
  and l.slug = source_link.lesson_slug
on conflict (lesson_id, source_id) do update set
  relevance_note = excluded.relevance_note;
