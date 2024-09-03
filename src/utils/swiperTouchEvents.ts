import {ISwiperConfig} from "~/utils/swiperConfig.ts";
import {ComputedRef, Ref} from "vue";
import {STATUS_CONSTANTS} from '~/utils/statusConstants.ts'
import {initState, ISwiperState} from "~/utils/swiperState.ts";

const useSwiperTouchEvents = (swiperConfig: Ref<ISwiperConfig>, swiperState: Ref<ISwiperState>, direction: ComputedRef<string|undefined>, shiftCard: Function) => {
    const start = (e: TouchEvent | MouseEvent) => {
        if (
            swiperState.value.touchId !== null ||
            swiperState.value.status === STATUS_CONSTANTS.LEAVING ||
            swiperState.value.status === STATUS_CONSTANTS.REVERT ||
            swiperState.value.status === STATUS_CONSTANTS.REWINDING
        ) {
            return
        }
        let pageX, pageY
        if (e.type === 'touchstart') {
            pageX = (e as TouchEvent).changedTouches[0].pageX
            pageY = (e as TouchEvent).changedTouches[0].pageY
        } else {
            pageX = (e as MouseEvent).clientX
            pageY = (e as MouseEvent).clientY
        }

        const top = swiperConfig.value.size.top
        const height = swiperConfig.value.size.height
        const centerY = top + height / 2
        const startPoint = pageY > centerY ? -1 : 1

        swiperState.value = {
            status: STATUS_CONSTANTS.MOVING,
            touchId:
                e.type === 'touchstart' ? (e as TouchEvent).changedTouches[0].identifier : 'mouse',
            start: {
                x: pageX,
                y: pageY
            },
            move: Object.create(null),
            startPoint,
            result: null
        }
    }
    const move = (e: TouchEvent | MouseEvent) => {
        e.preventDefault()
        if (
            swiperState.value.touchId === null ||
            swiperState.value.status === STATUS_CONSTANTS.LEAVING ||
            swiperState.value.status === STATUS_CONSTANTS.REVERT ||
            swiperState.value.status === STATUS_CONSTANTS.REWINDING ||
            (e.type === 'touchmove' &&
                swiperState.value.touchId !== (e as TouchEvent).changedTouches[0].identifier)
        ) {
            return
        }
        let pageX, pageY
        if (e.type === 'touchmove') {
            pageX = (e as TouchEvent).changedTouches[0].pageX
            pageY = (e as TouchEvent).changedTouches[0].pageY
        } else {
            pageX = (e as MouseEvent).clientX
            pageY = (e as MouseEvent).clientY
        }
        swiperState.value.move = {
            x: pageX,
            y: pageY
        }
    }
    const end = (e: TouchEvent | MouseEvent) => {
        e.preventDefault()
        if (
            e.type === 'touchstart' &&
            swiperState.value.touchId !== (e as TouchEvent).changedTouches[0].identifier
        ) {
            return
        }
        if (
            swiperState.value.status === STATUS_CONSTANTS.LEAVING ||
            swiperState.value.status === STATUS_CONSTANTS.REVERT ||
            swiperState.value.status === STATUS_CONSTANTS.REWINDING
        ) {
            return
        }
        if (
            direction.value !== undefined
        ) {
            shiftCard(direction.value)
        } else if (swiperState.value.status === STATUS_CONSTANTS.MOVING) {
            swiperState.value = initState(true)
        }
    }
    return {
        start,
        move,
        end
    }
}

export default useSwiperTouchEvents;
