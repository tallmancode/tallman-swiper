export interface IPhoto {
    id: string,
    src: string,
    credits: { name: string, link: string }
    $vtKey?: string
}

export interface ISwiperSize {
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
    leavingKeys: string[],
    size: ISwiperSize,
    onceRewindCount: number
}

export interface ISwiperProps {
    allowSuper?: boolean
    allowDown?: boolean,
    keyName: string,
    pointerThreshold?: number,
    superThreshold?: number,
    downThreshold?: number,
    sync?: boolean,
    max?: number,
    scaleStep?: number,
    offsetY?: number,
    offsetUnit?: string
    itemsList: IPhoto[]
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

export interface ISwiperCardProps {
    tinderMounted: boolean;
    index: number;
    ready: boolean;
    swiperState: ISwiperState;
    ratio: number;
    rewind: boolean | number;
    scaleStep: number;
    offsetY: number;
    offsetUnit: string;
    item: IPhoto
}

