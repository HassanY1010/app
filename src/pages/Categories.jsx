import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Folder, ChevronRight, ChevronDown, Loader2, X, Check } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ title: '', icon: '', parent_id: null });
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenModal = (category = null, parentId = null) => {
        if (category) {
            setCurrentCategory(category);
            setFormData({ title: category.title, icon: category.icon || '', parent_id: category.parent_id });
        } else {
            setCurrentCategory(null);
            setFormData({ title: '', icon: '', parent_id: parentId });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentCategory) {
                await api.post(`/admin/category/${currentCategory.id}/update`, formData);
            } else {
                await api.post('/admin/category', formData);
            }
            fetchCategories();
            setIsModalOpen(false);
        } catch (error) {
            alert('فشلت العملية: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الأقسام الفرعية التابعة له.')) {
            return;
        }
        try {
            await api.delete(`/admin/category/${id}`);
            fetchCategories();
        } catch (error) {
            alert('فشل الحذف: ' + (error.response?.data?.message || 'خطأ غير معروف'));
        }
    };

    const CategoryItem = ({ category, level = 0 }) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expanded[category.id];

        return (
            <div className="animate-in slide-in-from-right-2 duration-300">
                <div className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 transition-all ${level > 0 ? 'mr-4 sm:mr-8' : ''} shadow-sm sm:shadow-none`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {hasChildren ? (
                            <button onClick={() => toggleExpand(category.id)} className="p-2 sm:p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                        ) : (
                            <div className="w-10 sm:w-6" />
                        )}
                        <div className={`p-2 rounded-lg bg-indigo-50 text-indigo-600 hidden sm:block`}>
                            <Folder size={18} />
                        </div>
                        <div className="min-w-0">
                            <span className="font-bold sm:font-bold text-gray-900 text-sm sm:text-base">{category.title}</span>
                            {!category.is_active && <span className="mr-2 text-[10px] sm:text-xs text-red-500 font-bold">(غير نشط)</span>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-50 sm:mt-0 sm:pt-0 sm:border-0 sm:opacity-0 group-hover:opacity-100 transition-all">
                        <button
                            onClick={() => handleOpenModal(null, category.id)}
                            className="p-2.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-1.5 border border-emerald-50 sm:border-0"
                            title="إضافة قسم فرعي"
                        >
                            <Plus size={18} />
                            <span className="text-xs font-bold sm:hidden">فرعي</span>
                        </button>
                        {category.slug !== 'other' && category.title !== 'سلعة أخرى' && (
                            <button
                                onClick={() => handleOpenModal(category)}
                                className="p-2.5 sm:p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-1.5 border border-indigo-50 sm:border-0"
                                title="تعديل"
                            >
                                <Edit2 size={18} />
                                <span className="text-xs font-bold sm:hidden">تعديل</span>
                            </button>
                        )}
                        {category.slug !== 'other' && category.title !== 'سلعة أخرى' && (
                            <button
                                onClick={() => handleDelete(category.id)}
                                className="p-2.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1.5 border border-red-50 sm:border-0"
                                title="حذف"
                            >
                                <Trash2 size={18} />
                                <span className="text-xs font-bold sm:hidden">حذف</span>
                            </button>
                        )}
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div className="mt-2 space-y-2">
                        {category.children.map(child => (
                            <CategoryItem key={child.id} category={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="px-1 sm:px-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">إدارة الأقسام</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">تنظيم وتصنيف الإعلانات في المنصة</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl shadow-lg shadow-indigo-100"
                >
                    <Plus size={20} />
                    <span>إضافة قسم رئيسي</span>
                </button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center py-12 text-gray-500">
                        <Loader2 className="animate-spin mb-2" />
                        جاري تحميل الأقسام...
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500">
                        لا توجد أقسام بعد
                    </div>
                ) : (
                    categories.map(category => (
                        <CategoryItem key={category.id} category={category} />
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{currentCategory ? 'تعديل قسم' : 'إضافة قسم جديد'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم القسم</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input"
                                    placeholder="مثلاً: سيارات، عقارات..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الأيقونة (Material Design)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="input"
                                    placeholder="مثلاً: directions_car"
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !formData.title}
                                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    حفظ البيانات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
