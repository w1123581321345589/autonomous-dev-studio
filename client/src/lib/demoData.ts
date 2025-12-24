// Demo data for showcasing the autonomous development studio
// This simulates what a 30-hour session building a Slack-like app would look like

import type { 
  Session, 
  Artifact, 
  Decision, 
  ToolCall,
  SessionMetrics,
  SessionConfig,
} from "@shared/schema";

export const DEMO_SESSION: Omit<Session, "id"> = {
  name: "Build Slack Clone",
  description: "Autonomous development of a real-time chat application with channels, direct messages, presence, and notifications",
  status: "active",
  currentMode: "action",
  startedAt: new Date(Date.now() - 108000000), // 30 hours ago
  lastActivityAt: new Date(),
  totalDuration: 108000000, // 30 hours in ms
  metrics: {
    linesGenerated: 11247,
    artifactsCreated: 47,
    updatesPerformed: 156,
    rewritesPerformed: 23,
    toolCallsMade: 312,
    errorsRecovered: 8,
    iterationCount: 179,
  },
  config: {
    maxIterationsPerUpdate: 4,
    maxLinesForUpdate: 20,
    maxLocationsForUpdate: 5,
    charThresholdForArtifact: 1500,
    lineThresholdForArtifact: 20,
    blockLocalStorage: true,
    blockSessionStorage: true,
    blockHtmlForms: true,
    preferredStack: ["react", "typescript", "express", "tailwindcss", "websocket"],
  },
  conversationHistory: [
    {
      id: "1",
      role: "user",
      content: "Build a Slack-like chat application with real-time messaging, channels, and user presence.",
      timestamp: new Date(Date.now() - 108000000),
    },
    {
      id: "2", 
      role: "assistant",
      content: "I'll build a comprehensive Slack-like application. Let me start by planning the architecture...",
      timestamp: new Date(Date.now() - 107990000),
      mode: "deliberation",
    },
  ],
};

export const DEMO_ARTIFACTS: Omit<Artifact, "id" | "sessionId">[] = [
  {
    name: "App.tsx",
    type: "react-component",
    path: "client/src/App.tsx",
    content: `import { useState, useEffect } from 'react';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { ChannelView } from './components/ChannelView';
import { DirectMessages } from './components/DirectMessages';
import { UserPresence } from './components/UserPresence';

export default function App() {
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'channel' | 'dm'>('channel');

  return (
    <AuthProvider>
      <WebSocketProvider>
        <div className="flex h-screen bg-slate-900">
          <Sidebar 
            onSelectChannel={setActiveChannel}
            onChangeView={setActiveView}
          />
          <main className="flex-1 flex flex-col">
            {activeView === 'channel' ? (
              <ChannelView channelId={activeChannel} />
            ) : (
              <DirectMessages />
            )}
          </main>
          <UserPresence />
        </div>
      </WebSocketProvider>
    </AuthProvider>
  );
}`,
    version: 4,
    lineCount: 32,
    charCount: 987,
    dependencies: [],
    isPromoted: true,
    createdAt: new Date(Date.now() - 107000000),
    updatedAt: new Date(Date.now() - 3600000),
    history: [],
  },
  {
    name: "MessageComposer.tsx",
    type: "react-component",
    path: "client/src/components/MessageComposer.tsx",
    content: `import { useState, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { EmojiPicker } from './EmojiPicker';
import { FileUpload } from './FileUpload';
import { MentionAutocomplete } from './MentionAutocomplete';

interface MessageComposerProps {
  channelId: string;
  onMessageSent?: () => void;
}

export function MessageComposer({ channelId, onMessageSent }: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useWebSocket();
  const { user } = useAuth();

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || !user) return;
    
    await sendMessage({
      channelId,
      content: content.trim(),
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
    
    setContent('');
    onMessageSent?.();
  }, [content, channelId, user, sendMessage, onMessageSent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-700 p-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="pr-24 resize-none"
          rows={3}
        />
        <div className="absolute right-2 bottom-2 flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </Button>
          <FileUpload onUpload={() => setIsUploading(true)} />
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Send
          </Button>
        </div>
      </div>
      {showEmojiPicker && (
        <EmojiPicker onSelect={(emoji) => setContent(prev => prev + emoji)} />
      )}
    </div>
  );
}`,
    version: 7,
    lineCount: 72,
    charCount: 2156,
    dependencies: [],
    isPromoted: true,
    createdAt: new Date(Date.now() - 100000000),
    updatedAt: new Date(Date.now() - 1800000),
    history: [],
  },
  {
    name: "WebSocketContext.tsx",
    type: "react-component",
    path: "client/src/contexts/WebSocketContext.tsx",
    content: `import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface WebSocketContextValue {
  isConnected: boolean;
  sendMessage: (message: any) => Promise<void>;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    const ws = new WebSocket(\`wss://\${window.location.host}/ws\`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      listenersRef.current.get(type)?.forEach(cb => cb(data));
    };

    return () => ws.close();
  }, []);

  const sendMessage = useCallback(async (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);
    return () => listenersRef.current.get(event)?.delete(callback);
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
}`,
    version: 3,
    lineCount: 52,
    charCount: 1678,
    dependencies: [],
    isPromoted: true,
    createdAt: new Date(Date.now() - 106000000),
    updatedAt: new Date(Date.now() - 7200000),
    history: [],
  },
];

