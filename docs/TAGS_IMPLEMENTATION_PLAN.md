# Tags Feature Implementation Plan

## Project Context

- Next.js app with Redux Toolkit for state management
- RTK Query with fakeBaseQuery for API layer
- LocalStorage for data persistence
- Client components with TypeScript
- Jest for testing

## Requirements Summary

- Tasks can have multiple tags (many-to-many relationship)
- Users can create tags on-the-fly when adding/editing tasks
- Search/autocomplete for tags with ability to create new ones
- Multi-select dropdown filter to show tasks with ALL selected tags
- Dedicated route to manage tags (list, create, update, delete)
- Tags have predefined color options
- Tags have their own Redux slice

---

## Implementation Checklist

### Phase 1: Core Data Layer ⏳

- [x] **1.1** Update types in `src/lib/types/index.ts` ✅

  - Add `Tag` interface (id, name, color, createdAt, updatedAt)
  - Add `TagsState` interface (items, loading, error)
  - Update `Task` interface to include `tagIds: string[]`
  - Update `RootState` to include tags slice
  - Add predefined color constants/types

- [x] **1.2** Create tags Redux slice `src/lib/features/tagsSlice.ts` ✅

  - Initial state with items, loading, error
  - Reducers: addTag, updateTag, removeTag, setTags, setLoading, setError, clearTags
  - Export actions and reducer
  - Follow same pattern as `tasksSlice.ts`

- [x] **1.3** Update tasks Redux slice `src/lib/features/tasksSlice.ts` ✅

  - Add updateTask reducer to handle tag assignments
  - Ensure tagIds array is handled when creating/updating tasks

- [x] **1.4** Update Redux store `src/lib/store/store.ts` ✅
  - Add tags reducer to combineReducers
  - Update type imports

### Phase 2: API Layer ✅

- [x] **2.1** Extend `src/lib/services/localApi.ts` with tag endpoints ✅

  - `getTags` query
  - `addTag` mutation
  - `updateTag` mutation (name and color)
  - `deleteTag` mutation (with cleanup of task references)
  - Add "Tag" to tagTypes
  - Export hooks: useGetTagsQuery, useAddTagMutation, useUpdateTagMutation, useDeleteTagMutation

- [x] **2.2** Update task endpoints in localApi ✅
  - Modify addTask to handle tagIds
  - Modify updateTask to handle tagIds updates

### Phase 3: UI Components - Tag Management ✅

- [x] **3.1** Create `src/components/tags/TagBadge.tsx` ✅

  - Display tag with color
  - Optional close button for removal
  - Follows design patterns of existing components

- [x] **3.2** Create `src/components/tags/TagInput.tsx` ✅

  - Searchable dropdown/combobox for tag selection
  - Shows existing tags filtered by search
  - "Create new tag" option when no exact match
  - Multi-select capability
  - Color picker when creating new tag

- [x] **3.3** Create `src/components/tags/TagFilter.tsx` ✅

  - Multi-select dropdown for filtering tasks
  - Shows all available tags
  - Clear filters button
  - Displays count of selected filters

- [x] **3.4** Create `src/components/tags/TagList.tsx` ✅

  - List all tags with their colors
  - Edit and delete functionality
  - Empty state

- [x] **3.5** Create `src/components/tags/TagForm.tsx` ✅
  - Form for creating/editing tags
  - Name input with validation
  - Color selector (predefined colors)
  - Save/Cancel buttons

### Phase 4: Update Task Components ✅

- [x] **4.1** Update `src/components/tasks/AddTaskForm.tsx` ✅

  - Add TagInput component
  - Handle tag selection state
  - Pass tagIds when creating task

- [x] **4.2** Update `src/components/tasks/TaskItem.tsx` ✅

  - Display tags using TagBadge components
  - Add edit mode to modify tags
  - Handle tag removal from individual tasks

- [x] **4.3** Update `src/components/tasks/TaskList.tsx` ✅
  - Add TagFilter component above task list
  - Filter tasks based on selected tags (AND logic - all tags must match)
  - Show filtered count

### Phase 5: Testing ✅

- [x] **5.1** Write tests for tags slice `src/lib/features/__tests__/tagsSlice.test.ts` ✅

  - Test all reducers
  - Test initial state
  - Follow pattern from `tasksSlice.test.ts`

- [x] **5.2** Write tests for TagBadge component `src/components/tags/__tests__/TagBadge.test.tsx` ✅

  - Rendering with different colors
  - Click/close handlers

- [x] **5.3** Write tests for TagInput component `src/components/tags/__tests__/TagInput.test.tsx` ✅

  - Search functionality
  - Tag selection
  - Creating new tags

- [x] **5.4** Write tests for TagFilter component `src/components/tags/__tests__/TagFilter.test.tsx` ✅

  - Multi-select behavior
  - Clear filters
  - Filter application

- [x] **5.5** Update existing task component tests ✅
  - Updated AddTaskForm.test.tsx to handle tags
  - Updated TaskItem.test.tsx to handle tags
  - Updated localStorage.test.ts to include tags
  - Updated test-utils.tsx to include tags reducer

---

## Technical Decisions

### Tag Colors

Predefined color palette (can be adjusted):

- Blue (#3B82F6)
- Green (#10B981)
- Yellow (#F59E0B)
- Red (#EF4444)
- Purple (#8B5CF6)
- Pink (#EC4899)
- Indigo (#6366F1)
- Teal (#14B8A6)

### Filtering Logic

- Multi-select with AND logic (task must have ALL selected tags)
- Empty selection = show all tasks

### Data Structure

- Tags stored separately in their own slice
- Tasks reference tags by ID (tagIds: string[])
- Many-to-many relationship

---

## Current Status

**Phase:** Phase 5 - Testing ✅ COMPLETE
**Last Updated:** All phases complete! Tags feature fully implemented and tested. All 72 tests passing.
**Status:** ✅ Project Complete
