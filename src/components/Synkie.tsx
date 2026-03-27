import { useState, useEffect, useCallback, useRef } from 'react'
import { Bubble } from './common/Bubble'
import { MainFrame } from './common/MainFrame'
import { ToastNotification } from './notifications/ToastNotification'
import { FloatingBubble } from './notifications/FloatingBubble'
import { PageReactionEmojis } from './comment/PageReactionEmojis'
import type { Notification, ThemeType } from '~/types/common'
import type { User } from '~/types/user'
import { getCurrentUser, initAuth, updateUserProfile } from '~/services/UserService'
import { startPresence, stopPresence } from '~/services/PresenceService'
import { useConnectionStatus } from '~/hooks/useConnectionStatus'
import { useTabVisibility } from '~/hooks/useTabVisibility'
import { useFloatingNotifications } from '~/hooks/useFloatingNotifications'
import { usePageNotifications } from '~/hooks/usePageNotifications'
import { useReactionStickers } from '~/hooks/useReactionStickers'
import { WelcomeSetup } from '~/components/common/WelcomeSetup'
import { postReaction } from '~/services/CommentService'
import { getSiteIdFromRawUrl, getPageIdFromRawUrl } from '~/services/utils/sateIdUtil'
import '~/styles/globals.css'

const hideKey = (pageId: string) => `synkie_rx_hidden_${pageId}`
const isHidden = (pageId: string) => !!localStorage.getItem(hideKey(pageId))
const setHidden = (pageId: string, v: boolean) =>
    v ? localStorage.setItem(hideKey(pageId), '1') : localStorage.removeItem(hideKey(pageId))

