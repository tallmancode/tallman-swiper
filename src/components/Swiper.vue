<script setup lang="ts">
import SwiperCard from "./SwiperCard.vue";
import {swiperConfig} from "~/utils/swiperConfig.ts";
import useSwiperTransitions from "~/utils/swiperTransitions.ts";
import {initState} from '~/utils/swiperState.ts'
import {computed, onBeforeMount, onBeforeUnmount, onMounted, ref, Ref} from "vue";
import useSwiperTouchEvents from "~/utils/swiperTouchEvents.ts";
import useSwiperQueue from "~/utils/swiperQueue.ts";
import useSwiperCore from "~/utils/swiperCore.ts";
import {mdiClose, mdiHeartOutline, mdiStarPlusOutline, mdiUndo} from "@mdi/js";
import ControlButton from "~/components/ControlButton.vue";
import type {ISwiperProps, ISwiperState, IPhoto} from "~/types";
import {SWIPE_THRESHOLDS} from "~/utils/animationConstants";

const props = withDefaults(defineProps<ISwiperProps>(), {
    allowSuper: true,
    allowDown: false,
    keyName: 'key',
    pointerThreshold: SWIPE_THRESHOLDS.POINTER_RATIO,
    superThreshold: SWIPE_THRESHOLDS.SUPER_RATIO,
    downThreshold: SWIPE_THRESHOLDS.DOWN_RATIO,
    sync: false,
    max: 3,
    scaleStep: 0.05,
    offsetY: 0,
    offsetUnit: 'px'
})

const queue = ref<IPhoto[]>([])


const swiperState: Ref<ISwiperState> = ref(initState())
const isMounted = ref(false)
const list = ref<IPhoto[]>([])
const offset = ref(0)
const root: Ref<HTMLDivElement | null> = ref(null)
const resizeTimer: Ref<NodeJS.Timeout | null> = ref(null)

const emit = defineEmits(['submit', 'update:modelValue'])

const ratio = computed(() => {
    if (swiperConfig.value.size.width) {
        const {start, move} = swiperState.value
        const x = move.x - start.x || 0
        return x / (swiperConfig.value.size.width * SWIPE_THRESHOLDS.WIDTH_MULTIPLIER)
    }
    return 0
})

const direction = computed(() => {
    if(ratio.value / props.pointerThreshold >= 1) {
        return 'like'
    }else if(props.allowSuper && disY.value / (-props.superThreshold * swiperConfig.value.size.height) >= 1) {
        return 'super'
    }else if(props.allowDown && disY.value / (props.downThreshold * swiperConfig.value.size.height) >= 1) {
        return 'down'
    }else if(Math.abs(ratio.value / props.pointerThreshold) >= 1){
        return 'reject'
    }
})

const disY = computed(() => {
    if (props.allowSuper || props.allowDown) {
        return swiperState.value.move.y - swiperState.value.start.y
    }
    return 0
})


const getSize = () => {
    if (!root.value) return

    if (resizeTimer.value) {
        clearInterval(resizeTimer.value)
    }

    resizeTimer.value = setTimeout(() => {
        swiperConfig.value.size = {
            top: root.value?.offsetTop ?? 0,
            width: root.value?.offsetWidth ?? 0,
            height: root.value?.offsetHeight ?? 0
        }
    }, 300)
}

const resetState = () => {
    swiperState.value = initState()
}

const mock = (count = 5, append = true) => {
    const newItems: IPhoto[] = []
    for (let i = 0; i < count; i++) {
        if (offset.value < props.itemsList.length) {
            newItems.push({...props.itemsList[offset.value]})
            offset.value++
        }
    }
    if (append) {
        queue.value = queue.value.concat(newItems)
    } else {
        queue.value.unshift(...newItems)
    }
}

onBeforeMount(() => {
    mock()
    list.value = JSON.parse(JSON.stringify(queue.value))
})

onMounted(() => {
    if (!root.value?.offsetWidth || !root.value?.offsetHeight) {
        console.error('Swiper couldn\'t find root element');
        return
    }

    swiperConfig.value.size = {
        top: root.value.offsetTop,
        width: root.value.offsetWidth,
        height: root.value.offsetHeight
    }
    window.addEventListener('resize', getSize)
    window.addEventListener('keydown', handleKeyDown)
    isMounted.value = true
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', getSize)
    window.removeEventListener('keydown', handleKeyDown)
    if (resizeTimer.value) {
        clearTimeout(resizeTimer.value)
    }
})

