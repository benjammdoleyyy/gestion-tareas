document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3690/api/tareas'; // Cambia esto por tu URL de producción

    // Elementos del DOM
    const tareaForm = document.getElementById('tareaForm');
    const editForm = document.getElementById('editForm');
    const listaTareas = document.getElementById('listaTareas');
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');
    const filtroBtns = document.querySelectorAll('.btn-filter');

    // Filtros
    let currentFilter = 'all';

    // Cargar tareas al iniciar
    cargarTareas();

    // Event Listeners
    tareaForm.addEventListener('submit', crearTarea);
    editForm.addEventListener('submit', actualizarTarea);
    closeBtn.addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    // Filtros
    filtroBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filtroBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.id.replace('btn', '').toLowerCase();
            cargarTareas();
        });
    });

    // Funciones
    function cargarTareas() {
        fetch(API_URL)
            .then(response => response.json())
            .then(tareas => {
                listaTareas.innerHTML = '';

                // Filtrar según el filtro seleccionado
                let tareasFiltradas = tareas;
                if (currentFilter === 'pendientes') {
                    tareasFiltradas = tareas.filter(t => !t.completada);
                } else if (currentFilter === 'completadas') {
                    tareasFiltradas = tareas.filter(t => t.completada);
                }

                if (tareasFiltradas.length === 0) {
                    listaTareas.innerHTML = '<p class="no-tasks">No hay tareas para mostrar.</p>';
                    return;
                }

                tareasFiltradas.forEach(tarea => {
                    const tareaElement = crearElementoTarea(tarea);
                    listaTareas.appendChild(tareaElement);
                });
            })
            .catch(error => {
                console.error('Error al cargar tareas:', error);
                listaTareas.innerHTML = '<p class="error">Error al cargar las tareas. Intente nuevamente.</p>';
            });
    }

    function crearElementoTarea(tarea) {
        const tareaDiv = document.createElement('div');
        tareaDiv.className = `tarea-item ${tarea.completada ? 'completada' : ''}`;

        // Formatear fecha
        const fechaCreacion = new Date(tarea.fechaCreacion);
        const fechaFormateada = fechaCreacion.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        tareaDiv.innerHTML = `
            <div class="tarea-header">
                <h3 class="tarea-title">${tarea.titulo}</h3>
                <span class="tarea-fecha">Creada: ${fechaFormateada}</span>
            </div>
            <p class="tarea-descripcion">${tarea.descripcion || 'Sin descripción'}</p>
            <div class="tarea-actions">
                <button class="tarea-btn btn-edit" data-id="${tarea.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                ${!tarea.completada ?
                    `<button class="tarea-btn btn-complete" data-id="${tarea.id}">
                        <i class="fas fa-check"></i> Completar
                    </button>` : ''}
                <button class="tarea-btn btn-delete" data-id="${tarea.id}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;

        // Agregar event listeners a los botones
        tareaDiv.querySelector('.btn-edit').addEventListener('click', () => abrirModalEdicion(tarea));
        tareaDiv.querySelector('.btn-delete').addEventListener('click', eliminarTarea);

        if (!tarea.completada) {
            tareaDiv.querySelector('.btn-complete').addEventListener('click', completarTarea);
        }

        return tareaDiv;
    }

    function crearTarea(e) {
        e.preventDefault();

        const titulo = document.getElementById('titulo').value;
        const descripcion = document.getElementById('descripcion').value;

        const nuevaTarea = {
            titulo,
            descripcion,
            completada: false
        };

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaTarea)
        })
        .then(response => response.json())
        .then(() => {
            cargarTareas();
            tareaForm.reset();
        })
        .catch(error => {
            console.error('Error al crear tarea:', error);
            alert('Error al crear la tarea. Intente nuevamente.');
        });
    }

    function abrirModalEdicion(tarea) {
    const fechaCreacion = new Date(tarea.fechaCreacion);
    const fechaFormateada = fechaCreacion.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('editFechaCreacion').innerText = fechaFormateada;
        document.getElementById('editId').value = tarea.id;
        document.getElementById('editTitulo').value = tarea.titulo;
        document.getElementById('editDescripcion').value = tarea.descripcion || '';
        document.getElementById('editCompletada').checked = tarea.completada;

        modal.style.display = 'block';
    }

    function cerrarModal() {
        modal.style.display = 'none';
    }

    function actualizarTarea(e) {
        e.preventDefault();

        const id = document.getElementById('editId').value;
        const titulo = document.getElementById('editTitulo').value;
        const descripcion = document.getElementById('editDescripcion').value;
        const completada = document.getElementById('editCompletada').checked;

        const tareaActualizada = {
            titulo,
            descripcion,
            completada
        };

        fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tareaActualizada)
        })
        .then(response => response.json())
        .then(() => {
            cargarTareas();
            cerrarModal();
        })
        .catch(error => {
            console.error('Error al actualizar tarea:', error);
            alert('Error al actualizar la tarea. Intente nuevamente.');
        });
    };

 function completarTarea(e) {
        const id = e.target.getAttribute('data-id') ||
                  e.target.parentElement.getAttribute('data-id');

        fetch(`${API_URL}/${id}`, {
            method: 'PATCH'
        })
        .then(response => response.json())
        .then(() => {
            cargarTareas();
        })
        .catch(error => {
            console.error('Error al completar tarea:', error);
            alert('Error al marcar la tarea como completada. Intente nuevamente.');
        });
    }

    function eliminarTarea(e) {
        if (!confirm('¿Está seguro que desea eliminar esta tarea?')) return;

        const id = e.target.getAttribute('data-id') ||
                  e.target.parentElement.getAttribute('data-id');

        fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            cargarTareas();
        })
        .catch(error => {
            console.error('Error al eliminar tarea:', error);
            alert('Error al eliminar la tarea. Intente nuevamente.');
        });
    }
});
