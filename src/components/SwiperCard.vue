<script setup lang="ts">
import {ISwiperState} from "~/utils/swiperState";
import {STATUS_CONSTANTS} from '~/utils/statusConstants'
import {computed, onBeforeMount, onMounted, Ref, ref, watch} from "vue";
import {IPhoto} from "~/types";

interface ISwiperCardProps {
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

const props = withDefaults(defineProps<ISwiperCardProps>(), {
    tinderMounted: false,
    ready: false,
    ratio: 0,
    rewind: false,
})

const scopedRewind: Ref<boolean | number> = ref(false)
const initiated = ref(false)

const isCur = computed(() => {
    return props.index === 0
})

const style = computed(() => {
    if (!initiated.value) {
        return {}
    }

    if (props.swiperState.status === STATUS_CONSTANTS.MOVING) {
        return movingStyle.value
    } else {
        return normalStyle.value
    }
})

const normalStyle = computed(() => {
    if (isCur.value) {
        return {
            opacity: 1,
            transform: `translate3d(0,0,0) rotate(0) scale3d(1,1,1)`,
            transition: `all 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275), z-index 0s`
        }
    }
    return {
        opacity: props.ready ? 0 : 1,
        transform: getTransform(),
        transition: `all 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) ${
            (scopedRewind.value && typeof scopedRewind.value === 'number') ? scopedRewind.value * 80 : 0
        }ms, z-index 0s`
    }
})

const movingStyle = computed(() => {
    const style: { [key: string]: string }  = {transition: 'none'}
    if (isCur.value) {
        const {start, move, startPoint} = props.swiperState
        const x = move.x - start.x || 0
        const y = move.y - start.y || 0
        const rotate = 10 * props.ratio * startPoint
        style['transform'] = `translate3d(${x}px,${y}px,0) rotate(${rotate}deg)`
    } else {
        let ratio = Math.abs(props.ratio)
        if (ratio > 1) {
            ratio = 1
        }
        if (props.ready) {
            style['opacity'] = (ratio * 1).toString()
        }
        style['transform'] = getTransform(ratio)
    }
    return style
})

onBeforeMount(() => {
    scopedRewind.value = props.rewind
    if (!props.tinderMounted) {
        initiated.value = true
    }
})

onMounted(() => {
    requestAnimationFrame(() => {
        initiated.value = true
    })
})

const emit = defineEmits(['reverted'])
const transitionEnd = (e: TransitionEvent) => {
    if (e.target === e.currentTarget && e.propertyName === 'transform') {
        scopedRewind.value = false
        if (isCur.value) {
            if (props.swiperState.status === STATUS_CONSTANTS.REVERT || props.swiperState.status === STATUS_CONSTANTS.REWINDING) {
                emit('reverted')
            }
        }
    }
}

const getTransform = (ratio?:  number) => {
    const index = props.index
    let translateY: number | string = 0
    let scale = 1 - props.scaleStep * index
    if (ratio) {
        scale += ratio * props.scaleStep
    }
    if (props.offsetY) {
        const inverse = props.offsetY < 0
        const offsetY = Math.abs(props.offsetY)
        let y = index * offsetY
        let offsetScale = ((1 - scale) / 2) * 100
        if (ratio) {
            y -= ratio * offsetY
        }
        if (inverse) {
            y *= -1
            offsetScale *= -1
        }
        translateY = `calc(${offsetScale}% + ${y}${props.offsetUnit})`
    }
    return `translate3d(0,${translateY},0) scale3d(${scale},${scale},1)`
}

watch(() => props.index, (val, oldVal) => {
    if (val < oldVal) {
        scopedRewind.value = false
    }
});
</script>

<template>
    <div
        :data-index="index"
        class="swiper-card"
        :style="[{ zIndex: 100 - index }, style]"
        @transitionend="transitionEnd"
    >
        <slot/>
        <transition name="swiper-rewind">
            <slot name="rewind" v-if="scopedRewind !== false"/>
        </transition>
    </div>
</template>

<style>
.swiper-card {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #fefefe;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.swiper-rewind-leave-active {
    transition: all 0.5s ease;
}

.swiper-rewind-leave-to {
    opacity: 0;
}
</style>
