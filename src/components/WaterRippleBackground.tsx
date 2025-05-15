import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';


import bgImg from '../assets/images/footer_bg.png';
import bumpImg from '../assets/images/bump.jpg';

const WaterRippleBackground: React.FC = () => {

  const containerRef = useRef<HTMLDivElement>(null);
  

  const appRef = useRef<PIXI.Application | null>(null);

  const backgroundRef = useRef<PIXI.Sprite | null>(null);
  const displacementSpriteRef = useRef<PIXI.Sprite | null>(null);

  const animationFrameRef = useRef<number>(0);

  const handleResize = () => {
    const container = containerRef.current;
    if (!container || !appRef.current) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    appRef.current.renderer.resize(width, height);

    if (backgroundRef.current) {
      backgroundRef.current.width = width;
      backgroundRef.current.height = height;
    }

    if (displacementSpriteRef.current) {
      displacementSpriteRef.current.width = width * 2;
      displacementSpriteRef.current.height = height * 2;
    }
  };


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      try {

        const app = new PIXI.Application();

        await app.init({
          width: container.offsetWidth,
          height: container.offsetHeight,
          backgroundAlpha: 0,
          antialias: true,
        });
        
        container.appendChild(app.canvas);
        appRef.current = app;
        
        const bgTexture = await PIXI.Assets.load(bgImg);
        const displacementTexture = await PIXI.Assets.load(bumpImg);
        
        const background = new PIXI.Sprite(bgTexture);
        background.width = container.offsetWidth;
        background.height = container.offsetHeight;
        app.stage.addChild(background);
        backgroundRef.current = background;
        
        const displacementSprite = new PIXI.Sprite(displacementTexture);
        
        displacementSprite.texture.source.style.addressMode = 'repeat';
        displacementSprite.width = container.offsetWidth * 2;
        displacementSprite.height = container.offsetHeight * 2;
        
        displacementSprite.visible = false;
        app.stage.addChild(displacementSprite);
        displacementSpriteRef.current = displacementSprite;
        
        const displacementFilter = new PIXI.DisplacementFilter({
          sprite: displacementSprite,
          scale: { x: 30, y: 20 },
        });
        
        background.filters = [displacementFilter];
        
        const animate = () => {
          displacementSprite.x += 0.8;
          displacementSprite.y += 0.3;
          
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animate();
        
        window.addEventListener('resize', handleResize);
      } catch (error) {
        console.error('水波纹效果初始化失败:', error);
      }
    })();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (appRef.current) {
        appRef.current.destroy(true);
      }
      
      if (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: -1,
        overflow: 'hidden',
      }}
    />
  );
};

export default WaterRippleBackground; 