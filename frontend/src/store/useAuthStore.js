import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: JSON.parse(localStorage.getItem("authUser")) || null,
    isSigningUp: false,
    isLoggingIn: false, // Typo fixed
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
            localStorage.setItem("authUser", JSON.stringify(res.data));
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
            localStorage.removeItem("authUser");
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            localStorage.setItem("authUser", JSON.stringify(res.data));
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            // Safer error handling
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An error occurred during sign up.");
            }
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true }); // Typo fixed
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            localStorage.setItem("authUser", JSON.stringify(res.data));
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            // Safer error handling
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An error occurred during login.");
            }
        } finally {
            set({ isLoggingIn: false }); // Typo fixed
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            localStorage.removeItem("authUser");
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            // Safer error handling
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An error occurred during logout.");
            }
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            // Safer error handling
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An error occurred while updating profile.");
            }
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get();
        if (socket?.connected) return;

        if (authUser) {
            const newSocket = io(BASE_URL, {
                query: {
                    userId: authUser._id,
                },
            });

            newSocket.on("connect", () => {
                console.log("Socket connected successfully:", newSocket.id);
            });

            newSocket.on("getOnlineUsers", (onlineUsersList) => {
                set({ onlineUsers: onlineUsersList });
            });
            
            set({ socket: newSocket });
        }
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },
}));