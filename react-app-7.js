import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

const customStyles = {
  logoAnimated: {
    animation: 'colorShift 8s ease-in-out infinite',
    fontWeight: 900,
    letterSpacing: '-0.05em'
  }
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseClasses = 'px-5 py-2.5 text-xs font-bold border border-black transition-all duration-200';
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-[#FFE600] hover:text-black hover:shadow-[6px_6px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]',
    outline: 'bg-transparent text-black border-black hover:bg-black hover:text-white'
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} uppercase font-display font-semibold`}
    >
      {children}
    </button>
  );
};

const FilterChip = ({ children, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`border border-black px-3 py-1 font-mono text-[10px] font-bold uppercase cursor-pointer transition-all ${
        active ? 'bg-black text-[#FFE600]' : 'bg-white text-black hover:bg-gray-100'
      }`}
    >
      {children}
    </div>
  );
};

const SearchCard = ({ type, number, title, description, tags, author, actionLabel, isArchived }) => {
  const typeStyles = {
    'АГЕНТ': 'bg-black text-[#FFE600]',
    'ПРОМПТ': 'bg-[#FFE600] text-black border border-black',
    'ГАЙД': 'bg-white text-black border border-black'
  };

  return (
    <div className={`search-card p-6 flex flex-col bg-white border-r-2 border-b-2 border-black transition-all duration-200 hover:bg-[#FAFAFA] hover:shadow-[8px_8px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 ${isArchived ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <span className={`${typeStyles[type]} text-[9px] font-mono font-bold px-2 py-1 uppercase tracking-wider`}>
          {type}
        </span>
        <span className="text-[10px] font-mono font-bold text-gray-400">#{number}</span>
      </div>
      <h3 className="text-xl font-display font-bold text-black mb-2 uppercase leading-tight" dangerouslySetInnerHTML={{ __html: title }} />
      <p className="text-sm text-[#444] mb-8 font-medium line-clamp-2" dangerouslySetInnerHTML={{ __html: description }} />
      <div className="mt-auto flex items-center justify-between">
        {tags && (
          <div className="flex gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="text-[9px] border border-black px-1 font-mono font-bold">{tag}</span>
            ))}
          </div>
        )}
        {author && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black text-[8px] text-white flex items-center justify-center font-bold">
              {author.initial}
            </div>
            <span className="text-[10px] font-bold uppercase font-mono">{author.name}</span>
          </div>
        )}
        {isArchived && (
          <span className="text-[9px] font-mono font-bold text-red-600 uppercase">ARCHIVED</span>
        )}
        <Button variant="outline" className="px-4 py-2 text-[10px]" disabled={isArchived}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};

