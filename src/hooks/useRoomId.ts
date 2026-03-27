import { useState, useEffect } from 'react';
import { getPageIdFromRawUrl } from '~/services/utils/sateIdUtil';

export const useRoomId = () => {
    const [roomId, setRoomId] = useState<string>('');

    useEffect(() => {
        const generateRoomId = () => {
            const id = getPageIdFromRawUrl(window.location.href);
            setRoomId(id);
        };

        generateRoomId();
    }, []);

    return roomId;
};
