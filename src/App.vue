<script setup lang="ts">
import usePhotos from "./composables/usePhotos.ts";

const pexel = usePhotos()
pexel?.getPhotos().then(res => console.log(res))
</script>

<template>
    <div>

    </div>
</template>

<style scoped>

</style>
