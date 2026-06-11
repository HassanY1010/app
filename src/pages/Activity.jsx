import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import {
    Bell,
    CheckCircle2,
    Loader2,
    MessageSquare,
    Phone,
    Search,
    Star,
    Trash2,
} from 'lucide-react';

const tabs = [
    {
        key: 'reviews',
        label: 'تقييمات التطبيق',
        icon: Star,
        endpoint: '/admin/app-reviews',
        description: 'مراجعة تقييمات المستخدمين وتعليقاتهم داخل التطبيق.',
    },
    {
        key: 'messages',
        label: 'الرسائل',
        icon: MessageSquare,
        endpoint: '/admin/messages',
        description: 'متابعة رسائل المحادثات وحذف المخالف منها عند الحاجة.',
    },
    {
        key: 'notifications',
        label: 'الإشعارات',
        icon: Bell,
        endpoint: '/admin/notifications',
        description: 'عرض الإشعارات المرسلة وحالتها لكل مستخدم.',
    },
    {
        key: 'savedSearches',
        label: 'البحث المحفوظ',
        icon: Search,
        endpoint: '/admin/saved-searches',
        description: 'إدارة التنبيهات المرتبطة بعمليات البحث المحفوظة.',
    },
    {
        key: 'phones',
        label: 'توثيق الهاتف',
        icon: Phone,
        endpoint: '/admin/phone-verifications',
        description: 'التحقق من حالة أرقام الهاتف وتحديث التوثيق يدويا.',
    },
];

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
    if (!user) return 'مستخدم غير معروف';
    return `${user.name || 'بدون اسم'}${user.phone ? ` · ${user.phone}` : ''}`;
};

