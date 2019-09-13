import React, { useState } from 'react';

import GithubAuth from './GithubAuth'
import RepoBranchSelector from './RepoBranchSelector'
import MissingKeyChecker from './MissingKeyChecker'

import './App.css';

function App() {
  const [auth, setAuth] = useState(null)
  const [repository, setRepository] = useState(null)
  const [branch, setBranch] = useState(null)

  return (
    <div className="App">
      {!auth && <GithubAuth auth={auth} setAuth={setAuth} />}
      {auth && <RepoBranchSelector github={auth} setRepository={setRepository} setBranch={setBranch} />}
      {auth && <MissingKeyChecker repo={repository} branch={branch} />}
    </div>
  );
}

export default App;
