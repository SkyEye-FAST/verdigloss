# Phase three interface specification

## Product and information architecture

Verdigloss is a reference desk, not a dashboard: people arrive to locate a
translation, compare a dense set of language strings, or practise a selected
language. The application shell owns navigation and utilities; each route owns
its task controls.

| Viewport | Navigation | Feature controls |
| --- | --- | --- |
| Desktop (1024px+) | Compact top application bar: Query, Table, Quiz, Colours; theme, type and GitHub utilities | Inline, immediately before the active task |
| Tablet (768–1023px) | Top bar with short labels | Controls wrap into a two-column rail; tables remain scrollable |
| Phone (<768px) | Small top bar and fixed safe-area bottom navigation | Query controls are a dismissible disclosure; table controls stack; tables get their own horizontal scroller |
| Short landscape | Top bar stays compact; bottom navigation is not fixed | Controls remain in normal document flow and no panel has a fixed width |

## Visual system

The visual reference is an editorial lexicon: pale neutral paper, graphite
type, hairline rules, a moss-green active state, and a small rust semantic
accent. Minecraft is represented only by the careful grid and material
restraint. The system uses semantic custom properties for all light/dark values
and declares `color-scheme` on the root.

* UI: system sans stack; translations use a language-aware serif/sans class;
  code and keys use the monospace stack.
* Spacing is a four-pixel scale (4–40px), controls are at least 44px high,
  radius is 6px or 10px, and motion is 160/240ms.
* Breakpoints: 768px (phone), 1024px (desktop shell), 1280px (wide tables).
* Safe-area insets pad the mobile bar and all page edges.

## Interaction and accessibility

* Landmarks: application header, primary navigation, main content and route
  headings. Active routes use `aria-current`.
* The multi-language control is a button + labelled checkbox popover. Escape
  and outside clicks close it, and focus returns to the trigger.
* Query matches are a capped combobox list with arrow navigation, Enter
  selection, Escape dismissal and an announced count. Empty/error states are
  text, not colour alone.
* Controls have visible `:focus-visible` rings. Icon-only actions have labels;
  reduced-motion removes transitions.
* Tables retain table semantics, captions, header scopes, sticky header/key
  where viable, and are wrapped rather than causing page-level overflow.
* Live messages are used only for query counts, exports, copy/share and
  validation feedback.

## Route behaviour

* Query: desktop side-by-side controls and result; phone disclosure controls
  leave the selected result in context. Translation rows can stack on phone.
* Table and colours: dense desktop grid; intentional horizontal scrolling on
  smaller widths with a visible cue and sticky key column.
* Quiz portal/active quiz/summary: centred fluid task surface, responsive
  answer boxes, real button controls, textual progress and a scrollable
  summary table when required.
