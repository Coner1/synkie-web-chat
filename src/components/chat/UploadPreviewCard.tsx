import { useEffect, useState } from 'react';
import type { MessageInputFileWrapModel } from "~/components/chat/MessageInput";
import clsx from 'clsx';

interface Props {
    fileWrap: MessageInputFileWrapModel;
    onCancel: () => void;
    onSend: () => void;
    isDark?: boolean;
}

export const UploadPreviewCard = ({ fileWrap, onCancel, onSend, isDark = false }: Props) => {
    const [previewUrl, setPreviewUrl] = useState<string>("");

    useEffect(() => {
        const url = URL.createObjectURL(fileWrap.file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [fileWrap.file]);

    const renderPreview = () => {
        const type = fileWrap.chatMessageType;

        if (type === "image" || type === "gif") {
            return <img src={previewUrl} className="h-12 w-12 rounded-xl object-cover border border-black/5" alt="" />;
        }

        if (type === "video") {
            return (
                <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center overflow-hidden">
                    <video src={previewUrl} className="h-full object-cover opacity-60" />
                    <div className="absolute text-[8px] font-black text-white uppercase">Video</div>
                </div>
            );
        }

        // Audio or generic File icon
        return (
            <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-tighter">
                    {type === "audio" ? "VOL" : fileWrap.file.name.split('.').pop()}
                </span>
            </div>
        );
    };

    return (
        <div className={clsx(
            "p-3 border-t flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200",
            isDark ? "bg-[#1f1f1f] border-white/5" : "bg-zinc-50 border-black/5"
        )}>
            <div className="relative">
                {renderPreview()}
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <span className={clsx(
                    "text-[13px] font-bold truncate",
                    isDark ? "text-white" : "text-black"
                )}>
                    {fileWrap.file.name}
                </span>
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-tight">
                    {(fileWrap.file.size / 1024).toFixed(1)} KB • {fileWrap.chatMessageType}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onCancel}
                    className="text-[10px]  opacity-40 hover:opacity-100 px-2 py-2 transition-opacity"
                >
                    Cancel
                </button>
                <button
                    onClick={onSend}
                    className="bg-[var(--primary-color)] text-white px-4 h-9 rounded-xl text-[10px] tracking-widest active:scale-95 transition-transform shadow-lg shadow-[var(--primary-color)]/20"
                >
                    Send
                </button>
            </div>
        </div>
    );
};
