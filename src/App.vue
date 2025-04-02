<script setup lang="ts">
import { onMounted } from 'vue';
import KanbanBoard from './components/KanbanBoard.vue';
import { useThemeStore } from './stores/theme';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.loadTheme();
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <header class="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
      <div class="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Kanban Dashboard</h1>
        <button
          @click="themeStore.toggleTheme"
          class="p-2 rounded-full focus:outline-none"
          :title="themeStore.darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg
            v-if="themeStore.darkMode"
            class="w-6 h-6 text-yellow-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <svg
            v-else
            class="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        </button>
      </div>
    </header>
    <main>
      <KanbanBoard />
    </main>
  </div>
</template>