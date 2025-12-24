import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================
// AUTONOMOUS DEVELOPMENT SYSTEM TYPES
// ============================================

// Operating modes for the AI agent
export type AgentMode = "deliberation" | "action" | "research";

// Decision types for code changes
export type DecisionType = "update" | "rewrite" | "create" | "delete";

// Session status
export type SessionStatus = "active" | "paused" | "completed" | "error";

// Artifact types (whitelisted)
export type ArtifactType = "react-component" | "html" | "typescript" | "javascript" | "css" | "json" | "markdown";

// Tool call status
export type ToolCallStatus = "pending" | "executing" | "completed" | "failed";

// ============================================
// SESSION - Represents a long-running dev session
// ============================================
export interface Session {
  id: string;
  name: string;
  description: string;
  status: SessionStatus;
  currentMode: AgentMode;
  startedAt: Date;
  lastActivityAt: Date;
  totalDuration: number; // milliseconds
  metrics: SessionMetrics;
  config: SessionConfig;
  conversationHistory: ConversationMessage[];
}

export interface SessionMetrics {
  linesGenerated: number;
  artifactsCreated: number;
  updatesPerformed: number;
  rewritesPerformed: number;
  toolCallsMade: number;
  errorsRecovered: number;
  iterationCount: number;
}

export interface SessionConfig {
  maxIterationsPerUpdate: number; // default 4
  maxLinesForUpdate: number; // default 20
  maxLocationsForUpdate: number; // default 5
  charThresholdForArtifact: number; // default 1500
  lineThresholdForArtifact: number; // default 20
  blockLocalStorage: boolean;
  blockSessionStorage: boolean;
  blockHtmlForms: boolean;
  preferredStack: string[];
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  mode?: AgentMode;
  artifacts?: string[]; // artifact IDs referenced
  toolCalls?: string[]; // tool call IDs
}

// ============================================
// ARTIFACT - Durable code unit
// ============================================
export interface Artifact {
  id: string;
  sessionId: string;
  name: string;
  type: ArtifactType;
  path: string; // virtual file path
  content: string;
  version: number;
  lineCount: number;
  charCount: number;
  dependencies: string[]; // other artifact IDs
  isPromoted: boolean; // true if >20 lines or >1500 chars
  createdAt: Date;
  updatedAt: Date;
  history: ArtifactVersion[];
}

export interface ArtifactVersion {
  version: number;
  content: string;
  lineCount: number;
  charCount: number;
  decisionType: DecisionType;
  decisionId: string;
  timestamp: Date;
}

// ============================================
// DECISION - Update vs rewrite choice
// ============================================
export interface Decision {
  id: string;
  sessionId: string;
  artifactId: string;
  type: DecisionType;
  reasoning: string;
  linesChanged: number;
  locationsChanged: number;
  diffSummary: string;
  wasAutomatic: boolean; // true if met thresholds
  iterationNumber: number; // within current update cycle
  mode: AgentMode;
  timestamp: Date;
}

// ============================================
// TOOL CALL - Research and execution
// ============================================
export interface ToolCall {
  id: string;
  sessionId: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  status: ToolCallStatus;
  duration?: number;
  mode: AgentMode;
  pipelineStep?: number; // for research mode (1-20)
  timestamp: Date;
}

// ============================================
// RESEARCH PIPELINE - Multi-step research
// ============================================
export interface ResearchPipeline {
  id: string;
  sessionId: string;
  query: string;
  status: "planning" | "researching" | "constructing" | "completed";
  plannedSteps: string[];
  completedSteps: ToolCall[];
  findings: ResearchFinding[];
  conclusion: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface ResearchFinding {
  id: string;
  source: string;
  content: string;
  relevance: number; // 0-1
  toolCallId: string;
}

// ============================================
// PLANNING LOOP - Voyager-style
// ============================================
export interface PlanningLoop {
  id: string;
  sessionId: string;
  state: "proposing" | "executing" | "learning" | "complete";
  currentState: Record<string, unknown>;
  proposedCode: string;
  executionResult?: {
    success: boolean;
    output?: string;
    error?: string;
  };
  lessonsLearned: string[];
  nextActions: string[];
  timestamp: Date;
}

// ============================================
// ERROR CONTEXT - Ghost removal
// ============================================
export interface ErrorContext {
  id: string;
  sessionId: string;
  error: string;
  stackTrace?: string;
  staleContext: string[];
  cleanedContext: string[];
  retryCount: number;
  resolved: boolean;
  resolution?: string;
  timestamp: Date;
}

// ============================================
// FRAMEWORK RECOMMENDATION
// ============================================
export interface FrameworkRecommendation {
  id: string;
  sessionId: string;
  category: "frontend" | "backend" | "database" | "styling" | "testing";
  recommended: string;
  alternatives: string[];
  reasoning: string;
  withinKnowledgeHorizon: boolean;
  documentationQuality: "excellent" | "good" | "fair" | "poor";
}

// ============================================
// INSERT SCHEMAS FOR VALIDATION
// ============================================
export const insertSessionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(""),
});

export type InsertSession = z.infer<typeof insertSessionSchema>;

export const insertArtifactSchema = z.object({
  sessionId: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(["react-component", "html", "typescript", "javascript", "css", "json", "markdown"]),
  path: z.string().min(1),
  content: z.string(),
});

export type InsertArtifact = z.infer<typeof insertArtifactSchema>;

export const updateArtifactSchema = z.object({
  content: z.string(),
  decisionType: z.enum(["update", "rewrite"]),
});

export type UpdateArtifact = z.infer<typeof updateArtifactSchema>;

export const insertToolCallSchema = z.object({
  sessionId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  parameters: z.record(z.unknown()),
});

export type InsertToolCall = z.infer<typeof insertToolCallSchema>;

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxIterationsPerUpdate: 4,
  maxLinesForUpdate: 20,
  maxLocationsForUpdate: 5,
  charThresholdForArtifact: 1500,
  lineThresholdForArtifact: 20,
  blockLocalStorage: true,
  blockSessionStorage: true,
  blockHtmlForms: true,
  preferredStack: ["react", "typescript", "express", "tailwindcss"],
};

export const DEFAULT_SESSION_METRICS: SessionMetrics = {
  linesGenerated: 0,
  artifactsCreated: 0,
  updatesPerformed: 0,
  rewritesPerformed: 0,
  toolCallsMade: 0,
  errorsRecovered: 0,
  iterationCount: 0,
};
