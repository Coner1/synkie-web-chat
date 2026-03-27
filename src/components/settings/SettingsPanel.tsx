import React, { useState } from 'react';
import {
    Palette, Sliders, Bell, Info, Globe, ChevronRight, LogOut, Volume2, UserIcon
} from 'lucide-react';
import type {User, UserBasic} from '~/types/user';
import clsx from 'clsx';
import type {ThemeType} from "~/types/common";
import {userIdToAvatarColor} from "~/services/utils/avatarUtils";

interface SettingsPanelProps {
    opacity: number;
    setOpacity: (value: number) => void;
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    currentUser: User;
    onUpdateUser: (updates: Partial<User>) => void;
    onViewMyProfile: (user:User) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
                                                                opacity, setOpacity, theme, setTheme, currentUser, onUpdateUser, onViewMyProfile
                                                            }) => {
    const isDark = theme === 'dark';
    const [viewingProfile, setViewingProfile] = useState(false);

    // Preferences local state
    // const [notifEnabled, setNotifEnabled] = useState(currentUser.preferences?.notifications ?? true);
    // const [soundEnabled, setSoundEnabled] = useState(currentUser.preferences?.notificationSound ?? true);

    const colors = {
        bg: isDark ? 'bg-[#121212]' : 'bg-white',
        itemBg: isDark ? 'bg-[#1E1E1E]' : 'bg-gray-50',
        text: isDark ? 'text-[#E0E0E0]' : 'text-[#1E1E1E]',
        border: isDark ? 'border-gray-800' : 'border-gray-100',
    };

    const handlePrefChange = (key: string, value: any) => {
        onUpdateUser({
            preferences: { ...currentUser.preferences, [key]: value }
        });
    };

    // Fixed: Handle opacity change - update both local state and user preferences
    const handleOpacityChange = (newOpacity: number) => {
        setOpacity(newOpacity);
        handlePrefChange('transparency', newOpacity);
    };
    // console.log("currentUser.avatar", currentUser.avatar)
    return (
        <div className={clsx("flex-1 overflow-y-auto pb-10 no-scrollbar h-full", colors.bg)}>
             {/*1. Profile Summary */}
            <div
                className={clsx("p-6 mb-6 flex items-center gap-4 border-b cursor-pointer active:opacity-80 transition-all", colors.itemBg, colors.border)}
                onClick={()=> onViewMyProfile(currentUser)}
            >
                {/*<div className="w-16 h-16 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-3xl">*/}
                {/*    <img src={currentUser.avatar} className="w-full h-full object-cover" />*/}
                {/*</div>*/}
                <div
                    className={clsx("w-16 h-16 text-base cursor-pointer",
                        "rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border transition-all ",
                        "bg-zinc-100 dark:bg-zinc-800 "
                    )}
                    onClick={() => onViewMyProfile(currentUser)}
                >
                    {currentUser.avatar ? (
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <UserIcon
                            strokeWidth={2}
                            style={{color: userIdToAvatarColor(currentUser.id, theme)}}
                            className={clsx("w-full h-full object-cover opacity-60")} />
                    )}
                </div>
                <div className="flex-1">
                    <h2 className={clsx("text-lg font-bold", colors.text)}>{currentUser.name}</h2>
                    <p className="text-xs opacity-40 font-mono tracking-tighter">ID: {currentUser.id.slice(0, 12)}</p>
                </div>
                <ChevronRight size={20} className="opacity-20" />
            </div>



            {/* 2. Appearance */}
            <div className="mb-6">
                <p className="px-5 py-2 text-[10px] font-black uppercase opacity-70 tracking-widest">Appearance</p>
                <div className={clsx("flex items-center justify-between p-4 border-b", colors.itemBg, colors.border)}>
                    <div className="flex items-center gap-3">
                        <Palette size={18} className="text-[var(--primary-color)]" />
                        <span className="text-sm font-bold">Dark Mode</span>
                    </div>
                    <ToggleSwitch
                        checked={isDark}
                        onChange={() => setTheme(isDark ? 'light' : 'dark')}
                    />
                </div>

                <div className={clsx("p-4 border-b", colors.itemBg, colors.border)}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Sliders size={18} className="text-[var(--primary-color)]" />
                            <span className="text-sm font-bold">Transparency</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--primary-color)]">{opacity}%</span>
                    </div>
                    <input
                        type="range" min="20" max="100" value={opacity}
                        onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                    />
                </div>
            </div>

            {/* 3. Notifications & Sound */}
            {/*<div className="mb-6">
                <p className="px-5 py-2 text-[10px] font-black uppercase opacity-40 tracking-widest">Alerts</p>
                <div className={clsx("flex items-center justify-between p-4 border-b", colors.itemBg, colors.border)}>
                    <div className="flex items-center gap-3">
                        <Bell size={18} className="text-[var(--primary-color)]" />
                        <span className="text-sm font-bold">Global Notifications</span>
                    </div>
                    <ToggleSwitch
                        checked={notifEnabled}
                        onChange={() => {
                            setNotifEnabled(!notifEnabled);
                            handlePrefChange('notifications', !notifEnabled);
                        }}
                    />
                </div>
                <div className={clsx("flex items-center justify-between p-4 border-b", colors.itemBg, colors.border)}>
                    <div className="flex items-center gap-3">
                        <Volume2 size={18} className="text-[var(--primary-color)]" />
                        <span className="text-sm font-bold">Alert Sounds</span>
                    </div>
                    <ToggleSwitch
                        checked={soundEnabled}
                        onChange={() => {
                            setSoundEnabled(!soundEnabled);
                            handlePrefChange('notificationSound', !soundEnabled);
                        }}
                    />
                </div>
            </div>*/}

            {/* 4. About & Logout */}
            <div className="mb-6">
                <p className="px-5 py-2 text-[10px] font-black uppercase opacity-70 tracking-widest">System</p>
                <div className={clsx("flex items-center justify-between p-4 border-b", colors.itemBg, colors.border)}>
                    <div className="flex items-center gap-3">
                        <Info size={18} className="text-zinc-400" />
                        <span className="text-sm font-bold">Version</span>
                    </div>
                    <span className="text-xs opacity-40">1.0.4-beta</span>
                </div>
                {/*<div className={clsx("flex items-center justify-between p-4 border-b", colors.itemBg, colors.border)}>
                    <div className="flex items-center gap-3">
                        <Info size={18} className="text-zinc-400" />
                        <span className="text-sm font-bold">Help & Feedback</span>
                    </div>
                    <span className="text-xs opacity-40"></span>
                </div>*/}
            </div>

            {/*<div className="px-4 mt-8">
                <button className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                    <LogOut size={18} />
                    Logout Session
                </button>
            </div>*/}
        </div>
    );
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <label className="relative inline-block w-10 h-5 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
        <div className={clsx("absolute inset-0 rounded-full transition-colors duration-200", checked ? 'bg-[var(--primary-color)]' : 'bg-zinc-300 dark:bg-zinc-700')}>
            <div className={clsx("absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm", checked ? 'translate-x-5' : 'translate-x-0')} />
        </div>
    </label>
);
