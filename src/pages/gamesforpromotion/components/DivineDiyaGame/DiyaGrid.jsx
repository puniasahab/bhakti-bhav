import React from 'react';
import Diya from './Diya';

// 3x3 layout positions (percentages of screen width/height for responsiveness)
const gridPositions = [
  { id: 1, x: '25%', y: '40%' },
  { id: 2, x: '50%', y: '35%' },
  { id: 3, x: '75%', y: '40%' },
  { id: 4, x: '20%', y: '55%' },
  { id: 5, x: '50%', y: '50%' },
  { id: 6, x: '80%', y: '55%' },
  { id: 7, x: '15%', y: '70%' },
  { id: 8, x: '50%', y: '65%' },
  { id: 9, x: '85%', y: '70%' },
];

const DiyaGrid = ({ litDiyas, onDiyaLitEvent, positionsRef }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      {gridPositions.map((pos) => {
        // We capture actual pixel coordinates for collision detection via ref later,
        // but for rendering we use the percentages.
        return (
          <Diya 
            key={pos.id}
            id={pos.id}
            x={pos.x}
            y={pos.y}
            lit={litDiyas.includes(pos.id)}
            onLitEvent={(id, x, y) => onDiyaLitEvent(id, x, y)}
          />
        );
      })}
    </div>
  );
};

export default DiyaGrid;
export { gridPositions };
