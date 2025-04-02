import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
  columnId?: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const loadFromLocalStorage = () => {
  const savedData = localStorage.getItem('kanban-data');
  return savedData ? JSON.parse(savedData) : null;
};

export const useKanbanStore = defineStore('kanban', () => {
  const defaultColumns = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      tasks: []
    }
  ];

  const columns = ref<Column[]>(loadFromLocalStorage()?.columns || defaultColumns);

  watch( columns, (newColumns) => {
      localStorage.setItem('kanban-data', JSON.stringify({
        columns: newColumns
      }));
    },
    { deep: true }
  );

  const addTask = (columnId: string, task: Task) => {
    const column = columns.value.find(col => col.id === columnId);
    if (column) {
      task.columnId = columnId;
      column.tasks.push(task);
    }else{
      task.columnId = columns.value[0].id;
      columns.value[0].tasks.push(task);
    }
  };

  const deleteTask = (columnId: string, taskId: string) => {
    const column = columns.value.find(col => col.id === columnId);
    if (column) {
      const taskIndex = column.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        column.tasks.splice(taskIndex, 1);
      }
    }
  };

  const moveTask = (fromColumnId: string, toColumnId: string, taskId: string) => {
    const fromColumn = columns.value.find(col => col.id === fromColumnId);
    const toColumn = columns.value.find(col => col.id === toColumnId);
    
    if (fromColumn && toColumn) {
      const taskIndex = fromColumn.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        const [task] = fromColumn.tasks.splice(taskIndex, 1);
        task.columnId = toColumnId;
        toColumn.tasks.push(task);
      }
    }
  };

  const updateTask = (columnId: string, taskId: string, updates: Partial<Task>) => {
    const column = columns.value.find(col => col.id === columnId);
    if (column) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        Object.assign(task, updates);
      }
    }
  };

  const addColumn = (title: string) => { //
    const newColumn: Column = {
      id: crypto.randomUUID(),
      title: title,
      tasks: []
    };
    columns.value.push(newColumn);
  };

  const moveColumn = (fromIndex: number, toIndex: number) => { //
    const columnToMove = columns.value.splice(fromIndex, 1)[0];
    columns.value.splice(toIndex, 0, columnToMove);
  };

  const deleteColumn = (columnId: string) => { //
    const index = columns.value.findIndex(col => col.id === columnId);
    if (index !== -1) {
      columns.value.splice(index, 1);
    }
  };

  return {
    columns,
    addTask,
    deleteTask,
    moveTask,
    updateTask,
    addColumn,
    moveColumn,
    deleteColumn
  };
});