const STORAGE_KEY = "smyth-task-state";

export const loadState = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return undefined;
    }
    const state = JSON.parse(serializedState);

    // Ensure we have valid state structure
    return {
      user: state.user || { currentUser: null, isAuthenticated: false },
      tasks: state.tasks || { items: [], loading: false, error: null },
      tags: state.tags || { items: [], loading: false, error: null },
    };
  } catch (err) {
    console.error("Error loading state:", err);
    return undefined;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveState = (state: any) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Persist user, tasks, and tags data
    const stateToPersist = {
      user: state.user,
      tasks: {
        items: state.tasks.items,
        loading: false,
        error: null,
      },
      tags: {
        items: state.tags.items,
        loading: false,
        error: null,
      },
    };
    const serializedState = JSON.stringify(stateToPersist);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Error saving state:", err);
  }
};

export const clearState = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Error clearing state:", err);
  }
};
