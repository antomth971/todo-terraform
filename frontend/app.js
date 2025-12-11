// ============================================================
// Configuration de l'API
// ============================================================

// Tu trouveras l'URL dans les outputs de Terraform : terraform output api_endpoint
const API_BASE_URL = 'https://6dd9jboun6.execute-api.eu-west-1.amazonaws.com/dev';

// ============================================================
// État de l'application
// ============================================================

let todos = [];

// ============================================================
// Éléments DOM
// ============================================================

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const emptyState = document.getElementById('emptyState');

// Statistiques
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// ============================================================
// Fonctions API
// ============================================================

// Récupérer tous les todos
async function fetchTodos() {
    try {
        showLoading();
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/todos`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        todos = data.todos || [];
        
        // Trier par date de création (plus récent en premier)
        todos.sort((a, b) => b.createdAt - a.createdAt);
        
        renderTodos();
        updateStats();
        hideLoading();
        
    } catch (err) {
        console.error('Error fetching todos:', err);
        showError(`Impossible de charger les todos: ${err.message}`);
        hideLoading();
    }
}

// Créer un nouveau todo
async function createTodo(title) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ajouter le nouveau todo en haut de la liste
        todos.unshift(data.todo);
        
        renderTodos();
        updateStats();
        
        // Réinitialiser l'input
        todoInput.value = '';
        todoInput.focus();
        
    } catch (err) {
        console.error('Error creating todo:', err);
        showError(`Impossible de créer le todo: ${err.message}`);
    }
}

// Mettre à jour un todo
async function updateTodo(id, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Mettre à jour dans le state local
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = data.todo;
        }
        
        renderTodos();
        updateStats();
        
    } catch (err) {
        console.error('Error updating todo:', err);
        showError(`Impossible de mettre à jour le todo: ${err.message}`);
    }
}

// Supprimer un todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Retirer du state local
        todos = todos.filter(t => t.id !== id);
        
        renderTodos();
        updateStats();
        
    } catch (err) {
        console.error('Error deleting todo:', err);
        showError(`Impossible de supprimer le todo: ${err.message}`);
    }
}

// ============================================================
// Fonctions de rendu
// ============================================================

function renderTodos() {
    // Vider la liste
    todoList.innerHTML = '';
    
    // Afficher l'état vide si nécessaire
    if (todos.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Créer les éléments pour chaque todo
    todos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.dataset.id = todo.id;
    
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => {
        updateTodo(todo.id, { completed: checkbox.checked });
    });
    
    // Contenu
    const content = document.createElement('div');
    content.className = 'todo-content';
    
    const title = document.createElement('div');
    title.className = 'todo-title';
    title.textContent = todo.title;
    
    const date = document.createElement('div');
    date.className = 'todo-date';
    date.textContent = formatDate(todo.createdAt);
    
    content.appendChild(title);
    content.appendChild(date);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'todo-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce todo ?')) {
            deleteTodo(todo.id);
        }
    });
    
    actions.appendChild(deleteBtn);
    
    // Assembler
    div.appendChild(checkbox);
    div.appendChild(content);
    div.appendChild(actions);
    
    return div;
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// ============================================================
// Fonctions utilitaires
// ============================================================

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Moins d'une minute
    if (diff < 60000) {
        return 'À l\'instant';
    }
    
    // Moins d'une heure
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    // Moins d'un jour
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    
    // Format complet
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading() {
    loading.style.display = 'block';
    todoList.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
    todoList.style.display = 'flex';
}

function showError(message) {
    errorMessage.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    error.style.display = 'none';
}

// ============================================================
// Event Listeners
// ============================================================

// Ajouter un todo avec le bouton
addBtn.addEventListener('click', () => {
    const title = todoInput.value.trim();
    
    if (!title) {
        alert('Veuillez entrer un titre pour le todo');
        return;
    }
    
    createTodo(title);
});

// Ajouter un todo avec la touche Entrée
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

// ============================================================
// Initialisation
// ============================================================

// Charger les todos au démarrage
fetchTodos();