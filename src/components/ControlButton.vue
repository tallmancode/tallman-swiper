<script setup lang="ts">
defineProps<{icon: string, color: string}>()
</script>

<template>
<button class="control-button" type="button" :style="{backgroundColor: color}">
    <svg :viewBox="'0 0 24 24'">
        <path :d="icon"></path>
    </svg>
</button>
</template>

<style scoped>
.control-button{
    cursor: pointer;
    border-radius: 50%;
    height: 50px;
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
    border: none;
    box-shadow: 0 0 8px 1px rgba(28,28,28,0.60);
    -webkit-box-shadow: 0 0 8px 1px rgba(28,28,28,0.60);
    -moz-box-shadow: 0 0 8px 1px rgba(28,28,28,0.60);
    opacity: 1;
    transition: opacity 0.3s ease;
}
.control-button:hover{
    opacity: 0.75;
}
.control-button svg{
    fill: #ffffff;
    width: 30px;
    height: 30px;
}
</style>
