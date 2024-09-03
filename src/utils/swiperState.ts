export const initState = (revert?: boolean)  => <ISwiperState> ({
    status: revert ? 3 : 0,
    touchId: null,
    start: {},
    move: {},
    startPoint: 1,
    result: null
})

export interface ISwiperState {
    status: number,
    touchId: string | number | null,
    start: {
        x: number,
        y: number
    },
    move: {
        x: number,
        y: number
    },
    startPoint: number,
    result: null | string | number
}