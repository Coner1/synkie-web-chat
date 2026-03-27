import React, { useRef, useState } from 'react';
import { ChevronRight, Camera, User as UserIcon, X, Check, Smile, Upload, Trash2, ChevronLeft, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';
import type {GenderType, User} from "~/types/user";
import type { ThemeType } from "~/types/common";
import { updateProfileItem } from "~/services/UserService";

interface GenderSelectModalProps {
    user: User
    currentValue?: GenderType
    onClose: () => void
    onSave: (prop:string) => void;
    isDark: boolean
}

export const GenderSelectModal = ({ user, currentValue, onSave, onClose, isDark }: GenderSelectModalProps) => {
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string>(currentValue || 'not_set');

    const handleSave = async () => {
        if (!selected || selected === currentValue || loading) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            let v = ""
            if(selected != "not_set") {
                v = selected
            }
            await updateProfileItem(user.id, { gender: v as any });
            onSave(v);
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const options = [
        { value: 'm', label: 'Male' },
        { value: 'f', label: 'Female' },
        { value: 'not_set', label: 'Not set' }
    ];

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="mt-6 px-4">
                {/* Gender Options */}
                <div className={clsx(
                    "border-y",
                    isDark ? "border-white/5" : "border-black/5"
                )}>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSelected(option.value)}
                            disabled={loading}
                            className={clsx(
                                "w-full flex items-center justify-between px-6 py-4 border-b last:border-0 transition-colors",
                                isDark ? "bg-[#191919] hover:bg-[#222]" : "bg-white hover:bg-gray-50",
                                isDark ? "border-white/5" : "border-black/5"
                            )}
                        >
                            <span className={clsx(
                                "text-base",
                                isDark ? "text-white" : "text-black"
                            )}>
                                {option.label}
                            </span>
                            {selected === option.value && (
                                <Check size={20} className="text-[#07C160]" />
                            )}
                        </button>
                    ))}
                </div>


                {/* ACTION ROW: Cancel Left, Save Right */}
                <div className="mt-10 px-2 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={clsx(
                            "flex-1 py-4 rounded-xl font-black text-[11px] tracking-widest transition-all active:scale-95",
                            isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
                        )}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading || !selected}
                        className={clsx(
                            "flex-[2] py-4 rounded-xl font-black text-[11px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg",
                            loading || !selected
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                : "bg-[#07C160] text-white active:scale-95 shadow-[#07C160]/20"
                        )}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
