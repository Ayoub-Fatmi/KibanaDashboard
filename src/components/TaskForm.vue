<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { useKanbanStore } from '../stores/kanban';
import type { Task } from '../stores/kanban';

const dateError = ref<string | null>(null);

const props = defineProps<{
  isOpen: boolean;
  task?: Task | null;
}>();

const emit = defineEmits<{
  'close': [];
  'update': [columnId: string, taskId: string, updates: Partial<Task>];
}>();

const store = useKanbanStore();

const taskForm = ref<Partial<Task>>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: new Date().toISOString().split('T')[0],
  assignee: ''
});

const resetForm = () => {
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    assignee: ''
  };
};

watch(() => props.task, (newTask) => {
  if (newTask) {
    taskForm.value = { ...newTask };
  } else {
    resetForm();
  }
}, { immediate: true });


const validateDate = (dateString : string) => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    dateError.value = "Date cannot be in the past";
    return false;
  }
  dateError.value = null;
  return true;
};

const handleSubmit = () => {
  if (!validateDate((taskForm.value.dueDate)?.toString() || '')) {
    return; 
  }
  
  if (props.task) {
    const currentColumn = store.columns.find(col => 
      col.tasks.some(t => t.id === props.task?.id)
    );
    if (currentColumn) {
      emit('update', currentColumn.id, props.task.id, taskForm.value);
    } else {
      emit('update', props.task.columnId || 'todo', props.task.id, taskForm.value);
    }
  } else {
    const task: Task = {
      id: crypto.randomUUID(),
      ...taskForm.value
    } as Task;
    store.addTask('todo', task);
  }
  
  emit('close');
  resetForm();
};
</script>

<template>
  <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true"> </div>
    
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
        <DialogTitle class="text-lg font-medium leading-6 text-gray-900 mb-4">
          {{ task ? 'Edit Task' : 'Create New Task' }}
        </DialogTitle>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              v-model="taskForm.title"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              v-model="taskForm.description"
              rows="3"
              class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Priority</label>
            <select
              v-model="taskForm.priority"
              class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              v-model="taskForm.dueDate"
              @change="validateDate(taskForm.dueDate || '')"
              :min="new Date().toISOString().split('T')[0]"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              :class="{ 'border-red-500': dateError }"
            />
            <p v-if="dateError" class="mt-1 text-sm text-red-600">{{ dateError }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Assignee</label>
            <input
              type="text"
              v-model="taskForm.assignee"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div class="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              @click="emit('close')"
              class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {{ task ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>