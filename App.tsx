import React, { useState, useEffect } from 'react';
import { NeoButton, NeoCard, NeoInput } from './components/NeoComponents';
import { MoodTracker } from './components/MoodTracker';
import { Chatbot } from './components/Chatbot';
import { UserState, MoodAnalysisResult } from './types';
import { Sun, Moon, Smile, Heart, Zap, MessageCircle, Home } from 'lucide-react';

type Tab = 'home' | 'chat';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<UserState>({
    name: '',
    isLoggedIn: false
  });
  const [loginName, setLoginName] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Check system preference on mount
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = () => {
    if (loginName.trim()) {
      setUser({ name: loginName, isLoggedIn: true });
    }
  };

  const handleMoodUpdate = (result: MoodAnalysisResult) => {
    // If result is undefined/null (reset), keep user info but clear mood
    if (!result) {
        setUser(prev => ({ ...prev, currentMood: undefined }));
        return;
    }
    setUser(prev => ({ ...prev, currentMood: result }));
    // Automatically switch to chat to discuss results
    setTimeout(() => setActiveTab('chat'), 1500); 
  };

  const NavTab = ({ id, label, icon: Icon }: { id: Tab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-4 py-2 font-bold border-2 border-black transition-all
        ${activeTab === id 
          ? 'bg-g-blue text-white shadow-[2px_2px_0px_0px_#1a1a1a] translate-x-[1px] translate-y-[1px]' 
          : 'bg-white text-neo-black hover:bg-gray-100 dark:bg-neo-black dark:text-white dark:border-white'
        }
      `}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-neo-black dark:text-white transition-colors duration-300 bg-yellow-50 dark:bg-neo-black">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b-4 border-neo-black dark:border-neo-white bg-white dark:bg-neo-black px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-g-blue border-2 border-black rounded-full flex items-center justify-center cursor-pointer">
              <Smile className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter hidden md:block cursor-pointer">Hum-AI</h1>
          </div>

          {user.isLoggedIn && (
            <div className="flex gap-2 ml-4">
              <NavTab id="home" label="Home" icon={Home} />
              <NavTab id="chat" label="Chat" icon={MessageCircle} />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 border-2 border-black dark:border-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-neo-black"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user.isLoggedIn && (
            <div className="hidden md:block px-4 py-1 bg-g-green text-white border-2 border-black font-bold shadow-[2px_2px_0px_0px_black]">
              {user.name}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 relative overflow-hidden flex flex-col">
        {/* Background Decorations */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-g-red rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-g-blue rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-g-yellow rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

        {!user.isLoggedIn ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] relative z-10">
             <NeoCard className="w-full max-w-md bg-white dark:bg-gray-900 space-y-8 p-8">
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black uppercase tracking-tight">Welcome to Hum-AI</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Your brutally honest yet empathetic mood companion.</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block font-bold mb-2 text-sm uppercase tracking-wider">What should we call you?</label>
                        <NeoInput 
                            placeholder="Enter your name" 
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="text-lg"
                        />
                    </div>
                    <NeoButton variant="primary" className="w-full text-lg" onClick={handleLogin}>
                        Let's Go
                    </NeoButton>
                </div>
                <div className="flex justify-center gap-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center text-xs font-bold gap-1">
                        <div className="w-10 h-10 bg-g-blue rounded border-2 border-black flex items-center justify-center text-white shadow-neo-hover"><Zap size={20}/></div>
                        Fast
                    </div>
                    <div className="flex flex-col items-center text-xs font-bold gap-1">
                        <div className="w-10 h-10 bg-g-red rounded border-2 border-black flex items-center justify-center text-white shadow-neo-hover"><Heart size={20}/></div>
                        Care
                    </div>
                    <div className="flex flex-col items-center text-xs font-bold gap-1">
                        <div className="w-10 h-10 bg-g-yellow rounded border-2 border-black flex items-center justify-center text-white shadow-neo-hover"><Smile size={20}/></div>
                        Fun
                    </div>
                </div>
             </NeoCard>
          </div>
        ) : (
          <div className="relative z-10 flex-1 flex flex-col">
            <div className={`${activeTab === 'home' ? 'block' : 'hidden'} animate-fade-in`}>
              <MoodTracker 
                onMoodAnalyzed={handleMoodUpdate} 
                currentMood={user.currentMood} 
                isDarkMode={isDarkMode}
              />
            </div>
            
            <div className={`${activeTab === 'chat' ? 'flex' : 'hidden'} flex-1 h-full`}>
               <div className="w-full h-[80vh] max-w-5xl mx-auto">
                 <Chatbot 
                   userName={user.name} 
                   isOpen={true} // Always open in tab mode
                   onToggle={(val) => { if(!val) setActiveTab('home'); }}
                   moodContext={user.currentMood}
                   variant="embedded"
                 />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;