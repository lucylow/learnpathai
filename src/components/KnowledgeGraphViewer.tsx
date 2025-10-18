// src/components/KnowledgeGraphViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card } from './ui/card';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  mastery: number;
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
  weight: number;
}

interface KnowledgeGraphProps {
  nodes: Node[];
  links: Link[];
  onNodeClick?: (node: Node) => void;
  width?: number;
  height?: number;
}

export const KnowledgeGraphViewer: React.FC<KnowledgeGraphProps> = ({ 
  nodes, 
  links, 
  onNodeClick,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear existing
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'bg-gradient-to-br from-slate-50 to-blue-50');

    // Add zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create arrow markers for links
    svg.append('defs').selectAll('marker')
      .data(['prerequisite'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    // Create force simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(120)
        .strength(1))
      .force('charge', d3.forceManyBody()
        .strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Draw links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.weight) * 2)
      .attr('marker-end', 'url(#prerequisite)');

    // Draw node containers
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add glow filter
    const defs = svg.select('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw node circles
    node.append('circle')
      .attr('r', 24)
      .attr('fill', d => getMasteryColor(d.mastery))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('filter', d => d.mastery > 0.7 ? 'url(#glow)' : 'none')
      .style('transition', 'all 0.3s ease');

    // Add mastery indicator ring
    node.append('circle')
      .attr('r', 28)
      .attr('fill', 'none')
      .attr('stroke', d => getMasteryColor(d.mastery))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => {
        const circumference = 2 * Math.PI * 28;
        const dash = circumference * d.mastery;
        return `${dash} ${circumference}`;
      })
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.5)
      .style('transition', 'all 0.5s ease');

    // Add mastery percentage text
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(d => `${Math.round(d.mastery * 100)}`);

    // Add labels below nodes
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '45')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#334155')
      .text(d => d.label)
      .style('pointer-events', 'none');

    // Add status icon
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '60')
      .attr('font-size', '14px')
      .text(d => {
        if (d.mastery >= 0.7) return '⭐';
        if (d.mastery >= 0.4) return '📈';
        return '🌱';
      })
      .style('pointer-events', 'none');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, onNodeClick, width, height]);

  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 0.7) return '#10b981'; // Green - mastered
    if (mastery >= 0.4) return '#f59e0b'; // Orange - in progress
    return '#ef4444'; // Red - needs work
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Your Learning Map</h3>
          <p className="text-sm text-gray-600 mt-1">
            Click nodes to explore • Drag to rearrange • Scroll to zoom
          </p>
        </div>
        {selectedNode && (
          <div className="text-right">
            <h4 className="font-semibold text-lg capitalize">{selectedNode.label}</h4>
            <p className="text-sm text-gray-600">
              Mastery: {Math.round(selectedNode.mastery * 100)}%
            </p>
          </div>
        )}
      </div>

      <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
        <svg ref={svgRef} className="w-full"></svg>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
          <span className="text-gray-700">⭐ Mastered (70%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
          <span className="text-gray-700">📈 In Progress (40-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">🌱 Needs Work (&lt;40%)</span>
        </div>
      </div>
    </Card>
  );
};

