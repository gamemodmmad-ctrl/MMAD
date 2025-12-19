
import React, { useState, useRef, useCallback } from 'react';
import { AppStatus, StyledImage } from './types';
import { generateStyledImage } from './services/geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [prompt, setPrompt] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [history, setHistory] = useState<StyledImage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setResultImage(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) return;

    setStatus(AppStatus.GENERATING);
    setErrorMessage(null);

    try {
      const result = await generateStyledImage(originalImage, prompt);
      setResultImage(result);
      
      const newEntry: StyledImage = {
        id: Date.now().toString(),
        url: result,
        prompt: prompt,
        timestamp: Date.now(),
      };
      
      setHistory(prev => [newEntry, ...prev]);
      setStatus(AppStatus.IDLE);
    } catch (error) {
      console.error(error);
      setErrorMessage("خطایی در ارتباط با سرور رخ داد. لطفا دوباره تلاش کنید.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setPrompt('');
    setStatus(AppStatus.IDLE);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">آتلیه استایل هوشمند</h1>
        </div>
        
        <div className="flex items-center gap-4">
           {originalImage && (
             <Button variant="ghost" onClick={reset}>شروع مجدد</Button>
           )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-2">۱. انتخاب تصویر</h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${originalImage ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
              {originalImage ? (
                <div className="relative group w-full aspect-square overflow-hidden rounded-lg">
                  <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                    تغییر عکس
                  </div>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-slate-500 text-sm text-center">تصویر خود را اینجا بکشید یا کلیک کنید</p>
                </>
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-2">۲. توصیف استایل</h2>
            <textarea 
              className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed"
              placeholder="مثال: مدل موی سایه روشن، ریش پروفسوری، کت و شلوار طوسی و یک تاتو روی مچ دست. در پس‌زمینه یک ماشین سمند باشد."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="text-xs text-slate-400 flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>می‌توانید به راحتی به زبان فارسی بنویسید. تمامی مدل‌های مو، ریش، لباس، تاتو و خودروهای ایرانی و خارجی پشتیبانی می‌شوند. تغییرات روی اجزای صورت اعمال نخواهد شد.</span>
            </div>
            
            {errorMessage && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{errorMessage}</p>
            )}

            <Button 
              className="w-full" 
              onClick={handleGenerate} 
              isLoading={status === AppStatus.GENERATING}
              disabled={!originalImage || !prompt.trim()}
            >
              اعمال تغییرات
            </Button>
          </section>
        </div>

        {/* Right Panel: Result Preview */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
            <h2 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-4 mb-4">۳. خروجی نهایی</h2>
            
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl overflow-hidden relative border border-slate-100">
              {status === AppStatus.GENERATING ? (
                <div className="text-center p-8 space-y-4">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-700 font-bold animate-pulse">درحال طراحی استایل جدید...</p>
                    <p className="text-slate-400 text-xs">هوش مصنوعی درحال پردازش جزئیات است</p>
                  </div>
                </div>
              ) : resultImage ? (
                <div className="w-full h-full relative group">
                  <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
                  <a 
                    href={resultImage} 
                    download="my-style.png"
                    className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-slate-700 font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    دانلود تصویر
                  </a>
                </div>
              ) : (
                <div className="text-center p-12 text-slate-400 space-y-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <p>پس از آپلود و نوشتن توضیحات، استایل شما در اینجا نمایش داده می‌شود</p>
                </div>
              )}
            </div>
          </section>

          {/* History / Previous Generations */}
          {history.length > 0 && (
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-4 mb-6">سوابق طراحی</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {history.map((item) => (
                  <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-pointer" onClick={() => setResultImage(item.url)}>
                    <img src={item.url} alt="History item" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                      <p className="text-white text-[10px] line-clamp-2 leading-tight">{item.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-8 text-center text-slate-400 text-sm">
        <p>قدرت گرفته از هوش مصنوعی جمینای - تمامی حقوق برای کاربر محفوظ است</p>
      </footer>
    </div>
  );
};

export default App;
