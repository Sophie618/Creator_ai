import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Download } from 'lucide-react';
import svgPaths from "./imports/svg-miw9r4xxrk";
import html2canvas from 'html2canvas';

// Helper for image paths
const ASSET_PATH = "/assets/share-card";
const imgRectangle4 = `${ASSET_PATH}/20f776a88324996249470a038aab1d6672be0f83.png`;
const imgRectangle5 = `${ASSET_PATH}/e3a96eb1b4bedeef536ec4721a7a97d1f5f30576.png`;
const imgRectangle6 = `${ASSET_PATH}/dfad5428027e65201978240aed7f3168415d893e.png`;

interface ColorPalette {
  topColor: string;
  bottomColor: string;
}

function extractColorsFromImage(imgElement: HTMLImageElement): ColorPalette {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return { topColor: 'rgba(255,255,255,0)', bottomColor: '#f2e2be' };
  
  canvas.width = 100;
  canvas.height = 100;
  
  ctx.drawImage(imgElement, 0, 0, 100, 100);
  
  try {
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    
    const bottomSamples: [number, number, number][] = [];
    const topSamples: [number, number, number][] = [];
    
    for (let y = 70; y < 100; y += 2) {
      for (let x = 0; x < 100; x += 2) {
        const idx = (y * 100 + x) * 4;
        bottomSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
      }
    }
    
    for (let y = 0; y < 30; y += 2) {
      for (let x = 0; x < 100; x += 2) {
        const idx = (y * 100 + x) * 4;
        topSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
      }
    }
    
    const avgBottom = bottomSamples.reduce((acc, color) => {
      acc[0] += color[0];
      acc[1] += color[1];
      acc[2] += color[2];
      return acc;
    }, [0, 0, 0]).map(v => Math.round(v / bottomSamples.length));
    
    const avgTop = topSamples.reduce((acc, color) => {
      acc[0] += color[0];
      acc[1] += color[1];
      acc[2] += color[2];
      return acc;
    }, [0, 0, 0]).map(v => Math.round(v / topSamples.length));
    
    const adjustedBottom = avgBottom.map(v => Math.min(255, v + 30));
    
    return {
      topColor: `rgba(${avgTop[0]}, ${avgTop[1]}, ${avgTop[2]}, 0)`,
      bottomColor: `rgb(${adjustedBottom[0]}, ${adjustedBottom[1]}, ${adjustedBottom[2]})`
    };
  } catch (error) {
    console.error('Error extracting colors:', error);
    return { topColor: 'rgba(255,255,255,0)', bottomColor: '#f2e2be' };
  }
}

function Frame4() {
  return (
    <div className="relative shrink-0 size-[40px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Frame 83">
          <path d={svgPaths.p355db700} fill="var(--fill-0, white)" id="â" />
        </g>
      </svg>
    </div>
  );
}

interface Frame2Props {
  gradientColors: ColorPalette;
  title?: string;
}

function Frame2({ gradientColors, title }: Frame2Props) {
  return (
    <div 
      className="absolute bottom-0 flex flex-col gap-[10px] items-start left-0 px-[20px] py-0 w-[353px]"
      style={{
        background: `linear-gradient(to bottom, ${gradientColors.topColor}, ${gradientColors.bottomColor})`
      }}
    >
      <Frame4 />
      <p className="font-serif font-medium leading-[normal] min-w-full not-italic relative shrink-0 text-[19px] text-black w-[min-content] tracking-wide">
        {title || "中美AI差距，根本没在缩小……"}
      </p>
    </div>
  );
}

interface Frame3Props {
  uploadedImage: string | null;
  onImageUpload: (file: File) => void;
  gradientColors: ColorPalette;
  title?: string;
  defaultCover?: string;
}

