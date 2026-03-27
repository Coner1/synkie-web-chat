import React from 'react'
import { X, Bell, BellOff, Loader2, AlertCircle,Aperture } from 'lucide-react'
import type {ConnectionStatus, TabType, ThemeType} from '~/types/common'
import clsx from 'clsx'

interface HeaderProps {
    activeTab: TabType
    pageTitle: string
    pageSubtitle?: string
    favicon?: string
    roomNotifications: boolean
    onToggleNotifications: () => void
    onMinimize: () => void
    onClose: () => void
    theme: ThemeType
    connectionStatus?: ConnectionStatus
    showNotificationToggle?: boolean
}

export const Header: React.FC<HeaderProps> = ({
                                                  pageTitle,
                                                  pageSubtitle,
                                                  favicon,
                                                  roomNotifications,
                                                  onToggleNotifications,
                                                  onClose,
                                                  theme,
                                                  connectionStatus = 'connected',
                                                  showNotificationToggle = false
                                              }) => {
    const isDark = theme === 'dark'

    const renderConnectionStatus = () => {
        if (connectionStatus === 'connecting') {
            return (
                <div title="Connecting to server..." className="cursor-help mr-1">
                    <Loader2 size={14} className="animate-spin text-amber-500" />
                </div>
            )
        }
        if (connectionStatus === 'disconnected') {
            return (
                <div title="Disconnected. Check your connection." className="cursor-help mr-1">
                    <AlertCircle size={14} className="text-red-500" />
                </div>
            )
        }
        return null
    }

    return (
        <div className={clsx(
            "flex items-center justify-between px-4 py-3 w-full h-12",
            isDark ? "bg-[#1E1E1E]" : "bg-white"
        )}>
            {/* Left: Identity Section */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {favicon ? (
                    <img
                        src={favicon}
                        alt=""
                        className="w-5 h-5 rounded-md object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                ) : (
                    <div className="w-1 h-5 bg-[var(--primary-color)] rounded-full" />
                )}

                <div className="flex flex-col min-w-0 leading-tight">
                    <div className="flex items-center gap-2">
                        <span className={clsx(
                            "text-sm font-black tracking-widest truncate max-w-[180px]",
                            isDark ? "text-white" : "text-zinc-900"
                        )}>
                            {pageTitle}
                        </span>
                        {renderConnectionStatus()}
                    </div>
                    {pageSubtitle && (
                        <span className={clsx(
                            "text-[10px] font-bold truncate uppercase tracking-tighter opacity-40",
                            isDark ? "text-zinc-400" : "text-zinc-500"
                        )}>
                            {pageSubtitle}
                        </span>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <button
                    onClick={onClose}
                    className={clsx(
                        "p-2 rounded-xl transition-all active:scale-90",
                        "text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                    )}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    )
}
