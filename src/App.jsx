import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Stats from './pages/Stats';
import Ads from './pages/Ads';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import api from './api/axios';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
    const [status, setStatus] = React.useState('checking');
    const token = sessionStorage.getItem('admin_token');

    React.useEffect(() => {
        let mounted = true;

        const verifyToken = async () => {
            if (!token) {
                setStatus('unauthenticated');
                return;
            }

            try {
                const response = await api.get('/auth/verify');
                const isAdmin = response.data?.role === 'admin' && response.data?.is_active !== false;

                if (mounted) {
                    setStatus(isAdmin ? 'authenticated' : 'unauthenticated');
                }

                if (!isAdmin) {
                    sessionStorage.removeItem('admin_token');
                    sessionStorage.removeItem('admin_user');
                }
            } catch {
                if (mounted) {
                    setStatus('unauthenticated');
                }
            }
        };

        verifyToken();

        return () => {
            mounted = false;
        };
    }, [token]);

    if (status === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="h-8 w-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            </div>
        );
    }

    if (status !== 'authenticated') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/stats" replace />} />
                        <Route path="stats" element={<Stats />} />
                        <Route path="users" element={<Users />} />
                        <Route path="ads" element={<Ads />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="reports" element={<Reports />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
