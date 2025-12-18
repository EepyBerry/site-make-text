import { type Ref, ref } from "vue";

export class EventBus {
  public static spritesheetInitEvent: Ref<boolean> = ref(false)
  public static tickEvent: Ref<number> = ref(0)

  // sent once when spritesheet data is initialized
  public static sendSpritesheetInitEvent() {
    EventBus.spritesheetInitEvent.value = true
  }

  // use current millis as a tick event value
  public static sendTickEvent() {
    EventBus.tickEvent.value = new Date().getMilliseconds()
  }
}
