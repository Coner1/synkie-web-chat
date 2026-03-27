import { useEffect } from 'react'
import type { User } from '~/types/user'
import { listenUser, stopListening } from "~/services/UserService";

export function useUserDocListener(
    currentUser: User | undefined,
    onUserChange: (user: User) => void
) {
    useEffect(() => {
        if (!currentUser) return

        const unsub = listenUser(currentUser.id, nextUser => {
            onUserChange(nextUser)
        })

        return () => {
            unsub?.()
            stopListening()
        }
    }, [currentUser?.id, onUserChange])
}
