<template>
    <slot />
    <footer class="footer items-center p-8 bg-base-300 text-neutral-content">
        <div class="items-center grid-flow-col">
            <p>Open-source and free, created by <a class="cursor-pointer font-bold"
                    href="https://github.com/leindfraust" target="_blank">Ronan</a></p>
        </div>
        <div class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
            <a class=" cursor-pointer" href="https://github.com/leindfraust/Anon-Meet-Nuxt" target="_blank"><font-awesome-icon
                    icon="fa-brands fa-github" size="2xl" /></a>
        </div>
    </footer>
</template>