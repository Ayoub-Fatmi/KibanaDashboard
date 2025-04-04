import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { Column, Task } from "../src/stores/kanban";

describe("KanbanBoard.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the kanban board with all components", async () => {
    let KanbanBoard, TaskCard, TaskForm, ColumnForm, DeleteForm, useKanbanStore;

    try {
      KanbanBoard = (await import("../src/components/KanbanBoard.vue")).default;
      useKanbanStore = (await import("../src/stores/kanban")).useKanbanStore;
      TaskCard = (await import("../src/components/TaskCard.vue")).default;
      TaskForm = (await import("../src/components/TaskForm.vue")).default;
      ColumnForm = (await import("../src/components/ColumnForm.vue")).default;
      DeleteForm = (await import("../src/components/DeleteForm.vue")).default;
    } catch (e) {
      expect.fail(
        "Required components or store not found. Make sure to create all required files."
      );
    }

    const mockColumns: Column[] = [
      {
        id: "1",
        title: "To Do",
        tasks: [
          { id: "1", title: "Task 1", description: "Description 1", priority: "high", dueDate: "2025-08-01", assignee: "John Doe" },
          { id: "2", title: "Task 2", description: "Description 2", priority: "medium", dueDate: "2025-08-02", assignee: "Jane Doe" }
        ]
      },
      {
        id: "2",
        title: "In Progress",
        tasks: [
          { id: "3", title: "Task 3", description: "Description 3", priority: "low", dueDate: "2025-08-03", assignee: "John Doe" },
        ]
      },
      {
        id: "3",
        title: "Done",
        tasks: []
      }
    ];

    const wrapper = mount(KanbanBoard, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              kanban: {
                columns: mockColumns,
                deletedTasks: []
              }
            },
            stubActions: false
          })
        ],
        stubs: {
          TaskForm: true,
          ColumnForm: true,
          DeleteForm: true,
          draggable: false,
          TaskCard: false,
          RouterLink: {
            template: '<a><slot/></a>'
          }
        }
      }
    });

    expect(wrapper.text()).toContain("Add New Task");
    expect(wrapper.text()).toContain("Add New Column");
    expect(wrapper.text()).toContain("View Deleted Tasks (0)");
  
    expect(wrapper.text()).toContain("To Do");
    expect(wrapper.text()).toContain("In Progress");
  
    const taskCards = wrapper.findAllComponents({ name: "TaskCard" });
    expect(taskCards.length).toBe(3);
  
    expect(wrapper.text()).toContain("Drop tasks here");
  });
  it("opens task form when Add New Task button is clicked", async () => {
    let KanbanBoard, TaskForm, useKanbanStore;

    try {
      KanbanBoard = (await import("../src/components/KanbanBoard.vue")).default;
      useKanbanStore = (await import("../src/stores/kanban")).useKanbanStore;
      TaskForm = (await import("../src/components/TaskForm.vue")).default;
    } catch (e) {
      expect.fail(
        "Required components or store not found. Make sure to create all required files."
      );
    }

    const wrapper = mount(KanbanBoard, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          TaskForm: {
            template: '<div v-if="isOpen" class="task-form-stub">Task Form Stub</div>',
            props: ['isOpen', 'task']
          },
          ColumnForm: true,
          DeleteForm: true,
          draggable: true,
          RouterLink: {
            template: '<a><slot/></a>'
          }
        }
      }
    });

    expect(wrapper.find('.task-form-stub').exists()).toBe(false);

    const addTaskButtons = wrapper.findAll('button');
    const addTaskButton = addTaskButtons.find(btn => btn.text().includes('Add New Task'));
    
    if (!addTaskButton) {
      throw new Error('Add New Task button not found');
    }

    await addTaskButton.trigger('click');
    await wrapper.vm.$nextTick(); // Wait for the component to update

    const taskForm = wrapper.find('.task-form-stub');
    expect(taskForm.exists()).toBe(true);
  });

  it("opens column form when Add New Column button is clicked", async () => {
    let KanbanBoard, useKanbanStore;

    try {
      KanbanBoard = (await import("../src/components/KanbanBoard.vue")).default;
      useKanbanStore = (await import("../src/stores/kanban")).useKanbanStore;
    } catch (e) {
      expect.fail("Required components or store not found");
    }

    const wrapper = mount(KanbanBoard, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          TaskForm: true,
          ColumnForm: {
            template: '<div v-if="isOpen" data-test="column-form-stub">Column Form</div>',
            props: ['isOpen']
          },
          DeleteForm: true,
          draggable: true,
          RouterLink: {
            template: '<a><slot/></a>'
          }
        }
      }
    });

    expect(wrapper.find('[data-test="column-form-stub"]').exists()).toBe(false);

    const buttons = wrapper.findAll('button');
    const addColumnButton = buttons.find(btn => 
      btn.text().trim() === 'Add New Column'
    );
    
    if (!addColumnButton) {
      throw new Error('Add New Column button not found');
    }

    await addColumnButton.trigger('click');
    await wrapper.vm.$nextTick(); // Wait for DOM updates

    const columnForm = wrapper.find('[data-test="column-form-stub"]');
    expect(columnForm.exists()).toBe(true);
  });

  it("calls store methods when forms are submitted", async () => {
    let KanbanBoard, useKanbanStore;

    try {
      KanbanBoard = (await import("../src/components/KanbanBoard.vue")).default;
      useKanbanStore = (await import("../src/stores/kanban")).useKanbanStore;
    } catch (e) {
      expect.fail("Required components or store not found");
    }

    const mockTask = { id: "task-1", title: "Test Task" };
    const mockColumn = { id: "col-1", title: "Test Column" };

    const wrapper = mount(KanbanBoard, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              kanban: {
                taskToDelete: { task: mockTask, columnId: "col-1" },
                columnToDelete: mockColumn,
                columns: [mockColumn]  // Add columns to match your component's expectations
              }
            }
          })
        ],
        stubs: {
          TaskForm: {
            template: '<div v-if="isOpen"></div>',
            props: ['isOpen']
          },
          ColumnForm: {
            template: '<div v-if="isOpen"></div>',
            props: ['isOpen']
          },
          DeleteForm: {
            template: '<div v-if="isOpen" data-test="delete-form"></div>',
            props: ['isOpen', 'taskToDelete', 'columnToDelete']
          },
          draggable: true,
          RouterLink: true
        }
      }
    });

    const store = useKanbanStore();

    console.log(wrapper.html());
    // Test TaskForm submission
    const taskForm = wrapper.findComponent({ name: "TaskForm" });
    console.log(taskForm);
    await taskForm.vm  // Make sure this exists before interacting
    await taskForm.vm.$emit("update", "1", "1", { title: "Updated Task" });
    expect(store.updateTask).toHaveBeenCalledWith("1", "1", { title: "Updated Task" });

    // Test ColumnForm submission
    const columnForm = wrapper.findComponent({ name: "ColumnForm" });
    await columnForm.vm.$emit("add", "New Column");
    expect(store.addColumn).toHaveBeenCalledWith("New Column");

    // Test DeleteForm - first make sure it exists
    const deleteForm = wrapper.findComponent({ name: "DeleteForm" });
    expect(deleteForm.exists()).toBe(true);

    // Test task deletion
    await deleteForm.vm.$emit("delete", "task");
    expect(store.deleteTask).toHaveBeenCalledWith("col-1", "task-1");

    // Test column deletion
    await deleteForm.vm  // Ensure VM exists
    await deleteForm.vm.$emit("delete", "column");
    expect(store.deleteColumn).toHaveBeenCalledWith("col-1");
  });

  it("handles drag and drop events correctly", async () => {
    let KanbanBoard, useKanbanStore;

    try {
      KanbanBoard = (await import("../src/components/KanbanBoard.vue")).default;
      useKanbanStore = (await import("../src/stores/kanban")).useKanbanStore;
    } catch (e) {
      expect.fail(
        "Required components or store not found. Make sure to create all required files."
      );
    }

    const wrapper = mount(KanbanBoard, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          TaskForm: true,
          ColumnForm: true,
          DeleteForm: true,
          draggable: true,
          RouterLink: true
        }
      }
    });

    const store = useKanbanStore();

    // Simulate a drag and drop event
    const draggableComponent = wrapper.findComponent({ name: "draggable" });
    await draggableComponent.vm.$emit("change", {
      added: {
        element: { id: "1", title: "Task 1", description: "Description 1" }
      }
    }, "2"); // columnId "2"

    expect(store.moveTask).toHaveBeenCalledWith("2", "1");
  });

  it("displays correct count of deleted tasks", async () => {
    let KanbanBoard, useKanbanStore;

    try {
      KanbanBoard = (await import("../src/components/KanbanBoard.vue")).default;
      useKanbanStore = (await import("../src/stores/kanban")).useKanbanStore;
    } catch (e) {
      expect.fail(
        "Required components or store not found. Make sure to create all required files."
      );
    }

    // Create a test pinia store with deleted tasks
    const wrapper = mount(KanbanBoard, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              kanban: {
                columns: [],
                deletedTasks: [
                  { id: "1", title: "Deleted Task 1" },
                  { id: "2", title: "Deleted Task 2" }
                ]
              }
            }
          })
        ],
        stubs: {
          TaskForm: true,
          ColumnForm: true,
          DeleteForm: true,
          draggable: true,
          RouterLink: true
        }
      }
    });

    // Check if the deleted tasks count is displayed correctly
    expect(wrapper.text()).toContain("View Deleted Tasks (2)");
  });
});