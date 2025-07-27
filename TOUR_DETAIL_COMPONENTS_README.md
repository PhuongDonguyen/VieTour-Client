# Tour Detail Management Components

## Tổng quan

Đã tạo các component riêng biệt cho việc quản lý tour detail thay vì sử dụng dialog popup, tương tự như pattern của tour management.

## Các Component Mới

### 1. TourDetailView (`src/pages/admin/TourDetailView.tsx`)

**Chức năng:**

- Xem chi tiết tour detail với layout đẹp
- Hiển thị thông tin tour và lịch trình chi tiết
- Quick actions sidebar
- Rich text display cho các mô tả

**Tính năng:**

- ✅ Tour information với poster và category
- ✅ Schedule details (Morning, Noon, Afternoon) với rich text display
- ✅ Quick actions sidebar
- ✅ Tour details metadata
- ✅ Responsive design
- ✅ Loading states và error handling

**Routes:**

- `/admin/tours/details/view/:id` - Xem chi tiết tour detail

### 2. TourDetailEditor (`src/pages/admin/TourDetailEditor.tsx`)

**Chức năng:**

- Tạo tour detail mới
- Chỉnh sửa tour detail hiện có
- Form validation đầy đủ
- TinyMCE editor cho rich text

**Tính năng:**

- ✅ Form với validation đầy đủ
- ✅ Tour selection dropdown
- ✅ TinyMCE editor cho morning/noon/afternoon descriptions
- ✅ Form status tracking
- ✅ Selected tour preview
- ✅ Responsive design

**Routes:**

- `/admin/tours/details/new` - Tạo tour detail mới
- `/admin/tours/details/edit/:id` - Chỉnh sửa tour detail

### 3. TourDetails List (`src/components/admin/TourDetail.tsx`)

**Cập nhật:**

- ✅ Xóa tất cả dialog components
- ✅ Xóa RichTextEditor component
- ✅ Navigation đến các component riêng biệt
- ✅ Clean code, không còn form state
- ✅ Chỉ focus vào list và actions

## Cấu trúc Files

```
src/
├── pages/admin/
│   ├── TourDetailView.tsx     # Xem chi tiết tour detail
│   ├── TourDetailEditor.tsx   # Tạo/Edit tour detail
│   └── index.ts               # Export các admin pages
├── components/admin/
│   └── TourDetail.tsx         # List tour details (đã cập nhật)
└── routes/adminRoutes.tsx     # Routes (đã cập nhật)
```

## Routes Mới

```typescript
// Tour Detail Management Routes
{
  path: "/admin/tours/details/new",
  element: <TourDetailEditor />
},
{
  path: "/admin/tours/details/edit/:id",
  element: <TourDetailEditor />
},
{
  path: "/admin/tours/details/view/:id",
  element: <TourDetailView />
}
```

## Tính năng chính

### TourDetailView

- **Layout**: 2-column layout với main content và sidebar
- **Rich Text Display**: Sử dụng Tailwind CSS arbitrary selectors để style HTML content
- **Quick Actions**: Edit và View Tour buttons
- **Tour Information**: Hiển thị poster, title, category
- **Schedule Details**: Morning, Noon, Afternoon với emoji icons

### TourDetailEditor

- **Form Validation**: Required fields validation
- **Tour Selection**: Dropdown với available tours
- **TinyMCE Integration**: Rich text editing cho descriptions
- **Form Status**: Real-time validation status
- **Selected Tour Preview**: Hiển thị thông tin tour được chọn

### TourDetails List

- **Clean Navigation**: Navigate đến dedicated pages
- **Search & Filter**: Tìm kiếm và lọc theo tour
- **Pagination**: Phân trang cho danh sách
- **Role-based Actions**: Admin chỉ xem, Provider có thể edit/delete

## API Integration

### Services Used

- `providerTourDetailService` - CRUD operations cho provider
- `adminTourDetailService` - Read operations cho admin
- `providerTourService` - Lấy danh sách tours cho dropdown

### API Endpoints

- `GET /api/provider/tour-details/:id` - Lấy tour detail
- `POST /api/provider/tour-details` - Tạo tour detail
- `PUT /api/provider/tour-details/:id` - Cập nhật tour detail
- `DELETE /api/provider/tour-details/:id` - Xóa tour detail

## Styling

### Rich Text Display

Sử dụng Tailwind CSS arbitrary value selectors:

```css
[&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4
[&>p]:mb-3 [&>p]:leading-relaxed
[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3
[&>strong]:font-semibold [&>em]:italic
```

### Loading States

- Fixed overlay với spinner
- Consistent styling với các component khác
- Error handling với user-friendly messages

## Role-based Access Control

### Admin

- ✅ Xem tất cả tour details
- ✅ Xem chi tiết tour detail
- ❌ Không thể tạo/sửa/xóa

### Provider

- ✅ Xem tour details của mình
- ✅ Tạo tour detail mới
- ✅ Sửa tour detail
- ✅ Xóa tour detail
- ✅ Xem chi tiết tour detail

## Next Steps

1. **Testing**: Test các component với real data
2. **Error Handling**: Cải thiện error messages
3. **Validation**: Thêm client-side validation rules
4. **Performance**: Optimize loading states
5. **UX**: Thêm confirmation dialogs cho delete actions
