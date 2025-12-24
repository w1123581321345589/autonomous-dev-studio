import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RefreshCw, 
  Wrench, 
  Plus, 
  Trash2,
  Brain,
  Code,
  Search,
  History,
} from "lucide-react";
import type { Decision, DecisionType, AgentMode } from "@shared/schema";

interface DecisionLogProps {
  sessionId: string;
}

function getDecisionIcon(type: DecisionType) {
  switch (type) {
    case "update": return <RefreshCw className="h-3.5 w-3.5 text-blue-500" />;
    case "rewrite": return <Wrench className="h-3.5 w-3.5 text-orange-500" />;
    case "create": return <Plus className="h-3.5 w-3.5 text-green-500" />;
    case "delete": return <Trash2 className="h-3.5 w-3.5 text-red-500" />;
  }
}

function getModeIcon(mode: AgentMode) {
  switch (mode) {
    case "deliberation": return <Brain className="h-3 w-3" />;
    case "action": return <Code className="h-3 w-3" />;
    case "research": return <Search className="h-3 w-3" />;
  }
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function DecisionLog({ sessionId }: DecisionLogProps) {
  const { data: decisions = [], isLoading } = useQuery<Decision[]>({
    queryKey: ["/api/sessions", sessionId, "decisions"],
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Decision Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4" />
          Decision Log ({decisions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No decisions yet. The agent will log all update vs rewrite decisions here.
              </p>
            ) : (
              decisions.map((decision, index) => (
                <div
                  key={decision.id}
                  className="relative pl-6 pb-4 border-l border-border last:pb-0"
                >
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-border" />
                  
                  <div className="flex items-center gap-2 mb-1">
                    {getDecisionIcon(decision.type)}
                    <Badge variant="outline" className="text-xs capitalize">
                      {decision.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getModeIcon(decision.mode)}
                      <span className="ml-1 capitalize">{decision.mode}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatTime(decision.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {decision.reasoning}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{decision.linesChanged} lines</span>
                    <span>{decision.locationsChanged} locations</span>
                    <span>iteration #{decision.iterationNumber}</span>
                    {decision.wasAutomatic && (
                      <Badge variant="outline" className="text-xs">
                        auto
                      </Badge>
                    )}
                  </div>

                  {decision.diffSummary && (
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                      {decision.diffSummary}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
