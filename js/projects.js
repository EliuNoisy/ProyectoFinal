// Configuracion de la API
const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

// PROTECCION: Verificar autenticacion antes de ejecutar cualquier cosa
(function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.replace('index.html');
        throw new Error('No autenticado');
    }
})();

// Variable global para edicion
let currentEditingProject = null;

// Funciones de utilidad
function getToken() {
    return localStorage.getItem('authToken');
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr || userStr === 'undefined') {
        return null;
    }
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error al parsear usuario:', error);
        return null;
    }
}

function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Funciones de Modal
function showModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Resetear formulario
        const form = document.getElementById('projectForm');
        if (form) {
            form.reset();
            // Limpiar campos manualmente por si acaso
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
            document.getElementById('repository').value = '';
            document.getElementById('technologiesInput').value = '';
            document.getElementById('imagesInput').value = '';
        }
        
        // Resetear estado de edición
        currentEditingProject = null;
        console.log('Modal cerrado - currentEditingProject reseteado:', currentEditingProject);
        
        // Resetear textos del modal
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Agregar Proyecto';
        
        const submitBtn = form?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Crear Proyecto';
            submitBtn.disabled = false;
        }
    }
}

// API Functions para Proyectos
async function getAllProjects() {
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'GET',
            headers: {
                'auth-token': token
            }
        });

        if (response.status === 401) {
            showNotification('Sesion expirada. Por favor inicia sesion nuevamente.', 'error');
            setTimeout(() => {
                localStorage.clear();
                window.location.replace('index.html');
            }, 2000);
            throw new Error('Sesion expirada');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener proyectos');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en getAllProjects:', error);
        throw error;
    }
}

async function createProject(projectData) {
    try {
        const token = getToken();
        
        console.log('=== CREANDO PROYECTO ===');
        console.log('Token:', token);
        console.log('Datos a enviar:', projectData);
        
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': token
            },
            body: JSON.stringify(projectData)
        });

        console.log('Status de respuesta:', response.status);
        
        const data = await response.json();
        console.log('Respuesta de la API:', data);

        if (response.status === 401) {
            showNotification('Sesion expirada. Por favor inicia sesion nuevamente.', 'error');
            setTimeout(() => {
                localStorage.clear();
                window.location.replace('index.html');
            }, 2000);
            throw new Error('Sesion expirada');
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Error al crear proyecto');
        }

        return data;
    } catch (error) {
        console.error('Error en createProject:', error);
        throw error;
    }
}

async function updateProject(projectId, projectData) {
    try {
        const token = getToken();
        
        console.log('=== ACTUALIZANDO PROYECTO ===');
        console.log('ID del proyecto:', projectId);
        console.log('Token:', token);
        console.log('Datos a actualizar:', projectData);
        
        const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': token
            },
            body: JSON.stringify(projectData)
        });

        console.log('Status de respuesta:', response.status);
        
        const data = await response.json();
        console.log('Respuesta de la API:', data);

        if (response.status === 401) {
            showNotification('Sesion expirada. Por favor inicia sesion nuevamente.', 'error');
            setTimeout(() => {
                localStorage.clear();
                window.location.replace('index.html');
            }, 2000);
            throw new Error('Sesion expirada');
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Error al actualizar proyecto');
        }

        return data;
    } catch (error) {
        console.error('Error en updateProject:', error);
        throw error;
    }
}

async function deleteProject(projectId) {
    try {
        const token = getToken();
        
        console.log('=== ELIMINANDO PROYECTO ===');
        console.log('ID del proyecto:', projectId);
        
        const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'auth-token': token
            }
        });

        if (response.status === 401) {
            showNotification('Sesion expirada. Por favor inicia sesion nuevamente.', 'error');
            setTimeout(() => {
                localStorage.clear();
                window.location.replace('index.html');
            }, 2000);
            throw new Error('Sesion expirada');
        }

        // Algunos servidores no devuelven contenido al eliminar
        let data = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Error al eliminar proyecto');
        }

        return data;
    } catch (error) {
        console.error('Error en deleteProject:', error);
        throw error;
    }
}

// Renderizar proyectos CON IMAGENES
function renderProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projects || projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-state">
                <p>No tienes proyectos aun</p>
                <p>Haz clic en "Agregar Proyecto" para comenzar</p>
            </div>
        `;
        return;
    }
    
    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card" data-id="${project._id}">
            ${project.images && project.images.length > 0 ? `
                <div class="project-images">
                    <img src="${escapeHtml(project.images[0])}" 
                         alt="${escapeHtml(project.title)}"
                         onerror="this.style.display='none'"
                         style="width: 100%; height: 200px; object-fit: cover; border-radius: 15px; margin-bottom: 15px;">
                </div>
            ` : ''}
            
            <div class="project-header">
                <h3>${escapeHtml(project.title)}</h3>
                <div class="project-actions">
                    <button class="btn-icon btn-edit" onclick="editProject('${project._id}')" title="Editar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="confirmDeleteProject('${project._id}')" title="Eliminar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <p class="project-description">${escapeHtml(project.description)}</p>
            
            ${project.technologies && project.technologies.length > 0 ? `
                <div class="project-technologies">
                    ${project.technologies.map(tech => `<span class="tech-badge">${escapeHtml(tech)}</span>`).join('')}
                </div>
            ` : ''}
            
            ${project.repository ? `
                <a href="${escapeHtml(project.repository)}" target="_blank" rel="noopener noreferrer" class="project-link">
                    Ver Repositorio
                </a>
            ` : ''}
        </div>
    `).join('');
}

