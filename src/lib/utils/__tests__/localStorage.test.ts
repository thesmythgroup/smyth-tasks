import { loadState, saveState, clearState } from "../localStorage";

describe("localStorage utils", () => {
  const originalError = console.error;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it("should return undefined when no state is saved", () => {
    const state = loadState();
    expect(state).toBeUndefined();
    expect(localStorage.getItem).toHaveBeenCalledWith("smyth-task-state");
  });

  it("should save and load state correctly", () => {
    const mockState = {
      user: { currentUser: null, isAuthenticated: false },
      tasks: { items: [], loading: false, error: null },
      tags: { items: [], loading: false, error: null },
    };

    saveState(mockState);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "smyth-task-state",
      JSON.stringify(mockState)
    );

    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockState));

    const loadedState = loadState();
    expect(loadedState).toEqual(mockState);
  });

  it("should handle invalid JSON in localStorage", () => {
    localStorage.getItem.mockReturnValueOnce("invalid json");

    const state = loadState();
    expect(state).toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it("should clear state", () => {
    clearState();
    expect(localStorage.removeItem).toHaveBeenCalledWith("smyth-task-state");
  });

  it("should handle missing user or tasks in stored state", () => {
    const invalidState = { someOtherData: true };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(invalidState));

    const state = loadState();
    expect(state).toEqual({
      user: { currentUser: null, isAuthenticated: false },
      tasks: { items: [], loading: false, error: null },
      tags: { items: [], loading: false, error: null },
    });
  });
});
