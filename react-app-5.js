import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

const customStyles = {
  root: {
    '--bg-void': '#E5E5E5',
    '--bg-panel': '#000000',
    '--bg-card': '#F0F0F0',
    '--bg-hover': '#FFE600',
    '--text-primary': '#000000',
    '--text-inverse': '#FFFFFF',
    '--text-secondary': '#404040',
    '--text-tertiary': '#666666',
    '--accent-core': '#FFE600',
    '--font-display': "'Space Grotesk', sans-serif",
    '--font-mono': "'IBM Plex Mono', monospace",
    '--font-ui': "'Manrope', sans-serif",
    '--border-width': '1px',
    '--border-color': '#000000'
  }
};

const NavItem = ({ href, active, icon, children }) => {
  const baseClasses = "nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display relative border transition-all";
  const inactiveClasses = "text-[#888] border-transparent hover:text-white hover:border-[#333]";
  const activeClasses = "bg-[#FFE600] text-black border-[#FFE600] font-semibold";
  
  return (
    <Link 
      to={href} 
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
      style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.03em', fontWeight: active ? 600 : 500 }}
    >
      <div className={`w-4 h-4 ${active ? 'opacity-100' : 'opacity-70'}`} style={{ color: active ? '#000' : 'currentColor' }}>
        {icon}
      </div>
      {children}
    </Link>
  );
};

