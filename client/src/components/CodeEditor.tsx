import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileCode, 
  History, 
  Copy, 
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Artifact, ArtifactVersion } from "@shared/schema";

interface CodeEditorProps {
  artifactId: string | null;
}

function SyntaxHighlight({ code, language }: { code: string; language: string }) {
  // Simple syntax highlighting for demo
  const lines = code.split('\n');
  
  return (
    <div className="font-mono text-xs leading-relaxed">
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="w-10 text-right pr-4 text-muted-foreground select-none">
            {i + 1}
          </span>
          <span className="flex-1 whitespace-pre-wrap break-all">
            {highlightLine(line)}
          </span>
        </div>
      ))}
    </div>
  );
}

function highlightLine(line: string): JSX.Element {
  // Simple keyword highlighting
  const keywords = ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'async', 'await'];
  const parts: JSX.Element[] = [];
  
  // Check for comments
  if (line.trim().startsWith('//')) {
    return <span className="text-muted-foreground italic">{line}</span>;
  }
  
  // Check for strings
  let remaining = line;
  let key = 0;
  
  while (remaining.length > 0) {
    // Check for string literals
    const stringMatch = remaining.match(/^([^"'`]*)(["'`])([^"'`]*)(["'`])/);
    if (stringMatch) {
      parts.push(<span key={key++}>{highlightKeywords(stringMatch[1])}</span>);
      parts.push(
        <span key={key++} className="text-green-500">
          {stringMatch[2]}{stringMatch[3]}{stringMatch[4]}
        </span>
      );
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }
    
    parts.push(<span key={key++}>{highlightKeywords(remaining)}</span>);
    break;
  }
  
  return <>{parts}</>;
}

function highlightKeywords(text: string): JSX.Element {
  const keywords = ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'async', 'await', 'default', 'new', 'this', 'true', 'false', 'null', 'undefined'];
  
  const parts: (string | JSX.Element)[] = [];
  const words = text.split(/(\s+|[{}()[\];,.<>:=+\-*/])/);
  
  words.forEach((word, i) => {
    if (keywords.includes(word)) {
      parts.push(<span key={i} className="text-purple-400">{word}</span>);
    } else if (/^\d+$/.test(word)) {
      parts.push(<span key={i} className="text-orange-400">{word}</span>);
    } else {
      parts.push(word);
    }
  });
  
  return <>{parts}</>;
}

export function CodeEditor({ artifactId }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const { data: artifact, isLoading, error, isError } = useQuery<Artifact>({
    queryKey: ["/api/artifacts", artifactId],
    enabled: !!artifactId,
  });

  const { data: versions = [] } = useQuery<ArtifactVersion[]>({
    queryKey: ["/api/artifacts", artifactId, "versions"],
    enabled: !!artifactId,
  });

  useEffect(() => {
    if (artifact) {
      setSelectedVersion(artifact.version);
    }
  }, [artifact]);

  const handleCopy = async () => {
    if (!artifact) return;
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentContent = selectedVersion 
    ? versions.find(v => v.version === selectedVersion)?.content || artifact?.content
    : artifact?.content;

  if (!artifactId) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select an artifact to view its code</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading artifact...</div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Failed to load artifact</p>
          <p className="text-xs mt-2">{error?.message}</p>
        </div>
      </Card>
    );
  }

  if (!artifact) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Artifact not found</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            {artifact.name}
            <Badge variant="outline" className="text-xs">
              {artifact.type}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={selectedVersion === 1}
                onClick={() => setSelectedVersion(Math.max(1, (selectedVersion || artifact.version) - 1))}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span>v{selectedVersion || artifact.version}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={selectedVersion === artifact.version}
                onClick={() => setSelectedVersion(Math.min(artifact.version, (selectedVersion || 1) + 1))}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              data-testid="button-copy-code"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{artifact.path}</span>
          <span>{artifact.lineCount} lines</span>
          <span>{artifact.charCount} chars</span>
          {artifact.isPromoted && (
            <Badge variant="secondary" className="text-xs">
              Promoted (durable artifact)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 bg-muted/30">
            <SyntaxHighlight code={currentContent || ""} language={artifact.type} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
