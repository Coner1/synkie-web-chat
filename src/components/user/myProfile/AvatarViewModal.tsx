import type {User} from "~/types/user";
import React, {useRef, useState} from "react";
import {updateProfileItem} from "~/services/UserService";
import clsx from "clsx";
import {Check, ChevronLeft, MoreHorizontal, Smile, Trash2, Upload, User as UserIcon, X} from "lucide-react";
import {emojis_const} from "~/constants/emojis_const";

/* --- Minimized Full-Screen Avatar Viewer --- */
interface AvatarViewModalProps {
    user: User;
    onClose: () => void;
    onEdit: () => void;
    isDark: boolean;
}

export const AvatarViewModal = ({ user, onClose, onEdit, isDark }: AvatarViewModalProps) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <div className="absolute inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-200">
            {/* Minimized Header - only shows on tap/hover */}
            <div
                className={clsx(
                    "absolute top-0 left-0 right-0 z-10 transition-opacity duration-300",
                    showActions ? "opacity-100" : "opacity-0"
                )}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                <div className="flex items-center justify-between p-3">
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={onEdit}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60 transition-colors"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Image Container - Tap to toggle controls */}
            <div
                className="flex-1 flex items-center justify-center p-4"
                onClick={() => setShowActions(!showActions)}
            >
                <img
                    src={user.avatar}
                    alt="Avatar"
                    className="max-w-full max-h-full object-contain rounded-xl"
                />
            </div>
        </div>
    );
};
