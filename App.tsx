import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  WorkoutRoutine, 
  DailyLog, 
  Tab, 
  ChatMessage 
} from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Training } from './components/Training';
import { Coach } from './components/Coach';
import { Progress } from './components/Progress';
import { DEFAULT_WORKOUTS, INITIAL_WEIGHT, TARGET_WEIGHT } from './constants';

const App: React.FC = () => {
  // --- State Initialization ---
  
  // 1. User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('p75_user');
    return saved ? JSON.parse(saved) : {
      currentWeight: INITIAL_WEIGHT,
      targetWeight: TARGET_WEIGHT,
      name: 'User'
    };
  });

  // 2. Daily Log (Date keyed logic)
  const todayStr = new Date().toISOString().split('T')[0];
  const [logs, setLogs] = useState<Record<string, DailyLog>>(() => {
    const saved = localStorage.getItem('p75_logs');
    return saved ? JSON.parse(saved) : {};
  });

  // Current day's log accessor
  const currentLog = logs[todayStr] || {
    date: todayStr,
    meals: [],
    waterIntake: 0,
    creatineAmount: 0,
    workoutCompleted: false,
    weight: user.currentWeight
  };

  // 3. Workouts
  const [workouts, setWorkouts] = useState<WorkoutRoutine[]>(() => {
    const saved = localStorage.getItem('p75_workouts');
    return saved ? JSON.parse(saved) : DEFAULT_WORKOUTS;
  });

  // 4. Chat History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('p75_chat');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Navigation
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // --- Persistence Effects ---

  useEffect(() => {
    localStorage.setItem('p75_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('p75_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('p75_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('p75_chat', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // --- Handlers ---

  const handleUpdateLog = (newLog: DailyLog) => {
    setLogs(prev => ({
      ...prev,
      [todayStr]: newLog
    }));
  };

  const handleUpdateWeight = (weight: number, isTarget: boolean = false) => {
    if (isTarget) {
        setUser(prev => ({ ...prev, targetWeight: weight }));
    } else {
        setUser(prev => ({ ...prev, currentWeight: weight }));
        // Also update today's log for chart tracking
        handleUpdateLog({ ...currentLog, weight });
    }
  };

  const handleUpdateWorkout = (updatedRoutine: WorkoutRoutine) => {
    setWorkouts(prev => prev.map(w => w.id === updatedRoutine.id ? updatedRoutine : w));
  };

  const handleNewChatMessage = (msg: ChatMessage) => {
    setChatHistory(prev => [...prev, msg]);
  };

  const handleFinishWorkout = () => {
    handleUpdateLog({
      ...currentLog,
      workoutCompleted: true
    });
  };

  const getHistoryList = () => {
      // Convert logs object to array for charting
      return Object.values(logs).sort((a: DailyLog, b: DailyLog) => a.date.localeCompare(b.date));
  };

  // --- Render ---

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          user={user} 
          log={currentLog} 
          onUpdateLog={handleUpdateLog}
          onUpdateWeight={handleUpdateWeight}
        />
      )}
      
      {activeTab === 'training' && (
        <Training 
          workouts={workouts} 
          onUpdateWorkout={handleUpdateWorkout}
          dailyLog={currentLog}
          onFinishWorkout={handleFinishWorkout}
        />
      )}
      
      {activeTab === 'coach' && (
        <Coach 
          history={chatHistory} 
          onNewMessage={handleNewChatMessage}
          user={user}
        />
      )}

      {activeTab === 'progress' && (
        <Progress 
          user={user}
          history={getHistoryList()}
          workouts={workouts}
        />
      )}
    </Layout>
  );
};

export default App;