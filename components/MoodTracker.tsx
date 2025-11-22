import React, { useState, useEffect, useRef } from 'react';
import { analyzeUserMood } from '../services/geminiService';
import { MoodAnalysisResult, ContentSuggestion } from '../types';
import { NeoButton, NeoCard } from './NeoComponents';
import { 
  Music, Activity, BookOpen, Video, 
  Loader2, Sparkles, ArrowRight, Check, ArrowLeft,
  Play, Pause, RotateCcw, X, ExternalLink, Clock
} from 'lucide-react';

interface MoodTrackerProps {
  onMoodAnalyzed: (result: MoodAnalysisResult) => void;
  currentMood?: MoodAnalysisResult;
  isDarkMode: boolean;
}

const MCQ_QUESTIONS = [
  {
    question: "How are you feeling physically right now?",
    options: [
      "Energetic & Charged ⚡", 
      "Tired & Drained 😴", 
      "Tense & Jittery 😬", 
      "Calm & Relaxed 🧘"
    ]
  },
  {
    question: "What is occupying your mind the most?",
    options: [
      "Work / Studies 💼", 
      "Relationships / Social ❤️", 
      "The Future / Uncertainty 🤔", 
      "Nothing specific ✨"
    ]
  },
  {
    question: "How would you describe your current emotion?",
    options: [
      "Joyful / Excited 🤩", 
      "Anxious / Worried 😰", 
      "Sad / Melancholy 🌧️", 
      "Angry / Frustrated 😤",
      "Neutral / Okay 😐"
    ]
  },
  {
    question: "What do you feel like you need right now?",
    options: [
      "A quiet moment 🤫", 
      "Someone to talk to 🗣️", 
      "A distraction 🍿", 
      "Physical movement 🏃"
    ]
  },
  {
    question: "How intense is this feeling (1-10)?",
    options: [
      "Low (1-3) ☁️", 
      "Moderate (4-6) 🌤️", 
      "Strong (7-8) 🌩️", 
      "Overwhelming (9-10) 💥"
    ]
  }
];

