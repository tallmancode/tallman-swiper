import {Ref} from "vue";
import type {ISwiperConfig, ISwiperProps, ISwiperState, IPhoto} from "~/types";
import {STATUS_CONSTANTS} from '~/utils/statusConstants.ts'

const useSwiperCore = (swiperConfig: Ref<ISwiperConfig>, swiperProps: ISwiperProps, swiperState: Ref<ISwiperState>, onSubmit: Function, queue: Ref<IPhoto[]>) => {
    const shiftCard = (type: string) => {
        swiperState.value.status = STATUS_CONSTANTS.LEAVING
        swiperState.value.result = type
        const activeItem = queue.value[0]
        queue.value = queue.value.slice(1, queue.value.length)
        submitDecide(type, activeItem)
    }

    const rewind = (list: IPhoto[]) => {
        for (const item of list) {
            swiperConfig.value.rewindKeys.push(item[swiperProps.keyName] + '')
        }
        queue.value = [...list, ...queue.value]
    }

    const submitDecide = (type: string, item: IPhoto) => {
        onSubmit({type, key: item[swiperProps.keyName], item})
    }
    const decide = (type: string) => {
        if (swiperState.value.touchId || swiperState.value.status !== STATUS_CONSTANTS.NORMAL) {
            return
        }
        swiperState.value.start = { x: 0, y: 0 }
        swiperState.value.move = {
            x: type === 'super' || type === 'down' ? 0 : type === 'like' ? 1 : -1,
            y: type === 'super' ? -1 : type === 'down' ? 1 : 0
        }
        swiperState.value.startPoint = 1
        shiftCard(type)
    }

    return {
        decide,
        rewind,
        shiftCard
    }
}

export default useSwiperCore;
