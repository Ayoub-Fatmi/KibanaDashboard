<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { Column, Task, useKanbanStore } from '../stores/kanban';
import TaskCard from './TaskCard.vue';
import TaskForm from './TaskForm.vue';
import ColumnForm from './ColumnForm.vue';
import DeleteForm from './DeleteForm.vue';

const store = useKanbanStore();
const isTaskFormOpen = ref(false);
const selectedTask = ref<Task | null>(null);

const handleDragEnd = (e) => {
  if (e.added) {
    const { element: task, newIndex } = e.added;
    store.moveTask(task.sourceColumn || 'todo', newIndex, task.id);
  }
};
const handleColumnDragEnd = (e) => {
  if (e.moved) {
    store.moveColumn(e.moved.oldIndex, e.moved.newIndex);
  }
};

//--- Task Form Start
const openEditTask = (task : Task) => {
  selectedTask.value = task;
  isTaskFormOpen.value = true;
};

const closeTaskForm = () => {
  isTaskFormOpen.value = false;
  selectedTask.value = null;
};
//--- Task Form End
//---- Delete start
const taskToDelete = ref<{task: Task, columnId: string} | null>(null);
const columnToDelete = ref<Column | null>(null);
const isDeleteDialogOpen = ref(false);

const confirmDeleteTask = (task: Task, columnId: string) => {
  taskToDelete.value = { task, columnId };
  isDeleteDialogOpen.value = true;

};

const deleteTask = () => {
  if (taskToDelete.value) {
    store.deleteTask(taskToDelete.value.columnId, taskToDelete.value.task.id);
    taskToDelete.value = null;
    isDeleteDialogOpen.value = false;
  }
};

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

const deleteColumnOrTask = (typeOfDelete : string) => {
  console.log(typeOfDelete);
  if (typeOfDelete === 'column') {
    deleteColumn();
  } else if (typeOfDelete === 'task') {
    deleteTask();
  }
}

const closeDeleteForm = () => {
  isDeleteDialogOpen.value = false;
  columnToDelete.value = null;
  taskToDelete.value = null;
};
//--- Delete End
//--- Column Form Start
const isColumnFormOpen = ref(false);

const openColumnForm = () => { 
  isColumnFormOpen.value = true;
};

//--- Column Form End
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
      <router-link
        to="/deleted-tasks"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
      >
        View Deleted Tasks ({{ store.deletedTasks.length }})
      </router-link>
    </div>
    
    <draggable
      v-model="store.columns"
      group="columns"
      item-key="id"
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
            @end="handleDragEnd"
          >
            <template #item="{ element }">
              <TaskCard 
                :task="element" 
                @click="openEditTask(element)"
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

    <ColumnForm
      :is-open="isColumnFormOpen"
      @close="isColumnFormOpen = false"
      @add=" (title) => store.addColumn(title)"
    />

    <deleteForm 
      :isOpen="isDeleteDialogOpen" 
      :column-to-delete="columnToDelete"
      :task-to-delete="taskToDelete"
      @close="closeDeleteForm" 
      @delete="(typeOfDelete : string ) => deleteColumnOrTask(typeOfDelete)"
    />

  </div>
</template>