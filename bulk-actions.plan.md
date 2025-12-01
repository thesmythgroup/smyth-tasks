# Add Bulk Actions Feature

Implement bulk actions functionality to allow users to select multiple tasks and perform operations on them simultaneously.

## Requirements

- Select multiple tasks using checkboxes
- Bulk complete/delete operations
- Bulk priority update
- Bulk tag assignment (deferred - tags not yet implemented)

## Implementation Plan

### 1. Add Selection State Management

- Add selection state to `TaskList` component to track selected task IDs
- Implement "Select All" / "Deselect All" functionality
- Add visual indicators for selection mode
- **Commit:** `git add src/components/tasks/TaskList.tsx && git commit -m "feat: add task selection state management to TaskList"`
- **⚠️ PAUSE FOR REVIEW** - Review the selection state implementation before proceeding.

### 2. Update TaskItem Component

- Add checkbox for selection (separate from completion checkbox)
- Show selection checkbox when in bulk selection mode
- Update styling to indicate selected state
- Pass selection handlers from parent
- **Commit:** `git add src/components/tasks/TaskItem.tsx && git commit -m "feat: add selection checkbox to TaskItem component"`
- **⚠️ PAUSE FOR REVIEW** - Review the TaskItem selection UI before proceeding.

### 3. Create Bulk Actions Toolbar

- Create new `BulkActionsToolbar` component
- Display when tasks are selected
- Include buttons for:
  - Complete selected tasks
  - Delete selected tasks
  - Update priority (dropdown)
  - Clear selection
- Show count of selected tasks
- **Commit:** `git add src/components/tasks/BulkActionsToolbar.tsx && git commit -m "feat: create BulkActionsToolbar component with bulk action controls"`
- **⚠️ PAUSE FOR REVIEW** - Review the BulkActionsToolbar component before proceeding.

### 4. Add Bulk Operations to API

- Add `bulkUpdateTasks` mutation in `localApi.ts` to handle multiple task updates efficiently
- Add `bulkDeleteTasks` mutation for deleting multiple tasks
- Update Redux slice if needed for bulk operations
- **Commit:** `git add src/lib/services/localApi.ts src/lib/features/tasksSlice.ts && git commit -m "feat: add bulk update and delete mutations to API"`
- **⚠️ PAUSE FOR REVIEW** - Review the bulk API mutations before proceeding.

### 5. Update TaskList Component

- Add selection mode toggle/button
- Integrate BulkActionsToolbar
- Handle bulk operations with proper loading states
- Show success/error toasts for bulk operations
- Clear selection after operations complete
- **Commit:** `git add src/components/tasks/TaskList.tsx && git commit -m "feat: integrate bulk actions toolbar and wire up bulk operations"`
- **⚠️ PAUSE FOR REVIEW** - Review the integrated bulk actions functionality before proceeding.

### 6. Testing & Polish

- Ensure proper error handling for partial failures
- Add loading states during bulk operations
- Update UI to show selection count
- Test with filtered/search results
- **Commit:** `git add . && git commit -m "test: add error handling and polish bulk actions feature"`
- **⚠️ PAUSE FOR REVIEW** - Final review of the complete bulk actions feature.

## Files to Modify

- `src/components/tasks/TaskList.tsx` - Add selection state and bulk actions UI
- `src/components/tasks/TaskItem.tsx` - Add selection checkbox
- `src/lib/services/localApi.ts` - Add bulk mutation endpoints
- `src/components/tasks/BulkActionsToolbar.tsx` - New component for bulk action controls

## Implementation Notes

- Selection should work with filtered/search results
- Bulk operations should be optimized (batch updates)
- Consider undo functionality for bulk delete (future enhancement)
- Maintain existing single-task operations alongside bulk actions

