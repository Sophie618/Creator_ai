
import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Globe, 
  Lock,
  Headphones,
  BrainCircuit,
  Star,
  RotateCcw
} from 'lucide-react';

interface SubscriptionViewProps {
  onBack: () => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onBack }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'alipay' | 'wechat'>('card');

  const plans = [
    {
      id: 'monthly',
      name: '月度探索者',
      price: '￥29',
      period: '每月',
      description: '适合尝试 AI 深度阅读体验的初期探索者',
      features: ['无限次 AI 网页解析', '每日 5 场思维博弈任务', '基础AI 问答导出', '标准 AI 播客生成'],
      highlight: false
    },
    {
      id: 'yearly',
      name: '年度思想家',
      price: '￥199',
      period: '每年',
      description: '最受欢迎的计划，沉浸式学习者的首选',
      features: ['包含月度计划所有功能', '解锁高阶 Quiz 挑战模式', '优先体验 Beta 版功能', '深度阅读报告月报', '多端数据同步'],
      highlight: true,
      badge: '立省 ￥149'
    },
    {
      id: 'lifetime',
      name: '终身进化者',
      price: '￥599',
      period: '永久',
      description: '一次订阅，终身拥有，与 AI 共同进化',
      features: ['包含年度计划所有功能', '专属终身荣誉勋章', '1 对 1 AI 阅读顾问', '私域知识库深度分析', '离线播客无限下载'],
      highlight: false
    }
  ];

  const handleNextStep = () => {
    if (step === 1) setStep(2);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment API call
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      // Auto redirect to dashboard after success
      setTimeout(() => {
        onBack();
      }, 3000);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:px-10 min-h-full animate-in fade-in duration-700">
      
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={step === 2 ? () => setStep(1) : onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all"
        >
          <ArrowLeft size={20} />
          {step === 2 ? '返回选择套餐' : '返回首页'}
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <span className={step >= 1 ? 'text-indigo-600' : 'text-slate-300'}>1. 选择计划</span>
            <div className={`w-8 h-[2px] ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <span className={step >= 2 ? 'text-indigo-600' : 'text-slate-300'}>2. 确认支付</span>
            <div className={`w-8 h-[2px] ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <span className={step >= 3 ? 'text-indigo-600' : 'text-slate-300'}>3. 订阅成功</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest border border-amber-100 mb-2">
              <Crown size={14} /> 开启 Read AI PRO 时代
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">选择适合您的思维进化方案</h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              升级到专业版，解锁无限 AI 洞察，将每一次阅读转化为深层认知资产。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as any)}
                className={`relative group bg-white border-2 rounded-[48px] p-10 cursor-pointer transition-all duration-500 ${
                  selectedPlan === plan.id 
                  ? 'border-indigo-600 shadow-2xl shadow-indigo-100 -translate-y-2' 
                  : 'border-slate-100 hover:border-slate-300 hover:shadow-xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg">
                    {plan.badge}
                  </div>
                )}
                
                <div className="space-y-8 h-full flex flex-col">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 font-bold text-sm">/ {plan.period}</span>
                  </div>

                  <div className="flex-1 space-y-4 py-6 border-t border-slate-50">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                          <Check size={12} className="text-indigo-600" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id as any);
                      handleNextStep();
                    }}
                    className={`w-full py-5 rounded-[24px] font-black text-sm transition-all active:scale-95 ${
                      selectedPlan === plan.id 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                      : 'bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'
                    }`}
                  >
                    立即订阅 {plan.id === 'lifetime' ? '终身' : ''}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-slate-100">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><Lock size={20} /></div>
                <div><p className="text-sm font-black text-slate-900">100% 安全支付</p><p className="text-xs text-slate-400 font-medium">采用行业级 SSL 加密</p></div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><RotateCcw size={20} /></div>
                <div><p className="text-sm font-black text-slate-900">随时取消订阅</p><p className="text-xs text-slate-400 font-medium">无隐藏费用，无合约</p></div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><Headphones size={20} /></div>
                <div><p className="text-sm font-black text-slate-900">全天候专家支持</p><p className="text-xs text-slate-400 font-medium">解答任何订阅相关疑问</p></div>
             </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Payment Details */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">确认支付信息</h2>
                <p className="text-slate-500 font-medium">请选择您的支付方式并填写必要信息。</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <CreditCard size={24} className={paymentMethod === 'card' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="text-xs font-black uppercase tracking-widest">信用卡</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('alipay')}
                    className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all ${paymentMethod === 'alipay' ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <Globe size={24} className={paymentMethod === 'alipay' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="text-xs font-black uppercase tracking-widest">支付宝</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('wechat')}
                    className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all ${paymentMethod === 'wechat' ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <Star size={24} className={paymentMethod === 'wechat' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="text-xs font-black uppercase tracking-widest">微信支付</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">卡号</label>
                      <div className="relative">
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-medium" />
                        <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">过期日期</label>
                        <input type="text" placeholder="MM / YY" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CVC</label>
                        <input type="text" placeholder="123" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-medium" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">持卡人姓名</label>
                      <input type="text" placeholder="FELIX EXPLORER" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-medium" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-12 rounded-[40px] border border-slate-100 flex flex-col items-center justify-center text-center space-y-6">
                     <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-inner border border-slate-200">
                        <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                           {/* Placeholder for QR Code */}
                           <Star size={64} fill="currentColor" opacity={0.5} />
                        </div>
                     </div>
                     <p className="text-sm font-bold text-slate-600">请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫描二维码完成支付</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex flex-col gap-4">
                 <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[32px] font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {isProcessing ? <Loader2 className="animate-spin" size={24} /> : (
                     <>立即支付 {plans.find(p => p.id === selectedPlan)?.price} <ArrowRight size={20} /></>
                   )}
                 </button>
                 <p className="text-[10px] text-center text-slate-400 font-bold leading-relaxed">
                   点击支付即表示您同意我们的 <span className="text-indigo-600 underline cursor-pointer">服务条款</span> 与 <span className="text-indigo-600 underline cursor-pointer">隐私政策</span>。<br />
                   订阅将自动续费，除非在当前周期结束前 24 小时取消。
                 </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
               <div className="bg-slate-50 rounded-[48px] p-8 border border-slate-100 sticky top-12 space-y-8">
                  <h3 className="text-xl font-black text-slate-900">订单详情</h3>
                  
                  <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                     <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Crown size={32} />
                     </div>
                     <div>
                        <p className="font-black text-slate-900">{plans.find(p => p.id === selectedPlan)?.name}</p>
                        <p className="text-xs text-slate-400 font-bold">{plans.find(p => p.id === selectedPlan)?.period}订阅</p>
                     </div>
                  </div>

                  <div className="space-y-4 pt-6">
                     <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>小计</span>
                        <span>{plans.find(p => p.id === selectedPlan)?.price}</span>
                     </div>
                     <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>折扣</span>
                        <span className="text-emerald-500">- ￥0</span>
                     </div>
                     <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>税费</span>
                        <span>￥0.00</span>
                     </div>
                     <div className="pt-4 border-t border-slate-200 flex justify-between">
                        <span className="text-xl font-black text-slate-900">总计</span>
                        <span className="text-xl font-black text-indigo-600">{plans.find(p => p.id === selectedPlan)?.price}</span>
                     </div>
                  </div>

                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
                     <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">您的特权概览</p>
                     <ul className="space-y-3">
                        {plans.find(p => p.id === selectedPlan)?.features.slice(0, 3).map((f, i) => (
                           <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                              <Zap size={14} className="text-indigo-400" fill="currentColor" /> {f}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-xl mx-auto text-center space-y-12 py-24 animate-in zoom-in-95 duration-700">
          <div className="relative inline-block">
             <div className="w-48 h-48 bg-emerald-500 rounded-[64px] flex items-center justify-center text-white shadow-[0_40px_100px_rgba(16,185,129,0.4)] animate-bounce-slow">
                <CheckCircle2 size={100} strokeWidth={1} />
             </div>
             <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl animate-pulse">
                <Crown size={40} />
             </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">欢迎加入 PRO 探索者！</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">
              您的订阅已成功激活。现在，您可以尽情享受 Read AI 的所有高级功能了。
            </p>
          </div>

          <div className="pt-8">
            <button 
              onClick={onBack}
              className="bg-slate-900 hover:bg-black text-white px-12 py-6 rounded-[36px] font-black text-lg shadow-2xl transition-all active:scale-95 flex items-center gap-3 mx-auto"
            >
              进入指挥中心 <ArrowRight size={24} />
            </button>
            <p className="mt-6 text-xs text-slate-400 font-bold">正在自动为您跳转中...</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionView;
