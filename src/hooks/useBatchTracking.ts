import { useState, useEffect, useCallback } from 'react';

interface TrackingEvent {
    id: string;
    songId: number;
    event: 'download' | 'play' | 'like' | 'share';
    timestamp: number;
    metadata?: Record<string, any>;
}

interface BatchTrackingConfig {
    maxBatchSize: number;
    maxWaitTime: number; // em milissegundos
    endpoint: string;
}

export const useBatchTracking = (config: BatchTrackingConfig) => {
    const [events, setEvents] = useState<TrackingEvent[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSent, setLastSent] = useState<number>(0);

    // Carregar eventos salvos do localStorage na inicialização
    useEffect(() => {
        try {
            const savedEvents = localStorage.getItem('nexor_tracking_events');
            if (savedEvents) {
                const parsed = JSON.parse(savedEvents);
                setEvents(parsed);
            }
        } catch (error) {
            console.warn('Erro ao carregar eventos salvos:', error);
        }
    }, []);

    // Salvar eventos no localStorage sempre que mudarem
    useEffect(() => {
        try {
            localStorage.setItem('nexor_tracking_events', JSON.stringify(events));
        } catch (error) {
            console.warn('Erro ao salvar eventos:', error);
        }
    }, [events]);

    // Função para adicionar um novo evento
    const trackEvent = useCallback((
        songId: number,
        event: TrackingEvent['event'],
        metadata?: Record<string, any>
    ) => {
        const newEvent: TrackingEvent = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            songId,
            event,
            timestamp: Date.now(),
            metadata
        };

        setEvents(prev => [...prev, newEvent]);
    }, []);

    // Função para enviar eventos em lote
    const sendBatch = useCallback(async (forceSend = false) => {
        if (isProcessing) return;

        const shouldSend = forceSend ||
            events.length >= config.maxBatchSize ||
            (Date.now() - lastSent) >= config.maxWaitTime;

        if (!shouldSend || events.length === 0) return;

        setIsProcessing(true);
        const eventsToSend = [...events];

        try {
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    events: eventsToSend,
                    batchSize: eventsToSend.length,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                // Remover eventos enviados com sucesso
                setEvents(prev => prev.filter(event =>
                    !eventsToSend.some(sentEvent => sentEvent.id === event.id)
                ));
                setLastSent(Date.now());
                console.log(`✅ Lote de ${eventsToSend.length} eventos enviado com sucesso`);
            } else {
                console.error('❌ Erro ao enviar lote:', response.status);
            }
        } catch (error) {
            console.error('❌ Erro ao enviar lote:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [events, isProcessing, lastSent, config]);

    // Enviar automaticamente quando atingir o tamanho do lote
    useEffect(() => {
        if (events.length >= config.maxBatchSize) {
            sendBatch();
        }
    }, [events.length, config.maxBatchSize, sendBatch]);

    // Enviar automaticamente após o tempo máximo de espera
    useEffect(() => {
        const interval = setInterval(() => {
            if (events.length > 0) {
                sendBatch();
            }
        }, config.maxWaitTime);

        return () => clearInterval(interval);
    }, [events.length, config.maxWaitTime, sendBatch]);

    // Função para forçar envio imediato
    const forceSend = useCallback(() => {
        sendBatch(true);
    }, [sendBatch]);

    // Função para limpar eventos (útil para testes)
    const clearEvents = useCallback(() => {
        setEvents([]);
        localStorage.removeItem('nexor_tracking_events');
    }, []);

    return {
        trackEvent,
        events,
        isProcessing,
        forceSend,
        clearEvents,
        pendingCount: events.length,
        lastSent
    };
};


