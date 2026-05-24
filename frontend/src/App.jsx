import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import PredictionResult from './components/PredictionResult';

// Consolidated disease details database
export const DISEASE_DATABASE = {
  'Apple Scab': {
    scientificName: 'Venturia inaequalis',
    severity: 'Moderate',
    description: 'A fungal disease affecting apple trees, causing olive-green to dark brown spots on leaves and fruit.',
    symptoms: 'Velvety brown or olive-green spots on leaves, leaf curling/puckering, premature defoliation.',
    prevention: 'Rake and destroy fallen leaves in autumn. Prune trees to improve airflow.',
    organicTreatment: 'Apply sulfur or copper fungicides, or organic neem oil in early spring.',
    chemicalTreatment: 'Apply protective chemical fungicides (e.g., Captan, Myclobutanil) during bud break.'
  },
  'Cedar Apple Rust': {
    scientificName: 'Gymnosporangium juniperi-virginianae',
    severity: 'High',
    description: 'A disease caused by a rust fungus that cycles between juniper/red cedar trees and apple trees.',
    symptoms: 'Bright yellow-orange spots on leaves with small black dots. Orange tube-like structures on leaf undersides.',
    prevention: 'Do not plant apple trees near red cedars (alternate host). Prune and destroy cedar galls.',
    organicTreatment: 'Use organic copper-based sprays early in the growing season.',
    chemicalTreatment: 'Foliar chemical fungicides like Myclobutanil can prevent rust infection.'
  },
  'Corn Blight': {
    scientificName: 'Exserohilum turcicum',
    severity: 'Moderate',
    description: 'Also known as Northern Corn Leaf Blight, it is a destructive fungal disease of corn leaves.',
    symptoms: 'Long, cigar-shaped, grayish-green or tan lesions on leaves, beginning on lower leaves and spreading upward.',
    prevention: 'Rotate crops, till crop residues, and plant resistant corn hybrids.',
    organicTreatment: 'Foliar sprays containing Bacillus subtilis or organic bio-fungicides.',
    chemicalTreatment: 'Triazole or strobilurin-based chemical fungicides can be used in severe outbreaks.'
  },
  'Tomato Early Blight': {
    scientificName: 'Alternaria solani',
    severity: 'Low to Moderate',
    description: 'A common fungal infection that targets potato and tomato crops, attacking stems, leaves, and fruit.',
    symptoms: 'Concentric dark brown rings on older leaves ("target spots"). Leaves yellow and fall off starting from the bottom.',
    prevention: 'Mulch plants, avoid overhead watering, rotate crops every 3 years.',
    organicTreatment: 'Copper soap or copper octanoate sprays. Remove infected lower leaves.',
    chemicalTreatment: 'Apply chemical fungicides containing chlorothalonil, mancozeb, or copper oxychloride.'
  },
  'Tomato Late Blight': {
    scientificName: 'Phytophthora infestans',
    severity: 'Critical',
    description: 'A highly destructive oomycete disease that spreads rapidly in cool, wet conditions and can wipe out entire crops.',
    symptoms: 'Irregular dark, water-soaked leaf spots with white fuzzy mold underneath in high humidity. Rapid blackening and rotting.',
    prevention: 'Plant resistant cultivars, destroy volunteers, space plants widely.',
    organicTreatment: 'Copper-based fungicides applied preventatively. Infected plants must be bagged and destroyed immediately.',
    chemicalTreatment: 'Systemic fungicides (e.g., metalaxyl-M, chlorothalonil) must be applied immediately.'
  },
  'Potato Early Blight': {
    scientificName: 'Alternaria solani',
    severity: 'Moderate',
    description: 'Fungal infection similar to tomato early blight, causing premature defoliation and yield loss in potato crops.',
    symptoms: 'Concentric dark brown spots on lower leaves. Yellowing halo around spots. Leaf dry-up.',
    prevention: 'Crop rotation, use certified seed tubers, maintain optimal soil nutrition.',
    organicTreatment: 'Liquid copper sprays or biological fungicides containing Bacillus subtilis.',
    chemicalTreatment: 'Chlorothalonil or Mancozeb sprays applied at the first sign of symptoms.'
  },
  'Grape Black Rot': {
    scientificName: 'Guignardia bidwellii',
    severity: 'High',
    description: 'A severe fungal disease affecting grapes, destroying the leaves, shoots, and fruit.',
    symptoms: 'Small, circular reddish-brown spots on leaves. Berries turn dark, shrivel into hard, black mummies.',
    prevention: 'Prune vines to open up the canopy. Destroy mummified berries on vines or the ground.',
    organicTreatment: 'Copper-lime mixtures (Bordeaux mixture) or sulfur sprays starting at bud burst.',
    chemicalTreatment: 'Protectant chemical fungicides (e.g., Mancozeb, Myclobutanil) are highly effective.'
  },
  'Healthy': {
    scientificName: 'N/A',
    severity: 'None',
    description: 'The leaf shows normal structure and coloration, with no active fungal, bacterial, or viral disease symptoms.',
    symptoms: 'Green, firm leaf surface, clear margins, and normal vascular structure.',
    prevention: 'Maintain regular watering, ensure adequate sunlight, prune yellowing bottom leaves, and apply organic compost.',
    organicTreatment: 'None required. Continue standard organic plant care.',
    chemicalTreatment: 'None required.'
  }
};

