<script setup lang="ts">
import { useKanbanStore } from '../stores/kanban';
import TaskCard from '../components/TaskCard.vue';
import { format } from 'date-fns';

const store = useKanbanStore();

const formattedDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Deleted Tasks</h1>
        <router-link 
          to="/"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Board
        </router-link>
      </div>

      <div v-if="store.deletedTasks.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">No deleted tasks found</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="task in store.deletedTasks" 
          :key="task.id"
          class="relative"
        >
          <TaskCard :task="task" :deleted="true" @delete-permanently="store.permanentlyDeleteTask(task.id)" />
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Deleted: {{ formattedDate(task.deletedAt) }}
          </div>
          <button
            @click="store.restoreTask(task.id)"
            class="mt-2 w-full py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
          >
            Restore Task
          </button>
        </div>
      </div>
    </div>
  </div>
</template>