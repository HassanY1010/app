import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import {
    AlertTriangle,
    CheckCircle,
    FileWarning,
    Loader2,
    MessageSquare,
    ShieldAlert,
    Trash2,
    User,
    X,
} from 'lucide-react';

const typeMeta = {
    ad: {
        label: 'بلاغ إعلان',
        tone: 'blue',
        icon: FileWarning,
    },
    user: {
        label: 'بلاغ مستخدم/محادثة',
        tone: 'red',
        icon: User,
    },
    message: {
        label: 'بلاغ رسالة',
        tone: 'violet',
        icon: MessageSquare,
    },
};

const reasonLabels = {
    spam: 'إزعاج',
    fraud: 'احتيال',
    inappropriate: 'محتوى غير مناسب',
    fake: 'إعلان وهمي',
    offensive: 'إساءة',
    other: 'أخرى',
};

const badgeTone = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
};

const formatDate = (value) => {
    if (!value) return 'غير محدد';
    return new Date(value).toLocaleString('ar-YE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const userLabel = (user) => {
    if (!user) return 'غير محدد';
    return `${user.name || 'بدون اسم'}${user.phone ? ` · ${user.phone}` : ''}`;
};

const Badge = ({ children, tone = 'slate' }) => (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black ${badgeTone[tone]}`}>
        {children}
    </span>
);

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [typeFilter, setTypeFilter] = useState('');
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
                    type: typeFilter,
                    page,
                }
            });
            setReports(response.data.data || []);
            setTotalPages(Math.max(1, Math.ceil(response.data.total / response.data.per_page)));
        } catch (error) {
            console.error('Error fetching reports:', error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter, typeFilter, page]);

    const selectedMeta = useMemo(() => {
        if (!selectedReport) return null;
        return typeMeta[selectedReport.type] || typeMeta.ad;
    }, [selectedReport]);

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

        if (!window.confirm(`هل أنت متأكد من حذف الإعلان "${report.ad.title}" نهائيا من التطبيق؟`)) {
            return;
        }

        setActionLoading(`ad-${report.id}`);
        try {
            await api.delete(`/admin/ad/${report.ad.id}`);
            if (report.status === 'pending') {
                await api.post(`/admin/report/${report.id}/resolve`, {
                    admin_notes: 'تم حذف الإعلان المخالف'
                });
            }
            fetchReports();
            if (selectedReport?.id === report.id) {
                setSelectedReport(null);
            }
        } catch (error) {
            alert('فشل حذف الإعلان: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const renderReportCard = (report) => {
        const meta = typeMeta[report.type] || typeMeta.ad;
        const Icon = meta.icon;
        const reason = reasonLabels[report.reason] || report.reason || 'غير محدد';

        return (
            <div key={report.id} className="card overflow-hidden p-4 transition hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border ${badgeTone[meta.tone]}`}>
                        <Icon size={25} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge tone={meta.tone}>{meta.label}</Badge>
                                    <Badge tone={report.status === 'resolved' ? 'green' : 'amber'}>
                                        {report.status === 'resolved' ? 'تمت المعالجة' : 'بانتظار المعالجة'}
                                    </Badge>
                                    <Badge tone="slate">{reason}</Badge>
                                </div>
                                <h2 className="text-lg font-black text-gray-900">
                                    {report.type === 'ad' ? 'مخالفة على إعلان' : 'بلاغ على مستخدم من المحادثة'}
                                </h2>
                            </div>
                            <span className="whitespace-nowrap text-xs font-bold text-gray-400">{formatDate(report.created_at)}</span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <InfoBox label="المبلّغ" value={userLabel(report.reporter)} />
                            <InfoBox label="المبلّغ عنه" value={userLabel(report.reported_user)} important />
                            <InfoBox
                                label="الإعلان المرتبط"
                                value={report.ad ? `#${report.ad.id} · ${report.ad.title}` : 'لا يوجد إعلان مرتبط'}
                                muted={!report.ad}
                            />
                        </div>

                        {(report.description || report.reason) && (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">
                                    {report.description || reason}
                                </p>
                            </div>
                        )}

                        {report.status === 'resolved' && (
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                                <p className="font-black">تمت المعالجة بواسطة: {userLabel(report.resolver)}</p>
                                <p className="mt-1 text-xs font-bold text-emerald-700">وقت المعالجة: {formatDate(report.resolved_at)}</p>
                                {report.admin_notes && <p className="mt-2 leading-7">{report.admin_notes}</p>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-50 pt-5 sm:flex sm:items-center sm:justify-end">
                    {report.status === 'pending' && (
                        <button
                            onClick={() => setSelectedReport(report)}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 sm:text-sm"
                        >
                            <CheckCircle size={18} />
                            <span>معالجة البلاغ</span>
                        </button>
                    )}
                    {report.ad && (
                        <button
                            onClick={() => handleDeleteAd(report)}
                            disabled={actionLoading === `ad-${report.id}`}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-3 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-60 sm:text-sm"
                        >
                            {actionLoading === `ad-${report.id}` ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            <span>حذف الإعلان المرتبط</span>
                        </button>
                    )}
                    <button
                        onClick={() => handleDelete(report.id)}
                        disabled={actionLoading === report.id}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-3 text-xs font-bold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-60 sm:text-sm"
                    >
                        {actionLoading === report.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        <span>حذف البلاغ</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <ShieldAlert size={25} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">إدارة البلاغات</h1>
                    <p className="mt-1 max-w-2xl text-sm font-semibold text-gray-500">
                        عرض بلاغات الإعلانات والمستخدمين والمحادثات مع توضيح الطرف المبلّغ والطرف المبلّغ عنه.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid grid-cols-3 rounded-2xl border border-gray-100 bg-gray-100/60 p-1">
                        {[
                            ['pending', 'الجديدة'],
                            ['resolved', 'المعالجة'],
                            ['', 'الكل'],
                        ].map(([value, label]) => (
                            <button
                                key={label}
                                onClick={() => { setStatusFilter(value); setPage(1); }}
                                className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${
                                    statusFilter === value ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="input"
                    >
                        <option value="">كل أنواع البلاغات</option>
                        <option value="ad">بلاغات الإعلانات</option>
                        <option value="user">بلاغات المستخدمين/المحادثات</option>
                        <option value="message">بلاغات الرسائل</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="card flex flex-col items-center py-12 text-gray-500">
                        <Loader2 className="mb-2 animate-spin text-indigo-600" />
                        جاري تحميل البلاغات...
                    </div>
                ) : reports.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-12 text-center font-bold text-gray-500">
                        لا توجد بلاغات مطابقة حاليا
                    </div>
                ) : (
                    reports.map(renderReportCard)
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-white disabled:opacity-50"
                    >
                        السابق
                    </button>
                    <span className="px-4 text-sm text-gray-600">صفحة {page} من {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-white disabled:opacity-50"
                    >
                        التالي
                    </button>
                </div>
            )}

            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-4 shadow-xl sm:rounded-3xl sm:p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <Badge tone={selectedMeta.tone}>{selectedMeta.label}</Badge>
                                <h3 className="mt-2 text-xl font-black text-gray-900">معالجة البلاغ</h3>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <InfoBox label="المبلّغ" value={userLabel(selectedReport.reporter)} />
                            <InfoBox label="المبلّغ عنه" value={userLabel(selectedReport.reported_user)} important />
                        </div>

                        {selectedReport.ad && (
                            <div className="mt-3">
                                <InfoBox label="الإعلان المرتبط" value={`#${selectedReport.ad.id} · ${selectedReport.ad.title}`} />
                            </div>
                        )}

                        <div className="my-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                            <div className="mb-1 flex items-center gap-2 font-bold text-amber-800">
                                <AlertTriangle size={18} />
                                <span>تفاصيل البلاغ</span>
                            </div>
                            <p className="text-sm leading-7 text-amber-950 whitespace-pre-wrap">
                                {selectedReport.description || reasonLabels[selectedReport.reason] || selectedReport.reason || 'لا توجد تفاصيل إضافية.'}
                            </p>
                        </div>

                        <form onSubmit={handleResolve} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700">ملاحظات الإدارة (اختياري)</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="input min-h-[120px] pt-3"
                                    placeholder="اكتب الإجراء الذي تم اتخاذه..."
                                />
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
                                        className="btn flex flex-1 items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60"
                                    >
                                        {actionLoading === `ad-${selectedReport.id}` ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                        حذف الإعلان
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={resolving}
                                    className="btn btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-60"
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

const InfoBox = ({ label, value, important = false, muted = false }) => (
    <div className={`rounded-2xl border p-4 ${important ? 'border-red-100 bg-red-50/60' : 'border-gray-100 bg-white'} ${muted ? 'opacity-70' : ''}`}>
        <p className="mb-1 text-[11px] font-black text-gray-400">{label}</p>
        <p className={`truncate text-sm font-black ${important ? 'text-red-700' : 'text-gray-800'}`}>{value}</p>
    </div>
);

export default Reports;
