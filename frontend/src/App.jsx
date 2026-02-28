import React from 'react';
import AssignmentPage from './features/assignment/AssignmentPage';
import Navbar from './components/Navbar';
import './assets/scss/main.scss';

function App() {
  return (
    <div className="app">
      <Navbar />
      <AssignmentPage />
    </div>
  );
}

export default App;
