export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface FoodItem {
  name: string;
  macros: Macros;
}

export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  meals: FoodItem[];
  waterIntake: number; // in ml
  creatineAmount: number; // in grams (changed from boolean)
  workoutCompleted: boolean;
  weight?: number;
}

export interface ExerciseHistory {
  date: string;
  weight: number;
  reps: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: number; // kg
  description?: string; // Execution instructions
  targetMuscles?: string; // Primary muscle group
  lastUpdated?: number;
  gifUrl?: string; // URL for execution visual
  history?: ExerciseHistory[]; // Historic data
  notes?: string; // User personal notes about execution
}

export interface WorkoutRoutine {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  name: string;
  exercises: Exercise[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserProfile {
  currentWeight: number;
  targetWeight: number;
  height?: number;
  name: string;
}

export type Tab = 'dashboard' | 'training' | 'coach' | 'progress';