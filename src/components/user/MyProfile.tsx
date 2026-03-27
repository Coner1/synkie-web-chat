import React, { useRef, useState } from 'react';
import { ChevronRight, Camera, User as UserIcon, X, Check, Smile, Upload, Trash2, ChevronLeft, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';
import type {GenderType, User} from "~/types/user";
import type { ThemeType } from "~/types/common";
import { updateProfileItem } from "~/services/UserService";
import {AvatarEditModal} from "~/components/user/myProfile/AvatarEditModal";
import {AvatarViewModal} from "~/components/user/myProfile/AvatarViewModal";
import {GenderSelectModal} from "~/components/user/myProfile/GenderSelectModal";
import {InputEditModal} from "~/components/user/myProfile/InputEditModal";
import {Avatar} from "~/components/chat/MessageList";
import type {ChatUserBasic} from "~/types/chat";

interface ProfileListProps {
    user: User;
    onUpdateUser?: (updates: Partial<User>) => void;
    theme: ThemeType;
    onClose?: () => void;
}

export const MyProfileList = ({ user, theme = 'light', onUpdateUser, onClose }: ProfileListProps) => {
    const isDark = theme === 'dark';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingField, setEditingField] = useState<{ key: keyof User; label: string } | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    const colors = {
        container: isDark ? "bg-[#111]" : "bg-[#F2F2F2]",
        row: isDark ? "bg-[#191919] hover:bg-[#222]" : "bg-white hover:bg-gray-50",
        text: isDark ? "text-[#CCCCCC]" : "text-[#333333]",
        label: isDark ? "text-white/40" : "text-black/50",
        border: isDark ? "border-white/5" : "border-black/5"
    };

    const handleAvatarClick = () => {
         setEditingField({ key: 'avatar', label: 'Avatar' });
    }
    const chatUser ={
        id: user.id,
        name: user.name,
        avatar: user.avatar,
    } as ChatUserBasic

    return (
        <div className={clsx("flex flex-col w-full h-full overflow-y-auto no-scrollbar", colors.container)}>
            {/* Avatar Section (Large Row Style) */}
            <div className="mt-4 mb-2">
                <button
                    onClick={handleAvatarClick}
                    className={clsx("w-full flex items-center justify-between px-6 py-4 transition-colors", colors.row)}
                >
                    <span className={clsx("text-sm", colors.text)}>Avatar</span>
                    <div className="flex items-center gap-3">
                        {/*<div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-black/5">
                            {user.avatar ? (
                                user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-4xl">{user.avatar}</div>
                                )
                            ) : (
                                <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-white/10"><UserIcon /></div>
                            )}
                        </div>*/}
                        <Avatar theme={theme} chatUser={chatUser} size={16}/>
                        <ChevronRight size={18} className="opacity-20" />
                    </div>
                </button>
            </div>

            {/* Information Rows */}
            <div className="flex flex-col">
                <ProfileRow
                    label="Name"
                    value={user.name}
                    onClick={() => setEditingField({ key: 'name', label: 'Name' })}
                    colors={colors}
                />
                <ProfileRow
                    label="WeChat ID"
                    value={user.id.slice(0, 10)}
                    isStatic
                    colors={colors}
                />
                <div className="h-4" /> {/* Section Spacer */}
                <ProfileRow
                    label="Gender"
                    value={user.gender ? (user.gender === 'm' ? "Male" : "Female") : "Not set"}
                    onClick={() => setEditingField({ key: 'gender', label: 'Gender' })}
                    colors={colors}
                />
                <ProfileRow
                    label="Region"
                    value={user.region}
                    colors={colors}
                    onClick={() => setEditingField({ key: 'region', label: 'Region' })}
                />
                <ProfileRow
                    label="Bio"
                    value={user.bio || "Not set"}
                    onClick={() => setEditingField({ key: 'bio', label: 'Bio' })}
                    colors={colors}
                />
            </div>

            {/* Full-Screen Avatar Viewer Modal */}
            {showAvatarModal && (
                <AvatarViewModal
                    user={user}
                    onClose={() => setShowAvatarModal(false)}
                    onEdit={() => {
                        setShowAvatarModal(false);
                        setEditingField({ key: 'avatar', label: 'Avatar' });
                    }}
                    isDark={isDark}
                />
            )}

            {/* Modal for Editing */}
            {
                editingField && (
                    <div className={clsx("absolute inset-0 z-[100]", colors.container)}>
                        {(() => {
                            switch (editingField.key) {
                                case "gender":
                                    return (
                                        <GenderSelectModal
                                            user={user}
                                            currentValue={user.gender as GenderType}
                                            onSave={(value) => {
                                                if (onUpdateUser) {
                                                    onUpdateUser({ gender: value as any });

                                                }
                                                setEditingField(null);
                                            }}
                                            onClose={() => setEditingField(null)}
                                            isDark={isDark}
                                        />
                                    );

                                case "avatar":
                                    return (
                                        <AvatarEditModal
                                            user={user}
                                            currentValue={user.avatar as string}
                                            onSave={(avatarUrl) => {
                                                if (onUpdateUser) {
                                                    onUpdateUser({ avatar: avatarUrl });
                                                }
                                                setEditingField(null);
                                            }}
                                            onClose={() => setEditingField(null)}
                                            isDark={isDark}
                                        />
                                    );

                                default:
                                    return (
                                        <InputEditModal
                                            user={user}
                                            field={editingField}
                                            currentValue={user[editingField.key] as string}
                                            onSave={(value) => {
                                                if (onUpdateUser) {
                                                    onUpdateUser({
                                                        [editingField.key]: value,
                                                    });
                                                }
                                                setEditingField(null);
                                            }}
                                            onClose={() => setEditingField(null)}
                                            isDark={isDark}
                                        />
                                    );
                            }
                        })()}
                    </div>
                )
            }

            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
        </div>
    );
};

/* --- WeChat Style Row --- */
const ProfileRow = ({ label, value, onClick, isStatic, colors }: any) => (
    <button
        onClick={onClick}
        disabled={isStatic}
        className={clsx(
            "w-full flex items-center justify-between px-6 py-4 border-b last:border-0 transition-colors",
            colors.row, colors.border,
            isStatic && "cursor-default"
        )}
    >
        <span className={clsx("text-sm", colors.text)}>{label}</span>
        <div className="flex items-center gap-2">
            <span className={clsx("text-sm opacity-40", colors.text)}>{value}</span>
            {!isStatic && <ChevronRight size={18} className="opacity-20" />}
        </div>
    </button>
);

