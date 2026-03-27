import React, {useState, useEffect} from 'react'
import {Header} from './Header'
import {BottomTabs} from './BottomTabs'
import {CommentsList} from '../comment/CommentsList'
import {SettingsPanel} from '../settings/SettingsPanel'
import type {ConnectionStatus, TabType, ThemeType} from '~/types/common'
import type {User, UserBasic} from '~/types/user'
import {UserChatList} from '../chat/UserChatList'
import {ChevronLeft} from 'lucide-react'
import {ChatRoom} from '~/components/chat/ChatRoom'
import {UserProfile} from "~/components/user/UserProfile";
import clsx from "clsx";
import {MyProfileList} from "~/components/user/MyProfile";
import {getCurrentWebsiteLogo} from "~/services/utils/websiteUtils";
import type {ChatMeta, ChatUserBasic} from "~/types/chat";
import SiteChatList from "~/components/discover/chats/SiteChatList";


interface ChatFrameProps {
    currentUser: User,
    onClose: () => void,
    onMinimize: () => void,
    opacity: number,
    setOpacity: (value: number) => void,
    theme: ThemeType,
    setTheme: (theme: ThemeType) => void,
    roomNotifications: boolean,
    setRoomNotifications: (enabled: boolean) => void,
    lastReadTs?: number,
    connectionStatus?: ConnectionStatus,
    currentPageUrl?: string,
    onUpdateUser: (updates: Partial<User>) => void,

}

