import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    wsClient.connect();

    // Session events
    const unsubSessionCreated = wsClient.subscribe('session:created', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    });
    const unsubSessionUpdated = wsClient.subscribe('session:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    });
    const unsubSessionDeleted = wsClient.subscribe('session:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    });

    // Artifact events
    const unsubArtifactCreated = wsClient.subscribe('artifact:created', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    });
    const unsubArtifactUpdated = wsClient.subscribe('artifact:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    });

    // Decision events
    const unsubDecisionCreated = wsClient.subscribe('decision:created', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    });

    return () => {
      unsubSessionCreated();
      unsubSessionUpdated();
      unsubSessionDeleted();
      unsubArtifactCreated();
      unsubArtifactUpdated();
      unsubDecisionCreated();
      wsClient.disconnect();
    };
  }, [queryClient]);
}
