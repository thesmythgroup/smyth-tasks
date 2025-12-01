# Drag-and-Drop Task Reordering Implementation

## Overview

Add drag-and-drop functionality to allow users to reorder tasks within the list and drag tasks between priority levels. Include a toggle to switch between custom order and automatic sorting, with smooth animations during reordering.

## Implementation Steps

### 1. Install Dependencies

- Add `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` packages for drag-and-drop functionality
- **Commit:** `git add package.json package-lock.json && git commit -m "feat: install @dnd-kit packages for drag-and-drop functionality"`

### 2. Update Task Type

- Add optional `order` field to `Task` interface in [`src/lib/types/index.ts`](src/lib/types/index.ts) to store custom position
- This field will be a number representing the task's position in the custom order
- **Commit:** `git add src/lib/types/index.ts && git commit -m "feat: add order field to Task interface for custom ordering"`
- **⚠️ PAUSE FOR REVIEW** - Review the type changes before proceeding to the next step.

### 3. Update Redux Slice

- Add `reorderTasks` action in [`src/lib/features/tasksSlice.ts`](src/lib/features/tasksSlice.ts) to handle global reordering (not limited to same priority)
- Add `moveTaskToPriority` action to handle dragging between priority levels with order updates
- Add `setTaskOrder` action to set global custom order for a task
- Add `reorderMultipleTasks` action to efficiently update order for multiple tasks at once (for better performance during drag operations)
- Add `clearTaskOrder` action to reset to automatic sorting
- **Commit:** `git add src/lib/features/tasksSlice.ts && git commit -m "feat: add Redux actions for global task reordering and priority movement"`
- **⚠️ PAUSE FOR REVIEW** - Review the Redux slice changes before proceeding to the next step.

### 4. Update API Service

- Modify `updateTask` mutation in [`src/lib/services/localApi.ts`](src/lib/services/localApi.ts) to handle order updates
- Ensure order is persisted when tasks are reordered
- Add migration logic to assign default order values to existing tasks based on current sort order
- Ensure backward compatibility with tasks that don't have an order field
- **Commit:** `git add src/lib/services/localApi.ts && git commit -m "feat: add order field handling and migration in API service"`
- **⚠️ PAUSE FOR REVIEW** - Review the API service changes before proceeding to the next step.

### 5. Update TaskItem Component

- Wrap `TaskItem` with `useSortable` hook from `@dnd-kit/sortable` in [`src/components/tasks/TaskItem.tsx`](src/components/tasks/TaskItem.tsx)
- Add drag handle indicator (visual cue that item is draggable)
- Apply drag styles (opacity, scale) during dragging
- Maintain existing functionality (toggle, delete, edit date, priority dropdown)
- **Commit:** `git add src/components/tasks/TaskItem.tsx && git commit -m "feat: make TaskItem draggable with visual feedback"`
- **⚠️ PAUSE FOR REVIEW** - Review the TaskItem component changes before proceeding to the next step.

### 6. Enhance TaskList Component

- Wrap task list with `DndContext` from `@dnd-kit/core` in [`src/components/tasks/TaskList.tsx`](src/components/tasks/TaskList.tsx)
- Add toggle button to switch between "Custom Order" and "Auto Sort" modes
- When in custom order mode:
  - Use a **single `SortableContext`** containing all tasks (not grouped by priority)
  - Sort tasks by global `order` field, allowing items to be positioned above/below items of different priorities
  - When dragging over a task with a different priority, update the dragged task's priority to match
  - When dropping between tasks of different priorities, intelligently assign priority based on drop position
  - Allow free movement across priority boundaries - items can move above/below entire priority groups
- When in auto sort mode:
  - Use existing sorting logic (priority → due date → created date)
  - Group tasks visually by priority for clarity
- Handle `onDragEnd` to:
  - Calculate new global order positions for all affected tasks
  - Update task priorities when dragging across priority boundaries
  - Reorder tasks smoothly with proper state updates
- **Commit:** `git add src/components/tasks/TaskList.tsx && git commit -m "feat: implement drag-and-drop reordering with toggle in TaskList"`
- **⚠️ PAUSE FOR REVIEW** - Review the TaskList component changes before proceeding to the next step.

### 7. Visual Enhancements and Animations

- Add visual feedback during drag (opacity, shadow, scale, border highlight)
- Use `@dnd-kit`'s built-in animation system for smooth item transitions
- Configure `DragOverlay` component to show dragged item with proper styling during drag
- Implement smooth animations when items move between priority levels:
  - Use `@dnd-kit`'s `animateLayoutChanges` configuration
  - Integrate with framer-motion's `AnimatePresence` for enter/exit animations
  - Add transition effects when priority changes during drag
- Show visual indicators (e.g., border color change) when dragging over items of different priorities
- Style the toggle button to match existing UI
- Ensure animations are performant and don't cause jank during rapid drag operations
- **Commit:** `git add src/components/tasks/TaskItem.tsx src/components/tasks/TaskList.tsx && git commit -m "feat: enhance drag-and-drop visual feedback and cross-priority animations"`

## Technical Details

### Drag-and-Drop Library

- Use `@dnd-kit/core` for the main DnD context
- Use `@dnd-kit/sortable` for sortable lists
- Use `@dnd-kit/utilities` for helper functions

### State Management

- Custom order will be stored in the `order` field of each task as a **global position** (not per-priority)
- When toggling to auto sort, ignore the `order` field and use priority → due date → created date sorting
- When toggling to custom order, use `order` field for sorting globally (allowing items to be positioned above/below items of different priorities)

### Priority Drag Behavior

- In custom order mode, tasks can be dragged anywhere in the list, regardless of priority
- When dragging a task to a position above/below a task with a different priority:
  1. Update the task's priority to match the target task's priority (or keep original if dropping between groups)
  2. Assign a new global order value based on the drop position
  3. Reorder all affected tasks to maintain proper sequence
- Tasks should be able to move freely between priority groups, allowing entire priority groups to be reordered relative to each other

## Files to Modify

1. [`package.json`](package.json) - Add dependencies
2. [`src/lib/types/index.ts`](src/lib/types/index.ts) - Add order field
3. [`src/lib/features/tasksSlice.ts`](src/lib/features/tasksSlice.ts) - Add reorder actions
4. [`src/lib/services/localApi.ts`](src/lib/services/localApi.ts) - Handle order persistence
5. [`src/components/tasks/TaskList.tsx`](src/components/tasks/TaskList.tsx) - Implement DnD UI
6. [`src/components/tasks/TaskItem.tsx`](src/components/tasks/TaskItem.tsx) - Make items draggable

## Testing Considerations

- Test reordering within the same priority level
- Test dragging tasks between priority levels (changing priority during drag)
- Test dragging items above/below entire priority groups
- Test that items can be positioned anywhere in the list regardless of priority in custom order mode
- Test toggle between custom order and auto sort
- Test persistence of custom order after page refresh
- Test with existing tasks that don't have order field
- Ensure animations are smooth and performant, especially when moving between priority levels
- Test that priority updates correctly when dragging across priority boundaries
- Verify that global order is maintained correctly when items are reordered

