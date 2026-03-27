import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Smile, Mic, Image, Video, Phone, PhoneCall, MapPin, File as FileIcon, Gamepad2, Music, X, RotateCcw, Square } from 'lucide-react';
import { useVoiceRecorder } from "~/hooks/useVoiceRecorder";
import type {ThemeType} from "~/types/common";
import type {ChatMessageType, ChatType} from "~/types/chat";
import {detectChatMessageType} from "~/services/utils/fileUtils";
import {emojis_const} from "~/constants/emojis_const";
import clsx from "clsx";

export interface MessageInputFileWrapModel {
    file: File;
    chatMessageType: ChatMessageType;
}
interface MessageInputProps {
    onSendText: (text: string) => void;
    onSendFile: (fileWrap: MessageInputFileWrapModel) => void;
    theme?: ThemeType;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendText, onSendFile, theme = 'light' }) => {
    const [text, setText] = useState('');
    const [showToolsMenu, setShowToolsMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [textareaRows, setTextareaRows] = useState(1);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recordingTimerRef = useRef<number | null>(null);

    const { recording, audioBlob, start, stop, reset } = useVoiceRecorder();

    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-[#222]' : 'bg-[#F7F7F7]';
    const inputBg = isDark ? 'bg-[#2A2A2A]' : 'bg-white';
    const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
    const lineHeight = 24;
    // Auto-resize textarea (single line → max 12 lines)
    // --- FIX: Smoother Auto-resize ---
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to calculate correctly
        textarea.style.height = '24px';
        const nextHeight = Math.min(textarea.scrollHeight, 288); // 12 lines * 24px
        textarea.style.height = `${nextHeight}px`;

        // Toggle overflow if at max height
        textarea.style.overflowY = textarea.scrollHeight > 288 ? 'auto' : 'hidden';
    }, [text]);

    // Recording timer - uses the hook's `recording` state
    useEffect(() => {
        let interval: number;
        if (recording) {
            interval = window.setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 59) { // Trigger at 59 to stop at exactly 60
                        handleSendAudio();
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [recording]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSendText(text.trim());
        setText('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleToolClick = (tool: string) => {
        setShowToolsMenu(false);
        if (tool === 'photo') {
            fileInputRef.current?.click();
        }
        // Other tools would be handled here
    };
    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    const startRecording = async () => {
        try {
            await start();
            setRecordingTime(0);
        } catch (err) {
            console.error('Failed to start recording:', err);
        }
    };

    const handleSendAudio = () => {
        stop().then(blob =>{
            // 2. Handle the send immediately using the returned blob
            if (blob && blob.size > 0) {
                const audioFile = new File([blob], 'voice.webm', { type: 'audio/webm' });
                onSendFile({chatMessageType:"audio", file:audioFile});
                reset();
                setRecordingTime(0);
            }
        })

    };

    const handleCancelAudio = () => {
        stop().then().catch(console.error);
        reset();
        setRecordingTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toolsMenuItems = [
        { icon: Image, label: 'Photo', key: 'photo' },
        { icon: Video, label: 'Video', key: 'video' },
        { icon: PhoneCall, label: 'Video Call', key: 'video-call' },
        { icon: Phone, label: 'Audio Call', key: 'audio-call' },
        { icon: MapPin, label: 'Location', key: 'location' },
        { icon: FileIcon, label: 'File', key: 'file' },
        { icon: Music, label: 'Music', key: 'music' },
    ];

    const textAreaRowsComputed = (textareaRef?.current?.scrollHeight || lineHeight)/lineHeight;
    // console.log(textAreaRowsComputed);
    return (
        <div className={`py-3 px-1 relative ${borderColor} ${bgColor}`}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="*"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        let chatMessageType = detectChatMessageType(e.target.files?.[0]);
                        onSendFile({chatMessageType:chatMessageType, file:e.target.files[0]});
                    }
                }}
            />

            {/* Tools Menu Overlay */}
            {/*{showToolsMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowToolsMenu(false)}
                    />
                    <div className={`absolute bottom-full left-0 right-0 mb-2 p-4 ${inputBg} ${borderColor} border rounded-xl shadow-lg z-50 animate-in slide-in-from-bottom-2 duration-200`}>
                        <div className="grid grid-cols-4 gap-4">
                            {toolsMenuItems.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => handleToolClick(item.key)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <item.icon size={24} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className={`text-xs ${textColor}`}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}*/}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className={clsx(
                    "mb-2 rounded-lg grid grid-cols-8 gap-2 max-h-48 overflow-y-auto border",
                    isDark ?"bg-zinc-800 border-zinc-700":"bg-white border-zinc-200 "

                )}>
                    {emojis_const.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => {
                                setText(text + emoji);
                                setShowEmojiPicker(false);
                                textareaRef.current?.focus();
                            }}
                            className="text-2xl hover:scale-125 transition-transform"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Recording Overlay */}
            {recording && (
                <div className={`absolute inset-0 ${bgColor} flex items-center justify-between px-6 z-30`}>
                    {/* Cancel Button */}
                    <button
                        onClick={handleCancelAudio}
                        className="w-10 h-10 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center"
                        aria-label="Cancel recording"
                        title="Cancel"
                    >
                        <X size={24} className={textColor} />
                    </button>

                    {/* Recording Indicator & Time */}
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                        <span className={`text-base font-medium ${textColor} tabular-nums`}>
                            {formatTime(recordingTime)} / 1:00
                        </span>
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSendAudio}
                        className="w-10 h-10 bg-[var(--primary-color)] text-white rounded-full transition-colors flex items-center justify-center"
                        aria-label="Send voice message"
                        title="Send"
                    >
                        <Send size={20} />
                    </button>
                </div>
            )}

            {/* Input Bar */}
            <div className="flex items-end gap-2">
                {/* Plus/Tools Button */}
                <button
                    onClick={handleAddClick}
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        showToolsMenu
                            ? 'bg-blue-100 dark:bg-[var(--primary-color)]/30 text-[var(--primary-color)]'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-label="Tools"
                >
                    <Plus size={20} className={showToolsMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
                </button>

                {/* Text Input */}
                <div className={`flex-1 ${inputBg} rounded-xl px-2 py-1 border ${borderColor} flex items-center`}>
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setTextareaRows(textareaRef?.current?.rows || 1)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type a message"
                        rows={1}
                        className={`flex-1 resize-none bg-transparent outline-none border-none ${textColor} placeholder-gray-400`}
                        style={{ maxHeight: '288px', lineHeight: '24px' }}
                    />
                </div>

                {/* Emoji Button */}
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        showEmojiPicker
                            ? 'bg-blue-100 dark:bg-[var(--primary-color)]/30 text-[var(--primary-color)]'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-label="Emoji"
                >
                    <Smile size={20} />
                </button>

                {/* Voice Recorder or Send Button */}
                {text.trim() ? (
                    <button
                        onClick={handleSend}
                        className="flex-shrink-0 w-9 h-9 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                        aria-label="Send"
                    >
                        <Send size={18} />
                    </button>
                ) : (
                    <button
                        onMouseDown={startRecording}
                        onTouchStart={startRecording}
                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                            recording
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        aria-label="Voice message"
                    >
                        <Mic size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};
