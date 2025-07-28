# Tour Components - Modal và Content Components

## Tổng quan

Đã tạo các component mới để hỗ trợ việc hiển thị tour và tour detail trong modal thay vì load cả trang như hiện tại.

## Các Component Mới

### 1. TourViewContent

- **File**: `src/components/admin/TourViewContent.tsx`
- **Mô tả**: Component hiển thị nội dung tour view mà không có layout wrapper
- **Props**:
  - `tourId?: string` - ID của tour (nếu không có sẽ lấy từ URL params)
  - `onBack?: () => void` - Callback khi click nút back
  - `showHeader?: boolean` - Có hiển thị header hay không (mặc định: true)

### 2. TourDetailViewContent

- **File**: `src/components/admin/TourDetailViewContent.tsx`
- **Mô tả**: Component hiển thị nội dung tour detail view mà không có layout wrapper
- **Props**:
  - `detailId?: string` - ID của tour detail (nếu không có sẽ lấy từ URL params)
  - `onBack?: () => void` - Callback khi click nút back
  - `showHeader?: boolean` - Có hiển thị header hay không (mặc định: true)

### 3. TourViewModal

- **File**: `src/components/admin/TourViewModal.tsx`
- **Mô tả**: Modal component để hiển thị tour view
- **Props**:
  - `isOpen: boolean` - Trạng thái mở/đóng modal
  - `onClose: () => void` - Callback khi đóng modal
  - `tourId: string` - ID của tour

### 4. TourDetailViewModal

- **File**: `src/components/admin/TourDetailViewModal.tsx`
- **Mô tả**: Modal component để hiển thị tour detail view
- **Props**:
  - `isOpen: boolean` - Trạng thái mở/đóng modal
  - `onClose: () => void` - Callback khi đóng modal
  - `detailId: string` - ID của tour detail

### 5. TourScheduleViewContent

- **File**: `src/components/admin/TourScheduleViewContent.tsx`
- **Mô tả**: Component hiển thị nội dung tour schedule view mà không có layout wrapper
- **Props**:
  - `scheduleId?: string` - ID của tour schedule (nếu không có sẽ lấy từ URL params)
  - `onBack?: () => void` - Callback khi click nút back
  - `showHeader?: boolean` - Có hiển thị header hay không (mặc định: true)

### 6. TourScheduleViewModal

- **File**: `src/components/admin/TourScheduleViewModal.tsx`
- **Mô tả**: Modal component để hiển thị tour schedule view
- **Props**:
  - `isOpen: boolean` - Trạng thái mở/đóng modal
  - `onClose: () => void` - Callback khi đóng modal
  - `scheduleId: string` - ID của tour schedule

### 7. TourPriceViewContent

- **File**: `src/components/admin/TourPriceViewContent.tsx`
- **Mô tả**: Component hiển thị nội dung tour price view mà không có layout wrapper
- **Props**:
  - `priceId?: string` - ID của tour price (nếu không có sẽ lấy từ URL params)
  - `onBack?: () => void` - Callback khi click nút back
  - `showHeader?: boolean` - Có hiển thị header hay không (mặc định: true)

### 8. TourPriceViewModal

- **File**: `src/components/admin/TourPriceViewModal.tsx`
- **Mô tả**: Modal component để hiển thị tour price view
- **Props**:
  - `isOpen: boolean` - Trạng thái mở/đóng modal
  - `onClose: () => void` - Callback khi đóng modal
  - `priceId: string` - ID của tour price

### 5. LargeModal

- **File**: `src/components/LargeModal.tsx`
- **Mô tả**: Modal component với kích thước lớn hơn cho tour view
- **Props**:
  - `isOpen: boolean` - Trạng thái mở/đóng modal
  - `onClose: () => void` - Callback khi đóng modal
  - `children: React.ReactNode` - Nội dung modal

## Demo Components

### 1. TourViewDemo

- **File**: `src/components/admin/TourViewDemo.tsx`
- **Mô tả**: Component demo để test tour view modal
- **Props**:
  - `tourId: string` - ID của tour
  - `tourTitle: string` - Tiêu đề tour

### 2. TourDetailViewDemo

