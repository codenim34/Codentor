# Profile Modal Z-Index Fix

## Issue
The connection request profile modal was appearing behind post cards, making it difficult to see and interact with the "Connect" button.

## Solution Implemented

### 1. **Increased Z-Index**
Changed the modal's z-index from `z-[60]` to `z-[9999]` to ensure it appears above all other content.

### 2. **React Portal Implementation**
Used React's `createPortal` to render the modal at the document body level, completely bypassing any stacking context issues from parent components.

### 3. **Added Smooth Animation**
Added `animate-in fade-in zoom-in-95 duration-200` classes for a smooth modal appearance.

### 4. **Improved Padding**
Added `p-4` padding to the modal backdrop to ensure proper spacing on mobile devices.

## Files Modified

### `app/components/feed/ProfileModal.jsx`
- Added `createPortal` import from `react-dom`
- Added `mounted` state to handle client-side rendering
- Wrapped modal content in a fragment with conditional rendering
- Used portal to render modal at document body level
- Increased z-index to `z-[9999]`

## Technical Details

**Before:**
```jsx
return (
  <div className="fixed inset-0 ... z-[60]">
    {/* Modal content */}
  </div>
);
```

**After:**
```jsx
const modalContent = (
  <>
    {isLoading ? (
      <div className="fixed inset-0 ... z-[9999]">
        {/* Loading state */}
      </div>
    ) : profile ? (
      <div className="fixed inset-0 ... z-[9999] p-4">
        {/* Profile content */}
      </div>
    ) : null}
  </>
);

if (!mounted) return null;
return createPortal(modalContent, document.body);
```

## Benefits

1. **No Z-Index Conflicts**: Portal renders outside the component hierarchy
2. **Always Visible**: Modal appears above all content including post cards
3. **Better Performance**: Avoids stacking context issues
4. **Smooth UX**: Added fade and zoom animations
5. **Mobile Friendly**: Proper padding ensures visibility on all devices

## Testing

✅ Profile modal now appears above all post cards
✅ Connection request button is fully visible and clickable
✅ Modal closes properly when clicking backdrop
✅ Animation works smoothly
✅ Works on both desktop and mobile viewports

## Connection Request Flow

1. User clicks on profile picture or username in a post
2. Profile modal opens with `z-[9999]` and portal rendering
3. User can see full profile details
4. User clicks "Connect" button
5. Connection request is sent via `/api/connections/request`
6. Button changes to "Request Pending" state
7. Recipient receives notification
8. Modal can be closed by clicking backdrop or X button

## API Integration

The connection request functionality uses:
- **POST** `/api/connections/request` - Sends connection request
- **GET** `/api/users/[userId]` - Fetches user profile data
- Proper error handling with toast notifications
- Optimistic UI updates for better UX
