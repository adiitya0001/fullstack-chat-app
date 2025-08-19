import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import { useThemeStore } from "./store/useThemeStore.js";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth, connectSocket, disconnectSocket } = useAuthStore();
    const { theme } = useThemeStore();

    // This effect runs once on mount to check for an existing session
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // This effect manages the socket connection lifecycle
    useEffect(() => {
        // If a user is authenticated, establish the socket connection
        if (authUser) {
            connectSocket();
        }

        // Cleanup function: This runs when the component unmounts or authUser changes.
        // It's crucial for preventing duplicate connections in React's Strict Mode.
        return () => {
            disconnectSocket();
        };
    }, [authUser, connectSocket, disconnectSocket]);

    // This effect manages the application theme
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    // Show a loading spinner while checking authentication
    if (isCheckingAuth) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <Loader className='size-10 animate-spin' />
            </div>
        );
    }

    return (
        <div data-theme={theme}>
            <Navbar />
            <Routes>
                <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
                <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
                <Route path='/settings' element={authUser ? <SettingsPage /> : <Navigate to='/login' />} />
                <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
            </Routes>
            <Toaster />
        </div>
    );
};

export default App;