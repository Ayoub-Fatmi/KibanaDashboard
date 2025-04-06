# Vue Kanban Board

A responsive Kanban board built with Vue 3, Pinia, and TypeScript featuring drag-and-drop functionality, task management, and dark/light mode.

![Kanban Dashboard](./src/assets/KanbanDashboard.png)
*Dark Mode Interface*

## Features

### Board Management
- 📌 **Column Operations**
  - Add new columns
  - Drag-and-drop to reorder columns
  - Delete columns (with confirmation)
  
  ![Add Column](./src/assets/AddColumn.png) | ![Column Drag](./src/assets/columnDrag.png)
  --- | ---

### Task Management
- ✅ **Task Operations**
  - Create tasks with details (title, description, priority, due date, assignee)
  - Drag-and-drop between columns
  - Edit existing tasks
  - Delete tasks (moved to recycle bin)
  
  ![Add Task](./src/assets/AddTask.png) | ![Task Drag](./src/assets/TaskDrag.png)
  --- | ---

### Advanced Features
- 🗑️ **Recycle Bin**
  - View deleted tasks (up to 50 most recent)
  - Restore tasks to original columns
  - Permanent deletion
  - Search and filter functionality
  
  ![Deleted Tasks](./src/assets/DeletedTasks.png)

- 🌓 **Theme Toggle**
  - Switch between light and dark modes
  
  ![Light Mode](./src/assets/KanbanDashboard_Light.png)

## Technical Stack

- **Frontend**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Type System**: TypeScript
- **Drag-and-Drop**: vue-draggable
- **Styling**: Tailwind CSS
- **Persistence**: localStorage