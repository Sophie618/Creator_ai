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
      className="absolute bottom-0 content-stretch flex flex-col gap-[10px] items-start left-0 px-[20px] py-0 w-[353px]"
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
            <img alt="" className="absolute max-w-none object-cover size-full" src={uploadedImage} />
          ) : (
            <>
              {defaultCover ? (
                <img alt="" className="absolute max-w-none object-cover size-full" src={defaultCover} />
              ) : (
                 // Default fallback if no cover provided
                 <>
                   <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle4} />
                   <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle5} />
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
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
      <div className="relative rounded-[20px] shrink-0 size-[20px] overflow-hidden">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle6} />
      </div>
      <p className="font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-black">全糖可乐</p>
    </div>
  );
}

interface Frame1Props {
  qrCodeUrl?: string;
}

function Frame1({  }: Frame1Props) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center p-[20px] relative w-full">
          <div className="bg-[#f4f4f4] rounded-[5px] shrink-0 size-[35px] flex items-center justify-center overflow-hidden">
             {/* QR Code Placeholder */}
             <div className="w-full h-full bg-slate-200"></div>
          </div>
          <p className="flex-[1_0_0] font-['PingFang_SC:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[13px] text-black">扫码阅读</p>
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

  // If a default cover is provided (and no user upload), extract colors from it
  useEffect(() => {
    if (defaultCover && !uploadedImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const colors = extractColorsFromImage(img);
        setGradientColors(colors);
      };
      img.src = defaultCover;
    }
  }, [defaultCover, uploadedImage]);
  
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
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `share-card-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        console.error("Failed to generate image", err);
        alert("Failed to generate image");
      }
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
          className="content-stretch flex flex-col items-start overflow-clip relative rounded-[10px] w-[353px] shadow-2xl"
          style={{ backgroundColor: gradientColors.bottomColor }}
        >
          <Frame3 
            uploadedImage={uploadedImage} 
            onImageUpload={handleImageUpload}
            gradientColors={gradientColors}
            title={title}
            defaultCover={defaultCover}
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
