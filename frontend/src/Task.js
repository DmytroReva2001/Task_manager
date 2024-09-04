import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Task.css';

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    completed: false
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/tasks/')
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

  const handleSubmit = (e, taskId) => {
    e.preventDefault();
    if (taskId) {
      // Actualizar tarea existente
      axios.put(`http://127.0.0.1:8000/api/tasks/${taskId}/`, formData)
        .then(res => {
          setTasks(tasks.map(task => (task.id === taskId ? res.data : task)));
          resetForm();
        })
        .catch(err => console.error('Error updating task:', err));
    } else {
      // Crear nueva tarea
      axios.post('http://127.0.0.1:8000/api/tasks/', formData)
        .then(res => {
          setTasks([...tasks, res.data]);
          resetForm();
        })
        .catch(err => console.error('Error creating task:', err));
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = id => {
    axios.delete(`http://127.0.0.1:8000/api/tasks/${id}/`)
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(err => console.error('Error al eliminar:', err));
  };

  const handleComplete = id => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      axios.put(`http://127.0.0.1:8000/api/tasks/${id}/`, { ...taskToUpdate, completed: !taskToUpdate.completed })
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
      date: task.date,
      completed: task.completed
    });
  };

  // Filtrar tareas según la pestaña activa
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return task.completed;
    if (activeTab === 'pending') return !task.completed;
    return true;
  });

  const resetForm = () => {
    setEditingTaskId(null);
    setFormData({ title: '', description: '', date: '', completed: false });
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="task-container">
      <h2>Gestor de tareas</h2>
      <form onSubmit={(e) => handleSubmit(e, editingTaskId)} className="task-form">
        <input 
          type="text" 
          name="title" 
          placeholder="Título" 
          value={formData.title} 
          onChange={handleInputChange} 
          disabled={editingTaskId === null} 
        />
        <textarea 
          name="description" 
          placeholder="Descripción" 
          value={formData.description} 
          onChange={handleInputChange} 
          disabled={editingTaskId === null} 
        />
        <input 
          type="date" 
          name="date" 
          value={formData.date} 
          onChange={handleInputChange} 
          disabled={editingTaskId === null} 
        />
        <label>
          Completada
          <input 
            type="checkbox" 
            name="completed" 
            checked={formData.completed} 
            onChange={handleInputChange} 
            disabled={editingTaskId === null} 
          />
        </label>
        <button type="submit">
          {editingTaskId ? 'Actualizar tarea' : 'Añadir tarea'}
        </button>
        {editingTaskId && <button type="button" onClick={handleCancelEdit}>Cancelar</button>}
      </form>
      <div className="task-tabs">
        <button onClick={() => setActiveTab('pending')} className={activeTab === 'pending' ? 'active' : ''}>Pendientes</button>
        <button onClick={() => setActiveTab('completed')} className={activeTab === 'completed' ? 'active' : ''}>Completadas</button>
        <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'active' : ''}>Todas las tareas</button>
      </div>
      <ul className="task-list">
        {filteredTasks.length ? (
          filteredTasks.map(task => (
            <li key={task.id}>
              <div className="task-details">
                <p><strong>Título:</strong> {task.title}</p>
                <p><strong>Descripción:</strong> {task.description}</p>
                <p><strong>Fecha:</strong> {formatDate(task.date)}</p>
                <p className={task.completed ? 'task-completed' : 'task-incomplete'}>
                  {task.completed ? 'Completada' : 'Tarea pendiente'}
                </p>
                <div className="task-actions">
                  <button type="button" onClick={() => handleComplete(task.id)}>
                    {task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                  </button>
                  <button type="button" onClick={() => handleEdit(task)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(task.id)}>Eliminar</button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <p>No hay tareas</p>
        )}
      </ul>
    </div>
  );
};

export default Task;