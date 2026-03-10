import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, Item, Location, Room, Suitcase } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// 初始状态
const initialState: AppState = {
  items: [],
  locations: [],
  rooms: [],
  suitcases: [],
  loading: false,
  error: null,
};

// Reducer 函数
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => item.id === action.payload.id ? action.payload : item),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'SET_LOCATIONS':
      return { ...state, locations: action.payload };
    case 'ADD_LOCATION':
      return { ...state, locations: [...state.locations, action.payload] };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        locations: state.locations.map(location => location.id === action.payload.id ? action.payload : location),
      };
    case 'DELETE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter(location => location.id !== action.payload),
      };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room => room.id === action.payload.id ? action.payload : room),
      };
    case 'DELETE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(room => room.id !== action.payload),
      };
    case 'SET_SUITCASES':
      return { ...state, suitcases: action.payload };
    case 'ADD_SUITCASE':
      return { ...state, suitcases: [...state.suitcases, action.payload] };
    case 'UPDATE_SUITCASE':
      return {
        ...state,
        suitcases: state.suitcases.map(suitcase => suitcase.id === action.payload.id ? action.payload : suitcase),
      };
    case 'DELETE_SUITCASE':
      return {
        ...state,
        suitcases: state.suitcases.filter(suitcase => suitcase.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_DATA':
      return { ...initialState };
    default:
      return state;
  }
};

