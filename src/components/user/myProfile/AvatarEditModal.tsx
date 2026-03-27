import type {User} from "~/types/user";
import React, {useRef, useState} from "react";
import {updateProfileItem, uploadAvatar} from "~/services/UserService";
import clsx from "clsx";
import {Upload, User as UserIcon, ZoomIn, ZoomOut, RotateCw} from "lucide-react";
import AvatarEditor from 'react-avatar-editor';

interface AvatarEditModalProps {
    user: User;
    currentValue: string;
    onSave: (avatarUrl:string) => void;
    onClose: () => void;
    isDark: boolean;
}

export const AvatarEditModal = ({ user, currentValue, onSave, onClose, isDark }: AvatarEditModalProps) => {
    const [loading, setLoading] = useState(false);
    const [editingImage, setEditingImage] = useState<File | null>(null);

    // Avatar editor states
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const editorRef = useRef<AvatarEditor>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Set editing image to open editor
            setEditingImage(file);
            setScale(1);
            setRotate(0);
        }
    };

    const handleApply = async () => {
        if (!editorRef.current || loading) return;

        setLoading(true);
        try {
            // Get cropped image as data URL
            const canvas = editorRef.current.getImageScaledToCanvas();
            const croppedImage = canvas.toDataURL('image/jpeg', 1);

            // Upload to Firebase Storage (generates all sizes)
            console.log('Uploading avatar in multiple sizes...');
            // console.log("user",user);
            const avatarUrl = await uploadAvatar(user.id, croppedImage);
            if (!user.isFTU) {
                // Update user profile with all avatar URLs
                await updateProfileItem(user.id, {
                    avatar: avatarUrl, // Primary avatar
                });
            }

            onSave(avatarUrl);
            console.log('Avatar uploaded successfully');
        } catch (error) {
            console.error("Upload failed:", error);
            alert('Failed to upload avatar. Please try again.');
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingImage(null);
        setScale(1);
        setRotate(0);
        onClose();
    };

    // If no image selected yet, show upload button
    if (!editingImage) {
        return (
            <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                <div className="mt-6 px-4 flex-1 flex flex-col items-center justify-center">
                    {/* Current Avatar Preview */}
                    <div className="w-128 h-128 rounded-3xl overflow-hidden border-1 mb-8">
                        {currentValue ? (
                            <img src={currentValue} className="w-full h-full object-cover" alt="Current Avatar" />
                        ) : (
                            <div className={clsx(
                                "w-full h-full flex items-center justify-center text-white/20",
                                isDark ? "bg-zinc-800" : "bg-zinc-200"
                            )}>
                                <UserIcon size={48} />
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className={clsx(
                            "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all active:scale-98",
                            isDark ? "bg-[#191919] hover:bg-[#222]" : "bg-white hover:bg-gray-50",
                            "border",
                            isDark ? "border-white/5" : "border-black/5"
                        )}
                    >
                        <div className={clsx(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            isDark ? "bg-white/5" : "bg-black/5"
                        )}>
                            <Upload size={20} className="opacity-60" />
                        </div>
                        <span className={clsx(
                            "text-base font-medium",
                            isDark ? "text-white/80" : "text-black/80"
                        )}>
                            Upload New Photo
                        </span>
                    </button>

                    {/* Help Text */}
                    <p className="mt-6 px-4 text-[9px] opacity-30 font-black uppercase tracking-widest leading-relaxed text-center">
                        Choose a square photo for best results
                    </p>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Cancel Button */}
                    <div className="w-full px-2 pb-6">
                        <button
                            onClick={onClose}
                            className={clsx(
                                "w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95",
                                isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
                            )}
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                />
            </div>
        );
    }

    // Image editor view
    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="mt-6 px-4 flex-1 flex flex-col">
                {/* Editor Title */}
                <h3 className={clsx(
                    "text-center text-sm font-bold mb-4",
                    isDark ? "text-white" : "text-black"
                )}>
                    Adjust Your Photo
                </h3>

                {/* Avatar Editor */}
                <div className="flex flex-col items-center mb-6">
                    <div className="rounded-3xl overflow-hidden border-2 border-black/10">
                        <AvatarEditor
                            ref={editorRef}
                            image={editingImage}
                            width={250}
                            height={250}
                            border={0}
                            borderRadius={125}
                            color={[0, 0, 0, 0.6]}
                            scale={scale}
                            rotate={rotate}
                            backgroundColor={isDark ? "#1a1a1a" : "#f5f5f5"}
                        />
                    </div>
                </div>

                {/* Zoom Control */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <div className="flex items-center gap-2">
                            <ZoomOut size={16} className="opacity-40" />
                            <span className={clsx(
                                "text-xs font-medium opacity-60",
                                isDark ? "text-white" : "text-black"
                            )}>
                                Zoom
                            </span>
                        </div>
                        <ZoomIn size={16} className="opacity-40" />
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className={clsx(
                            "w-full h-2 rounded-lg appearance-none cursor-pointer",
                            isDark ? "bg-zinc-700" : "bg-zinc-300",
                            "accent-[#07C160]"
                        )}
                    />
                </div>

                {/* Rotate Button */}
                <button
                    onClick={() => setRotate((rotate + 90) % 360)}
                    disabled={loading}
                    className={clsx(
                        "w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg transition-all active:scale-98 mb-4",
                        isDark ? "bg-[#191919] hover:bg-[#222]" : "bg-white hover:bg-gray-50",
                        "border",
                        isDark ? "border-white/5" : "border-black/5"
                    )}
                >
                    <RotateCw size={16} className="opacity-60" />
                    <span className={clsx(
                        "text-sm font-medium",
                        isDark ? "text-white/80" : "text-black/80"
                    )}>
                        Rotate 90°
                    </span>
                </button>

                {/* Help Text */}
                <p className="px-4 text-[9px] opacity-30 font-black uppercase tracking-widest leading-relaxed text-center">
                    Adjust the position, zoom, and rotation
                </p>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action Buttons */}
                <div className="px-2 flex items-center gap-3 pb-6">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className={clsx(
                            "flex-1 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95",
                            isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
                        )}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className={clsx(
                            "flex-[2] py-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg",
                            loading
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                : "bg-[#07C160] text-white active:scale-95 shadow-[#07C160]/20"
                        )}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            "Apply"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