function Frame3({ uploadedImage, onImageUpload, gradientColors, title, defaultCover }: Frame3Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };
  
  return (
    <div className="h-[353px] relative shrink-0 w-full">
      <div 
        className="absolute left-0 size-[353px] top-0 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleUploadClick}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-[10px]">
          {uploadedImage ? (
            <img 
              alt="" 
              crossOrigin="anonymous"
              className="absolute max-w-none object-cover size-full" 
              src={uploadedImage} 
            />
          ) : (
            <>
              {defaultCover ? (
                <img 
                  alt="" 
                  crossOrigin="anonymous"
                  className="absolute max-w-none object-cover size-full" 
                  src={defaultCover} 
                />
              ) : (
                 // Default fallback if no cover provided
                 <>
                   <img alt="" crossOrigin="anonymous" className="absolute max-w-none object-cover size-full" src={imgRectangle4} />
                   <img alt="" crossOrigin="anonymous" className="absolute max-w-none object-cover size-full" src={imgRectangle5} />
                 </>
              )}
            </>
          )}
        </div>
        
        {/* Upload overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-white rounded-full p-4">
            <Upload className="size-8 text-black" />
          </div>
        </div>
      </div>
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <Frame2 gradientColors={gradientColors} title={title} />
    </div>
  );
}

function Frame5() {
  return (
    <div className="flex gap-[5px] items-center relative shrink-0">
      <div className="relative rounded-[20px] shrink-0 size-[20px] overflow-hidden">
        <img alt="" crossOrigin="anonymous" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle6} />
      </div>
      <p className="font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-black">全糖可乐</p>
    </div>
  );
}

interface Frame1Props {
  qrCodeUrl?: string;
}

function Frame1({ qrCodeUrl }: Frame1Props) {
  // Use a public QR code API if none provided or just use the current URL
  const qrData = qrCodeUrl || window.location.href;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="flex items-center justify-between p-[20px] relative w-full">
          <div className="flex items-center gap-[10px]">
            <div className="bg-white rounded-[5px] shrink-0 size-[45px] flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
              <img 
                alt="QR Code" 
                crossOrigin="anonymous"
                className="size-[35px]" 
                src={qrImage} 
              />
            </div>
            <p className="font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative text-[13px] text-black/60">扫码加入深度阅读</p>
          </div>
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

interface ShareCardProps {
  onClose: () => void;
  title?: string;
  defaultCover?: string;
  qrCodeUrl?: string;
}

export default function ShareCard({ onClose, title, defaultCover, qrCodeUrl }: ShareCardProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [gradientColors, setGradientColors] = useState<ColorPalette>({
    topColor: 'rgba(255,255,255,0)',
    bottomColor: '#f2e2be'
  });
  const cardRef = useRef<HTMLDivElement>(null);

  // Construct proxy URL for the default cover to avoid CORS issues
  const proxyCoverUrl = React.useMemo(() => {
    if (!defaultCover) return undefined;
    if (defaultCover.startsWith('data:') || defaultCover.startsWith('/')) return defaultCover;
    
    // In production (ModelScope), use relative path. In dev, use port 8000
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `/proxy-image?url=${encodeURIComponent(defaultCover)}`;
    }
    
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:8000/proxy-image?url=${encodeURIComponent(defaultCover)}`;
  }, [defaultCover]);

  // If a default cover is provided (and no user upload), extract colors from it
  useEffect(() => {
    const targetImage = uploadedImage || proxyCoverUrl;
    if (targetImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const colors = extractColorsFromImage(img);
        setGradientColors(colors);
      };
      img.src = targetImage;
    }
  }, [proxyCoverUrl, uploadedImage]);
  
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const colors = extractColorsFromImage(img);
        setGradientColors(colors);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };
  
  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      // 1. Ensure all images are loaded
      const images = cardRef.current.getElementsByTagName('img');
      const loadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if one fails
        });
      });
      await Promise.all(loadPromises);

      // 2. Short delay for style recalculation
      await new Promise(resolve => setTimeout(resolve, 200));

      // 3. Capture with specific options to avoid offset issues in modals
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: false,
        logging: true,
        scrollX: 0,
        scrollY: -window.scrollY, // Adjust for window scroll if inside a fixed modal
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
      });

      const link = document.createElement('a');
      link.download = `Collector-AI-暴论-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("保存失败，请稍后重试");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* Card Container */}
        <div 
          ref={cardRef}
          className="flex flex-col items-start overflow-hidden relative rounded-[10px] w-[353px] shadow-2xl"
          style={{ backgroundColor: gradientColors.bottomColor }}
        >
          <Frame3 
            uploadedImage={uploadedImage} 
            onImageUpload={handleImageUpload}
            gradientColors={gradientColors}
            title={title}
            defaultCover={proxyCoverUrl}
          />
          <Frame1 qrCodeUrl={qrCodeUrl} />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
           <button 
             onClick={handleDownload}
             className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-medium shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
           >
             <Download size={18} />
             保存图片
           </button>
        </div>
      </div>
    </div>
  );
}
