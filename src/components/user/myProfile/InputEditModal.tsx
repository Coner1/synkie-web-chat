import React, { useRef, useState } from 'react';
import { ChevronRight, Camera, User as UserIcon, X, Check, Smile, Upload, Trash2, ChevronLeft, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';
import type { User } from "~/types/user";
import type { ThemeType } from "~/types/common";
import { updateProfileItem } from "~/services/UserService";

interface InputEditModalProps {
    user: User
    field: { key: keyof User; label: string }
    currentValue: string
    onSave: (prop:string) => void
    onClose: () => void
    isDark: boolean
}

export const InputEditModal = ({ field, currentValue, user, onSave, onClose, isDark }: InputEditModalProps) => {
    const [tempVal, setTempVal] = useState(currentValue || '');
    const [loading, setLoading] = useState(false);
    const isBioField = field.key === 'bio';

    const handleSave = async () => {
        if (!tempVal.trim() || tempVal === currentValue || loading) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            const updates = { [field.key]: tempVal };
            await updateProfileItem(user.id, updates);
            onSave(tempVal);
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="mt-6 px-4">
                {/* Input Field */}
                <div className={clsx(
                    "flex items-start p-4 border-y relative",
                    isDark ? "bg-[#191919] border-white/5" : "bg-white border-black/5"
                )}>
                    {isBioField ? (
                        <textarea
                            autoFocus
                            disabled={loading}
                            rows={4}
                            maxLength={200}
                            className={clsx(
                                "w-full bg-transparent outline-none text-base font-bold resize-none",
                                isDark ? "text-white" : "text-black"
                            )}
                            value={tempVal}
                            onChange={(e) => setTempVal(e.target.value)}
                            placeholder="Write something about yourself..."
                        />
                    ) : (
                        <input
                            autoFocus
                            disabled={loading}
                            className={clsx(
                                "w-full bg-transparent outline-none text-base font-bold",
                                isDark ? "text-white" : "text-black"
                            )}
                            value={tempVal}
                            onChange={(e) => setTempVal(e.target.value)}
                        />
                    )}
                    {tempVal && !loading && (
                        <button onClick={() => setTempVal('')} className="opacity-40 mt-1">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Character count for bio */}
                {isBioField && (
                    <p className="mt-2 px-4 text-[10px] opacity-30 text-right">
                        {tempVal.length}/200
                    </p>
                )}

                {/* Help Text */}
                <p className="mt-3 px-4 text-[9px] opacity-30 font-black uppercase tracking-widest leading-relaxed">
                    Set a {field.label} to help friends identify you.
                </p>

                {/* ACTION ROW: Cancel Left, Save Right */}
                <div className="mt-10 px-2 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={clsx(
                            "flex-1 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95",
                            isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
                        )}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading || !tempVal.trim()}
                        className={clsx(
                            "flex-[2] py-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg",
                            loading || !tempVal.trim()
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
