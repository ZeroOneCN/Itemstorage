import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 请在 Supabase 控制台获取以下信息：
// 1. 进入项目设置 → API
// 2. 复制 URL 到 VITE_SUPABASE_URL
// 3. 复制 anon public key 到 VITE_SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 配置缺失，请检查环境变量');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表类型定义
export interface DbItem {
  id: string;
  user_id: string;
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

export interface DbRoom {
  id: string;
  user_id: string;
  name: string;
  order: number;
  created_at: string;
}

export interface DbLocation {
  id: string;
  user_id: string;
  name: string;
  room_id: string;
  parent_id: string | null;
  order: number;
  created_at: string;
}

export interface DbSuitcase {
  id: string;
  user_id: string;
  name: string;
  description: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}