// Cargar proyectos CON SKELETON LOADER
async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    try {
        // Skeleton loader mas atractivo
        projectsGrid.innerHTML = `
            <div class="skeleton-card">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line long"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line long"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line long"></div>
            </div>
        `;
        
        const projects = await getAllProjects();
        
        console.log('Proyectos cargados:', projects);
        renderProjects(projects);
    } catch (error) {
        console.error('Error al cargar proyectos:', error);
        projectsGrid.innerHTML = `
            <div class="empty-state">
                <p>Error al cargar proyectos</p>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
        showNotification('Error al cargar proyectos: ' + error.message, 'error');
    }
}

// Editar proyecto
async function editProject(projectId) {
    try {
        const projects = await getAllProjects();
        const project = projects.find(p => p._id === projectId);
        
        if (!project) {
            showNotification('Proyecto no encontrado', 'error');
            return;
        }
        
        // Establecer el proyecto actual ANTES de mostrar el modal
        currentEditingProject = project;
        
        console.log('=== MODO EDICION ===');
        console.log('Proyecto a editar:', project);
        console.log('currentEditingProject:', currentEditingProject);
        
        // Llenar el formulario
        document.getElementById('modalTitle').textContent = 'Editar Proyecto';
        document.getElementById('title').value = project.title || '';
        document.getElementById('description').value = project.description || '';
        document.getElementById('repository').value = project.repository || '';
        document.getElementById('technologiesInput').value = project.technologies ? project.technologies.join(', ') : '';
        document.getElementById('imagesInput').value = project.images ? project.images.join(', ') : '';
        
        const submitBtn = document.querySelector('#projectForm button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Actualizar Proyecto';
        
        showModal();
    } catch (error) {
        console.error('Error en editProject:', error);
        showNotification(error.message, 'error');
    }
}

// Confirmar eliminar
function confirmDeleteProject(projectId) {
    if (confirm('¿Estas seguro que deseas eliminar este proyecto?')) {
        handleDeleteProject(projectId);
    }
}

// Eliminar proyecto
async function handleDeleteProject(projectId) {
    try {
        await deleteProject(projectId);
        showNotification('Proyecto eliminado exitosamente', 'success');
        await loadProjects();
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        showNotification(error.message, 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    
    // Cargar proyectos al iniciar
    loadProjects();
    
    // Boton de agregar proyecto
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', function() {
            console.log('=== ABRIENDO MODAL CREAR ===');
            
            // IMPORTANTE: Resetear todo antes de abrir
            currentEditingProject = null;
            
            // Limpiar formulario
            const form = document.getElementById('projectForm');
            if (form) {
                form.reset();
                document.getElementById('title').value = '';
                document.getElementById('description').value = '';
                document.getElementById('repository').value = '';
                document.getElementById('technologiesInput').value = '';
                document.getElementById('imagesInput').value = '';
            }
            
            // Configurar textos para modo crear
            document.getElementById('modalTitle').textContent = 'Agregar Proyecto';
            const submitBtn = form?.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Crear Proyecto';
                submitBtn.disabled = false;
            }
            
            console.log('currentEditingProject después de resetear:', currentEditingProject);
            
            showModal();
        });
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
    }
    
    // Boton de cerrar modal
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            hideModal();
        });
    }
    
    // Boton de cancelar
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            hideModal();
        });
    }
    
    // Formulario de proyecto
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            const repository = document.getElementById('repository').value.trim();
            const technologiesInput = document.getElementById('technologiesInput').value.trim();
            const imagesInput = document.getElementById('imagesInput').value.trim();
            
            // Validacion basica
            if (!title || !description) {
                showNotification('El titulo y la descripcion son obligatorios', 'error');
                return;
            }
            
            // Procesar tecnologias e imagenes
            const technologies = technologiesInput 
                ? technologiesInput.split(',').map(t => t.trim()).filter(t => t) 
                : [];
            
            const images = imagesInput 
                ? imagesInput.split(',').map(i => i.trim()).filter(i => i) 
                : [];
            
            // Construir el objeto de datos del proyecto
            const projectData = {
                title,
                description
            };
            
            // Solo agregar campos opcionales si tienen valores
            if (repository) {
                projectData.repository = repository;
            }
            
            if (technologies.length > 0) {
                projectData.technologies = technologies;
            }
            
            if (images.length > 0) {
                projectData.images = images;
            }
            
            const submitBtn = projectForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            
            console.log('=== ENVIANDO FORMULARIO ===');
            console.log('currentEditingProject AL ENVIAR:', currentEditingProject);
            console.log('Es edicion?:', !!currentEditingProject);
            console.log('Datos a enviar:', projectData);
            
            try {
                if (currentEditingProject && currentEditingProject._id) {
                    // MODO EDICION
                    submitBtn.textContent = 'Actualizando...';
                    console.log('Actualizando proyecto ID:', currentEditingProject._id);
                    await updateProject(currentEditingProject._id, projectData);
                    showNotification('Proyecto actualizado exitosamente', 'success');
                } else {
                    // MODO CREAR
                    submitBtn.textContent = 'Creando...';
                    console.log('Creando nuevo proyecto');
                    await createProject(projectData);
                    showNotification('Proyecto creado exitosamente', 'success');
                }
                
                // IMPORTANTE: Resetear el estado ANTES de cerrar el modal
                currentEditingProject = null;
                console.log('Operación exitosa - currentEditingProject reseteado:', currentEditingProject);
                
                // Cerrar modal y recargar
                hideModal();
                await loadProjects();
                
            } catch (error) {
                console.error('Error al guardar proyecto:', error);
                showNotification('Error: ' + error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// Exponer funciones globalmente
window.editProject = editProject;
window.confirmDeleteProject = confirmDeleteProject;
window.showModal = showModal;
window.hideModal = hideModal;