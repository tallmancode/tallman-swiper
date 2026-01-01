import {Ref} from "vue";
import type {ISwiperConfig, ISwiperProps, ISwiperState, IPhoto} from "~/types";
import {STATUS_CONSTANTS} from '~/utils/statusConstants.ts'

const difference = (array: string[], exclude: string[]): string[] => {
    const result: string[] = []
    for (let i = 0; i < array.length; i++) {
        if (exclude.indexOf(array[i]) > -1) {
            break
        }
        result.push(array[i])
    }
    return result
}

const useSwiperQueue = (swiperConfig: Ref<ISwiperConfig>, swiperProps: ISwiperProps, swiperState: Ref<ISwiperState>, listItems: Ref<IPhoto[]>, queue: Ref<IPhoto[]>) => {
    const diff = (list: string[], old: string[]) => {
        const keyName = swiperProps.keyName
        const add = difference(list, old)
        let onceRewindCount = 0
        if (add.length) {
            for (let i = 0; i < add.length; i++) {
                const item = queue.value[i]
                if (item[keyName] && add[i] === item[keyName]) {
                    onceRewindCount++
                    const id = item[keyName]
                    const newSwiperKey = id + Math.random()
                    if (
                        swiperConfig.value.leavingKeys.indexOf(id) > -1 ||
                        swiperConfig.value.rewindKeys.indexOf(id) > -1
                    ) {
                        const rewindIndex = Math.max(
                            swiperConfig.value.rewindKeys.indexOf(id)
                        )
                        if (rewindIndex > -1) {
                            swiperConfig.value.rewindKeys[rewindIndex] = newSwiperKey
                            swiperState.value.status = STATUS_CONSTANTS.REWINDING
                        }
                    }
                } else {
                    break
                }
            }
        }
        swiperConfig.value.onceRewindCount = onceRewindCount
        const remove = difference(old, list)
        if (remove.length) {
            swiperConfig.value.leavingKeys.push(listItems.value[0][keyName])
            for (let i = (swiperProps?.max as number) + 1; i < (swiperProps?.max as number) + 1 + remove.length; i++) {
                const item = listItems.value[i]
                if (item) {
                    if (
                        swiperConfig.value.leavingKeys.indexOf(item[keyName]) > -1 ||
                        swiperConfig.value.hidingKeys.indexOf(item[keyName]) > -1
                    ) {
                        item.$vtKey = item[keyName] + Math.random()
                    }
                }
            }
        }
        listItems.value = JSON.parse(JSON.stringify(queue.value))
    }

    return {
        diff
    }
}

export default useSwiperQueue;
