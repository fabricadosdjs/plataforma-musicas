import { useState } from 'react';

export const useActiveTab = () => {
    const [activeTab, setActiveTab] = useState('visao-geral');

    const isActive = (tabId: string) => {
        return activeTab === tabId;
    };

    const setActive = (tabId: string) => {
        setActiveTab(tabId);
    };

    return { activeTab, isActive, setActive };
};
