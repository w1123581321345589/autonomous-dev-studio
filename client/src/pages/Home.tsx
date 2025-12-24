import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SessionSidebar } from "@/components/SessionSidebar";
import { ModeController } from "@/components/ModeController";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { ArtifactList } from "@/components/ArtifactList";
import { DecisionLog } from "@/components/DecisionLog";
import { CodeEditor } from "@/components/CodeEditor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SidebarProvider, 
  SidebarTrigger,
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { 
  Play, 
  Pause, 
  BarChart3, 
  FileCode, 
  History,
  Zap,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { Session } from "@shared/schema";
import { DEMO_SESSION, DEMO_ARTIFACTS, DEMO_DECISIONS, DEMO_TOOL_CALLS } from "@/lib/demoData";

export default function Home() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("code");

  const { data: session } = useQuery<Session>({
    queryKey: ["/api/sessions", selectedSessionId],
    enabled: !!selectedSessionId,
  });

  const seedDemo = useMutation({
    mutationFn: async () => {
      const sessionRes = await apiRequest("POST", "/api/sessions", {
        name: DEMO_SESSION.name,
        description: DEMO_SESSION.description,
      });
      const newSession = await sessionRes.json();
      
      // Create artifacts and collect their IDs
      const artifactIds: string[] = [];
      for (const artifact of DEMO_ARTIFACTS) {
        const artRes = await apiRequest("POST", "/api/artifacts", {
          ...artifact,
          sessionId: newSession.id,
        });
        const art = await artRes.json();
        artifactIds.push(art.id);
      }

      // Create decisions linked to artifacts
      for (let i = 0; i < Math.min(artifactIds.length, DEMO_DECISIONS.length); i++) {
        await apiRequest("POST", "/api/decisions", {
          ...DEMO_DECISIONS[i],
          sessionId: newSession.id,
          artifactId: artifactIds[i],
        });
      }

      // Create remaining decisions
      for (let i = artifactIds.length; i < DEMO_DECISIONS.length; i++) {
        await apiRequest("POST", "/api/decisions", {
          ...DEMO_DECISIONS[i],
          sessionId: newSession.id,
          artifactId: artifactIds[0],
        });
      }

      // Create tool calls
      for (const toolCall of DEMO_TOOL_CALLS) {
        await apiRequest("POST", "/api/tool-calls", {
          name: toolCall.name,
          description: toolCall.description,
          parameters: toolCall.parameters,
          sessionId: newSession.id,
        });
      }
      
      return newSession;
    },
    onSuccess: (newSession: Session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setSelectedSessionId(newSession.id);
    },
  });

  // Update duration timer
  useEffect(() => {
    if (!session || session.status !== "active") return;
    
    const interval = setInterval(() => {
      // Duration is updated on the server, this just triggers re-render
    }, 1000);
    
    return () => clearInterval(interval);
  }, [session]);

  const sidebarStyle = {
    "--sidebar-width": "280px",
    "--sidebar-width-icon": "60px",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarContent className="p-0">
            <SessionSidebar
              selectedSessionId={selectedSessionId}
              onSelectSession={setSelectedSessionId}
            />
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h1 className="font-semibold">Autonomous Dev Studio</h1>
              </div>
            </div>

            {session && (
              <div className="flex items-center gap-4">
                <ModeController session={session} />
                
                <div className="flex items-center gap-2">
                  {session.status === "active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      data-testid="button-pause-session"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      Pause
                    </Button>
                  ) : session.status === "paused" ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1.5"
                      data-testid="button-resume-session"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Resume
                    </Button>
                  ) : session.status === "error" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      data-testid="button-error-session"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Error
                    </Button>
                  ) : null}
                </div>
              </div>
            )}

            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-hidden">
            {!selectedSessionId ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                  <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-3">Autonomous Development Studio</h2>
                  <p className="text-muted-foreground mb-6">
                    Watch Claude autonomously build complex applications over extended sessions. 
                    Observe artifact management, update vs rewrite decisions, and long-horizon 
                    planning in real-time.
                  </p>
                  <div className="space-y-2 text-sm text-left bg-muted/50 p-4 rounded-lg">
                    <p><strong>Key Patterns:</strong></p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Durable artifacts (&gt;20 lines promoted)</li>
                      <li>Iterative updates (≤20 lines, ≤5 locations, up to 4x)</li>
                      <li>Mode switching (Deliberation → Action → Research)</li>
                      <li>Error rituals and ghost context removal</li>
                      <li>Voyager-style planning loops</li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3 mt-6">
                    <p className="text-sm text-muted-foreground">
                      Create a session to begin autonomous development.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => seedDemo.mutate()}
                      disabled={seedDemo.isPending}
                      className="gap-2"
                      data-testid="button-seed-demo"
                    >
                      <Sparkles className="h-4 w-4" />
                      {seedDemo.isPending ? "Loading Demo..." : "Load Demo: Slack Clone"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : session ? (
              <div className="h-full flex">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <div className="px-4 pt-4 flex-shrink-0">
                      <TabsList>
                        <TabsTrigger value="code" className="gap-1.5" data-testid="tab-code">
                          <FileCode className="h-3.5 w-3.5" />
                          Code
                        </TabsTrigger>
                        <TabsTrigger value="decisions" className="gap-1.5" data-testid="tab-decisions">
                          <History className="h-3.5 w-3.5" />
                          Decisions
                        </TabsTrigger>
                        <TabsTrigger value="metrics" className="gap-1.5" data-testid="tab-metrics">
                          <BarChart3 className="h-3.5 w-3.5" />
                          Metrics
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="code" className="flex-1 overflow-hidden m-0 p-4">
                      <div className="h-full grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
                        <ArtifactList
                          sessionId={selectedSessionId}
                          selectedArtifactId={selectedArtifactId}
                          onSelectArtifact={setSelectedArtifactId}
                        />
                        <CodeEditor artifactId={selectedArtifactId} />
                      </div>
                    </TabsContent>

                    <TabsContent value="decisions" className="flex-1 overflow-hidden m-0 p-4">
                      <DecisionLog sessionId={selectedSessionId} />
                    </TabsContent>

                    <TabsContent value="metrics" className="flex-1 overflow-auto m-0 p-4">
                      <MetricsDashboard session={session} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading session...</div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