// Context 类型
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addItem: (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateItem: (item: Item) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<void>;
  addRoom: (room: Omit<Room, 'id' | 'created_at'>) => Promise<void>;
  updateRoom: (room: Room) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addLocation: (location: Omit<Location, 'id' | 'created_at'>) => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  addSuitcase: (suitcase: Omit<Suitcase, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSuitcase: (suitcase: Suitcase) => Promise<void>;
  deleteSuitcase: (id: string) => Promise<void>;
  loadData: () => Promise<void>;
}

// 创建 Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider 组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 从 Supabase 加载数据
  const loadData = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'CLEAR_DATA' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // 并行加载所有数据
      const [itemsRes, roomsRes, locationsRes, suitcasesRes] = await Promise.all([
        supabase.from('items').select('*').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*').order('order', { ascending: true }),
        supabase.from('locations').select('*').order('created_at', { ascending: true }),
        supabase.from('suitcases').select('*').order('created_at', { ascending: false }),
      ]);

      // 转换数据格式
      const items: Item[] = (itemsRes.data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        location_id: item.location_id,
        suitcase_id: item.suitcase_id,
        photos: item.photos || [],
        main_photo: item.main_photo,
        tags: item.tags || [],
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      const rooms: Room[] = (roomsRes.data || []).map(room => ({
        id: room.id,
        name: room.name,
        order: room.order || 0,
        created_at: room.created_at,
      }));

      const locations: Location[] = (locationsRes.data || []).map(loc => ({
        id: loc.id,
        name: loc.name,
        room_id: loc.room_id,
        parent_id: loc.parent_id,
        order: loc.order || 0,
        created_at: loc.created_at,
      }));

      const suitcases: Suitcase[] = (suitcasesRes.data || []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        photos: s.photos || [],
        created_at: s.created_at,
        updated_at: s.updated_at,
      }));

      dispatch({ type: 'SET_ITEMS', payload: items });
      dispatch({ type: 'SET_ROOMS', payload: rooms });
      dispatch({ type: 'SET_LOCATIONS', payload: locations });
      dispatch({ type: 'SET_SUITCASES', payload: suitcases });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: '加载数据失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  // 用户登录后加载数据
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      dispatch({ type: 'CLEAR_DATA' });
    }
  }, [user, loadData]);

  // 物品操作
  const addItem = async (itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: '未登录' };

    const { data, error } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        name: itemData.name,
        description: itemData.description,
        category: itemData.category,
        location_id: itemData.location_id,
        suitcase_id: itemData.suitcase_id,
        photos: itemData.photos,
        main_photo: itemData.main_photo,
        tags: itemData.tags,
      })
      .select()
      .single();

    if (error) {
      console.error('添加物品失败:', error);
      return { success: false, error: error.message };
    }

    if (data) {
      const newItem: Item = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: data.category || '',
        location_id: data.location_id,
        suitcase_id: data.suitcase_id,
        photos: data.photos || [],
        main_photo: data.main_photo,
        tags: data.tags || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    }

    return { success: true };
  };

  const updateItem = async (item: Item): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: '未登录' };

    const { error } = await supabase
      .from('items')
      .update({
        name: item.name,
        description: item.description,
        category: item.category,
        location_id: item.location_id,
        suitcase_id: item.suitcase_id,
        photos: item.photos,
        main_photo: item.main_photo,
        tags: item.tags,
      })
      .eq('id', item.id);

    if (error) {
      console.error('更新物品失败:', error);
      return { success: false, error: error.message };
    }

    dispatch({ type: 'UPDATE_ITEM', payload: { ...item, updated_at: new Date().toISOString() } });
    return { success: true };
  };

  const deleteItem = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('items').delete().eq('id', id);

    if (!error) {
      dispatch({ type: 'DELETE_ITEM', payload: id });
    }
  };

  // 房间操作
  const addRoom = async (roomData: Omit<Room, 'id' | 'created_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        user_id: user.id,
        name: roomData.name,
        order: roomData.order,
      })
      .select()
      .single();

    if (!error && data) {
      const newRoom: Room = {
        id: data.id,
        name: data.name,
        order: data.order || 0,
        created_at: data.created_at,
      };
      dispatch({ type: 'ADD_ROOM', payload: newRoom });
    }
  };

  const updateRoom = async (room: Room) => {
    if (!user) return;

    const { error } = await supabase
      .from('rooms')
      .update({ name: room.name, order: room.order })
      .eq('id', room.id);

    if (!error) {
      dispatch({ type: 'UPDATE_ROOM', payload: room });
    }
  };

  const deleteRoom = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('rooms').delete().eq('id', id);

    if (!error) {
      dispatch({ type: 'DELETE_ROOM', payload: id });
    }
  };

  // 位置操作
  const addLocation = async (locationData: Omit<Location, 'id' | 'created_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('locations')
      .insert({
        user_id: user.id,
        name: locationData.name,
        room_id: locationData.room_id,
        parent_id: locationData.parent_id,
        order: locationData.order,
      })
      .select()
      .single();

    if (!error && data) {
      const newLocation: Location = {
        id: data.id,
        name: data.name,
        room_id: data.room_id,
        parent_id: data.parent_id,
        order: data.order || 0,
        created_at: data.created_at,
      };
      dispatch({ type: 'ADD_LOCATION', payload: newLocation });
    }
  };

  const updateLocation = async (location: Location) => {
    if (!user) return;

    const { error } = await supabase
      .from('locations')
      .update({
        name: location.name,
        room_id: location.room_id,
        parent_id: location.parent_id,
        order: location.order,
      })
      .eq('id', location.id);

    if (!error) {
      dispatch({ type: 'UPDATE_LOCATION', payload: location });
    }
  };

  const deleteLocation = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('locations').delete().eq('id', id);

    if (!error) {
      dispatch({ type: 'DELETE_LOCATION', payload: id });
    }
  };

  // 收纳箱操作
  const addSuitcase = async (suitcaseData: Omit<Suitcase, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('suitcases')
      .insert({
        user_id: user.id,
        name: suitcaseData.name,
        description: suitcaseData.description,
        photos: suitcaseData.photos,
      })
      .select()
      .single();

    if (!error && data) {
      const newSuitcase: Suitcase = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        photos: data.photos || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      dispatch({ type: 'ADD_SUITCASE', payload: newSuitcase });
    }
  };

  const updateSuitcase = async (suitcase: Suitcase) => {
    if (!user) return;

    const { error } = await supabase
      .from('suitcases')
      .update({
        name: suitcase.name,
        description: suitcase.description,
        photos: suitcase.photos,
      })
      .eq('id', suitcase.id);

    if (!error) {
      dispatch({ type: 'UPDATE_SUITCASE', payload: { ...suitcase, updated_at: new Date().toISOString() } });
    }
  };

  const deleteSuitcase = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('suitcases').delete().eq('id', id);

    if (!error) {
      dispatch({ type: 'DELETE_SUITCASE', payload: id });
    }
  };

  const value: AppContextType = {
    state,
    dispatch,
    addItem,
    updateItem,
    deleteItem,
    addRoom,
    updateRoom,
    deleteRoom,
    addLocation,
    updateLocation,
    deleteLocation,
    addSuitcase,
    updateSuitcase,
    deleteSuitcase,
    loadData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义 Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};