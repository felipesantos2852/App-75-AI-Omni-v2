import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, BarChart, Bar, ReferenceLine } from 'recharts';
import { UserProfile, DailyLog, WorkoutRoutine } from '../types';
import { Dumbbell, Activity, Utensils } from 'lucide-react';

interface ProgressProps {
  user: UserProfile;
  history: DailyLog[]; // Assuming history is stored in logs for weight tracking
  workouts: WorkoutRoutine[];
}

export const Progress: React.FC<ProgressProps> = ({ user, history, workouts }) => {
  // Flatten exercises for dropdown
  const allExercises = useMemo(() => {
    return workouts.flatMap(w => w.exercises);
  }, [workouts]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    allExercises.length > 0 ? allExercises[0].id : ''
  );

  const selectedExercise = allExercises.find(e => e.id === selectedExerciseId);

  // --- 1. Weight & Nutrition Data ---
  const proteinGoal = Math.round(user.targetWeight * 2); // 2g per kg of target weight or current weight. Usually target for hypertrophy.

  const nutritionData = history.length > 0 ? history.map(log => ({
    name: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    weight: log.weight || user.currentWeight,
    protein: log.meals.reduce((sum, m) => sum + m.macros.protein, 0),
    goal: proteinGoal
  })).slice(-14) : [
    { name: 'Início', weight: 68, protein: 140, goal: proteinGoal },
    { name: 'Hoje', weight: user.currentWeight, protein: 155, goal: proteinGoal }
  ];

  // --- 2. Specific Exercise Load Data ---
  const exerciseData = useMemo(() => {
    if (!selectedExercise || !selectedExercise.history) return [];
    return [...selectedExercise.history]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(h => ({
            name: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            weight: h.weight,
            reps: h.reps
        }));
  }, [selectedExercise]);

  // --- 3. Total Volume Calculation ---
  const parseReps = (repsStr: string): number => {
    if (!repsStr) return 0;
    // Handle ranges "8-12" -> avg 10
    if (repsStr.includes('-')) {
        const [min, max] = repsStr.split('-').map(Number);
        return (min + max) / 2;
    }
    // Handle single numbers "12" or "12 reps"
    const parsed = parseFloat(repsStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  const volumeData = useMemo(() => {
    const volByDate: Record<string, number> = {};

    workouts.forEach(routine => {
        routine.exercises.forEach(ex => {
            if (ex.history) {
                ex.history.forEach(entry => {
                    // Volume = Sets * Reps * Weight
                    // Note: We use the exercise's current 'sets' definition as history doesn't store sets yet.
                    const reps = parseReps(entry.reps);
                    const vol = ex.sets * reps * entry.weight;
                    
                    if (!isNaN(vol) && vol > 0) {
                        if (!volByDate[entry.date]) volByDate[entry.date] = 0;
                        volByDate[entry.date] += vol;
                    }
                });
            }
        });
    });

    return Object.entries(volByDate)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .map(([date, vol]) => ({
            name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            volume: Math.round(vol / 1000) // Convert to Tonnes or keep as kg. Let's keep as kgs but displayed compactly
        }))
        .slice(-10); // Show last 10 active workout days
  }, [workouts]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Evolução</h2>
      
      {/* Weight Chart */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Peso Corporal (Kg)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={nutritionData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#eab308' }}
              />
              <Area type="monotone" dataKey="weight" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Protein Consistency Chart */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Utensils size={14} className="text-blue-500"/> Ingestão de Proteína (g)
        </h3>
        <div className="h-56 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={nutritionData}>
              <defs>
                <linearGradient id="colorProt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}g`, 'Proteína']}
              />
              {/* Reference line for Goal */}
              <ReferenceLine y={proteinGoal} stroke="#eab308" strokeDasharray="3 3" label={{ position: 'top',  value: `Meta: ${proteinGoal}g`, fill: '#eab308', fontSize: 10 }} />
              
              <Area type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Total Volume Chart */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Activity size={14} className="text-purple-400"/> Volume Total (Toneladas)
        </h3>
        {volumeData.length > 0 ? (
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#a855f7' }}
                            formatter={(value: number) => [`${value} Toneladas`, 'Volume']}
                        />
                        <Bar dataKey="volume" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        ) : (
             <div className="h-48 w-full flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded-lg">
                <Activity size={24} className="mb-2 opacity-50"/>
                <span className="text-sm">Sem dados de volume.</span>
                <span className="text-xs mt-1">Complete treinos salvando as cargas.</span>
            </div>
        )}
      </div>

      {/* Exercise Load Chart */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="flex flex-col gap-3 mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Dumbbell size={14}/> Carga por Exercício
            </h3>
            <select 
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="bg-gray-950 text-white text-sm p-2 rounded border border-gray-700 w-full focus:border-yellow-500 outline-none"
            >
                {allExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
            </select>
        </div>

        {exerciseData.length > 0 ? (
            <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin', 'dataMax + 2']} stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill:'#22c55e'}} />
                </LineChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <div className="h-48 w-full flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded-lg">
                <Dumbbell size={24} className="mb-2 opacity-50"/>
                <span className="text-sm">Sem histórico para este exercício.</span>
                <span className="text-xs mt-1">Edite e salve a carga no treino para iniciar.</span>
            </div>
        )}
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
         <p className="text-yellow-500 text-sm font-bold text-center">
            {user.targetWeight - user.currentWeight > 0 
             ? `Faltam ${(user.targetWeight - user.currentWeight).toFixed(1)}kg para a meta` 
             : "Meta atingida! Mantenha a intensidade."}
         </p>
      </div>
    </div>
  );
};