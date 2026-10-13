// State Management
let tasks = JSON.parse(localStorage.getItem('command_center_tasks')) || [];

// DOM References
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  
  taskForm.addEventListener('submit', handleAddTask);
  searchInput.addEventListener('input', renderTasks);
  categoryFilter.addEventListener('change', renderTasks);
});

// Persistence
function saveTasks() {
  localStorage.setItem('command_center_tasks', JSON.stringify(tasks));
}

// Add Task
function handleAddTask(e) {
  e.preventDefault();

  const newTask = {
    id: Date.now().toString(),
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    category: taskCategory.value,
    priority: taskPriority.value,
    status: 'todo'
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskForm.reset();
}

// Move Task Status
function updateTaskStatus(id, newStatus) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, status: newStatus } : task
  );
  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Render Core
function renderTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const lists = {
    'todo': document.getElementById('list-todo'),
    'in-progress': document.getElementById('list-in-progress'),
    'completed': document.getElementById('list-completed')
  };

  // Clear lists
  Object.values(lists).forEach(list => list.innerHTML = '');

  const counts = { 'todo': 0, 'in-progress': 0, 'completed': 0 };

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const searchableText = `${task.title} ${task.description || ''}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  filteredTasks.forEach(task => {
    counts[task.status]++;
    const cardElement = createTaskCard(task);
    if (lists[task.status]) {
      lists[task.status].appendChild(cardElement);
    }
  });

  // Update Counters
  document.getElementById('count-todo').textContent = counts['todo'];
  document.getElementById('count-in-progress').textContent = counts['in-progress'];
  document.getElementById('count-completed').textContent = counts['completed'];

  // Top Bar Metrics
  const activeTotal = counts['todo'] + counts['in-progress'];
  document.getElementById('metric-active').textContent = activeTotal;
  document.getElementById('metric-completed').textContent = counts['completed'];
}

// Card DOM Generator
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';

  card.innerHTML = `
    <div class="card-top">
      <span class="task-title">${escapeHtml(task.title)}</span>
      <span class="priority-pill priority-${task.priority.toLowerCase()}">${task.priority}</span>
    </div>
    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
    <div class="card-meta">
      📂 ${task.category}
    </div>
    <div class="card-footer">
      <select onchange="updateTaskStatus('${task.id}', this.value)">
        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
      </select>
      <button class="btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
    </div>
  `;

  return card;
}

// HTML Injection Guard
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}