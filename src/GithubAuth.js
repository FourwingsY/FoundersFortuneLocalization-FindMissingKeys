import React, { useState, useEffect } from 'react';
import Github from 'github-api';

function isAuthenticated(auth) {
  if (auth == null) return false
  return auth.__auth && Object.entries(auth.__auth).length > 0
}

export default function GithubAuth({auth, setAuth}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [limit, setLimit] = useState(0)

  useEffect(() => {
    async function checkLimit(auth) { 
      const response = await auth.getRateLimit().getRateLimit()
      const remainCount = response.headers["x-ratelimit-remaining"]
      setLimit(remainCount)
    }
    checkLimit(auth || new Github())
  })

  /**
   * login
   */
  async function login() {
    const newAuth = new Github({
      username,
      password
    });

    // verify account
    newAuth.getRateLimit().getRateLimit()
      .then(() => {setAuth(newAuth)})
      .catch((e) => {
        if (e.response.status === 401) {
          // show login error
        }
      })
  }

  function doGuest() {
    setAuth(new Github())
  }

  if (isAuthenticated(auth)) {
    return (
      <div>Authentication OK!</div>
    )
  }
  return (
    <div>
      <div className="guest">
        <span>{limit}</span>
        <button onClick={doGuest}>Do with guest token</button>
      </div>
      <div className="login">
        <input 
          type="email"
          placeholder="github ID" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="password"
          placeholder="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
      </div>
    </div>
  )
}