export const MainFrame: React.FC<ChatFrameProps> = (props: ChatFrameProps) => {
    const {
        currentUser,
        onClose,
        onMinimize,
        opacity,
        setOpacity,
        theme,
        setTheme,
        roomNotifications,
        setRoomNotifications,
        lastReadTs,
        connectionStatus = 'connected',
        onUpdateUser,
    } = props;

    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [initializedTabs, setInitializedTabs] = useState<Record<TabType, boolean>>({
        chat: true,
        comments: false,
        discover: false,
        settings: false,
    });
    const [selectedChat, setSelectedChat] = useState<ChatMeta | null>(null);
    const [viewingUser, setViewingUser] = useState<UserBasic |ChatUserBasic| null>(null);
    const [viewingMyProfile, setViewingMyProfile] = useState<User | null>(null);
    const [favicon, setFavicon] = useState('');

    useEffect(() => {
        let websiteLogo = getCurrentWebsiteLogo();
        if (websiteLogo) setFavicon(websiteLogo);
    }, []);
    const onTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (!initializedTabs[tab]) {
            setInitializedTabs(prev => ({ ...prev, [tab]: true }));
        }
    };
    const isDark = theme === 'dark';
    const bgClass = isDark ? 'bg-[#191919]' : 'bg-white';
    const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
    const borderClass = isDark ? 'border-gray-800' : 'border-gray-200';

    // --- Navigation Logic ---
    const handleBack = () => {
        if (viewingUser) {
            setViewingUser(null);
        }else if (viewingMyProfile) {
            setViewingMyProfile(null);
        } else if (selectedChat) {
            setSelectedChat(null);
        }
    };

    const getHeaderTitle = () => {
        if (viewingUser) return 'Profile';
        if (viewingMyProfile) return 'My Profile';
        if (selectedChat) return selectedChat.name || 'Chat';
        if (activeTab === 'comments') return 'Comments';
        if (activeTab === 'discover') return 'Discover';
        if (activeTab === 'settings') return 'Settings';

        return 'Synkie';
    };

    return (
        <div
            className={` ${bgClass} ${textClass} rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full h-full`}
            style={{opacity: opacity / 100 }}
        >
            {/* Header */}
            <div className={`flex items-center ${borderClass}`}>
                {/* Unified Back Button Logic */}
                {(selectedChat || viewingUser || viewingMyProfile) && (
                    <button
                        onClick={handleBack}
                        className={`flex items-center px-3 py-3 transition-colors ${
                            isDark ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-black'
                        }`}
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                <div className="flex-1">
                    <Header
                        activeTab={activeTab}
                        pageTitle={getHeaderTitle()}
                        pageSubtitle={viewingUser ? '' : (selectedChat ? '' : '')}
                        favicon={selectedChat || viewingUser ? '' : favicon}
                        roomNotifications={roomNotifications}
                        onToggleNotifications={() => setRoomNotifications(!roomNotifications)}
                        onMinimize={onMinimize}
                        onClose={onClose}
                        theme={theme}
                        connectionStatus={connectionStatus}
                        showNotificationToggle={activeTab === 'chat' && !!selectedChat && !viewingUser}
                    />

                </div>
            </div>
            <div
                className={clsx('w-full', isDark ? 'bg-white/5' : 'bg-black/5')}
                style={{ height: 1 }}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {/* Standard Tab Content (Hidden when profile is sliding over) */}
                <div className={clsx("h-full flex flex-col transition-opacity duration-200")}>
                    <div className={clsx("h-full", activeTab !== 'chat' && "hidden")}>
                        <UserChatList
                            theme={theme}
                            currentUser={currentUser}
                            onSelectChat={setSelectedChat}
                        />
                    </div>
                    <div className={clsx("h-full", activeTab !== 'comments' && "hidden")}>
                        {initializedTabs.comments && (
                            <CommentsList
                                currentUser={currentUser}
                                theme={theme}
                                onViewProfile={(user) => setViewingUser(user)}/>
                        )}
                    </div>
                    <div className={clsx("h-full", activeTab !== 'discover' && "hidden")}>
                        {initializedTabs.discover && (
                            <SiteChatList
                                currentUser={currentUser}
                                theme={theme}
                                onOpenChat={(chatMeta) => {
                                    setSelectedChat(chatMeta)
                                }}
                            />
                        )}
                    </div>
                    <div className={clsx("h-full", activeTab !== 'settings' && "hidden")}>
                        {initializedTabs.settings && (
                            <SettingsPanel
                                opacity={opacity}
                                setOpacity={setOpacity}
                                theme={theme}
                                setTheme={setTheme}
                                currentUser={currentUser}
                                onUpdateUser={onUpdateUser}
                                onViewMyProfile={(user) => setViewingMyProfile(user)}
                            />
                        )}
                    </div>
                </div>

                {/* Slide-over  */}
                {selectedChat && (
                    <div className={clsx("absolute inset-0 z-40 animate-slide-in-right ", bgClass)}>
                        <ChatRoom
                            chatMeta={selectedChat}
                            currentUser={currentUser}
                            theme={theme}
                            lastReadTs={lastReadTs}
                            onViewProfile={(user) => setViewingUser(user)}
                        />
                    </div>
                )}
                {viewingUser && (
                    <div className={clsx("absolute inset-0 z-40 animate-slide-in-right ", bgClass)}>
                        <UserProfile
                            user={viewingUser}
                            currentUser={currentUser}
                            theme={theme}
                            onStartChat={(chatMeta) => {
                                setViewingUser(null);
                                setSelectedChat(chatMeta)
                            }}
                        />
                    </div>
                )}
                {viewingMyProfile && (
                    <div className={clsx("absolute inset-0 z-40 animate-slide-in-right ", bgClass)}>
                        <MyProfileList theme={theme} user={currentUser} onUpdateUser={onUpdateUser}></MyProfileList>
                    </div>
                )}

            </div>

            {/* Bottom Tabs - Hidden when in a sub-view */}
            {!viewingUser && !selectedChat && !viewingMyProfile && (
                <div>
                    <div
                        className={clsx('w-full', isDark ? 'bg-white/5' : 'bg-black/5')}
                        style={{ height: 1 }}
                    />
                    <BottomTabs
                        activeTab={activeTab}
                        onTabChange={onTabChange}
                        theme={theme}
                        unreadChatsCount={0}
                        unreadCommentsCount={0}
                    />
                </div>
            )}
        </div>
    );
};
