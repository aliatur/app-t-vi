# Tử Vi Calculator API

## Mô tả

Web app tính và luận giải lá số Tử Vi Đẩu Số chuẩn xác với kiến trúc 3 layer tách biệt:
- **Calculation Layer**: Xử lý tính toán (lunar-calendar.ts, lunar-hour.ts)
- **Interpretation Layer**: Luận giải (iztro integration)
- **UI Layer**: Giao diện người dùng (API server)

## Đặc điểm nổi bật

### 1. Giờ âm lịch chuẩn TuviGLOBAL
- **KHÔNG** dùng mốc cố định 23h00 như các phần mềm khác
- Giờ Tý thay đổi theo tháng âm lịch do thời điểm Chính Ngọ khác nhau
- Bảng tra giờ chi tiết cho 12 tháng âm lịch

### 2. Chuẩn hóa múi giờ lịch sử Việt Nam
| Giai đoạn | Múi giờ thực tế | Hiệu chỉnh |
|---|---|---|
| Trước 01/01/1943 | GMT+7 | Không đổi |
| 01/01/1943 → 31/03/1945 | GMT+8 | Trừ 1 tiếng |
| 01/04/1945 → 18/08/1945 | GMT+9 | Trừ 2 tiếng |
| 19/08/1945 → 31/12/1959 | GMT+7 | Không đổi |
| 01/01/1960 → 30/04/1975 (Miền Nam) | GMT+8 | Trừ 1 tiếng |
| Từ 01/05/1975 đến nay | GMT+7 | Không đổi |

### 3. Cảnh báo giao điểm chuyển giờ
- Tự động cảnh báo khi giờ sinh cách mốc đầu/cuối khung giờ dưới 15 phút
- Khuyến nghị xác minh lại bằng đối chiếu sự kiện thực tế

## Cài đặt

```bash
npm install
```

## Chạy tests

```bash
npx tsx src/tests/index.test.ts
```

## Khởi động server

```bash
# Build TypeScript
npm run build

# Start server
node dist/api/server.js
```

Hoặc chạy trực tiếp:
```bash
npx tsx src/api/server.ts
```

## API Endpoints

### GET /health
Kiểm tra trạng thái server

### POST /api/calculate
Tính toán lá số tử vi

**Request body:**
```json
{
  "solar_date": "09/06/2009",
  "solar_time": "23:03",
  "birthplace": "Hồ Chí Minh",
  "gender": "male",
  "fullName": "Nguyễn Văn A"
}
```

**Response:**
```json
{
  "solar_datetime": "09/06/2009 23:03",
  "normalized_datetime": "09/06/2009 23:03",
  "lunar_date": {
    "day": 17,
    "month": 5,
    "year": 2009,
    "isLeapMonth": false,
    "can_chi_day": {"stem": "Ất", "branch": "Dậu"},
    "can_chi_month": {"stem": "Canh", "branch": "Ngọ"},
    "can_chi_year": {"stem": "Kỷ", "branch": "Sửu"},
    "weekday": "Thứ Hai"
  },
  "gio_am_lich": "Hợi",
  "gio_range_used": "22h10 – 24h10 (Tháng 5 âm lịch)",
  "warning": null,
  "timezone_adjustment": {
    "original_datetime": "09/06/2009 23:03",
    "normalized_datetime": "09/06/2009 23:03",
    "adjustment_hours": 0,
    "adjustment_reason": null
  }
}
```

### POST /api/validate
Validate input data

### GET /
API documentation

## Authentication (Bring-Your-Own-Key)

Để bật xác thực API key:
```bash
REQUIRE_API_KEY=true node dist/api/server.js
```

Khi đó client cần gửi header:
```
X-API-Key: your-api-key-here
```

## Ví dụ kiểm thử

| Input | Tháng âm lịch | Giờ DL | Giờ âm lịch đúng | Ghi chú |
|---|---|---|---|---|
| 09/06/2009, 23h03, HCM | Tháng 5 AL | 23h03 | **Hợi** (22h10–24h10) | Phần mềm thường gán sai là Tý |
| 15/06/1962, 7h00, Sài Gòn | Bất kỳ | 7h00 (GMT+8) → 6h00 (GMT+7) | Dần | Trừ 1 tiếng vì Miền Nam 1960–1975 |

## Thư viện sử dụng

- **lunar-typescript**: Thư viện âm lịch
- **iztro**: Engine Tử Vi an sao
- **tsx**: TypeScript executor
- **typescript**: TypeScript compiler

## Kiến trúc

```
src/
├── core/               # Calculation Layer
│   ├── lunar-calendar.ts   # Chuyển đổi ngày dương/âm (Hồ Ngọc Đức)
│   ├── lunar-hour.ts       # Tra giờ âm lịch theo tháng (TuviGLOBAL)
│   └── index.ts
├── services/           # Business Logic
│   ├── types.ts            # Type definitions
│   └── calculation-service.ts  # Main calculation logic
├── api/                # UI Layer (REST API)
│   └── server.ts         # HTTP server
└── tests/              # Unit Tests
    └── index.test.ts
```

## License

ISC
