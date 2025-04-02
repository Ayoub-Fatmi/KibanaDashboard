<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { Column, Task } from '../stores/kanban';


const props = defineProps<{
    isOpen: boolean;
    columnToDelete ?: Column | null;
    taskToDelete?: {task: Task, columnId: string} | null;
}>();

const emit = defineEmits<{
    'close': [];
    'delete': [typeOfDelete : string];
}>();

</script>

<template>
    <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" ></div>
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-2xl bg-white p-6">
        <DialogTitle v-if="columnToDelete" class="text-lg font-medium text-gray-900">
          Delete Column
        </DialogTitle>
        <DialogTitle v-else-if="taskToDelete" class="text-lg font-medium text-gray-900">
          Delete Task
        </DialogTitle>
        <div class="mt-4">
          <p v-if="columnToDelete" class="text-sm text-gray-500">
            Are you sure you want to delete "{{ columnToDelete?.title }}"?
            This will also delete all {{ columnToDelete?.tasks.length }} tasks in this column.
          </p>
          <p v-else-if="taskToDelete" class="text-sm text-gray-500">
            Are you sure you want to delete "{{ taskToDelete?.task.title }}"?
          </p>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="columnToDelete ? emit('delete', 'column') : emit('delete', 'task')"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Delete
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>