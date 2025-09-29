import { create } from "zustand";

const useBearStore = create((set) => ({
  appName: "MyApp",
  user: null, // logged-in user info

  setAppName: (name) => set({ appName: name }),

  login: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },

  loadUser: () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) set({ user: JSON.parse(storedUser) });
  },
}));

export default useBearStore;
