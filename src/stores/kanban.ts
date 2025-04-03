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

export interface DeletedTask extends Task {
  deletedAt: string;
}


const loadFromLocalStorage = () => {
  const savedData = localStorage.getItem('kanban-data');
  return savedData ? JSON.parse(savedData) : null;
};


const loadDeletedFromLocalStorage = () => {
  const deletedData = localStorage.getItem('kanban-Deleted-data');
  return deletedData ? JSON.parse(deletedData) : null;
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

  const deletedTasks = ref<DeletedTask[]>(loadDeletedFromLocalStorage()?.deletedTasks || []);

  watch( deletedTasks, (newDeletedTasks) => {
      localStorage.setItem('kanban-Deleted-data', JSON.stringify({
        deletedTasks: newDeletedTasks
      }));
    },
    { deep: true }
  );

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
        const [deletedTask] = column.tasks.splice(taskIndex, 1);
        deletedTasks.value.unshift({
          ...deletedTask,
          deletedAt: new Date().toISOString()
        });
      }
    }
  };

  const restoreTask = (taskId: string) => {
    debugger;
    const taskIndex = deletedTasks.value.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const [task] = deletedTasks.value.splice(taskIndex, 1);

      const columnId = task.columnId;
      const column = columns.value.findIndex(col => col.id === columnId) !== -1 ? columns.value.find(col => col.id === columnId) : columns.value.find(col => col.id === "todo");
      console.log("column", column, "// columnId", columnId);
      if (column) {
        column.tasks.push(task);

      }
      debugger;
    }
    debugger;
  };

  const permanentlyDeleteTask = (taskId: string) => {
    const taskIndex = deletedTasks.value.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      deletedTasks.value.splice(taskIndex, 1);
    }
  };

  const moveTask = (toColumnId: string, taskId: string) => {
    console.log("toColumnId", toColumnId, "// taskId", taskId);
    const toColumn = columns.value.find(col => col.id === toColumnId);
    if (toColumn) {
      const taskIndex = toColumn.tasks.findIndex(task => task.id === taskId);      
      if (taskIndex !== -1) {
        const [task] = toColumn.tasks.splice(taskIndex, 1);
        task.columnId = toColumnId; 
        console.log("1",toColumn.tasks);
        toColumn.tasks.push(task);
        console.log("1",toColumn.tasks);
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


  const deleteColumn = (columnId: string) => { //
    const index = columns.value.findIndex(col => col.id === columnId);
    const column = columns.value.find(col => col.id === columnId);
    column?.tasks.forEach(task => {
      deleteTask(columnId, task.id);
    })
    if (index !== -1) {
      columns.value.splice(index, 1);
    }
  };

  return {
    columns,
    deletedTasks,
    addTask,
    deleteTask,
    moveTask,
    updateTask,
    addColumn,
    deleteColumn,
    restoreTask,
    permanentlyDeleteTask
  };
});