import {Ref, ref} from "vue";

export interface ISwiperSize  {
    top: number,
    width: number,
    height: number
}

export interface ISwiperConfig {
    leavedCount: number,
    hideIndex: number,
    lastHideIndex: number,
    hidingKeys: string[],
    rewindKeys: string[],
    leavingKeys: string [],
    size: ISwiperSize,
    onceRewindCount: number
}

export const swiperConfig: Ref<ISwiperConfig> = ref({
    leavedCount: 0,
    hideIndex: 50,
    lastHideIndex: 50,
    hidingKeys: [],
    rewindKeys: [],
    leavingKeys:[],
    size: {
        top: 0,
        width: 0,
        height: 0
    },
    onceRewindCount:0
})