const handleKeyDown = (e: KeyboardEvent) => {
    // Arrow keys and keyboard shortcuts for accessibility
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault()
            decide('nope')
            break
        case 'ArrowRight':
            e.preventDefault()
            decide('like')
            break
        case 'ArrowUp':
            e.preventDefault()
            decide('super')
            break
        case 'ArrowDown':
            e.preventDefault()
            decide('down')
            break
        case 'z':
        case 'Z':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                decide('rewind')
            }
            break
    }
}



const onSubmit = (_params: {type?: string, key?: string | number, item?: IPhoto}) => {
    if (queue.value.length < 3) {
        mock()
    }
    const newKeys = queue.value.map(item => item[props.keyName])
    const oldKeys = list.value.map(item => item[props.keyName])
    diff(newKeys, oldKeys)
}

const {shiftCard, decide, rewind} = useSwiperCore(swiperConfig, props, swiperState, onSubmit, queue)
const {beforeEnter, leave} = useSwiperTransitions(swiperConfig, props, swiperState)
const {diff} = useSwiperQueue(swiperConfig, props, swiperState, list, queue)
const {start, move,end } = useSwiperTouchEvents(swiperConfig, swiperState, direction, shiftCard)

defineExpose({
    decide, rewind
});

</script>

<template>
    <div>
        <div class="swiper" ref="root">
            <transition-group
                tag="div"
                class="swiper-inner"
                :css="false"
                @beforeenter="beforeEnter"
                @leave="leave"
                @touchstart.native="start"
                @touchmove.native="move"
                @touchend.native="end"
                @touchcancel.native="end"
                @mousedown.native="start"
                @mousemove.native="move"
                @mouseup.native="end"
            >
                <template v-for="(item, index) in list">
                    <SwiperCard
                        v-if="index < max + 1"
                        :ready="index === max"
                        :key="item[keyName]"
                        :data-id="item[keyName]"
                        :index="index"
                        :swiperState="swiperState"
                        :ratio="ratio"
                        :rewind="swiperConfig.rewindKeys.indexOf(item[keyName]) > -1 ? index : false"
                        :tinder-mounted="isMounted"
                        :scale-step="scaleStep"
                        :offset-y="offsetY"
                        :offset-unit="offsetUnit"
                        @reverted="resetState"
                        :item="item"
                    >
                        <slot :data="item" :index="index" :status="swiperState.status"></slot>
                    </SwiperCard>
                </template>
            </transition-group>
        </div>
        <div class="control-buttons">
            <ControlButton color="#33a8b2" :icon="mdiUndo" label="Undo last swipe" @click="decide('rewind')"/>
            <ControlButton color="#cbae45" :icon="mdiClose" label="Reject" @click="decide('nope')"/>
            <ControlButton color="#7147ed" :icon="mdiStarPlusOutline" label="Super like" @click="decide('super')"/>
            <ControlButton color="#fc538d" :icon="mdiHeartOutline" label="Like" @click="decide('like')"/>
        </div>
    </div>


</template>

<style>
.swiper {
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    top: 83px;
    margin: auto;
    width: calc(100% - 20px);
    height: calc(100% - 23px - 65px - 47px - 16px - 60px);
    min-width: 300px;
    max-width: 355px;
    -webkit-tap-highlight-color: transparent;
}
.control-buttons{
    position: absolute;
    gap: 16px;
    left: 0;
    right: 0;
    bottom: 30px;
    margin: auto;
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 300px;
    max-width: 355px;
}

.tinder-card.nope .nope-pointer-wrap,
.tinder-card.like .like-pointer-wrap,
.tinder-card.super .super-pointer-wrap,
.tinder-card.down .down-pointer-wrap {
    opacity: 1 !important;
}

.tinder-card.nope .rewind-pointer-wrap,
.tinder-card.like .rewind-pointer-wrap,
.tinder-card.super .rewind-pointer-wrap,
.tinder-card.down .rewind-pointer-wrap {
    display: none;
}
</style>
