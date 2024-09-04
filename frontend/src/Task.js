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
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/tasks/')
      .then(res => {
        console.log('Data received:', res.data);
        setTasks(res.data);
      })
      .catch(err => console.error('Error fetching tasks:', err));
  }, []);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (editingTask) {
      axios.put(`http://127.0.0.1:8000/api/tasks/${editingTask.id}/`, formData)
        .then(res => {
          setTasks(tasks.map(task => (task.id === editingTask.id ? res.data : task)));
          setEditingTask(null);
          setFormData({ title: '', description: '', date: '', completed: false });
        })
        .catch(err => console.error('Error updating task:', err));
    } else {
      axios.post('http://127.0.0.1:8000/api/tasks/', formData)
        .then(res => setTasks([...tasks, res.data]))
        .catch(err => console.error('Error creating task:', err));
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', date: '', completed: false });
  };

  const handleDelete = id => {
    axios.delete(`http://127.0.0.1:8000/api/tasks/${id}/`)
      .then(() => {
        // Eliminar la tarea localmente del estado
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(err => console.error('Error deleting task:', err));
  };

  const handleComplete = id => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      axios.put(`http://127.0.0.1:8000/api/tasks/${id}/`, { ...taskToUpdate, completed: !taskToUpdate.completed })
        .then(res => {
          setTasks(tasks.map(task => (task.id === id ? res.data : task)));
        })
        .catch(err => console.error('Error updating task completion:', err));
    }
  };

  return (
    <div className="task-container">
      <h2>Task Manager</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <input 
          type="text" 
          name="title" 
          placeholder="Title" 
          value={formData.title} 
          onChange={handleInputChange} 
        />
        <textarea 
          name="description" 
          placeholder="Description" 
          value={formData.description} 
          onChange={handleInputChange} 
        />
        <input 
          type="date" 
          name="date" 
          value={formData.date} 
          onChange={handleInputChange} 
        />
        <label>
          Completed
          <input 
            type="checkbox" 
            name="completed" 
            checked={formData.completed} 
            onChange={e => setFormData({ ...formData, completed: e.target.checked })} 
          />
        </label>
        <button type="submit">
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
        {editingTask && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
      </form>
      <ul className="task-list">
        {tasks.length ? (
          tasks.map(task => (
            <li key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>{task.date}</p>
              <p>{task.completed ? 'Completed' : 'Not Completed'}</p>
              <p>
                <button onClick={() => handleComplete(task.id)}>
                  {task.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                </button>
                <button onClick={() => handleDelete(task.id)}>Eliminar</button>
              </p>
            </li>
          ))
        ) : (
          <p>No tasks found</p>
        )}
      </ul>
    </div>
  );
};

export default Task;