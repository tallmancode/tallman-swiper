export interface IPhoto {
    id: string,
    src: string,
    credits: { name: string, link: string }

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

export interface ISwiperProps {
    allowSuper?: boolean
    allowDown?: boolean,
    photoList : IPhoto[],
    keyName?: string,
    pointerThreshold?: number,
    superThreshold?: number,
    downThreshold?: number,
    sync?: boolean,
    max?: number,
    scaleStep?: number,
    offsetY?: number,
    offsetUnit?: string
}

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
