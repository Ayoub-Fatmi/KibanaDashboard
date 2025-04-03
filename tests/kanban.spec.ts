import { setActivePinia, createPinia } from 'pinia'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { useKanbanStore } from '../src/stores/kanban'
import type { Task, Column } from '../src/stores/kanban'

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {}
  
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    clear() {
      store = {}
    },
    removeItem(key: string) {
      delete store[key]
    }
  }
})()

// Set the mock before importing the store
vi.stubGlobal('localStorage', localStorageMock)

describe('Kanban Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with default columns', () => {
    const store = useKanbanStore()
    expect(store.columns).toHaveLength(3)
    expect(store.columns[0].title).toBe('To Do')
    expect(store.columns[1].title).toBe('In Progress')
    expect(store.columns[2].title).toBe('Done')
  })

  it('loads from localStorage', () => {
    const testData = {
      columns: [
        { id: 'test1', title: 'Test Column', tasks: [] }
      ],
      deletedTasks: []
    }
    localStorage.setItem('kanban-data', JSON.stringify(testData))
    
    const store = useKanbanStore()
    expect(store.columns).toHaveLength(1)
    expect(store.columns[0].title).toBe('Test Column')
  })

  it('adds a task to a column', () => {
    const store = useKanbanStore()
    const newTask: Partial<Task> = {
      id: 'task1',
      title: 'New Task',
      description: 'Description',
      priority: 'medium',
      dueDate: '2023-12-31',
      assignee: 'John'
    }
    
    store.addTask('todo', newTask as Task)
    expect(store.columns[0].tasks).toHaveLength(1)
    expect(store.columns[0].tasks[0].title).toBe('New Task')
    expect(store.columns[0].tasks[0].columnId).toBe('todo')
  })

  it('moves task between columns', () => {
    const store = useKanbanStore()
    const task: Partial<Task> = {
      id: 'task1',
      title: 'Test Task',
      priority: 'medium'
    }
    
    store.addTask('todo', task as Task)
    expect(store.columns[0].tasks).toHaveLength(1)
    
    store.moveTask('todo', 'in-progress', 'task1')
    expect(store.columns[0].tasks).toHaveLength(0)
    expect(store.columns[1].tasks).toHaveLength(1)
    expect(store.columns[1].tasks[0].id).toBe('task1')
    expect(store.columns[1].tasks[0].columnId).toBe('in-progress')
  })

  it('updates a task', () => {
    const store = useKanbanStore()
    const task: Partial<Task> = {
      id: 'task1',
      title: 'Original Title',
      priority: 'medium'
    }
    
    store.addTask('todo', task as Task)
    store.updateTask('todo', 'task1', { title: 'Updated Title' })
    
    expect(store.columns[0].tasks[0].title).toBe('Updated Title')
  })

  it('deletes a task and adds to deleted tasks', () => {
    const store = useKanbanStore()
    const task: Partial<Task> = {
      id: 'task1',
      title: 'To Delete',
      priority: 'medium'
    }
    
    store.addTask('todo', task as Task)
    store.deleteTask('todo', 'task1')
    
    expect(store.columns[0].tasks).toHaveLength(0)
    expect(store.deletedTasks).toHaveLength(1)
    expect(store.deletedTasks[0].title).toBe('To Delete')
    expect(store.deletedTasks[0].deletedAt).toBeDefined()
  })

//   it('restores a deleted task', () => {
//     const store = useKanbanStore()
//     const task: Partial<Task> = {
//       id: 'task1',
//       title: 'To Restore',
//       priority: 'medium',
//       columnId: 'todo'
//     }
    
//     store.deletedTasks = [{ ...task, deletedAt: new Date().toISOString() } as Task]
//     store.restoreTask('task1')
    
//     expect(store.deletedTasks).toHaveLength(0)
//     expect(store.columns[0].tasks).toHaveLength(1)
//     expect(store.columns[0].tasks[0].title).toBe('To Restore')
//   })

  it('adds a new column', () => {
    const store = useKanbanStore()
    store.addColumn('New Column')
    
    expect(store.columns).toHaveLength(4)
    expect(store.columns[3].title).toBe('New Column')
    expect(store.columns[3].tasks).toEqual([])
  })

  it('moves columns', () => {
    const store = useKanbanStore()
    const originalOrder = [...store.columns]
    store.moveColumn(0, 1)
    
    expect(store.columns[0].id).toBe(originalOrder[1].id)
    expect(store.columns[1].id).toBe(originalOrder[0].id)
  })

  it('persists changes to localStorage', async () => {
    const store = useKanbanStore()
    const task: Partial<Task> = {
      id: 'task1',
      title: 'Test',
      priority: 'medium'
    }
    
    store.addTask('todo', task as Task)
    store.addColumn('New Column')
    
    // Wait for watcher to update localStorage
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const savedData = JSON.parse(localStorage.getItem('kanban-data') || '{}')
    expect(savedData.columns).toHaveLength(4)
    expect(savedData.columns[0].tasks).toHaveLength(1)
  })
})