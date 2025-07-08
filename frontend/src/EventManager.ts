export type EventName = 'show-nowplaying';

/** Simple, global pub-sub event manager. */
class EventManager extends EventTarget {
  on(eventName: EventName, cb: (...args: unknown[]) => void) {
    this.addEventListener(eventName, cb);
  }

  off(eventName: EventName, cb: (...args: unknown[]) => void) {
    this.removeEventListener(eventName, cb);
  }

  trigger(eventName: EventName, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

// create a singleton instance of the EventManager
const instance = new EventManager();

export { instance as EventManager };
export { EventManager as EventManagerClass };
