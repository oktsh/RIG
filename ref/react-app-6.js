import React, { useState, useEffect } from 'react';
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

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" style={{ backdropFilter: 'grayscale(1)' }}>
      <div className="w-full max-w-lg p-8 transform scale-100 bg-white border-2 border-black" style={{ boxShadow: '10px 10px 0px #000' }}>
        <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) => {
  const baseClasses = "px-6 py-3 text-xs font-bold border border-black transition-all duration-100";
  const variantClasses = variant === 'primary'
    ? "bg-black text-white hover:bg-[#FFE600] hover:text-black"
    : "bg-transparent text-black hover:bg-black hover:text-white";
  
  const hoverStyle = variant === 'primary' ? {
    boxShadow: '4px 4px 0px #000',
    transform: 'translate(-2px, -2px)'
  } : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className} uppercase`}
      style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}
      onMouseEnter={(e) => {
        if (variant === 'primary' && !disabled) {
          e.currentTarget.style.boxShadow = '4px 4px 0px #000';
          e.currentTarget.style.transform = 'translate(-2px, -2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' && !disabled) {
          e.currentTarget.style.boxShadow = '';
          e.currentTarget.style.transform = '';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const Sidebar = ({ currentPage }) => {
  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col p-0 z-20 border-r border-[#333] bg-black">
      <div className="flex flex-col gap-1 p-6 pb-8 border-b border-[#333]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-white flex items-center justify-center border border-black">
            <div className="w-2 h-2 bg-black"></div>
          </div>
          <div className="text-5xl text-white tracking-tighter" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, animation: 'colorShift 8s ease-in-out infinite' }}>RIG</div>
        </div>
        <div className="text-[9px] text-[#666] leading-tight uppercase tracking-widest mt-2" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          ADMINISTRATION MODULE<br />
          CORE ACCESS LEVEL 0
        </div>
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto py-6 px-4 gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] uppercase tracking-widest text-[#444] px-3 mb-2" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>Управление</div>
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-3 py-3 text-[14px] border transition-all ${
              currentPage === 'admin' 
                ? 'bg-[#FFE600] text-black border-[#FFE600] font-semibold' 
                : 'text-[#888] border-transparent hover:text-white hover:border-[#333]'
            }`}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Пользователи
          </Link>
          <a href="#" className="flex items-center gap-3 px-3 py-3 text-[14px] border border-transparent text-[#888] opacity-50 cursor-not-allowed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Логи системы
          </a>
        </div>
      </nav>

      <div className="mt-auto p-6 border-t border-[#333]">
        <div className="px-3 py-2 border border-[#333] bg-black flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FFE600]"></div>
          <span className="text-[9px] text-[#666] uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>ROOT AUTHENTICATED</span>
        </div>
      </div>
    </aside>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([
    { id: 'RG-881', name: 'Алекс М.', email: 'alex.m@rig.ai', role: 'ADMIN', status: 'ACTIVE' },
    { id: 'RG-742', name: 'Дмитрий С.', email: 'dim@rig.ai', role: 'MODERATOR', status: 'ACTIVE' },
    { id: 'RG-109', name: 'Мария К.', email: 'k.maria@corp.io', role: 'USER', status: 'INACTIVE' },
    { id: 'RG-003', name: 'Игорь В.', email: 'iv@rig.ai', role: 'USER', status: 'ACTIVE' }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Добавить пользователя');
  const [formData, setFormData] = useState({ name: '', email: '', role: 'USER' });
  const [searchTerm, setSearchTerm] = useState('');

  const openAddUserModal = () => {
    setModalTitle('Добавить пользователя');
    setFormData({ name: '', email: '', role: 'USER' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'USER' });
  };

  const saveUser = () => {
    if (!formData.name || !formData.email) return;

    const newUser = {
      id: `RG-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'ACTIVE'
    };

    setUsers([...users, newUser]);
    closeModal();
  };

  const deleteUser = (id) => {
    if (window.confirm('УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ ИЗ БАЗЫ?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const changeRole = (id) => {
    const roles = ['USER', 'MODERATOR', 'ADMIN'];
    setUsers(users.map(user => {
      if (user.id === id) {
        const currentIndex = roles.indexOf(user.role);
        return { ...user, role: roles[(currentIndex + 1) % roles.length] };
      }
      return user;
    }));
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-[#E5E5E5]">
        <header className="h-20 bg-[#E5E5E5] flex items-center justify-between px-10 sticky top-0 z-30 border-b border-black">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-black tracking-tight uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>ПОЛЬЗОВАТЕЛИ</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>Управление доступом и ролями</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="ПОИСК ПО EMAIL..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border border-black text-black text-xs px-4 py-3 focus:outline-none focus:bg-white transition-colors uppercase" 
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              />
            </div>
            <Button onClick={openAddUserModal}>
              + НОВЫЙ ПОЛЬЗОВАТЕЛЬ
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#000 #E5E5E5' }}>
          <div className="bg-white border-t-2 border-l-2 border-black">
            <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1.5fr] text-[10px] font-bold uppercase tracking-widest bg-[#F0F0F0]" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              <div className="p-4 border-r-2 border-b-2 border-black">ID</div>
              <div className="p-4 border-r-2 border-b-2 border-black">ПОЛЬЗОВАТЕЛЬ</div>
              <div className="p-4 border-r-2 border-b-2 border-black">РОЛЬ</div>
              <div className="p-4 border-r-2 border-b-2 border-black">СТАТУС</div>
              <div className="p-4 border-r-2 border-b-2 border-black">ДЕЙСТВИЯ</div>
            </div>

            {filteredUsers.map(user => (
              <div key={user.id} className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1.5fr] font-medium text-sm hover:bg-[#FAFAFA] transition-colors">
                <div className="p-4 border-r-2 border-b-2 border-black text-[11px]" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{user.id}</div>
                <div className="p-4 border-r-2 border-b-2 border-black">
                  <div className="font-bold uppercase">{user.name}</div>
                  <div className="text-[10px] text-gray-500" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{user.email}</div>
                </div>
                <div className="p-4 border-r-2 border-b-2 border-black">
                  <span className={`px-2 py-1 text-[10px] font-bold border border-black ${user.role === 'ADMIN' ? 'bg-[#FFE600]' : 'bg-white'}`}>
                    {user.role}
                  </span>
                </div>
                <div className="p-4 border-r-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{user.status}</span>
                  </div>
                </div>
                <div className="p-4 border-r-2 border-b-2 border-black flex gap-2">
                  <button onClick={() => changeRole(user.id)} className="text-[10px] font-bold underline hover:text-blue-600 uppercase">Роль</button>
                  <button onClick={() => deleteUser(user.id)} className="text-[10px] font-bold underline hover:text-red-600 uppercase">Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>Имя</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border-2 border-black p-3 text-sm font-medium focus:bg-[#FFE600]/10 outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border-2 border-black p-3 text-sm font-medium focus:bg-[#FFE600]/10 outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>Роль</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border-2 border-black p-3 text-sm font-bold uppercase outline-none"
            >
              <option value="USER">Пользователь</option>
              <option value="MODERATOR">Модератор</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button onClick={saveUser} className="flex-1 py-4">СОХРАНИТЬ</Button>
          <Button onClick={closeModal} variant="outline" className="flex-1 py-4">ОТМЕНА</Button>
        </div>
      </Modal>
    </>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      
      body {
        background-color: #E5E5E5;
        color: #000000;
        font-family: 'Manrope', sans-serif;
        -webkit-font-smoothing: antialiased;
        margin: 0;
        padding: 0;
      }

      @keyframes colorShift {
        0%, 100% { color: #FFE600; text-shadow: 0 0 8px rgba(255, 230, 0, 0.4); }
        50% { color: #00E0FF; text-shadow: 0 0 8px rgba(0, 224, 255, 0.4); }
      }

      .custom-scrollbar::-webkit-scrollbar { width: 8px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #E5E5E5; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; }

      * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div className="h-screen flex overflow-hidden" style={customStyles.root}>
        <Sidebar currentPage="admin" />
        <Routes>
          <Route path="/" element={<UserManagementPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;