import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    completed: false
  });

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/tasks/')
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/tasks/', formData)
      .then(res => setTasks([...tasks, res.data]))
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Task Manager</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Title" onChange={handleInputChange} />
        <textarea name="description" placeholder="Description" onChange={handleInputChange} />
        <input type="date" name="date" onChange={handleInputChange} />
        <label>
          Completed
          <input type="checkbox" name="completed" onChange={e => setFormData({ ...formData, completed: e.target.checked })} />
        </label>
        <button type="submit">Add Task</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>{task.date}</p>
            <p>{task.completed ? 'Completed' : 'Not Completed'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Task;