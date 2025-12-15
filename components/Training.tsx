import React, { useState, useEffect } from 'react';
import { WorkoutRoutine, Exercise, DailyLog } from '../types';
import { getAlternativeExercise, suggestNewExercise } from '../services/geminiService';
import { EXERCISE_DB } from '../constants';
import { 
  Clock, RefreshCw, Info, CheckCircle, 
  ChevronUp, BicepsFlexed, Footprints, Target, 
  Dumbbell, Loader2, Replace, List, Plus, Sparkles, StickyNote, Save, Settings
} from 'lucide-react';

interface TrainingProps {
  workouts: WorkoutRoutine[];
  onUpdateWorkout: (workout: WorkoutRoutine) => void;
  dailyLog?: DailyLog;
  onFinishWorkout?: () => void;
}

// Helper to get icon based on string match
const getMuscleIcon = (muscle: string | undefined) => {
  if (!muscle) return <Target size={16} />;
  const m = muscle.toLowerCase();
  if (m.includes('peito') || m.includes('costas') || m.includes('ombro') || m.includes('dorsal')) return <Dumbbell size={16} />;
  if (m.includes('perna') || m.includes('coxa') || m.includes('glúteo') || m.includes('panturrilha')) return <Footprints size={16} />;
  if (m.includes('bíceps') || m.includes('tríceps') || m.includes('braço')) return <BicepsFlexed size={16} />;
  return <Target size={16} />;
};

