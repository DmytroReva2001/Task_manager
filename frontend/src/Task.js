import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './Task.css';

var urlApi = 'http://localhost:8000/api'
//var urlApi = 'https://qlf28rf1-8000.uks1.devtunnels.ms/api'

Modal.setAppElement('#root'); // Es necesario para accesibilidad

const today = new Date().toISOString().split('T')[0];

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creationDate: today,
    completed: false,
    dateFrom: '',
    dateTo: ''
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm] = useState('');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    axios.get(urlApi+'/tasks/')
      .then(res => {
        setTasks(res.data);
      })
      .catch(err => console.error('Error al recibir tareas:', err));
  }, []);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar que los campos obligatorios estén llenos
    if (!formData.title || !formData.description || !formData.creationDate) {
      alert('Por favor, rellena todos los campos');
      return;
    }
    
    if (editingTaskId) {
      // Actualizar tarea existente
      axios.put(urlApi+`/tasks/${editingTaskId}/`, formData)
        .then(res => {
          setTasks(tasks.map(task => (task.id === editingTaskId ? res.data : task)).sort((a, b) => new Date(a.limitDate) - new Date(b.limitDate)));
          closeModal();
        })
        .catch(err => console.error('Error updating task:', err));
    } else {
      // Crear nueva tarea
      axios.post(urlApi+'/tasks/', formData)
        .then(res => {
          setTasks([...tasks, res.data].sort((a, b) => new Date(a.limitDate) - new Date(b.limitDate)));
          closeModal();
        })
        .catch(err => console.error('Error creating task:', err));
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    closeModal();
  };

  const handleDelete = id => {
    axios.delete(urlApi+`/tasks/${id}/`)
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(err => console.error('Error al eliminar:', err));
  };

  const handleComplete = id => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      axios.put(urlApi+`/tasks/${id}/`, { ...taskToUpdate, completed: !taskToUpdate.completed })
        .then(res => {
          setTasks(tasks.map(task => (task.id === id ? res.data : task)));
        })
        .catch(err => console.error('Error al actualizar estado:', err));
    }
  };

  const handleEdit = task => {
    setEditingTaskId(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      creationDate: task.creationDate,
      completed: task.completed
    });
    setIsCreating(false);
    openModal();
  };

  const openModal = () => setIsModalOpen(true);
  
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingTaskId(null);
    setFormData({ title: '', description: '', creationDate: today, completed: false });
  };

  const handleCreateNewTask = () => {
    setEditingTaskId(null);
    setIsCreating(true);
    openModal();
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchButtonClick = () => {

    if (!searchValue && !formData.dateFrom && !formData.dateTo) {
      restablecerFiltros();
      return;
    }
    else{
    axios.get(urlApi+'/tasks/')
      .then(res => {
        const tasks = res.data;
  
        // Filtrar por término de búsqueda
        let filteredTasks = tasks.filter(task => {
          return task.title.toLowerCase().includes(searchValue.toLowerCase()) || task.description.toLowerCase().includes(searchValue.toLowerCase());
        });
  
        // Filtrar por fecha desde
        if (formData.dateFrom) {
          filteredTasks = filteredTasks.filter(task => new Date(task.date) >= new Date(formData.dateFrom));
        }
  
        // Filtrar por fecha hasta
        if (formData.dateTo) {
          filteredTasks = filteredTasks.filter(task => new Date(task.date) <= new Date(formData.dateTo));
        }
  
        setTasks(filteredTasks);
        var cantidad = filteredTasks.length;
  
        // Actualizar los datos de búsqueda en los elementos <p>
        document.getElementById('searchTerm').innerText = `Búsqueda: ${searchValue}`;
        document.getElementById('searchResult').innerText = `Resultados: ${cantidad}`;

        if(formData.dateFrom && formData.dateTo){
        document.getElementById('dateRange').innerText = `Desde la fecha: ${formatDate(formData.dateFrom)} | Hasta la fecha: ${formatDate(formData.dateTo)}`;
      }
        else if (formData.dateFrom)
        {
          document.getElementById('dateRange').innerText = `Desde la fecha: ${formatDate(formData.dateFrom)}`;
        }
        else if (formData.dateTo)
        {
          document.getElementById('dateRange').innerText = `Hasta la fecha: ${formatDate(formData.dateTo)}`;
        }

        // Limpiar los campos de búsqueda y fechas
        setSearchValue('');
        setFormData({
          ...formData,
          dateFrom: '',
          dateTo: ''
        });
  
      })
      .catch(err => console.error('Error al recibir tareas:', err));
    }
  };

  const restablecerFiltros = () => {

    document.getElementById('searchTerm').innerText = ``;
    document.getElementById('dateRange').innerText = ``;
    document.getElementById('searchResult').innerText= ``;

    axios.get(urlApi+'/tasks/')
      .then(res => {
        const tasks = res.data;
  
        setTasks(tasks);
  
        // Limpiar los campos de búsqueda y fechas
        setSearchValue('');
        setFormData({
          ...formData,
          dateFrom: '',
          dateTo: ''
        });
  
      })
      .catch(err => console.error('Error al recibir tareas:', err));
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') {
      return task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (activeTab === 'completed') {
      return task.completed && (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (activeTab === 'pending') {
      return !task.completed && (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return false; // Agregar un return al final por si no se cumple ninguna condición
  });

  const formatDate = dateString => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const fetchTasks = () => {
    axios.get(urlApi + '/tasks/')
      .then(res => {
        setTasks(res.data);
      })
      .catch(err => console.error('Error al recibir tareas:', err));
  };

  return (
    <div className="task-container">
      <h2>Gestor de tareas</h2>
      <p><button className="add-button" onClick={handleCreateNewTask}><img alt="refresh" src="https://static.thenounproject.com/png/961411-200.png"></img></button></p>
      
      <div className="task-tabs">
        <button onClick={() => setActiveTab('pending')} className={activeTab === 'pending' ? 'active' : ''}>Pendientes</button>
        <button onClick={() => setActiveTab('completed')} className={activeTab === 'completed' ? 'active' : ''}>Completadas</button>
        <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'active' : ''}>Todas las tareas</button>

        <p id="searchTerm"></p>
        <p id="dateRange"></p>
        <strong><p id="searchResult"></p></strong>
      </div>

      <div className="filter-bar-form">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchValue}
          onChange={handleSearchChange}
        />

        <div className='filter-date-bar-form'>
        <p>Fecha desde: 
        <input
          type="date"
          value={formData.dateFrom || ''} // Asegúrate de que no sea undefined
          onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
          max={formData.dateTo || ''}
        />

        <input
          type="date"
          value={formData.dateTo || ''} // Asegúrate de que no sea undefined
          onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
          min={formData.dateFrom || ''}
        />
        </p>
        </div>
      </div>

      <div className="search-btn">
        <button onClick={handleSearchButtonClick}>Buscar</button>
        <button onClick={restablecerFiltros}>Restablecer</button>
        <button onClick={() => fetchTasks()}><img alt="refresh" src="https://static.vecteezy.com/system/resources/previews/019/858/805/non_2x/refresh-flat-color-outline-icon-free-png.png"></img></button>
      </div>    
      <ul className="task-list">
        {filteredTasks.length ? (
          filteredTasks.map(task => (
            <li key={task.id}>
              <div className="task-details">
                <p><strong>Título:</strong> {task.title}</p>
                <p><strong>Descripción:</strong> {task.description}</p>
                <p><strong>Fecha de creación:</strong> {formatDate(task.creationDate)}</p>
                <p className={`task-status ${task.completed ? 'completed' : 'pending'}`}>
                  {task.completed ? 'Completada' : 'Tarea pendiente'}
                </p>
                <div className="task-actions">
                  <button 
                    type="button" 
                    className="mark-complete-button" 
                    onClick={() => handleComplete(task.id)}
                  >
                    {task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                  </button>
                  <button 
                    type="button" 
                    className="edit-button" 
                    onClick={() => handleEdit(task)}
                  >
                    Editar
                  </button>
                  <button 
                    type="button" 
                    className="delete-button" 
                    onClick={() => handleDelete(task.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <p>No hay tareas</p>
        )}
      </ul>
      {/* Modal de Edición / Creación */}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={isCreating ? "Crear tarea" : "Editar tarea"}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>{isCreating ? 'Añadir tarea' : 'Editar tarea'}</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <input 
            type="text" 
            name="title" 
            placeholder="Título" 
            value={formData.title} 
            onChange={handleInputChange} 
          />
          <textarea 
            name="description" 
            placeholder="Descripción" 
            value={formData.description} 
            onChange={handleInputChange} 
            style={{ height: '150px' }}
          />
          <label>
            Completada
            <input 
              type="checkbox" 
              name="completed" 
              checked={formData.completed} 
              onChange={handleInputChange} 
            />
          </label>
          <button type="submit">
            {isCreating ? 'Añadir tarea' : 'Actualizar tarea'}
          </button>
          <button type="button" onClick={handleCancelEdit}>Cancelar</button>
        </form>
      </Modal>
    </div>
  );
};

export default Task;