<script setup lang="ts">
import Swiper from '~/components/Swiper.vue'
import {ref} from "vue";
import usePhotos from "~/composables/usePhotos";
import {IPhoto} from "~/types";

const photosList = ref<IPhoto[]>([])
const hasError = ref<string | false>(false);

const pexel = usePhotos()
if(pexel){
    pexel
        .getPhotos()
        .then((photos) => {
            photosList.value = photos
        }).catch((error) => {
        hasError.value = error
    })
}else{
    hasError.value = 'Something went wrong.'
}

</script>

<template>
    <div class="header">
        <img src="/logo.png" alt="">
    </div>

    <Swiper v-if="photosList.length > 0"
            key-name="id"
            :itemsList="photosList"
            :max="3"
            :offset-y="10"
            allow-down
            >
        <template #default="scope">
            <div class="item-wrapper">
                <img :src="(scope.data as IPhoto).src" :alt="`Photo by ${(scope.data as IPhoto).credits.name}`">
                <div class="footer">
                    <div>
                        Photo by {{(scope.data as IPhoto).credits.name}}
                    </div>
                    <div>
                        <a :href="(scope.data as IPhoto).credits.link"  target="_blank">View on Pexel</a>
                    </div>
                </div>
            </div>
        </template>
    </Swiper>
</template>

<style>
.header{
    padding-top: 8px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.header img{
    width: auto;
    max-height: 60px;
}
.item-wrapper{
    height: 100%;
}
.item-wrapper img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
}
.item-wrapper .footer{
    height: 80px;
    width: 100%;
    background-color: #fff;
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

html,
body {
    height: 100%;
}

body {
    margin: 0;
    background-color: #20262e;
    overflow: hidden;
}
</style>