export const Training: React.FC<TrainingProps> = ({ workouts, onUpdateWorkout, dailyLog, onFinishWorkout }) => {
  const [activeRoutineId, setActiveRoutineId] = useState('A');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  
  // Adding New Exercise State
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isGeneratingExercise, setIsGeneratingExercise] = useState(false);

  const activeRoutine = workouts.find(w => w.id === activeRoutineId) || workouts[0];

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const updateExercise = (exerciseId: string, updates: Partial<Exercise>) => {
    const updatedExercises = activeRoutine.exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    );
    onUpdateWorkout({ ...activeRoutine, exercises: updatedExercises });
  };

  const toggleInfo = (id: string) => {
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
  };

  const handleSwapExerciseAI = async (exercise: Exercise) => {
    if (!exercise.targetMuscles) return;
    setSwappingId(exercise.id);
    
    const newExerciseData = await getAlternativeExercise(exercise.name, exercise.targetMuscles);
    
    if (newExerciseData) {
      updateExercise(exercise.id, {
        name: newExerciseData.name,
        description: newExerciseData.description,
        weight: 0,
        lastUpdated: Date.now()
      });
      showSaveConfirmation();
    }
    setSwappingId(null);
  };

  const handleManualSwap = (exerciseId: string, newName: string) => {
    const newExData = EXERCISE_DB.find(e => e.name === newName);
    if (newExData) {
        updateExercise(exerciseId, {
            name: newExData.name,
            description: newExData.description,
            targetMuscles: newExData.targetMuscles,
            gifUrl: newExData.gifUrl,
            weight: 0 // reset weight
        });
        setEditingExerciseId(null); // Close edit mode
        showSaveConfirmation();
    }
  };

  const showSaveConfirmation = () => {
    setShowSaveFeedback(true);
    setTimeout(() => setShowSaveFeedback(false), 2000);
  };

  const toggleEditMode = (exercise: Exercise) => {
    // If we are currently editing this exercise and clicking to close (Save)
    if (editingExerciseId === exercise.id) {
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Retrieve current history or empty array
        const currentHistory = exercise.history || [];
        
        // Filter out any entry from today to avoid duplicates (replace with newest)
        const historyWithoutToday = currentHistory.filter(h => h.date !== todayStr);
        
        // Create new history entry
        const newEntry = {
            date: todayStr,
            weight: exercise.weight,
            reps: exercise.reps
        };

        // Update exercise with new history
        updateExercise(exercise.id, {
            history: [...historyWithoutToday, newEntry]
        });

        setEditingExerciseId(null);
        showSaveConfirmation();
    } else {
        // Open edit mode
        setEditingExerciseId(exercise.id);
    }
  };

  const handleAddNewExerciseManual = (name: string) => {
    const dbExercise = EXERCISE_DB.find(e => e.name === name);
    if (!dbExercise) return;

    const newExercise: Exercise = {
        id: `${activeRoutineId}-${Date.now()}`,
        name: dbExercise.name,
        targetMuscles: dbExercise.targetMuscles,
        description: dbExercise.description,
        gifUrl: dbExercise.gifUrl,
        sets: 3,
        reps: '10-12',
        weight: 0
    };

    onUpdateWorkout({
        ...activeRoutine,
        exercises: [...activeRoutine.exercises, newExercise]
    });
    setIsAddingExercise(false);
    showSaveConfirmation();
  };

  const handleAddNewExerciseAI = async () => {
    setIsGeneratingExercise(true);
    const existingNames = activeRoutine.exercises.map(e => e.name);
    
    const suggested = await suggestNewExercise(activeRoutine.name, existingNames);
    
    if (suggested) {
        const newExercise: Exercise = {
            id: `${activeRoutineId}-${Date.now()}`,
            name: suggested.name,
            targetMuscles: suggested.targetMuscles,
            description: suggested.description,
            sets: suggested.sets,
            reps: suggested.reps,
            weight: 0,
            gifUrl: `https://placehold.co/600x250/171717/333333?text=${encodeURIComponent(suggested.name)}`
        };

        onUpdateWorkout({
            ...activeRoutine,
            exercises: [...activeRoutine.exercises, newExercise]
        });
        setIsAddingExercise(false);
        showSaveConfirmation();
    }
    setIsGeneratingExercise(false);
  };

  return (
    <div className="space-y-4 pb-12 relative">
      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
        {workouts.map(w => (
          <button
            key={w.id}
            onClick={() => setActiveRoutineId(w.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-colors ${
              activeRoutineId === w.id 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {w.id} - {w.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-2">
         <h2 className="text-xl font-bold text-white mb-1">{activeRoutine.name}</h2>
         <p className="text-gray-400 text-sm">Foco em sobrecarga progressiva.</p>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {activeRoutine.exercises.map(ex => (
          <div key={ex.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group relative transition-all">
            
            {/* Exercise Header / Image Placeholder */}
            <div className="relative h-40 bg-gray-800">
               {/* Visual Indicator of Muscle Group */}
               <div className="absolute top-2 left-2 z-10">
                 <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                    <span className="text-yellow-500">{getMuscleIcon(ex.targetMuscles)}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-200 tracking-wider">
                      {ex.targetMuscles ? ex.targetMuscles.split(',')[0] : 'Geral'}
                    </span>
                 </div>
               </div>

               <img 
                 src={ex.gifUrl || `https://placehold.co/600x250/171717/333333?text=${encodeURIComponent(ex.name)}`} 
                 alt={ex.name}
                 className="w-full h-full object-cover opacity-80"
               />
               
               <div className="absolute bottom-0 left-0 p-3 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent w-full flex justify-between items-end">
                 <h3 className="text-lg font-bold text-white max-w-[60%] leading-tight drop-shadow-md">{ex.name}</h3>
                 
                 <div className="flex gap-2">
                   {/* Swap Button AI */}
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleSwapExerciseAI(ex); }}
                    disabled={swappingId === ex.id}
                    className="bg-gray-800/80 p-2 rounded-full text-blue-400 hover:text-blue-300 hover:bg-gray-700 backdrop-blur-sm border border-white/5 transition-all"
                    title="Trocar exercício (IA)"
                   >
                     {swappingId === ex.id ? <Loader2 size={18} className="animate-spin" /> : <Replace size={18} />}
                   </button>

                   {/* Info Button */}
                   <button 
                    onClick={(e) => { e.stopPropagation(); toggleInfo(ex.id); }}
                    className="bg-gray-800/80 p-2 rounded-full text-gray-300 hover:text-white backdrop-blur-sm border border-white/5"
                   >
                     {expandedExerciseId === ex.id ? <ChevronUp size={18} /> : <Info size={18} />}
                   </button>
                 </div>
               </div>
               
               {/* Edit Button */}
               <button 
                onClick={() => toggleEditMode(ex)}
                className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm z-10 transition-colors ${
                    editingExerciseId === ex.id 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                    : 'bg-black/50 text-gray-300 hover:text-white'
                }`}
               >
                 {editingExerciseId === ex.id ? <Save size={16} /> : <Settings size={16} />}
               </button>
            </div>

            {/* Expanded Info Section */}
            {expandedExerciseId === ex.id && (
              <div className="bg-gray-800/50 p-4 border-b border-gray-800 text-sm animate-in fade-in slide-in-from-top-2">
                {ex.targetMuscles && (
                  <div className="mb-2">
                    <span className="text-yellow-500 font-bold uppercase text-xs">Músculos:</span>
                    <span className="text-gray-300 ml-2">{ex.targetMuscles}</span>
                  </div>
                )}
                {ex.description && (
                  <div>
                    <span className="text-yellow-500 font-bold uppercase text-xs">Execução:</span>
                    <p className="text-gray-300 mt-1 leading-relaxed">{ex.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Content / Edit Mode */}
            <div className="p-4">
              {editingExerciseId === ex.id ? (
                <div className="space-y-4">
                    {/* Manual Swap Selector */}
                    <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                        <label className="block text-xs text-yellow-500 mb-2 uppercase font-bold flex items-center gap-2">
                             <List size={14}/> Trocar Exercício
                        </label>
                        <select 
                            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 text-sm"
                            onChange={(e) => handleManualSwap(ex.id, e.target.value)}
                            value=""
                        >
                            <option value="" disabled>Selecionar alternativa...</option>
                            {EXERCISE_DB
                                .filter(dbEx => !ex.targetMuscles || dbEx.targetMuscles?.includes(ex.targetMuscles.split(',')[0]) || dbEx.targetMuscles?.includes(ex.targetMuscles.split(' ')[0]))
                                .map(dbEx => (
                                    <option key={dbEx.name} value={dbEx.name}>
                                        {dbEx.name}
                                    </option>
                            ))}
                            <option disabled>--- Todos ---</option>
                            {EXERCISE_DB.map(dbEx => (
                                <option key={dbEx.name} value={dbEx.name}>{dbEx.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <label className="block text-gray-500 mb-1">Séries</label>
                            <input 
                            type="number" 
                            value={ex.sets} 
                            onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) })}
                            className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Reps</label>
                            <input 
                            type="text" 
                            value={ex.reps} 
                            onChange={(e) => updateExercise(ex.id, { reps: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Kg</label>
                            <input 
                            type="number" 
                            value={ex.weight} 
                            onChange={(e) => updateExercise(ex.id, { weight: parseFloat(e.target.value) })}
                            className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                            />
                        </div>
                    </div>
                    
                    {/* Notes Field (Editable) */}
                    <div>
                        <label className="block text-gray-500 mb-1 text-xs flex items-center gap-1">
                            <StickyNote size={12} /> Anotações / Sensação
                        </label>
                        <textarea
                            value={ex.notes || ''}
                            onChange={(e) => updateExercise(ex.id, { notes: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm focus:border-yellow-500 outline-none"
                            rows={2}
                            placeholder="Ex: Senti desconforto no ombro, aumentar carga prox..."
                        />
                    </div>
                </div>
              ) : (
                <div>
                    <div className="flex justify-between items-center">
                    <div className="flex space-x-6">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white leading-none">{ex.sets}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Séries</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white leading-none">{ex.reps}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Reps</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-yellow-500 leading-none">{ex.weight}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Kg Carga</span>
                        </div>
                    </div>
                    
                    {/* Quick Timer Trigger */}
                    <button 
                        onClick={() => startRestTimer(90)}
                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-yellow-500 transition-colors"
                    >
                        <Clock size={20} />
                    </button>
                    </div>

                    {/* Notes Display (View Mode) */}
                    {ex.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-800/50 flex gap-2 items-start text-gray-400">
                             <StickyNote size={14} className="mt-0.5 text-yellow-500/70 flex-shrink-0" />
                             <p className="text-xs italic leading-relaxed">{ex.notes}</p>
                        </div>
                    )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Add New Exercise Section */}
        {isAddingExercise ? (
           <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-white flex items-center gap-2"><Plus size={16}/> Adicionar Exercício</h3>
               <button onClick={() => setIsAddingExercise(false)} className="text-gray-500 hover:text-white text-xs uppercase">Cancelar</button>
             </div>
             
             <div className="grid grid-cols-1 gap-3">
               {/* Option 1: AI */}
               <button 
                 onClick={handleAddNewExerciseAI}
                 disabled={isGeneratingExercise}
                 className="w-full bg-gradient-to-r from-purple-900 to-blue-900 border border-blue-800 p-3 rounded-lg flex items-center justify-center gap-2 text-blue-100 font-bold hover:brightness-110 transition-all"
               >
                 {isGeneratingExercise ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                 Sugestão Inteligente (IA)
               </button>

               <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-800"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-600 text-xs">OU MANUAL</span>
                  <div className="flex-grow border-t border-gray-800"></div>
               </div>

               {/* Option 2: Manual */}
               <select 
                    className="w-full bg-gray-950 text-white p-3 rounded-lg border border-gray-800 text-sm focus:border-yellow-500 outline-none"
                    onChange={(e) => handleAddNewExerciseManual(e.target.value)}
                    value=""
                >
                    <option value="" disabled>Escolher do Banco de Dados...</option>
                    {EXERCISE_DB.map(dbEx => (
                        <option key={dbEx.name} value={dbEx.name}>{dbEx.name} ({dbEx.targetMuscles?.split(',')[0]})</option>
                    ))}
                </select>
             </div>
           </div>
        ) : (
          <button 
            onClick={() => setIsAddingExercise(true)}
            className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={18} />
            Adicionar Exercício
          </button>
        )}
      </div>
      
      {/* Finish Workout Button */}
      {onFinishWorkout && (
        <button
          onClick={onFinishWorkout}
          disabled={dailyLog?.workoutCompleted}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            dailyLog?.workoutCompleted 
              ? 'bg-green-900/30 text-green-500 border border-green-800'
              : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 active:scale-95'
          }`}
        >
          {dailyLog?.workoutCompleted ? (
            <>
              <CheckCircle size={24} />
              Treino Concluído
            </>
          ) : (
            <>
              <CheckCircle size={24} />
              Finalizar Treino
            </>
          )}
        </button>
      )}

      {/* Floating Timer */}
      {isTimerRunning && (
        <div className="fixed bottom-20 right-4 bg-yellow-500 text-black px-6 py-3 rounded-full shadow-lg shadow-yellow-500/20 font-bold flex items-center gap-3 z-40 animate-bounce-short">
          <Clock size={20} />
          <span className="text-lg font-mono">
            {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
          </span>
          <button onClick={() => setIsTimerRunning(false)} className="bg-black/10 p-1 rounded-full ml-1">
             <RefreshCw size={14} />
          </button>
        </div>
      )}

      {/* Save Feedback Toast */}
      {showSaveFeedback && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-900/90 text-green-200 px-4 py-2 rounded-full border border-green-700 shadow-xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-4">
             <CheckCircle size={16} />
             <span className="text-sm font-bold">Alterações Salvas</span>
        </div>
      )}
    </div>
  );
};