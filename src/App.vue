<script setup lang="ts">
import Swiper from '~/components/Swiper.vue'
import {ref} from "vue";
import usePhotos from "~/composables/usePhotos";
import type {IPhoto} from "~/types";

const photosList = ref<IPhoto[]>([])
const hasError = ref<Error | null>(null);
const isLoading = ref<boolean>(true);

const pexel = usePhotos()
if (pexel) {
    pexel
        .getPhotos()
        .then((photos) => {
            photosList.value = photos
        }).catch((error) => {
            hasError.value = error instanceof Error ? error : new Error(String(error))
        }).finally(() => {
            isLoading.value = false
        })
} else {
    hasError.value = new Error('Failed to initialize Pexels client. Please check your API key.')
    isLoading.value = false
}

const reloadPage = () => {
    window.location.reload()
}

</script>

<template>
    <div class="header">
        <img src="/logo.png" alt="Tallman Swiper Logo">
    </div>

    <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading photos...</p>
    </div>

    <div v-else-if="hasError" class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p class="error-message">{{ hasError.message }}</p>
        <button class="retry-button" @click="reloadPage">
            Retry
        </button>
    </div>

    <Swiper v-else-if="photosList.length > 0"
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
                        <a :href="(scope.data as IPhoto).credits.link"  target="_blank" rel="noopener noreferrer">View on Pexel</a>
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
    color: #242424;
    background-color: #fff;
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.item-wrapper .footer a{
    color: #f08c0b;
}

.loading-container,
.error-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #fff;
}

.spinner {
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left-color: #f08c0b;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-container p {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
}

.error-container {
    max-width: 400px;
    padding: 30px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.error-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.error-container h2 {
    margin: 0 0 12px 0;
    font-size: 24px;
    color: #fff;
}

.error-message {
    margin: 0 0 24px 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
}

.retry-button {
    padding: 12px 32px;
    background-color: #f08c0b;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.retry-button:hover {
    background-color: #d87a09;
}

.retry-button:focus {
    outline: 2px solid #f08c0b;
    outline-offset: 2px;
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
