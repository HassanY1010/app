import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/admin/login', { phone, password });
            const token = response.data.access_token;
            localStorage.setItem('admin_token', token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-50">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="card p-6 sm:p-8 shadow-xl shadow-indigo-100/50">
                    <div className="text-center mb-8">
                        <div className="bg-indigo-600 w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-indigo-200 rotate-3 sm:rotate-6 hover:rotate-0 transition-transform duration-300">
                            <Lock size={32} className="sm:w-10 sm:h-10" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">لوحة التحكم</h1>
                        <p className="text-sm text-gray-400 font-medium">سجل الدخول لإدارة منصة الإعلانات</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="relative">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 mr-1">رقم الهاتف</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="input pr-11 py-3 bg-gray-50 border-gray-100 font-bold focus:bg-white"
                                    placeholder="أدخل رقم المدير"
                                    dir="ltr"
                                />
                                <Phone className="absolute right-4 top-3.5 text-indigo-400" size={18} />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 mr-1">كلمة المرور</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pr-11 py-3 bg-gray-50 border-gray-100 font-bold focus:bg-white"
                                    placeholder="أدخل كلمة المرور"
                                    dir="ltr"
                                />
                                <Lock className="absolute right-4 top-3.5 text-indigo-400" size={18} />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span className="font-black text-lg">تسجيل الدخول</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-gray-400 text-xs font-medium">
                    جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default Login;
