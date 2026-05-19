# Hướng dẫn cài đặt ACM-ICPC Contest System

## Bước 1: Cài đặt Supabase

1. Vào https://supabase.com → tạo project mới
2. Vào **SQL Editor** → chạy toàn bộ nội dung file `schema.sql`
3. Lấy các key từ **Settings → API**:
   - `URL` → SUPABASE_URL
   - `anon/public` → SUPABASE_ANON_KEY
   - `service_role` → SUPABASE_SERVICE_KEY

## Bước 2: Cấu hình môi trường

```bash
cp .env.example .env
```

Sửa file `.env`:
```
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
ADMIN_PASSWORD=matkhaucuaban
```

## Bước 3: Cài đặt và chạy

```bash
cd contest-system
npm install
npm run dev      # development (nodemon)
# hoặc
npm start        # production
```

Mở trình duyệt: http://localhost:3000

## Bước 4: Cài trình biên dịch (cho judge)

Cần cài để chấm bài:
- **C++**: `g++` (MinGW trên Windows / build-essential trên Linux)
- **Python**: `python3`
- **JavaScript**: `node` (đã có sẵn nếu chạy được server)
- **Java**: `javac` + `java` (JDK)

Nếu không có trình biên dịch, chỉ những ngôn ngữ đã cài mới chấm được.

## Cách sử dụng

### Tạo kỳ thi (Admin)
1. Vào http://localhost:3000/admin/
2. Nhập mật khẩu admin (từ ADMIN_PASSWORD trong .env)
3. Tạo kỳ thi, thêm bài tập, thêm test cases
4. Chia sẻ link http://localhost:3000 cho thí sinh

### Tham gia thi (Thí sinh)
1. Vào http://localhost:3000
2. Chọn kỳ thi đang diễn ra → nhập nickname
3. Chọn bài → viết code → nộp
4. Xem bảng xếp hạng real-time ở tab "Bảng xếp hạng"

## Luật thi ACM-ICPC
- Xếp hạng theo số bài giải được (nhiều hơn = cao hơn)
- Nếu bằng nhau: tổng điểm phạt thấp hơn = cao hơn
- Điểm phạt = (thời gian AC tính từ lúc bắt đầu tính bằng phút) + 20 × (số lần nộp sai trước khi AC)
- Bài không AC không bị phạt

## Cấu trúc thư mục

```
contest-system/
├── server/
│   ├── index.js          # Express server chính
│   ├── supabase.js       # Supabase client (service key)
│   ├── judge/
│   │   └── runner.js     # Engine chấm bài
│   └── routes/
│       ├── auth.js       # Tham gia thi / xác thực
│       ├── contests.js   # API kỳ thi + bảng xếp hạng
│       ├── problems.js   # API bài tập
│       ├── submissions.js# Nộp bài + polling
│       └── admin.js      # Quản lý (có xác thực)
├── public/
│   ├── index.html        # Trang chủ (danh sách thi + join)
│   ├── contest.html      # Trang kỳ thi (bài tập + scoreboard)
│   ├── problem.html      # Trang bài (editor + nộp)
│   └── admin/
│       └── index.html    # Trang quản trị
├── schema.sql            # Schema Supabase (chạy 1 lần)
└── .env                  # Cấu hình (tạo từ .env.example)
```
