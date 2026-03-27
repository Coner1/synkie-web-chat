import React, { useState, useEffect, useRef } from 'react'
import {MessageCircle, AlertCircle, BellOff, Bell, X, Plus} from 'lucide-react'
import type {ConnectionStatus} from "~/types/common";
import {clampPosition} from "~/services/utils/validation";

interface ChatBubbleProps {
    onClick: () => void
    unreadCount: number
    connectionStatus?: ConnectionStatus
    onClose?: () => void
    onMuteToggle?: (muted: boolean) => void
    isMuted?: boolean
    isLogin: boolean
    showChat: boolean
    position: { x: number; y: number }
    setPosition: (pos: { x: number; y: number }) => void
    isNotifying?: boolean
    onShit?: () => void
    onHeart?: () => void
    pageReactionsEnabled?: boolean
    pageReactionsHidden?: boolean
    onTogglePageReactionsHidden?: () => void
}
export const Bubble: React.FC<ChatBubbleProps> = ({
                                                      onClick,
                                                      unreadCount,
                                                      connectionStatus = 'connecting',
                                                      onClose,
                                                      onMuteToggle,
                                                      isMuted = false,
                                                      showChat,
                                                      position,
                                                      isLogin,
                                                      setPosition,
                                                      isNotifying = false,
                                                      onShit,
                                                      onHeart,
                                                      pageReactionsEnabled,
                                                      pageReactionsHidden,
                                                      onTogglePageReactionsHidden,
                                                  }) => {
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [showMenu, setShowMenu] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [tooltip,setTooltip] = useState<string|null>("Connecting...")
    const [connectionTimeout, setConnectionTimeout] = useState(false)
    const [connectingStartTime, setConnectingStartTime] = useState<number | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    // Track start position to distinguish click vs drag
    const dragStartPos = useRef({ x: 0, y: 0 })
    const bubbleRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
        if(isLogin){
            setTooltip(null)
        }
    }, [isLogin]);
    // Monitor connection timeout (15 seconds)
    useEffect(() => {
        if (connectionStatus === 'connecting') {
            if (!connectingStartTime) {
                setConnectingStartTime(Date.now())
            }

            timeoutRef.current = setTimeout(() => {
                setConnectionTimeout(true)
            }, 15000) // 15 seconds
        } else {
            setConnectionTimeout(false)
            setConnectingStartTime(null)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [connectionStatus, connectingStartTime])

    // Load saved position
    useEffect(() => {
        const domain = window.location.hostname
        const savedPosition = localStorage.getItem(`synkie_bubble_position_${domain}`)
        if (savedPosition) {
            try {
                const parsed = JSON.parse(savedPosition)
                setPosition(clampPosition(parsed?.x || window.innerWidth - 80, parsed?.y || window.innerHeight - 80))
            } catch (e) {
                setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
            }
        } else {
            setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
        }
    }, [])

    // Save position
    useEffect(() => {
        if (position) {
            const domain = window.location.hostname
            localStorage.setItem(`synkie_bubble_position_${domain}`, JSON.stringify(position))
        }
    }, [position])

    const startDrag = (clientX: number, clientY: number) => {
        if (bubbleRef.current && position) {
            const rect = bubbleRef.current.getBoundingClientRect()
            setDragOffset({
                x: clientX - rect.left,
                y: clientY - rect.top
            })
            dragStartPos.current = { x: clientX, y: clientY }
            setIsDragging(true)
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return
        e.preventDefault()
        setShowMenu(false)
        setIsHovered(false)
        startDrag(e.clientX, e.clientY)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0]
        setShowMenu(false)
        setIsHovered(false)
        startDrag(touch.clientX, touch.clientY)
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        if (isDragging) return
        e.preventDefault()
        e.stopPropagation()
        setShowMenu(true)
    }

    // Close menu when clicking outside
    useEffect(() => {
        if (isDragging) return
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false)
            }
        }

        if (showMenu) {
            document.removeEventListener('mousedown', handleClickOutside)
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showMenu])

    useEffect(() => {
        if (!isDragging) return

        const handleMove = (clientX: number, clientY: number) => {
            const newX = clientX - dragOffset.x
            const newY = clientY - dragOffset.y
            const maxX = window.innerWidth - 60
            const maxY = window.innerHeight - 80

            setPosition({
                x: Math.max(10, Math.min(newX, maxX)),
                y: maxY
            })
        }

        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
        const onTouchMove = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault()
            handleMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        const onEnd = () => setIsDragging(false)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onEnd)
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onEnd)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onEnd)
        document.addEventListener('touchmove', onTouchMove, { passive: false })
        document.addEventListener('touchend', onEnd)
        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onEnd)
            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onEnd)
        }
    }, [isDragging, dragOffset])

    // FIX: Only trigger onClick if the mouse/finger didn't move much
    const handleRelease = (clientX: number, clientY: number) => {
        const moveDistance = Math.sqrt(
            Math.pow(clientX - dragStartPos.current.x, 2) +
            Math.pow(clientY - dragStartPos.current.y, 2)
        )

        if (moveDistance < 6) {
            if(!isLogin){
                return;
            }
            onClick()
        }
    }

    if (!position) return null

    const isConnecting = connectionStatus === 'connecting'
    let bgColor = 'bg-[var(--primary-color)]'

    return (
        <div
            ref={bubbleRef}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 9999,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                opacity: 0.98
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseUp={(e) => handleRelease(e.clientX, e.clientY)}
            onTouchEnd={(e) => handleRelease(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
            onContextMenu={handleContextMenu}
            onMouseEnter={() => !isDragging && setIsHovered(true)}
            onMouseLeave={() => !isDragging && setIsHovered(false)}
            className={`${bgColor} text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95`}
        >

            {/* Pulsing inner glow when connecting */}
            {isConnecting && !connectionTimeout &&(
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse pointer-events-none" />
            )}

            {/* Notifying pulse ring */}
            {isNotifying && (
                <div className="absolute inset-0 rounded-full border-4 border-white/60 animate-ping pointer-events-none" />
            )}

            {/* Main Icon */}
            {showChat ?(
                <Plus size={28} className={'rotate-45 transition-transform'} />
            ):(
                <MessageCircle size={28} className={isConnecting && !connectionTimeout ? 'animate-pulse' : ''} />
            )}

            {/* Mute indicator */}
            {isMuted && (
                <div className="absolute top-0 left-0 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center">
                    <BellOff size={10} className="text-white" />
                </div>
            )}

            {/* Unread badge */}
            {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-[#FA5151] text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </div>
            )}
            {/* Hover Tooltip */}
            {tooltip && (
                <div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-lg px-3 py-2 rounded-lg whitespace-nowrap shadow-xl pointer-events-none"
                    style={{ zIndex: 10000 }}
                >
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
            )}
            {/* Context Menu */}
            {showMenu && (
                <div
                    ref={menuRef}
                    style={{zIndex: 10001}}
                    className="
                        absolute
                        bottom-full
                        mb-2
                        left-1/2
                        -translate-x-1/2
                        bg-white
                        rounded-lg
                        shadow-2xl
                        border border-gray-200
                        py-1
                        min-w-[150px]
                        overflow-hidden
                        animate-fade-in-up
                    "
                >
                    {onHeart && (
                        <button
                            onClick={() => { onHeart(); setShowMenu(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                        >
                            ❤️ React with heart
                        </button>
                    )}
                    {onShit && (
                        <button
                            onClick={() => { onShit(); setShowMenu(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                        >
                            💩 React with poop
                        </button>
                    )}
                    {pageReactionsEnabled !== undefined && (
                        <button
                            onClick={() => { onTogglePageReactionsHidden?.(); setShowMenu(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                        >
                            {pageReactionsHidden ? '👁 Show reactions' : '🙈 Hide reactions'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onMuteToggle?.(!isMuted)
                            setShowMenu(false)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                    >
                        {isMuted ? <Bell size={16}/> : <BellOff size={16}/>}
                        {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <div className="border-t border-gray-200"/>
                    <button
                        onClick={() => {
                            onClose?.()
                            setShowMenu(false)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                        <X size={16}/>
                        Close
                    </button>
                </div>
            )}
        </div>

    )
}
