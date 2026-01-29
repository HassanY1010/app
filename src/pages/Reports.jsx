import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Filter, CheckCircle, Trash2, AlertTriangle, Eye, Loader2, X, MessageSquare } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [resolving, setResolving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/reports', {
                params: {
                    status: statusFilter,
                    page,
                }
            });
            setReports(response.data.data);
            setTotalPages(Math.ceil(response.data.total / response.data.per_page));
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter, page]);

    const handleResolve = async (e) => {
        e.preventDefault();
        setResolving(true);
        try {
            await api.post(`/admin/report/${selectedReport.id}/resolve`, {
                admin_notes: adminNotes
            });
            fetchReports();
            setSelectedReport(null);
            setAdminNotes('');
        } catch (error) {
            alert('فشلت العملية: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setResolving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا البلاغ؟')) {
            return;
        }

        setActionLoading(id);
        try {
            await api.delete(`/admin/report/${id}`);
            fetchReports();
        } catch (error) {
            alert('فشل الحذف: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteAd = async (report) => {
        if (!report.ad) return;

        if (!window.confirm(`هل أنت متأكد من حذف الإعلان "${report.ad.title}" نهائياً من التطبيق؟`)) {
            return;
        }

        setActionLoading(`ad-${report.id}`);
        try {
            await api.delete(`/admin/ad/${report.ad.id}`);
            alert('تم حذف الإعلان بنجاح');
            // After deleting the ad, we might want to resolve the report as well
            if (report.status === 'pending') {
                await api.post(`/admin/report/${report.id}/resolve`, {
                    admin_notes: 'تم حذف الإعلان المخالف'
                });
            }
            fetchReports();
            if (selectedReport && selectedReport.id === report.id) {
                setSelectedReport(null);
            }
        } catch (error) {
            alert('فشل حذف الإعلان: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة البلاغات</h1>
                    <p className="text-gray-500 text-sm mt-1">مراجعة شكاوى المستخدمين والتعامل مع المخالفات</p>
                </div>

                <div className="flex w-full sm:w-auto bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${statusFilter === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        بلاغات جديدة
                    </button>
                    <button
                        onClick={() => setStatusFilter('resolved')}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${statusFilter === 'resolved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        تمت المراجعة
                    </button>
                    <button
                        onClick={() => setStatusFilter('')}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${statusFilter === '' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        الكل
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
                        <Loader2 className="animate-spin mb-2" />
                        جاري تحميل البلاغات...
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500">
                        لا توجد بلاغات حالياً
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${report.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="space-y-3 min-w-0 flex-1">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-gray-900 text-base sm:text-lg">{report.reporter?.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">{new Date(report.created_at).toLocaleDateString('ar-YE')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-gray-400 text-xs font-medium">عن:</span>
                                            <span className="font-bold text-indigo-600 text-xs truncate">#{report.ad?.id} {report.ad?.title}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{report.reason || report.content}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${report.type === 'spam' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                            {report.type === 'spam' ? 'إزعاج' : report.type}
                                        </span>
                                        {report.status === 'resolved' && (
                                            <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                تمت المعالجة
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:flex sm:items-center sm:justify-end gap-3 mt-6 pt-6 border-t border-gray-50">
                                {report.status === 'pending' && (
                                    <button
                                        onClick={() => setSelectedReport(report)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all text-xs sm:text-sm shadow-md shadow-indigo-100"
                                    >
                                        <CheckCircle size={18} />
                                        <span>بدء المعالجة</span>
                                    </button>
                                )}
                                {report.ad && (
                                    <button
                                        onClick={() => handleDeleteAd(report)}
                                        disabled={actionLoading === `ad-${report.id}`}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all text-xs sm:text-sm"
                                    >
                                        {actionLoading === `ad-${report.id}` ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                        <span>حذف الإعلان المخالف</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(report.id)}
                                    disabled={actionLoading === report.id}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-400 border border-gray-100 font-bold rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all text-xs sm:text-sm"
                                >
                                    {actionLoading === report.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                    <span>تجاهل/حذف البلاغ</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 hover:bg-white"
                    >
                        السابق
                    </button>
                    <span className="text-sm text-gray-600 px-4">صفحة {page} من {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 hover:bg-white"
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* Resolve Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">معالجة البلاغ</h3>
                            <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <div className="flex gap-2 items-center text-amber-800 font-bold mb-1">
                                <AlertTriangle size={18} />
                                <span>تفاصيل البلاغ</span>
                            </div>
                            <p className="text-amber-900 text-sm">{selectedReport.reason || selectedReport.content}</p>
                        </div>

                        <form onSubmit={handleResolve} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات الإدارة (اختياري)</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="input min-h-[120px] pt-3"
                                    placeholder="اكتب الإجراء الذي تم اتخاذه..."
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReport(null)}
                                    className="btn flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                >
                                    إلغاء
                                </button>
                                {selectedReport.ad && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteAd(selectedReport)}
                                        disabled={actionLoading === `ad-${selectedReport.id}`}
                                        className="btn flex-1 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === `ad-${selectedReport.id}` ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                        حذف الإعلان
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={resolving}
                                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {resolving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                    تأكيد المعالجة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
