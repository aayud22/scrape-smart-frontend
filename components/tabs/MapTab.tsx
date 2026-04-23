import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  SelectionMode,
  useOnSelectionChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getLayoutedElements } from "@/utils/mapLayout";
import ArchitectureNode from "@/components/map/ArchitectureNode";
import SelectionHud from "@/components/map/SelectionHud";
import DirectoryPanel from "@/components/map/DirectoryPanel";
import LoadingState from "../LoadingState";
import ErrorState from "../ErrorState";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Target,
  MousePointer2,
  Hand,
  Plus,
  RotateCcw,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { cn } from "@/utils/helpers";

export type MapLinksData = { url: string; title: string };

/* ─────────────────────────────────────────────
   Zoom controls that live inside ReactFlowProvider
   ───────────────────────────────────────────── */
const ZoomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5 p-0.5 bg-accent/50 border border-border rounded-xl">
        <button
          onClick={() => zoomIn()}
          className="p-2 hover:bg-card rounded-lg transition-all text-muted-foreground/50 hover:text-primary cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => zoomOut()}
          className="p-2 hover:bg-card rounded-lg transition-all text-muted-foreground/50 hover:text-primary cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>
      <button
        onClick={() => fitView({ padding: 0.3, duration: 500 })}
        className="flex items-center gap-1.5 h-9 px-3 bg-accent/50 border border-border rounded-xl text-[10px] font-black uppercase tracking-wider text-muted-foreground/50 hover:text-foreground transition-all cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span className="hidden sm:inline">Reset View</span>
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Inner ReactFlow canvas
   ───────────────────────────────────────────── */
