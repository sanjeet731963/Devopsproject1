import React, { useState, useRef, useEffect } from 'react';

const ImageUpload = ({ onUpload, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const inputRef = useRef(null);

  const steps = [
    "Uploading leaf specimen...",
    "Scanning structural contours...",
    "Locating cellular anomalies...",
    "Running classification neural net...",
    "Formatting treatment protocols..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 350);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Upload/Scanning Dropzone Box */}
      <div 
        className={`w-full relative p-10 border-2 border-dashed rounded-2xl text-center transition-all duration-500 ease-in-out min-h-[300px] flex flex-col justify-center items-center ${
          dragActive 
            ? 'border-accent bg-accent/10 scale-[1.02] shadow-lg shadow-accent/15' 
            : 'border-emerald-500/20 bg-white/[0.02] hover:border-accent/40 hover:bg-emerald-500/[0.03] hover:shadow-xl hover:shadow-emerald-500/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleChange}
          disabled={loading}
        />

        {/* LOADING/SCANNING OVERLAY */}
        {loading && (
          <div className="absolute inset-0 bg-dark/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 z-20 animate-fade-in">
            {/* Pulsing Scan Target Area */}
            <div className="w-48 h-48 rounded-xl border border-accent/20 relative overflow-hidden flex items-center justify-center bg-[#022c22]/30 mb-8 shadow-2xl">
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Scanning Preview" 
                  className="w-full h-full object-cover opacity-60"
                />
              )}
              {/* Animated scan line */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-scan"></div>
            </div>

            {/* Simulated Step Descriptions */}
            <div className="space-y-3 text-center max-w-sm">
              <div className="flex items-center justify-center space-x-2 text-accent">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-extrabold text-sm tracking-wider uppercase">Running Diagnosis</span>
              </div>
              
              <p className="text-xl font-bold text-white transition-all duration-300 animate-pulse-slow">
                {steps[loadingStep]}
              </p>

              {/* Progress Bar Indicators */}
              <div className="w-44 bg-white/10 h-1 rounded-full overflow-hidden mx-auto">
                <div 
                  className="h-full bg-accent transition-all duration-500 ease-out" 
                  style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* DEFAULT UPLOAD PROMPT */}
        {!previewUrl && !loading && (
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-accent flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            
            <div>
              <div className="text-lg font-bold text-white">
                Drag & Drop leaf photo here
              </div>
              <p className="text-slate-400 text-xs mt-1">Supports PNG, JPG, or JPEG up to 10MB</p>
            </div>

            <div className="text-slate-500 text-xs">or</div>
            
            <button 
              onClick={onButtonClick}
              className="px-6 py-2.5 rounded-xl bg-primary text-[#022c22] font-bold hover:bg-accent transition-colors duration-300 shadow-md shadow-primary/10"
            >
              Browse Local Files
            </button>
          </div>
        )}

        {/* PREVIEW AFTER FILE SELECTED */}
        {previewUrl && !loading && (
          <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
            <div className="relative group rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-slate-950/40">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-60 max-w-full object-contain mx-auto"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <button 
                  onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                  className="text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  Change Specimen
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-[#022c22] font-black text-md shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Scan Specimen Leaf
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
