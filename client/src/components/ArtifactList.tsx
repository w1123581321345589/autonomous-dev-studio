import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileCode, 
  FileJson, 
  FileType, 
  File,
  Layers,
  Clock,
} from "lucide-react";
import type { Artifact, ArtifactType } from "@shared/schema";

interface ArtifactListProps {
  sessionId: string;
  selectedArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
}

function getArtifactIcon(type: ArtifactType) {
  switch (type) {
    case "react-component":
    case "typescript":
    case "javascript":
      return <FileCode className="h-4 w-4" />;
    case "json":
      return <FileJson className="h-4 w-4" />;
    case "css":
    case "html":
      return <FileType className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ArtifactList({ sessionId, selectedArtifactId, onSelectArtifact }: ArtifactListProps) {
  const { data: artifacts = [], isLoading } = useQuery<Artifact[]>({
    queryKey: ["/api/sessions", sessionId, "artifacts"],
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Artifacts</CardTitle>
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
          <Layers className="h-4 w-4" />
          Artifacts ({artifacts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-1">
            {artifacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No artifacts yet. Start generating code to see them here.
              </p>
            ) : (
              artifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  onClick={() => onSelectArtifact(artifact.id)}
                  className={`w-full text-left p-2 rounded-md hover-elevate transition-colors ${
                    selectedArtifactId === artifact.id
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                  data-testid={`button-artifact-${artifact.id}`}
                >
                  <div className="flex items-center gap-2">
                    {getArtifactIcon(artifact.type)}
                    <span className="text-sm font-medium truncate flex-1">
                      {artifact.name}
                    </span>
                    {artifact.isPromoted && (
                      <Badge variant="secondary" className="text-xs">
                        promoted
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{artifact.path}</span>
                    <span>v{artifact.version}</span>
                    <span>{artifact.lineCount} lines</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(artifact.updatedAt)}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