const MapCanvas = ({
  mapLinksData,
  searchQuery,
  interactionMode,
  selectedUrl,
  onInit,
}: {
  mapLinksData: MapLinksData[];
  searchQuery: string;
  interactionMode: "select" | "pan";
  selectedUrl: string | null;
  onInit: (instance: any) => void;
}) => {
  const flowInstance = useReactFlow();
  const { fitView } = flowInstance;
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);

  useEffect(() => {
    onInit(flowInstance);
  }, [flowInstance, onInit]);

  const initialElements = useMemo(() => {
    const nodes: Node[] = [
      {
        id: "root",
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          label: "Home",
          url: "/",
          title: "Main Map Directory",
          linksCount: mapLinksData.length,
          isHighlighted: false,
          isRoot: true,
        },
      },
    ];
    const edges: Edge[] = [];

    mapLinksData.forEach((item: MapLinksData) => {
      try {
        const parts = new URL(item.url).pathname.split("/").filter(Boolean);
        let parentId = "root";
        parts.forEach((part) => {
          const nodeId = `${parentId}-${part}`;
          if (!nodes.find((n) => n.id === nodeId)) {
            nodes.push({
              id: nodeId,
              type: "custom",
              position: { x: 0, y: 0 },
              data: {
                label: part,
                url: item.url,
                title: item.title,
                linksCount: Math.floor(Math.random() * 10) + 1,
                isHighlighted: false,
                isRoot: false,
              },
            });
            edges.push({
              id: `edge-${parentId}-${nodeId}`,
              source: parentId,
              target: nodeId,
              animated: true,
              style: {
                stroke: "var(--border)",
                strokeDasharray: "4 4",
                strokeWidth: 2,
              },
            });
          }
          parentId = nodeId;
        });
      } catch {
        /* skip invalid URLs */
      }
    });

    const matches = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isHighlighted:
          !!searchQuery &&
          ((node.data as any).label
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            (node.data as any).title
              .toLowerCase()
              .includes(searchQuery.toLowerCase())),
      },
    }));

    return getLayoutedElements(matches, edges);
  }, [mapLinksData, searchQuery]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  useOnSelectionChange({
    onChange: ({ nodes }) => setSelectedNodes(nodes),
  });

  // Sync internal state with initialElements and handle search highlighting
  useEffect(() => {
    setNodes(initialElements.nodes);
    setEdges(initialElements.edges);

    if (searchQuery) {
      const matchedIds = initialElements.nodes
        .filter((n) => (n.data as any).isHighlighted)
        .map((n) => n.id);
      if (matchedIds.length > 0) {
        fitView({
          nodes: matchedIds.map((id) => ({ id })),
          padding: 0.6,
          duration: 800,
          maxZoom: 1,
        });
      }
    }
  }, [initialElements, setNodes, setEdges, searchQuery, fitView]);

  // Handle auto-navigation when selectedUrl changes
  useEffect(() => {
    if (!selectedUrl) return;

    // 1. Reconstruct target ID from URL pathname
    let targetId = "root";
    try {
      const pathname = new URL(selectedUrl).pathname;
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        targetId = `root-${segments.join("-")}`;
      }
    } catch (e) { /* ignore */ }

    // 2. Perform centering with a slight delay to ensure React Flow has measured the nodes
    const timer = setTimeout(() => {
      const latestNodes = flowInstance.getNodes();
      const node = latestNodes.find((n: any) => n.id === targetId) || 
                   latestNodes.find((n: any) => n.data?.url === selectedUrl);

      if (node) {
        // Highlight the node
        setNodes((nds: any) => nds.map((n: any) => ({
          ...n,
          selected: n.id === node.id
        })));

        // Use fitView for robust centering
        flowInstance.fitView({
          nodes: [{ id: node.id }],
          duration: 800,
          padding: 0.5, 
          maxZoom: 1.6
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedUrl, setNodes, flowInstance]); // Removed 'nodes' to prevent infinite loop

  const onSelectionStart = useCallback(
    () => setIsDraggingSelection(true),
    []
  );
  const onSelectionEnd = useCallback(
    () => setIsDraggingSelection(false),
    []
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (interactionMode === "pan") {
        setSelectedNodes([node]);
      }
    },
    [interactionMode]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{ custom: ArchitectureNode }}
        fitView
        className="bg-background"
        minZoom={0.1}
        maxZoom={2}
        panOnDrag={interactionMode === "pan"}
        selectionOnDrag={interactionMode === "select"}
        selectionMode={SelectionMode.Partial}
        onSelectionStart={onSelectionStart}
        onSelectionEnd={onSelectionEnd}
        onNodeClick={onNodeClick}
        style={{
          cursor:
            interactionMode === "select" || isDraggingSelection
              ? "pointer"
              : "inherit",
        }}
      >
        <Background
          gap={32}
          size={1}
          color="currentColor"
          className="text-muted-foreground/10"
        />
      </ReactFlow>

      <SelectionHud
        selectedNodes={selectedNodes}
        onClear={() => setSelectedNodes([])}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main MapTab component
   ───────────────────────────────────────────── */
export default function MapTab({ isMapping, mapLinksData, error }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [interactionMode, setInteractionMode] = useState<"select" | "pan">(
    "pan"
  );
  const [showPanel, setShowPanel] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const flowRef = useRef<any>(null);

  if (isMapping)
    return (
      <LoadingState message="Decoding system architecture clusters..." />
    );
  if (error)
    return <ErrorState title="Neural Mapping Failed" message={error} />;
  if (!mapLinksData) return null;

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Sub-header Toolbar ── */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-md">
          {/* Left: Title */}
          <h2 className="text-sm font-black uppercase tracking-widest whitespace-nowrap">
            Map Links Tree
          </h2>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within/search:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Find node or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-56 pl-9 pr-3 bg-accent/50 border border-border rounded-xl text-xs font-bold placeholder:text-muted-foreground/30 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            {/* Zoom + Reset (connected to ReactFlowProvider) */}
            <ZoomControls />

            {/* Mode Toggle */}
            <div className="flex items-center gap-0.5 p-0.5 bg-accent/50 border border-border rounded-xl">
              <button
                onClick={() => setInteractionMode("select")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  interactionMode === "select"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground/50 hover:text-foreground"
                )}
              >
                <MousePointer2 className="w-3 h-3" />
                <span className="hidden sm:inline">Select</span>
              </button>
              <button
                onClick={() => setInteractionMode("pan")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  interactionMode === "pan"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground/50 hover:text-foreground"
                )}
              >
                <Hand className="w-3 h-3" />
                <span className="hidden sm:inline">Pan</span>
              </button>
            </div>

            {/* Toggle Panel (desktop only) */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="hidden lg:flex items-center justify-center w-9 h-9 bg-accent/50 border border-border rounded-xl text-muted-foreground/50 hover:text-primary transition-all cursor-pointer"
              title={showPanel ? "Hide panel" : "Show panel"}
            >
              {showPanel ? (
                <PanelRightClose className="w-3.5 h-3.5" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
            </button>

            {/* + New Node */}
            <button className="flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md shadow-primary/20">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Node</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left: ReactFlow Tree Canvas */}
          <div
            className={cn(
              "flex-1 relative min-w-0 transition-all duration-300",
              // On mobile, hide tree when panel is shown
              showPanel ? "hidden md:block" : "block"
            )}
          >
            <MapCanvas
              mapLinksData={mapLinksData}
              searchQuery={searchQuery}
              interactionMode={interactionMode}
              selectedUrl={selectedUrl}
              onInit={(instance) => {
                flowRef.current = instance;
              }}
            />

            {/* Bottom-left status badge */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2.5 px-4 py-2 bg-card/60 backdrop-blur-2xl border border-border/50 rounded-2xl text-[9px] font-black text-muted-foreground/30 uppercase tracking-wider shadow-lg ring-1 ring-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Flow Buffer
            </div>
          </div>

          <div
            className={cn(
              "h-full flex flex-col min-h-0 border-l border-border transition-all duration-300 overflow-hidden shrink-0",
              showPanel
                ? "w-full md:w-[360px] lg:w-[400px]"
                : "w-0 border-l-0"
            )}
          >
            {showPanel && (
              <DirectoryPanel
                mapLinksData={mapLinksData}
                searchQuery={searchQuery}
                selectedUrl={selectedUrl}
                onNodeSelect={(url) => {
                  setSelectedUrl(url);
                }}
              />
            )}
          </div>
        </div>

        {/* ── Mobile: Panel Toggle FAB ── */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="md:hidden fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-transform"
        >
          {showPanel ? (
            <Target className="w-5 h-5" />
          ) : (
            <PanelRightOpen className="w-5 h-5" />
          )}
        </button>
      </div>
    </ReactFlowProvider>
  );
}
