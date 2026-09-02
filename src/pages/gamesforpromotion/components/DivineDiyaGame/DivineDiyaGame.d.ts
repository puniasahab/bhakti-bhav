import React, { ForwardRefExoticComponent, RefAttributes } from 'react';

export interface DivineDiyaGameProps {
  onGameCompleted?: () => void;
}

export interface DivineDiyaGameRef {
  startGame: () => void;
  resetGame: () => void;
  destroyGame: () => void;
}

declare const DivineDiyaGame: ForwardRefExoticComponent<DivineDiyaGameProps & RefAttributes<DivineDiyaGameRef>>;

export default DivineDiyaGame;
