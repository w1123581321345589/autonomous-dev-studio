import { 
  type User, 
  type InsertUser,
  type Session,
  type InsertSession,
  type Artifact,
  type InsertArtifact,
  type UpdateArtifact,
  type Decision,
  type ToolCall,
  type InsertToolCall,
  type ResearchPipeline,
  type PlanningLoop,
  type ErrorContext,
  type FrameworkRecommendation,
  type SessionStatus,
  type AgentMode,
  type DecisionType,
  type ArtifactVersion,
  DEFAULT_SESSION_CONFIG,
  DEFAULT_SESSION_METRICS,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sessions
  getSessions(): Promise<Session[]>;
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  updateSessionMode(id: string, mode: AgentMode): Promise<Session | undefined>;
  updateSessionStatus(id: string, status: SessionStatus): Promise<Session | undefined>;

  // Artifacts
  getArtifacts(sessionId: string): Promise<Artifact[]>;
  getArtifact(id: string): Promise<Artifact | undefined>;
  createArtifact(artifact: InsertArtifact): Promise<Artifact>;
  updateArtifact(id: string, update: UpdateArtifact): Promise<Artifact | undefined>;
  deleteArtifact(id: string): Promise<boolean>;
  getArtifactVersions(id: string): Promise<ArtifactVersion[]>;

  // Decisions
  getDecisions(sessionId: string): Promise<Decision[]>;
  getDecision(id: string): Promise<Decision | undefined>;
  createDecision(decision: Omit<Decision, "id">): Promise<Decision>;

  // Tool Calls
  getToolCalls(sessionId: string): Promise<ToolCall[]>;
  getToolCall(id: string): Promise<ToolCall | undefined>;
  createToolCall(toolCall: InsertToolCall): Promise<ToolCall>;
  updateToolCall(id: string, updates: Partial<ToolCall>): Promise<ToolCall | undefined>;

  // Research Pipelines
  getResearchPipelines(sessionId: string): Promise<ResearchPipeline[]>;
  getResearchPipeline(id: string): Promise<ResearchPipeline | undefined>;
  createResearchPipeline(pipeline: Omit<ResearchPipeline, "id">): Promise<ResearchPipeline>;
  updateResearchPipeline(id: string, updates: Partial<ResearchPipeline>): Promise<ResearchPipeline | undefined>;

  // Planning Loops
  getPlanningLoops(sessionId: string): Promise<PlanningLoop[]>;
  getPlanningLoop(id: string): Promise<PlanningLoop | undefined>;
  createPlanningLoop(loop: Omit<PlanningLoop, "id">): Promise<PlanningLoop>;
  updatePlanningLoop(id: string, updates: Partial<PlanningLoop>): Promise<PlanningLoop | undefined>;

  // Error Context
  getErrorContexts(sessionId: string): Promise<ErrorContext[]>;
  createErrorContext(context: Omit<ErrorContext, "id">): Promise<ErrorContext>;
  updateErrorContext(id: string, updates: Partial<ErrorContext>): Promise<ErrorContext | undefined>;

  // Framework Recommendations
  getFrameworkRecommendations(sessionId: string): Promise<FrameworkRecommendation[]>;
  createFrameworkRecommendation(rec: Omit<FrameworkRecommendation, "id">): Promise<FrameworkRecommendation>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, Session>;
  private artifacts: Map<string, Artifact>;
  private decisions: Map<string, Decision>;
  private toolCalls: Map<string, ToolCall>;
  private researchPipelines: Map<string, ResearchPipeline>;
  private planningLoops: Map<string, PlanningLoop>;
  private errorContexts: Map<string, ErrorContext>;
  private frameworkRecommendations: Map<string, FrameworkRecommendation>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.artifacts = new Map();
    this.decisions = new Map();
    this.toolCalls = new Map();
    this.researchPipelines = new Map();
    this.planningLoops = new Map();
    this.errorContexts = new Map();
    this.frameworkRecommendations = new Map();
  }

  // ============================================
  // USERS
  // ============================================
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ============================================
  // SESSIONS
  // ============================================
  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
    );
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const now = new Date();
    const session: Session = {
      id,
      name: insertSession.name,
      description: insertSession.description || "",
      status: "active",
      currentMode: "deliberation",
      startedAt: now,
      lastActivityAt: now,
      totalDuration: 0,
      metrics: { ...DEFAULT_SESSION_METRICS },
      config: { ...DEFAULT_SESSION_CONFIG },
      conversationHistory: [],
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates, lastActivityAt: new Date() };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }

  async updateSessionMode(id: string, mode: AgentMode): Promise<Session | undefined> {
    return this.updateSession(id, { currentMode: mode });
  }

  async updateSessionStatus(id: string, status: SessionStatus): Promise<Session | undefined> {
    return this.updateSession(id, { status });
  }

  // ============================================
  // ARTIFACTS
  // ============================================
  async getArtifacts(sessionId: string): Promise<Artifact[]> {
    return Array.from(this.artifacts.values())
      .filter(a => a.sessionId === sessionId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getArtifact(id: string): Promise<Artifact | undefined> {
    return this.artifacts.get(id);
  }

  async createArtifact(insertArtifact: InsertArtifact): Promise<Artifact> {
    const id = randomUUID();
    const now = new Date();
    const lineCount = insertArtifact.content.split('\n').length;
    const charCount = insertArtifact.content.length;
    
    const artifact: Artifact = {
      id,
      sessionId: insertArtifact.sessionId,
      name: insertArtifact.name,
      type: insertArtifact.type,
      path: insertArtifact.path,
      content: insertArtifact.content,
      version: 1,
      lineCount,
      charCount,
      dependencies: [],
      isPromoted: lineCount > 20 || charCount > 1500,
      createdAt: now,
      updatedAt: now,
      history: [{
        version: 1,
        content: insertArtifact.content,
        lineCount,
        charCount,
        decisionType: "create",
        decisionId: "",
        timestamp: now,
      }],
    };
    
    this.artifacts.set(id, artifact);
    
    // Update session metrics
    const session = await this.getSession(insertArtifact.sessionId);
    if (session) {
      await this.updateSession(insertArtifact.sessionId, {
        metrics: {
          ...session.metrics,
          artifactsCreated: session.metrics.artifactsCreated + 1,
          linesGenerated: session.metrics.linesGenerated + lineCount,
        }
      });
    }
    
    return artifact;
  }

  async updateArtifact(id: string, update: UpdateArtifact): Promise<Artifact | undefined> {
    const artifact = this.artifacts.get(id);
    if (!artifact) return undefined;
    
    const now = new Date();
    const lineCount = update.content.split('\n').length;
    const charCount = update.content.length;
    const newVersion = artifact.version + 1;
    
    const versionEntry: ArtifactVersion = {
      version: newVersion,
      content: update.content,
      lineCount,
      charCount,
      decisionType: update.decisionType,
      decisionId: "",
      timestamp: now,
    };
    
    const updated: Artifact = {
      ...artifact,
      content: update.content,
      version: newVersion,
      lineCount,
      charCount,
      isPromoted: lineCount > 20 || charCount > 1500,
      updatedAt: now,
      history: [...artifact.history, versionEntry],
    };
    
    this.artifacts.set(id, updated);
    
    // Update session metrics
    const session = await this.getSession(artifact.sessionId);
    if (session) {
      const metricsUpdate = update.decisionType === "update" 
        ? { updatesPerformed: session.metrics.updatesPerformed + 1 }
        : { rewritesPerformed: session.metrics.rewritesPerformed + 1 };
      
      await this.updateSession(artifact.sessionId, {
        metrics: {
          ...session.metrics,
          ...metricsUpdate,
          linesGenerated: session.metrics.linesGenerated + Math.max(0, lineCount - artifact.lineCount),
        }
      });
    }
    
    return updated;
  }

  async deleteArtifact(id: string): Promise<boolean> {
    return this.artifacts.delete(id);
  }

  async getArtifactVersions(id: string): Promise<ArtifactVersion[]> {
    const artifact = this.artifacts.get(id);
    return artifact?.history || [];
  }

  // ============================================
  // DECISIONS
  // ============================================
  async getDecisions(sessionId: string): Promise<Decision[]> {
    return Array.from(this.decisions.values())
      .filter(d => d.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getDecision(id: string): Promise<Decision | undefined> {
    return this.decisions.get(id);
  }

  async createDecision(decision: Omit<Decision, "id">): Promise<Decision> {
    const id = randomUUID();
    const fullDecision: Decision = { ...decision, id };
    this.decisions.set(id, fullDecision);
    
    // Update session iteration count
    const session = await this.getSession(decision.sessionId);
    if (session) {
      await this.updateSession(decision.sessionId, {
        metrics: {
          ...session.metrics,
          iterationCount: session.metrics.iterationCount + 1,
        }
      });
    }
    
    return fullDecision;
  }

  // ============================================
  // TOOL CALLS
  // ============================================
  async getToolCalls(sessionId: string): Promise<ToolCall[]> {
    return Array.from(this.toolCalls.values())
      .filter(t => t.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getToolCall(id: string): Promise<ToolCall | undefined> {
    return this.toolCalls.get(id);
  }

  async createToolCall(insertToolCall: InsertToolCall): Promise<ToolCall> {
    const id = randomUUID();
    const session = await this.getSession(insertToolCall.sessionId);
    
    const toolCall: ToolCall = {
      id,
      ...insertToolCall,
      status: "pending",
      mode: session?.currentMode || "action",
      timestamp: new Date(),
    };
    
    this.toolCalls.set(id, toolCall);
    
    // Update session metrics
    if (session) {
      await this.updateSession(insertToolCall.sessionId, {
        metrics: {
          ...session.metrics,
          toolCallsMade: session.metrics.toolCallsMade + 1,
        }
      });
    }
    
    return toolCall;
  }

  async updateToolCall(id: string, updates: Partial<ToolCall>): Promise<ToolCall | undefined> {
    const toolCall = this.toolCalls.get(id);
    if (!toolCall) return undefined;
    
    const updated = { ...toolCall, ...updates };
    this.toolCalls.set(id, updated);
    return updated;
  }

  // ============================================
  // RESEARCH PIPELINES
  // ============================================
  async getResearchPipelines(sessionId: string): Promise<ResearchPipeline[]> {
    return Array.from(this.researchPipelines.values())
      .filter(r => r.sessionId === sessionId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async getResearchPipeline(id: string): Promise<ResearchPipeline | undefined> {
    return this.researchPipelines.get(id);
  }

  async createResearchPipeline(pipeline: Omit<ResearchPipeline, "id">): Promise<ResearchPipeline> {
    const id = randomUUID();
    const fullPipeline: ResearchPipeline = { ...pipeline, id };
    this.researchPipelines.set(id, fullPipeline);
    return fullPipeline;
  }

  async updateResearchPipeline(id: string, updates: Partial<ResearchPipeline>): Promise<ResearchPipeline | undefined> {
    const pipeline = this.researchPipelines.get(id);
    if (!pipeline) return undefined;
    
    const updated = { ...pipeline, ...updates };
    this.researchPipelines.set(id, updated);
    return updated;
  }

  // ============================================
  // PLANNING LOOPS
  // ============================================
  async getPlanningLoops(sessionId: string): Promise<PlanningLoop[]> {
    return Array.from(this.planningLoops.values())
      .filter(p => p.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getPlanningLoop(id: string): Promise<PlanningLoop | undefined> {
    return this.planningLoops.get(id);
  }

  async createPlanningLoop(loop: Omit<PlanningLoop, "id">): Promise<PlanningLoop> {
    const id = randomUUID();
    const fullLoop: PlanningLoop = { ...loop, id };
    this.planningLoops.set(id, fullLoop);
    return fullLoop;
  }

  async updatePlanningLoop(id: string, updates: Partial<PlanningLoop>): Promise<PlanningLoop | undefined> {
    const loop = this.planningLoops.get(id);
    if (!loop) return undefined;
    
    const updated = { ...loop, ...updates };
    this.planningLoops.set(id, updated);
    return updated;
  }

  // ============================================
  // ERROR CONTEXTS
  // ============================================
  async getErrorContexts(sessionId: string): Promise<ErrorContext[]> {
    return Array.from(this.errorContexts.values())
      .filter(e => e.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createErrorContext(context: Omit<ErrorContext, "id">): Promise<ErrorContext> {
    const id = randomUUID();
    const fullContext: ErrorContext = { ...context, id };
    this.errorContexts.set(id, fullContext);
    return fullContext;
  }

  async updateErrorContext(id: string, updates: Partial<ErrorContext>): Promise<ErrorContext | undefined> {
    const context = this.errorContexts.get(id);
    if (!context) return undefined;
    
    const updated = { ...context, ...updates };
    this.errorContexts.set(id, updated);
    
    // Update session metrics if resolved
    if (updates.resolved && !context.resolved) {
      const session = await this.getSession(context.sessionId);
      if (session) {
        await this.updateSession(context.sessionId, {
          metrics: {
            ...session.metrics,
            errorsRecovered: session.metrics.errorsRecovered + 1,
          }
        });
      }
    }
    
    return updated;
  }

  // ============================================
  // FRAMEWORK RECOMMENDATIONS
  // ============================================
  async getFrameworkRecommendations(sessionId: string): Promise<FrameworkRecommendation[]> {
    return Array.from(this.frameworkRecommendations.values())
      .filter(f => f.sessionId === sessionId);
  }

  async createFrameworkRecommendation(rec: Omit<FrameworkRecommendation, "id">): Promise<FrameworkRecommendation> {
    const id = randomUUID();
    const fullRec: FrameworkRecommendation = { ...rec, id };
    this.frameworkRecommendations.set(id, fullRec);
    return fullRec;
  }
}

export const storage = new MemStorage();
