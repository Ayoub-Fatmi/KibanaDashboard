import { createRouter, createWebHistory } from 'vue-router';
import KanbanBoard from '../components/KanbanBoard.vue';
import DeletedTasks from '../components/DeletedTasks.vue';

const routes = [
  {
    path: '/',
    name: 'board',
    component: KanbanBoard
  },
  {
    path: '/deleted-tasks',
    name: 'deleted-tasks',
    component: DeletedTasks,
    meta: { title: 'Deleted Tasks' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;