const InfoPill = ({ children, tone = 'slate' }) => {
    const styles = {
        slate: 'bg-slate-50 text-slate-600 border-slate-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        violet: 'bg-violet-50 text-violet-700 border-violet-100',
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black ${styles[tone]}`}>
            {children}
        </span>
    );
};

const Activity = () => {
    const [activeTab, setActiveTab] = useState('reviews');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    const currentTab = useMemo(() => tabs.find((tab) => tab.key === activeTab), [activeTab]);
    const CurrentIcon = currentTab.icon;

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = { page, search };

            if (filter !== '') {
                if (activeTab === 'reviews') params.rating = filter;
                if (activeTab === 'messages') params.message_type = filter;
                if (activeTab === 'notifications') params.is_read = filter;
                if (activeTab === 'savedSearches') params.notify_enabled = filter;
                if (activeTab === 'phones') params.verified = filter;
            }

            const response = await api.get(currentTab.endpoint, { params });
            setItems(response.data.data || []);
            setTotalPages(Math.max(1, Math.ceil(response.data.total / response.data.per_page)));
        } catch (error) {
            console.error('Error fetching activity:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchItems, 350);
        return () => clearTimeout(timer);
    }, [activeTab, page, search, filter]);

    const switchTab = (key) => {
        setActiveTab(key);
        setPage(1);
        setFilter('');
        setSearch('');
    };

    const deleteItem = async (endpoint, id, message) => {
        if (!window.confirm(message)) return;

        setActionLoading(`${endpoint}-${id}`);
        try {
            await api.delete(`${endpoint}/${id}`);
            fetchItems();
        } catch (error) {
            alert('فشلت العملية: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const updateSavedSearch = async (item) => {
        setActionLoading(`saved-${item.id}`);
        try {
            await api.patch(`/admin/saved-search/${item.id}`, {
                notify_enabled: !item.notify_enabled,
            });
            fetchItems();
        } catch (error) {
            alert('فشل تحديث البحث المحفوظ: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const updatePhoneVerification = async (item) => {
        setActionLoading(`phone-${item.id}`);
        try {
            await api.patch(`/admin/phone-verification/${item.id}`, {
                verified: !item.phone_verified_at,
            });
            fetchItems();
        } catch (error) {
            alert('فشل تحديث توثيق الهاتف: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setActionLoading(null);
        }
    };

    const renderFilters = () => {
        if (activeTab === 'reviews') {
            return (
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input sm:max-w-[180px]">
                    <option value="">كل التقييمات</option>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>{rating} نجوم</option>
                    ))}
                </select>
            );
        }

        if (activeTab === 'messages') {
            return (
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input sm:max-w-[180px]">
                    <option value="">كل الرسائل</option>
                    <option value="text">نصية</option>
                    <option value="image">صور</option>
                    <option value="file">ملفات</option>
                </select>
            );
        }

        if (activeTab === 'notifications') {
            return (
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input sm:max-w-[180px]">
                    <option value="">كل الحالات</option>
                    <option value="0">غير مقروءة</option>
                    <option value="1">مقروءة</option>
                </select>
            );
        }

        if (activeTab === 'savedSearches') {
            return (
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input sm:max-w-[180px]">
                    <option value="">كل التنبيهات</option>
                    <option value="1">مفعلة</option>
                    <option value="0">متوقفة</option>
                </select>
            );
        }

        return (
            <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input sm:max-w-[180px]">
                <option value="">كل الأرقام</option>
                <option value="1">موثقة</option>
                <option value="0">غير موثقة</option>
            </select>
        );
    };

    const renderItem = (item) => {
        if (activeTab === 'reviews') {
            return (
                <ActivityCard key={item.id} icon={<Star size={22} />} title={userLabel(item.user)} subtitle={formatDate(item.created_at)}>
                    <div className="flex flex-wrap items-center gap-2">
                        <InfoPill tone="amber">{item.rating} / 5</InfoPill>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-gray-700 whitespace-pre-wrap">{item.comment || 'لا يوجد تعليق مكتوب.'}</p>
                    <CardActions>
                        <DangerButton
                            loading={actionLoading === `/admin/app-review-${item.id}`}
                            onClick={() => deleteItem('/admin/app-review', item.id, 'هل تريد حذف هذا التقييم؟')}
                        >
                            حذف التقييم
                        </DangerButton>
                    </CardActions>
                </ActivityCard>
            );
        }

        if (activeTab === 'messages') {
            return (
                <ActivityCard key={item.id} icon={<MessageSquare size={22} />} title={`${userLabel(item.sender)} → ${userLabel(item.receiver)}`} subtitle={formatDate(item.created_at)}>
                    <div className="flex flex-wrap items-center gap-2">
                        <InfoPill tone="blue">{item.message_type || 'text'}</InfoPill>
                        <InfoPill tone={item.is_read ? 'green' : 'amber'}>{item.is_read ? 'مقروءة' : 'غير مقروءة'}</InfoPill>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-gray-700 whitespace-pre-wrap">{item.message || item.file_name || 'رسالة بدون نص.'}</p>
                    {item.file_url && (
                        <a className="mt-3 inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-800" href={item.file_url} target="_blank" rel="noreferrer">
                            فتح المرفق
                        </a>
                    )}
                    <CardActions>
                        <DangerButton
                            loading={actionLoading === `/admin/message-${item.id}`}
                            onClick={() => deleteItem('/admin/message', item.id, 'هل تريد حذف هذه الرسالة؟')}
                        >
                            حذف الرسالة
                        </DangerButton>
                    </CardActions>
                </ActivityCard>
            );
        }

        if (activeTab === 'notifications') {
            return (
                <ActivityCard key={item.id} icon={<Bell size={22} />} title={item.title || 'إشعار بدون عنوان'} subtitle={`${userLabel(item.user)} · ${formatDate(item.created_at)}`}>
                    <div className="flex flex-wrap items-center gap-2">
                        <InfoPill tone="violet">{item.type || 'عام'}</InfoPill>
                        <InfoPill tone={item.is_read ? 'green' : 'amber'}>{item.is_read ? 'مقروء' : 'غير مقروء'}</InfoPill>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-gray-700 whitespace-pre-wrap">{item.message || 'لا توجد رسالة.'}</p>
                    <CardActions>
                        <DangerButton
                            loading={actionLoading === `/admin/notification-${item.id}`}
                            onClick={() => deleteItem('/admin/notification', item.id, 'هل تريد حذف هذا الإشعار؟')}
                        >
                            حذف الإشعار
                        </DangerButton>
                    </CardActions>
                </ActivityCard>
            );
        }

        if (activeTab === 'savedSearches') {
            return (
                <ActivityCard key={item.id} icon={<Search size={22} />} title={item.name || 'بحث محفوظ'} subtitle={`${userLabel(item.user)} · ${formatDate(item.created_at)}`}>
                    <div className="flex flex-wrap items-center gap-2">
                        <InfoPill tone={item.notify_enabled ? 'green' : 'slate'}>
                            {item.notify_enabled ? 'التنبيه مفعل' : 'التنبيه متوقف'}
                        </InfoPill>
                        {item.last_notified_at && <InfoPill tone="blue">آخر تنبيه: {formatDate(item.last_notified_at)}</InfoPill>}
                    </div>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100" dir="ltr">
                        {JSON.stringify(item.filters || {}, null, 2)}
                    </pre>
                    <CardActions>
                        <button
                            onClick={() => updateSavedSearch(item)}
                            disabled={actionLoading === `saved-${item.id}`}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-5 py-3 text-xs font-black text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
                        >
                            {actionLoading === `saved-${item.id}` ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                            {item.notify_enabled ? 'إيقاف التنبيه' : 'تفعيل التنبيه'}
                        </button>
                        <DangerButton
                            loading={actionLoading === `/admin/saved-search-${item.id}`}
                            onClick={() => deleteItem('/admin/saved-search', item.id, 'هل تريد حذف هذا البحث المحفوظ؟')}
                        >
                            حذف البحث
                        </DangerButton>
                    </CardActions>
                </ActivityCard>
            );
        }

        return (
            <ActivityCard key={item.id} icon={<Phone size={22} />} title={userLabel(item)} subtitle={`انضم في ${formatDate(item.created_at)}`}>
                <div className="flex flex-wrap items-center gap-2">
                    <InfoPill tone={item.phone_verified_at ? 'green' : 'red'}>
                        {item.phone_verified_at ? 'الهاتف موثق' : 'الهاتف غير موثق'}
                    </InfoPill>
                    <InfoPill tone={item.is_active ? 'green' : 'slate'}>{item.is_active ? 'حساب نشط' : 'حساب متوقف'}</InfoPill>
                    <InfoPill tone="blue">{item.role || 'user'}</InfoPill>
                </div>
                {item.phone_verified_at && (
                    <p className="mt-3 text-xs font-bold text-gray-500">وقت التوثيق: {formatDate(item.phone_verified_at)}</p>
                )}
                <CardActions>
                    <button
                        onClick={() => updatePhoneVerification(item)}
                        disabled={actionLoading === `phone-${item.id}`}
                        className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition disabled:opacity-60 ${
                            item.phone_verified_at
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                    >
                        {actionLoading === `phone-${item.id}` ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                        {item.phone_verified_at ? 'إلغاء التوثيق' : 'توثيق الهاتف'}
                    </button>
                </CardActions>
            </ActivityCard>
        );
    };

    return (
        <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-indigo-100 bg-white shadow-sm">
                <div className="bg-gradient-to-l from-indigo-600 via-blue-600 to-cyan-500 p-5 text-white sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                                <CurrentIcon size={25} />
                            </div>
                            <h1 className="text-2xl font-black sm:text-3xl">النشاط والإدارة التشغيلية</h1>
                            <p className="mt-2 max-w-2xl text-sm font-semibold text-white/85">{currentTab.description}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-gray-100 bg-gray-50/70 p-3 md:grid-cols-5">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => switchTab(tab.key)}
                                className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-black transition ${
                                    isActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-white/70 hover:text-gray-800'
                                }`}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="ابحث بالاسم أو الهاتف أو النص..."
                            className="input pr-11"
                        />
                    </div>
                    {renderFilters()}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="card flex flex-col items-center justify-center py-14 text-gray-500">
                        <Loader2 className="mb-3 animate-spin text-indigo-600" />
                        جاري تحميل البيانات...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-14 text-center font-bold text-gray-500">
                        لا توجد بيانات مطابقة حاليا
                    </div>
                ) : (
                    items.map(renderItem)
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn bg-white text-gray-700 disabled:opacity-50">
                        السابق
                    </button>
                    <span className="text-sm font-bold text-gray-500">صفحة {page} من {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn bg-white text-gray-700 disabled:opacity-50">
                        التالي
                    </button>
                </div>
            )}
        </div>
    );
};

const ActivityCard = ({ icon, title, subtitle, children }) => (
    <div className="card overflow-hidden p-4 transition hover:shadow-md sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="truncate text-base font-black text-gray-900">{title}</h3>
                    <span className="text-xs font-bold text-gray-400">{subtitle}</span>
                </div>
                <div className="mt-3">{children}</div>
            </div>
        </div>
    </div>
);

const CardActions = ({ children }) => (
    <div className="mt-5 flex flex-col gap-2 border-t border-gray-50 pt-4 sm:flex-row sm:justify-end">
        {children}
    </div>
);

const DangerButton = ({ children, loading, onClick }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60"
    >
        {loading ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}
        {children}
    </button>
);

export default Activity;
