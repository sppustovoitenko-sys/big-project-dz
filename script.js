// State
let todos = [];
let currentFilter = 'all';
const STORAGE_KEY = 'todos_app_data';

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const clearBtn = document.getElementById('clearBtn');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    initTheme();
    render();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            render();
        });
    });

    themeToggle.addEventListener('click', toggleTheme);
    clearBtn.addEventListener('click', clearCompleted);
}

// Add Todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        todoInput.focus();
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date()
    };

    todos.unshift(todo);
    saveTodos();
    todoInput.value = '';
    todoInput.focus();
    render();
}

// Delete Todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    render();
}

// Toggle Completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        render();
    }
}

// Edit Todo
function editTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    const todo = todos.find(t => t.id === id);

    if (todoElement.classList.contains('edit-mode')) {
        return;
    }

    todoElement.classList.add('edit-mode');

    const textSpan = todoElement.querySelector('.todo-text');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = todo.text;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save';
    saveBtn.textContent = 'Сохранить';

    const actions = todoElement.querySelector('.todo-actions');
    const editBtn = actions.querySelector('.btn-edit');
    const deleteBtn = actions.querySelector('.btn-delete');

    editBtn.style.display = 'none';
    deleteBtn.style.display = 'none';
    actions.appendChild(input);
    actions.appendChild(saveBtn);

    input.focus();
    input.select();

    const saveTodoEdit = () => {
        const newText = input.value.trim();
        if (newText && newText !== todo.text) {
            todo.text = newText;
            saveTodos();
        }
        todoElement.classList.remove('edit-mode');
        render();
    };

    saveBtn.addEventListener('click', saveTodoEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveTodoEdit();
    });
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Escape') {
            todoElement.classList.remove('edit-mode');
            render();
        }
    });
}

// Clear Completed
function clearCompleted() {
    if (confirm('Вы уверены? Это удалит все завершённые задачи.')) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        render();
    }
}

// Filter Todos
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

// Update Stats
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    clearBtn.style.display = completed > 0 ? 'block' : 'none';
}

// Render
function render() {
    const filteredTodos = getFilteredTodos();
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filteredTodos.forEach(todo => {
            const todoElement = createTodoElement(todo);
            todoList.appendChild(todoElement);
        });
    }

    updateStats();
}

// Create Todo Element
function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = '✎';
    editBtn.addEventListener('click', () => editTodo(todo.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(checkbox);
    div.appendChild(text);
    div.appendChild(actions);

    return div;
}

// Local Storage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
    const saved = localStorage.getItem(STORAGE_KEY);
    todos = saved ? JSON.parse(saved) : [];
}

// Theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}