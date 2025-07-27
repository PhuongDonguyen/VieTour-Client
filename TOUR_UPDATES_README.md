# Tour Management Updates

## Các cập nhật đã thực hiện

### 1. Sửa lỗi TourView

- **Vấn đề**: Lỗi `Cannot read properties of undefined (reading 'name')` khi `tour_category` là `undefined`
- **Giải pháp**: Thêm null safety checks cho tất cả các thuộc tính có thể undefined:
  - `tour.tour_category?.name || "Unknown Category"`
  - `tour.slug || "No slug"`
  - `tour.provider?.business_name || tour.provider_id || "Unknown Provider"`

### 2. Cập nhật TourEditor

- **Thêm TinyMCE Editor**: Sử dụng `TinyMCEEditor` cho `destination_intro` và `tour_info` thay vì `Textarea`
- **Di chuyển Tour Schedule**: Đưa phần "Tour Schedule" lên trên phần "Tour Description"
- **Cải thiện UX**: TinyMCE cho phép định dạng rich text cho mô tả tour

### 3. Cập nhật AdminTour Interface

- **Thêm slug field**: Để tương thích với ProviderTour interface
- **Cải thiện type safety**: Đảm bảo tất cả các field cần thiết đều có trong interface

## Cách sử dụng

### TourView (Xem chi tiết tour)

```
URL: /admin/tours/view/{tour_id}
```

- Hiển thị thông tin chi tiết tour
- Thống kê performance (views, bookings, rating)
- Quick actions để quản lý prices, schedules, images
- Null safety cho tất cả các field

### TourEditor (Tạo/Chỉnh sửa tour)

```
URL: /admin/tours/new (tạo mới)
URL: /admin/tours/edit/{tour_id} (chỉnh sửa)
```

- Form đầy đủ với validation
- TinyMCE cho rich text editing
- Upload hình ảnh với preview
- Tour schedule được đặt ở vị trí ưu tiên

## Cấu trúc mới

### TourEditor Layout

1. **Header**: Title, Preview button, Save button
2. **Main Content** (2/3 width):
   - Basic Information (title, capacity, duration, transportation, accommodation)
   - Tour Schedule (textarea)
   - Tour Description (TinyMCE editors)
3. **Sidebar** (1/3 width):
   - Tour Settings (category, active status)
   - Tour Image (upload with preview)

### TourView Layout

1. **Header**: Back button, title, edit button (nếu là provider)
2. **Main Content** (2/3 width):
   - Tour Image
   - Stats Cards (capacity, rating, views, bookings)
   - Tour Information (duration, transportation, accommodation, status)
   - Tour Schedule (nếu có)
   - Tour Description (destination intro, tour info)
3. **Sidebar** (1/3 width):
   - Quick Actions
   - Tour Details
   - Performance Metrics
   - Recent Activity

## Lưu ý quan trọng

1. **Null Safety**: Tất cả các field đều có kiểm tra null safety để tránh lỗi runtime
2. **TinyMCE**: Cần đảm bảo TinyMCE component đã được cài đặt và cấu hình đúng
3. **API Response**: AdminTour và ProviderTour có cấu trúc khác nhau, cần xử lý tương thích
4. **Permissions**: Admin chỉ có thể xem, Provider có thể tạo/sửa/xóa

## Testing

Để test các tính năng mới:

1. **TourView**: Truy cập `/admin/tours/view/39` để xem chi tiết tour
2. **TourEditor**: Truy cập `/admin/tours/new` để tạo tour mới
3. **Edit Tour**: Từ TourView, click "Edit Tour" để chỉnh sửa

## Dependencies

- `@/components/TinyMCEEditor`: Rich text editor component
- `@/services/provider/providerTour.service`: Service cho provider tours
- `@/services/admin/adminTour.service`: Service cho admin tours
- `@/services/tourCategory.service`: Service cho tour categories
