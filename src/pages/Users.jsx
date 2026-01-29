import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Loader2, X, Check, Trash2 } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: {
                    search,
                    page
                }
            });
            setUsers(response.data.data);
            setTotalPages(Math.ceil(response.data.total / response.data.per_page));
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleToggleStatus = async (user) => {
        setActionLoading(user.id);
        try {
            await api.patch(`/admin/user/${user.id}/status`, {
                is_active: !user.is_active
            });
            fetchUsers();
        } catch (error) {
            alert('فشلت العملية: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`هل أنت متأكد من تغيير رتبة المستخدم إلى ${newRole === 'admin' ? 'مدير' : 'مستخدم عادي'}؟`)) {
            return;
        }

        setActionLoading(user.id);
        try {
            await api.patch(`/admin/user/${user.id}/role`, {
                role: newRole
            });
            fetchUsers();
        } catch (error) {
            alert('فشلت العملية: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟ سيتم حذف جميع بياناته وإعلاناته.')) {
            return;
        }

        setActionLoading(id);
        try {
            await api.delete(`/admin/user/${id}`);
            fetchUsers();
        } catch (error) {
            alert('فشل الحذف: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="px-1 sm:px-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">عرض والتحكم في حسابات المستخدمين</p>
                </div>

                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو رقم الهاتف..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10 bg-white shadow-sm border-gray-100"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            <div className="card overflow-hidden border-none sm:border sm:border-gray-100 shadow-none sm:shadow-sm bg-transparent sm:bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 border-b border-gray-100 hidden sm:table-header-group">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">المستخدم</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">رقم الهاتف</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">الرتبة</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="animate-spin mx-auto mb-2" />
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">لا يوجد مستخدمين</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors flex flex-col sm:table-row p-4 sm:p-0 mb-4 sm:mb-0 bg-white rounded-2xl border border-gray-100 sm:border-0 sm:rounded-none shadow-sm sm:shadow-none">
                                        <td className="px-0 py-2 sm:px-6 sm:py-4 border-b border-gray-50 sm:border-0 pb-3 sm:pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-bold sm:font-medium text-gray-900 block truncate text-base sm:text-sm">{user.name}</span>
                                                    <span className="text-xs text-indigo-500 font-mono sm:hidden" dir="ltr">{user.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-0 py-2 sm:px-6 sm:py-4 text-gray-600 font-mono hidden sm:table-cell" dir="ltr text-sm">{user.phone}</td>
                                        <td className="px-0 py-3 sm:px-6 sm:py-4 border-b border-gray-50 sm:border-0">
                                            <div className="flex items-center justify-between sm:justify-start gap-4">
                                                <span className="text-xs text-gray-400 sm:hidden font-medium">الرتبة:</span>
                                                <button
                                                    onClick={() => handleToggleRole(user)}
                                                    className={`inline-flex items-center px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold sm:font-medium transition-colors ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                >
                                                    {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-0 py-3 sm:px-6 sm:py-4 border-b border-gray-50 sm:border-0">
                                            <div className="flex items-center justify-between sm:justify-start gap-4">
                                                <span className="text-xs text-gray-400 sm:hidden font-medium">الحالة:</span>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`inline-flex items-center px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold sm:font-medium transition-colors ${user.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                                >
                                                    {user.is_active ? 'نشط' : 'محظور'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-0 py-3 sm:px-6 sm:py-4">
                                            <div className="flex items-center justify-between sm:justify-start gap-2">
                                                <span className="text-xs text-gray-400 sm:hidden font-medium">إجراءات:</span>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 sm:p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-50 sm:border-0 w-full sm:w-auto mt-2 sm:mt-0"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={18} />
                                                    <span className="text-xs font-bold sm:hidden">حذف المستخدم</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50"
                    >
                        السابق
                    </button>
                    <span className="text-sm text-gray-600">صفحة {page} من {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50"
                    >
                        التالي
                    </button>
                </div>
            )}
        </div>
    );
};

export default Users;
