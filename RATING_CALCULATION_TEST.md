# Rating Calculation Test

## Logic tính Rating

### ProviderTour Rating Calculation

```typescript
// ProviderTour: calculate average from total_star / review_count
const getTourRating = (tour: ProviderTour): number => {
  return tour.review_count > 0 ? tour.total_star / tour.review_count : 0;
};
```

### AdminTour Rating Calculation

```typescript
// AdminTour: use average_rating directly
const getTourRating = (tour: AdminTour): number => {
  return tour.average_rating || 0;
};
```

## Test Cases

### Test Case 1: Tour Tây Bắc (ID: 1)

```json
{
  "total_star": 9,
  "review_count": 3
}
```

**Expected**: `9 / 3 = 3.0/5`
**Display**: `3.0/5`

### Test Case 2: Tour Đà Lạt (ID: 15)

```json
{
  "total_star": 5,
  "review_count": 1
}
```

**Expected**: `5 / 1 = 5.0/5`
**Display**: `5.0/5`

### Test Case 3: Du thuyền (ID: 17)

```json
{
  "total_star": 4,
  "review_count": 1
}
```

**Expected**: `4 / 1 = 4.0/5`
**Display**: `4.0/5`

### Test Case 4: Tour mới (ID: 39)

```json
{
  "total_star": 0,
  "review_count": 0
}
```

**Expected**: `0` (no reviews)
**Display**: `N/A`

## API Response Examples

### Provider Tour API Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Tour Tây Bắc 3 ngày 2 đêm",
    "total_star": 9,
    "review_count": 3,
    "booked_count": 13,
    "view_count": "10"
  }
}
```

### Admin Tour API Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Tour Tây Bắc 3 ngày 2 đêm",
    "average_rating": 3.0,
    "total_reviews": 3,
    "booking_count": 13,
    "view_count": 10
  }
}
```

## Display Format

### Rating Display

- **With reviews**: `3.0/5` (1 decimal place)
- **No reviews**: `N/A`

### Progress Bar

- **Width**: `(rating / 5) * 100%`
- **Example**: `3.0/5` = `60%` width

### Review Count Display

- **Format**: `Rating (3)`
- **Example**: `Rating (3)` for 3 reviews

## Implementation Details

### Helper Function

```typescript
const getTourRating = (tour: ProviderTour | AdminTour): number => {
  if ("total_star" in tour) {
    // ProviderTour: calculate average from total_star / review_count
    return tour.review_count > 0 ? tour.total_star / tour.review_count : 0;
  } else {
    // AdminTour: use average_rating directly
    return tour.average_rating || 0;
  }
};
```

### Display Formatting

```typescript
// Format rating to 1 decimal place
{getTourRating(tour) > 0 ? `${getTourRating(tour).toFixed(1)}/5` : "N/A"}

// Progress bar width
style={{ width: `${(getTourRating(tour) / 5) * 100}%` }}
```

## Expected Results

| Tour ID | total_star | review_count | Calculated Rating | Display |
| ------- | ---------- | ------------ | ----------------- | ------- |
| 1       | 9          | 3            | 3.0               | `3.0/5` |
| 15      | 5          | 1            | 5.0               | `5.0/5` |
| 17      | 4          | 1            | 4.0               | `4.0/5` |
| 39      | 0          | 0            | 0                 | `N/A`   |

## Test URLs

- **Tour Tây Bắc**: `http://localhost:5173/admin/tours/view/1`
- **Tour Đà Lạt**: `http://localhost:5173/admin/tours/view/15`
- **Du thuyền**: `http://localhost:5173/admin/tours/view/17`
- **Tour mới**: `http://localhost:5173/admin/tours/view/39`
