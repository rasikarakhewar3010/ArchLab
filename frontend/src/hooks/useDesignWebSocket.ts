import useWebSocketModule from 'react-use-websocket';

const useWebSocket = typeof useWebSocketModule === 'function' 
  ? useWebSocketModule 
  : (useWebSocketModule as any)?.useWebSocket || (useWebSocketModule as any)?.default?.useWebSocket || (useWebSocketModule as any)?.default;
import { useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';

// Using the same URL format as the Django Channels routing
const WS_URL = 'ws://localhost:8000/ws/designs/';

interface WebSocketMessage {
  type: string;
  data: {
    nodes?: Node[];
    edges?: Edge[];
    senderId: string;
    nodeChanges?: NodeChange[];
    edgeChanges?: EdgeChange[];
  };
}

export const useDesignWebSocket = (
  designId: string, 
  clientId: string,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {

  const { sendMessage, readyState } = useWebSocket(
    designId ? `${WS_URL}${designId}/` : null,
    {
      onOpen: () => console.log('WebSocket connection opened'),
      onClose: () => console.log('WebSocket connection closed'),
      shouldReconnect: () => true,
      onMessage: (event: any) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Ignore messages that we sent ourselves
          if (message.data.senderId === clientId) return;

          if (message.type === 'design_update') {
            if (message.data.nodeChanges) {
              setNodes((nds) => applyNodeChanges(message.data.nodeChanges!, nds));
            }
            if (message.data.edgeChanges) {
              setEdges((eds) => applyEdgeChanges(message.data.edgeChanges!, eds));
            }
            // If full state is sent (e.g. for initial sync or major changes)
            if (message.data.nodes) {
              setNodes(message.data.nodes);
            }
            if (message.data.edges) {
              setEdges(message.data.edges);
            }
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message", e);
        }
      }
    }
  );

  const broadcastChanges = useCallback((nodeChanges?: NodeChange[], edgeChanges?: EdgeChange[]) => {
    const message = {
      type: 'canvas_update',
      senderId: clientId,
      nodeChanges,
      edgeChanges
    };
    sendMessage(JSON.stringify(message));
  }, [sendMessage, clientId]);

  const broadcastFullState = useCallback((nodes: Node[], edges: Edge[]) => {
    const message = {
      type: 'canvas_update',
      senderId: clientId,
      nodes,
      edges
    };
    sendMessage(JSON.stringify(message));
  }, [sendMessage, clientId]);

  return { broadcastChanges, broadcastFullState, readyState };
};
