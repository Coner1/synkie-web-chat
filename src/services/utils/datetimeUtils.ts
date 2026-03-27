export interface FirestoreTimestamp {
    nanoseconds:number
    seconds:number
}
export const getFirestoreTimestampNow =():FirestoreTimestamp=>{
    return {
        seconds: Math.floor(Date.now()/1000),
        nanoseconds: 0
    }
}

export const parseFST2date= (ts: FirestoreTimestamp | null) => {
    if (!ts) return '';
    const fst = ts as FirestoreTimestamp;
    if (!fst.seconds) return '';
    const date = new Date(fst.seconds * 1000 + ts.nanoseconds / 1_000_000);
    return date.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})
}
export const parseFST2hm= (ts: FirestoreTimestamp | null) => {
    if (!ts) return '';
    const fst = ts as FirestoreTimestamp;
    if (!fst.seconds) return '';
    const date = new Date(fst.seconds * 1000 + ts.nanoseconds / 1_000_000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export const parseFST2ms= (ts: FirestoreTimestamp | null) => {
    if (!ts) return -1;
    const fst = ts as FirestoreTimestamp;
    if (!fst.seconds) return -1;
    return fst.seconds * 1000 + ts.nanoseconds / 1_000_000
}
export const parseFST2s= (ts: FirestoreTimestamp | null) => {
    if (!ts) return '';
    const fst = ts as FirestoreTimestamp;
    if (!fst.seconds) return '';
    return fst.seconds
}
export function formatRelativeTime(
    ts?: FirestoreTimestamp | null
): string {
    if (!ts || typeof ts.seconds !== "number") return ""

    const now = Date.now()
    const time = ts.seconds * 1000 + ts.nanoseconds / 1_000_000
    const diff = now - time

    const sec = Math.floor(diff / 1000)
    if (sec < 5) return "just now"
    if (sec < 60) return `${sec}s ago`

    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`

    const hour = Math.floor(min / 60)
    if (hour < 24) return `${hour}h ago`

    const day = Math.floor(hour / 24)
    if (day === 1) return "yesterday"
    if (day < 7) return `${day}d ago`

    // fallback → local date
    return new Date(time).toLocaleDateString()
}


