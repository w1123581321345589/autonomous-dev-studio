import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FileCode, 
  GitBranch, 
  RefreshCw, 
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { Session } from "@shared/schema";

interface MetricsDashboardProps {
  session: Session;
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function MetricsDashboard({ session }: MetricsDashboardProps) {
  const { metrics, config } = session;
  
  const updateRatio = metrics.updatesPerformed + metrics.rewritesPerformed > 0
    ? (metrics.updatesPerformed / (metrics.updatesPerformed + metrics.rewritesPerformed)) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold" data-testid="text-duration">
              {formatDuration(session.totalDuration)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Lines Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold" data-testid="text-lines">
              {metrics.linesGenerated.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5" />
              Artifacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold" data-testid="text-artifacts">
              {metrics.artifactsCreated}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              Iterations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold" data-testid="text-iterations">
              {metrics.iterationCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Update vs Rewrite Ratio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                Updates: {metrics.updatesPerformed}
              </span>
              <span className="flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-orange-500" />
                Rewrites: {metrics.rewritesPerformed}
              </span>
            </div>
            <Progress value={updateRatio} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {updateRatio.toFixed(0)}% updates (target: maximize small diffs)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Health Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span>Tool Calls: {metrics.toolCallsMade}</span>
              </div>
              <div className="flex items-center gap-2">
                {metrics.errorsRecovered > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Errors Recovered: {metrics.errorsRecovered}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Session Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Max Update Lines</p>
              <p className="font-medium">{config.maxLinesForUpdate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Update Locations</p>
              <p className="font-medium">{config.maxLocationsForUpdate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Iterations/Update</p>
              <p className="font-medium">{config.maxIterationsPerUpdate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Artifact Threshold</p>
              <p className="font-medium">{config.lineThresholdForArtifact} lines / {config.charThresholdForArtifact} chars</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {config.blockLocalStorage && (
              <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded">
                localStorage blocked
              </span>
            )}
            {config.blockSessionStorage && (
              <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded">
                sessionStorage blocked
              </span>
            )}
            {config.blockHtmlForms && (
              <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded">
                HTML forms blocked
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
