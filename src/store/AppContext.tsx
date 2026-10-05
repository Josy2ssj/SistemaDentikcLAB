import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, Order, Task, InventoryItem, ScheduleEntry, Notification } from '../types';
import { seedData } from '../data/seed';

const STORAGE_KEY = 'dlsy_v5_state';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedData;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

type Action =
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_INVENTORY'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY'; payload: string }
  | { type: 'SET_SCHEDULE'; payload: ScheduleEntry[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'RESET_DATA' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'DELETE_ORDER':
      return { ...state, orders: state.orders.filter(o => o.id !== action.payload) };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'TOGGLE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload ? { ...t, done: !t.done } : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_INVENTORY':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: state.inventory.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INVENTORY':
      return { ...state, inventory: state.inventory.filter(i => i.id !== action.payload) };
    case 'SET_SCHEDULE':
      return { ...state, schedule: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'DELETE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'RESET_DATA':
      return seedData;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  setSchedule: (entries: ScheduleEntry[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => { saveState(state); }, [state]);

  const addOrder = useCallback((order: Order) => dispatch({ type: 'ADD_ORDER', payload: order }), []);
  const updateOrder = useCallback((order: Order) => dispatch({ type: 'UPDATE_ORDER', payload: order }), []);
  const deleteOrder = useCallback((id: string) => dispatch({ type: 'DELETE_ORDER', payload: id }), []);
  const addTask = useCallback((task: Task) => dispatch({ type: 'ADD_TASK', payload: task }), []);
  const toggleTask = useCallback((id: string) => dispatch({ type: 'TOGGLE_TASK', payload: id }), []);
  const deleteTask = useCallback((id: string) => dispatch({ type: 'DELETE_TASK', payload: id }), []);
  const addInventoryItem = useCallback((item: InventoryItem) => dispatch({ type: 'ADD_INVENTORY', payload: item }), []);
  const updateInventoryItem = useCallback((item: InventoryItem) => dispatch({ type: 'UPDATE_INVENTORY', payload: item }), []);
  const deleteInventoryItem = useCallback((id: string) => dispatch({ type: 'DELETE_INVENTORY', payload: id }), []);
  const setSchedule = useCallback((entries: ScheduleEntry[]) => dispatch({ type: 'SET_SCHEDULE', payload: entries }), []);
  const addNotification = useCallback((notification: Notification) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }), []);
  const markNotificationRead = useCallback((id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }), []);
  const deleteNotification = useCallback((id: string) => dispatch({ type: 'DELETE_NOTIFICATION', payload: id }), []);
  const resetData = useCallback(() => dispatch({ type: 'RESET_DATA' }), []);

  return (
    <AppContext.Provider value={{
      state, dispatch, addOrder, updateOrder, deleteOrder,
      addTask, toggleTask, deleteTask,
      addInventoryItem, updateInventoryItem, deleteInventoryItem,
      setSchedule, addNotification, markNotificationRead, deleteNotification, resetData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
