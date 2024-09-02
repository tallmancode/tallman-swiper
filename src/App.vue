<script setup lang="ts">
import usePhotos from "./composables/usePhotos.ts";
import Swiper from "./components/Swiper.vue";
import {ref} from "vue";

const queue = ref<{src: string}[]>([])
const photosList = ref<string[]>([])
const isLoading = ref(true)
const hasError = ref<string | false>(false);
const offset = ref(0)

const pexel = usePhotos()
if(pexel){
    pexel
        .getPhotos()
        .then((photos) => {
            photosList.value = photos
            buildQueue();
            isLoading.value = false
        }).catch((error) => {
            hasError.value = error
        })
}else{
    hasError.value = 'Something went wrong.'
    isLoading.value = false
}

const buildQueue = (count = 5, append = true) => {
    const list = []
    for (let i = 0; i < count; i++) {
        list.push({src: photosList.value[offset.value]})
        offset.value++
    }
    if (append) {
        queue.value = queue.value.concat(list)
    } else {
        queue.value.unshift(...list)
    }
}



</script>

<template>
    <div>
        <Swiper v-model:queue="queue"/>
    </div>
</template>

<style scoped>

</style>
