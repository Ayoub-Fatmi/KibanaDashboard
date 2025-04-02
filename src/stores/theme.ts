import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const darkMode = ref(false);

  const loadTheme = () => {
    if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        darkMode.value = prefersDark.matches;
        
        prefersDark.addEventListener('change', (e) => {
          darkMode.value = e.matches;
        });
      }
  }

  // Load saved theme preference
  if (typeof localStorage !== 'undefined') {
    darkMode.value = localStorage.getItem('theme') === 'dark';
  }
  
  // Watch for changes and apply them
  watch(darkMode, (newVal) => {
    // Save preference
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
    
    // Apply class to document
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, { immediate: true });

  const toggleTheme = () => {
    darkMode.value = !darkMode.value;
  };

  return {
    darkMode,
    toggleTheme,
    loadTheme
  };
});