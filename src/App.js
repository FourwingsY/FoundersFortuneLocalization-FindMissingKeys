import React from 'react';
import './App.css';
import GithubAuth from './GithubAuth'
import useAuth from './useAuth'
import RepoBranchSelector from './RepoBranchSelector'

function App() {
  const [auth] = useAuth()

  return (
    <div className="App">
      <header className="App-header">
        <GithubAuth />
        {auth && <RepoBranchSelector />}
      </header>
    </div>
  );
}

export default App;
