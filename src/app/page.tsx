import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import para desativar o SSR para este componente
const PixiApp = dynamic(() => import('../app/game/page'), { ssr: false });

const HomePage = () => {
  return (
    <div>
      <h1>My PIXI Game</h1>
      <PixiApp />
    </div>
  );
};

export default HomePage;
