# Autonomous Development Studio

A comprehensive demonstration platform showing Claude's autonomous long-running development capabilities. This application visualizes and manages AI coding sessions that can run for extended periods (30+ hours), tracking artifacts, decisions, tool calls, and session metrics in real-time.

## Features

### Session Management
- Create and monitor long-running development sessions
- Track session duration, status, and activity
- Real-time updates via WebSocket

### Mode Controller
Switch between three operating modes for AI agents:
- **Deliberation** - Planning and analysis phase
- **Action** - Code execution and generation
- **Research** - Information gathering via tool calls

### Artifact Management
- Automatic promotion of artifacts (>20 lines or >1500 characters become "durable")
- Version history tracking for all code files
- Syntax highlighting for TypeScript, React, JSON, and more

### Decision Engine
Intelligent update vs rewrite decision logic:
- **Update**: Small changes (≤20 lines, ≤5 locations, up to 4 iterations)
- **Rewrite**: Larger structural changes that exceed thresholds

### Metrics Dashboard
Real-time tracking of:
- Lines of code generated
- Artifacts created
- Updates and rewrites performed
- Tool calls made
- Error recovery count

### Demo Mode
Load a pre-built "Slack Clone MVP" example to see the system in action with sample artifacts, decisions, and metrics.

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- TanStack Query for server state
- Tailwind CSS with shadcn/ui components
- Wouter for routing

### Backend
- Node.js with Express
- WebSocket (ws) for real-time updates
- In-memory storage with PostgreSQL-ready schema
- Drizzle ORM for type-safe database operations

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/autonomous-dev-studio.git
cd autonomous-dev-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5000 in your browser

## Project Structure

```
├── client/
│   └── src/
│       ├── components/     # React components
│       │   ├── ArtifactList.tsx
│       │   ├── CodeEditor.tsx
│       │   ├── DecisionLog.tsx
│       │   ├── MetricsDashboard.tsx
│       │   ├── ModeController.tsx
│       │   ├── SessionSidebar.tsx
│       │   └── ui/         # shadcn/ui components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities and query client
│       └── pages/          # Page components
├── server/
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes and WebSocket
│   └── storage.ts         # In-memory storage layer
├── shared/
│   └── schema.ts          # TypeScript types and schemas
└── package.json
```

## API Endpoints

### Sessions
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PATCH /api/sessions/:id` - Update session
- `POST /api/sessions/:id/mode` - Change agent mode
- `POST /api/sessions/:id/status` - Update session status

### Artifacts
- `GET /api/sessions/:sessionId/artifacts` - List session artifacts
- `GET /api/artifacts/:id` - Get artifact details
- `POST /api/artifacts` - Create artifact
- `PATCH /api/artifacts/:id` - Update artifact
- `GET /api/artifacts/:id/versions` - Get version history

### Decisions
- `GET /api/sessions/:sessionId/decisions` - List decisions
- `POST /api/decisions` - Log a decision
- `POST /api/analyze-change` - Analyze code change for update vs rewrite

### Tool Calls
- `GET /api/sessions/:sessionId/tool-calls` - List tool calls
- `POST /api/tool-calls` - Log a tool call

## Key Concepts

### Artifact Promotion
Code files are automatically promoted to "durable" status when they exceed:
- 20 lines of code, OR
- 1,500 characters

Promoted artifacts receive special handling and version tracking.

### Update vs Rewrite Decision
The decision engine analyzes proposed changes:
- **Update** when: ≤20 lines changed AND ≤5 locations AND <4 iterations on same artifact
- **Rewrite** when: Any threshold is exceeded

### Runtime Constraints
Sessions enforce constraints to maintain clean runtime behavior:
- Block localStorage usage
- Block sessionStorage usage  
- Block HTML forms in React components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

This project demonstrates patterns observed in autonomous AI development systems, inspired by:
- Voyager-style planning loops
- Context window management strategies
- Iterative code refinement patterns
