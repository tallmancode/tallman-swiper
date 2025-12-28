import {Ref, ref} from "vue";
import type {ISwiperConfig} from "~/types";
import {CARD_STACK} from "~/utils/animationConstants";

export const swiperConfig: Ref<ISwiperConfig> = ref({
    leavedCount: 0,
    hideIndex: CARD_STACK.INITIAL_HIDE_INDEX,
    lastHideIndex: CARD_STACK.INITIAL_HIDE_INDEX,
    hidingKeys: [],
    rewindKeys: [],
    leavingKeys: [],
    size: {
        top: 0,
        width: 0,
        height: 0
    },
    onceRewindCount: 0
})