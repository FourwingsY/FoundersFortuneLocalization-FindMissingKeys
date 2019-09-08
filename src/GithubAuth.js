import React, { useState } from 'react';
import Github from 'github-api';
import useAuth from './useAuth'

export default function GithubAuth() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [auth, setAuth] = useAuth()

  async function handleClick() {
    const authenticated = new Github({
      username,
      password
    });
    
    // verify account
    authenticated.getRateLimit().getRateLimit()
      .then(() => {setAuth(authenticated)})
      .catch((e) => {
        if (e.response.status === 401) {
          // show login error
        }
      })
  }
  
  // if login successed, do not show login form
  if (auth !== null) {
    return (
      <div>Authentication OK!</div>
    )
  }
  return (
    <>
      <p>This form is for using github api. without login, api limit is too low.</p>
      <form>
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
        <button onClick={handleClick}>Login</button>
      </form>
    </>
  )
}