import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Reel from './Reel';

const SlotMachine = () => {
  const gameContainer = useRef(null);
  const appRef = useRef(null);
  const reels = useRef([]);

  useEffect(() => {
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x000000,
    });
    appRef.current = app;
    gameContainer.current.appendChild(app.canvas); 


    const loader = new PIXI.Loader();
    loader
      .add('symbol1', 'assets/7.png')           
      .add('symbol2', 'assets/bell.png')         
      .add('symbol3', 'assets/cherry.png')      
      .add('symbol4', 'assets/diamond.png')     
      .add('symbol5', 'assets/grape.png')       
      .add('symbol6', 'assets/lemon.png')       
      .add('symbol7', 'assets/orange.png')       
      .add('symbol8', 'assets/watermelon.png')   
      .load((loader, resources) => {
        reels.current = [
          new Reel(100, resources),
          new Reel(300, resources),
          new Reel(500, resources),
        ];
        reels.current.forEach(reel => {
          app.stage.addChild(reel.graphic);
        });
      });

    return () => {
      app.destroy(true, true);
    };
  }, []);

  return <div ref={gameContainer} />;
};

export default SlotMachine;
