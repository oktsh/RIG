import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';

const customStyles = {
  logoAnimated: {
    animation: 'colorShift 8s ease-in-out infinite',
    fontWeight: 900,
    letterSpacing: '-0.05em'
  },
  logoSquareAnimated: {
    animation: 'colorShift 8s ease-in-out infinite'
  }
};

const prompts = [
  {
    id: 1,
    title: "Анализ Конкурентов",
    desc: "Фреймворк глубокого анализа конкурентной среды с фокусом на ценностные предложения и рост.",
    author: "Алекс М.",
    copies: "1,837",
    tags: ["ИССЛЕДОВАНИЕ", "СТРАТЕГИЯ"],
    tech: "GPT-4 / CLAUDE",
    content: "Проведите комплексный анализ конкурентов: изучите их ценностные предложения, стратегии роста, позиционирование на рынке и ключевые преимущества. Определите возможности для дифференциации."
  },
  {
    id: 2,
    title: "Агент Код-Ревью",
    desc: "Автоматическое ревью с фокусом на безопасность, производительность и стандарты команды.",
    author: "Дмитрий С.",
    copies: "1,481",
    tags: ["РАЗРАБОТКА", "КАЧЕСТВО"],
    tech: "CURSOR / COPILOT",
    content: "Проанализируйте код на предмет безопасности, производительности, соответствия стандартам команды и лучшим практикам. Предложите конкретные улучшения с примерами."
  },
  {
    id: 3,
    title: "Сегментация Пользователей",
    desc: "Паттерны сегментации поведенческих данных для продуктового анализа.",
    author: "Мария К.",
    copies: "982",
    tags: ["ПРОДУКТ", "АНАЛИТИКА"],
    tech: "PYTHON / SQL",
    content: "Разработайте модель сегментации пользователей на основе поведенческих данных. Определите ключевые сегменты, их характеристики и потребности для оптимизации продукта."
  },
  {
    id: 4,
    title: "Архитектура Микросервисов",
    desc: "Архитектурные паттерны для масштабируемых распределённых систем.",
    author: "Игорь В.",
    copies: "456",
    tags: ["СИСТЕМА", "АРХИТЕКТУРА"],
    tech: "K8S / DOCKER",
    content: "Спроектируйте архитектуру микросервисов с учетом масштабируемости, отказоустойчивости и независимого развертывания. Определите границы сервисов и коммуникационные паттерны."
  }
];

const guides = [
  {
    id: 1,
    title: "Развертывание RIG с Нуля",
    desc: "Полное руководство по настройке окружения для вайб-кодинга.",
    author: "Алекс М.",
    category: "CLAUDE CODE",
    time: "15 МИН",
    views: "3,245",
    date: "10 ФЕВ"
  },
  {
    id: 2,
    title: "Конфигурация Репозитория",
    desc: "Структура папок, конфигурация агентов и правила Cursor.",
    author: "Дмитрий С.",
    category: "CURSOR",
    time: "10 МИН",
    views: "2,156",
    date: "12 ФЕВ"
  },
  {
    id: 3,
    title: "Единый Журнал Решений",
    desc: "Контекстно-зависимые записи архитектурных решений.",
    author: "Елена П.",
    category: "ОСНОВЫ",
    time: "8 МИН",
    views: "1,834",
    date: "14 ФЕВ"
  },
  {
    id: 4,
    title: "Продвинутые Агенты",
    desc: "Кастомные агенты, MCP серверы, оркестрация рабочих процессов.",
    author: "Игорь В.",
    category: "АГЕНТЫ",
    time: "20 МИН",
    views: "1,245",
    date: "15 ФЕВ"
  }
];

const Sidebar = ({ currentPage }) => {
  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col p-0 z-20 border-r border-[#333] bg-black">
      <div className="flex flex-col gap-1 p-6 pb-8 border-b border-[#333]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-white flex items-center justify-center relative border border-black">
            <div className="w-2 h-2 bg-black logo-square-animated" style={customStyles.logoSquareAnimated}></div>
          </div>
          <div className="text-5xl font-display text-white tracking-tighter logo-animated" style={customStyles.logoAnimated}>RIG</div>
        </div>
        <div className="font-mono text-[9px] text-[#666] leading-tight uppercase tracking-widest mt-2">
          Part Knowledge Base<br />
          Part Magic Wand
        </div>
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto py-6 px-4 gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2 font-mono">Платформа</div>
          
          <Link to="/" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display ${currentPage === 'home' ? 'active' : ''}`}>
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            01 // О Проекте
          </Link>
          
          <Link to="/dashboard" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display ${currentPage === 'dashboard' ? 'active' : ''}`}>
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            02 // Панель
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2 font-mono">Библиотека</div>
          
          <Link to="/prompts" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display ${currentPage === 'prompts' ? 'active' : ''}`}>
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Промпты
          </Link>
          
          <Link to="/guides" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display ${currentPage === 'guides' || currentPage === 'guide-detail' ? 'active' : ''}`}>
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Гайды
          </Link>

          <Link to="/rules-agents" className={`nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display ${currentPage === 'rules-agents' ? 'active' : ''}`}>
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
            Правила и Агенты
          </Link>

          <div className="nav-item flex items-center gap-3 px-3 py-3 text-[14px] font-display text-tertiary cursor-not-allowed opacity-50">
            <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            Инструменты <span className="ml-auto text-[9px] border border-[#333] px-1">ЗАКРЫТО</span>
          </div>
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

