import {
    Application,
    Assets,
    Color,
    Container,
    Texture,
    Sprite,
    Graphics,
    Text,
    TextStyle,
    BlurFilter,
    FillGradient,
} from 'pixi.js';

const Slot = async () =>
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Load the textures
    await Assets.load([
        '/assets/7.png',
        '/assets/bell.png',
        '/assets/cherry.png',
        '/assets/diamond.png',
        '/assets/grape.png',
        '/assets/lemon.png',
        '/assets/orange.png',
        '/assets/watermelon.png',
    ]);

    const REEL_WIDTH = 170;
    const SYMBOL_SIZE = 140; // Dimensiunea fixă a simbolurilor

    // Create different slot symbols
    const slotTextures = [
        Texture.from('/assets/7.png'),
        Texture.from('/assets/bell.png'),
        Texture.from('/assets/cherry.png'),
        Texture.from('/assets/diamond.png'),
        Texture.from('/assets/grape.png'),
        Texture.from('/assets/lemon.png'),
        Texture.from('/assets/orange.png'),
        Texture.from('/assets/watermelon.png'),
    ];

    // Build the reels
    const reels = [];
    const reelContainer = new Container();

    for (let i = 0; i < 5; i++)
    {
        const rc = new Container();

        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new BlurFilter(),
        };

        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        // Build the symbols
        for (let j = 0; j < 5; j++)
        {
            const symbol = new Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
            
            // Scale the symbol to fit the symbol area.
            symbol.width = SYMBOL_SIZE;  // Set width
            symbol.height = SYMBOL_SIZE; // Set height
            symbol.x = Math.round((REEL_WIDTH - SYMBOL_SIZE) / 2); // Center the symbol horizontally
            symbol.y = j * SYMBOL_SIZE; // Set vertical position
            
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    // Build top & bottom covers and position reelContainer
    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

    reelContainer.y = margin;

    // Center the reelContainer horizontally
    const totalReelWidth = REEL_WIDTH * 5; // 5 reels
    reelContainer.x = (app.screen.width - totalReelWidth) / 2; // Centering

    const top = new Graphics().rect(0, 0, app.screen.width, margin).fill({ color: 0x0 });
    const bottom = new Graphics().rect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin).fill({ color: 0x0 });

    // Create gradient fill
    const fill = new FillGradient(0, 0, 0, 36 * 1.7);

    const colors = [0xffffff, 0x00ff99].map((color) => Color.shared.setValue(color).toNumber());

    colors.forEach((number, index) =>
    {
        const ratio = index / colors.length;

        fill.addColorStop(ratio, number);
    });

    // Add play text
    const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: 0xffff00 ,
        stroke: { color: 0x4a1850, width: 5 },
        dropShadow: {
            color: 0x000000,
            angle: Math.PI / 6,
            blur: 4,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const playText = new Text('Spin!', style);

    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
    bottom.addChild(playText);

    // Add header text
    const headerText = new Text('SLOTS FRUITS!', style);

    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    app.stage.addChild(top);
    app.stage.addChild(bottom);

    // Set the interactivity.
    playText.eventMode = 'static';
    playText.cursor = 'pointer';
    playText.addListener('pointerdown', () =>
    {
        startPlay();
    });

    let running = false;

    // Function to start playing.
    function startPlay()
    {
        if (running) return;
        running = true;

        for (let i = 0; i < reels.length; i++)
        {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;

            tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
        }
    }

    // Reels done handler.
    function reelsComplete()
    {
        running = false;
    }

    // Listen for animate update.
    app.ticker.add(() =>
    {
        // Update the slots.
        for (let i = 0; i < reels.length; i++)
        {
            const r = reels[i];
            // Update blur filter y amount based on speed.
            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            // Update symbol positions on reel.
            for (let j = 0; j < r.symbols.length; j++)
            {
                const s = r.symbols[j];
                const prevy = s.y;

                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE)
                {
                    // Detect going over and swap a texture.
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    // Reapply size and centering
                    s.width = SYMBOL_SIZE;  
                    s.height = SYMBOL_SIZE; 
                    s.x = Math.round((REEL_WIDTH - SYMBOL_SIZE) / 2);
                }
            }
        }
    });

    // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
    const tweening = [];

    function tweenTo(object, property, target, time, easing, onchange, oncomplete)
    {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };

        tweening.push(tween);

        return tween;
    }
    
    // Listen for animate update.
    app.ticker.add(() =>
    {
        const now = Date.now();
        const remove = [];

        for (let i = 0; i < tweening.length; i++)
        {
            const t = tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);

            t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase === 1)
            {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++)
        {
            tweening.splice(tweening.indexOf(remove[i]), 1);
        }
    });

    let resizeTimeout;

function resize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    
    resizeTimeout = setTimeout(() => {
        const scale = Math.min(window.innerWidth / app.view.width, window.innerHeight / app.view.height);
        
        // Set the new width and height
        app.view.style.width = `${app.view.width * scale}px`;
        app.view.style.height = `${app.view.height * scale}px`;
        
        // Recenter the reel container
        const totalReelWidth = REEL_WIDTH * 5; // 5 reels
        reelContainer.x = (app.screen.width - totalReelWidth) / 2; // Centering
        reelContainer.y = (app.screen.height - SYMBOL_SIZE * 3) / 2; // Re-center vertically
    }, 100); // Ajustează timpul după cum este necesar
}

// Creează un observer pentru a observa schimbările de dimensiune a ferestrei
const resizeObserver = new ResizeObserver(() => {
    resize();
});

// Apelează resize pentru a seta dimensiunile corecte la început
resize();

// Observă dimensiunea ferestrei
resizeObserver.observe(document.body);

    // Basic lerp function.
    function lerp(a1, a2, t)
    {
        return a1 * (1 - t) + a2 * t;
    }

    // Backout function from tweenjs.
    function backout(amount)
    {
        return (t) => --t * t * ((amount + 1) * t + amount) + 1;
    }
};

export default Slot;
