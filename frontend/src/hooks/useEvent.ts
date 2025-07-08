import { EventManager, type EventName } from 'EventManager';
import { useEffect } from 'react';

export const useEvent = (eventName: EventName, cb: (value: unknown) => void) => {
  useEffect(() => {
    EventManager.on(eventName, cb);

    return () => {
      EventManager.off(eventName, cb);
    };
  }, [eventName, cb]);
};
