// 核心数据模型类型定义

// 物品类型
export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  location_id: string | null;
  suitcase_id: string | null;
  photos: string[];
  main_photo: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// 位置类型
export interface Location {
  id: string;
  name: string;
  parent_id: string | null;
  room_id: string;
  order: number;
  created_at: string;
}

// 房间类型
export interface Room {
  id: string;
  name: string;
  order: number;
  created_at: string;
}

// 行李箱类型
export interface Suitcase {
  id: string;
  name: string;
  description: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

// 状态类型
export interface AppState {
  items: Item[];
  locations: Location[];
  rooms: Room[];
  suitcases: Suitcase[];
  loading: boolean;
  error: string | null;
}

// 动作类型
export type AppAction =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'ADD_LOCATION'; payload: Location }
  | { type: 'UPDATE_LOCATION'; payload: Location }
  | { type: 'DELETE_LOCATION'; payload: string }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'SET_SUITCASES'; payload: Suitcase[] }
  | { type: 'ADD_SUITCASE'; payload: Suitcase }
  | { type: 'UPDATE_SUITCASE'; payload: Suitcase }
  | { type: 'DELETE_SUITCASE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_DATA' };