const Header = ({ page, onOpenJoinModal }) => {
  const headerConfig = {
    home: { title: 'ПРОДУКТ', subtitle: 'ГЛАВНАЯ', showSearch: false },
    dashboard: { title: 'ПАНЕЛЬ', subtitle: 'ОБЗОР', showSearch: false },
    prompts: { title: 'ПРОМПТЫ', subtitle: 'БИБЛИОТЕКА', showSearch: true },
    guides: { title: 'ГАЙДЫ', subtitle: 'БАЗА ЗНАНИЙ', showSearch: true },
    'guide-detail': { title: 'ГАЙДЫ', subtitle: 'БАЗА ЗНАНИЙ', showSearch: true },
    'rules-agents': { title: 'ПРАВИЛА И АГЕНТЫ', subtitle: 'КОНФИГУРАЦИЯ', showSearch: true }
  };

  const config = headerConfig[page] || headerConfig.home;

  return (
    <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 sticky top-0 z-30 border-b border-black">
      <div className="flex flex-col">
        <h1 className="font-display text-2xl font-bold text-black tracking-tight uppercase">{config.title}</h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">{config.subtitle}</p>
      </div>
      
      <div className="flex items-center gap-6">
        {config.showSearch && (
          <div className="relative w-64">
            <input type="text" placeholder="ПОИСК В БАЗЕ..." className="w-full bg-transparent border border-black text-black text-xs px-4 py-3 font-mono focus:outline-none focus:bg-white transition-colors uppercase" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-black font-bold">⌘K</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button className="btn-outline px-5 py-2.5 text-xs font-bold">Войти</button>
          <button onClick={onOpenJoinModal} className="btn-primary px-5 py-2.5 text-xs font-bold border border-black">JOIN RIG</button>
        </div>
      </div>
    </header>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-12 py-20">
      <div className="flex flex-col text-left mb-24 relative">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1">2025 RELEASE</span>
          <div className="h-[2px] bg-black w-24"></div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">RIG — TOOLS FOR THE VIBE ERA</span>
        </div>
        
        <h1 className="text-[80px] md:text-[100px] font-display font-bold leading-[0.85] text-black mb-10 tracking-tighter uppercase">
          Инструменты<br />
          для <span className="text-[#888]">Вайб</span>-Кодинга
        </h1>
        
        <div className="flex flex-col md:flex-row gap-10 items-start md:items-center border-t-2 border-black pt-10">
          <p className="text-xl text-black font-medium max-w-xl leading-tight font-display">
            Единая оснастка для вайб-кодинга: промпты, гайды, шаблоны проектов и командные AI-инструменты.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary px-10 py-5 text-sm tracking-widest border border-black shadow-[6px_6px_0px_#000]">
            Начать Работу -&gt;
          </button>
        </div>
      </div>

      <div className="mb-20">
        <div className="card-base bg-white border-2 border-black flex flex-col md:flex-row group">
          <div className="flex-1 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r-2 border-black">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-black text-white text-[10px] px-2 py-1 font-mono uppercase font-bold">STARTER KIT</span>
                <span className="font-mono text-[10px] text-black border border-black px-2 py-1 uppercase font-bold">RECOMMENDED</span>
              </div>
              
              <h2 className="text-5xl font-display font-bold text-black mb-6 tracking-tighter leading-none">
                RIG Full-Stack<br />Стартер
              </h2>
              
              <p className="text-lg text-[#444] leading-relaxed mb-8 font-medium">
                Предконфигурированный boilerplate с AI context rules, Tailwind, shadcn/ui. Создан для скорости.
              </p>

              <div className="flex flex-wrap gap-2 mb-10">
                <span className="font-mono text-[10px] bg-[#F0F0F0] border border-black px-3 py-1 text-black font-bold uppercase">NEXT.JS 14</span>
                <span className="font-mono text-[10px] bg-[#F0F0F0] border border-black px-3 py-1 text-black font-bold uppercase">TYPESCRIPT</span>
                <span className="font-mono text-[10px] bg-[#F0F0F0] border border-black px-3 py-1 text-black font-bold uppercase">TAILWIND</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn-primary px-8 py-4 text-xs font-bold border border-black">
                Развернуть
              </button>
              <button className="btn-outline px-8 py-4 text-xs font-bold border border-black">
                GitHub
              </button>
            </div>
          </div>

          <div className="w-full md:w-[40%] bg-[#F5F5F5] relative flex flex-col items-center justify-center p-12 overflow-hidden">
            <div className="w-full h-full border border-black bg-white relative p-4 flex flex-col gap-4 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
              <div className="w-full h-8 border border-black bg-[#E5E5E5] flex items-center px-2 gap-2">
                <div className="w-2 h-2 rounded-full border border-black bg-white"></div>
                <div className="w-2 h-2 rounded-full border border-black bg-white"></div>
              </div>
              <div className="flex-1 border border-black bg-[#FAFAFA] flex items-center justify-center">
                <span className="font-display text-6xl font-bold text-[#DDD]">RIG</span>
              </div>
              <div className="h-16 border border-black bg-[#FFE600] flex items-center justify-center">
                <span className="font-mono text-xs font-bold uppercase">System Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-2 border-l-2 border-black bg-white">
        <div className="card-base p-8 border-r-2 border-b-2 border-black group cursor-pointer hover:bg-[#FFE600] transition-colors duration-0" onClick={() => navigate('/prompts')}>
          <div className="w-10 h-10 border border-black flex items-center justify-center mb-6 bg-white group-hover:bg-black group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <h3 className="font-display text-2xl font-bold mb-3 text-black">Промпты</h3>
          <p className="text-sm text-[#444] font-medium leading-relaxed group-hover:text-black">Готовые промпты для исследований, ревью и архитектуры.</p>
        </div>

        <div className="card-base p-8 border-r-2 border-b-2 border-black group cursor-pointer hover:bg-[#FFE600] transition-colors duration-0" onClick={() => navigate('/guides')}>
          <div className="w-10 h-10 border border-black flex items-center justify-center mb-6 bg-white group-hover:bg-black group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="font-display text-2xl font-bold mb-3 text-black">Гайды</h3>
          <p className="text-sm text-[#444] font-medium leading-relaxed group-hover:text-black">Пошаговые инструкции от настройки до продвинутых агентов.</p>
        </div>

        <div className="card-base p-8 border-r-2 border-b-2 border-black group cursor-pointer hover:bg-[#FFE600] transition-colors duration-0" onClick={() => navigate('/rules-agents')}>
          <div className="w-10 h-10 border border-black flex items-center justify-center mb-6 bg-white group-hover:bg-black group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
          </div>
          <h3 className="font-display text-2xl font-bold mb-3 text-black">Правила и Агенты</h3>
          <p className="text-sm text-[#444] font-medium leading-relaxed group-hover:text-black">Правила контекста и специализированные AI-агенты для разработки.</p>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-12">
      <div className="flex items-end justify-between mb-10 pb-4 border-b-2 border-black">
        <div>
          <h2 className="text-4xl font-display font-bold text-black mb-2 uppercase tracking-tight">Initiate Task</h2>
          <p className="text-[#555] font-mono text-sm uppercase tracking-wide">Select a module to begin operation</p>
        </div>
        <div className="font-display text-6xl font-bold text-[#E0E0E0]">02</div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="bg-white border-2 border-black p-0 group relative hover:-translate-y-1 transition-transform">
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 border border-black bg-[#F5F5F5] flex items-center justify-center text-black">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <span className="font-mono text-xs font-bold bg-[#FFE600] px-2 py-1 border border-black">НАСТРОЙКА</span>
            </div>
            
            <h3 className="text-2xl font-bold text-black mb-2 uppercase">Настройка Окружения</h3>
            <p className="text-sm text-[#444] mb-8 font-medium">Полное развертывание. Репозиторий, агенты, конфигурация CI/CD пайплайна.</p>
            
            <div className="mt-auto pt-6 border-t border-black flex gap-3">
              <button className="btn-primary px-4 py-2 text-xs font-bold uppercase">Начать Гайд</button>
              <button className="btn-outline px-4 py-2 text-xs font-bold uppercase">Доки</button>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-0 group relative hover:-translate-y-1 transition-transform">
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 border border-black bg-[#F5F5F5] flex items-center justify-center text-black">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <span className="font-mono text-xs font-bold bg-[#FFE600] px-2 py-1 border border-black">РАЗРАБОТКА</span>
            </div>
            
            <h3 className="text-2xl font-bold text-black mb-2 uppercase">Вайб-Кодинг</h3>
            <p className="text-sm text-[#444] mb-8 font-medium">AI-ассистированный процесс разработки. Рефакторинг, ревью, генерация.</p>
            
            <div className="mt-auto pt-6 border-t border-black flex gap-3">
              <button onClick={() => navigate('/prompts')} className="btn-primary px-4 py-2 text-xs font-bold uppercase">Смотреть Промпты</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <h3 className="font-display text-xl font-bold text-black mb-6 uppercase border-b-2 border-black inline-block pb-1">Командные Задачи</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#F0F0F0] border border-black p-5 min-h-[140px] flex flex-col hover:bg-white hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer">
              <span className="text-sm font-bold text-black uppercase">Анализ Процессов</span>
              <p className="text-xs text-[#555] mt-2 font-medium">Структурирование и анализ рабочих процессов.</p>
              <div className="mt-auto pt-2">
                <span className="text-[10px] bg-black text-white px-2 py-1 font-mono font-bold">3 ИНСТРУМЕНТА</span>
              </div>
            </div>
            <div className="bg-[#F0F0F0] border border-black p-5 min-h-[140px] flex flex-col hover:bg-white hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer">
              <span className="text-sm font-bold text-black uppercase">Сегментация</span>
              <p className="text-xs text-[#555] mt-2 font-medium">Разбивка задач через AI.</p>
              <div className="mt-auto pt-2">
                <span className="text-[10px] bg-black text-white px-2 py-1 font-mono font-bold">НАБОР ПРОМПТОВ</span>
              </div>
            </div>
            <div className="bg-[#F0F0F0] border border-black p-5 min-h-[140px] flex flex-col hover:bg-white hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer">
              <span className="text-sm font-bold text-black uppercase">Журнал Решений</span>
              <p className="text-xs text-[#555] mt-2 font-medium">Отслеживание истории архитектуры.</p>
              <div className="mt-auto pt-2">
                <span className="text-[10px] bg-black text-white px-2 py-1 font-mono font-bold">ШАБЛОН</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl font-bold text-black mb-6 uppercase border-b-2 border-black inline-block pb-1">События</h3>
          <div className="flex flex-col gap-3">
            <div className="bg-white border border-black p-4 flex items-center gap-4 hover:shadow-[4px_4px_0px_#000] transition-shadow">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <span className="font-mono text-xs text-[#FFE600] font-bold">10/02</span>
              </div>
              <div>
                <div className="text-xs text-black font-bold uppercase">День Код-Ревью</div>
                <div className="text-[10px] text-[#666] font-mono">14:00 • ОНЛАЙН</div>
              </div>
            </div>
            <div className="bg-white border border-black p-4 flex items-center gap-4 hover:shadow-[4px_4px_0px_#000] transition-shadow">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <span className="font-mono text-xs text-[#FFE600] font-bold">12/02</span>
              </div>
              <div>
                <div className="text-xs text-black font-bold uppercase">Вайб-Сессия</div>
                <div className="text-[10px] text-[#666] font-mono">11:00 • КОМНАТА 404</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromptsPage = ({ onOpenPromptModal }) => {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-10">
      <div className="flex gap-0 mb-8 border-b-2 border-black">
        <button className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wide border-r border-white">Все</button>
        {['Исследование', 'Код', 'Архитектура', 'Тестирование', 'Продукт'].map(cat => (
          <button key={cat} className="px-6 py-3 bg-white border-r border-black text-[#444] hover:bg-[#FFE600] hover:text-black text-xs font-bold uppercase tracking-wide transition-colors">{cat}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0 border-t-2 border-l-2 border-black bg-white">
        {prompts.map(prompt => (
          <div key={prompt.id} className="p-8 border-r-2 border-b-2 border-black group flex flex-col relative hover:bg-[#FAFAFA] transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-2">
                {prompt.tags && prompt.tags.map(t => (
                  <span key={t} className="bg-[#F0F0F0] border border-black text-[10px] text-black px-2 py-1 font-mono font-bold uppercase">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-black font-mono font-bold border border-black px-2 py-1 bg-[#FFE600]">
                {prompt.copies} КОПИЙ
              </div>
            </div>

            <h3 className="text-2xl font-bold text-black mb-3 uppercase tracking-tight">{prompt.title}</h3>
            <p className="text-sm text-[#444] mb-6 font-medium line-clamp-2">{prompt.desc}</p>
            
            <div className="text-[10px] font-mono text-[#666] font-bold mb-8 uppercase tracking-widest">{prompt.tech || ''}</div>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-black">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black flex items-center justify-center text-[10px] font-bold text-white">
                  {prompt.author.charAt(0)}
                </div>
                <span className="text-xs font-bold text-black uppercase">{prompt.author}</span>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => onOpenPromptModal(prompt.id)} className="btn-outline text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-2">Открыть</button>
                <button className="btn-primary text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-2">Копировать</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RulesAgentsPage = () => {
  return (
    <div className="max-w-[1000px] mx-auto px-10 py-10">
      <div className="fixed right-10 top-20 text-[200px] font-black text-[#F0F0F0] select-none pointer-events-none -z-10 leading-none font-display uppercase">RIG</div>

      <div className="mb-12 border-b-2 border-black pb-6">
        <h2 className="text-4xl font-bold text-black mb-2 uppercase">Правила Cursor</h2>
        <p className="text-[#555] font-medium">Контекстные правила для AI-ассистентов разработки.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-6">
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 font-mono uppercase">RULESET</span>
            <span className="text-[10px] font-mono font-bold text-black border border-black px-2 py-1">TYPESCRIPT</span>
          </div>
          <h3 className="text-2xl font-bold text-black mb-2 uppercase">React + TypeScript</h3>
          <p className="text-sm text-[#444] mb-6 font-medium">Стандартные правила для функциональных компонентов и хуков.</p>
          <button className="w-full text-[11px] font-bold uppercase tracking-wider bg-[#F5F5F5] border border-black text-black px-4 py-3 hover:bg-[#FFE600] transition-colors">Посмотреть Правила</button>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-6">
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 font-mono uppercase">RULESET</span>
            <span className="text-[10px] font-mono font-bold text-black border border-black px-2 py-1">PYTHON</span>
          </div>
          <h3 className="text-2xl font-bold text-black mb-2 uppercase">Стандарты FastAPI</h3>
          <p className="text-sm text-[#444] mb-6 font-medium">Pydantic v2, асинхронные паттерны и обработка ошибок.</p>
          <button className="w-full text-[11px] font-bold uppercase tracking-wider bg-[#F5F5F5] border border-black text-black px-4 py-3 hover:bg-[#FFE600] transition-colors">Посмотреть Правила</button>
        </div>
      </div>

      <div className="mb-12 border-b-2 border-black pb-6">
        <h2 className="text-4xl font-bold text-black mb-2 uppercase">Начать Задачу</h2>
        <p className="text-[#555] font-mono text-sm uppercase tracking-wide">Выберите модуль для начала работы</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border-2 border-black p-6 flex items-center justify-between group hover:bg-[#FAFAFA]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-black text-white flex items-center justify-center font-mono text-xl font-bold">01</div>
            <div>
              <h3 className="text-xl font-bold text-black mb-1 uppercase">Агент Код-Ревью</h3>
              <p className="text-sm text-[#555] font-medium">Автоматическое ревью с фокусом на безопасность и производительность.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-black border border-black px-2 py-1 bg-[#FFE600] uppercase">АКТИВЕН</span>
        </div>

        <div className="bg-white border-2 border-black p-6 flex items-center justify-between group hover:bg-[#FAFAFA]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white border border-black text-black flex items-center justify-center font-mono text-xl font-bold">02</div>
            <div>
              <h3 className="text-xl font-bold text-black mb-1 uppercase">Агент Документации</h3>
              <p className="text-sm text-[#555] font-medium">Генерация и поддержка документации.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-black border border-black px-2 py-1 bg-[#FFE600] uppercase">АКТИВЕН</span>
        </div>

        <div className="bg-white border-2 border-black p-6 flex items-center justify-between group hover:bg-[#FAFAFA]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white border border-black text-black flex items-center justify-center font-mono text-xl font-bold">03</div>
            <div>
              <h3 className="text-xl font-bold text-black mb-1 uppercase">Генератор Тестов</h3>
              <p className="text-sm text-[#555] font-medium">Создание юнит- и интеграционных тестов.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#666] border border-[#CCC] px-2 py-1 uppercase">БЕТА</span>
        </div>
      </div>
    </div>
  );
};

const GuidesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1000px] mx-auto px-10 py-10">
      <div className="fixed right-10 top-20 text-[200px] font-black text-[#F0F0F0] select-none pointer-events-none -z-10 leading-none font-display uppercase">RIG</div>

      <div className="flex flex-col border-t-2 border-black">
        {guides.map((guide, index) => (
          <div key={guide.id} onClick={() => navigate(`/guides/${guide.id}`)} className="group py-8 border-b border-black cursor-pointer relative hover:bg-white transition-all duration-300 pl-4 pr-4 -mx-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs font-bold text-[#888]">0{index + 1}</span>
                <h3 className="text-3xl font-bold text-black uppercase group-hover:underline decoration-2 underline-offset-4">{guide.title}</h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-black border border-black px-2 py-1 uppercase bg-[#FFE600]">{guide.category}</span>
            </div>
            <p className="text-base text-[#444] mb-6 max-w-2xl font-medium pl-8">{guide.desc}</p>
            
            <div className="flex items-center gap-8 text-[11px] font-mono font-bold text-[#666] pl-8 uppercase">
              <span className="flex items-center gap-2"><svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {guide.time} ЧТЕНИЯ</span>
              <span className="flex items-center gap-2"><svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> {guide.views} ПРОСМОТРОВ</span>
              <span className="text-black">— {guide.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GuideDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = guides.find(g => g.id === parseInt(id));

  if (!guide) {
    return <div className="p-10 text-black font-bold text-xl uppercase">Guide not found</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto px-10 py-12 pb-32">
      <button onClick={() => navigate('/guides')} className="flex items-center gap-2 text-[10px] font-mono font-bold text-black mb-12 hover:underline uppercase tracking-wider">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Назад к Индексу
      </button>

      <div className="mb-12 border-b-2 border-black pb-8">
        <h1 className="text-5xl font-display font-bold text-black mb-8 leading-tight tracking-tight uppercase">{guide.title}</h1>
        
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-black flex items-center justify-center text-[12px] font-bold text-white">
            {guide.author.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-black uppercase">{guide.author}</span>
            <span className="text-[10px] text-[#666] font-mono uppercase font-bold">АВТОР / СОЗДАТЕЛЬ</span>
          </div>
          <div className="ml-auto flex gap-6 text-[10px] font-mono font-bold text-[#666] uppercase">
            <span className="border border-black px-2 py-1 text-black">{guide.date}</span>
            <span className="border border-black px-2 py-1 bg-[#FFE600] text-black">{guide.time} READ</span>
          </div>
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-black font-medium mb-8">Правильная настройка окружения — это 80% успеха при работе с LLM. Этот гайд покрывает подготовку IDE, линтеры и интеграцию AI-ассистентов.</p>
        
        <h2 className="text-3xl mt-12 mb-6 text-black font-bold uppercase">1. Установка и Конфигурация</h2>
        <p className="mb-4">Сначала установите <code className="text-sm font-bold">Cursor</code> или плагин VS Code. Рекомендуем выделенный форк для лучшей интеграции.</p>
        
        <div className="bg-[#F0F0F0] border border-black p-6 my-8 font-mono text-sm relative">
          <div className="absolute top-0 right-0 bg-black text-white text-[9px] px-2 py-1 font-bold uppercase">ТЕРМИНАЛ</div>
          <div className="text-[#666] mb-2 font-bold"># Установка через brew</div>
          <div className="text-black font-bold mb-4">&gt; brew install --cask cursor</div>
          
          <div className="text-[#666] mb-2 font-bold"># Клонирование стартер-кита</div>
          <div className="text-black font-bold">&gt; git clone https://github.com/rig/starter-kit.git</div>
        </div>

        <h2 className="text-3xl mt-12 mb-6 text-black font-bold uppercase">2. Контекстные Правила (.cursorrules)</h2>
        <p className="mb-6">Файл <code className="text-sm font-bold">.cursorrules</code> определяет поведение AI. Критично для консистентности кода команды.</p>
        
        <blockquote className="border-l-4 border-[#FFE600] pl-6 my-8 text-xl font-display font-bold text-black not-italic bg-white p-4 shadow-[4px_4px_0px_#000] border border-black">
          "Хороший промпт в .cursorrules экономит часы PR-ревью."
        </blockquote>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div id="modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black bg-opacity-50" onClick={(e) => e.target.id === 'modal-backdrop' && onClose()}>
      <div id="modal-content" className="w-full max-w-3xl max-h-[85vh] flex flex-col relative transform transition-all duration-300 scale-100 shadow-[8px_8px_0px_#000] bg-white border-2 border-black">
        {children}
      </div>
    </div>
  );
};

const PromptModal = ({ promptId, onClose }) => {
  const prompt = prompts.find(p => p.id === promptId);
  if (!prompt) return null;

  return (
    <>
      <div className="flex items-start justify-between p-8 border-b-2 border-black bg-white">
        <div>
          <div className="flex gap-2 mb-4">
            {prompt.tags && prompt.tags.map(t => (
              <span key={t} className="bg-black text-white text-[10px] font-bold px-2 py-1 font-mono uppercase">{t}</span>
            ))}
          </div>
          <h2 className="text-3xl font-bold text-black uppercase tracking-tight">{prompt.title}</h2>
        </div>
        <button onClick={onClose} className="text-black hover:bg-[#F0F0F0] p-2 border border-transparent hover:border-black transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="p-8 overflow-y-auto max-h-[60vh] bg-[#FAFAFA]">
        <p className="text-base text-black font-medium mb-8 pb-8 border-b border-black border-dashed">{prompt.desc}</p>
        
        <div className="bg-white border border-black p-0 relative group shadow-sm">
          <div className="flex justify-between items-center bg-[#F0F0F0] border-b border-black px-4 py-2">
            <span className="text-[10px] font-mono font-bold uppercase">PROMPT_CONTENT.MD</span>
            <button className="text-[10px] font-mono font-bold text-black border border-black bg-white px-2 py-1 hover:bg-[#FFE600]">КОПИРОВАТЬ</button>
          </div>
          <pre className="font-mono text-[13px] leading-relaxed text-black whitespace-pre-wrap p-6 bg-white">{prompt.content}</pre>
        </div>
      </div>

      <div className="p-6 border-t-2 border-black bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center text-[10px] font-bold text-white">
            {prompt.author.charAt(0)}
          </div>
          <span className="text-xs text-[#555] font-mono font-bold uppercase">ДОБАВЛЕНО {prompt.author}</span>
        </div>
        <button className="btn-primary px-8 py-3 text-xs">ИСПОЛЬЗОВАТЬ ПРОМПТ</button>
      </div>
    </>
  );
};

const JoinModal = ({ onClose, onSuccess }) => {
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    email: '',
    tags: ''
  });

  const handleSubmit = () => {
    if (!selectedContentType) {
      alert('Пожалуйста, выберите тип контента');
      return;
    }

    if (!formData.title || !formData.description || !formData.content || !formData.email) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Пожалуйста, введите корректный email');
      return;
    }

    console.log('Предложение отправлено:', {
      type: selectedContentType,
      ...formData,
      timestamp: new Date().toISOString()
    });

    onSuccess();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="flex items-start justify-between p-8 border-b-2 border-black bg-white">
        <div>
          <div className="flex gap-2 mb-4">
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 font-mono uppercase">ВКЛАД</span>
            <span className="bg-[#FFE600] text-black text-[10px] font-bold px-2 py-1 font-mono uppercase border border-black">СООБЩЕСТВО</span>
          </div>
          <h2 className="text-3xl font-bold text-black uppercase tracking-tight">Предложить Контент</h2>
          <p className="text-sm text-[#555] mt-2 font-medium">Поделитесь своим промптом, агентом, скиллом или гайдом с сообществом</p>
        </div>
        <button onClick={onClose} className="text-black hover:bg-[#F0F0F0] p-2 border border-transparent hover:border-black transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="p-8 overflow-y-auto max-h-[65vh] bg-[#FAFAFA] space-y-6">
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-3">Тип Контента</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { type: 'prompt', label: 'Промпт', icon: '💬' },
              { type: 'agent', label: 'Агент', icon: '🤖' },
              { type: 'skill', label: 'Скилл', icon: '⚡' },
              { type: 'guide', label: 'Гайд', icon: '📖' }
            ].map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setSelectedContentType(type)}
                className={`content-type-btn ${selectedContentType === type ? 'border-4 bg-[#FFE600]' : 'border-2 bg-white'} border-black px-4 py-3 text-xs font-bold uppercase hover:bg-[#FFE600] transition-colors`}
              >
                <div className="text-xl mb-1">{icon}</div>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">Название</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Введите название..."
            className="w-full bg-white border-2 border-black text-black text-sm px-4 py-3 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="3"
            placeholder="Краткое описание вашего предложения..."
            className="w-full bg-white border-2 border-black text-black text-sm px-4 py-3 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-[#FFE600] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">Контент / Код</label>
          <div className="bg-white border-2 border-black">
            <div className="bg-[#F0F0F0] border-b border-black px-4 py-2 flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase">CONTENT.MD</span>
              <span className="text-[9px] font-mono text-[#666]">MARKDOWN / CODE</span>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows="8"
              placeholder="Вставьте ваш промпт, код агента, или содержимое гайда..."
              className="w-full bg-white text-black text-sm px-4 py-3 font-mono focus:outline-none resize-none border-0"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-white border-2 border-black text-black text-sm px-4 py-3 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">Теги <span className="text-[#999] font-normal">(опционально)</span></label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="разработка, python, архитектура..."
            className="w-full bg-white border-2 border-black text-black text-sm px-4 py-3 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>
      </div>

      <div className="p-6 border-t-2 border-black bg-white flex justify-between items-center">
        <div className="text-xs text-[#666] font-mono">
          <span className="font-bold text-black">Примечание:</span> Все предложения проходят модерацию
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline px-6 py-3 text-xs font-bold">Отмена</button>
          <button onClick={handleSubmit} className="btn-primary px-8 py-3 text-xs font-bold">Отправить Предложение</button>
        </div>
      </div>
    </>
  );
};

const SuccessModal = ({ onClose }) => {
  return (
    <>
      <div className="flex items-start justify-between p-8 border-b-2 border-black bg-white">
        <div>
          <div className="flex gap-2 mb-4">
            <span className="bg-[#FFE600] text-black text-[10px] font-bold px-2 py-1 font-mono uppercase border border-black">УСПЕХ</span>
          </div>
          <h2 className="text-3xl font-bold text-black uppercase tracking-tight">Предложение Отправлено!</h2>
        </div>
        <button onClick={onClose} className="text-black hover:bg-[#F0F0F0] p-2 border border-transparent hover:border-black transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="p-16 bg-[#FAFAFA] text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-[#FFE600] border-2 border-black mx-auto mb-8 flex items-center justify-center shadow-[6px_6px_0px_#000]">
          <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        
        <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight">Отлично!</h3>
        <p className="text-base text-[#555] mb-8 font-medium max-w-md leading-relaxed">
          Спасибо за ваш вклад в сообщество RIG. Мы рассмотрим ваше предложение и свяжемся с вами по указанному email.
        </p>

        <div className="bg-white border-2 border-black p-6 mb-8 w-full max-w-md">
          <div className="text-xs font-mono font-bold text-black uppercase tracking-wider mb-2">Что дальше?</div>
          <ul className="text-sm text-[#444] font-medium space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-[#FFE600] font-bold">→</span>
              <span>Модерация в течение 24-48 часов</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFE600] font-bold">→</span>
              <span>Уведомление на email о статусе</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFE600] font-bold">→</span>
              <span>Публикация в библиотеке RIG</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-6 border-t-2 border-black bg-white flex justify-center">
        <button onClick={onClose} className="btn-primary px-10 py-3 text-xs font-bold">
          Вернуться к Платформе
        </button>
      </div>
    </>
  );
};

const AppContent = () => {
  const location = window.location;
  const [modalState, setModalState] = useState({ type: null, data: null });

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/prompts') return 'prompts';
    if (path === '/guides') return 'guides';
    if (path.startsWith('/guides/')) return 'guide-detail';
    if (path === '/rules-agents') return 'rules-agents';
    return 'home';
  };

  const currentPage = getCurrentPage();

  const openPromptModal = (promptId) => {
    setModalState({ type: 'prompt', data: promptId });
  };

  const openJoinModal = () => {
    setModalState({ type: 'join', data: null });
  };

  const closeModal = () => {
    setModalState({ type: null, data: null });
  };

  const handleJoinSuccess = () => {
    setModalState({ type: 'success', data: null });
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#E5E5E5]">
      <Sidebar currentPage={currentPage} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-[#E5E5E5]">
        <Header page={currentPage} onOpenJoinModal={openJoinModal} />
        
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/prompts" element={<PromptsPage onOpenPromptModal={openPromptModal} />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/guides/:id" element={<GuideDetailPage />} />
            <Route path="/rules-agents" element={<RulesAgentsPage />} />
          </Routes>
        </div>
      </main>

      <Modal isOpen={modalState.type !== null} onClose={closeModal}>
        {modalState.type === 'prompt' && <PromptModal promptId={modalState.data} onClose={closeModal} />}
        {modalState.type === 'join' && <JoinModal onClose={closeModal} onSuccess={handleJoinSuccess} />}
        {modalState.type === 'success' && <SuccessModal onClose={closeModal} />}
      </Modal>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const styleContent = `
      @keyframes colorShift {
        0%, 100% { 
          color: #FFE600;
          text-shadow: 0 0 8px rgba(255, 230, 0, 0.6), 0 0 16px rgba(255, 230, 0, 0.3);
        }
        20% { 
          color: #B4FF00;
          text-shadow: 0 0 8px rgba(180, 255, 0, 0.6), 0 0 16px rgba(180, 255, 0, 0.3);
        }
        40% { 
          color: #00FFB4;
          text-shadow: 0 0 8px rgba(0, 255, 180, 0.6), 0 0 16px rgba(0, 255, 180, 0.3);
        }
        60% { 
          color: #00E0FF;
          text-shadow: 0 0 8px rgba(0, 224, 255, 0.6), 0 0 16px rgba(0, 224, 255, 0.3);
        }
        80% { 
          color: #B400FF;
          text-shadow: 0 0 8px rgba(180, 0, 255, 0.6), 0 0 16px rgba(180, 0, 255, 0.3);
        }
      }

      body {
        font-family: 'Manrope', sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      .font-display { 
        font-family: 'Space Grotesk', sans-serif; 
        letter-spacing: -0.03em; 
        font-weight: 500; 
      }
      
      .font-mono { 
        font-family: 'IBM Plex Mono', monospace; 
        letter-spacing: -0.02em; 
      }

      .nav-item {
        position: relative;
        transition: all 0s;
        color: #888;
        border: 1px solid transparent;
      }
      .nav-item:hover { 
        color: #FFFFFF; 
        border: 1px solid #333;
      }
      .nav-item.active {
        background: #FFE600;
        color: #000000;
        border: 1px solid #FFE600;
        font-weight: 600;
      }
      .nav-item svg { stroke-width: 1.5px; }
      .nav-item.active svg { stroke-width: 2px; color: #000000; opacity: 1; }

      .card-base {
        background: #F0F0F0;
        border: 1px solid #000000;
        border-radius: 0;
        transition: all 0.1s ease;
        box-shadow: none;
      }
      .card-base:hover {
        transform: translate(-2px, -2px);
        box-shadow: 4px 4px 0px #000000;
        border-color: #000000;
      }

      .btn-primary {
        background: #000000;
        color: #FFFFFF;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        border-radius: 0;
        border: 1px solid #000000;
        transition: all 0.2s ease;
      }
      .btn-primary:hover {
        background: #FFE600;
        color: #000000;
        box-shadow: 6px 6px 0px #000000;
        transform: translate(-2px, -2px);
      }

      .btn-outline {
        background: transparent;
        color: #000000;
        border: 1px solid #000000;
        font-family: 'Space Grotesk', sans-serif;
        text-transform: uppercase;
        border-radius: 0;
        transition: all 0.2s ease;
      }
      .btn-outline:hover {
        background: #000000;
        color: #FFFFFF;
        box-shadow: 4px 4px 0px rgba(0,0,0,0.15);
        transform: translate(-1px, -1px);
      }

      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #E5E5E5; border-left: 1px solid #000000; }
      ::-webkit-scrollbar-thumb { background: #000000; border-radius: 0; }
      ::-webkit-scrollbar-thumb:hover { background: #404040; }

      ::selection {
        background: #000000;
        color: #FFE600;
      }

      .logo-animated {
        animation: colorShift 8s ease-in-out infinite;
      }

      .logo-square-animated {
        animation: colorShift 8s ease-in-out infinite;
      }
    `;

    const style = document.createElement('style');
    style.textContent = styleContent;
    document.head.appendChild(style);

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(style);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <Router basename="/">
      <AppContent />
    </Router>
  );
};

export default App;