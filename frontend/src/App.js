import React, { useEffect, useState } from 'react';
import './App.css';
import api from './api';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/users')
      .then(response => {
        setUsers(response.data);
          console.log(response.data)
        setLoading(false);
      })
      .catch(err => {
        setError('Error to retrieve users: ' + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Users</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        <ul>
          {users.map(user => (
            <li key={user.id}>
                {user.user_name} | {user.user_role}
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
