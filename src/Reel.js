import * as PIXI from 'pixi.js';

class Reel {
  constructor(x, resources) {
    this.graphic = new PIXI.Container();
    this.graphic.x = x;
    this.symbols = [
      resources['symbol1'].texture, 
      resources['symbol2'].texture, 
      resources['symbol3'].texture,
      resources['symbol4'].texture, 
      resources['symbol5'].texture, 
      resources['symbol6'].texture, 
      resources['symbol7'].texture, 
      resources['symbol8'].texture, 
    ];
    this.currentSymbols = [];
    this.speed = 0.1; 

    this.loadSymbols();
  }

  loadSymbols() {
    this.symbols.forEach((symbol) => {
      const sprite = new PIXI.Sprite(symbol);
      sprite.width = 100; 
      sprite.height = 100; 
      this.graphic.addChild(sprite);
      this.currentSymbols.push(sprite);
    });
  }

  spin() {
    this.currentSymbols.forEach((sprite) => {
      sprite.y += this.speed * 10; 
      if (sprite.y > 600) {
        sprite.y = -100; 
      }
    });
  }

  stop() {
  
    const randomIndex = Math.floor(Math.random() * this.symbols.length);
    this.currentSymbols.forEach((sprite, index) => {
      sprite.texture = PIXI.Texture.from(this.symbols[randomIndex]);
    });

  }
}

export default Reel;
