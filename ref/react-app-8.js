import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

const customStyles = {
  colorShiftAnimation: `
    @keyframes colorShift {
      0%, 100% { color: #FFE600; text-shadow: 0 0 8px rgba(255, 230, 0, 0.6); }
      25% { color: #B4FF00; }
      50% { color: #00FFB4; }
      75% { color: #B400FF; }
    }
  `,
  logoAnimated: {
    animation: 'colorShift 8s ease-in-out infinite',
    fontWeight: 900,
    letterSpacing: '-0.05em'
  }
};

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'px-4 py-2 font-display text-[10px] font-bold uppercase transition-all';
  const variants = {
    primary: 'bg-black text-white border border-black hover:bg-[#FFE600] hover:text-black hover:shadow-[6px_6px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px]',
    outline: 'border border-black hover:bg-black hover:text-white'
  };
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white border border-black transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_black] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Badge = ({ emoji, tooltip, locked = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className={`w-[60px] h-[60px] border border-black flex items-center justify-center bg-white relative cursor-help ${locked ? 'grayscale opacity-30' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-xl">{emoji}</span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white font-mono text-[8px] px-2 py-1 whitespace-nowrap z-50 mb-2">
          {tooltip}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');

  const handleNavClick = (item, path) => {
    setActiveItem(item);
    navigate(path);
  };

  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col p-0 z-20 bg-black">
      <div className="flex flex-col gap-1 p-6 pb-8 border-b border-[#333]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-white flex items-center justify-center relative border border-black">
            <div className="w-2 h-2 bg-black"></div>
          </div>
          <div className="text-5xl font-display text-white tracking-tighter" style={customStyles.logoAnimated}>RIG</div>
        </div>
        <div className="font-mono text-[9px] text-[#666] leading-tight uppercase tracking-widest mt-2">
          Part Knowledge Base<br />
          Part Magic Wand
        </div>
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto py-6 px-4 gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2 font-mono">Платформа</div>
          <a 
            href="#" 
            className={`flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'about' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('about', '/about');
            }}
          >
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            01 // О Проекте
          </a>
          <a 
            href="#" 
            className={`flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'dashboard' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('dashboard', '/');
            }}
          >
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            02 // Панель
          </a>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2 font-mono">Библиотека</div>
          <a 
            href="#" 
            className={`flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'prompts' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('prompts', '/prompts');
            }}
          >
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Промпты
          </a>
          <a 
            href="#" 
            className={`flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'guides' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('guides', '/guides');
            }}
          >
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Гайды
          </a>
        </div>
      </nav>

      <div className="mt-auto p-6 border-t border-[#333]">
        <div className="px-3 py-2 border border-[#333] bg-black flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FFE600]"></div>
          <span className="font-mono text-[9px] text-[#666] uppercase tracking-wider">СИСТЕМА РАБОТАЕТ</span>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ title, subtitle }) => {
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 border-b border-black">
      <div className="flex flex-col">
        <h1 className="font-display text-2xl font-bold text-black tracking-tight uppercase">{title}</h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>НАСТРОЙКИ</Button>
        <div className="w-10 h-10 border border-black bg-white flex items-center justify-center font-bold text-xl">D</div>
      </div>
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-white border-2 border-black p-8 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold uppercase mb-4">НАСТРОЙКИ</h2>
            <p className="text-sm mb-6">Settings panel would go here...</p>
            <Button onClick={() => setShowSettings(false)}>ЗАКРЫТЬ</Button>
          </div>
        </div>
      )}
    </header>
  );
};

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('prompts');
  
  const badges = [
    { emoji: '🔥', tooltip: '7 DAY STREAK', locked: false },
    { emoji: '🛠️', tooltip: 'STARK CONTRIBUTOR', locked: false },
    { emoji: '🚀', tooltip: 'FAST DEPLOYER', locked: false },
    { emoji: '🤖', tooltip: 'AI ARCHITECT', locked: false },
    { emoji: '👑', tooltip: '10k DOWNLOADS (LOCKED)', locked: true },
    { emoji: '🧪', tooltip: 'BETA TESTER', locked: false },
    { emoji: '💡', tooltip: 'IDEA GENERATOR', locked: false },
    { emoji: '📡', tooltip: 'NETWORKER', locked: false }
  ];

  const savedItems = [
    {
      category: 'DEVELOPMENT',
      title: 'Deep Code Refactoring',
      description: 'Advanced prompt for cleaning up legacy React components with high precision.',
      author: 'ALEX M.'
    },
    {
      category: 'RESEARCH',
      title: 'Competitive Matrix AI',
      description: 'Scans market data to build a SWOT analysis table for your product niche.',
      author: 'MARRY K.'
    }
  ];

  const activityItems = [
    {
      type: 'Prompt Created',
      title: 'SQL Query Optimizer v2',
      time: '2 HOURS AGO',
      color: '#FFE600'
    },
    {
      type: 'Contribution',
      title: 'Merged PR #442 into RIG CLI',
      time: 'YESTERDAY',
      color: '#000'
    },
    {
      type: 'Badge Unlocked',
      title: 'Unlocked: NETWORKER BADGE',
      time: '2 DAYS AGO',
      color: '#FFE600'
    },
    {
      type: 'Usage',
      title: 'Used Guide: Deployment 101',
      time: 'FEB 12',
      color: '#000'
    }
  ];

  return (
    <>
      <Header title="ЛИЧНЫЙ КАБИНЕТ" subtitle="ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ // ID: 8921" />
      
      <div className="flex-1 overflow-y-auto p-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#000 #E5E5E5' }}>
        <div className="max-w-[1200px] mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row gap-0 border-2 border-black bg-white">
            <div className="w-full md:w-[300px] bg-black p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-black">
              <div className="w-32 h-32 bg-white border-2 border-white flex items-center justify-center text-5xl font-display font-black mb-6">DS</div>
              <h2 className="text-white font-display text-xl font-bold uppercase tracking-tight">Dmitry Sokolov</h2>
              <p className="text-[#888] font-mono text-[10px] mt-1">SENIOR VIBE ENGINEER</p>
              <div className="mt-8 flex gap-2">
                <div className="bg-[#FFE600] p-1 border border-black cursor-pointer hover:opacity-80">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.493-1.1-1.1s.493-1.1 1.1-1.1 1.1.493 1.1 1.1-.493 1.1-1.1 1.1zm7.701 6.891h-2v-2.888c0-.738-.013-1.688-1.028-1.688-1.03 0-1.187.804-1.187 1.635v2.941h-2v-6h1.92v.82h.027c.267-.506.92-1.038 1.897-1.038 2.03 0 2.406 1.335 2.406 3.07v3.148z"></path></svg>
                </div>
                <div className="bg-white p-1 border border-black cursor-pointer hover:opacity-80">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex flex-1">
                <div className="flex-1 flex flex-col justify-center border-r border-black p-6">
                  <span className="font-mono text-[10px] text-[#666] uppercase mb-1">Создано Промптов</span>
                  <span className="text-5xl font-display font-bold">14</span>
                </div>
                <div className="flex-1 flex flex-col justify-center border-r border-black p-6">
                  <span className="font-mono text-[10px] text-[#666] uppercase mb-1">Копий Промптов</span>
                  <span className="text-5xl font-display font-bold">1.2k</span>
                </div>
                <div className="flex-1 flex flex-col justify-center p-6">
                  <span className="font-mono text-[10px] text-[#666] uppercase mb-1">Ранг</span>
                  <span className="text-5xl font-display font-bold text-[#FFE600]" style={{ WebkitTextStroke: '1px black' }}>S+</span>
                </div>
              </div>
              <div className="p-8 border-t border-black bg-[#FAFAFA]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-xs uppercase tracking-wider">Achievements & Skill Badges</span>
                  <span className="font-mono text-[9px] text-[#666] uppercase">8 / 12 Unlocked</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-3">
                  {badges.map((badge, index) => (
                    <Badge key={index} {...badge} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-end justify-between border-b-2 border-black pb-2">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Saved & Favorites</h3>
                <div className="flex gap-4 font-mono text-[10px] font-bold">
                  <span 
                    className={`cursor-pointer ${activeTab === 'prompts' ? 'text-black border-b border-black' : 'text-[#888] hover:text-black'}`}
                    onClick={() => setActiveTab('prompts')}
                  >
                    PROMPTS (8)
                  </span>
                  <span 
                    className={`cursor-pointer ${activeTab === 'guides' ? 'text-black border-b border-black' : 'text-[#888] hover:text-black'}`}
                    onClick={() => setActiveTab('guides')}
                  >
                    GUIDES (3)
                  </span>
                  <span 
                    className={`cursor-pointer ${activeTab === 'agents' ? 'text-black border-b border-black' : 'text-[#888] hover:text-black'}`}
                    onClick={() => setActiveTab('agents')}
                  >
                    AGENTS (1)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedItems.map((item, index) => (
                  <Card key={index} className="p-6 flex flex-col h-full">
                    <div className="flex justify-between mb-4">
                      <span className="bg-[#F0F0F0] border border-black text-[9px] font-mono px-2 py-1 uppercase font-bold">{item.category}</span>
                      <svg className="w-4 h-4 text-[#FFE600] fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                    </div>
                    <h4 className="text-lg font-bold uppercase mb-2">{item.title}</h4>
                    <p className="text-xs text-[#555] mb-6 flex-1 font-medium">{item.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-black/10">
                      <span className="font-mono text-[10px] text-[#888]">BY {item.author}</span>
                      <button className="text-[10px] font-bold underline uppercase hover:text-[#FFE600]">Use Now</button>
                    </div>
                  </Card>
                ))}
              </div>

              <button className="w-full border border-black py-4 font-display text-[10px] font-bold uppercase hover:bg-black hover:text-white transition-all tracking-widest">
                View All Saved Items
              </button>
            </div>

            <div className="space-y-8">
              <div className="border-b-2 border-black pb-2">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Recent Activity</h3>
              </div>

              <Card className="p-8 bg-white">
                <div className="space-y-2">
                  {activityItems.map((item, index) => (
                    <div key={index} className={`${index < activityItems.length - 1 ? 'border-b border-black' : ''} py-4 first:pt-0 last:pb-0`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 border border-black" style={{ backgroundColor: item.color }}></div>
                        <span className="font-mono text-[9px] font-bold uppercase">{item.type}</span>
                      </div>
                      <p className="text-sm font-bold uppercase">{item.title}</p>
                      <span className="font-mono text-[9px] text-[#888]">{item.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="border-t-2 border-black pt-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white border border-black p-6">
                <span className="block font-mono text-[9px] text-[#666] uppercase mb-2">Account Level</span>
                <span className="block text-xl font-bold uppercase">Core Contributor</span>
              </div>
              <div className="bg-white border border-black p-6">
                <span className="block font-mono text-[9px] text-[#666] uppercase mb-2">Total Vibes Shared</span>
                <span className="block text-xl font-bold uppercase">412 Units</span>
              </div>
              <div className="bg-white border border-black p-6">
                <span className="block font-mono text-[9px] text-[#666] uppercase mb-2">System Reputation</span>
                <span className="block text-xl font-bold uppercase">98% Positive</span>
              </div>
              <div className="bg-white border border-black p-6">
                <span className="block font-mono text-[9px] text-[#666] uppercase mb-2">Member Since</span>
                <span className="block text-xl font-bold uppercase">Oct 2024</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

const AboutPage = () => {
  return (
    <>
      <Header title="О ПРОЕКТЕ" subtitle="RIG PLATFORM OVERVIEW" />
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-[1200px] mx-auto">
          <Card className="p-12">
            <h2 className="font-display text-4xl font-bold uppercase mb-6">About RIG Platform</h2>
            <p className="text-lg mb-4">Part Knowledge Base, Part Magic Wand</p>
            <p className="text-sm text-[#555] leading-relaxed">
              RIG is a comprehensive platform designed to help developers and creators build better AI-powered experiences. 
              We provide tools, prompts, and guides to make your workflow more efficient.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
};

const PromptsPage = () => {
  return (
    <>
      <Header title="БИБЛИОТЕКА ПРОМПТОВ" subtitle="EXPLORE & DISCOVER" />
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <span className="bg-[#F0F0F0] border border-black text-[9px] font-mono px-2 py-1 uppercase font-bold inline-block mb-4">CATEGORY</span>
                <h4 className="text-lg font-bold uppercase mb-2">Prompt Title {i}</h4>
                <p className="text-xs text-[#555] mb-4">Description of the prompt goes here...</p>
                <Button className="w-full">USE NOW</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const GuidesPage = () => {
  return (
    <>
      <Header title="ГАЙДЫ" subtitle="LEARNING RESOURCES" />
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-8">
                <h4 className="text-2xl font-bold uppercase mb-4">Guide Title {i}</h4>
                <p className="text-sm text-[#555] mb-6">Comprehensive guide description and overview...</p>
                <Button>READ MORE</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles.colorShiftAnimation;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div className="h-screen flex overflow-hidden bg-[#E5E5E5] text-black" style={{ fontFamily: 'Manrope, sans-serif' }}>
        <Sidebar />
        <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-[#E5E5E5]">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/guides" element={<GuidesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;