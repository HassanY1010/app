import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Stats from './pages/Stats';
import Ads from './pages/Ads';
import Categories from './pages/Categories';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
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
    );
}

export default App;
