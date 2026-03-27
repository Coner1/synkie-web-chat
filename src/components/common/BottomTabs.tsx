import React from 'react';
import {MessageSquare, MessageCircle, Settings, Compass} from 'lucide-react';
import type {TabType} from "~/types/common";
import clsx from "clsx";



interface ChatFrameBottomTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    theme: 'light' | 'dark';
    unreadCommentsCount?: number;
    unreadChatsCount?: number;
}

export const BottomTabs: React.FC<ChatFrameBottomTabsProps> = ({
                                                                            activeTab,
                                                                            onTabChange,
                                                                            theme,
                                                                            unreadCommentsCount = 0,
                                                                            unreadChatsCount = 0
                                                                        }) => {
    const isDark = theme === 'dark';
    const bgClass = theme === 'dark' ? 'bg-[#121212]' : 'bg-white';

    const borderClass = theme === 'dark' ? 'border-gray-800' : 'border-gray-100';
    const activeColor = "var(--primary-color)";

    const tabs: Array<{
        id: TabType;
        label: string;
        icon: React.ReactNode;
        badge?: number;
    }> = [
        {
            id: 'chat',
            label: 'Chat',
            icon: <MessageSquare size={20} />,
            badge: unreadChatsCount
        },
        {
            id: 'comments',
            label: 'Comments',
            icon: <MessageCircle size={20} />,
            badge: unreadCommentsCount
        },
        {
            id: 'discover',
            label: 'Discover',
            icon: <Compass size={20} />
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: <Settings size={20} />
        }
    ];

    return (
        <div className={`flex ${borderClass} ${bgClass}  safe-area-bottom shadow-[0_-1px_10px_rgba(0,0,0,0.05)]`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all relative`}
                        style={{ color: isActive ? activeColor : undefined }}
                        aria-label={tab.label}
                    >
                        {/* Active Indicator Top Bar */}
                        {isActive && (
                            <div
                                className="absolute top-0 w-8 h-1 rounded-b-full"
                                style={{ backgroundColor: activeColor }}
                            />
                        )}

                        <div className={clsx(`${isActive ? 'scale-110' : 'opacity-50'} transition-transform`,
                            !isActive && ( isDark ? 'text-gray-100' : 'text-gray-900'))}>
                            {tab.icon}
                        </div>

                        <span className={clsx(`text-[8px] uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`,
                            !isActive && ( isDark ? 'text-gray-100' : 'text-gray-900'))}>
                            {tab.label}
                        </span>

                        {/* Badge for unread count */}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span
                                className="absolute top-3 right-[30%] min-w-[18px] h-[18px] px-1
                                text-white text-[9px] font-black rounded-full flex items-center justify-center
                                border-2 border-white dark:border-[#121212] z-10"
                                style={{ backgroundColor: activeColor }}
                            >
                                {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
