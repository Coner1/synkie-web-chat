import React, {useState, useRef, useMemo, useCallback} from 'react';
import {
    Heart, MoreHorizontal, Smile, Image as ImageIcon,
    Flag, Send, AtSign, X, ChevronDown, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';
import type {Comment, CommentType, UploadedFile} from '~/types/comment';
import {
    postComment,
    toggleLikeComment,
    uploadCommentImages,
    type UploadProgress
} from '~/services/CommentService';
import clsx from 'clsx';
import {getPageIdFromRawUrl, getSiteIdFromRawUrl} from "~/services/utils/sateIdUtil";
import {useComments} from "~/hooks/useComment";
import type {User, UserBasic} from "~/types/user";
import type {ThemeType} from "~/types/common";
import {VList, type VListHandle} from "virtua";
import {Avatar} from "~/components/chat/MessageList";
import type {ChatUserBasic} from "~/types/chat";
import {emojis_const} from "~/constants/emojis_const";
import {ImageLightbox} from './ImageLightbox';
import {formatRelativeTime} from "~/services/utils/datetimeUtils";
import {comment} from "postcss";

interface CommentsListProps {
    currentUser: User;
    theme: ThemeType;
    onViewProfile: (user: UserBasic) => void;
}

function getParentId(comment: Comment | null | undefined) {
    if (!comment) return "";
    if (comment.parentId && comment.parentId.length > 5) {
        return comment.parentId;
    }
    if (comment.id && comment.id.length > 5) {
        return comment.id;
    }
    return "";
}

export const CommentsList: React.FC<CommentsListProps> = (props: CommentsListProps) => {
    const {currentUser, theme, onViewProfile} = props;
    const [showComplaintsOnly, setShowComplaintsOnly] = useState(false);
    const [sort, setSort] = useState<'hot' | 'newest'>('hot');
    const [isInputExpanded, setIsInputExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isComplaint, setIsComplaint] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const vListRef = useRef<VListHandle>(null);
    const loadMoreTimeoutRef = useRef<number | null>(null);
    const isAtBottomRef = useRef(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Image upload state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
    const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Lightbox state
    const [lightboxImages, setLightboxImages] = useState<UploadedFile[] | null>(null);
    const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

    const BOTTOM_THRESHOLD = 150;

    const url = window.location.href;
    const siteId = getSiteIdFromRawUrl(url);
    const pageId = getPageIdFromRawUrl(url);
    const {loading, comments} = useComments(siteId, pageId);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const isDark = theme === 'dark';

    const colors = {
        bg: isDark ? 'bg-[#121212]' : 'bg-white',
        text: isDark ? 'text-gray-100' : 'text-gray-900',
        sub: isDark ? 'text-white/40' : 'text-black/40',
        border: isDark ? 'border-zinc-800' : 'border-zinc-100',
        input: isDark ? 'bg-zinc-800' : 'bg-zinc-100'
    };

    const processedComments = useMemo(() => {
        let filtered = showComplaintsOnly ? comments.filter(c => c.type === 'complain') : comments;
        return [...filtered].sort((a, b) => {
            if (sort === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            return (b.likes || 0) - (a.likes || 0);
        });
    }, [comments, showComplaintsOnly, sort]);

    const handleLike = useCallback(async (commentId: string, isCancelLike: boolean) => {
        try {
            await toggleLikeComment(siteId, pageId, commentId, currentUser.id, isCancelLike);
        } catch (error) {
            console.error("Like failed:", error);
        }
    }, [siteId, pageId, currentUser]);

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        const validFiles = fileArray.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} is larger than 10MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        if (uploadedImages.length + validFiles.length > 5) {
            alert('Maximum 5 images allowed per comment');
            return;
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setIsInputExpanded(true);
        setIsUploading(true);

        try {
            const uploaded = await uploadCommentImages(
                siteId,
                pageId,
                validFiles,
                (progressMap) => {
                    setUploadProgress(progressMap);
                }
            );

            setUploadedImages(prev => [...prev, ...uploaded]);
            setSelectedFiles([]);
            setUploadProgress({});
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Some images failed to upload. Please try again.');
        } finally {
            setIsUploading(false);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [siteId, pageId, uploadedImages.length]);

    const handleRemoveImage = useCallback((imageId: string) => {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    }, []);

    const handleSend = async () => {
        if (!inputValue.trim() && uploadedImages.length === 0) return;
        if (isUploading) {
            alert('Please wait for images to finish uploading');
            return;
        }

        const type: CommentType = isComplaint ? 'complain' : 'normal';
        setSort("newest")
        try {
            const pId = getParentId(replyingTo)
            let replyingToId = replyingTo?.id || ""
            let replyingToName = replyingTo?.userName || ""
            if(replyingTo && replyingTo.id === pId){
                replyingToId = ""
                replyingToName = ""
            }
            await postComment(siteId, pageId, {
                siteId,
                pageId,
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatar,
                content: inputValue,
                type,
                parentId: pId,
                replyToId: replyingToId,
                replyToName: replyingToName,
                images: uploadedImages.length > 0 ? uploadedImages : undefined
            });

            setInputValue('');
            setUploadedImages([]);
            setSelectedFiles([]);
            setUploadProgress({});
            setIsInputExpanded(false);
            setReplyingTo(null);
            setIsComplaint(false);

        } catch (error) {
            console.error("Post failed:", error);
            alert('Failed to post comment. Please try again.');
        }
    };

    const handleScroll = (offset: number) => {
        if (loadMoreTimeoutRef.current) {
            clearTimeout(loadMoreTimeoutRef.current);
            loadMoreTimeoutRef.current = null;
        }
        const viewportSize = vListRef.current?.viewportSize || 0;
        const scrollSize = vListRef.current?.scrollSize || 0;
        const distanceToBottom = scrollSize - (offset + viewportSize);
        isAtBottomRef.current = distanceToBottom < BOTTOM_THRESHOLD;
    };

    const handleImageClick = useCallback((images: UploadedFile[], index: number) => {
        setLightboxImages(images);
        setLightboxInitialIndex(index);
    }, []);


    return (
        <div className={clsx("flex flex-col h-full mt-2", colors.bg, colors.text)}>
            {/* Header Row */}
            <div className={clsx("flex items-center justify-between px-3 border-b", colors.border)}>
                <div className={clsx("flex rounded-lg p-1", isDark ? "bg-zinc-800" : "bg-zinc-100")}>
                    {['Hot', 'Newest'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setSort(s.toLowerCase() as any)}
                            className={clsx(
                                "px-3 py-1 rounded-md text-[11px] font-black uppercase transition-all",
                                sort === s.toLowerCase() ? "shadow-sm opacity-100" : "opacity-40",
                                isDark ? "bg-zinc-800" : "bg-zinc-100",
                                colors.text
                            )}
                        >
                            {s}
                        </button>

                    ))}
                </div>

                <button
                    onClick={() => setShowComplaintsOnly(!showComplaintsOnly)}
                    className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border border-solid transition-all",
                        showComplaintsOnly ? "border-red-500 bg-red-500/10 text-red-500" : `border-zinc-300 dark:border-zinc-700 ${colors.sub}`
                    )}
                >
                    <Flag size={14} fill={showComplaintsOnly ? "currentColor" : "none"}/>
                    <span className="text-[11px] font-black uppercase">Complaints</span>
                </button>
            </div>

            {/* Threaded List View */}
            <div
                className={clsx(
                    "flex-1 flex flex-col overflow-hidden",
                    isDark ? "bg-[#191919]" : ""
                )}
            >
                {processedComments.length < 1 ? (
                    <div className="flex flex-1 items-center justify-center text-center px-6">
                        <div className="flex flex-col items-center gap-2 opacity-60">
                            <div className="text-sm font-semibold">
                                No comments yet
                            </div>
                            <div className="text-xs">
                                Be the first
                            </div>
                        </div>
                    </div>
                ) : (
                    <VList
                        ref={vListRef}
                        className="p-3"
                        style={{flex: 1}}
                        onScroll={handleScroll}
                    >
                        {processedComments.map((comment) => (
                            <div key={comment.id} className="flex flex-col animate-[synkie-comment-fade.18s_ease]">
                                <CommentNode
                                    comment={comment}
                                    currentUserId={currentUser.id}
                                    onLike={handleLike}
                                    onReply={setReplyingTo}
                                    onImageClick={handleImageClick}
                                    theme={theme}
                                    onViewProfile={onViewProfile}
                                />

                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="ml-8 ">
                                        {comment.replies.map((reply) => (
                                            <CommentNode
                                                key={reply.id}
                                                comment={reply}
                                                currentUserId={currentUser.id}
                                                onLike={handleLike}
                                                onReply={setReplyingTo}
                                                onImageClick={handleImageClick}
                                                theme={theme}
                                                isReply={true}
                                                onViewProfile={onViewProfile}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </VList>
                )}
            </div>
            <div
                className={clsx('w-full', isDark ? 'bg-white/5' : 'bg-black/5')}
                style={{ height: 1 }}
            />
            <CommentComposer
                theme={theme}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}

                inputValue={inputValue}
                setInputValue={setInputValue}

                isComplaint={isComplaint}
                setIsComplaint={setIsComplaint}

                uploadedImages={uploadedImages}
                uploadProgress={uploadProgress}
                isUploading={isUploading}

                fileInputRef={fileInputRef}

                handleFileSelect={handleFileSelect}
                handleRemoveImage={handleRemoveImage}

                handleSend={handleSend}

                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}

                inputRef={inputRef}

                isInputExpanded={isInputExpanded}
                setIsInputExpanded={setIsInputExpanded}
            />

            {/* Lightbox */}
            {lightboxImages && (
                <ImageLightbox
                    images={lightboxImages}
                    initialIndex={lightboxInitialIndex}
                    onClose={() => setLightboxImages(null)}
                />
            )}
        </div>
    );
};

export interface CommentNodeProps {
    comment: Comment;
    currentUserId: string;
    theme: ThemeType;
    isReply?: boolean;
    onLike: (commentId: string, alreadyLiked: boolean) => void;
    onReply: (comment: Comment) => void;
    onImageClick: (images: UploadedFile[], index: number) => void;
    onViewProfile: (user: UserBasic) => void;
}

const CommentNode = ({
                         comment,
                         currentUserId,
                         onLike,
                         onReply,
                         onImageClick,
                         theme,
                         isReply = false,
                         onViewProfile
                     }: CommentNodeProps) => {

    const isLiked = comment.likedBy?.includes(currentUserId);

    const chatUser = {
        id: comment.userId,
        name: comment.userName,
        avatar: comment.userAvatar,
        type: "user"
    } as ChatUserBasic;

    return (
        <div
            className={clsx(
                "flex gap-3 group py-2 px-2 rounded-xl transition-colors",
                "hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40",
                isReply && "ml-2"
            )}
        >
            <Avatar
                chatUser={chatUser}
                theme={theme}
                onViewProfile={onViewProfile}
                size={isReply ? 4 : 8}
            />

            <div className="flex-1 min-w-0 space-y-1">

                {/* HEADER */}
                <div className="flex items-center gap-2 text-[13px]">

          <span className="font-semibold opacity-50">
            {comment.userName}
          </span>


                    {comment.type === "complain" && (
                        <span
                            className="text-[10px] px-2 py-[2px] rounded-full bg-red-500/15 text-red-400 border border-red-400/30 font-medium tracking-wide">
              Complaint
            </span>
                    )}

                </div>


                {/* MESSAGE BUBBLE */}
                <div>
                    <span
                        className={clsx(
                            "leading-relaxed text-[14px] break-words",
                            isReply && "text-[13px]"
                        )}
                    >
                        {comment.replyToId && comment.replyToName && (
                            <span className="text-[13px] opacity-50">
                                @{comment.replyToName}:{" "}
                            </span>
                        )}
                        <span>{comment.content}</span>
                    </span>

                    {/* IMAGES */}
                    {comment.images && comment.images.length > 0 && (
                        <div
                            className={clsx(
                                "mt-2 gap-2",
                                comment.images.length === 1
                                    ? "grid grid-cols-1"
                                    : comment.images.length === 2
                                        ? "grid grid-cols-2"
                                        : "grid grid-cols-3"
                            )}
                        >
                            {comment.images.map((img, idx) => (
                                <img
                                    key={img.id}
                                    src={img.url}
                                    alt={img.name}
                                    className="w-full h-36 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:scale-[1.02] transition-transform"
                                    onClick={() => onImageClick(comment.images!, idx)}
                                />
                            ))}
                        </div>
                    )}

                </div>


                {/* ACTION BAR */}
                <div className="flex items-center justify-between gap-4 mt-1 text-[12px] opacity-70">
                    <span>
                        <span className="opacity-50">
                            {formatRelativeTime(comment.createdAt)}
                        </span>


                        <button
                            onClick={() => onReply(comment)}
                            className="hover:text-[var(--primary-color)] transition text-[11px]"
                        >
                            Reply
                        </button>
                    </span>
            {/*        {comment.edited && (*/}
            {/*            <span className="text-[10px] italic opacity-40">*/}
            {/*  Edited*/}
            {/*</span>*/}
            {/*        )}*/}

                    <button
                        onClick={() => onLike(comment.id, !!isLiked)}
                        className={clsx(
                            "flex items-center gap-1 hover:text-pink-500 transition",
                            isLiked && "text-pink-500"
                        )}
                    >
                        <Heart
                            size={14}
                            fill={isLiked ? "currentColor" : "none"}
                        />
                        {comment.likes || 0}
                    </button>

                </div>

            </div>
        </div>
    );
};

interface CommentComposerProps {
    theme: ThemeType
    replyingTo: Comment | null
    setReplyingTo: (c: Comment | null) => void

    inputValue: string
    setInputValue: React.Dispatch<React.SetStateAction<string>>

    isComplaint: boolean
    setIsComplaint: React.Dispatch<React.SetStateAction<boolean>>

    uploadedImages: UploadedFile[]
    uploadProgress: Record<string, UploadProgress>
    isUploading: boolean

    fileInputRef: React.RefObject<HTMLInputElement>

    handleFileSelect: (files: FileList | null) => void
    handleRemoveImage: (id: string) => void

    handleSend: () => void

    showEmojiPicker: boolean
    setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>

    inputRef: React.RefObject<HTMLTextAreaElement>

    isInputExpanded: boolean
    setIsInputExpanded: (v: boolean) => void
}
const CommentComposer= ({
                                                             theme,
                                                             replyingTo,
                                                             setReplyingTo,
                                                             inputValue,
                                                             setInputValue,
                                                             isComplaint,
                                                             setIsComplaint,
                                                             uploadedImages,
                                                             uploadProgress,
                                                             isUploading,
                                                             fileInputRef,
                                                             handleFileSelect,
                                                             handleRemoveImage,
                                                             handleSend,
                                                             showEmojiPicker,
                                                             setShowEmojiPicker,
                                                             inputRef,
                                                             isInputExpanded,
                                                             setIsInputExpanded
                                                         }:CommentComposerProps) => {

    const isDark = theme === "dark"

    const hasContent = inputValue.trim() || uploadedImages.length > 0

    // @ts-ignore
    return (
        <div className="px-3 py-3 shadow-2xl flex-row ">
            {isInputExpanded&&(
                <button
                    onClick={() => {
                        if (!hasContent) {
                            setIsInputExpanded(false);
                        }
                    }}
                    className="rounded-full opacity-40 hover:opacity-80 transition w-full"
                >
                    <ChevronDown size={20} />
                </button>
            )}

            {replyingTo && (
                <div className="flex justify-between items-center px-3 bg-[var(--primary-color)]/10 rounded-lg border border-[var(--primary-color)]/20">
          <span className="text-[12px] text-[var(--primary-color)]  tracking-wide">
            Replying to @{replyingTo.userName}
          </span>

                    <button onClick={() => setReplyingTo(null)}>
                        <X size={14}/>
                    </button>
                </div>
            )}

            <div className={clsx(
                "transition-all duration-300",
                isInputExpanded ? "space-y-3" : "flex items-center gap-2"
            )}>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e)=>handleFileSelect(e.target.files)}
                />

                <textarea
                    ref={inputRef}
                    rows={isInputExpanded ? 4 : 1}
                    value={inputValue}
                    onFocus={()=>setIsInputExpanded(true)}
                    onChange={(e)=>setInputValue(e.target.value)}
                    placeholder="Write a comment..."
                    className={clsx(
                        "w-full text-sm p-3 rounded-xl outline-none resize-none border",
                        isDark ? "bg-zinc-800 text-gray-100" : "bg-zinc-100 text-gray-900",
                        isComplaint
                            ? "ring-1 ring-red-500 border-red-500"
                            : "border-transparent focus:border-[var(--primary-color)]"
                    )}
                />

                {/* IMAGE PREVIEW */}

                {(uploadedImages.length > 0 || Object.keys(uploadProgress).length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-2">

                        {uploadedImages.map((img)=>(
                            <div key={img.id} className="relative group">

                                <img
                                    src={img.url}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />

                                <button
                                    onClick={()=>handleRemoveImage(img.id)}
                                    className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                                >
                                    <X size={12}/>
                                </button>

                            </div>
                        ))}

                        {Object.values(uploadProgress).map((progress)=>(
                            <div key={progress.fileId} className="w-20 h-20 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">

                                {progress.status === "uploading" && (
                                    <Loader2 className="animate-spin"/>
                                )}

                                {progress.status === "error" && (
                                    <AlertCircle className="text-red-500"/>
                                )}

                            </div>
                        ))}

                    </div>
                )}

                {/* EMOJI PICKER */}

                {showEmojiPicker && (
                    <div className={clsx(
                        "rounded-lg grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border p-2",
                        isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200"
                    )}>
                        {emojis_const.map((emoji)=>(
                            <button
                                key={emoji}
                                onClick={()=>{
                                    // @ts-ignore
                                    setInputValue((v: string)=>v+emoji)
                                    setShowEmojiPicker(false)
                                    inputRef.current?.focus()
                                }}
                                className="text-xl hover:scale-125"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* ACTION BAR */}

                {isInputExpanded && (
                    <div className="flex justify-between items-center">

                        <div className="flex items-center gap-4 opacity-50">
                            <button onClick={()=>setInputValue((v: string)=>v+"@")} className="hover:text-[var(--primary-color)]">
                                <AtSign size={18}/>
                            </button>
                            <button onClick={()=>setShowEmojiPicker(v=>!v)} className={clsx("hover:text-[var(--primary-color)]", showEmojiPicker?"text-[var(--primary-color)]":"")}>
                                <Smile size={18}/>
                            </button>

                            <button
                                onClick={()=>fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="hover:text-[var(--primary-color)]"
                            >
                                <ImageIcon size={18}/>
                            </button>

                            {!replyingTo && (
                                <button
                                    onClick={()=>setIsComplaint(!isComplaint)}
                                    className={clsx("hover:text-red-500",isComplaint ? "text-red-500" : "")}
                                >
                                    <Flag size={18}/>
                                </button>
                            )}

                        </div>

                        <div className="flex items-center gap-2">


                            <button
                                onClick={handleSend}
                                disabled={!hasContent || isUploading}
                                className={clsx(
                                    "p-2.5 rounded-full transition-all active:scale-90 flex items-center gap-1",
                                    hasContent && !isUploading
                                        ? "bg-[var(--primary-color)] text-white"
                                        : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                                )}
                            >
                                {isUploading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </div>

                    </div>
                )}

            </div>

        </div>
    )
}
