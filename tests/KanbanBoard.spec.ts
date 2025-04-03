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

});