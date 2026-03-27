
import React from 'react';
import { Bell, Volume2, Vibrate } from 'lucide-react';

interface NotificationSettingsProps {
    enabled: boolean;
    sound: boolean;
    vibrate: boolean;
    onToggleEnabled: () => void;
    onToggleSound: () => void;
    onToggleVibrate: () => void;
    theme: 'light' | 'dark';
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
                                                                              enabled,
                                                                              sound,
                                                                              vibrate,
                                                                              onToggleEnabled,
                                                                              onToggleSound,
                                                                              onToggleVibrate,
                                                                              theme
                                                                          }) => {
    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <label className="relative inline-block w-12 h-6 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="opacity-0 w-0 h-0"
            />
            <span
                className={`absolute inset-0 rounded-full transition-colors ${
                    checked ? 'bg-blue-600' : 'bg-gray-400'
                }`}
            >
        <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-0'
            }`}
        />
      </span>
        </label>
    );

    return (
        <div className={`p-4 rounded-lg ${bgClass} border ${borderClass} space-y-4`}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bell size={18} />
                Notifications
            </h3>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm">Enable Notifications</span>
                    <Toggle checked={enabled} onChange={onToggleEnabled} />
                </div>

                {enabled && (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Volume2 size={16} />
                                <span className="text-sm">Sound</span>
                            </div>
                            <Toggle checked={sound} onChange={onToggleSound} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Vibrate size={16} />
                                <span className="text-sm">Vibrate</span>
                            </div>
                            <Toggle checked={vibrate} onChange={onToggleVibrate} />
                        </div>
                    </>
                )}
            </div>

            <p className="text-xs opacity-70 mt-3">
                Get notified when someone messages in this chat or sends you a private message
            </p>
        </div>
    );
};
