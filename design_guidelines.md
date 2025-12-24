# Design Guidelines: Autonomous AI Development Environment

## Design Approach

**System**: Developer Tools Hybrid (VS Code + Linear + Vercel Dashboard)
**Rationale**: Technical productivity tool for developers requiring information density, real-time monitoring, and code-focused workflows. Combines IDE familiarity with modern dev tool aesthetics.

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (Default):
- Background: 220 13% 9% (Deep slate, IDE-like)
- Surface: 220 13% 13% (Elevated panels)
- Surface Elevated: 220 13% 16% (Cards, modals)
- Border: 220 13% 22% (Subtle dividers)

**Accent Colors**:
- Primary (Claude): 25 95% 53% (Warm orange/coral - Anthropic brand)
- Success: 142 71% 45% (Code execution success)
- Warning: 38 92% 50% (Planning/deliberation state)
- Error: 0 84% 60% (Execution failures)
- Info: 217 91% 60% (Research mode active)

**Light Mode**:
- Background: 0 0% 100%
- Surface: 220 13% 97%
- Text: 220 13% 15%

**Syntax Highlighting**: Use VS Code's Dark+ theme palette for code displays

### B. Typography

**Font Families**:
- Interface: Inter (400, 500, 600, 700) - Primary UI text
- Code/Monospace: JetBrains Mono (400, 500) - Artifacts, logs, JSON
- Headers: Inter (600, 700) - Section titles

**Scale**:
- Hero/Display: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-semibold (18px)
- Body: text-sm (14px) - Primary interface text
- Code: text-xs (12px) - Dense information display
- Labels: text-xs uppercase tracking-wide (11px)

### C. Layout System

**Spacing Primitives**: Tailwind units of 1, 2, 4, 6, 8, 12, 16, 24
- Tight spacing: p-2, gap-1 (compact data displays)
- Standard spacing: p-4, gap-4 (default components)
- Generous spacing: p-8, gap-8 (section separation)

**Grid Structure**:
- Three-column layout: Sidebar (280px) | Main Content (flex-1) | Inspector Panel (360px)
- Responsive: Stack to single column on mobile with bottom navigation

---

## Component Library

### Navigation & Structure

**Sidebar (Left)**:
- Session list with status indicators (active/paused/completed)
- Artifact tree view with folder structure
- Mode switcher (Deliberation/Action/Research)
- Quick actions panel
- Background: Surface color, border-r with subtle shadow

**Main Content Area**:
- Real-time code editor with syntax highlighting
- Split view: Code artifact (top 60%) + Decision log (bottom 40%)
- Tabbed interface for multiple artifact contexts
- Full-screen mode toggle

**Inspector Panel (Right)**:
- Live metrics dashboard (lines generated, time elapsed, iterations)
- Context state viewer (JSON tree)
- Tool use tracker with call history
- Error log with retry controls
- Collapsible sections with accordion behavior

### Core UI Elements

**Artifact Display**:
- Monaco-style editor with line numbers
- Diff view showing update vs rewrite decisions
- Minimap for large files (right gutter)
- Breadcrumb navigation showing artifact hierarchy
- Language mode indicator badge

**Decision Log Cards**:
- Timeline layout with connecting lines
- Color-coded by decision type (update=blue, rewrite=orange, research=purple)
- Expandable detail view showing reasoning
- Timestamp and iteration counter
- Action buttons for rollback/branch

**Status Indicators**:
- Pulsing dot animations for active processes
- Progress bars with percentage and ETA
- Icon badges for mode state (brain icon=deliberation, code icon=action, search icon=research)
- Toast notifications for state changes

**Session Monitor**:
- Hero section: Large session timer with play/pause controls
- Stats grid: 4-column layout (Artifacts Created | Lines Generated | Tool Calls | Errors Resolved)
- Progress visualization: Animated timeline showing 30-hour journey
- Milestone markers at key achievement points

### Forms & Inputs

**Command Input**:
- Bottom-fixed command palette (CMD+K style)
- Autocomplete with fuzzy search
- Recent commands history dropdown
- Multi-line support for complex prompts
- Send button with keyboard shortcut display

**Configuration Panel**:
- Toggle switches for constraints (localStorage block, forms block)
- Slider controls for iteration limits
- Dropdown selectors for stack/framework choices
- Live preview of configuration JSON

### Data Display

**Research Mode Interface**:
- Search query input with scope selector
- Results grid showing tool call responses
- Planning canvas with drag-drop nodes
- Knowledge graph visualization of discovered information
- Export to artifact button

**Error Ritual View**:
- Error card with stack trace viewer
- Suggested fixes panel (AI-generated)
- Context diff showing what changed before error
- One-click retry with context cleanup
- Ghost context removal checklist

### Overlays & Modals

**Self-Orchestration Panel**:
- Modal showing Claude-in-Claude recursion depth
- API call waterfall chart
- Generated tool visualization
- Artifact dependency graph
- Resource usage metrics

**Planning Workflow Modal**:
- Voyager-style state machine display
- Step-by-step plan with checkboxes
- Feedback loop visualization
- Learning log showing adaptation
- Export plan as artifact

---

## Animations

**Minimal, Purposeful Only**:
- Subtle fade-in for new artifacts (200ms)
- Smooth scroll for timeline navigation (300ms)
- Pulse animation on active status indicators
- Slide-in for decision log cards (150ms stagger)
- Progress bar fill animation (linear, synced to actual progress)

**No Animations On**:
- Mode switches (instant feedback)
- Code typing (distracting)
- Panel resizing (performance)

---

## Key UX Patterns

**Real-Time Feedback**: All state changes immediately reflected in UI
**Keyboard-First**: CMD+K command palette, vim-style navigation options
**Information Density**: Utilize full viewport with collapsible panels
**Context Preservation**: Pin artifacts, save decision history, bookmark key moments
**Error Recovery**: Always visible retry mechanisms, never dead-end states

**Mobile Adaptation**: 
- Single-column stack
- Bottom navigation with mode tabs
- Swipe gestures for panel switching
- Simplified artifact viewer (read-only)
- Command palette as bottom sheet

---

## Images

**Hero Section**: 
Large abstract visualization representing autonomous AI architecture - interconnected nodes forming a neural network pattern with flowing data streams, rendered in dark theme with accent color highlights (1920x600px, placed at top of landing/about page)

**Feature Illustrations**:
- Artifact management: Visual of code blocks organizing into structured tree
- Decision engine: Flowchart showing update vs rewrite logic paths
- Research mode: Connected knowledge graph with glowing search paths
- Self-orchestration: Recursive Claude instances represented as nested circles

**Placement**: Hero at page top, feature illustrations inline with corresponding explanation sections in documentation/about areas