import { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, BarChart3, Settings, 
  Check, X, ChevronLeft, ChevronRight, Trophy, Flame, 
  TrendingUp, Target, Award, Calendar,
  Menu, Cloud, CloudOff, Smartphone, Edit2, Plus, Trash2,
  Lock, Unlock, Eye
} from 'lucide-react';
import { useCloudSync } from './hooks/useCloudSync';
import type { AccessMode, ConfirmModalState, HabitData, HabitModalState } from './types';
import { DEFAULT_HABITS, DAYS_OF_WEEK, EDIT_PIN, MONTHS, YEARS } from './utils/constants';
import { clearStoredData, loadStoredData, loadStoredHabits, saveStoredData, saveStoredHabits } from './utils/storage';

const getHabitColumnWidth = (habit: string) => {
  const textWidth = habit.length * 8;
  return Math.max(76, Math.min(180, textWidth));
};

export default function App() {
  // Access Control State
  const [accessMode, setAccessMode] = useState<AccessMode | null>(() => {
    const storedAccess = sessionStorage.getItem('atomicHabitsAccess');
    return storedAccess === 'view' || storedAccess === 'edit' ? storedAccess : null;
  });
  const [pinInput, setPinInput] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [year, setYear] = useState(new Date().getFullYear());
  const [habits, setHabits] = useState<string[]>(DEFAULT_HABITS);
  const [data, setData] = useState<HabitData>({});
  
  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal States
  const [habitModal, setHabitModal] = useState<HabitModalState>({ isOpen: false, mode: 'add', habitName: '', inputValue: '' });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, action: null, text: '' });
  const { syncStatus, pushToCloud } = useCloudSync({ setData, setHabits });

  // 1. Initial Local Storage Load (Fast UI)
  useEffect(() => {
    const savedData = loadStoredData();
    const savedHabits = loadStoredHabits();
    if (savedData) setData(savedData);
    if (savedHabits) setHabits(savedHabits);
  }, []);

  const toggleHabit = (dateStr: string, habit: string) => {
    setData(prev => {
      const currentDay = prev[dateStr] || {};
      const newData = {
        ...prev,
        [dateStr]: {
          ...currentDay,
          [habit]: !currentDay[habit]
        }
      };
      
      // Save locally instantly for snappy UI
      saveStoredData(newData);
      // Push to cloud in background
      pushToCloud(newData, habits);
      
      return newData;
    });
  };

  const updateNote = (dateStr: string, note: string) => {
    setData(prev => {
      const currentDay = prev[dateStr] || {};
      const newData: HabitData = {
        ...prev,
        [dateStr]: {
          ...currentDay,
          notes: note,
        },
      };

      saveStoredData(newData);
      pushToCloud(newData, habits);

      return newData;
    });
  };

  // Modal Handlers
  const openAddHabitModal = () => setHabitModal({ isOpen: true, mode: 'add', habitName: '', inputValue: '' });
  const openEditHabitModal = (habit: string) => setHabitModal({ isOpen: true, mode: 'edit', habitName: habit, inputValue: habit });
  
  const handleModalSave = () => {
    if (!habitModal.inputValue.trim()) return;
    const newName = habitModal.inputValue.trim();

    if (habitModal.mode === 'add') {
       if (!habits.includes(newName)) {
          const newHabits = [...habits, newName];
          setHabits(newHabits);
          saveStoredHabits(newHabits);
          pushToCloud(data, newHabits);
       }
    } else if (habitModal.mode === 'edit') {
       if (newName !== habitModal.habitName && !habits.includes(newName)) {
          const newHabits = habits.map(h => h === habitModal.habitName ? newName : h);
          
          // Migrate data safely to new habit name
          const newData = { ...data };
          Object.keys(newData).forEach(date => {
              if (newData[date][habitModal.habitName] !== undefined) {
                  newData[date][newName] = newData[date][habitModal.habitName];
                  delete newData[date][habitModal.habitName];
              }
          });

          setHabits(newHabits);
          setData(newData);
          saveStoredHabits(newHabits);
          saveStoredData(newData);
          pushToCloud(newData, newHabits);
       }
    }
    setHabitModal({ isOpen: false, mode: 'add', habitName: '', inputValue: '' });
  };

  const handleModalDelete = () => {
      const newHabits = habits.filter(h => h !== habitModal.habitName);
      setHabits(newHabits);
      saveStoredHabits(newHabits);
      pushToCloud(data, newHabits);
      setHabitModal({ ...habitModal, isOpen: false });
  };

  const handleConfirmAction = () => {
      if (confirmModal.action === 'clear_all') {
          setData({});
          clearStoredData();
          pushToCloud({}, habits);
      }
      setConfirmModal({ isOpen: false, action: null, text: '' });
  };

  const handleAccessSubmit = (mode: AccessMode) => {
    if (mode === 'view') {
      setAccessMode('view');
      sessionStorage.setItem('atomicHabitsAccess', 'view');
    } else if (mode === 'edit') {
      if (pinInput === EDIT_PIN) {
        setAccessMode('edit');
        sessionStorage.setItem('atomicHabitsAccess', 'edit');
        setShowPinPrompt(false);
        setPinError('');
      } else {
        setPinError('Invalid PIN code');
      }
    }
  };

  const handleLogout = () => {
    setAccessMode(null);
    setPinInput('');
    setShowPinPrompt(false);
    sessionStorage.removeItem('atomicHabitsAccess');
  };

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalCompleted = 0;
    let totalMissed = 0;
    let perfectDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const monthlyCompletion = Array(12).fill(0).map(() => ({ total: 0, completed: 0 }));
    const dayOfWeekTotals = Array(7).fill(0).map(() => ({ completed: 0, total: 0 }));
    const habitCompletion: Record<string, { completed: number; total: number }> = {};
    habits.forEach(h => habitCompletion[h] = { completed: 0, total: 0 });

    const daysTracked = Object.keys(data).length;

    // Calculate streaks and totals based on past days up to today
    let checkDate = new Date(year, 0, 1);
    
    while (checkDate <= today && checkDate.getFullYear() === year) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayData = data[dateStr] || {};
      const monthIdx = checkDate.getMonth();
      const dowIdx = checkDate.getDay();
      
      let dailyCompleted = 0;
      let dayTracked = false;

      habits.forEach(habit => {
        monthlyCompletion[monthIdx].total++;
        habitCompletion[habit].total++;
        
        // Only count Day of Week totals if the day is in the past or is today and has some data
        if (checkDate < today || (checkDate.getTime() === today.getTime() && Object.keys(dayData).length > 0)) {
            dayOfWeekTotals[dowIdx].total++;
            dayTracked = true;
        }
        
        if (dayData[habit]) {
          dailyCompleted++;
          totalCompleted++;
          monthlyCompletion[monthIdx].completed++;
          habitCompletion[habit].completed++;
          if(dayTracked) dayOfWeekTotals[dowIdx].completed++;
        } else {
          totalMissed++;
        }
      });

      const dailyScore = habits.length > 0 ? (dailyCompleted / habits.length) * 100 : 0;
      
      if (dailyScore === 100 && habits.length > 0) {
        perfectDays++;
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
      
      checkDate.setDate(checkDate.getDate() + 1);
    }

    // Current Streak Calculation
    let streakCounter = 0;
    let streakCheckDate = new Date();
    streakCheckDate.setHours(0, 0, 0, 0);
    
    while (true) {
      const dateStr = streakCheckDate.toISOString().split('T')[0];
      const dayData = data[dateStr] || {};
      const dailyCompleted = habits.filter(h => dayData[h]).length;
      if (dailyCompleted === habits.length && habits.length > 0) {
        streakCounter++;
        streakCheckDate.setDate(streakCheckDate.getDate() - 1);
      } else {
        if (streakCounter === 0 && streakCheckDate.getTime() === today.getTime()) {
           streakCheckDate.setDate(streakCheckDate.getDate() - 1);
           const yestStr = streakCheckDate.toISOString().split('T')[0];
           const yestData = data[yestStr] || {};
           if (habits.filter(h => yestData[h]).length === habits.length && habits.length > 0) {
               streakCounter++;
               streakCheckDate.setDate(streakCheckDate.getDate() - 1);
               continue;
           }
        }
        break;
      }
    }
    currentStreak = streakCounter;

    // Formatting Graph Data
    const monthlyData = MONTHS.map((month, idx) => ({
      name: month.substring(0, 3),
      completion: monthlyCompletion[idx].total > 0 
        ? Math.round((monthlyCompletion[idx].completed / monthlyCompletion[idx].total) * 100) 
        : 0
    }));

    const habitData = habits.map(habit => ({
      name: habit,
      completion: habitCompletion[habit].total > 0
        ? Math.round((habitCompletion[habit].completed / habitCompletion[habit].total) * 100)
        : 0
    })).sort((a, b) => b.completion - a.completion);

    const dowData = DAYS_OF_WEEK.map((day, idx) => ({
      name: day,
      score: dayOfWeekTotals[idx].total > 0 
        ? Math.round((dayOfWeekTotals[idx].completed / dayOfWeekTotals[idx].total) * 100)
        : 0
    }));

    // Last 14 days trend
    const last14DaysData = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayData = data[dateStr] || {};
        const completed = habits.filter(h => dayData[h]).length;
        last14DaysData.push({
            name: `${d.getMonth()+1}/${d.getDate()}`,
            score: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
        });
    }

    const overallCompletion = (totalCompleted + totalMissed) > 0 
      ? Math.round((totalCompleted / (totalCompleted + totalMissed)) * 100) 
      : 0;

    return {
      totalCompleted,
      totalMissed,
      perfectDays,
      currentStreak,
      longestStreak,
      monthlyData,
      habitData,
      dowData,
      last14DaysData,
      overallCompletion,
      daysTracked,
      bestMonth: [...monthlyData].sort((a, b) => b.completion - a.completion)[0]?.name || 'N/A',
      worstMonth: [...monthlyData].filter(m => m.completion > 0).sort((a, b) => a.completion - b.completion)[0]?.name || 'N/A'
    };
  }, [data, habits, year]);


  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto text-center flex items-center justify-center gap-2">
          Year
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))} 
            className="bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 font-bold text-gray-800"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mb-2 sm:mb-0"><Target size={24} /></div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Completion Rate</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.overallCompletion}%</p>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl mb-2 sm:mb-0"><Check size={24} /></div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalCompleted}</p>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl mb-2 sm:mb-0"><Flame size={24} /></div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Current Streak</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.currentStreak}</p>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl mb-2 sm:mb-0"><Trophy size={24} /></div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Longest Streak</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.longestStreak}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Short Term Trend (Area Chart) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Last 14 Days Momentum</h2>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.last14DaysData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day of Week Performance */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Day of Week Performance</h2>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(value) => [`${value}%`, 'Avg Completion']} />
                <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {stats.dowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#8b5cf6' : entry.score > 40 ? '#a78bfa' : '#c4b5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Monthly Completion Trend</h2>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value}%`, 'Completion']} />
                <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Overall Status</h2>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[ { name: 'Completed', value: stats.totalCompleted }, { name: 'Missed', value: stats.totalMissed } ]} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonth = (monthIndex: number) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const monthName = MONTHS[monthIndex];
    const todayStr = new Date().toISOString().split('T')[0];

    const handlePrevMonth = () => setActiveTab(MONTHS[(monthIndex - 1 + 12) % 12]);
    const handleNextMonth = () => setActiveTab(MONTHS[(monthIndex + 1) % 12]);

    return (
      <div className="flex flex-col min-h-0 h-[calc(100dvh-100px)] sm:h-[calc(100dvh-2rem)] animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={handlePrevMonth} className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"><ChevronLeft size={20}/></button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center flex-1">{monthName} {year}</h1>
            <button onClick={handleNextMonth} className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"><ChevronRight size={20}/></button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center">
            <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded shadow-sm"><div className="w-3 h-3 bg-green-500 rounded-sm"></div><span>Done</span></div>
            <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded shadow-sm"><div className="w-3 h-3 bg-red-400 rounded-sm"></div><span>Missed</span></div>
            <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded shadow-sm"><div className="w-3 h-3 bg-amber-400 rounded-sm"></div><span>Perfect</span></div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto overflow-y-auto flex-1 excel-scroll">
            <table className="w-full text-sm text-left whitespace-nowrap min-w-max">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-20">
                <tr className="h-auto align-bottom">
                  <th className="px-3 py-3 sticky left-0 bg-gray-50 z-30 border-b border-r border-gray-200 shadow-[1px_0_0_0_#e5e7eb] align-bottom">Date</th>
                  <th className="px-3 py-3 sticky left-[55px] sm:left-[60px] bg-gray-50 z-30 border-b border-r border-gray-200 shadow-[1px_0_0_0_#e5e7eb] align-bottom">Day</th>
                  {habits.map(habit => (
                    <th
                      key={habit}
                      onClick={() => accessMode === 'edit' && openEditHabitModal(habit)}
                      className={`border-b border-r border-gray-200 group align-bottom px-2 py-3 ${accessMode === 'edit' ? 'cursor-pointer hover:bg-gray-100' : ''} transition-colors`}
                      style={{ minWidth: `${getHabitColumnWidth(habit)}px`, width: `${getHabitColumnWidth(habit)}px` }}
                      title={accessMode === 'edit' ? `Edit ${habit}` : habit}
                    >
                      <div className="flex min-h-[44px] items-center justify-center gap-1 text-center text-[11px] sm:text-xs font-bold leading-tight text-gray-700 group-hover:text-blue-600 whitespace-normal break-words">
                        <span className="max-w-[90px] sm:max-w-[120px]">{habit}</span>
                        {accessMode === 'edit' && <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />}
                      </div>
                    </th>
                  ))}
                  {accessMode === 'edit' && (
                    <th
                      onClick={openAddHabitModal}
                      className="border-b border-r border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors align-bottom px-2 py-3"
                      style={{ minWidth: '72px', width: '72px' }}
                      title="Add New Habit"
                    >
                      <div className="flex min-h-[44px] items-center justify-center gap-1 text-center text-[11px] sm:text-xs font-bold leading-tight text-blue-600 whitespace-normal">
                        <span>Add</span>
                        <Plus size={14} className="flex-shrink-0"/>
                      </div>
                    </th>
                  )}
                  <th className="px-4 py-3 border-b border-r border-gray-200 text-center align-bottom">% Done</th>
                  <th className="px-4 py-3 border-b border-r border-gray-200 text-center align-bottom">Score</th>
                  <th className="px-4 py-3 border-b border-gray-200 min-w-[200px] align-bottom">Notes</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const date = new Date(year, monthIndex, dayNum);
                  const dateStr = [year, String(monthIndex + 1).padStart(2, '0'), String(dayNum).padStart(2, '0')].join('-');
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  
                  const isToday = dateStr === todayStr;
                  const isPast = date < new Date(new Date().setHours(0,0,0,0));
                  
                  const dayData = data[dateStr] || {};
                  const completedCount = habits.filter(h => dayData[h]).length;
                  const dailyPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
                  
                  let rowClass = "hover:bg-gray-50 border-b border-gray-100 transition-colors";
                  if (isToday) rowClass += " bg-blue-50 outline outline-2 outline-blue-500 outline-offset-[-2px] z-10 relative";
                  else if (dailyPercentage === 100) rowClass += " bg-amber-50/50";

                  return (
                    <tr key={dayNum} className={rowClass}>
                      <td className={`px-3 py-2 font-medium sticky left-0 z-10 border-r border-gray-200 shadow-[1px_0_0_0_#e5e7eb] ${isToday ? 'bg-blue-50' : dailyPercentage === 100 ? 'bg-amber-50' : 'bg-white'}`}>
                        {String(dayNum).padStart(2, '0')}
                      </td>
                      <td className={`px-3 py-2 text-gray-500 sticky left-[55px] sm:left-[60px] z-10 border-r border-gray-200 shadow-[1px_0_0_0_#e5e7eb] ${isToday ? 'bg-blue-50' : dailyPercentage === 100 ? 'bg-amber-50' : 'bg-white'}`}>
                        {dayName}
                      </td>
                      {habits.map(habit => {
                        const isChecked = !!dayData[habit];
                        let cellClass = "cursor-pointer border-r border-gray-200 transition-all text-center p-0 relative group";
                        
                        if (isChecked) cellClass += " bg-green-500 text-white hover:bg-green-600";
                        else if (isPast) cellClass += " bg-red-400/10 hover:bg-red-400/30"; // Missed
                        else cellClass += " hover:bg-gray-100"; // Future

                        return (
                          <td
                            key={habit}
                            className={cellClass}
                            style={{ minWidth: `${getHabitColumnWidth(habit)}px`, width: `${getHabitColumnWidth(habit)}px` }}
                            onClick={() => accessMode === 'edit' && toggleHabit(dateStr, habit)}
                          >
                            <div className="w-full h-full min-h-[40px] flex items-center justify-center">
                              {isChecked && <Check size={18} strokeWidth={3} className="animate-in zoom-in duration-200" />}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-4 py-2 text-center border-r border-gray-200 font-bold w-20">
                        {dailyPercentage}%
                      </td>
                      <td className="px-4 py-2 text-center border-r border-gray-200 w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${dailyPercentage === 100 ? 'bg-amber-400' : dailyPercentage > 50 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                            style={{ width: `${dailyPercentage}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-0 min-w-[200px]">
                        <input 
                          type="text" 
                          className={`w-full h-full min-h-[40px] px-4 py-2 bg-transparent border-none focus:outline-none ${accessMode === 'edit' ? 'focus:ring-1 focus:ring-blue-500 text-gray-600' : 'text-gray-500 cursor-default'}`}
                          placeholder={accessMode === 'edit' ? "Add note..." : ""}
                          value={typeof dayData.notes === 'string' ? dayData.notes : ''}
                          readOnly={accessMode !== 'edit'}
                          onChange={(e) => accessMode === 'edit' && updateNote(dateStr, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => (
    <div className="space-y-6 animate-fadeIn pb-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Detailed Statistics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Award className="mr-2 text-yellow-500" /> Highlights</h3>
           <ul className="space-y-4">
             <li className="flex justify-between items-center pb-2 border-b border-gray-50">
               <span className="text-gray-500">Best Performing Habit</span>
               <span className="font-bold text-green-600 text-right">{stats.habitData[0]?.name || '-'} <br className="sm:hidden"/>({stats.habitData[0]?.completion || 0}%)</span>
             </li>
             <li className="flex justify-between items-center pb-2 border-b border-gray-50">
               <span className="text-gray-500">Worst Performing Habit</span>
               <span className="font-bold text-red-500 text-right">{stats.habitData[stats.habitData.length - 1]?.name || '-'} <br className="sm:hidden"/>({stats.habitData[stats.habitData.length - 1]?.completion || 0}%)</span>
             </li>
             <li className="flex justify-between items-center pb-2 border-b border-gray-50">
               <span className="text-gray-500">Most Consistent Month</span>
               <span className="font-bold text-blue-600">{stats.bestMonth}</span>
             </li>
             <li className="flex justify-between items-center pb-2 border-b border-gray-50">
               <span className="text-gray-500">Total Perfect Days</span>
               <span className="font-bold text-amber-500">{stats.perfectDays} Days</span>
             </li>
           </ul>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><TrendingUp className="mr-2 text-blue-500" /> Top 5 Habits</h3>
           <div className="space-y-3">
             {stats.habitData.slice(0, 5).map((habit, i) => (
               <div key={i} className="flex items-center">
                 <span className="w-6 text-gray-400 font-bold">{i + 1}.</span>
                 <div className="flex-1 text-sm font-medium truncate pr-2">{habit.name}</div>
                 <div className="w-24 sm:w-32 bg-gray-100 rounded-full h-2 mr-3 hidden xs:block">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{width: `${habit.completion}%`}}></div>
                 </div>
                 <span className="font-bold text-sm w-10 text-right">{habit.completion}%</span>
               </div>
             ))}
           </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Habit Ranking (All)</h3>
           <div className="h-[400px] sm:h-96">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.habitData} layout="vertical" margin={{ left: 80, right: 10 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                 <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} />
                 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fill: '#6b7280' }} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value}%`, 'Completion']} />
                 <Bar dataKey="completion" fill="#6366f1" radius={[0, 4, 4, 0]}>
                   {stats.habitData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.completion > 75 ? '#22c55e' : entry.completion > 40 ? '#eab308' : '#ef4444'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
      <div className="space-y-6 animate-fadeIn max-w-3xl pb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Settings</h1>
        
        {/* Sync Status Card */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
             <div className={`p-3 rounded-full text-white ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}>
                {syncStatus === 'synced' ? <Cloud size={24}/> : syncStatus === 'syncing' ? <Cloud size={24}/> : <CloudOff size={24}/>}
             </div>
             <div>
                <h3 className="font-bold text-gray-800">Cloud Sync: {syncStatus.toUpperCase()}</h3>
                <p className="text-sm text-gray-600">Your data is synchronized across mobile and desktop devices.</p>
             </div>
          </div>
          <div className="text-blue-500 hidden sm:block"><Smartphone size={32}/></div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h3 className="text-lg font-bold text-gray-800">Tracked Habits ({habits.length})</h3>
            {accessMode === 'edit' && (
              <button onClick={openAddHabitModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-full sm:w-auto">
                + Add Habit
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {habits.map((habit, i) => (
              <div key={i} className={`flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200 group ${accessMode === 'edit' ? 'hover:border-blue-300 cursor-pointer' : ''} transition-colors`} onClick={() => accessMode === 'edit' && openEditHabitModal(habit)}>
                <span className={`text-sm font-medium text-gray-700 truncate pr-2 ${accessMode === 'edit' ? 'group-hover:text-blue-600' : ''} transition-colors`}>{habit}</span>
                {accessMode === 'edit' && (
                  <button onClick={(e) => { e.stopPropagation(); openEditHabitModal(habit); }} className="text-gray-400 hover:text-blue-500 transition p-1">
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {accessMode === 'edit' && <p className="text-xs text-gray-400 mt-4">* Click any habit to edit or delete it. Keep under 20 for best mobile view.</p>}
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Data Management</h3>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {accessMode === 'edit' && (
              <button 
                onClick={() => setConfirmModal({ isOpen: true, action: 'clear_all', text: "Are you sure you want to clear ALL habit data? This cannot be undone on any device." })}
                className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition text-center"
              >
                Clear All Data
              </button>
            )}
            <button 
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({habits, data}));
                const dlAnchorElem = document.createElement('a');
                dlAnchorElem.setAttribute("href", dataStr);
                dlAnchorElem.setAttribute("download", `habit_tracker_backup_${year}.json`);
                dlAnchorElem.click();
              }}
              className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition text-center"
            >
              Export Offline Backup
            </button>
          </div>
        </div>
      </div>
  );

  // If user hasn't selected a mode yet, show the access landing screen
  if (!accessMode) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 items-center justify-center p-4 selection:bg-blue-500/30 text-slate-200 font-sans relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -z-10"></div>
        
        <div className="flex flex-col items-center mb-8 animate-fadeIn">
           <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-blue-500/50 shadow-[0_0_30px_-5px_rgba(37,99,235,0.3)]">
             <Flame size={32} />
           </div>
           <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Atomic Habits</h1>
           <p className="text-slate-400 text-center max-w-sm">Track your progress, analyze your momentum, and build consistency.</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-700/50 w-full max-w-md shadow-2xl animate-fadeIn relative z-10">
          {!showPinPrompt ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">How would you like to continue?</h2>
              
              <button 
                onClick={() => handleAccessSubmit('view')}
                className="w-full flex items-center p-4 bg-slate-700/50 hover:bg-slate-700 rounded-2xl transition group border border-transparent hover:border-slate-600"
              >
                <div className="p-3 bg-slate-600 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Eye size={20} className="text-blue-300" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white text-lg">View Only</h3>
                  <p className="text-sm text-slate-400">See stats without making changes.</p>
                </div>
                <ChevronRight className="ml-auto text-slate-500 group-hover:text-white transition-colors" />
              </button>

              <button 
                onClick={() => setShowPinPrompt(true)}
                className="w-full flex items-center p-4 bg-blue-600/10 hover:bg-blue-600/20 rounded-2xl transition group border border-blue-500/20 hover:border-blue-500/50"
              >
                <div className="p-3 bg-blue-500/20 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Lock size={20} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-blue-100 text-lg">Edit Access</h3>
                  <p className="text-sm text-blue-300/70">Enter PIN to modify habits.</p>
                </div>
                <ChevronRight className="ml-auto text-blue-500/50 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <button onClick={() => { setShowPinPrompt(false); setPinError(''); }} className="text-slate-400 hover:text-white flex items-center text-sm font-medium transition">
                 <ChevronLeft size={16} className="mr-1"/> Back
              </button>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={20} className="text-slate-300" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Enter Access PIN</h2>
                <p className="text-sm text-slate-400 mb-6">This app is locked to prevent unauthorized edits.</p>
              </div>

              <div>
                <input 
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  placeholder="• • • •"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAccessSubmit('edit')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono placeholder-slate-600"
                />
                {pinError && <p className="text-red-400 text-sm mt-3 text-center animate-pulse">{pinError}</p>}
              </div>

              <button 
                onClick={() => handleAccessSubmit('edit')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex justify-center items-center"
              >
                Unlock Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-dvh bg-gray-100 font-sans selection:bg-blue-100 overflow-hidden relative">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-40">
         <div className="flex items-center space-x-2 text-blue-400 font-bold">
            <Flame size={20} />
            <span>Habits {year}</span>
         </div>
         <div className="flex items-center space-x-4">
            {syncStatus === 'synced' ? <Cloud size={18} className="text-green-400"/> : <CloudOff size={18} className="text-gray-500"/>}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 hover:bg-slate-800 rounded">
                <Menu size={24} />
            </button>
         </div>
      </div>

      {/* Sidebar (Responsive) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-xl 
        transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block">
          <h2 className="text-xl font-bold flex items-center space-x-2 text-blue-400">
            <Flame size={24} />
            <span>Atomic Habits</span>
          </h2>
          <div className="flex items-center justify-between mt-2">
             <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))} 
                className="bg-slate-800 text-slate-200 text-xs rounded border border-slate-700 px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
             {syncStatus === 'synced' ? <Cloud size={14} className="text-green-500" aria-label="Synced to Cloud"/> : <CloudOff size={14} className="text-gray-500" aria-label="Cloud sync offline"/>}
          </div>
          <button onClick={handleLogout} className="mt-4 flex items-center justify-center space-x-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition group">
             {accessMode === 'edit' ? <Unlock size={14} className="group-hover:-translate-y-0.5 transition-transform"/> : <Eye size={14} className="group-hover:text-blue-400 transition-colors"/>}
             <span>{accessMode === 'edit' ? 'Edit Mode' : 'View Only'} <span className="opacity-50 text-xs ml-1">(Exit)</span></span>
          </button>
        </div>
        
        {/* Mobile close button inside sidebar */}
        <div className="p-4 md:hidden flex justify-end border-b border-slate-800">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24}/>
            </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-2 pb-20 md:pb-2 custom-scrollbar-dark">
          <ul className="space-y-1 px-3">
            <li>
              <button 
                onClick={() => { setActiveTab('Dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'Dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <LayoutDashboard size={18} /><span>Dashboard</span>
              </button>
            </li>
            
            <li className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Sheets
            </li>
            
            {MONTHS.map((month, idx) => (
              <li key={month}>
                <button 
                  onClick={() => { setActiveTab(month); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition ${activeTab === month ? 'bg-slate-800 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className={activeTab === month ? 'opacity-100' : 'opacity-50'}/>
                    <span>{month}</span>
                  </div>
                  {new Date().getMonth() === idx && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                </button>
              </li>
            ))}

            <li className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Analysis & System
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('Statistics'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'Statistics' ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <BarChart3 size={18} /><span>Statistics</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('Settings'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'Settings' ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Settings size={18} /><span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-8 bg-gray-50/50 relative h-[calc(100dvh-60px)] md:h-[100dvh] w-full smooth-scroll">
        {activeTab === 'Dashboard' && renderDashboard()}
        {MONTHS.includes(activeTab) && renderMonth(MONTHS.indexOf(activeTab))}
        {activeTab === 'Statistics' && renderStats()}
        {activeTab === 'Settings' && renderSettings()}
      </div>

      {/* Modals Overlay */}
      {habitModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{habitModal.mode === 'add' ? 'Add New Habit' : 'Edit Habit'}</h2>
            <input 
              type="text" 
              autoFocus
              value={habitModal.inputValue} 
              onChange={e => setHabitModal({...habitModal, inputValue: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="e.g., Read 10 Pages..."
              onKeyDown={e => e.key === 'Enter' && handleModalSave()}
            />
            <div className="flex justify-between items-center gap-2">
               {habitModal.mode === 'edit' ? (
                  <button onClick={handleModalDelete} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center transition font-medium">
                    <Trash2 size={18} className="mr-1"/> Delete
                  </button>
               ) : <div></div>}
               <div className="flex gap-2">
                  <button onClick={() => setHabitModal({...habitModal, isOpen: false})} className="text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg transition font-medium">Cancel</button>
                  <button onClick={handleModalSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">Save</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Action</h2>
            <p className="text-gray-600 mb-6">{confirmModal.text}</p>
            <div className="flex justify-end gap-2">
               <button onClick={() => setConfirmModal({isOpen: false, action: null, text: ''})} className="text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg transition font-medium">Cancel</button>
               <button onClick={handleConfirmAction} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
