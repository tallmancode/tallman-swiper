<script setup lang="ts">
import Swiper from '~/components/Swiper.vue'
import {ref, onMounted, onUnmounted} from "vue";
import usePhotos from "~/composables/usePhotos";
import type {IPhoto} from "~/types";

const photosList = ref<IPhoto[]>([])
const hasError = ref<Error | null>(null);
const isLoading = ref<boolean>(true);
const isMenuOpen = ref<boolean>(false);

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

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
    isMenuOpen.value = false
}

const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isMenuOpen.value) {
        closeMenu()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey)
})

</script>

<template>
    <header class="header">
        <button 
            class="hamburger-button" 
            @click="toggleMenu" 
            :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="isMenuOpen"
        >
            <span class="hamburger-line" :class="{ 'open': isMenuOpen }"></span>
            <span class="hamburger-line" :class="{ 'open': isMenuOpen }"></span>
            <span class="hamburger-line" :class="{ 'open': isMenuOpen }"></span>
        </button>
        <h1 class="visually-hidden">Tallman Swiper - Vue 3 Card Swiper</h1>
        <img src="/logo.png" alt="Tallman Swiper - Advanced Card Swipe Component Logo">
    </header>

    <div 
        v-if="isMenuOpen" 
        class="menu-overlay" 
        @click="closeMenu"
        aria-hidden="true"
    ></div>

    <nav 
        class="mobile-menu" 
        :class="{ 'open': isMenuOpen }"
        role="navigation"
        aria-label="Mobile navigation"
        :aria-hidden="!isMenuOpen"
    >
        <div>
            <div class="menu-header">
                <h2 class="visually-hidden">About</h2>
                <a href="https://tallmancode.co.za" target="_blank" rel="noopener noreferrer" title="Visit TallmanCode Portfolio">
                    <img src="/tallmancode-logo.svg" alt="TallmanCode - Software Developer Logo">
                </a>
                <button
                    class="close-button"
                    @click="closeMenu"
                    aria-label="Close menu"
                >
                    <span class="close-icon">&times;</span>
                </button>
            </div>
            <div class="menu-body">
                <p>
                    <strong>Tallman Swiper</strong> is a production-ready, <strong>open-source Vue 3 Tinder-style component</strong>. This <strong>swipe library</strong> replicates the intuitive interactions found in popular discovery apps, built with the Composition API and TypeScript.
                </p>
                <ul>
                    <li>Dynamic <strong>Pexels API</strong> photo integration</li>
                    <li>Advanced <strong>swipe animations</strong> and gestures</li>
                    <li>Fully <strong>responsive design</strong> for mobile and desktop</li>
                    <li>WCAG-compliant <strong>accessibility features</strong></li>
                    <li>High-performance <strong>state management</strong></li>
                </ul>
            </div>
        </div>

        <div class="menu-footer">
            <a href="https://tallmancode.co.za" target="_blank" rel="noopener noreferrer" title="Visit TallmanCode Portfolio">
                <img src="/tallmancode-circle-logo.svg"  alt="TallmanCode Portfolio"/>
            </a>
            <a href="https://github.com/tallmancode" target="_blank" rel="noopener noreferrer" title="View Project on GitHub">
                <img src="/github-logo.svg"  alt="GitHub Repository"/>
            </a>
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" title="Photos provided by Pexels">
                <img src="/pexels-logo.svg"  alt="Pexels Photography"/>
            </a>
        </div>
    </nav>

    <main id="main-content">
        <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>Loading photos...</p>
        </div>

        <div v-else-if="hasError" class="error-container">
            <div class="error-icon" aria-hidden="true">⚠️</div>
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
                <article class="item-wrapper">
                    <img :src="(scope.data as IPhoto).src" :alt="`Dynamic photo by ${(scope.data as IPhoto).credits.name}`">
                    <div class="footer">
                        <div>
                            Photo by {{(scope.data as IPhoto).credits.name}}
                        </div>
                        <div>
                            <a :href="(scope.data as IPhoto).credits.link"  target="_blank" rel="noopener noreferrer">View on Pexel</a>
                        </div>
                    </div>
                </article>
            </template>
        </Swiper>
    </main>
</template>

<style>
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
.header{
    padding-top: 8px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 100;
}
.header img{
    width: auto;
    max-height: 60px;
}

/* Hamburger Button */
.hamburger-button {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    z-index: 101;
}

.hamburger-line {
    width: 25px;
    height: 3px;
    background-color: #fff;
    transition: all 0.3s ease-in-out;
    border-radius: 2px;
}

.hamburger-button:hover .hamburger-line {
    background-color: #f08c0b;
}

.hamburger-line.open:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
}

.hamburger-line.open:nth-child(2) {
    opacity: 0;
}

.hamburger-line.open:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
}

.menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.mobile-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100%;
    background-color: #1a1f26;
    transform: translateX(-280px);
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.mobile-menu.open {
    transform: translateX(0);
}

.menu-header{
    padding: 22px 24px;
}

.menu-header img{
    max-width: 150px;
}

.close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #fff;
    font-size: 32px;
    line-height: 1;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
}

.close-button:hover {
    color: #f08c0b;
}

.close-icon {
    display: block;
}

.menu-body{
    padding: 16px
}

.menu-body ul{
    padding-left: 16px;
}

.menu-body ul li, .menu-body p{
    font-size: 14px;
}

.menu-footer{
    display: flex;
    justify-content: space-between;
    padding: 16px
}

.menu-footer img{
    width: 30px;
    height: 30px;
    object-fit: contain;
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
