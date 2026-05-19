const { createClient } = require('@supabase/supabase-js');

let supabase;

try {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn("⚠️ CẢNH BÁO: Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_KEY. Server sẽ chạy nhưng không thể kết nối Database!");
  }
  
  supabase = createClient(
    process.env.SUPABASE_URL || 'https://mock.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || 'mock_key'
  );
} catch (error) {
  console.error("❌ Lỗi khởi tạo Supabase:", error.message);
}

module.exports = supabase;