// Helper to parse durations like "15 mins", "10:00", "1 hour"
const parseDuration = (durationStr?: string): number => {
  if (!durationStr) return 0;
  // Try "15 mins", "15m"
  let match = durationStr.match(/(\d+)\s*(?:min|m)/i);
  if (match) return parseInt(match[1]) * 60;
  
  // Try "10:00"
  if (durationStr.includes(':')) {
    const parts = durationStr.split(':');
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  
  return 0;
};

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodAnalyzed, currentMood, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(MCQ_QUESTIONS.length).fill(''));
  const [loading, setLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<ContentSuggestion | null>(null);

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < MCQ_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleAnalyze();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Format answers for AI
      const promptText = MCQ_QUESTIONS.map((q, i) => `Question: ${q.question}\nSelected Answer: ${answers[i]}`).join('\n\n');
      const result = await analyzeUserMood(promptText);
      onMoodAnalyzed(result);
    } catch (e) {
      console.error(e);
      alert("Oops! Couldn't analyze that. Try again?");
    } finally {
      setLoading(false);
    }
  };

  const openExternalLink = (suggestion: ContentSuggestion) => {
    let url = '';
    const encodedTitle = encodeURIComponent(suggestion.title + " " + suggestion.description);
    
    switch (suggestion.type) {
        case 'music':
            url = `https://music.youtube.com/search?q=${encodedTitle}`;
            break;
        case 'video':
            url = `https://www.youtube.com/results?search_query=${encodedTitle}`;
            break;
        case 'article':
            url = `https://www.google.com/search?q=${encodedTitle}`;
            break;
        default:
            url = `https://www.google.com/search?q=${encodedTitle}`;
    }
    window.open(url, '_blank');
  };

  const handleSuggestionClick = (suggestion: ContentSuggestion) => {
    if (suggestion.type === 'activity') {
        setActiveSuggestion(suggestion);
    } else {
        openExternalLink(suggestion);
    }
  };

  // Resource Modal Component
  const ResourceModal = () => {
    if (!activeSuggestion) return null;

    const initialTime = parseDuration(activeSuggestion.duration);
    const [timeLeft, setTimeLeft] = useState(initialTime > 0 ? initialTime : 900); // Default 15m
    const [isActive, setIsActive] = useState(false);
    const [journalEntry, setJournalEntry] = useState('');
    
    const isJournal = activeSuggestion.title.toLowerCase().includes('journal') || activeSuggestion.description.toLowerCase().includes('writ');

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border-4 border-neo-black w-full max-w-lg rounded-xl shadow-neo p-6 relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={() => setActiveSuggestion(null)} 
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <X className="text-neo-black dark:text-white" />
                </button>

                <div className="flex items-center gap-3 text-g-blue">
                    <Activity size={28} />
                    <span className="font-bold uppercase tracking-wider text-sm">Activity Session</span>
                </div>

                <h3 className="text-2xl font-black text-neo-black dark:text-white leading-tight pr-8">
                    {activeSuggestion.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                    {activeSuggestion.description}
                </p>

                {/* Timer Section */}
                <div className="bg-gray-50 dark:bg-gray-800 border-2 border-neo-black rounded-xl p-6 flex flex-col items-center gap-4 my-2">
                    <div className="text-5xl font-black tabular-nums text-neo-black dark:text-white tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="flex gap-3">
                        <NeoButton variant={isActive ? 'secondary' : 'success'} onClick={() => setIsActive(!isActive)} className="rounded-full px-6">
                            {isActive ? <Pause size={24} /> : <Play size={24} />}
                        </NeoButton>
                        <NeoButton variant="secondary" onClick={() => { setIsActive(false); setTimeLeft(initialTime > 0 ? initialTime : 900); }} className="rounded-full px-4">
                            <RotateCcw size={20} />
                        </NeoButton>
                    </div>
                </div>

                {isJournal && (
                    <textarea
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        placeholder="Start writing your thoughts here..."
                        className="w-full h-40 p-4 border-2 border-neo-black rounded-xl resize-none bg-yellow-50 dark:bg-gray-800 dark:text-white font-medium focus:outline-none focus:shadow-neo transition-shadow"
                    />
                )}

                <NeoButton variant="primary" onClick={() => setActiveSuggestion(null)} className="w-full justify-center">
                    Complete Session
                </NeoButton>
            </div>
        </div>
    );
  };

  // If mood is already analyzed, show the dashboard (Results View)
  if (currentMood) {
    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in-up space-y-8 pb-12">
          {activeSuggestion && <ResourceModal />}
          
          <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-neo-black dark:text-white">Your Vibe Report</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">Here's what we picked up from your answers.</p>
          </div>

          {/* Mood Dashboard - Fixed Dark Mode Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div 
                className="col-span-1 md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-4 p-8 rounded-2xl border-4 shadow-neo dark:shadow-neo-dark transition-colors duration-300"
                style={{ 
                    backgroundColor: isDarkMode ? '#1a1a1a' : (currentMood.color || '#FBBC05'), 
                    borderColor: currentMood.color || '#FBBC05' 
                }}
             >
                <div className="text-left">
                    <h3 className={`text-3xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-neo-black'}`}>
                        Status: {currentMood.mood}
                    </h3>
                    <p className={`font-bold text-xl mt-3 max-w-3xl leading-relaxed ${isDarkMode ? 'text-white' : 'text-neo-black'}`}>
                        "{currentMood.summary}"
                    </p>
                </div>
                <div className={`
                    px-6 py-4 border-4 font-black text-3xl rounded-full shadow-neo transform rotate-2 whitespace-nowrap
                    ${isDarkMode ? 'bg-gray-800 text-white border-white' : 'bg-white text-neo-black border-neo-black'}
                `}>
                    {currentMood.intensity}/10
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-neo-black dark:text-white flex items-center gap-3">
                <span className="bg-g-green text-white px-3 py-1 text-sm border-2 border-black shadow-neo">PRESCRIPTION</span>
                Curated for your mind
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentMood.suggestions.map((item, idx) => {
                    const icons = {
                        music: <Music className="text-g-blue w-6 h-6" />,
                        activity: <Activity className="text-g-green w-6 h-6" />,
                        article: <BookOpen className="text-g-red w-6 h-6" />,
                        video: <Video className="text-g-yellow w-6 h-6" />
                    };
                    const colors = {
                        music: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                        activity: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                        article: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                        video: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    };
                    // Simplified action text to "Start" for all as per user preference for uniformity
                    const actionText = 'Start';

                    return (
                        <NeoCard key={idx} className={`flex flex-col gap-3 hover:-translate-y-2 transition-transform duration-300 h-full ${colors[item.type]}`}>
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white dark:bg-gray-800 border-2 border-neo-black rounded-lg shadow-sm">
                                    {icons[item.type]}
                                </div>
                                {item.duration && (
                                    <span className="flex items-center gap-1 text-xs font-bold bg-neo-black text-white px-2 py-1 rounded border border-white/20">
                                        <Clock size={12} />
                                        {item.duration}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg leading-tight mb-2 dark:text-white line-clamp-2">{item.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{item.description}</p>
                            </div>
                            <NeoButton 
                                variant="secondary" 
                                className="mt-auto text-sm py-2 flex justify-between items-center group"
                                onClick={() => handleSuggestionClick(item)}
                            >
                                {actionText}
                                {item.type === 'activity' ? (
                                    <Play size={16} className="group-hover:fill-current transition-all" />
                                ) : (
                                    <ExternalLink size={16} />
                                )}
                            </NeoButton>
                        </NeoCard>
                    );
                })}
            </div>
          </div>
          
          <div className="flex justify-center mt-12">
             <button 
               onClick={() => {
                 setAnswers(new Array(MCQ_QUESTIONS.length).fill(''));
                 setCurrentStep(0);
                 onMoodAnalyzed(undefined as any); // Reset mood
               }}
               className="text-gray-500 hover:text-neo-black dark:text-gray-400 dark:hover:text-white underline underline-offset-4 font-bold"
             >
               Start a new check-in
             </button>
          </div>
        </div>
    );
  }

  // Questionnaire View
  return (
    <div className="w-full max-w-3xl mx-auto min-h-[60vh] flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-neo-black dark:text-white mb-2">Mood Check-In</h2>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 border-2 border-neo-black rounded-full overflow-hidden">
            <div 
                className="h-full bg-g-blue transition-all duration-500 ease-out border-r-2 border-neo-black"
                style={{ width: `${((currentStep + 1) / MCQ_QUESTIONS.length) * 100}%` }}
            ></div>
        </div>
        <p className="mt-2 font-bold text-gray-500">Question {currentStep + 1} of {MCQ_QUESTIONS.length}</p>
      </div>

      <NeoCard className="bg-white dark:bg-gray-900 relative overflow-hidden min-h-[400px] flex flex-col">
         <div className="space-y-6 flex-1 flex flex-col">
            <h3 className="text-2xl font-bold text-neo-black dark:text-white leading-tight">
                {MCQ_QUESTIONS[currentStep].question}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
                {MCQ_QUESTIONS[currentStep].options.map((option) => {
                    const isSelected = answers[currentStep] === option;
                    return (
                        <button
                            key={option}
                            onClick={() => handleOptionSelect(option)}
                            className={`
                                text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group
                                ${isSelected 
                                    ? 'bg-neo-black text-white border-neo-black shadow-[4px_4px_0px_0px_#4285F4] dark:bg-white dark:text-neo-black dark:border-white dark:shadow-[4px_4px_0px_0px_#4285F4]' 
                                    : 'bg-white text-neo-black border-neo-black hover:bg-gray-50 hover:translate-x-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            <span className="font-bold text-lg">{option}</span>
                            {isSelected && <Check size={20} className="text-g-blue" />}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100 dark:border-gray-800 mt-auto">
                <button 
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 font-bold px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <ArrowLeft size={20} /> Previous
                </button>

                <NeoButton 
                    variant={currentStep === MCQ_QUESTIONS.length - 1 ? 'success' : 'primary'}
                    onClick={handleNext}
                    disabled={loading || !answers[currentStep]}
                    className="flex items-center gap-2 px-8"
                >
                    {loading ? (
                        <>Thinking <Loader2 className="animate-spin" /></>
                    ) : currentStep === MCQ_QUESTIONS.length - 1 ? (
                        <>Analyze <Sparkles /></>
                    ) : (
                        <>Next <ArrowRight /></>
                    )}
                </NeoButton>
            </div>
         </div>
      </NeoCard>
    </div>
  );
};