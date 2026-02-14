import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Filter, Check, X, Trash2, Eye, Loader2, MoreVertical, ExternalLink, User, LayoutDashboard, MapPin, Tag, Clock, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';


const Ads = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    const [selectedAd, setSelectedAd] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchAdDetails = async (id) => {
        try {
            setDetailsLoading(true);
            const response = await api.get(`/admin/ad/${id}`);
            // response.data.data because AdResource wraps in data
            setSelectedAd(response.data.data);
        } catch (error) {
            console.error('Error fetching ad details:', error);
            alert('فشل تحميل تفاصيل الإعلان');
        } finally {
            setDetailsLoading(false);
        }
    };

    const fetchAds = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/ads', {
                params: {
                    search,
                    status: statusFilter,
                    page,
                }
            });
            setAds(response.data.data);
            setTotalPages(Math.ceil(response.data.meta.total / response.data.meta.per_page));
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchAds, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter, page]);

    const handleUpdateStatus = async (id, newStatus) => {
        if (!window.confirm(`هل أنت متأكد من تغيير حالة الإعلان إلى ${newStatus === 'active' ? 'نشط' : 'مرفوض'}؟`)) {
            return;
        }

        let rejectReason = null;
        if (newStatus === 'rejected') {
            rejectReason = window.prompt('يرجى إدخال سبب الرفض:');
            if (rejectReason === null) return;
        }

        setActionLoading(id);
        try {
            await api.post(`/admin/ad/${id}/update-status`, {
                status: newStatus,
                reject_reason: rejectReason
            });
            fetchAds();
            if (selectedAd && selectedAd.id === id) {
                fetchAdDetails(id);
            }
        } catch (error) {
            alert('فشلت العملية: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) {
            return;
        }

        setActionLoading(id);
        try {
            await api.delete(`/admin/ad/${id}`);
            fetchAds();
            if (selectedAd && selectedAd.id === id) {
                setSelectedAd(null);
            }
        } catch (error) {
            alert('فشل الحذف: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivateFeatured = async (id) => {
        if (!window.confirm('هل أنت متأكد من تفعيل الإعلان المميز لمدة 7 أيام؟')) {
            return;
        }

        setActionLoading(id);
        try {
            await api.post(`/admin/ad/${id}/activate-featured`, {
                duration_days: 7
            });
            fetchAds();
            if (selectedAd && selectedAd.id === id) {
                fetchAdDetails(id);
            }
            alert('تم تفعيل الإعلان المميز بنجاح لمدة 7 أيام');
        } catch (error) {
            alert('فشلت العملية: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeactivateFeatured = async (id) => {
        if (!window.confirm('هل أنت متأكد من إلغاء تفعيل الإعلان المميز؟')) {
            return;
        }

        setActionLoading(id);
        try {
            await api.post(`/admin/ad/${id}/deactivate-featured`);
            fetchAds();
            if (selectedAd && selectedAd.id === id) {
                fetchAdDetails(id);
            }
            alert('تم إلغاء تفعيل الإعلان المميز بنجاح');
        } catch (error) {
            alert('فشلت العملية: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-800';
            case 'pending': return 'bg-amber-100 text-amber-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'sold': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'pending': return 'قيد المراجعة';
            case 'rejected': return 'مرفوض';
            case 'sold': return 'تم البيع';
            case 'expired': return 'منتهي';
            default: return status;
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="px-1 sm:px-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">إدارة الإعلانات</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">مراجعة والتحكم في الإعلانات المنشورة</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <input
                            type="text"
                            placeholder="بحث في الإعلانات..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10 bg-white shadow-sm border-gray-100"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input sm:w-40 bg-white shadow-sm border-gray-100 font-bold text-sm"
                    >
                        <option value="">جميع الحالات</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="active">نشطة</option>
                        <option value="rejected">مرفوضة</option>
                        <option value="sold">تم البيع</option>
                    </select>
                </div>
            </div>

            <div className="card overflow-hidden border-none sm:border sm:border-gray-100 shadow-none sm:shadow-sm bg-transparent sm:bg-white">
                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100 hidden sm:table-header-group">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">الإعلان</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">المعلن</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">التصنيف</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">السعر</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">التحكم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="animate-spin mx-auto mb-2 text-indigo-500" size={32} />
                                        <p className="text-sm">جاري تحميل البيانات...</p>
                                    </td>
                                </tr>
                            ) : ads.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <LayoutDashboard className="mx-auto mb-2 opacity-20" size={48} />
                                        <p>لا توجد إعلانات مطابقة للبحث</p>
                                    </td>
                                </tr>
                            ) : (
                                ads.map((ad) => (
                                    <tr key={ad.id} className="hover:bg-gray-50 transition-colors flex flex-col sm:table-row p-4 sm:p-0 mb-4 sm:mb-0 bg-white rounded-2xl border border-gray-100 sm:border-0 shadow-sm sm:shadow-none">
                                        <td className="px-0 py-2 sm:px-6 sm:py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 shadow-sm relative">
                                                    {ad.main_image ? (
                                                        <img src={ad.main_image.thumbnail_url || ad.main_image.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <LayoutDashboard size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-gray-900 truncate text-base sm:text-sm mb-1">{ad.title}</p>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-gray-500 items-center">
                                                        <span className="flex items-center gap-1 text-[10px] sm:text-xs"><Clock size={12} /> {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: ar })}</span>
                                                        <span className="flex items-center gap-1 text-[10px] sm:text-xs sm:hidden text-indigo-600 font-black">{ad.price} ر.ي</span>
                                                        <span className="text-[10px] md:hidden flex items-center gap-1 font-medium"><User size={12} /> {ad.user?.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-0 py-2 sm:px-6 sm:py-4 hidden md:table-cell">
                                            <div className="text-sm font-bold text-gray-800">{ad.user?.name}</div>
                                            <div className="text-xs text-gray-500">{ad.user?.phone}</div>
                                        </td>
                                        <td className="px-0 py-2 sm:px-6 sm:py-4 text-sm text-gray-600 hidden lg:table-cell">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{ad.category?.title}</span>
                                        </td>
                                        <td className="px-0 py-2 sm:px-6 sm:py-4 text-sm font-black text-indigo-600 hidden sm:table-cell">{ad.price} <span className="text-[10px] mr-1">ر.ي</span></td>
                                        <td className="px-0 py-3 sm:px-6 sm:py-4 border-b border-gray-50 sm:border-0">
                                            <div className="flex items-center justify-between sm:justify-start">
                                                <span className="text-xs text-gray-400 sm:hidden font-medium">الحالة:</span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${getStatusColor(ad.status)}`}>
                                                    {getStatusText(ad.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-0 py-4 sm:px-6 sm:py-4">
                                            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3">
                                                <button
                                                    onClick={() => fetchAdDetails(ad.id)}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-3 sm:py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all text-xs font-bold shadow-sm border border-indigo-100 sm:border-0"
                                                >
                                                    <Eye size={16} />
                                                    <span>التفاصيل</span>
                                                </button>

                                                <div className="grid grid-cols-4 sm:flex gap-2 w-full sm:w-auto">
                                                    {ad.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ad.id, 'active')}
                                                            className="flex flex-col sm:flex-row items-center justify-center p-2 sm:p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100"
                                                            title="قبول"
                                                        >
                                                            <Check size={18} />
                                                            <span className="sm:hidden text-[9px] font-bold mt-1">قبول</span>
                                                        </button>
                                                    )}

                                                    {ad.status !== 'rejected' && ad.status !== 'sold' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ad.id, 'rejected')}
                                                            className="flex flex-col sm:flex-row items-center justify-center p-2 sm:p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all border border-amber-100"
                                                            title="رفض"
                                                        >
                                                            <X size={18} />
                                                            <span className="sm:hidden text-[9px] font-bold mt-1">رفض</span>
                                                        </button>
                                                    )}

                                                    {ad.is_featured ? (
                                                        <button
                                                            onClick={() => handleDeactivateFeatured(ad.id)}
                                                            className="flex flex-col sm:flex-row items-center justify-center p-2 sm:p-1.5 bg-yellow-400 text-white hover:bg-yellow-500 rounded-xl transition-all shadow-md shadow-yellow-100 border border-yellow-400"
                                                            title="إلغاء التمييز"
                                                        >
                                                            <Star size={18} fill="currentColor" />
                                                            <span className="sm:hidden text-[9px] font-bold mt-1">مميز</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivateFeatured(ad.id)}
                                                            className="flex flex-col sm:flex-row items-center justify-center p-2 sm:p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-all border border-purple-100"
                                                            title="تمييز"
                                                        >
                                                            <Star size={18} />
                                                            <span className="sm:hidden text-[9px] font-bold mt-1">تمييز</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDelete(ad.id)}
                                                        className="flex flex-col sm:flex-row items-center justify-center p-2 sm:p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={18} />
                                                        <span className="sm:hidden text-[9px] font-bold mt-1">حذف</span>
                                                    </button>
                                                </div>
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
                <div className="flex justify-center items-center gap-2 pt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-sm disabled:opacity-50 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        السابق
                    </button>
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-sm">
                        صفحة {page} من {totalPages}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-sm disabled:opacity-50 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* Ad Details Modal */}
            {selectedAd && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-none sm:rounded-[2rem] w-full max-w-5xl min-h-screen sm:min-h-0 sm:max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="px-4 py-4 sm:px-8 sm:py-5 border-b flex justify-between items-center bg-white sticky top-0 z-10 sm:relative sm:z-0">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-2xl font-black text-gray-900 truncate mb-0.5 sm:mb-1">{selectedAd.title}</h3>
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500 font-bold">
                                    <span className="flex items-center gap-1"><Clock size={12} className="text-indigo-400" /> {formatDistanceToNow(new Date(selectedAd.created_at), { addSuffix: true, locale: ar })}</span>
                                    <span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-400" /> {selectedAd.location}</span>
                                    <span className="hidden sm:flex items-center gap-1"><Tag size={12} className="text-indigo-400" /> {selectedAd.category?.title}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAd(null)}
                                className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition-all text-gray-400 ml-2"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 pb-32 sm:pb-8">
                            {/* Images Gallery */}
                            <section>
                                <h4 className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                    معرض الصور
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                    {selectedAd.images && selectedAd.images.length > 0 ? (
                                        selectedAd.images.map((img, idx) => (
                                            <div key={idx} className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 group relative shadow-sm">
                                                <img
                                                    src={img.thumbnail_url || img.image_url}
                                                    alt=""
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <a
                                                    href={img.image_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-[2px] transition-opacity"
                                                >
                                                    <div className="w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                                        <ExternalLink size={16} />
                                                    </div>
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-10 bg-gray-50 flex flex-col items-center justify-center rounded-2xl text-gray-400 border-2 border-dashed border-gray-100">
                                            <LayoutDashboard size={48} className="mb-2 opacity-5" />
                                            <p className="font-bold text-sm">لا توجد صور لهذا الإعلان</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="flex flex-col lg:flex-row-reverse gap-6 sm:gap-8 items-start">
                                {/* Sidebar Info - Full width on mobile */}
                                <div className="w-full lg:w-80 space-y-4 sm:space-y-6 flex-shrink-0">
                                    <div className="bg-indigo-600 p-6 rounded-2xl sm:rounded-3xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                                        <span className="text-[10px] text-indigo-100 font-bold uppercase block mb-1">السعر</span>
                                        <div className="text-3xl font-black">{selectedAd.price} <span className="text-base font-normal opacity-70">ر.ي</span></div>
                                        {selectedAd.is_negotiable && (
                                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-lg text-[10px] font-bold border border-white/10">
                                                قابل للتفاوض
                                            </div>
                                        )}
                                    </div>

                                    <div className="card p-4 sm:p-5 space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={14} className="text-indigo-500" />
                                            معلومات المعلن
                                        </h4>
                                        <div className="flex items-center gap-4 py-2 border-b border-gray-50">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-50">
                                                {selectedAd.user?.avatar_url ? (
                                                    <img src={selectedAd.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="text-indigo-400" size={24} />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-bold text-gray-900 truncate text-base">{selectedAd.user?.name}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{selectedAd.user?.phone}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 text-xs">الحالة:</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(selectedAd.status)}`}>{getStatusText(selectedAd.status)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 text-xs">المشاهدات:</span>
                                                <div className="flex items-center gap-1 font-bold text-gray-900 text-xs">
                                                    <Eye size={12} className="text-indigo-400" />
                                                    {selectedAd.views}
                                                </div>
                                            </div>
                                            {selectedAd.is_featured && (
                                                <div className="flex justify-between items-center text-sm bg-yellow-50 -mx-5 px-5 py-2 border-y border-yellow-100">
                                                    <span className="text-yellow-700 text-xs font-bold flex items-center gap-1">
                                                        <Star size={12} fill="currentColor" />
                                                        إعلان مميز
                                                    </span>
                                                    {selectedAd.featured_until && (
                                                        <span className="text-[10px] text-yellow-600">
                                                            حتى {new Date(selectedAd.featured_until).toLocaleDateString('ar-YE')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 w-full space-y-6 sm:space-y-8 pb-4">
                                    <section>
                                        <h4 className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                            وصف الإعلان
                                        </h4>
                                        <div className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-wrap font-medium p-6 bg-gray-50 sm:bg-white rounded-2xl sm:rounded-none border-none sm:border-r-4 sm:border-indigo-100">
                                            {selectedAd.description}
                                        </div>
                                    </section>

                                    {selectedAd.custom_fields && selectedAd.custom_fields.length > 0 && (
                                        <section>
                                            <h4 className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                                مواصفات إضافية
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {selectedAd.custom_fields.map((field, idx) => (
                                                    <div key={idx} className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">{field.label}</span>
                                                        <span className="font-bold text-gray-900 text-sm">{field.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Fixed on Mobile */}
                        <div className="px-4 py-4 sm:px-8 sm:py-5 bg-white sm:bg-gray-50 border-t flex flex-row sm:flex-wrap justify-end gap-2 sm:gap-3 sticky bottom-0 z-20">
                            {selectedAd.status === 'pending' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedAd.id, 'active')}
                                    className="flex-1 sm:flex-none px-4 py-3 sm:px-8 bg-emerald-600 text-white font-black rounded-xl sm:rounded-2xl hover:bg-emerald-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    <span className="hidden sm:inline">قبول ونشر الإعلان</span>
                                    <span className="sm:hidden">قبول</span>
                                </button>
                            )}
                            {selectedAd.status !== 'rejected' && selectedAd.status !== 'sold' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedAd.id, 'rejected')}
                                    className="flex-1 sm:flex-none px-4 py-3 sm:px-8 bg-amber-600 text-white font-black rounded-xl sm:rounded-2xl hover:bg-amber-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                                >
                                    <X size={18} />
                                    <span className="hidden sm:inline">رفض الإعلان</span>
                                    <span className="sm:hidden">رفض</span>
                                </button>
                            )}
                            {selectedAd.is_featured ? (
                                <button
                                    onClick={() => handleDeactivateFeatured(selectedAd.id)}
                                    className="flex-1 sm:flex-none px-4 py-3 sm:px-8 bg-yellow-400 text-white font-black rounded-xl sm:rounded-2xl hover:bg-yellow-500 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-200 border-2 border-yellow-300"
                                >
                                    <Star size={18} fill="currentColor" />
                                    <span>الإعلان مميز حالياً (إلغاء)</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleActivateFeatured(selectedAd.id)}
                                    className="flex-1 sm:flex-none px-4 py-3 sm:px-8 bg-purple-600 text-white font-black rounded-xl sm:rounded-2xl hover:bg-purple-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                                >
                                    <Star size={18} />
                                    <span className="hidden sm:inline">تفعيل الإعلان المميز (7 أيام)</span>
                                    <span className="sm:hidden">تمييز</span>
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(selectedAd.id)}
                                className="w-12 h-12 sm:w-auto sm:px-8 sm:py-3 bg-red-50 text-red-600 border border-red-100 font-black rounded-xl sm:rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={20} />
                                <span className="hidden sm:inline">حذف نهائي</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ads;
