import { type Ref, ref } from 'vue';

/**
 * Defines options to pass when registering a window event-listener:
 * - `autoEnable`: if the listener should also be added to the window (default: `true`)
 */
type WindowEventRegistryOptions = { autoEnable: boolean };

export class EventBus {
  public static spritesheetInitEvent: Ref<boolean> = ref(false);
  public static spritesheetReloadEvent: Ref<number> = ref(0);
  public static tickEvent: Ref<number> = ref(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static windowEventRegistry: Map<keyof WindowEventMap, any> = new Map<
    keyof WindowEventMap,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >();

  // sent once when spritesheet data is initialized
  public static sendSpritesheetInitEvent() {
    EventBus.spritesheetInitEvent.value = true;
  }

  // sent when the custom spritesheet has changed
  public static sendSpritesheetReloadEvent() {
    EventBus.spritesheetReloadEvent.value = new Date().getMilliseconds();
  }

  // use current millis as a tick event value
  public static sendTickEvent() {
    EventBus.tickEvent.value = new Date().getMilliseconds();
  }

  // ----------------------------------------------------------------------------------------------

  /**
   * Registers a window event-listener
   * @param type event-listener type (e.g. `keydown`)
   * @param listener the listener to register
   * @param options registering options (see {@link WindowEventRegistryOptions})
   */
  public static registerWindowEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => void,
    options?: WindowEventRegistryOptions,
  ) {
    EventBus.windowEventRegistry.set(type, listener);
    if (!options || options.autoEnable) {
      window.addEventListener(type, listener);
    }
  }

  public static deregisterWindowEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => void,
  ) {
    EventBus.windowEventRegistry.delete(type);
    window.removeEventListener(type, listener);
  }
}
