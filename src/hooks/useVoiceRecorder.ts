import { useRef, useState } from 'react'
export const useVoiceRecorder = () => {
    const recorderRef = useRef<MediaRecorder | null>(null)
    const chunks = useRef<Blob[]>([])
    const [recording, setRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

    const start = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        recorderRef.current = recorder
        chunks.current = []

        recorder.ondataavailable = e => {
            if (e.data.size > 0) chunks.current.push(e.data)
        }

        recorder.start()
        setRecording(true)
    }

    const stop = (): Promise<Blob> => {
        return new Promise((resolve) => {
            if (!recorderRef.current) return;

            // Override the onstop logic for this specific call
            recorderRef.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' })
                setAudioBlob(blob) // Still update state for UI

                // Clean up stream tracks
                recorderRef.current?.stream.getTracks().forEach(t => t.stop())
                setRecording(false)

                resolve(blob) // Return the blob immediately to the caller
            }

            recorderRef.current.stop()
        })
    }

    const reset = () => {
        setAudioBlob(null)
        chunks.current = []
    }

    return { recording, audioBlob, start, stop, reset }
}
