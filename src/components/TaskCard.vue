<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../stores/kanban';
import { format } from 'date-fns';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  'click': [];
  'delete': []; 
}>();

const priorityClass = computed(() => {
  return {
    'priority-high': props.task.priority === 'high',
    'priority-medium': props.task.priority === 'medium',
    'priority-low': props.task.priority === 'low',
  };
});

const formattedDueDate = computed(() => {
  return format(new Date(props.task.dueDate), 'MMM dd, yyyy');
});
</script>

<template>
  <div 
    :class="['task-card', priorityClass]"
    @click="emit('click')"
  >
    <div class="flex justify-between items-start">
      <h3 class="font-semibold">{{ task.title }}</h3>
      <button 
        @click.stop="emit('delete')"
        class="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
        title="Delete task"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>    
    <p class="text-sm text-gray-600 mt-2">{{ task.description }}</p>
    <div class="mt-4 flex items-center justify-between">
      <span class="text-xs text-gray-500">Due: {{ formattedDueDate }}</span>
      <span class="text-xs bg-gray-200 px-2 py-1 rounded">{{ task.assignee }}</span>
    </div>
  </div>
</template>