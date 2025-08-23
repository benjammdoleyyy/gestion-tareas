class TaskManager {
    constructor() {
        this.apiBaseUrl = '/api/tareas';
        this.tasks = [];
        this.filteredTasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.cubaTimeZone = 'America/Havana';
        
        this.initializeElements();
        this.bindEvents();
        this.updateDateTime();
        this.loadTasks();
        
        // Update time every second
        setInterval(() => this.updateDateTime(), 1000);
    }

    initializeElements() {
        // Form elements
        this.taskForm = document.getElementById('taskForm');
        this.tituloInput = document.getElementById('titulo');
        this.descripcionInput = document.getElementById('descripcion');
        this.submitBtn = document.getElementById('submitBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.formTitle = document.getElementById('formTitle');
        this.submitText = document.getElementById('submitText');
        this.tituloCounter = document.getElementById('tituloCounter');
        
        // Filter elements
        this.searchInput = document.getElementById('searchInput');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.refreshBtn = document.getElementById('refreshBtn');
        
        // Display elements
        this.currentDate = document.getElementById('currentDate');
        this.currentTime = document.getElementById('currentTime');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.tasksList = document.getElementById('tasksList');
        this.tasksGrid = document.getElementById('tasksGrid');
        this.loading = document.getElementById('loading');
        this.emptyState = document.getElementById('emptyState');
        
        // Modal elements
        this.confirmModal = document.getElementById('confirmModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalConfirm = document.getElementById('modalConfirm');
        this.modalCancel = document.getElementById('modalCancel');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
    }

    bindEvents() {
        // Form events
        this.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.resetForm());
        this.tituloInput.addEventListener('input', () => this.updateCharacterCounter());
        
        // Filter events
        this.searchInput.addEventListener('input', () => this.filterTasks());
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        this.refreshBtn.addEventListener('click', () => this.loadTasks());
        
        // Modal events
        this.modalCancel.addEventListener('click', () => this.hideModal());
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) this.hideModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.resetForm();
            }
        });
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            timeZone: this.cubaTimeZone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        
        const timeOptions = {
            timeZone: this.cubaTimeZone,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        
        this.currentDate.textContent = now.toLocaleDateString('es-ES', options);
        this.currentTime.textContent = now.toLocaleTimeString('es-ES', timeOptions);
    }

    updateCharacterCounter() {
        const length = this.tituloInput.value.length;
        this.tituloCounter.textContent = `${length}/100`;
        
        if (length > 90) {
            this.tituloCounter.style.color = 'var(--danger-color)';
        } else if (length > 80) {
            this.tituloCounter.style.color = 'var(--warning-color)';
        } else {
            this.tituloCounter.style.color = 'var(--text-muted)';
        }
    }

    formatCubaDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            timeZone: this.cubaTimeZone,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async loadTasks() {
        try {
            this.showLoading();
            
            const response = await fetch(this.apiBaseUrl);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            this.tasks = await response.json();
            this.filterTasks();
            this.updateStats();
            
            this.showToast('Tareas cargadas correctamente', 'success');
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showToast('Error al cargar las tareas', 'error', error.message);
            this.hideLoading();
        }
    }

    async createTask(taskData) {
        try {
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const newTask = await response.json();
            this.tasks.unshift(newTask);
            this.filterTasks();
            this.updateStats();
            this.resetForm();
            
            this.showToast('Tarea creada exitosamente', 'success');
            
            return newTask;
        } catch (error) {
            console.error('Error creating task:', error);
            this.showToast('Error al crear la tarea', 'error', error.message);
            throw error;
        }
    }

    async updateTask(id, taskData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const updatedTask = await response.json();
            const index = this.tasks.findIndex(task => task.id === id);
            if (index !== -1) {
                this.tasks[index] = updatedTask;
                this.filterTasks();
                this.updateStats();
            }
            
            this.resetForm();
            this.showToast('Tarea actualizada exitosamente', 'success');
            
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            this.showToast('Error al actualizar la tarea', 'error', error.message);
            throw error;
        }
    }

    async toggleTaskComplete(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}`, {
                method: 'PATCH',
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const updatedTask = await response.json();
            const index = this.tasks.findIndex(task => task.id === id);
            if (index !== -1) {
                this.tasks[index] = updatedTask;
                this.filterTasks();
                this.updateStats();
            }
            
            this.showToast('Estado de tarea actualizado', 'success');
            
            return updatedTask;
        } catch (error) {
            console.error('Error toggling task completion:', error);
            this.showToast('Error al cambiar estado de la tarea', 'error', error.message);
            throw error;
        }
    }

    async deleteTask(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.filterTasks();
            this.updateStats();
            
            this.showToast('Tarea eliminada exitosamente', 'success');
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showToast('Error al eliminar la tarea', 'error', error.message);
            throw error;
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.taskForm);
        const taskData = {
            titulo: formData.get('titulo').trim(),
            descripcion: formData.get('descripcion').trim() || null,
        };
        
        if (!taskData.titulo) {
            this.showToast('El título es requerido', 'warning');
            this.tituloInput.focus();
            return;
        }
        
        this.submitBtn.disabled = true;
        
        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskData)
                .finally(() => {
                    this.submitBtn.disabled = false;
                });
        } else {
            this.createTask(taskData)
                .finally(() => {
                    this.submitBtn.disabled = false;
                });
        }
    }

    editTask(task) {
        this.editingTaskId = task.id;
        this.tituloInput.value = task.titulo;
        this.descripcionInput.value = task.descripcion || '';
        
        this.formTitle.textContent = 'Editar Tarea';
        this.submitText.textContent = 'Actualizar Tarea';
        this.submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Actualizar Tarea</span>';
        this.cancelBtn.style.display = 'flex';
        
        this.updateCharacterCounter();
        this.tituloInput.focus();
        this.tituloInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    resetForm() {
        this.editingTaskId = null;
        this.taskForm.reset();
        
        this.formTitle.textContent = 'Nueva Tarea';
        this.submitText.textContent = 'Crear Tarea';
        this.submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Crear Tarea</span>';
        this.cancelBtn.style.display = 'none';
        this.submitBtn.disabled = false;
        
        this.updateCharacterCounter();
    }

    confirmAction(title, message, onConfirm) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        
        // Remove previous event listeners
        const newConfirmBtn = this.modalConfirm.cloneNode(true);
        this.modalConfirm.parentNode.replaceChild(newConfirmBtn, this.modalConfirm);
        this.modalConfirm = newConfirmBtn;
        
        this.modalConfirm.addEventListener('click', () => {
            this.hideModal();
            onConfirm();
        });
        
        this.showModal();
    }

    showModal() {
        this.confirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.confirmModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.filterTasks();
    }

    filterTasks() {
        let filtered = [...this.tasks];
        
        // Apply status filter
        if (this.currentFilter === 'pending') {
            filtered = filtered.filter(task => !task.completada);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(task => task.completada);
        }
        
        // Apply search filter
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(task => 
                task.titulo.toLowerCase().includes(searchTerm) ||
                (task.descripcion && task.descripcion.toLowerCase().includes(searchTerm))
            );
        }
        
        this.filteredTasks = filtered;
        this.renderTasks();
    }

    renderTasks() {
        this.hideLoading();
        
        if (this.filteredTasks.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        this.tasksGrid.innerHTML = this.filteredTasks.map(task => this.createTaskCard(task)).join('');
        
        // Add fade-in animation
        this.tasksGrid.querySelectorAll('.task-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 50}ms`;
            card.classList.add('fade-in');
        });
    }

    createTaskCard(task) {
        const isCompleted = task.completada;
        const statusClass = isCompleted ? 'completed' : 'pending';
        const statusIcon = isCompleted ? 'fas fa-check-circle' : 'fas fa-clock';
        const statusText = isCompleted ? 'Completada' : 'Pendiente';
        
        return `
            <div class="task-card ${statusClass}">
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.titulo)}</h3>
                    <div class="task-status ${statusClass}">
                        <i class="${statusIcon}"></i>
                        ${statusText}
                    </div>
                </div>
                
                ${task.descripcion ? `
                    <div class="task-description">
                        ${this.escapeHtml(task.descripcion)}
                    </div>
                ` : ''}
                
                <div class="task-meta">
                    <div class="task-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${this.formatCubaDate(task.fechaCreacion)}
                    </div>
                    <div class="task-id">ID: ${task.id}</div>
                </div>
                
                <div class="task-actions">
                    ${!isCompleted ? `
                        <button class="btn btn-success" onclick="taskManager.confirmAction(
                            'Marcar como completada',
                            '¿Estás seguro de que quieres marcar esta tarea como completada?',
                            () => taskManager.toggleTaskComplete(${task.id})
                        )">
                            <i class="fas fa-check"></i>
                            Completar
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-secondary" onclick="taskManager.editTask(${JSON.stringify(task).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    
                    <button class="btn btn-danger" onclick="taskManager.confirmAction(
                        'Eliminar tarea',
                        '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
                        () => taskManager.deleteTask(${task.id})
                    )">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completada).length;
        
        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
    }

    showLoading() {
        this.loading.style.display = 'flex';
        this.tasksGrid.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
        this.tasksGrid.style.display = 'grid';
    }

    showEmptyState() {
        this.emptyState.style.display = 'flex';
        this.tasksGrid.style.display = 'none';
    }

    hideEmptyState() {
        this.emptyState.style.display = 'none';
        this.tasksGrid.style.display = 'grid';
    }

    showToast(title, type = 'info', message = '') {
        const toastId = 'toast-' + Date.now();
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" onclick="taskManager.removeToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeToast(toastId);
        }, 5000);
    }

    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the application
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});

// Make taskManager globally available for onclick handlers
window.taskManager = taskManager;