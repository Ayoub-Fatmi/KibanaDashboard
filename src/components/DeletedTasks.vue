<!-- <script setup lang="ts">
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
</template> -->

<script setup lang="ts">
import { useKanbanStore } from '../stores/kanban';
import { ref, computed } from 'vue';
import { format } from 'date-fns';
import TaskCard from './TaskCard.vue';

const store = useKanbanStore();

const searchQuery = ref('');

const filters = ref({
  priority: '',
  assignee: '',
  dateRange: '',
  columnId: ''
});

const assignees = computed(() => {
  return [...new Set(store.deletedTasks.map(task => task.assignee))];
});

const filteredTasks = computed(() => {
  return store.deletedTasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesPriority = 
      !filters.value.priority || task.priority === filters.value.priority;
    
    const matchesAssignee = 
      !filters.value.assignee || task.assignee === filters.value.assignee;
    
    const matchesColumnId = 
      !filters.value.columnId || task.columnId === filters.value.columnId;

    const matchesDateRange = () => {
      if (!filters.value.dateRange) return true;
      
      const taskDate = new Date(task.deletedAt);
      const now = new Date();
      const diffDays = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
      
      switch(filters.value.dateRange) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'older': return diffDays > 30;
        default: return true;
      }
    };
    
    return matchesSearch && matchesPriority && matchesAssignee && matchesDateRange() && matchesColumnId;
  });
});

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

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tasks..."
              class="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              v-model="filters.priority"
              class="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
            <select
              v-model="filters.assignee"
              class="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Assignees</option>
              <option v-for="assignee in assignees" :key="assignee" :value="assignee">
                {{ assignee }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deleted</label>
            <select
              v-model="filters.dateRange"
              class="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="older">Older Than 30 Days</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Column</label>
            <select v-model="filters.columnId"
              class="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Columns</option>
              <option v-for="col in store.columns" :value="col.id">{{ col.title }}</option>
            </select>
          </div>
        </div>


        <div class="mt-4 flex justify-end">
          <button
            @click="() => {
              searchQuery = '';
              filters = {
                priority: '',
                assignee: '',
                dateRange: '',
                columnId: ''
              };
            }"
            class="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {{ filteredTasks.length }} of {{ store.deletedTasks.length }} deleted tasks
      </div>

      <div v-if="filteredTasks.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">No tasks match your filters</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="task in filteredTasks" 
          :key="task.id"
          class="relative"
        >
          <TaskCard :task="task" :deleted="true" @delete-permanently="store.permanentlyDeleteTask(task.id)" />
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Deleted: {{ formattedDate(task.deletedAt) }}
          </div>
          <div class="flex gap-2 mt-2">
            <button
              @click="store.restoreTask(task.id)"
              class="flex-1 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
            >
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>