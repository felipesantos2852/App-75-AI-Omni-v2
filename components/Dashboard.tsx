import React, { useState } from 'react';
import { UserProfile, DailyLog, FoodItem } from '../types';
import { analyzeNutrition } from '../services/geminiService';
import { Droplet, Plus, Loader2, Scale, Minus, FlaskConical, Trash2, Edit2, Utensils, Target, Save } from 'lucide-react';
import { DAILY_WATER_GOAL } from '../constants';

interface DashboardProps {
  user: UserProfile;
  log: DailyLog;
  onUpdateLog: (newLog: DailyLog) => void;
  onUpdateWeight: (weight: number, isTarget?: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, log, onUpdateLog, onUpdateWeight }) => {
  const [foodInput, setFoodInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempWeight, setTempWeight] = useState(user.currentWeight.toString());
  const [tempTarget, setTempTarget] = useState(user.targetWeight.toString());
  
  // Manual Entry State
  const [inputMode, setInputMode] = useState<'ai' | 'manual'>('ai');
  const [manualFood, setManualFood] = useState({ name: '', cals: '', protein: '' });

  const handleScanFood = async () => {
    if (!foodInput.trim()) return;
    setIsScanning(true);
    const items = await analyzeNutrition(foodInput);
    
    if (items.length > 0) {
      const updatedMeals = [...log.meals, ...items];
      onUpdateLog({ ...log, meals: updatedMeals });
      setFoodInput('');
    }
    setIsScanning(false);
  };

  const handleManualAdd = () => {
    if (!manualFood.name || !manualFood.cals || !manualFood.protein) return;
    
    const newItem: FoodItem = {
      name: manualFood.name,
      macros: {
        calories: parseInt(manualFood.cals),
        protein: parseInt(manualFood.protein),
        carbs: 0, // Simplified for manual
        fats: 0   // Simplified for manual
      }
    };
    
    onUpdateLog({ ...log, meals: [...log.meals, newItem] });
    setManualFood({ name: '', cals: '', protein: '' });
  };

  const deleteMeal = (index: number) => {
    const updatedMeals = log.meals.filter((_, i) => i !== index);
    onUpdateLog({ ...log, meals: updatedMeals });
  };

  const addWater = () => {
    onUpdateLog({ ...log, waterIntake: log.waterIntake + 250 });
  };

  const adjustCreatine = (delta: number) => {
    const newAmount = Math.max(0, (log.creatineAmount || 0) + delta);
    onUpdateLog({ ...log, creatineAmount: newAmount });
  };

  const saveWeight = () => {
    const w = parseFloat(tempWeight);
    if (!isNaN(w) && w > 0) {
      onUpdateWeight(w, false);
      setEditingWeight(false);
    }
  };

  const saveTarget = () => {
    const w = parseFloat(tempTarget);
    if (!isNaN(w) && w > 0) {
      onUpdateWeight(w, true);
      setEditingTarget(false);
    }
  };

  const totalCalories = log.meals.reduce((sum, item) => sum + item.macros.calories, 0);
  const totalProtein = log.meals.reduce((sum, item) => sum + item.macros.protein, 0);

  const progressPercent = Math.min(100, Math.max(0, ((user.currentWeight - 68) / (user.targetWeight - 68)) * 100));

  return (
    <div className="space-y-6">
      {/* Header / Weight Status */}
      <div className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Projeto 75 <span className="text-yellow-500">Omni</span></h1>
            <p className="text-gray-400 text-sm">Fase de Hipertrofia</p>
          </div>
          <div className="flex flex-col items-end">
            {/* Current Weight */}
            <div onClick={() => setEditingWeight(true)} className="cursor-pointer">
              {editingWeight ? (
                <div className="flex items-center space-x-2 mb-1">
                  <input 
                    type="number" 
                    value={tempWeight} 
                    onChange={(e) => setTempWeight(e.target.value)}
                    className="w-16 bg-gray-800 text-white rounded p-1 text-center text-lg"
                    autoFocus
                  />
                  <button onClick={(e) => { e.stopPropagation(); saveWeight(); }} className="text-green-500"><Plus size={20} className="rotate-45" /></button>
                </div>
              ) : (
                <div className="text-3xl font-bold text-white flex items-center justify-end gap-2">
                   {user.currentWeight} <span className="text-sm font-normal text-gray-500">kg</span>
                   <Scale size={16} className="text-yellow-500 opacity-50"/>
                </div>
              )}
            </div>

            {/* Target Weight */}
            <div onClick={() => setEditingTarget(true)} className="cursor-pointer mt-1">
              {editingTarget ? (
                 <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Meta:</span>
                    <input 
                      type="number" 
                      value={tempTarget} 
                      onChange={(e) => setTempTarget(e.target.value)}
                      className="w-12 bg-gray-800 text-white rounded p-0.5 text-center text-xs"
                      autoFocus
                    />
                    <button onClick={(e) => { e.stopPropagation(); saveTarget(); }} className="text-green-500"><Plus size={14} className="rotate-45" /></button>
                 </div>
              ) : (
                <div className="text-xs text-gray-500 flex items-center gap-1 hover:text-yellow-500 transition-colors">
                    Meta: {user.targetWeight}kg <Edit2 size={10} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Water Tracker */}
        <div 
          onClick={addWater}
          className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <div className="relative mb-2">
             <Droplet className={`w-8 h-8 ${log.waterIntake >= DAILY_WATER_GOAL ? 'text-blue-400' : 'text-blue-600'}`} />
             <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full">
                <Plus size={12} className="text-white"/>
             </div>
          </div>
          <span className="text-lg font-bold text-white">{log.waterIntake}ml</span>
          <span className="text-xs text-gray-500">Meta: {DAILY_WATER_GOAL}ml</span>
        </div>

        {/* Creatine Counter */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
           <div className="flex items-center gap-2 mb-2">
              <FlaskConical className={`w-6 h-6 ${log.creatineAmount >= 3 ? 'text-yellow-500' : 'text-gray-500'}`} />
              <span className="text-xs font-bold text-gray-400 uppercase">Creatina</span>
           </div>
           
           <div className="flex items-center gap-3">
             <button 
               onClick={() => adjustCreatine(-1)}
               className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
             >
               <Minus size={16} />
             </button>
             <span className="text-2xl font-bold text-white w-10 text-center">{log.creatineAmount || 0}<span className="text-xs font-normal text-gray-500">g</span></span>
             <button 
               onClick={() => adjustCreatine(1)}
               className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-yellow-500 hover:text-yellow-400"
             >
               <Plus size={16} />
             </button>
           </div>
        </div>
      </div>

      {/* Nutrition Section */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Scanner Nutricional
            </h2>
            <div className="flex bg-gray-950 rounded-lg p-1">
                <button 
                    onClick={() => setInputMode('ai')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${inputMode === 'ai' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}
                >
                    AI
                </button>
                <button 
                    onClick={() => setInputMode('manual')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${inputMode === 'manual' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}
                >
                    Manual
                </button>
            </div>
        </div>
        
        {/* Input Area */}
        <div className="mb-4">
            {inputMode === 'ai' ? (
                 <div className="flex gap-2">
                    <input 
                        type="text"
                        value={foodInput}
                        onChange={(e) => setFoodInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScanFood()}
                        placeholder='Ex: "2 ovos e 1 fatia de pão"'
                        className="flex-1 bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                    <button 
                        onClick={handleScanFood}
                        disabled={isScanning || !foodInput}
                        className="bg-yellow-500 text-black px-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[3rem]"
                    >
                        {isScanning ? <Loader2 className="animate-spin" /> : <Plus />}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-2 bg-gray-950/50 rounded-xl border border-gray-800">
                    <input 
                        type="text"
                        value={manualFood.name}
                        onChange={(e) => setManualFood({...manualFood, name: e.target.value})}
                        placeholder='Nome do Alimento'
                        className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500"
                    />
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1 mb-1 block">Calorias</label>
                            <input 
                                type="number"
                                value={manualFood.cals}
                                onChange={(e) => setManualFood({...manualFood, cals: e.target.value})}
                                placeholder='0'
                                className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 text-center"
                            />
                        </div>
                        <div className="flex-1">
                             <label className="text-[10px] text-gray-500 uppercase font-bold ml-1 mb-1 block">Proteína (g)</label>
                             <input 
                                type="number"
                                value={manualFood.protein}
                                onChange={(e) => setManualFood({...manualFood, protein: e.target.value})}
                                placeholder='0'
                                className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 text-center"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleManualAdd}
                        className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors"
                    >
                        <Save size={18} />
                        Adicionar ao Diário
                    </button>
                </div>
            )}
        </div>

        {/* Macros Summary */}
        <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Calorias</div>
                <div className="text-xl font-bold text-white">{Math.round(totalCalories)}</div>
            </div>
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Proteína</div>
                <div className="text-xl font-bold text-white">{Math.round(totalProtein)}g</div>
                <div className="text-[10px] text-gray-600">Meta: ~{Math.round(user.targetWeight * 2)}g</div>
            </div>
        </div>

        {/* Food List Header */}
        <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs uppercase font-bold tracking-wider">
            <Utensils size={12} />
            Histórico do Dia (Salvo)
        </div>

        {/* Food List */}
        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
          {log.meals.map((item, idx) => (
            <div key={idx} className="bg-gray-950/50 p-3 rounded-lg border border-gray-800 flex justify-between items-center group">
              <div className="flex flex-col">
                 <span className="text-gray-200 font-medium capitalize text-sm">{item.name}</span>
                 <span className="text-xs text-gray-500">{item.macros.calories} kcal • {item.macros.protein}g Prot</span>
              </div>
              <button 
                onClick={() => deleteMeal(idx)}
                className="text-gray-600 hover:text-red-500 p-2 opacity-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {log.meals.length === 0 && (
            <div className="text-center text-gray-600 py-8 text-sm bg-gray-950/30 rounded-lg border border-dashed border-gray-800">
                Nenhuma refeição registrada hoje.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};