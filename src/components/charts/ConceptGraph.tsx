import { useEffect, useRef } from 'react';

interface ConceptNode {
  id: string;
  name: string;
  mastery: number;
  status: 'locked' | 'available' | 'in-progress' | 'mastered';
  prerequisites: string[];
}

interface ConceptGraphProps {
  nodes: ConceptNode[];
  onNodeClick?: (node: ConceptNode) => void;
}

export function ConceptGraph({ nodes, onNodeClick }: ConceptGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Layout nodes in a hierarchical structure
    const nodePositions = new Map<string, { x: number; y: number }>();
    const levels = new Map<string, number>();

    // Calculate levels using topological sort
    const calculateLevels = (node: ConceptNode, level: number = 0) => {
      const currentLevel = levels.get(node.id) || 0;
      levels.set(node.id, Math.max(currentLevel, level));
      
      nodes.forEach(n => {
        if (n.prerequisites.includes(node.id)) {
          calculateLevels(n, level + 1);
        }
      });
    };

    // Start from nodes with no prerequisites
    nodes.filter(n => n.prerequisites.length === 0).forEach(n => calculateLevels(n));

    // Group nodes by level
    const levelGroups = new Map<number, ConceptNode[]>();
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(node);
    });

    // Position nodes
    const maxLevel = Math.max(...Array.from(levels.values()));
    const levelHeight = height / (maxLevel + 2);

    levelGroups.forEach((nodesInLevel, level) => {
      const spacing = width / (nodesInLevel.length + 1);
      nodesInLevel.forEach((node, index) => {
        nodePositions.set(node.id, {
          x: spacing * (index + 1),
          y: levelHeight * (level + 1),
        });
      });
    });

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw edges
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 2;
    nodes.forEach(node => {
      const nodePos = nodePositions.get(node.id);
      if (!nodePos) return;

      node.prerequisites.forEach(prereqId => {
        const prereqPos = nodePositions.get(prereqId);
        if (!prereqPos) return;

        ctx.beginPath();
        ctx.moveTo(prereqPos.x, prereqPos.y);
        ctx.lineTo(nodePos.x, nodePos.y);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(nodePos.y - prereqPos.y, nodePos.x - prereqPos.x);
        const arrowSize = 10;
        ctx.beginPath();
        ctx.moveTo(
          nodePos.x - Math.cos(angle - Math.PI / 6) * arrowSize,
          nodePos.y - Math.sin(angle - Math.PI / 6) * arrowSize
        );
        ctx.lineTo(nodePos.x, nodePos.y);
        ctx.lineTo(
          nodePos.x - Math.cos(angle + Math.PI / 6) * arrowSize,
          nodePos.y - Math.sin(angle + Math.PI / 6) * arrowSize
        );
        ctx.stroke();
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const radius = 40;

      // Node circle with status color
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      
      const colors = {
        'mastered': '#22c55e',
        'in-progress': '#3b82f6',
        'available': '#eab308',
        'locked': '#9ca3af',
      };
      
      ctx.fillStyle = colors[node.status];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Mastery ring
      if (node.mastery > 0) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 5, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * node.mastery));
        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const words = node.name.split(' ');
      words.forEach((word, i) => {
        ctx.fillText(word, pos.x, pos.y + (i - words.length / 2 + 0.5) * 14);
      });

      // Mastery percentage
      ctx.font = '10px sans-serif';
      ctx.fillText(`${Math.round(node.mastery * 100)}%`, pos.x, pos.y + radius + 15);
    });

    // Handle clicks
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      nodes.forEach(node => {
        const pos = nodePositions.get(node.id);
        if (!pos) return;

        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance <= 40) {
          onNodeClick?.(node);
        }
      });
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [nodes, onNodeClick]);

  return (
    <div className="w-full h-[500px] bg-muted/20 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-pointer"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

