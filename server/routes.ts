import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertSessionSchema, 
  insertArtifactSchema, 
  updateArtifactSchema,
  insertToolCallSchema,
  type AgentMode,
  type SessionStatus,
  type Decision,
  type ResearchPipeline,
  type PlanningLoop,
  type ErrorContext,
  type FrameworkRecommendation,
} from "@shared/schema";
import { z } from "zod";

// WebSocket clients for real-time updates
const clients = new Set<WebSocket>();

function broadcast(event: string, data: unknown) {
  const message = JSON.stringify({ event, data });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // SESSIONS
  // ============================================
  
  app.get("/api/sessions", async (req, res) => {
    const sessions = await storage.getSessions();
    res.json(sessions);
  });

  app.get("/api/sessions/:id", async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  });

  app.post("/api/sessions", async (req, res) => {
    const parsed = insertSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const session = await storage.createSession(parsed.data);
    broadcast("session:created", session);
    res.status(201).json(session);
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    const session = await storage.updateSession(req.params.id, req.body);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    broadcast("session:updated", session);
    res.json(session);
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    const deleted = await storage.deleteSession(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Session not found" });
    }
    broadcast("session:deleted", { id: req.params.id });
    res.status(204).send();
  });

  app.post("/api/sessions/:id/mode", async (req, res) => {
    const { mode } = req.body as { mode: AgentMode };
    if (!["deliberation", "action", "research"].includes(mode)) {
      return res.status(400).json({ message: "Invalid mode" });
    }
    const session = await storage.updateSessionMode(req.params.id, mode);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    broadcast("session:mode-changed", { sessionId: session.id, mode });
    res.json(session);
  });

  app.post("/api/sessions/:id/status", async (req, res) => {
    const { status } = req.body as { status: SessionStatus };
    if (!["active", "paused", "completed", "error"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const session = await storage.updateSessionStatus(req.params.id, status);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    broadcast("session:status-changed", { sessionId: session.id, status });
    res.json(session);
  });

  // ============================================
  // ARTIFACTS
  // ============================================

  app.get("/api/sessions/:sessionId/artifacts", async (req, res) => {
    const artifacts = await storage.getArtifacts(req.params.sessionId);
    res.json(artifacts);
  });

  app.get("/api/artifacts/:id", async (req, res) => {
    const artifact = await storage.getArtifact(req.params.id);
    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }
    res.json(artifact);
  });

  app.post("/api/artifacts", async (req, res) => {
    const parsed = insertArtifactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const artifact = await storage.createArtifact(parsed.data);
    broadcast("artifact:created", artifact);
    res.status(201).json(artifact);
  });

  app.patch("/api/artifacts/:id", async (req, res) => {
    const parsed = updateArtifactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const artifact = await storage.updateArtifact(req.params.id, parsed.data);
    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }
    broadcast("artifact:updated", artifact);
    res.json(artifact);
  });

  app.delete("/api/artifacts/:id", async (req, res) => {
    const deleted = await storage.deleteArtifact(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Artifact not found" });
    }
    broadcast("artifact:deleted", { id: req.params.id });
    res.status(204).send();
  });

  app.get("/api/artifacts/:id/versions", async (req, res) => {
    const versions = await storage.getArtifactVersions(req.params.id);
    res.json(versions);
  });

  // ============================================
  // DECISIONS
  // ============================================

  app.get("/api/sessions/:sessionId/decisions", async (req, res) => {
    const decisions = await storage.getDecisions(req.params.sessionId);
    res.json(decisions);
  });

  app.post("/api/decisions", async (req, res) => {
    const decision = await storage.createDecision(req.body as Omit<Decision, "id">);
    broadcast("decision:created", decision);
    res.status(201).json(decision);
  });

  // ============================================
  // TOOL CALLS
  // ============================================

  app.get("/api/sessions/:sessionId/tool-calls", async (req, res) => {
    const toolCalls = await storage.getToolCalls(req.params.sessionId);
    res.json(toolCalls);
  });

  app.post("/api/tool-calls", async (req, res) => {
    const parsed = insertToolCallSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const toolCall = await storage.createToolCall(parsed.data);
    broadcast("tool-call:created", toolCall);
    res.status(201).json(toolCall);
  });

  app.patch("/api/tool-calls/:id", async (req, res) => {
    const toolCall = await storage.updateToolCall(req.params.id, req.body);
    if (!toolCall) {
      return res.status(404).json({ message: "Tool call not found" });
    }
    broadcast("tool-call:updated", toolCall);
    res.json(toolCall);
  });

  // ============================================
  // RESEARCH PIPELINES
  // ============================================

  app.get("/api/sessions/:sessionId/research-pipelines", async (req, res) => {
    const pipelines = await storage.getResearchPipelines(req.params.sessionId);
    res.json(pipelines);
  });

  app.post("/api/research-pipelines", async (req, res) => {
    const pipeline = await storage.createResearchPipeline(req.body as Omit<ResearchPipeline, "id">);
    broadcast("research-pipeline:created", pipeline);
    res.status(201).json(pipeline);
  });

  app.patch("/api/research-pipelines/:id", async (req, res) => {
    const pipeline = await storage.updateResearchPipeline(req.params.id, req.body);
    if (!pipeline) {
      return res.status(404).json({ message: "Research pipeline not found" });
    }
    broadcast("research-pipeline:updated", pipeline);
    res.json(pipeline);
  });

  // ============================================
  // PLANNING LOOPS
  // ============================================

  app.get("/api/sessions/:sessionId/planning-loops", async (req, res) => {
    const loops = await storage.getPlanningLoops(req.params.sessionId);
    res.json(loops);
  });

  app.post("/api/planning-loops", async (req, res) => {
    const loop = await storage.createPlanningLoop(req.body as Omit<PlanningLoop, "id">);
    broadcast("planning-loop:created", loop);
    res.status(201).json(loop);
  });

  app.patch("/api/planning-loops/:id", async (req, res) => {
    const loop = await storage.updatePlanningLoop(req.params.id, req.body);
    if (!loop) {
      return res.status(404).json({ message: "Planning loop not found" });
    }
    broadcast("planning-loop:updated", loop);
    res.json(loop);
  });

  // ============================================
  // ERROR CONTEXTS
  // ============================================

  app.get("/api/sessions/:sessionId/error-contexts", async (req, res) => {
    const contexts = await storage.getErrorContexts(req.params.sessionId);
    res.json(contexts);
  });

  app.post("/api/error-contexts", async (req, res) => {
    const context = await storage.createErrorContext(req.body as Omit<ErrorContext, "id">);
    broadcast("error-context:created", context);
    res.status(201).json(context);
  });

  app.patch("/api/error-contexts/:id", async (req, res) => {
    const context = await storage.updateErrorContext(req.params.id, req.body);
    if (!context) {
      return res.status(404).json({ message: "Error context not found" });
    }
    broadcast("error-context:updated", context);
    res.json(context);
  });

  // ============================================
  // FRAMEWORK RECOMMENDATIONS
  // ============================================

  app.get("/api/sessions/:sessionId/framework-recommendations", async (req, res) => {
    const recommendations = await storage.getFrameworkRecommendations(req.params.sessionId);
    res.json(recommendations);
  });

  app.post("/api/framework-recommendations", async (req, res) => {
    const recommendation = await storage.createFrameworkRecommendation(
      req.body as Omit<FrameworkRecommendation, "id">
    );
    broadcast("framework-recommendation:created", recommendation);
    res.status(201).json(recommendation);
  });

  // ============================================
  // DECISION ENGINE
  // ============================================

  // Analyze code changes and recommend update vs rewrite
  app.post("/api/analyze-change", async (req, res) => {
    const { artifactId, newContent } = req.body as { artifactId: string; newContent: string };
    
    const artifact = await storage.getArtifact(artifactId);
    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }

    const session = await storage.getSession(artifact.sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Analyze the diff
    const oldLines = artifact.content.split('\n');
    const newLines = newContent.split('\n');
    
    let linesChanged = 0;
    let locationsChanged = 0;
    let inChangeBlock = false;
    
    const maxLength = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLength; i++) {
      if (oldLines[i] !== newLines[i]) {
        linesChanged++;
        if (!inChangeBlock) {
          locationsChanged++;
          inChangeBlock = true;
        }
      } else {
        inChangeBlock = false;
      }
    }

    // Apply decision rules from config
    const { maxLinesForUpdate, maxLocationsForUpdate, maxIterationsPerUpdate } = session.config;
    
    // Count current iteration
    const recentDecisions = await storage.getDecisions(session.id);
    const recentUpdates = recentDecisions.filter(
      d => d.artifactId === artifactId && 
           d.type === "update" &&
           Date.now() - new Date(d.timestamp).getTime() < 3600000 // within last hour
    );

    const shouldUpdate = 
      linesChanged <= maxLinesForUpdate &&
      locationsChanged <= maxLocationsForUpdate &&
      recentUpdates.length < maxIterationsPerUpdate;

    const recommendation = {
      decisionType: shouldUpdate ? "update" : "rewrite",
      linesChanged,
      locationsChanged,
      currentIterations: recentUpdates.length,
      maxIterations: maxIterationsPerUpdate,
      reasoning: shouldUpdate
        ? `Change is small enough (${linesChanged} lines, ${locationsChanged} locations) for an update. Iteration ${recentUpdates.length + 1}/${maxIterationsPerUpdate}.`
        : `Change requires rewrite: ${linesChanged > maxLinesForUpdate ? `${linesChanged} lines exceeds ${maxLinesForUpdate} limit` : ''} ${locationsChanged > maxLocationsForUpdate ? `${locationsChanged} locations exceeds ${maxLocationsForUpdate} limit` : ''} ${recentUpdates.length >= maxIterationsPerUpdate ? 'Max iterations reached' : ''}`.trim(),
    };

    res.json(recommendation);
  });

  // ============================================
  // CLAUDE SIMULATION (STUBBED API)
  // ============================================

  app.post("/api/simulate/generate", async (req, res) => {
    const { sessionId, prompt, mode } = req.body as { 
      sessionId: string; 
      prompt: string; 
      mode: AgentMode;
    };

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Simulate different behaviors based on mode
    let response: { thinking?: string; code?: string; toolCalls?: string[] };
    
    switch (mode) {
      case "deliberation":
        response = {
          thinking: `Analyzing the request: "${prompt.substring(0, 100)}..."

Key considerations:
1. This requires understanding the existing codebase structure
2. We should follow established patterns for consistency
3. The implementation should be modular and testable

Plan:
- First, research the current implementation
- Then propose code changes
- Finally, execute and verify`,
        };
        break;
        
      case "research":
        response = {
          thinking: `Initiating research pipeline for: "${prompt.substring(0, 50)}..."`,
          toolCalls: [
            "search_codebase",
            "read_file",
            "analyze_dependencies",
            "check_documentation",
            "validate_approach",
          ],
        };
        break;
        
      case "action":
        response = {
          code: `// Generated code for: ${prompt.substring(0, 50)}...
// This is a simulated response

export function generatedFunction() {
  // Implementation would go here
  console.log("Generated by autonomous agent");
}`,
        };
        break;
    }

    broadcast("simulation:response", { sessionId, mode, response });
    res.json(response);
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("WebSocket client connected");

    ws.on("close", () => {
      clients.delete(ws);
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });

  return httpServer;
}
