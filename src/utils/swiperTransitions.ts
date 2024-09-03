import {ISwiperConfig} from "~/utils/swiperConfig.ts";
import {Ref} from "vue";
import {ISwiperProps} from "~/components/Swiper.vue";
import {STATUS_CONSTANTS} from '~/utils/statusConstants.ts'
import {initState, ISwiperState} from "~/utils/swiperState.ts";
const useSwiperTransitions = (swiperConfig: Ref<ISwiperConfig>, swiperProps: ISwiperProps, swiperState: Ref<ISwiperState>) => {

    const beforeEnter = (eventEl: any) => {
        const el = eventEl as HTMLInputElement
        const beforeIndex = parseInt(el.dataset.index as string) + 1
        el.style.opacity = '0'
        el.style.transform = getTransform(beforeIndex)
        if (swiperConfig.value.rewindKeys.indexOf((el.dataset.id as string)) > -1) {
            let x = -1
            x += swiperConfig.value.size.width * (x < 0 ? -0.5 : 0.5)
            const ratio = x / (swiperConfig.value.size.width * 0.5)
            const rotate = (ratio / (0.8 / 0.5)) * 15
            el.style.transform = `translate3d(${x}px, 0, 0) rotate(${rotate}deg)`
        }
        el.style.transition = 'all 0s'
    }


    const leave = (el, done) => {
        const state = swiperState.value
        const {start, move, startPoint} = state
        let x: number = move.x - start.x || 0
        let y: number = move.y - start.y || 0
        if (state.result === 'super') {
            y -= swiperConfig.value.size.width as number
        } else if (state.result === 'down') {
            y += swiperConfig.value.size.width as number
        } else {
            x += swiperConfig.value.size.width * (x < 0 ? -0.5 : 0.5)
            y *= x / (move.x - start.x)
        }
        const ratio = x / (swiperConfig.value.size.width * 0.5)
        const rotate = (ratio / (0.8 / 0.5)) * 15 * startPoint
        let duration: number =
            state.touchId === null ||
            state.result === 'super' ||
            state.result === 'down'
                ? 800
                : 300;
        el.style.opacity = '0'

        //@ts-ignore
        el.style['pointer-events'] = 'none'
        if (swiperConfig.value.leavingKeys.indexOf(((el as HTMLElement).dataset.id as string)) > -1) {
            // 操作移除
            el.className += ` ${state.result}`
            el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rotate}deg)`
            el.style.zIndex = (1000000 - swiperConfig.value.leavedCount++).toString()
        } else {
            // 因执行 rewind 操作后，index 大于 max 而需被隐藏
            swiperConfig.value.hidingKeys.push((el.dataset.id as string))
            duration = 500
            const index =
                Math.min((swiperProps.max as number), swiperConfig.value.onceRewindCount) + (parseInt(el.dataset.index as string))
            el.style.transform = getTransform(index)
            el.style.zIndex = getHideIndex(parseInt(el.dataset.index as string)).toString()
        }
        el.style.transition = `all ${duration}ms ${
            duration === 500 ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'ease'
        },z-index 0s`
        el.addEventListener('transitionend', e => {
            if (e.propertyName === 'transform') {
                if (swiperConfig.value.lastHideIndex === parseInt(el.style.zIndex)) {
                    swiperConfig.value.lastHideIndex = 50
                    swiperConfig.value.hideIndex = 50
                }
                if (
                    swiperProps.sync &&
                    (swiperState.value.status === STATUS_CONSTANTS.NORMAL || swiperState.value.status === STATUS_CONSTANTS.LEAVING)
                ) {
                    swiperState.value = initState()
                }
                done()
            }
        })
        if (
            !swiperProps.sync &&
            parseInt(el.dataset.index as string) === 0 &&
            swiperState.value.status !== STATUS_CONSTANTS.REWINDING
        ) {
            swiperState.value = initState()
        }
    }

    const getHideIndex = (index: number) => {
        const max = swiperProps.max ?? 3
        let cur
        if (index === max) {
            if (swiperConfig.value.lastHideIndex > swiperConfig.value.hideIndex) {
                cur = swiperConfig.value.hideIndex
                swiperConfig.value.hideIndex += 1 + max
            } else {
                cur = swiperConfig.value.hideIndex++
            }
        } else {
            cur = swiperConfig.value.hideIndex + max - index
        }
        swiperConfig.value.lastHideIndex = cur
        return cur
    }

    const getTransform = (index: number) => {
        const scale = swiperProps.scaleStep ? 1 - swiperProps.scaleStep * index : 0.05
        let translateY: string | number = 0
        if (swiperProps.offsetY) {
            const inverse = swiperProps.offsetY < 0
            const offsetY = Math.abs(swiperProps.offsetY)
            let y = index * offsetY
            let offsetScale = ((1 - scale) / 2) * 100
            if (inverse) {
                y *= -1
                offsetScale *= -1
            }
            translateY = `calc(${offsetScale}% + ${y}${swiperProps.offsetUnit})`
        }
        return `translate3d(0,${translateY},0) scale3d(${scale},${scale},1)`
    }

    return {
        beforeEnter,
        leave
    }
}

export default useSwiperTransitions;
