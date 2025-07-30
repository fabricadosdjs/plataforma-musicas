import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export const useStopMusicOnRouteChange = () => {
    const pathname = usePathname();
    const { stopMusic } = useAppContext();

    useEffect(() => {
        // Stop music when changing pages
        stopMusic();
    }, [pathname, stopMusic]);
}; 