import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Admin UI error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-center max-w-md">
                        <h1 className="text-lg font-bold text-gray-900 mb-2">حدث خطأ غير متوقع</h1>
                        <p className="text-sm text-gray-500 mb-4">يرجى تحديث الصفحة أو تسجيل الدخول مرة أخرى.</p>
                        <button
                            type="button"
                            onClick={() => {
                                sessionStorage.removeItem('admin_token');
                                sessionStorage.removeItem('admin_user');
                                window.location.href = '/login';
                            }}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold"
                        >
                            تسجيل الدخول
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
