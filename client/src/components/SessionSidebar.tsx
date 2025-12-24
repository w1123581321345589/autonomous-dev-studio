import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Code,
  Search,
  Clock,
  FileCode,
  GitBranch,
} from "lucide-react";
import type { Session, AgentMode, SessionStatus } from "@shared/schema";

interface SessionSidebarProps {
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
}

function getModeIcon(mode: AgentMode) {
  switch (mode) {
    case "deliberation": return <Brain className="h-3 w-3" />;
    case "action": return <Code className="h-3 w-3" />;
    case "research": return <Search className="h-3 w-3" />;
  }
}

function getStatusIcon(status: SessionStatus) {
  switch (status) {
    case "active": return <Play className="h-3 w-3 text-green-500" />;
    case "paused": return <Pause className="h-3 w-3 text-yellow-500" />;
    case "completed": return <CheckCircle className="h-3 w-3 text-blue-500" />;
    case "error": return <AlertCircle className="h-3 w-3 text-red-500" />;
  }
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function SessionSidebar({ selectedSessionId, onSelectSession }: SessionSidebarProps) {
  const [newSessionName, setNewSessionName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const createSession = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/sessions", { name });
      return res.json();
    },
    onSuccess: (session: Session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      onSelectSession(session.id);
      setNewSessionName("");
      setIsDialogOpen(false);
    },
  });

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="font-semibold text-sidebar-foreground">Sessions</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-new-session">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Development Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Session name (e.g., Build Slack Clone)"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  data-testid="input-session-name"
                />
                <Button 
                  onClick={() => createSession.mutate(newSessionName)}
                  disabled={!newSessionName.trim() || createSession.isPending}
                  className="w-full"
                  data-testid="button-create-session"
                >
                  {createSession.isPending ? "Creating..." : "Start Session"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No sessions yet. Create one to start autonomous development.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left p-3 rounded-md hover-elevate transition-colors ${
                  selectedSessionId === session.id 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground"
                }`}
                data-testid={`button-session-${session.id}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(session.status)}
                  <span className="font-medium text-sm truncate flex-1">
                    {session.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {getModeIcon(session.currentMode)}
                    <span className="ml-1 capitalize">{session.currentMode}</span>
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(session.totalDuration)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileCode className="h-3 w-3" />
                    {session.metrics.artifactsCreated}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {session.metrics.iterationCount}
                  </span>
                  <span>{session.metrics.linesGenerated} lines</span>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
