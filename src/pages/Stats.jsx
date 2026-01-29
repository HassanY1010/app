import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, LayoutDashboard, AlertCircle, List, Activity, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Stats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
        <div className="card p-4 sm:p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div className={`p-2 sm:p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] sm:text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <ArrowUpRight size={14} className="sm:w-4 sm:h-4" /> : <ArrowDownRight size={14} className="sm:w-4 sm:h-4" />}
                        <span className="font-bold">{trendValue}</span>
                    </div>
                )}
            </div>
            <div className="mt-3 sm:mt-4">
                <p className="text-[10px] sm:text-sm font-medium text-gray-500 truncate">{title}</p>
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 mt-0.5 sm:mt-1">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="px-1 sm:px-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">الرئيسية</h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">نظرة عامة على أداء المنصة والنشاط الحالي</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard
                    title="إجمالي المستخدمين"
                    value={stats.total_users}
                    icon={<Users size={20} className="sm:w-6 sm:h-6" />}
                    color="bg-indigo-500"
                    trend="up"
                    trendValue={`+${stats.new_users_today}`}
                />
                <StatCard
                    title="الإعلانات النشطة"
                    value={stats.active_ads}
                    icon={<LayoutDashboard size={20} className="sm:w-6 sm:h-6" />}
                    color="bg-emerald-500"
                    trend="up"
                    trendValue={stats.new_ads_today}
                />
                <StatCard
                    title="بلاغات معلقة"
                    value={stats.pending_reports}
                    icon={<AlertCircle size={20} className="sm:w-6 sm:h-6" />}
                    color="bg-amber-500"
                />
                <StatCard
                    title="جلسات نشطة"
                    value={stats.active_sessions}
                    icon={<Activity size={20} className="sm:w-6 sm:h-6" />}
                    color="bg-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Users Breakdown */}
                <div className="card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">تفاصيل المستخدمين</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">نشطون</span>
                            <span className="font-bold text-emerald-600">{stats.active_users}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(stats.active_users / stats.total_users) * 100}%` }}></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
                            <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                                <p className="text-[10px] sm:text-xs text-gray-500">مشرفون</p>
                                <p className="text-base sm:text-lg font-bold text-indigo-600">{stats.admin_users}</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                                <p className="text-[10px] sm:text-xs text-gray-500">زوار</p>
                                <p className="text-base sm:text-lg font-bold text-slate-600">{stats.guest_users}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ads Breakdown */}
                <div className="card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">حالة الإعلانات</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 border border-gray-100 rounded-xl flex items-center gap-2 sm:gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500">قيد المراجعة</p>
                                <p className="text-base sm:text-lg font-bold">{stats.pending_ads}</p>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 border border-gray-100 rounded-xl flex items-center gap-2 sm:gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500">مرفوضة</p>
                                <p className="text-base sm:text-lg font-bold">{stats.rejected_ads}</p>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 border border-gray-100 rounded-xl flex items-center gap-2 sm:gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500">تم البيع</p>
                                <p className="text-base sm:text-lg font-bold">{stats.sold_ads}</p>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 border border-gray-100 rounded-xl flex items-center gap-2 sm:gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500">نشطة</p>
                                <p className="text-base sm:text-lg font-bold">{stats.active_ads}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
