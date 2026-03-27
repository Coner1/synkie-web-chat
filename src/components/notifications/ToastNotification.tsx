
import React, { useEffect } from 'react';
import { X, MessageSquare, Bell, AlertCircle } from 'lucide-react';
import type {Notification} from '~/types/common'
interface ToastNotificationProps {
    notification: Notification;
    onClose: () => void;
    onClick?: () => void;
    autoClose?: number;
    theme: 'light' | 'dark';
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
                                                                        notification,
                                                                        onClose,
                                                                        onClick,
                                                                        autoClose = 5000,
                                                                        theme
                                                                    }) => {
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(onClose, autoClose);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    const getIcon = () => {
        switch (notification.type) {
            case 'message':
                return <MessageSquare size={20} />;
            case 'private_chat_request':
                return <Bell size={20} />;
            case 'system':
                return <AlertCircle size={20} />;
            default:
                return <Bell size={20} />;
        }
    };

    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';

    return (
        <div
            onClick={onClick}
            className={`fixed top-4 right-4 ${bgClass} ${textClass} rounded-lg shadow-xl 
        p-4 max-w-sm z-[10001] cursor-pointer hover:shadow-2xl transition-all
        animate-slide-in-right`}
        >
            <div className="flex items-start gap-3">
                <div className="text-blue-500 flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                    <p className="text-xs opacity-70">{notification.body}</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="p-1 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
