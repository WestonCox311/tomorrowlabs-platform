# Artifacts Archive

The original source artifacts produced during the architectural design sessions. These are the polished centerpiece documents that the markdown files throughout this knowledge base reference and summarize.

## Why these are separated

The markdown files in other folders are *navigation and summary*. These are the original polished artifacts that:
- Get shown to funders, board candidates, and external audiences
- Carry the substantive content and visual design
- Stand alone as standalone documents
- Should not be edited inline (changes happen via new versions, not modifications)

## Files in this folder

### HTML documents (designed, polished)

| File | What it is | Markdown summary |
|------|-----------|------------------|
| `tomorrowlabs-data-philosophy.html` | Seven core beliefs + five operational commitments | `../01-philosophy/data-philosophy-v1.md` |
| `tomorrowlabs-philosophy-pressure-test.html` | Six adversarial critiques with honest responses | `../01-philosophy/pressure-test.md` |
| `tomorrowlabs-data-architecture.html` | The four-layer architecture framework | `../02-architecture/four-layer-model.md` |
| `tomorrowlabs-architecture-map.html` | Complete table inventory mapped to layers | `../02-architecture/architecture-map.md` |
| `tomorrowlabs-architectural-omissions.html` | What wasn't built and why | `../07-honest-gaps/overview.md` |

### Spreadsheets

| File | What it is | Status |
|------|-----------|--------|
| `tomorrowlabs-language-schema-catalog.xlsx` | 23-sheet catalog of schema tables | **Outdated** — covers migrations 000-002 only |

### React/JSX artifacts (interactive)

| File | What it is | Markdown summary |
|------|-----------|------------------|
| `babagigi-language-roadmap.jsx` | First language roadmap (cartographer aesthetic) | `../04-roadmaps/babagigi-language-roadmap.md` |
| `babagigi-demand-roadmap.jsx` | Demand-first roadmap (commercial/mission toggle) | `../04-roadmaps/babagigi-demand-roadmap.md` |

## How to use these artifacts

**Opening HTML documents:** Open directly in a browser. They're self-contained and render properly offline.

**Sharing externally:** Send the HTML files directly. They're designed as standalone artifacts.

**Editing:** Don't edit in place. If something needs updating:
1. Note the change needed in the markdown summary file
2. When enough changes accumulate, regenerate the HTML as v2
3. Move the original to a versioned filename (e.g., `tomorrowlabs-data-philosophy-v1.html`)

**JSX files:** These were Claude Artifacts. To re-render them, paste into a Claude conversation or compatible React renderer. Or extract the design intent from the JSX and rebuild as needed.

## What's missing from this archive

The original Claude conversation transcripts that produced these artifacts aren't here. They contain the reasoning, the iterations, and the conversational context that led to each design choice. If those transcripts exist somewhere accessible, they're valuable historical record. If not, this is the canonical archive.

## When to regenerate vs. when to update

**Regenerate (new HTML version):** When the underlying thinking has materially changed — a v2 philosophy after community co-authorship, a revised architecture, a new pressure-test round.

**Update markdown summary only:** When small clarifications or new information should be available without re-doing the polished artifact.

The principle: polished artifacts are stable reference points. Markdown summaries are living documents. Don't conflate them.