const Button = ({ variant = 'primary', onClick, children, className = '', danger = false }) => {
  const baseClasses = "px-6 py-3 text-xs font-bold border border-black flex items-center gap-2 transition-all duration-100";
  
  if (variant === 'primary') {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} bg-black text-white hover:bg-[#FFE600] hover:text-black hover:shadow-[4px_4px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] ${className}`}
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, textTransform: 'uppercase' }}
      >
        {children}
      </button>
    );
  }
  
  if (variant === 'outline') {
    const dangerClasses = danger ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'hover:bg-black hover:text-white';
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} bg-transparent text-black ${dangerClasses} ${className}`}
        style={{ fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase' }}
      >
        {children}
      </button>
    );
  }
};

const StatusBadge = ({ status }) => {
  const statusClasses = {
    published: 'bg-[#B4FF00]',
    draft: 'bg-[#DDD]',
    pending: 'bg-[#FFE600]'
  };
  
  const statusText = {
    published: 'Published',
    draft: 'Draft',
    pending: 'Pending Review'
  };
  
  return (
    <span 
      className={`text-[9px] px-[6px] py-[2px] border border-black font-bold uppercase ${statusClasses[status]}`}
      style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}
    >
      {statusText[status]}
    </span>
  );
};

const ContentCard = ({ emoji, title, status, id, type, updated, copies, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-black p-6 flex items-center justify-between group hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-[#F5F5F5] border border-black flex items-center justify-center font-mono text-xl font-bold">
          {emoji}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
            <StatusBadge status={status} />
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-gray-500 uppercase">
            <span>ID: {id}</span>
            <span>Type: {type}</span>
            <span>Updated: {updated}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className="text-sm font-bold font-mono">{copies.toLocaleString()}</div>
          <div className="text-[9px] text-gray-500 font-bold uppercase">КОПИЙ</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>Edit</Button>
          <Button variant="outline" danger onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
};

const CreateModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl bg-white border-2 border-black shadow-[10px_10px_0px_#000] flex flex-col">
        <div className="p-6 border-b-2 border-black flex justify-between items-center bg-black text-white">
          <h2 className="text-xl font-display font-bold uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Создать Публикацию
          </h2>
          <button onClick={onClose} className="hover:text-[#FFE600]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase mb-2">Название</label>
            <input 
              type="text" 
              className="w-full border-2 border-black p-3 font-display text-lg focus:outline-none focus:bg-[#FFE600]/10" 
              placeholder="ENTER TITLE..."
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase mb-2">Тип</label>
              <select className="w-full border-2 border-black p-3 appearance-none bg-white font-bold uppercase text-xs focus:outline-none">
                <option>Промпт</option>
                <option>Гайд</option>
                <option>Агент</option>
                <option>Правила</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase mb-2">Теги</label>
              <input 
                type="text" 
                className="w-full border-2 border-black p-3 text-xs focus:outline-none" 
                placeholder="ARCH, CODE, PROD..." 
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold uppercase mb-2">Содержимое (Markdown/Code)</label>
            <textarea 
              rows="8" 
              className="w-full border-2 border-black p-4 font-mono text-xs focus:outline-none resize-none" 
              placeholder="INSERT CONTENT HERE..."
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            />
          </div>
        </div>

        <div className="p-6 border-t-2 border-black flex justify-end gap-3 bg-[#FAFAFA]">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button variant="primary" onClick={onClose}>Опубликовать</Button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ activePath }) => {
  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col p-0 z-20 border-r border-black bg-black">
      <div className="flex flex-col gap-1 p-6 pb-8 border-b border-[#333]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-white flex items-center justify-center relative border border-black">
            <div className="w-2 h-2 bg-black"></div>
          </div>
          <div 
            className="text-5xl font-display text-white tracking-tighter"
            style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              animation: 'colorShift 8s ease-in-out infinite',
              fontWeight: 900,
              letterSpacing: '-0.05em'
            }}
          >
            RIG
          </div>
        </div>
        <div className="font-mono text-[9px] text-[#666] leading-tight uppercase tracking-widest mt-2">
          PART KNOWLEDGE BASE<br />
          PART MAGIC WAND
        </div>
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto py-6 px-4 gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2 font-mono">Платформа</div>
          <NavItem 
            href="/" 
            active={activePath === '/'}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          >
            01 // О Проекте
          </NavItem>
          <NavItem 
            href="/dashboard" 
            active={activePath === '/dashboard'}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
          >
            02 // Панель
          </NavItem>
          <NavItem 
            href="/content" 
            active={activePath === '/content'}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            03 // Публикации
          </NavItem>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2 font-mono">Библиотека</div>
          <NavItem 
            href="/prompts" 
            active={activePath === '/prompts'}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            Промпты
          </NavItem>
          <NavItem 
            href="/guides" 
            active={activePath === '/guides'}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          >
            Гайды
          </NavItem>
          <NavItem 
            href="/agents" 
            active={activePath === '/agents'}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
          >
            Правила и Агенты
          </NavItem>
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

const ContentManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const contents = [
    { emoji: '💬', title: 'Анализ Конкурентов v2', status: 'published', id: 'RIG-8832', type: 'Prompt', updated: '12.02.2025', copies: 1837 },
    { emoji: '🤖', title: 'Code-Review Agent PRO', status: 'draft', id: 'RIG-9011', type: 'Agent', updated: '15.02.2025', copies: 0 },
    { emoji: '📖', title: 'Гайд по MCP Серверам', status: 'pending', id: 'RIG-4421', type: 'Guide', updated: '16.02.2025', copies: 412 },
    { emoji: '💬', title: 'SQL Query Optimizer', status: 'published', id: 'RIG-1233', type: 'Prompt', updated: '05.02.2025', copies: 982 }
  ];

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-[#E5E5E5]">
      <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 sticky top-0 z-30 border-b border-black">
        <div className="flex flex-col">
          <h1 
            className="font-display text-2xl font-bold text-black tracking-tight uppercase"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Управление Контентом
          </h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            ВАШИ ПУБЛИКАЦИИ / 08 ОБЪЕКТОВ
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsModalOpen(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            НОВАЯ ПУБЛИКАЦИЯ
          </Button>
        </div>
      </header>

      <div 
        className="flex-1 overflow-y-auto p-10"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#000 #E5E5E5'
        }}
      >
        <div className="grid grid-cols-4 gap-0 border-2 border-black bg-white mb-10">
          <div className="p-6 border-r border-black flex flex-col gap-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">Опубликовано</span>
            <span className="text-3xl font-display font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>05</span>
          </div>
          <div className="p-6 border-r border-black flex flex-col gap-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">В Черновиках</span>
            <span className="text-3xl font-display font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>02</span>
          </div>
          <div className="p-6 border-r border-black flex flex-col gap-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">На Проверке</span>
            <span className="text-3xl font-display font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>01</span>
          </div>
          <div className="p-6 flex flex-col gap-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">Копирований</span>
            <span className="text-3xl font-display font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>2.4k</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-black hover:bg-[#FFE600]'
              }`}
            >
              Все
            </button>
            <button 
              onClick={() => setActiveFilter('prompts')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                activeFilter === 'prompts' 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-black hover:bg-[#FFE600]'
              }`}
            >
              Промпты
            </button>
            <button 
              onClick={() => setActiveFilter('guides')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                activeFilter === 'guides' 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-black hover:bg-[#FFE600]'
              }`}
            >
              Гайды
            </button>
            <button 
              onClick={() => setActiveFilter('agents')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                activeFilter === 'agents' 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-black hover:bg-[#FFE600]'
              }`}
            >
              Агенты
            </button>
          </div>
          <div className="h-[1px] bg-black flex-1 opacity-20"></div>
        </div>

        <div className="flex flex-col gap-4">
          {contents.map((content, index) => (
            <ContentCard 
              key={index}
              {...content}
              onEdit={() => console.log('Edit', content.id)}
              onDelete={() => console.log('Delete', content.id)}
            />
          ))}
        </div>
      </div>

      <CreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
};

const App = () => {
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      
      body {
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        font-family: 'Manrope', sans-serif;
      }
      
      @keyframes colorShift {
        0%, 100% { color: #FFE600; text-shadow: 0 0 8px rgba(255, 230, 0, 0.6); }
        50% { color: #00FFB4; text-shadow: 0 0 8px rgba(0, 255, 180, 0.6); }
      }
      
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #E5E5E5; border-left: 1px solid #000; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; }
      
      * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router basename="/">
      <div className="h-screen flex overflow-hidden" style={customStyles.root}>
        <Routes>
          <Route path="/" element={
            <>
              <Sidebar activePath="/" />
              <ContentManagement />
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Sidebar activePath="/dashboard" />
              <ContentManagement />
            </>
          } />
          <Route path="/content" element={
            <>
              <Sidebar activePath="/content" />
              <ContentManagement />
            </>
          } />
          <Route path="/prompts" element={
            <>
              <Sidebar activePath="/prompts" />
              <ContentManagement />
            </>
          } />
          <Route path="/guides" element={
            <>
              <Sidebar activePath="/guides" />
              <ContentManagement />
            </>
          } />
          <Route path="/agents" element={
            <>
              <Sidebar activePath="/agents" />
              <ContentManagement />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;