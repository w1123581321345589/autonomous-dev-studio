import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Brain, Code, Search, ArrowRight } from "lucide-react";
import type { Session, AgentMode } from "@shared/schema";

interface ModeControllerProps {
  session: Session;
}

const modes: { mode: AgentMode; icon: typeof Brain; label: string; description: string }[] = [
  { 
    mode: "deliberation", 
    icon: Brain, 
    label: "Deliberation",
    description: "Plan before executing. Analyze requirements, propose architecture, review constraints."
  },
  { 
    mode: "action", 
    icon: Code, 
    label: "Action",
    description: "Execute code changes. Apply updates or rewrites based on deliberation outcomes."
  },
  { 
    mode: "research", 
    icon: Search, 
    label: "Research",
    description: "Gather information. Run 5-20 tool calls to investigate before making decisions."
  },
];

export function ModeController({ session }: ModeControllerProps) {
  const changeMode = useMutation({
    mutationFn: async (mode: AgentMode) => {
      const res = await apiRequest("POST", `/api/sessions/${session.id}/mode`, { mode });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
      {modes.map(({ mode, icon: Icon, label, description }, index) => (
        <div key={mode} className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={session.currentMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => changeMode.mutate(mode)}
                disabled={changeMode.isPending}
                className="gap-1.5"
                data-testid={`button-mode-${mode}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">{label} Mode</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </TooltipContent>
          </Tooltip>
          {index < modes.length - 1 && (
            <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}
