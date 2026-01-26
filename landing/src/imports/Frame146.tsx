import imgFrame147 from "figma:asset/894a5820df1377ef988047446b8ed273e2df6112.png";
import imgImage15 from "figma:asset/7172bca543aeb30c088f713e9beefbd0afd8b67f.png";
import imgImage5 from "figma:asset/8b8ffa8f0e6b452130ea24fa30bac74194f70ec9.png";

function Frame2() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFrame147} />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
      <div className="h-[56px] relative shrink-0 w-[151px]" data-name="image 15">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[357.14%] left-[-16.2%] max-w-none top-[-128.57%] w-[132.41%]" src={imgImage15} />
        </div>
      </div>
      <div className="h-[35px] relative rounded-[500px] shrink-0 w-[81px]" data-name="image 5">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-black inset-0 rounded-[500px]" />
          <div className="absolute inset-0 overflow-hidden rounded-[500px]">
            <img alt="" className="absolute h-full left-[-0.02%] max-w-none top-0 w-[100.03%]" src={imgImage5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-white relative rounded-[20px] shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start p-[20px] relative w-full">
          <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#706f6f] text-[24px]">输入你的邮箱</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-black relative rounded-[20px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[20px] relative w-full">
          <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[24px] text-white">继续</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[30px] items-start justify-center p-[50px] relative size-full">
          <Frame />
          <p className="css-ew64yg font-['PingFang_SC:Semibold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[36px] text-black">欢迎来到「收藏加」</p>
          <Frame4 />
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="bg-[#fdf7ef] relative rounded-[30px] size-full">
      <div className="content-stretch flex items-start overflow-clip relative rounded-[inherit] size-full">
        <Frame2 />
        <Frame3 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.25)] border-solid inset-0 pointer-events-none rounded-[30px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}