const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const clearBtn = document.getElementById("clearBtn");
const statusMessage = document.getElementById("statusMessage");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("todoTasks"));
    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean" &&
            typeof task.id === "string"
        );
    }
} catch (error) {
    tasks = [];
}

function saveTasks() {
    try {
        localStorage.setItem("todoTasks", JSON.stringify(tasks));
    } catch (error) {
        statusMessage.textContent = "Unable to save tasks in this browser.";
    }
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    document.getElementById("totalTasks").textContent = `Total: ${total}`;
    document.getElementById("pendingTasks").textContent = `Pending: ${pending}`;
    document.getElementById("completedTasks").textContent = `Completed: ${completed}`;
}

function renderTasks() {
    taskList.replaceChildren();
    emptyMessage.style.display = tasks.length === 0 ? "block" : "none";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task";
        if (task.completed) li.classList.add("completed");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark ${task.text} as completed`);
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
            statusMessage.textContent = task.completed ? "Task completed." : "Task marked as pending.";
        });

        const span = document.createElement("span");
        span.textContent = task.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.setAttribute("aria-label", `Delete task: ${task.text}`);
        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
            statusMessage.textContent = "Task deleted.";
        });

        li.append(checkbox, span, deleteBtn);
        taskList.appendChild(li);
    });

    updateStats();
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();
    const text = taskInput.value.trim();

    if (!text) {
        statusMessage.textContent = "Please enter a task.";
        taskInput.focus();
        return;
    }

    tasks.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        completed: false
    });

    saveTasks();
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
    statusMessage.textContent = "Task added.";
});

clearBtn.addEventListener("click", () => {
    if (tasks.length === 0) return;

    if (confirm("Are you sure you want to delete all tasks?")) {
        tasks = [];
        saveTasks();
        renderTasks();
        statusMessage.textContent = "All tasks cleared.";
    }
});

renderTasks();
