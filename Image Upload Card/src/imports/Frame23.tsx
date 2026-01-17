import svgPaths from "./svg-miw9r4xxrk";
import imgRectangle4 from "figma:asset/20f776a88324996249470a038aab1d6672be0f83.png";
import imgRectangle5 from "figma:asset/e3a96eb1b4bedeef536ec4721a7a97d1f5f30576.png";
import imgRectangle6 from "figma:asset/dfad5428027e65201978240aed7f3168415d893e.png";

function Frame4() {
  return (
    <div className="relative shrink-0 size-[40px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Frame 83">
          <path d={svgPaths.p355db700} fill="var(--fill-0, white)" id="â" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-gradient-to-b bottom-0 content-stretch flex flex-col from-[rgba(255,255,255,0)] gap-[10px] items-start left-0 px-[20px] py-0 to-[#f2e2be] w-[353px]">
      <Frame4 />
      <p className="css-4hzbpn font-['PingFang_SC:Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[20px] text-black w-[min-content]">中美AI差距，根本没在缩小……</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="h-[353px] relative shrink-0 w-full">
      <div className="absolute left-0 size-[353px] top-0">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle4} />
          <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle5} />
        </div>
      </div>
      <Frame2 />
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

function Frame1() {
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

export default function Frame() {
  return (
    <div className="bg-[#f2e2be] content-stretch flex flex-col items-start overflow-clip relative rounded-[10px] size-full">
      <Frame3 />
      <Frame1 />
    </div>
  );
}