const Synkie = () => {
    const { connectionStatus } = useConnectionStatus()
    const [showChat, setShowChat] = useState(false)
    const [notifications] = useState<Notification[]>([])
    const [roomNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [lastReadTimestamp, setLastReadTimestamp] = useState<number | undefined>(undefined)
    const [isLogin, setIsLogin] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | undefined>(undefined)
    const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
    const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
    const [activeTab] = useState<'chat' | 'comments' | 'discover' | 'settings'>('chat')
    const [isNotifying, setIsNotifying] = useState(false)
    const prevBubbleCountRef = useRef(0)
    const [theme, setTheme] = useState<ThemeType>('light')
    const [opacity, setOpacity] = useState(100)

    const isTabVisible = useTabVisibility()
    const { visible: floatingBubbles, addEvent } = useFloatingNotifications({
        isTabVisible,
        isSynkieOpen: showChat,
        activeTab,
        selectedRoomId: undefined,
    })

    useEffect(() => {
        if (floatingBubbles.length > prevBubbleCountRef.current) {
            setIsNotifying(true)
            const t = setTimeout(() => setIsNotifying(false), 750)
            prevBubbleCountRef.current = floatingBubbles.length
            return () => clearTimeout(t)
        }
        prevBubbleCountRef.current = floatingBubbles.length
    }, [floatingBubbles.length])

    const handlePageEvent = useCallback((event: Parameters<typeof addEvent>[0]) => {
        addEvent(event)
    }, [addEvent])

    usePageNotifications({
        currentUserId: currentUser?.id ?? '',
        enabled: isLogin && !!currentUser && !currentUser.isFTU,
        onEvent: handlePageEvent,
    })

    useEffect(() => {
        initAuth().then(() => {
            const user = getCurrentUser()
            if (!user) return
            setCurrentUser(user)
            if (user.preferences) {
                setTheme(user.preferences.theme)
                setOpacity(user.preferences.transparency)
            }
            setIsLogin(true)
        })
    }, [])

    useEffect(() => {
        if (!currentUser) return
        startPresence(currentUser.id, currentUser.name, currentUser.avatar || '')
        return () => stopPresence()
    }, [currentUser?.id])

    const currentPageUrl = window.location.href
    const siteId = getSiteIdFromRawUrl(currentPageUrl)
    const pageId = getPageIdFromRawUrl(currentPageUrl)

    const pageReactionsEnabled = currentUser?.preferences?.pageReactions !== false
    const [pageReactionsHidden, setPageReactionsHiddenState] = useState(() => isHidden(pageId))
    const reactionsActive = isLogin && pageReactionsEnabled && !pageReactionsHidden
    const { reactions: pageReactions, newReactionIds } = useReactionStickers(siteId, pageId, reactionsActive)

    const handleTogglePageReactionsHidden = useCallback(() => {
        if (!currentUser || currentUser.isFTU) { setShowChat(true); return }
        setPageReactionsHiddenState(prev => {
            const next = !prev
            setHidden(pageId, next)
            return next
        })
    }, [pageId, currentUser])

    const handleReact = useCallback(async (emoji: string) => {
        if (!currentUser || currentUser.isFTU) { setShowChat(true); return }
        try {
            await postReaction(siteId, pageId, currentUser.id, currentUser.name, currentUser.avatar, emoji)
        } catch (err) {
            console.error('[Synkie] reaction failed:', err)
        }
    }, [currentUser, siteId, pageId])

    const handleThemeChange = useCallback((newTheme: ThemeType) => {
        setTheme(newTheme)
        setCurrentUser(prev => {
            if (!prev) return prev
            const updated = { ...prev, preferences: { ...prev.preferences, theme: newTheme } }
            updateUserProfile(updated)
            return updated
        })
    }, [])

    const handleOpen = useCallback(() => {
        if (!isLogin) return
        setShowChat(prev => !prev)
    }, [isLogin])

    const handleClose = useCallback(() => {
        setShowChat(false)
        setUnreadCount(0)
        setLastReadTimestamp(Date.now())
    }, [])

    const handleOpacityChange = useCallback((newOpacity: number) => {
        setOpacity(newOpacity)
        setCurrentUser(prev => {
            if (!prev) return prev
            const updated = { ...prev, preferences: { ...prev.preferences, transparency: newOpacity } }
            updateUserProfile(updated)
            return updated
        })
    }, [])

    const handleUpdateUser = useCallback((updates: Partial<User>) => {
        setCurrentUser(prev => {
            if (!prev) return prev
            const updated = { ...prev, ...updates }
            updateUserProfile(updated)
            return updated
        })
    }, [])

    useEffect(() => {
        setPosition(prev => ({
            x: Math.min(prev.x, viewport.width - 60),
            y: Math.min(prev.y, viewport.height - 60),
        }))
    }, [viewport])

    useEffect(() => {
        const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const VIEWPORT_PADDING = 12
    const MAX_FRAME_WIDTH = 350
    const MAX_FRAME_HEIGHT = 700
    const frameWidth = MAX_FRAME_WIDTH
    const frameHeight = Math.min(MAX_FRAME_HEIGHT, viewport.height - VIEWPORT_PADDING * 2)
    const isLeftSide = position.x < viewport.width / 2
    let frameLeft = isLeftSide ? position.x + 60 : position.x - frameWidth
    frameLeft = Math.max(VIEWPORT_PADDING, Math.min(frameLeft, viewport.width - frameWidth - VIEWPORT_PADDING)) + (isLeftSide ? -20 : 20)
    let frameTop = position.y - 40
    frameTop = Math.max(VIEWPORT_PADDING, Math.min(frameTop, viewport.height - frameHeight - VIEWPORT_PADDING)) - 50

    return (
        <div id="synkie-chat-ext-root" style={{ all: 'initial', position: 'fixed' }}>
            <Bubble
                position={position}
                setPosition={setPosition}
                onClick={handleOpen}
                isLogin={isLogin}
                unreadCount={unreadCount}
                showChat={showChat}
                connectionStatus={connectionStatus}
                isNotifying={isNotifying}
                onShit={() => handleReact('💩')}
                onHeart={() => handleReact('❤️')}
                pageReactionsEnabled={pageReactionsEnabled}
                pageReactionsHidden={pageReactionsHidden}
                onTogglePageReactionsHidden={handleTogglePageReactionsHidden}
            />

            {reactionsActive && (
                <PageReactionEmojis
                    reactions={pageReactions}
                    newReactionIds={newReactionIds}
                    currentUserId={currentUser?.id ?? ''}
                    siteId={siteId}
                    pageId={pageId}
                />
            )}

            {floatingBubbles.map((bubble) => (
                <FloatingBubble
                    key={bubble.id}
                    bubble={bubble}
                    originX={position.x}
                    originY={position.y}
                    onClick={() => setShowChat(true)}
                />
            ))}

            <div style={{
                position: 'fixed',
                left: `${frameLeft}px`,
                top: `${frameTop}px`,
                width: `${frameWidth}px`,
                height: `${frameHeight}px`,
                zIndex: 9998,
                visibility: showChat ? 'visible' : 'hidden',
                pointerEvents: showChat ? 'auto' : 'none',
                opacity: showChat ? 1 : 0,
                transition: 'opacity 0.18s ease-out',
            }}>
                {(!currentUser || currentUser.isFTU) ? (
                    <WelcomeSetup
                        currentUser={currentUser}
                        onComplete={(updatedUser) => setCurrentUser(updatedUser)}
                        theme={theme}
                    />
                ) : (
                    <MainFrame
                        currentUser={currentUser}
                        onClose={handleClose}
                        onMinimize={handleClose}
                        opacity={opacity}
                        setOpacity={handleOpacityChange}
                        theme={theme}
                        setTheme={handleThemeChange}
                        roomNotifications={roomNotifications}
                        setRoomNotifications={(enabled) => console.log('notifications:', enabled)}
                        lastReadTs={lastReadTimestamp}
                        connectionStatus={connectionStatus}
                        currentPageUrl={currentPageUrl}
                        onUpdateUser={handleUpdateUser}
                    />
                )}
            </div>

            <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10001 }}>
                {notifications.map(n => (
                    <ToastNotification
                        key={n.id}
                        notification={n}
                        onClose={() => {}}
                        onClick={() => {}}
                        theme={theme}
                    />
                ))}
            </div>
        </div>
    )
}

export default Synkie
