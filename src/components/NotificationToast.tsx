import React, { useEffect } from 'react';
import { X, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationToastProps {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    linkTo?: string;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ isVisible, onClose, title, message, linkTo }) => {

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-white rounded-lg shadow-lg border-l-4 border-blue-600 p-4 max-w-sm w-full flex gap-3">
                <div className="bg-blue-100 p-2 rounded-full h-fit">
                    <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">{title}</h4>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        {message}
                    </p>
                    {linkTo && (
                        <Link
                            to={linkTo}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            Ver detalhes <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;
