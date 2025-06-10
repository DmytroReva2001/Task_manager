import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './Task.css';

const urlApi = 'http://localhost:8000/api';

Modal.setAppElement('#root');

const today = new Date().toISOString().split('T')[0];

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creationDate: today,
    completed: false,
    dateFrom: '',
    dateTo: '',
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${urlApi}/tasks/`)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error('Error al recibir tareas:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setFormData({
      title: '',
      description: '',
      creationDate: today,
      completed: false,
      dateFrom: '',
      dateTo: '',
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.title || !formData.description) {
      setError('Por favor, rellena todos los campos requeridos.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitPromise = editingTaskId
      ? axios.put(`${urlApi}/tasks/${editingTaskId}/`, formData)
      : axios.post(`${urlApi}/tasks/`, formData);

    submitPromise
      .then((res) => {
        const updatedTasks = editingTaskId
          ? tasks.map((task) => (task.id === editingTaskId ? res.data : task))
          : [...tasks, res.data];
        setTasks(updatedTasks.sort((a, b) => new Date(a.limitDate) - new Date(b.limitDate)));
        closeModal();
      })
      .catch((err) => console.error('Error al enviar tarea:', err));
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      creationDate: task.creationDate,
      completed: task.completed,
      dateFrom: task.dateFrom || '',
      dateTo: task.dateTo || '',
    });
    setIsCreating(false);
    openModal();
  };

  const handleDelete = (id) => {
    axios
      .delete(`${urlApi}/tasks/${id}/`)
      .then(() => setTasks(tasks.filter((task) => task.id !== id)))
      .catch((err) => console.error('Error al eliminar tarea:', err));
  };

  const handleToggleStatus = (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    axios
      .put(`${urlApi}/tasks/${task.id}/`, updatedTask)
      .then((res) => {
        setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
      })
      .catch((err) => console.error('Error al actualizar estado:', err));
  };

  const filteredTasks = tasks.filter((task) => {
    const searchTerm = searchValue.toLowerCase();
    if (activeTab === 'all') {
      return (
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }
    if (activeTab === 'completed') {
      return (
        task.completed &&
        (task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm))
      );
    }
    return (
      !task.completed &&
      (task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <div className="task-container">
      <h2>Gestor de tareas</h2>

      <div className="task-tabs">
        <button onClick={() => setActiveTab('pending')} className={activeTab === 'pending' ? 'active' : ''}>
          Pendientes
        </button>
        <button onClick={() => setActiveTab('completed')} className={activeTab === 'completed' ? 'active' : ''}>
          Completadas
        </button>
        <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'active' : ''}>
          Todas
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar tareas..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="search-bar"
      />

      <div className="btn-container">
        <button
          className="btn-add"
          onClick={() => {
            setIsCreating(true);
            openModal();
          }}
        >
          +
        </button>
      </div>

      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id}>
            <div className="task-details">
              <p>
                <strong>Título:</strong> {task.title}
              </p>
              <p>
                <strong>Descripción:</strong><br></br> 
              </p>
              <p>
                <span className="task-description">{task.description}</span>
              </p>
              <div className="task-actions">
                <button className="edit-button" onClick={() => handleEdit(task)}>Editar</button>
                <button className="delete-button" onClick={() => handleDelete(task.id)}>Eliminar</button>
                <button
                  className={`mark-${task.completed ? 'pending' : 'complete'}-button`}
                  onClick={() => handleToggleStatus(task)}
                >
                  {task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>{isCreating ? 'Crear tarea' : 'Editar tarea'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              placeholder="Título"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="description"
              placeholder="Descripción"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="submit" className="btn-save">
              Guardar
            </button>
            <button type="button" className="btn-cancel" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Task;
