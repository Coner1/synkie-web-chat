import React, {useEffect, useState} from "react";
import type {GenderType, User} from "~/types/user";
import {createUserAndCache, getCurrentUser, initAuth} from "~/services/UserService";
import { AvatarEditModal } from "~/components/user/myProfile/AvatarEditModal";
import clsx from "clsx";
import {ImagePlus, Loader2, X} from "lucide-react";
import type {ThemeType} from "~/types/common";
interface Props {
    currentUser?: User;
    onComplete: (user: User) => void;
    theme: ThemeType;

}

export const WelcomeSetup = ({ currentUser, onComplete, theme }: Props) => {
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [gender, setGender] = useState<"" | "m" | "f">("");
    const [showAvatarEditor, setShowAvatarEditor] = useState(false);
    const [saving, setSaving] = useState(false)
    const MIN_NAME_LENGTH = 1;
    const MAX_NAME_LENGTH = 20;
    const trimmedName = name.trim();
    const nameLength = trimmedName.length;

    const isTooShort = nameLength < MIN_NAME_LENGTH;
    const isTooLong = nameLength > MAX_NAME_LENGTH;
    const isInvalid = isTooShort || isTooLong;
    const isDark = theme === "dark";

    const handleSave = async () => {
        if (!name.trim()) return
        if (saving) return

        setSaving(true)

        try {
            const currentUser = getCurrentUser()

            const userData = {
                id: currentUser!.id,
                name: name.trim(),
                avatar,
                gender,
                isAnonymous: false,
                isFTU: false
            } as User

            const userSaved = await createUserAndCache(userData)

            onComplete(userSaved)
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }
    if (!currentUser) {
        return (
            <div className="relative flex flex-col items-center justify-start h-full px-6 py-10 text-center bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400"/> Loading...
            </div>
        )
    }
    return (
        <div className="relative flex flex-col items-center justify-start h-full px-6 py-10 text-center bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
            <h2 className="text-xl font-bold mb-6">
                Welcome to Synkie
            </h2>

            {/* Avatar */}
            <div
                onClick={() => setShowAvatarEditor(true)}
                className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden cursor-pointer mb-6"
            >
                {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <ImagePlus size={28} className="opacity-60" />
                        <span className="text-sm font-medium">Upload</span>
                    </div>
                )}
            </div>

            {/* Username */}
            <input
                value={name}
                onChange={(e) => {
                    if (e.target.value.length <= MAX_NAME_LENGTH) {
                        setName(e.target.value);
                    }
                }}
                placeholder={`Enter a nickname`}
                className={clsx("w-full text-sm p-3 rounded-xl transition-all outline-none resize-none border border-transparent focus:border-[var(--primary-color)]",
                    isDark ? 'bg-zinc-800' : 'bg-zinc-100',
                    "shadow-none focus:outline-none focus:ring-0"
                    )}
            />

            <div className="w-full text-right text-xs opacity-50 mb-4">
                {name.trim().length}/{MAX_NAME_LENGTH}
            </div>
            {isTooShort && (
                <p className="text-red-500 text-xs mb-3">
                    Username must be at least {MIN_NAME_LENGTH} characters
                </p>
            )}

            {isTooLong && (
                <p className="text-red-500 text-xs mb-3">
                    Username must be under {MAX_NAME_LENGTH} characters
                </p>
            )}
            {/* Gender Selection */}
            <div className="w-full mb-6">
                <div className="text-left text-xs font-medium opacity-60 mb-2">
                    Gender
                </div>

                <div className="flex gap-2">
                    {[
                        { label: "Not set", value: ""},
                        { label: "Male", value: "m" },
                        { label: "Female", value: "f" },
                    ].map((option) => {
                        let active = false;
                        if (option.value) {
                            active = option.value === gender;
                        }else{
                            active = !gender;
                        }

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    setGender(option.value as GenderType)
                                }
                                className={clsx(
                                    "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                                    active
                                        ? "bg-[#07C160] text-white"
                                        : isDark
                                            ? "bg-white/5 text-white/60"
                                            : "bg-black/5 text-black/60"
                                )}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
            <button
                disabled={isInvalid || saving || !currentUser}
                onClick={handleSave}
                className="w-full py-3 my-3 rounded-xl bg-[#07C160] text-white font-bold"
            >
                {saving ? "Saving..." : "Continue"}
            </button>

            {showAvatarEditor && (
                <div className={clsx("absolute inset-0 z-100", isDark ? "bg-[#111]" : "bg-[#F2F2F2]")}>
                    <AvatarEditModal
                        user={currentUser!}
                        currentValue={avatar}
                        onSave={(avatarUrl)=>{
                            setAvatar(avatarUrl)
                            setShowAvatarEditor(false)
                        }}
                        onClose={() => setShowAvatarEditor(false)}
                        isDark={isDark}
                    />
                </div>
            )}
        </div>
    );
};