const API_BASE = 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  
  // Care Guides search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // AI Assistant chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your AgroAI agricultural assistant. How can I help you manage your crop health today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Fetch History
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleImageUpload = async (file) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      setPrediction(data.data);
      // Refresh history list
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setError(null);
  };

  const handleDeleteHistoryItem = async (id, e) => {
    e.stopPropagation(); // Stop opening the modal
    if (!window.confirm("Are you sure you want to delete this scan record?")) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/history/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
        if (selectedHistoryItem && selectedHistoryItem._id === id) {
          setSelectedHistoryItem(null);
        }
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      alert("Error deleting record.");
    }
  };

  // Chat message submit handler
  const handleSendMessage = (textToSend = null) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Simulate farmer expert bot response
    setTimeout(() => {
      let replyText = "I see. To provide the best advice, please ensure you inspect the underside of leaves for fuzzy spores or webs, and check if stem lesions are present.";
      
      const lower = messageText.toLowerCase();
      if (lower.includes('tomato') && lower.includes('blight')) {
        replyText = "Tomato blight is highly infectious! Early Blight presents as brown rings. Late Blight causes rapid rotting in humid conditions. Ensure you mulch roots, water only at the soil level, and spray copper-based fungicides if humidity is high.";
      } else if (lower.includes('apple') && lower.includes('scab')) {
        replyText = "Apple Scab (Venturia inaequalis) shows up as velvety olive-green leaf spots. Clean up fallen leaves immediately to prevent spores overwintering in the soil, and prune branches to maximize light and airflow.";
      } else if (lower.includes('rust')) {
        replyText = "Cedar Apple Rust is unique because it requires nearby junipers/red cedars to complete its life cycle. Remove any juniper galls nearby, and apply early protective organic copper soap sprays.";
      } else if (lower.includes('corn') || lower.includes('maize')) {
        replyText = "For Corn Blight, crop rotation is crucial. Avoid planting corn in the same plot back-to-back. Ensure crop debris is tilled deep into the soil after harvest to suppress fungal survival.";
      } else if (lower.includes('fertilizer') || lower.includes('compost')) {
        replyText = "Organic compost adds essential micronutrients and microbial activity, which helps build system immunity in plants. Use well-rotted cow manure or compost tea to avoid leaf burn.";
      } else if (lower.includes('watering') || lower.includes('water')) {
        replyText = "Drip irrigation or base watering is always best. Avoid overhead sprinklers, especially in the evening, as wet foliage provides the perfect breeding ground for fungal and bacterial blight spores.";
      }

      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 1200);
  };

  // Helper metrics for dashboard
  const totalScans = history.length;
  const healthyScans = history.filter(item => item.diseaseName.toLowerCase() === 'healthy').length;
  const healthRate = totalScans > 0 ? Math.round((healthyScans / totalScans) * 100) : 100;
  const criticalThreats = history.filter(item => {
    const details = DISEASE_DATABASE[item.diseaseName] || {};
    return details.severity === 'Critical' || details.severity === 'High';
  }).length;

  // Filtered Care Guides
  const filteredGuides = Object.keys(DISEASE_DATABASE).filter(name => {
    const item = DISEASE_DATABASE[name];
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Tomato') return matchesSearch && name.toLowerCase().includes('tomato');
    if (selectedFilter === 'Potato') return matchesSearch && name.toLowerCase().includes('potato');
    if (selectedFilter === 'Apple') return matchesSearch && name.toLowerCase().includes('apple');
    if (selectedFilter === 'Corn') return matchesSearch && name.toLowerCase().includes('corn');
    if (selectedFilter === 'Grape') return matchesSearch && name.toLowerCase().includes('grape');
    if (selectedFilter === 'Other') return matchesSearch && !['tomato', 'potato', 'apple', 'corn', 'grape'].some(c => name.toLowerCase().includes(c));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#022c22] font-sans antialiased text-slate-100">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 glass-panel md:min-h-screen flex flex-col justify-between border-b md:border-b-0 md:border-r border-emerald-500/10 z-10">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-emerald-500/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <svg className="w-6 h-6 text-[#022c22]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 8C8 10 5.9 16.9 5.1 19.9C6.9 19.7 12 18.2 14.9 14.9C17.8 11.7 18 8.8 17 8ZM12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM13 18C13 18 10 16 9 14C8 12 9.5 9.5 12 9.5C14.5 9.5 15.5 11 15 13C14.5 15 13 18 13 18Z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight font-display text-white">
                Agro<span className="text-accent">AI</span>
              </h1>
              <p className="text-xs text-emerald-400 font-semibold tracking-widest uppercase">Smart Assistant</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-primary to-emerald-600 text-white font-bold shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-emerald-500/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path>
              </svg>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('scan'); handleReset(); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'scan'
                  ? 'bg-gradient-to-r from-primary to-emerald-600 text-white font-bold shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-emerald-500/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Scan Leaf</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-primary to-emerald-600 text-white font-bold shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-emerald-500/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Scan Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'library'
                  ? 'bg-gradient-to-r from-primary to-emerald-600 text-white font-bold shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-emerald-500/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <span>Care Library</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'assistant'
                  ? 'bg-gradient-to-r from-primary to-emerald-600 text-white font-bold shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-emerald-500/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <span>AI Assistant</span>
            </button>
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-6 border-t border-emerald-500/10 hidden md:block">
          <div className="flex items-center space-x-2 text-emerald-400/70 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span>Local Node API: Active</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        
        {/* TABS CONTAINER */}
        <div className="max-w-6xl mx-auto w-full animate-fade-in">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-slide-up">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">Crop Health Dashboard</h2>
                  <p className="text-slate-400 mt-1">Real-time overview of your plants and recent diagnostics.</p>
                </div>
                <button
                  onClick={() => { setActiveTab('scan'); handleReset(); }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-[#022c22] font-bold shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center space-x-2 self-start transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span>Diagnose Leaf</span>
                </button>
              </header>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex items-center space-x-5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Scans Conducted</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{totalScans}</p>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center space-x-5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Average Health Rate</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{healthRate}%</p>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center space-x-5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Critical Threats Logged</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{criticalThreats}</p>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Farming Weather/Advisor */}
                <div className="glass-panel p-6 rounded-2xl shadow-xl lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Smart Farm Weather Advisor</h3>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-accent font-semibold text-xs border border-emerald-500/20">LIVE METRIC</span>
                  </div>
                  
                  {/* Weather metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Temperature</p>
                      <p className="text-2xl font-bold text-white mt-1">29°C</p>
                      <p className="text-[10px] text-emerald-400 mt-1">Optimal</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Humidity</p>
                      <p className="text-2xl font-bold text-white mt-1">72%</p>
                      <p className="text-[10px] text-yellow-400 mt-1">High (Risk of Fungi)</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Soil Moisture</p>
                      <p className="text-2xl font-bold text-white mt-1">45%</p>
                      <p className="text-[10px] text-emerald-400 mt-1">Good</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold uppercase">UV Index</p>
                      <p className="text-2xl font-bold text-white mt-1">6.2</p>
                      <p className="text-[10px] text-emerald-400 mt-1">Moderate</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start space-x-3">
                    <svg className="w-6 h-6 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-white">Daily Advisory Advice</p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        With humidity reading at 72%, early morning spores can develop into blights on nightshade species (tomatoes/potatoes). Consider applying preventative bio-fungicides or checking leaves. Water plants near root stems directly, rather than wet leaves.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Care Library Preview */}
                <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Care Guides Quick Access</h3>
                    <p className="text-slate-400 text-xs mt-1">Instantly lookup details for major crop conditions</p>
                    <div className="mt-4 space-y-2">
                      {Object.keys(DISEASE_DATABASE).slice(0, 4).map(name => {
                        const info = DISEASE_DATABASE[name];
                        return (
                          <div 
                            key={name}
                            onClick={() => { setActiveTab('library'); setSearchQuery(name); }}
                            className="p-3 rounded-lg bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 cursor-pointer flex justify-between items-center transition-all duration-300"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">{name}</p>
                              <p className="text-[10px] text-slate-400 italic">{info.scientificName}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              info.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                              info.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                              info.severity === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-emerald-400'
                            }`}>
                              {info.severity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('library'); setSearchQuery(''); }}
                    className="w-full text-center text-xs font-bold text-accent hover:text-white transition-colors duration-300"
                  >
                    View All Guides &rarr;
                  </button>
                </div>
              </div>

              {/* Recent Scan History Rows */}
              <div className="glass-panel p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Recent Diagnostics</h3>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    View All Logs
                  </button>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-10">
                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-slate-400 text-sm">No plant scans found. Go to the "Scan Leaf" tab to start.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase">
                          <th className="pb-3 w-16">Preview</th>
                          <th className="pb-3">Diagnosis</th>
                          <th className="pb-3">Confidence</th>
                          <th className="pb-3">Scan Date</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.slice(0, 4).map(item => {
                          const isHealthy = item.diseaseName.toLowerCase() === 'healthy';
                          const imageUrl = `${API_BASE}/${item.imageUrl.replace(/\\/g, '/')}`;
                          return (
                            <tr 
                              key={item._id}
                              className="group hover:bg-white/5 cursor-pointer transition-colors duration-200"
                              onClick={() => setSelectedHistoryItem(item)}
                            >
                              <td className="py-3">
                                <img 
                                  src={imageUrl} 
                                  alt={item.diseaseName}
                                  className="w-10 h-10 object-cover rounded-lg border border-white/10"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=150&auto=format&fit=crop&q=60";
                                  }}
                                />
                              </td>
                              <td className="py-3 font-semibold text-white">
                                <span className={isHealthy ? 'text-accent' : 'text-red-400'}>
                                  {item.diseaseName}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${isHealthy ? 'bg-accent' : 'bg-red-500'}`} 
                                      style={{ width: `${Math.round(item.confidence * 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-300">{Math.round(item.confidence * 100)}%</span>
                                </div>
                              </td>
                              <td className="py-3 text-sm text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={() => setSelectedHistoryItem(item)}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-accent hover:bg-accent hover:text-[#022c22] transition-colors duration-200"
                                    title="View Analysis"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={(e) => handleDeleteHistoryItem(item._id, e)}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200"
                                    title="Delete Log"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DIAGNOSE & SCAN */}
          {activeTab === 'scan' && (
            <div className="space-y-6 animate-slide-up max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-white font-display">Leaf Scan Diagnostic</h2>
                <p className="text-slate-400 mt-2 max-w-xl mx-auto">
                  Take or upload a high-resolution photo of a single crop leaf showing symptoms. Our AI analyzer compiles an organic action plan.
                </p>
              </div>

              <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative">
                {!prediction ? (
                  <ImageUpload onUpload={handleImageUpload} loading={loading} />
                ) : (
                  <PredictionResult prediction={prediction} onReset={handleReset} />
                )}

                {error && (
                  <div className="mt-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
                    <p className="text-rose-300 text-sm font-semibold">{error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SCAN LOGS (HISTORY) */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">Diagnostic Logs</h2>
                <p className="text-slate-400 mt-1">Full database of all scans submitted to this node.</p>
              </div>

              {history.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl shadow-xl">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-2">No Records Yet</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                    Scan plant leaf images under the 'Scan Leaf' tab to build a diagnostic timeline and watch how crop conditions trend.
                  </p>
                  <button
                    onClick={() => setActiveTab('scan')}
                    className="px-6 py-2.5 bg-primary hover:bg-accent text-[#022c22] font-bold rounded-xl transition-all duration-300 shadow-md"
                  >
                    Perform First Scan
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map(item => {
                    const isHealthy = item.diseaseName.toLowerCase() === 'healthy';
                    const details = DISEASE_DATABASE[item.diseaseName] || {};
                    const imageUrl = `${API_BASE}/${item.imageUrl.replace(/\\/g, '/')}`;
                    return (
                      <div 
                        key={item._id}
                        onClick={() => setSelectedHistoryItem(item)}
                        className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
                      >
                        {/* Image banner */}
                        <div className="h-44 w-full relative overflow-hidden bg-slate-800">
                          <img 
                            src={imageUrl} 
                            alt={item.diseaseName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&auto=format&fit=crop&q=60";
                            }}
                          />
                          <div className="absolute top-3 right-3 flex space-x-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              details.severity === 'Critical' ? 'bg-red-500 text-white' :
                              details.severity === 'High' ? 'bg-orange-500 text-white' :
                              details.severity === 'Moderate' ? 'bg-yellow-500 text-slate-900' : 'bg-green-500 text-white'
                            }`}>
                              {details.severity || 'None'}
                            </span>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-5 space-y-4">
                          <div>
                            <p className="text-xs text-slate-400">
                              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <h3 className={`text-xl font-bold mt-1 ${isHealthy ? 'text-accent' : 'text-red-400'}`}>
                              {item.diseaseName}
                            </h3>
                            {details.scientificName && details.scientificName !== 'N/A' && (
                              <p className="text-xs text-slate-400 italic mt-0.5">{details.scientificName}</p>
                            )}
                          </div>

                          {/* Confidence */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-300">
                              <span>Model Confidence</span>
                              <span>{Math.round(item.confidence * 100)}%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${isHealthy ? 'bg-accent' : 'bg-red-500'}`} 
                                style={{ width: `${Math.round(item.confidence * 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Card buttons */}
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
                              <span>Details</span>
                              <span>&rarr;</span>
                            </span>
                            <button 
                              onClick={(e) => handleDeleteHistoryItem(item._id, e)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors duration-200 text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CARE LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">Crop Care Reference Library</h2>
                <p className="text-slate-400 mt-1">Search symptoms, biological targets, and organic or chemical cures.</p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                  <input
                    type="text"
                    placeholder="Search by disease, symptoms, or scientific name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-panel pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-100 placeholder-slate-500 border border-white/10"
                  />
                  <svg className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>

                {/* Filter tags */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                  {['All', 'Tomato', 'Potato', 'Apple', 'Corn', 'Grape', 'Other'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                        selectedFilter === cat
                          ? 'bg-primary text-[#022c22] shadow-md shadow-primary/10'
                          : 'bg-white/5 border border-white/5 hover:bg-emerald-500/10 text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disease list */}
              {filteredGuides.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl border border-white/5">
                  <p className="text-slate-400">No guides matching "{searchQuery}" or category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredGuides.map(name => {
                    const item = DISEASE_DATABASE[name];
                    return (
                      <div 
                        key={name}
                        className="glass-panel rounded-2xl p-6 shadow-xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-white font-display">{name}</h3>
                              {item.scientificName !== 'N/A' && (
                                <p className="text-xs text-slate-400 italic mt-0.5">{item.scientificName}</p>
                              )}
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                              item.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                              item.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                              item.severity === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-accent'
                            }`}>
                              {item.severity}
                            </span>
                          </div>

                          <p className="text-slate-300 text-sm mt-3 leading-relaxed">{item.description}</p>

                          <div className="mt-4 space-y-2">
                            <div>
                              <span className="text-xs font-bold text-accent uppercase block">Key Symptoms:</span>
                              <span className="text-slate-300 text-sm">{item.symptoms}</span>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-accent uppercase block">Prevention Steps:</span>
                              <span className="text-slate-300 text-sm">{item.prevention}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <span className="text-[10px] font-bold text-accent uppercase block">Organic control</span>
                            <span className="text-xs text-slate-300 mt-1 block leading-relaxed">{item.organicTreatment}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10">
                            <span className="text-[10px] font-bold text-sky-400 uppercase block">Chemical control</span>
                            <span className="text-xs text-slate-300 mt-1 block leading-relaxed">{item.chemicalTreatment}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI ASSISTANT CHAT */}
          {activeTab === 'assistant' && (
            <div className="max-w-4xl mx-auto animate-slide-up">
              <div className="mb-6">
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">AI Farmer Companion</h2>
                <p className="text-slate-400 mt-1">Receive immediate crop advice and pest prevention tips from our chatbot model.</p>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col h-[60vh]">
                {/* Chat header */}
                <div className="p-4 bg-emerald-950/40 border-b border-white/5 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-accent">
                    <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">AgroAI Expert Advisor</h3>
                    <p className="text-[10px] text-accent font-semibold tracking-wider uppercase">Interactive Agent</p>
                  </div>
                </div>

                {/* Chat window */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xl rounded-2xl p-4 shadow-md ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-r from-emerald-600 to-primary text-white rounded-br-none'
                          : 'bg-slate-900/60 border border-white/5 text-slate-100 rounded-bl-none'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                        <span className="text-[9px] text-slate-400 block mt-2 text-right">{msg.time}</span>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 rounded-bl-none flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preset Suggestions Quick Clicks */}
                <div className="p-3 border-t border-white/5 bg-slate-950/40 flex flex-wrap gap-2">
                  <span className="text-xs text-slate-500 font-bold self-center mr-1">Ask:</span>
                  {[
                    "How to treat Tomato Late Blight?",
                    "Organic care for Apple Scab",
                    "Tips for watering blighted soil",
                    "How to make high-grade compost?"
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-3 py-1 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 text-xs text-slate-300 rounded-full transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Input box */}
                <div className="p-4 border-t border-white/5 bg-emerald-950/20 flex space-x-3">
                  <input
                    type="text"
                    placeholder="Describe your plant symptoms or ask care questions..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    className="flex-1 glass-panel border border-white/5 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-500 text-sm text-slate-100"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="px-5 py-3 bg-primary hover:bg-accent text-[#022c22] font-bold rounded-xl transition-all duration-300 shadow-md shadow-primary/10 flex items-center justify-center shrink-0"
                  >
                    <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* DETAIL SCAN REPORT MODAL (FOR HISTORY) */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 bg-slate-950/30 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white font-display">Diagnostic Scan Details</h3>
                <p className="text-xs text-slate-400">
                  ID: {selectedHistoryItem._id} | Scanned: {new Date(selectedHistoryItem.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedHistoryItem(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Content - Dual Column */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image side */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900 relative group aspect-video md:aspect-square flex items-center justify-center">
                  <img 
                    src={`${API_BASE}/${selectedHistoryItem.imageUrl.replace(/\\/g, '/')}`} 
                    alt={selectedHistoryItem.diseaseName}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=60";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Submitted Leaf Specimen</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Diagnosis Result</span>
                    <p className={`text-2xl font-black ${
                      selectedHistoryItem.diseaseName.toLowerCase() === 'healthy' ? 'text-accent' : 'text-rose-400'
                    }`}>{selectedHistoryItem.diseaseName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Confidence</span>
                    <p className="text-2xl font-black text-white">{Math.round(selectedHistoryItem.confidence * 100)}%</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis details side */}
              <div className="space-y-6">
                {(() => {
                  const dbItem = DISEASE_DATABASE[selectedHistoryItem.diseaseName] || DISEASE_DATABASE['Healthy'];
                  return (
                    <>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400 font-bold uppercase">Condition Profile</span>
                          {dbItem.severity !== 'None' && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dbItem.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              dbItem.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {dbItem.severity} Severity
                            </span>
                          )}
                        </div>
                        {dbItem.scientificName !== 'N/A' && (
                          <p className="text-xs text-slate-400 italic mt-0.5">Scientific: {dbItem.scientificName}</p>
                        )}
                        <p className="text-slate-300 text-sm mt-3 leading-relaxed">{dbItem.description}</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-accent uppercase tracking-wider">Symptoms Observed</h4>
                        <p className="text-slate-300 text-sm">{dbItem.symptoms}</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-accent uppercase tracking-wider">Prevention & Best Practices</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{dbItem.prevention}</p>
                      </div>

                      <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                          <span className="text-[10px] font-bold text-accent uppercase">Organic Control</span>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{dbItem.organicTreatment}</p>
                        </div>
                        <div className="p-3 bg-sky-500/5 rounded-xl border border-sky-500/10">
                          <span className="text-[10px] font-bold text-sky-400 uppercase">Chemical Control</span>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{dbItem.chemicalTreatment}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 bg-slate-950/30 flex justify-end space-x-3">
              <button 
                onClick={(e) => { handleDeleteHistoryItem(selectedHistoryItem._id, e); }}
                className="px-5 py-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors duration-200 text-sm font-bold rounded-xl"
              >
                Delete Log
              </button>
              <button 
                onClick={() => setSelectedHistoryItem(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white transition-colors duration-200 text-sm font-bold rounded-xl"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
