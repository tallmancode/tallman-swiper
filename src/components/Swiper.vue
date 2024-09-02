<script setup lang="ts">
import {PropType} from "vue";

const queue = defineModel('queue', {type: [Array<{src: string}>] as PropType<Array<{src: string}>> , default: () => []})

const emit = defineEmits(['rewind', 'nope', 'super', 'like'])
</script>

<template>
    <div>
        <div class="swiper" ref="root">
            <img v-for="item in queue" :src="item.src" alt="">
        </div>
        <div class="btns">
            <img src="../assets/rewind.png" @click="emit('rewind')" alt="rewind"/>
            <img src="../assets/nope.png" @click="emit('nope')" alt="nope" />
            <img src="../assets/super-like.png" @click="emit('super')" alt="super" />
            <img src="../assets/like.png" @click="emit('like')" alt="like" />
        </div>
    </div>

</template>

<style scoped>
.btns {
    position: absolute;
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

.btns img {
    margin-right: 12px;
    box-shadow: 0 4px 9px rgba(0, 0, 0, 0.15);
    border-radius: 50%;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.btns img:nth-child(2n + 1) {
    width: 53px;
}

.btns img:nth-child(2n) {
    width: 65px;
}

.btns img:nth-last-child(1) {
    margin-right: 0;
}
</style>
