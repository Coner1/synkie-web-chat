import { useState, useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"

import Synkie from "~/components/Synkie"
import styleText from "data-text:~/styles/globals.css"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    all_frames: false,
    run_at: "document_end"
}

export const getStyle = () => {
    const style = document.createElement("style")
    style.textContent = styleText
    return style
}

const Content = () => {
    const [enabled, setEnabled] = useState(true)

    useEffect(() => {
        // Optional: listen for extension toggle messages if popup is added later
        const handleMessage = (msg: any) => {
            if (msg.type === "SYNKIE_TOGGLE") {
                setEnabled(msg.enabled)
            }
        }

        if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
            chrome.runtime.onMessage.addListener(handleMessage)
            return () => chrome.runtime.onMessage.removeListener(handleMessage)
        }
    }, [])

    if (!enabled) return null

    return <Synkie />
}

export default Content
