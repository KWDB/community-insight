import { createClient } from '@supabase/supabase-js'

// 兼容两种环境变量命名，确保不用修改现有 .env
const url = process.env.PUBLIC_SUPABASE_URL
const key = process.env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

// 创建前端 Supabase 客户端（仅可调用公开接口）
export const supabase = createClient(url!, key!)
