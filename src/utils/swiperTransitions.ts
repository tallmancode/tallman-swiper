import {Ref} from "vue";
import type {ISwiperConfig, ISwiperProps, ISwiperState} from "~/types";
import {STATUS_CONSTANTS} from '~/utils/statusConstants.ts'
import {initState} from "~/utils/swiperState.ts";
import {ANIMATION_DURATION, SWIPE_THRESHOLDS, ROTATION, TRANSITION_TIMING, CARD_STACK} from "~/utils/animationConstants";

const useSwiperTransitions = (swiperConfig: Ref<ISwiperConfig>, swiperProps: ISwiperProps, swiperState: Ref<ISwiperState>) => {

    const beforeEnter = (eventEl: Element) => {
        const el = eventEl as HTMLElement
        const beforeIndex = parseInt(el.dataset.index as string) + 1
        el.style.opacity = '0'
        el.style.transform = getTransform(beforeIndex)
        if (swiperConfig.value.rewindKeys.indexOf((el.dataset.id as string)) > -1) {
            let x = -1
            x += swiperConfig.value.size.width * (x < 0 ? -SWIPE_THRESHOLDS.WIDTH_MULTIPLIER : SWIPE_THRESHOLDS.WIDTH_MULTIPLIER)
            const ratio = x / (swiperConfig.value.size.width * SWIPE_THRESHOLDS.WIDTH_MULTIPLIER)
            const rotate = (ratio / (SWIPE_THRESHOLDS.ROTATION_RATIO / SWIPE_THRESHOLDS.WIDTH_MULTIPLIER)) * ROTATION.MAX_DEGREES
            el.style.transform = `translate3d(${x}px, 0, 0) rotate(${rotate}deg)`
        }
        el.style.transition = 'all 0s'
    }


    const leave = (eventEl: Element, done: () => void) => {
        const el = eventEl as HTMLElement
        const state = swiperState.value
        const {start, move, startPoint} = state
        let x: number = move.x - start.x || 0
        let y: number = move.y - start.y || 0
        if (state.result === 'super') {
            y -= swiperConfig.value.size.width as number
        } else if (state.result === 'down') {
            y += swiperConfig.value.size.width as number
        } else {
            x += swiperConfig.value.size.width * (x < 0 ? -SWIPE_THRESHOLDS.WIDTH_MULTIPLIER : SWIPE_THRESHOLDS.WIDTH_MULTIPLIER)
            y *= x / (move.x - start.x)
        }
        const ratio = x / (swiperConfig.value.size.width * SWIPE_THRESHOLDS.WIDTH_MULTIPLIER)
        const rotate = (ratio / (SWIPE_THRESHOLDS.ROTATION_RATIO / SWIPE_THRESHOLDS.WIDTH_MULTIPLIER)) * ROTATION.MAX_DEGREES * startPoint
        let duration: number =
            state.touchId === null ||
            state.result === 'super' ||
            state.result === 'down'
                ? ANIMATION_DURATION.SLOW
                : ANIMATION_DURATION.FAST;
        el.style.opacity = '0'

        el.style.pointerEvents = 'none'
        if (swiperConfig.value.leavingKeys.indexOf(((el as HTMLElement).dataset.id as string)) > -1) {
            // Operation removal
            el.className += ` ${state.result}`
            el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rotate}deg)`
            el.style.zIndex = (1000000 - swiperConfig.value.leavedCount++).toString()
        } else {
            // Card needs to be hidden due to rewind operation exceeding max visible cards
            swiperConfig.value.hidingKeys.push((el.dataset.id as string))
            duration = ANIMATION_DURATION.NORMAL
            const index =
                Math.min((swiperProps.max as number), swiperConfig.value.onceRewindCount) + (parseInt(el.dataset.index as string))
            el.style.transform = getTransform(index)
            el.style.zIndex = getHideIndex(parseInt(el.dataset.index as string)).toString()
        }
        el.style.transition = `all ${duration}ms ${
            duration === ANIMATION_DURATION.NORMAL ? TRANSITION_TIMING.SMOOTH : TRANSITION_TIMING.EASE
        },z-index 0s`
        el.addEventListener('transitionend', e => {
            if (e.propertyName === 'transform') {
                if (swiperConfig.value.lastHideIndex === parseInt(el.style.zIndex)) {
                    swiperConfig.value.lastHideIndex = CARD_STACK.INITIAL_HIDE_INDEX
                    swiperConfig.value.hideIndex = CARD_STACK.INITIAL_HIDE_INDEX
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
