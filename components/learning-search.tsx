"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { currentCurriculumManifest } from "@/data/curriculum-manifest";
import { courseOverviewRouteBySlug, courses as courseCatalog, implementedLessonSlugsByCourse } from "@/data/courses";
import { useUiCopy } from "@/lib/i18n/language-provider";
import { fillTemplate } from "@/lib/i18n/ui-copy";

// Lightweight client-side learning discovery. No backend search, no fuzzy
// dependency: normalized substring matching over existing course/lesson
// metadata (data/curriculum-manifest.ts mirrors the database; data/courses.ts
// owns implemented routes). Only implemented lessons are actionable; the rest
// render inert with the existing "coming soon" presentation state.
type SearchEntry = {
  kind: "course" | "lesson";
  title: string;
  context: string; // course code for courses, course title for lessons
  summary: string;
  href: string | null; // null = existing metadata marks it as coming soon
  haystack: string;
};

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
}

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const course of courseCatalog) {
    entries.push({
      kind: "course",
      title: course.title,
      context: course.code,
      summary: course.description,
      href: courseOverviewRouteBySlug[course.slug] ?? "/courses",
      haystack: normalize(`${course.title} ${course.code} ${course.slug} ${course.description}`),
    });
  }
  for (const semester of currentCurriculumManifest.semesters) {
    for (const course of semester.courses) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          const implemented = (implementedLessonSlugsByCourse[course.slug] ?? []).includes(lesson.slug);
          entries.push({
            kind: "lesson",
            title: lesson.title,
            context: course.title,
            summary: lesson.summary ?? "",
            href: implemented ? `/courses/${course.slug}/${lesson.slug}` : null,
            haystack: normalize(`${lesson.title} ${lesson.summary ?? ""} ${lesson.slug.replaceAll("-", " ")} ${course.title} ${module.title}`),
          });
        }
      }
    }
  }
  return entries;
}

function matchEntry(entry: SearchEntry, terms: string[]): number {
  // Rank: title hit > any-field hit. All terms must match somewhere.
  const title = normalize(entry.title);
  let score = 0;
  for (const term of terms) {
    const inTitle = title.includes(term);
    const inAny = entry.haystack.includes(term);
    if (!inTitle && !inAny) return -1;
    score += inTitle ? 2 : 1;
  }
  return score;
}

const MAX_RESULTS = 8;

const SearchIcon = () => (
  <svg className="lsearch-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="6" cy="6" r="4.2" /><path d="M9.4 9.4L13 13" />
  </svg>
);

type LearningSearchProps = {
  // "inline" = the always-visible onboarding bar (first-run dashboard).
  // "trigger" = compact pill that reveals the same search in an anchored
  // popover (returning-user dashboard, secondary utility).
  presentation?: "inline" | "trigger";
};

export function LearningSearch({ presentation = "inline" }: LearningSearchProps) {
  const copy = useUiCopy();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);
  const isTrigger = presentation === "trigger";

  // Trigger mode: reveal focuses the input; outside tap and Escape dismiss.
  useEffect(() => {
    if (!isTrigger || !expanded) return;
    inputRef.current?.focus();
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setExpanded(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isTrigger, expanded]);

  const results = useMemo(() => {
    const terms = normalize(query).split(" ").filter(Boolean);
    if (terms.length === 0) return [];
    return index
      .map((entry) => ({ entry, score: matchEntry(entry, terms) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => (a.entry.kind === b.entry.kind ? b.score - a.score : a.entry.kind === "course" ? -1 : 1))
      .slice(0, MAX_RESULTS)
      .map((item) => item.entry);
  }, [index, query]);

  const showPanel = open && query.trim().length > 0;

  function close() {
    setOpen(false);
    setActiveIndex(-1);
    if (isTrigger) setExpanded(false);
  }

  function pick(entry: SearchEntry) {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    if (isTrigger) setExpanded(false);
    if (entry.href) router.push(entry.href);
  }

  const input = (
    <>
      <SearchIcon />
      <input
        ref={inputRef}
        type="search"
        className="lsearch-input"
        value={query}
        placeholder={copy["search.placeholder"]}
        aria-label={copy["search.ariaLabel"]}
        autoComplete="off"
        onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(-1); }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Let click/tap on a result land before the panel dismisses.
          window.setTimeout(() => {
            if (!rootRef.current?.contains(document.activeElement)) setOpen(false);
          }, 120);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") { setQuery(""); close(); event.currentTarget.blur(); return; }
          if (!showPanel || results.length === 0) return;
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((i) => (i + 1) % results.length); }
          else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((i) => (i - 1 + results.length) % results.length); }
          else if (event.key === "Enter" && activeIndex >= 0) { event.preventDefault(); pick(results[activeIndex]); }
        }}
      />
    </>
  );

  const resultsPanel = showPanel && (
    <div className="lsearch-panel" role="status" aria-label={copy["search.ariaLabel"]}>
      {results.length === 0 ? (
        <p className="lsearch-empty">{fillTemplate(copy["search.noResults"], { q: query.trim() })}</p>
      ) : (
        <ul className="lsearch-list">
          {results.map((entry, resultIndex) => {
            const body = (
              <>
                <span className="lsearch-badge">{entry.kind === "course" ? copy["search.courseBadge"] : copy["search.lessonBadge"]}</span>
                <span className="lsearch-main"><strong>{entry.title}</strong><small>{entry.context}</small></span>
                {!entry.href && <span className="lsearch-soon">{copy["status.comingSoon"]}</span>}
              </>
            );
            const className = `lsearch-item${resultIndex === activeIndex ? " active" : ""}`;
            return (
              <li key={`${entry.kind}-${entry.title}-${entry.context}`}>
                {entry.href ? (
                  <Link className={className} href={entry.href} onClick={() => { setOpen(false); setQuery(""); if (isTrigger) setExpanded(false); }}>{body}</Link>
                ) : (
                  <div className={`${className} is-soon`} aria-disabled="true">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  if (isTrigger) {
    return (
      <div className="lsearch lsearch-trigger" ref={rootRef}>
        <button
          type="button"
          className="lsearch-pill"
          aria-expanded={expanded}
          aria-controls="learning-search-popover"
          onClick={() => setExpanded((value) => !value)}
        >
          <SearchIcon />
          <span className="lsearch-label-full">{copy["search.trigger"]}</span>
          <span className="lsearch-label-short" aria-hidden="true">{copy["search.triggerShort"]}</span>
        </button>
        {expanded && (
          <div className="lsearch-popover" id="learning-search-popover">
            {input}
            {resultsPanel}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="lsearch" ref={rootRef}>
      {input}
      {resultsPanel}
    </div>
  );
}
