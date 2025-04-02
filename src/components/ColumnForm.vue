<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';


const newColumnTitle = ref('');

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
    'close': [];
    'add': [newColumnTitle: string];
}>();

const handleSubmit = () => {
    if (newColumnTitle.value) {
        emit('add', newColumnTitle.value.trim());
    }
    emit('close');
    newColumnTitle.value = '';
}

</script>

<template>
    <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <DialogTitle class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Add New Column
          </DialogTitle>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
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
                @click="emit('close')"
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
</template>