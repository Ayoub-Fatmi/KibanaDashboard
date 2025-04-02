<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { Column, Task, useKanbanStore } from '../stores/kanban';
import TaskCard from './TaskCard.vue';
import TaskForm from './TaskForm.vue';

const store = useKanbanStore();
const isTaskFormOpen = ref(false);
const selectedTask = ref(null);

const handleDragEnd = (e, columnId) => {
  if (e.added) {
    const { element: task, newIndex } = e.added;
    store.moveTask(task.sourceColumn || 'todo', columnId, task.id);
  }
};

const openEditTask = (task) => {
  selectedTask.value = task;
  isTaskFormOpen.value = true;
};

const closeTaskForm = () => {
  isTaskFormOpen.value = false;
  selectedTask.value = null;
};

const taskToDelete = ref<{task: Task, columnId: string} | null>(null);
const isTaskDeleteDialogOpen = ref(false);

const confirmDeleteTask = (task: Task, columnId: string) => {
  taskToDelete.value = { task, columnId };
  isTaskDeleteDialogOpen.value = true;
};

const deleteTask = () => {
  if (taskToDelete.value) {
    store.deleteTask(taskToDelete.value.columnId, taskToDelete.value.task.id);
    isTaskDeleteDialogOpen.value = false;
    taskToDelete.value = null;
  }
};

const isColumnFormOpen = ref(false);
const newColumnTitle = ref('');

const openColumnForm = () => {
  newColumnTitle.value = '';
  isColumnFormOpen.value = true;
};

const addNewColumn = () => {
  if (newColumnTitle.value.trim()) {
    store.addColumn(newColumnTitle.value.trim());
    isColumnFormOpen.value = false;
  }
};

const handleColumnDragEnd = (e) => {
  if (e.moved) {
    store.moveColumn(e.moved.oldIndex, e.moved.newIndex);
  }
};

const columnToDelete = ref<Column | null>(null);
const isDeleteDialogOpen = ref(false);

const confirmDeleteColumn = (column: Column) => {
  columnToDelete.value = column;
  isDeleteDialogOpen.value = true;
};

const deleteColumn = () => {
  if (columnToDelete.value) {
    store.deleteColumn(columnToDelete.value.id);
    isDeleteDialogOpen.value = false;
    columnToDelete.value = null;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-4 dark:bg-gray-900 transition-colors duration-200 ">
    <div class="mb-6 flex justify-center gap-2">
      <button
        @click="isTaskFormOpen = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add New Task
      </button>
      <button
        @click="openColumnForm"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Add New Column
      </button>
    </div>
    
    <!-- <div class="flex gap-6 min-h-[calc(100vh-12rem)] h-full justify-center">
      <div v-for="column in store.columns" :key="column.id" class="kanban-column flex flex-col">
        <h2 class="text-lg font-semibold mb-4">{{ column.title }}</h2>
        <draggable
          :list="column.tasks"
          group="tasks"
          item-key="id"
          class="space-y-4 flex-1 min-h-full"
          @end="(e) => handleDragEnd(e, column.id)"
        >
          <template #item="{ element }">
            <TaskCard 
              :task="element" 
              @click="openEditTask(element)"
              @update="store.updateTask(column.id, element.id, $event)"
            />
          </template>
        </draggable>
      </div>
    </div> -->
    
    <draggable
      v-model="store.columns"
      group="columns"
      item-key="id"
      tag="div"
      handle=".column-handle"
      @end="handleColumnDragEnd"
      class="flex gap-6 min-h-[calc(100vh-12rem)] h-full justify-center"
    >
      <template #item="{ element: column }">
        <div class="kanban-column flex flex-col">
          <div class="column-header flex items-center justify-between mb-2 p-2 bg-gray-100 rounded-t-lg">
            <div class="column-handle cursor-move flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
              </svg>
              <h2 class="text-lg font-semibold">{{ column.title }}</h2>
            </div>
            <button
              @click.stop="confirmDeleteColumn(column)"
              class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
              title="Delete column"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
          <div v-if="!column.tasks.length" class="text-center text-gray-500 py-4">
            Drop tasks here
          </div>
          <draggable
            :list="column.tasks"
            group="tasks"
            item-key="id"
            class="space-y-4 flex-1 min-h-full"
            @end="(e) => handleDragEnd(e, column.id)"
          >
            <template #item="{ element }">
              <TaskCard 
                :task="element" 
                @click="openEditTask(element)"
                @update="store.updateTask(column.id, element.id, $event)"
                @delete="confirmDeleteTask(element, column.id)"
              />
            </template>
          </draggable>
        </div>
      </template>
    </draggable>

    <TaskForm
      :is-open="isTaskFormOpen"
      :task="selectedTask"
      @close="closeTaskForm"
      @update="(columnId, taskId, updates) => store.updateTask(columnId, taskId, updates)"
    />


    <Dialog :open="isColumnFormOpen" @close="isColumnFormOpen = false" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <DialogTitle class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Add New Column
          </DialogTitle>
          
          <form @submit.prevent="addNewColumn" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Column Title</label>
              <input
                type="text"
                v-model="newColumnTitle"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div class="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                @click="isColumnFormOpen = false"
                class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                Add Column
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>


    <!-- --------------------------------------------DELETE COLUMN -->
  <Dialog :open="isDeleteDialogOpen" @close="isDeleteDialogOpen = false" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" ></div>
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-2xl bg-white p-6">
        <DialogTitle class="text-lg font-medium text-gray-900">
          Delete Column
        </DialogTitle>
        <div class="mt-4">
          <p class="text-sm text-gray-500">
            Are you sure you want to delete "{{ columnToDelete?.title }}"?
            This will also delete all {{ columnToDelete?.tasks.length }} tasks in this column.
          </p>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="isDeleteDialogOpen = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="deleteColumn"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Delete
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>

  <!-- delete task -->
  <Dialog :open="isTaskDeleteDialogOpen" @close="isTaskDeleteDialogOpen = false" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-2xl bg-white p-6">
        <DialogTitle class="text-lg font-medium text-gray-900">
          Delete Task
        </DialogTitle>
        <div class="mt-4">
          <p class="text-sm text-gray-500">
            Are you sure you want to delete "{{ taskToDelete?.task.title }}"?
          </p>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="isTaskDeleteDialogOpen = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="deleteTask"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Delete
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>

  </div>
</template>