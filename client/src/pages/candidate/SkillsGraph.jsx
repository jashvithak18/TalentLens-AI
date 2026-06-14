import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, { Background, Controls } from 'reactflow';
import api from '../../utils/api';
import 'reactflow/dist/style.css';

const SkillsGraph = () => {
  const [graphType, setGraphType] = useState('evidence');

  const { data, isLoading } = useQuery({
    queryKey: ['candidateGraphs'],
    queryFn: async () => {
      const res = await api.get('/candidates/graphs');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Generating interactive network graph...</div>;
  }

  const nodes = graphType === 'evidence'
    ? data?.evidenceGraph?.nodes || []
    : data?.knowledgeGraph?.nodes || [];

  const edges = graphType === 'evidence'
    ? data?.evidenceGraph?.edges || []
    : data?.knowledgeGraph?.edges || [];

  return (
    <div className="space-y-6">
      {/* Header with Switcher */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Interactive Graph Workspace</h1>
          <p className="text-xs text-textMuted mt-1">Explore proof verification networks and entity relations mappings</p>
        </div>

        <div className="flex bg-slate-900 border border-darkBorder rounded-lg p-1 text-xs font-semibold">
          <button
            onClick={() => setGraphType('evidence')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              graphType === 'evidence' ? 'bg-indigo-600 text-white' : 'text-textMuted hover:text-white'
            }`}
          >
            Skill Evidence Proofs
          </button>
          <button
            onClick={() => setGraphType('knowledge')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              graphType === 'knowledge' ? 'bg-indigo-600 text-white' : 'text-textMuted hover:text-white'
            }`}
          >
            Entity Knowledge Graph
          </button>
        </div>
      </div>

      {/* React Flow Viewport Wrapper */}
      <div className="w-full h-[600px] glass-panel border border-darkBorder rounded-2xl overflow-hidden relative glow-card">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            No graph connections detected. Please complete assessments or upload projects.
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#1e293b" gap={16} />
            <Controls className="bg-slate-900 border-darkBorder text-gray-300" />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default SkillsGraph;
