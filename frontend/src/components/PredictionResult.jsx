import React from 'react';
import { DISEASE_DATABASE } from '../App';

const API_BASE = 'http://localhost:5000';

const PredictionResult = ({ prediction, onReset }) => {
  const isHealthy = prediction.diseaseName.toLowerCase() === 'healthy';
  const confidencePercent = Math.round(prediction.confidence * 100);

  // Retrieve disease facts from database
  const details = DISEASE_DATABASE[prediction.diseaseName] || DISEASE_DATABASE['Healthy'];
  
  // Format imageUrl correctly, replacing Windows backslashes with forward slashes
  const imageUrl = prediction.imageUrl 
    ? `${API_BASE}/${prediction.imageUrl.replace(/\\/g, '/')}`
    : null;

  return (
    <div className="w-full space-y-8 animate-slide-up">
      
      {/* Result Header Badge */}
      <div className="text-center">
        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
          isHealthy 
            ? 'bg-accent/15 text-accent border border-accent/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          Analysis Complete
        </span>
        <h2 className="text-3xl font-extrabold text-white font-display mt-3">Diagnostic Report</h2>
      </div>

      {/* Main Dual-Column Split Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: Uploaded Leaf Image */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/40 relative aspect-video md:aspect-square flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Uploaded Leaf Specimen" 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=60";
                }}
              />
            ) : (
              <div className="text-slate-500 text-sm">Specimen image not available</div>
            )}
            
            {/* Visual Scan Effect corners */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-accent"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-accent"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-accent"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-accent"></div>
          </div>

          <div className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Diagnosed Condition</span>
              <p className={`text-2xl font-black ${isHealthy ? 'text-accent' : 'text-rose-400'}`}>
                {prediction.diseaseName}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Model Confidence</span>
              <p className="text-2xl font-black text-white">{confidencePercent}%</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostic Data Sheets */}
        <div className="space-y-6">
          
          {/* Severity & Scientific Name */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Condition Profile</span>
              {details.severity !== 'None' && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  details.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  details.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {details.severity} Severity
                </span>
              )}
            </div>
            {details.scientificName !== 'N/A' && (
              <p className="text-sm text-emerald-400 font-semibold italic mt-0.5">Scientific Name: {details.scientificName}</p>
            )}
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">{details.description}</p>
          </div>

          {/* Model Confidence Meter bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Confidence Score</span>
              <span>{confidencePercent}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${isHealthy ? 'bg-accent' : 'bg-red-500'}`}
                style={{ width: `${confidencePercent}%` }}
              ></div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Identified Symptoms</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{details.symptoms}</p>
          </div>

          {/* Prevention */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Preventive Action Plan</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{details.prevention}</p>
          </div>

          {/* Cure split blocks */}
          <div className="border-t border-white/5 pt-5 grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors duration-300">
              <span className="text-[10px] font-black text-accent uppercase block tracking-wider">Organic Control</span>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{details.organicTreatment}</p>
            </div>
            <div className="p-3.5 bg-sky-500/5 rounded-xl border border-sky-500/10 hover:bg-sky-500/10 transition-colors duration-300">
              <span className="text-[10px] font-black text-sky-400 uppercase block tracking-wider">Chemical Control</span>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{details.chemicalTreatment}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="w-full flex justify-center pt-6 border-t border-white/5">
        <button 
          onClick={onReset}
          className="px-8 py-3 rounded-xl bg-primary text-[#022c22] font-black hover:bg-accent hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Scan Another Leaf
        </button>
      </div>

    </div>
  );
};

export default PredictionResult;
