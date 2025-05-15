import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

// 图片路径
import bgImg from '../assets/images/footer_bg.png';
import bumpImg from '../assets/images/bump.jpg';

/**
 * 水波纹背景组件 - 使用PixiJS v8实现
 * 将静态背景图通过位移滤镜制作出流动的水波效果
 */
const WaterRippleBackground: React.FC = () => {
  // 组件引用
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 应用程序引用
  const appRef = useRef<PIXI.Application | null>(null);
  
  // 元素引用
  const backgroundRef = useRef<PIXI.Sprite | null>(null);
  const displacementSpriteRef = useRef<PIXI.Sprite | null>(null);
  
  // 动画帧引用
  const animationFrameRef = useRef<number>(0);

  // 调整大小处理函数
  const handleResize = () => {
    const container = containerRef.current;
    if (!container || !appRef.current) return;
    
    // 获取容器的当前尺寸
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // 更新应用尺寸
    appRef.current.renderer.resize(width, height);
    
    // 更新背景精灵尺寸
    if (backgroundRef.current) {
      backgroundRef.current.width = width;
      backgroundRef.current.height = height;
    }
    
    // 更新位移精灵尺寸
    if (displacementSpriteRef.current) {
      displacementSpriteRef.current.width = width * 2;
      displacementSpriteRef.current.height = height * 2;
    }
  };

  // 挂载和卸载逻辑
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 异步初始化PixiJS应用
    (async () => {
      try {
        // 创建PIXI应用
        const app = new PIXI.Application();
        
        // 初始化应用
        await app.init({
          width: container.offsetWidth,
          height: container.offsetHeight,
          backgroundAlpha: 0,  // 透明背景
          antialias: true,     // 抗锯齿
        });
        
        // 添加canvas到DOM
        container.appendChild(app.canvas);
        appRef.current = app;
        
        // 加载纹理
        const bgTexture = await PIXI.Assets.load(bgImg);
        const displacementTexture = await PIXI.Assets.load(bumpImg);
        
        // 创建背景精灵
        const background = new PIXI.Sprite(bgTexture);
        background.width = container.offsetWidth;
        background.height = container.offsetHeight;
        app.stage.addChild(background);
        backgroundRef.current = background;
        
        // 创建位移贴图精灵
        const displacementSprite = new PIXI.Sprite(displacementTexture);
        
        // 设置位移贴图的尺寸和属性
        displacementSprite.texture.source.style.addressMode = 'repeat';
        displacementSprite.width = container.offsetWidth * 2; // 放大以便于循环
        displacementSprite.height = container.offsetHeight * 2;
        
        // 将位移精灵添加到舞台，但设置为不可见
        displacementSprite.visible = false;
        app.stage.addChild(displacementSprite);
        displacementSpriteRef.current = displacementSprite;
        
        // 创建位移滤镜
        const displacementFilter = new PIXI.DisplacementFilter({
          sprite: displacementSprite,
          scale: { x: 30, y: 20 }, // 波浪强度
        });
        
        // 应用滤镜到背景
        background.filters = [displacementFilter];
        
        // 创建动画循环
        const animate = () => {
          // 移动位移贴图，创建流动效果（不归零，利用repeat自动无缝）
          displacementSprite.x += 0.8;
          displacementSprite.y += 0.3;
          
          // 请求下一帧
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        // 启动动画
        animate();
        
        // 添加窗口大小变化监听器
        window.addEventListener('resize', handleResize);
      } catch (error) {
        console.error('水波纹效果初始化失败:', error);
      }
    })();
    
    // 清理函数
    return () => {
      // 移除窗口大小变化监听器
      window.removeEventListener('resize', handleResize);
      
      // 取消动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // 销毁PIXI应用
      if (appRef.current) {
        appRef.current.destroy(true);
      }
      
      // 移除Canvas元素
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