const Sidebar = ({ activeItem }) => {
  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col p-0 z-20 border-r border-[#333] bg-black">
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
          <Link to="/about" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'about' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}>
            01 // О Проекте
          </Link>
          <Link to="/dashboard" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'dashboard' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}>
            02 // Панель
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2 font-mono">Библиотека</div>
          <Link to="/" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'search' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}>
            Поиск
          </Link>
          <Link to="/prompts" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'prompts' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}>
            Промпты
          </Link>
          <Link to="/guides" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display transition-all border ${activeItem === 'guides' ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'}`}>
            Гайды
          </Link>
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

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('АНАЛИЗ КОДА');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  const filters = [
    { id: 'all', label: 'Все (12)' },
    { id: 'prompts', label: 'Промпты (5)' },
    { id: 'guides', label: 'Гайды (4)' },
    { id: 'agents', label: 'Агенты (3)' }
  ];

  const tags = [
    { id: 'gpt4', label: 'GPT-4' },
    { id: 'cursor', label: 'Cursor' }
  ];

  const searchResults = [
    {
      type: 'АГЕНТ',
      number: '042',
      title: 'Автономный <span class="bg-[#FFE600] font-bold px-0.5">Анализ Кода</span>',
      description: 'Специализированный агент для глубокого <span class="bg-[#FFE600] font-bold px-0.5">анализа</span> структуры <span class="bg-[#FFE600] font-bold px-0.5">кода</span> и поиска архитектурных изъянов в реальном времени.',
      tags: ['PYTHON', 'LINTER'],
      actionLabel: 'Запустить'
    },
    {
      type: 'ПРОМПТ',
      number: '812',
      title: 'Агент <span class="bg-[#FFE600] font-bold px-0.5">Код</span>-Ревью',
      description: 'Промпт для автоматического ревью <span class="bg-[#FFE600] font-bold px-0.5">кода</span> с фокусом на безопасность и читаемость. Оптимизирован под Claude 3.5.',
      author: { initial: 'D', name: 'Dmitry S.' },
      actionLabel: 'Копировать'
    },
    {
      type: 'ГАЙД',
      number: '009',
      title: 'Визуальный <span class="bg-[#FFE600] font-bold px-0.5">Анализ</span> в Cursor',
      description: 'Руководство по использованию встроенных инструментов <span class="bg-[#FFE600] font-bold px-0.5">анализа</span> для рефакторинга больших legacy проектов.',
      tags: null,
      actionLabel: 'Читать'
    },
    {
      type: 'АГЕНТ',
      number: '056',
      title: 'Sentry <span class="bg-[#FFE600] font-bold px-0.5">Code</span> Bridge',
      description: 'Интеграционный агент для связи ошибок продакшена с автоматическим <span class="bg-[#FFE600] font-bold px-0.5">анализом кода</span> в IDE.',
      tags: ['WEBHOOK'],
      actionLabel: 'Конфиг'
    },
    {
      type: 'ПРОМПТ',
      number: '211',
      title: 'Рефакторинг <span class="bg-[#FFE600] font-bold px-0.5">Кода</span>',
      description: 'Устаревший паттерн для базового <span class="bg-[#FFE600] font-bold px-0.5">анализа</span> сложности алгоритмов.',
      isArchived: true,
      actionLabel: 'Открыть'
    }
  ];

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#E5E5E5]">
      <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 sticky top-0 z-30 border-b border-black">
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-bold text-black tracking-tight uppercase">Результаты Поиска</h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">Запрос: "{searchQuery}"</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black text-black text-xs px-4 py-3 font-mono focus:outline-none uppercase"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-black p-1">
              <svg className="w-3 h-3 text-[#FFE600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
          <Button>JOIN RIG</Button>
        </div>
      </header>

      <div className="px-10 py-6 border-b border-black bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase text-gray-500 mr-2">Фильтры:</span>
          {filters.map((filter) => (
            <FilterChip 
              key={filter.id}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </FilterChip>
          ))}
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          {tags.map((tag) => (
            <FilterChip key={tag.id}>{tag.label}</FilterChip>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold uppercase text-gray-500">Сортировка:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-mono text-[10px] font-bold uppercase border-b border-black focus:outline-none cursor-pointer py-1"
          >
            <option value="relevance">Релевантность</option>
            <option value="popularity">Популярность</option>
            <option value="date">Дата обновления</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 bg-[#F5F5F5]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {searchResults.map((result, index) => (
            <SearchCard key={index} {...result} />
          ))}
          
          <div className="border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 border-2 border-gray-400 flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-400">+</span>
            </div>
            <p className="font-display font-bold text-gray-500 uppercase text-xs mb-2">Не нашли что искали?</p>
            <p className="text-[10px] font-mono text-gray-400 uppercase mb-4">Создайте свой инструмент анализа</p>
            <Button variant="outline" className="border-gray-400 text-gray-400 px-6 py-2 text-[10px] hover:border-black hover:text-black">
              Предложить
            </Button>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-2">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-10 h-10 border border-black bg-white flex items-center justify-center font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors"
          >
            «
          </button>
          {[1, 2, 3].map((page) => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border border-black flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                currentPage === page ? 'bg-black text-[#FFE600]' : 'bg-white hover:bg-black hover:text-white'
              }`}
            >
              {String(page).padStart(2, '0')}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
            className="w-10 h-10 border border-black bg-white flex items-center justify-center font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors"
          >
            »
          </button>
        </div>
      </div>

      <div className="bg-black py-2 px-10 border-t border-[#333] flex justify-between items-center">
        <span className="text-[9px] font-mono text-[#666] uppercase tracking-tighter">Найдено 12 соответствий в базе данных RIG_V3.DB</span>
        <span className="text-[9px] font-mono text-[#FFE600] uppercase tracking-widest animate-pulse">System Live — Query Processed</span>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
          
          :root {
            --bg-void: #E5E5E5;
            --bg-panel: #000000;
            --bg-card: #F0F0F0;
            --bg-hover: #FFE600;
            --text-primary: #000000;
            --text-inverse: #FFFFFF;
            --text-secondary: #404040;
            --text-tertiary: #666666;
            --accent-core: #FFE600;
            --font-display: 'Space Grotesk', sans-serif;
            --font-mono: 'IBM Plex Mono', monospace;
            --font-ui: 'Manrope', sans-serif;
            --border-width: 1px;
            --border-color: #000000;
          }

          body {
            background-color: var(--bg-void);
            color: var(--text-primary);
            font-family: var(--font-ui);
            -webkit-font-smoothing: antialiased;
          }

          .font-display { font-family: var(--font-display); letter-spacing: -0.03em; }
          .font-mono { font-family: var(--font-mono); letter-spacing: -0.02em; }

          @keyframes colorShift {
            0%, 100% { color: #FFE600; text-shadow: 0 0 8px rgba(255, 230, 0, 0.6); }
            25% { color: #B4FF00; }
            50% { color: #00FFB4; }
            75% { color: #B400FF; }
          }

          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
      <div className="h-screen flex overflow-hidden bg-[#E5E5E5]">
        <Routes>
          <Route path="/" element={
            <>
              <Sidebar activeItem="search" />
              <SearchPage />
            </>
          } />
          <Route path="/about" element={
            <>
              <Sidebar activeItem="about" />
              <div className="flex-1 flex items-center justify-center bg-[#E5E5E5]">
                <h1 className="font-display text-4xl font-bold uppercase">О Проекте</h1>
              </div>
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Sidebar activeItem="dashboard" />
              <div className="flex-1 flex items-center justify-center bg-[#E5E5E5]">
                <h1 className="font-display text-4xl font-bold uppercase">Панель</h1>
              </div>
            </>
          } />
          <Route path="/prompts" element={
            <>
              <Sidebar activeItem="prompts" />
              <div className="flex-1 flex items-center justify-center bg-[#E5E5E5]">
                <h1 className="font-display text-4xl font-bold uppercase">Промпты</h1>
              </div>
            </>
          } />
          <Route path="/guides" element={
            <>
              <Sidebar activeItem="guides" />
              <div className="flex-1 flex items-center justify-center bg-[#E5E5E5]">
                <h1 className="font-display text-4xl font-bold uppercase">Гайды</h1>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;