export const DEMO_DECISIONS: Omit<Decision, "id" | "sessionId">[] = [
  {
    artifactId: "",
    type: "create",
    reasoning: "Initial scaffold for the application entry point. Setting up provider hierarchy and main layout structure.",
    linesChanged: 32,
    locationsChanged: 1,
    diffSummary: "+ App.tsx created with 32 lines",
    wasAutomatic: false,
    iterationNumber: 1,
    mode: "action",
    timestamp: new Date(Date.now() - 107000000),
  },
  {
    artifactId: "",
    type: "update",
    reasoning: "Small refinement to add error boundary wrapper. Change is under 20 lines threshold (8 lines, 2 locations).",
    linesChanged: 8,
    locationsChanged: 2,
    diffSummary: "+ import ErrorBoundary\n+ <ErrorBoundary> wrapper",
    wasAutomatic: true,
    iterationNumber: 2,
    mode: "action",
    timestamp: new Date(Date.now() - 105000000),
  },
  {
    artifactId: "",
    type: "rewrite",
    reasoning: "Major restructure of MessageComposer to support file uploads and emoji picker. 45 lines changed across 8 locations exceeds update thresholds.",
    linesChanged: 45,
    locationsChanged: 8,
    diffSummary: "Complete rewrite of MessageComposer component",
    wasAutomatic: true,
    iterationNumber: 1,
    mode: "action",
    timestamp: new Date(Date.now() - 90000000),
  },
  {
    artifactId: "",
    type: "update",
    reasoning: "Fix keyboard shortcut for send (Enter without Shift). Minimal change: 5 lines, 1 location.",
    linesChanged: 5,
    locationsChanged: 1,
    diffSummary: "+ handleKeyDown function\n+ onKeyDown prop",
    wasAutomatic: true,
    iterationNumber: 3,
    mode: "action",
    timestamp: new Date(Date.now() - 85000000),
  },
  {
    artifactId: "",
    type: "update",
    reasoning: "Add loading state for file uploads. Within update limits: 12 lines, 3 locations, iteration 4/4.",
    linesChanged: 12,
    locationsChanged: 3,
    diffSummary: "+ isUploading state\n+ disabled state during upload\n+ loading indicator",
    wasAutomatic: true,
    iterationNumber: 4,
    mode: "action",
    timestamp: new Date(Date.now() - 80000000),
  },
];

export const DEMO_TOOL_CALLS: Omit<ToolCall, "id" | "sessionId">[] = [
  {
    name: "search_codebase",
    description: "Find existing WebSocket implementations in the codebase",
    parameters: { query: "WebSocket connection handling", path: "client/src" },
    result: { found: false, suggestion: "Create new WebSocketContext" },
    status: "completed",
    duration: 1250,
    mode: "research",
    pipelineStep: 1,
    timestamp: new Date(Date.now() - 106500000),
  },
  {
    name: "read_file",
    description: "Examine existing auth context for integration",
    parameters: { path: "client/src/contexts/AuthContext.tsx" },
    result: { content: "// Auth context implementation..." },
    status: "completed",
    duration: 450,
    mode: "research",
    pipelineStep: 2,
    timestamp: new Date(Date.now() - 106400000),
  },
  {
    name: "analyze_dependencies",
    description: "Check for WebSocket libraries in package.json",
    parameters: { file: "package.json" },
    result: { hasWs: true, version: "8.14.2" },
    status: "completed",
    duration: 320,
    mode: "research",
    pipelineStep: 3,
    timestamp: new Date(Date.now() - 106300000),
  },
];

// Function to seed demo data via API
export async function seedDemoData() {
  try {
    // Create session
    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: DEMO_SESSION.name, 
        description: DEMO_SESSION.description 
      }),
    });
    const session = await sessionRes.json();

    // Create artifacts and corresponding decisions
    const artifactIds: string[] = [];
    for (const artifact of DEMO_ARTIFACTS) {
      const artRes = await fetch('/api/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...artifact, sessionId: session.id }),
      });
      const art = await artRes.json();
      artifactIds.push(art.id);
    }

    // Create decisions for each artifact
    for (let i = 0; i < Math.min(artifactIds.length, DEMO_DECISIONS.length); i++) {
      const decision = { ...DEMO_DECISIONS[i], sessionId: session.id, artifactId: artifactIds[i] };
      await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision),
      });
    }

    // Create tool calls
    for (const toolCall of DEMO_TOOL_CALLS) {
      await fetch('/api/tool-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...toolCall, sessionId: session.id }),
      });
    }

    console.log('Demo data seeded successfully!');
    return session;
  } catch (error) {
    console.error('Failed to seed demo data:', error);
    throw error;
  }
}
