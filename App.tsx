
import React, { useState, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Plus, Trash2, BrainCircuit, BarChart3, Lightbulb, AlertCircle, Loader2, ChevronLeft, LayoutDashboard, Database, Info
} from 'lucide-react';
import { SalesData, ForecastPoint, AIAnalysis } from './types';
import { analyzeSalesWithAI } from './services/geminiService';

type ViewState = 'input' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('input');
  const [salesData, setSalesData] = useState<SalesData[]>([
    { month: 'Jan', value: 1200000 },
    { month: 'Feb', value: 1500000 },
    { month: 'Mar', value: 1800000 },
    { month: 'Apr', value: 1600000 },
    { month: 'May', value: 2100000 },
    { month: 'Jun', value: 2400000 },
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const forecastPoints = useMemo((): ForecastPoint[] => {
    const n = salesData.length;
    if (n < 2) return salesData.map(d => ({ month: d.month, actual: d.value }));

    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = salesData.map(d => d.value);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const historical = salesData.map(d => ({
      month: d.month,
      actual: d.value,
      predicted: Math.round(slope * (salesData.indexOf(d) + 1) + intercept)
    }));

    const future = Array.from({ length: 4 }, (_, i) => {
      const futureX = n + 1 + i;
      return {
        month: `Future ${i + 1}`,
        predicted: Math.round(slope * futureX + intercept)
      };
    });

    return [...historical, ...future];
  }, [salesData]);

  const handleAddRow = () => {
    setSalesData([...salesData, { month: `M${salesData.length + 1}`, value: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    setSalesData(salesData.filter((_, i) => i !== index));
  };

  const handleUpdateValue = (index: number, field: keyof SalesData, value: string) => {
    const newData = [...salesData];
    if (field === 'value') {
      newData[index][field] = Number(value) || 0;
    } else {
      newData[index][field] = value;
    }
    setSalesData(newData);
  };

  const runAIAnalysis = async () => {
    if (salesData.length < 3) {
      setError("ကျေးဇူးပြု၍ အနည်းဆုံး (၃) လစာ အချက်အလက် ထည့်သွင်းပေးပါ။");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeSalesWithAI(salesData);
      setAiAnalysis(result);
      setView('dashboard');
    } catch (err) {
      setError("AI အကြံပေးချက် ရယူရာတွင် အမှားအယွင်းရှိခဲ့ပါသည်။");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans">
      {/* Sidebar Navigation - Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed left-0 top-0 z-20">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <BrainCircuit size={20} />
            </div>
            <span className="font-bold text-lg text-blue-900 myanmar-text">Forecast AI</span>
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <button 
            onClick={() => setView('input')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'input' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Database size={20} />
            <span className="myanmar-text">ဒေတာ ထည့်သွင်းရန်</span>
          </button>
          <button 
            onClick={() => aiAnalysis && setView('dashboard')}
            disabled={!aiAnalysis}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!aiAnalysis ? 'opacity-50 cursor-not-allowed' : view === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            <span className="myanmar-text">ခန့်မှန်းချက်ပြဇယား</span>
          </button>
        </nav>
        <div className="p-4 border-t">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 myanmar-text leading-relaxed">
              မြန်မာ့စီးပွားရေးလုပ်ငန်းရှင်များအတွက် AI နည်းပညာသုံး အရောင်းခန့်မှန်းစနစ်
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <BrainCircuit size={20} className="text-blue-600" />
            <span className="font-bold myanmar-text text-blue-900">Forecast AI</span>
          </div>
          <button onClick={() => view === 'dashboard' ? setView('input') : runAIAnalysis()}>
            {view === 'dashboard' ? <Database size={20} /> : <LayoutDashboard size={20} />}
          </button>
        </header>

        {/* View Content */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {view === 'input' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h1 className="text-2xl font-bold myanmar-text text-slate-800">အချက်အလက်များ ထည့်သွင်းပါ</h1>
                <p className="text-slate-500 myanmar-text mt-1">လစဉ်အရောင်းဒေတာများကို အခြေခံ၍ AI က အနာဂတ်ကို ခန့်မှန်းပေးပါမည်။</p>
              </div>

              <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                  <h2 className="font-bold myanmar-text flex items-center gap-2">
                    <Database size={18} className="text-blue-500" />
                    အရောင်းမှတ်တမ်း (MMK)
                  </h2>
                  <button 
                    onClick={handleAddRow}
                    className="flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold"
                  >
                    <Plus size={16} />
                    <span className="myanmar-text">လအသစ်ထည့်ရန်</span>
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {salesData.map((data, index) => (
                      <div key={index} className="group flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="w-1/3 relative">
                          <input
                            type="text"
                            value={data.month}
                            onChange={(e) => handleUpdateValue(index, 'month', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm myanmar-text bg-slate-50 group-hover:bg-white transition-all"
                            placeholder="လအမည်"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            value={data.value === 0 ? '' : data.value}
                            onChange={(e) => handleUpdateValue(index, 'value', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium pr-12 bg-slate-50 group-hover:bg-white transition-all"
                            placeholder="အရောင်းပမာဏ"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">MMK</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveRow(index)}
                          className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl myanmar-text flex items-center gap-3">
                      <AlertCircle size={20} />
                      {error}
                    </div>
                  )}

                  <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
                    <button 
                      onClick={runAIAnalysis}
                      disabled={isAnalyzing}
                      className="w-full md:w-auto flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
                    >
                      {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <BarChart3 size={20} />}
                      <span className="myanmar-text text-lg">ခန့်မှန်းချက်ကြည့်မည်</span>
                    </button>
                    <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-4 rounded-2xl w-full md:w-auto">
                      <Info size={18} />
                      <span className="text-xs myanmar-text">အချက်အလက် ၃ ခု အနည်းဆုံး လိုအပ်ပါသည်</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <button 
                    onClick={() => setView('input')}
                    className="flex items-center gap-1 text-blue-600 hover:underline mb-2 text-sm font-semibold myanmar-text"
                  >
                    <ChevronLeft size={16} /> နောက်သို့
                  </button>
                  <h1 className="text-2xl font-bold myanmar-text text-slate-800">စီးပွားရေး အနှစ်ချုပ် ခန့်မှန်းချက်</h1>
                </div>
                <div className="hidden sm:flex bg-white px-4 py-2 rounded-xl border items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 myanmar-text">AI Live Analysis</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-3 bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold myanmar-text">အရောင်းလမ်းကြောင်းပြဇယား</h2>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1 bg-blue-600 rounded-full" />
                        <span className="text-slate-500 myanmar-text">အရောင်း</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1 bg-slate-300 rounded-full" />
                        <span className="text-slate-400 myanmar-text">ခန့်မှန်းချက်</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastPoints}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 12, fill: '#64748b'}} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 11, fill: '#64748b'}}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                          formatter={(value: number) => new Intl.NumberFormat().format(value) + ' MMK'}
                        />
                        <Area 
                          name="အရောင်း" 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#2563eb" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorActual)" 
                        />
                        <Area 
                          name="AI ခန့်မှန်းချက်" 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#94a3b8" 
                          strokeDasharray="8 8"
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorPredicted)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trend Summary Card */}
                <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col items-center justify-center text-center">
                  <div className={`p-5 rounded-3xl mb-4 ${aiAnalysis?.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : aiAnalysis?.trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    {aiAnalysis?.trend === 'up' ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
                  </div>
                  <h3 className="font-bold myanmar-text text-sm text-slate-400 uppercase tracking-widest mb-1">Market Trend</h3>
                  <p className="text-2xl font-bold myanmar-text text-slate-800">
                    {aiAnalysis?.trend === 'up' ? 'တိုးတက်နေသည်' : aiAnalysis?.trend === 'down' ? 'ကျဆင်းနေသည်' : 'ပုံမှန်ရှိသည်'}
                  </p>
                  <div className="mt-4 px-4 py-1.5 bg-slate-100 rounded-full">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Confidence: {aiAnalysis?.confidence}</p>
                  </div>
                </div>

                {/* AI Advice Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                      <Lightbulb size={24} />
                    </div>
                    <h2 className="text-xl font-bold myanmar-text">AI ၏ စီးပွားရေးအကြံပြုချက်များ</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {aiAnalysis?.advice.map((tip, i) => (
                      <div key={i} className="flex gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
                        <div className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed myanmar-text font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;
