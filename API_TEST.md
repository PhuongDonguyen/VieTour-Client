# API Response Structure Test

## Provider Tour API Response

### Expected Structure (from API response):

```json
{
  "success": true,
  "data": {
    "id": 39,
    "title": "tour đẫm máu",
    "poster_url": "https://res.cloudinary.com/dxiuxuivf/image/upload/v1753591690/vietour/p87q2uiuk5firr8a5cz4.jpg",
    "provider_id": 3,
    "capacity": 40,
    "transportation": "xe rồng",
    "accommodation": "chung cư",
    "destination_intro": "đẹp nhiều điện ",
    "tour_info": "đi campuchia á ",
    "view_count": "0",
    "slug": "tour-dam-mau",
    "tour_category_id": 4,
    "is_active": true,
    "total_star": 0,
    "review_count": 0,
    "live_commentary": "???? cái gì đâyaaaaaaaaaaaaaaaaa",
    "duration": "1 tuần",
    "booked_count": 0,
    "tour_category": {
      "id": 4,
      "name": "Tour Nước Ngoài"
    }
  }
}
```

### Current ProviderTour Interface:

```typescript
export interface ProviderTour {
  id: number;
  title: string;
  poster_url: string;
  provider_id: number; // ✅ Có
  capacity: number;
  transportation: string;
  accommodation: string;
  destination_intro: string;
  tour_info: string;
  view_count: string;
  slug: string;
  tour_category_id: number;
  is_active: boolean;
  total_star: number;
  review_count: number;
  live_commentary: string;
  duration: string;
  booked_count: number;
  tour_category: TourCategory; // ✅ Có
}
```

### Current AdminTour Interface:

```typescript
export interface AdminTour {
  id: number;
  title: string;
  description: string; // ❌ Không có trong provider response
  poster_url: string;
  slug: string; // ✅ Có
  is_active: boolean;
  price: number; // ❌ Không có trong provider response
  duration: number; // ❌ Type khác (number vs string)
  location: string; // ❌ Không có trong provider response
  max_participants: number; // ❌ Tên khác (capacity)
  view_count: number; // ❌ Type khác (number vs string)
  booking_count: number; // ❌ Tên khác (booked_count)
  average_rating: number; // ❌ Tên khác (total_star)
  total_reviews: number; // ❌ Tên khác (review_count)
  created_at: string; // ❌ Không có trong provider response
  updated_at: string; // ❌ Không có trong provider response
  tour_category: {
    // ✅ Có
    id: number;
    name: string;
  };
  provider: {
    // ❌ Không có trong provider response
    id: number;
    business_name: string;
    email: string;
  };
}
```

## Issues Found:

1. **ProviderTour vs AdminTour mismatch**: Hai interface có cấu trúc khác nhau
2. **Response structure**: API có thể trả về `{ success: true, data: tour }` hoặc trực tiếp `tour`
3. **Field names**: Một số field có tên khác nhau giữa hai interface
4. **Data types**: Một số field có type khác nhau (string vs number)

## Solutions:

1. **Update helper functions** to handle both interfaces properly
2. **Add null safety** for all fields
3. **Handle response structure** variations
4. **Update interfaces** to match actual API responses

## Test URLs:

- Provider Tour View: `http://localhost:5173/admin/tours/view/39`
- Admin Tour View: `http://localhost:5173/admin/tours/view/{admin_tour_id}`
- Provider Tour Edit: `http://localhost:5173/admin/tours/edit/39`
- Create New Tour: `http://localhost:5173/admin/tours/new`
