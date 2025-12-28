import type {ISwiperState} from "~/types";

export const initState = (revert?: boolean): ISwiperState => ({
    status: revert ? 3 : 0,
    touchId: null,
    start: {x: 0, y: 0},
    move: {x: 0, y: 0},
    startPoint: 1,
    result: null
})

export type {ISwiperState}