- **File**: `src/components/admin/TourDetailViewDemo.tsx`
- **Mô tả**: Component demo để test tour detail view modal
- **Props**:
  - `detailId: string` - ID của tour detail
  - `detailTitle: string` - Tiêu đề tour detail

### 3. TourNavigationDemo

- **File**: `src/components/admin/TourNavigationDemo.tsx`
- **Mô tả**: Component demo để test navigation đến tour details và tour prices
- **Props**:
  - `tourId: string` - ID của tour
  - `tourTitle: string` - Tiêu đề tour

### 4. TourScheduleViewDemo

- **File**: `src/components/admin/TourScheduleViewDemo.tsx`
- **Mô tả**: Component demo để test tour schedule view modal
- **Props**:
  - `scheduleId: string` - ID của tour schedule
  - `scheduleTitle: string` - Tiêu đề tour schedule

### 5. TourPriceViewDemo

- **File**: `src/components/admin/TourPriceViewDemo.tsx`
- **Mô tả**: Component demo để test tour price view modal
- **Props**:
  - `priceId: string` - ID của tour price
  - `priceTitle: string` - Tiêu đề tour price

## Cách Sử Dụng

### 1. Sử dụng trong modal

```tsx
import TourViewModal from "@/components/admin/TourViewModal";

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>View Tour</Button>

      <TourViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tourId="123"
      />
    </div>
  );
};
```

### 2. Sử dụng content component trực tiếp

```tsx
import TourViewContent from "@/components/admin/TourViewContent";

const MyComponent = () => {
  return (
    <div>
      <TourViewContent
        tourId="123"
        onBack={() => console.log("Back clicked")}
        showHeader={false}
      />
    </div>
  );
};
```

### 3. Sử dụng demo component

```tsx
import TourViewDemo from "@/components/admin/TourViewDemo";

const MyComponent = () => {
  return <TourViewDemo tourId="123" tourTitle="Sample Tour" />;
};
```

### 4. Sử dụng navigation demo component

```tsx
import TourNavigationDemo from "@/components/admin/TourNavigationDemo";

const MyComponent = () => {
  return <TourNavigationDemo tourId="123" tourTitle="Sample Tour" />;
};
```

## Cập Nhật Trang Hiện Tại

### 1. TourView.tsx

- Đã được cập nhật để sử dụng `TourViewContent`
- Giờ chỉ load component thay vì load cả trang
- Thêm link "Manage Tour Details" để chuyển đến tour details của tour hiện tại

### 2. TourDetailView.tsx

- Đã được cập nhật để sử dụng `TourDetailViewContent`
- Giờ chỉ load component thay vì load cả trang

### 3. TourDetail.tsx

- Đã được cập nhật để hỗ trợ `tour_id` từ URL query parameter
- Tự động filter theo tour khi có `tour_id` trong URL

### 4. TourPrice.tsx

- Đã được cập nhật để hỗ trợ `tour_id` từ URL query parameter
- Tự động filter theo tour khi có `tour_id` trong URL

### 5. TourSchedule.tsx

- Đã được cập nhật để hỗ trợ `tour_id` từ URL query parameter
- Tự động filter theo tour khi có `tour_id` trong URL

### 6. TourScheduleView.tsx

- Đã được tạo để sử dụng `TourScheduleViewContent`
- Giờ chỉ load component thay vì load cả trang

### 7. TourPriceView.tsx

- Đã được cập nhật để sử dụng `TourPriceViewContent`
- Giờ chỉ load component thay vì load cả trang

## Lợi Ích

1. **Tốc độ**: Chỉ load component thay vì load cả trang
2. **UX tốt hơn**: Modal không làm mất context của trang hiện tại
3. **Tái sử dụng**: Có thể sử dụng content components ở nhiều nơi
4. **Linh hoạt**: Có thể hiển thị trong modal hoặc trực tiếp trong trang
5. **Navigation tốt hơn**: Tự động filter theo tour khi chuyển đến tour details và tour prices
6. **Context preservation**: Giữ nguyên context của tour hiện tại khi navigate

## Ghi Chú

- Các component mới tương thích với cả admin và provider roles
- Hỗ trợ loading states và error handling
- Responsive design cho mobile và desktop
- Tự động xử lý navigation và routing
