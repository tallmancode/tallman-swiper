<script setup lang="ts">
import {PropType} from "vue";

const queue = defineModel('queue', {type: [Array<{src: string}>] as PropType<Array<{src: string}>> , default: () => []})

</script>

<template>
<div class="swiper" ref="root">
    <img v-for="item in queue" :src="item.src" alt="">
</div>
</template>

<style scoped>
</style>
