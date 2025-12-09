import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertTriangle, CheckCircle, Activity, Loader2, RefreshCw, Camera, Send, X, MessageSquare, Wand2 } from 'lucide-react';
import { analyzeConstructionImage, askAboutImage, generateConstructionImage } from '../services/geminiService';
import { AnalysisResult, ChatMessage } from '../types';

interface AnalyzerProps {
  onNewAnalysis: (result: AnalysisResult) => void;
}

const Analyzer: React.FC<AnalyzerProps> = ({ onNewAnalysis }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Webcam State
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        setChatMessages([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        setResult(null);
        setChatMessages([]);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setResult(null);
    setChatMessages([]);
    try {
      const base64 = await generateConstructionImage();
      setImagePreview(base64);
    } catch (error) {
      alert("Failed to generate test image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const runAnalysis = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setChatMessages([]);
    try {
      const analysis = await analyzeConstructionImage(imagePreview);
      // Attach the image URL to the result for reporting
      const completeResult: AnalysisResult = {
        ...analysis,
        imageUrl: imagePreview
      };
      setResult(completeResult);
      onNewAnalysis(completeResult);
    } catch (error) {
      alert("Failed to analyze image. Ensure your API Key is valid.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !imagePreview) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
      const responseText = await askAboutImage(imagePreview, userMsg.text);
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatting(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 pb-20">
      {/* Left Column: Upload/Camera Area */}
      <div className="space-y-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center"><Upload className="w-5 h-5 mr-2 text-amber-500" /> Site Capture</span>
            <div className="flex space-x-2">
              <button 
                onClick={handleGenerateImage}
                disabled={isGenerating || showCamera}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md text-white flex items-center transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1.5" />}
                Generate Test
              </button>
              <button 
                onClick={startCamera} 
                className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md text-white flex items-center transition-colors"
                disabled={showCamera || isGenerating}
              >
                <Camera className="w-3 h-3 mr-1.5" /> Live Cam
              </button>
              <button 
                onClick={triggerUpload} 
                className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md text-white flex items-center transition-colors"
                disabled={showCamera || isGenerating}
              >
                <Upload className="w-3 h-3 mr-1.5" /> Upload
              </button>
            </div>
          </h2>
          
          <div className="border-2 border-dashed border-slate-600 rounded-xl min-h-[350px] flex flex-col items-center justify-center bg-slate-900/50 relative overflow-hidden group">
            
            {showCamera ? (
              <div className="relative w-full h-full flex flex-col items-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 flex space-x-4">
                  <button onClick={capturePhoto} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110">
                    <Camera className="w-6 h-6" />
                  </button>
                  <button onClick={stopCamera} className="bg-slate-700 hover:bg-slate-600 text-white rounded-full p-4 shadow-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="relative w-full h-full group">
                <img 
                  src={imagePreview} 
                  alt="Site Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                  <button onClick={triggerUpload} className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 text-white">
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : isGenerating ? (
               <div className="flex flex-col items-center justify-center p-8 text-center animate-pulse">
                  <Wand2 className="w-12 h-12 text-indigo-500 mb-4 animate-bounce" />
                  <p className="text-indigo-400 font-bold">Generating Synthetic Site...</p>
                  <p className="text-slate-500 text-sm mt-2">Creating a realistic construction scenario with AI.</p>
               </div>
            ) : (
              <div 
                className="text-center cursor-pointer p-8 w-full h-full flex flex-col items-center justify-center"
                onClick={triggerUpload}
              >
                <div className="bg-slate-800 p-4 rounded-full inline-flex mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-slate-300 font-medium">Capture or upload site photo</p>
                <p className="text-slate-500 text-sm mt-1">Supports standard image formats</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <button
            onClick={runAnalysis}
            disabled={!imagePreview || isAnalyzing || showCamera || isGenerating}
            className={`w-full mt-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
              !imagePreview || isAnalyzing || showCamera || isGenerating
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Analyzing Site...</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>Run Safety Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Results & Chat */}
      <div className="space-y-6">
        {result ? (
          <div className="space-y-6">
            {/* Analysis Results Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
                  <p className="text-slate-400 text-sm">Generated {new Date(result.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold border ${
                  result.safetyScore > 80 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : result.safetyScore > 50 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  Score: {result.safetyScore}/100
                </div>
              </div>

              <div className="space-y-6">
                {/* Hazards */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                    Detected Hazards
                  </h3>
                  <ul className="space-y-2">
                    {result.hazards.length > 0 ? result.hazards.map((hazard, idx) => (
                      <li key={idx} className="flex items-start text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        {hazard}
                      </li>
                    )) : (
                      <li className="text-green-400 text-sm italic">No significant hazards detected.</li>
                    )}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Chat Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[400px]">
               <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center">
                 <MessageSquare className="w-5 h-5 text-amber-500 mr-2" />
                 <h3 className="font-semibold text-white">Ask AI about this site</h3>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
                 {chatMessages.length === 0 && (
                   <div className="text-center text-slate-500 mt-10">
                     <p className="text-sm">Ask detailed questions like:</p>
                     <p className="text-xs mt-2">"Are the workers wearing high-vis vests?"</p>
                     <p className="text-xs">"What material is that wall?"</p>
                   </div>
                 )}
                 {chatMessages.map((msg, idx) => (
                   <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                       msg.role === 'user' 
                        ? 'bg-amber-600 text-white rounded-br-none' 
                        : 'bg-slate-700 text-slate-200 rounded-bl-none'
                     }`}>
                       {msg.text}
                     </div>
                   </div>
                 ))}
                 {isChatting && (
                   <div className="flex justify-start">
                     <div className="bg-slate-700 rounded-lg rounded-bl-none px-4 py-2 flex items-center space-x-1">
                       <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                       <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                       <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                     </div>
                   </div>
                 )}
                 <div ref={chatEndRef} />
               </div>

               <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-700 bg-slate-800">
                 <div className="flex space-x-2">
                   <input
                     type="text"
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     placeholder="Ask about hazards, materials, progress..."
                     className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                   />
                   <button 
                     type="submit" 
                     disabled={!chatInput.trim() || isChatting}
                     className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     <Send className="w-4 h-4" />
                   </button>
                 </div>
               </form>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl p-12 bg-slate-800/30">
            <RefreshCw className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Results will appear here</p>
            <p className="text-sm">Upload or capture a photo to start AI inspection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyzer;