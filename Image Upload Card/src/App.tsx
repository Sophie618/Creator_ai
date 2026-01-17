import { useState, useRef, useEffect } from 'react';
import svgPaths from "./imports/svg-miw9r4xxrk";
import imgRectangle4 from "figma:asset/20f776a88324996249470a038aab1d6672be0f83.png";
import imgRectangle5 from "figma:asset/e3a96eb1b4bedeef536ec4721a7a97d1f5f30576.png";
import imgRectangle6 from "figma:asset/dfad5428027e65201978240aed7f3168415d893e.png";
import { Upload } from 'lucide-react';

interface ColorPalette {
  topColor: string;
  bottomColor: string;
}

function extractColorsFromImage(imgElement: HTMLImageElement): ColorPalette {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return { topColor: 'rgba(255,255,255,0)', bottomColor: '#f2e2be' };
  
  // 设置canvas尺寸为较小的采样尺寸以提高性能
  canvas.width = 100;
  canvas.height = 100;
  
  ctx.drawImage(imgElement, 0, 0, 100, 100);
  
  try {
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    
    // 从底部区域采样颜色（用于渐变底色）
    const bottomSamples: [number, number, number][] = [];
    const topSamples: [number, number, number][] = [];
    
    // 采样底部30%区域
    for (let y = 70; y < 100; y += 2) {
      for (let x = 0; x < 100; x += 2) {
        const idx = (y * 100 + x) * 4;
        bottomSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
      }
    }
    
    // 采样顶部30%区域
    for (let y = 0; y < 30; y += 2) {
      for (let x = 0; x < 100; x += 2) {
        const idx = (y * 100 + x) * 4;
        topSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
      }
    }
    
    // 计算平均颜色
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
    
    // 调整底部颜色亮度，使其更柔和
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
}

function Frame2({ gradientColors }: Frame2Props) {
  return (
    <div 
      className="absolute bottom-0 content-stretch flex flex-col gap-[10px] items-start left-0 px-[20px] py-0 w-[353px]"
      style={{
        background: `linear-gradient(to bottom, ${gradientColors.topColor}, ${gradientColors.bottomColor})`
      }}
    >
      <Frame4 />
      <p className="css-4hzbpn font-['PingFang_SC:Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[20px] text-black w-[min-content]">中美AI差距，根本没在缩小……</p>
    </div>
  );
}

interface Frame3Props {
  uploadedImage: string | null;
  onImageUpload: (file: File) => void;
  gradientColors: ColorPalette;
}

function Frame3({ uploadedImage, onImageUpload, gradientColors }: Frame3Props) {
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
        className="absolute left-0 size-[353px] top-0 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleUploadClick}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {uploadedImage ? (
            <img alt="" className="absolute max-w-none object-cover size-full" src={uploadedImage} />
          ) : (
            <>
              <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle4} />
              <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle5} />
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
      
      <Frame2 gradientColors={gradientColors} />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
      <div className="relative rounded-[20px] shrink-0 size-[20px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgRectangle6} />
      </div>
      <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-black">全糖可乐</p>
    </div>
  );
}

interface Frame1Props {
  bgColor: string;
}

function Frame1({ bgColor }: Frame1Props) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center p-[20px] relative w-full">
          <div className="bg-[#f4f4f4] rounded-[5px] shrink-0 size-[35px]" />
          <p className="css-4hzbpn flex-[1_0_0] font-['PingFang_SC:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[13px] text-black">扫码阅读</p>
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [gradientColors, setGradientColors] = useState<ColorPalette>({
    topColor: 'rgba(255,255,255,0)',
    bottomColor: '#f2e2be'
  });
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      
      // 创建临时图片元素来提取颜色
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
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div 
        className="content-stretch flex flex-col items-start overflow-clip relative rounded-[10px] w-[353px] shadow-lg"
        style={{ backgroundColor: gradientColors.bottomColor }}
      >
        <Frame3 
          uploadedImage={uploadedImage} 
          onImageUpload={handleImageUpload}
          gradientColors={gradientColors}
        />
        <Frame1 bgColor={gradientColors.bottomColor} />
      </div>
    </div>
  );
}
