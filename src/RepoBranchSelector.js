import React, { useState, useEffect } from 'react';

export default function RepoBranchSelector({ github, setRepository, setBranch }) {
  const [fullName, setFullName] = useState('Ponzel/FoundersFortuneLocalization')
  const [branches, setBranches] = useState([])
  const [branchName, setBranchName] = useState('')

  useEffect(() => {
    async function getBranches() {
      const [user, repo] = fullName.split('/')
      const repository = github.getRepo(user, repo)
      const branches = await repository.listBranches()
      setRepository(repository)
      setBranches(branches.data)
    }
    getBranches()
  }, [github, fullName, setRepository])

  async function onBranchNameChange(e) {
    const branchName = e.target.value
    setBranchName(branchName)

    const [user, repo] = fullName.split('/')
    const repository = github.getRepo(user, repo)
    const branch = await repository.getBranch(branchName)
    setBranch(branch.data)
  }

  return (
    <div>
      <input type="text" value={fullName} onChange={setFullName} />
      <select value={branchName} onChange={onBranchNameChange}>
        {branches.map(b => (
          <option key={b.name}>{b.name}</option>
        ))}
      </select>
    </div>
  )
}