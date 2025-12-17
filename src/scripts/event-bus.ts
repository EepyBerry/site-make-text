import { type Ref, ref } from "vue";

export class EventBus {
  public static tickEvent: Ref<number> = ref(0);

  // use current millis as a tick event value
  public static sendTickEvent() {
    EventBus.tickEvent.value = new Date().getMilliseconds()
  }
}
