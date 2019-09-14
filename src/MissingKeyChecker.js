import React, { useState } from 'react';
import strip from 'strip-json-comments';

/**
 * Localization json files are comments-with-json and also having a multiline-strings
 * It is invalid for javascript json parser, so treat it first.
 */
function parseJson(jsonString) {
  let parsed = null
  try {
    const traillingComma = /,(\s*?[}\]])/g;
    parsed = jsonString.replace(traillingComma, "$1");
    parsed = strip(parsed);
    parsed = parsed.replace(/[\n\t]+\s*/g, "");
    parsed = parsed.trim();
    return JSON.parse(parsed);
  }
  catch (e) {
    const errorPosRegex = /at position (\d+)/ 
    const errorIndex = errorPosRegex.exec(e.message).index
    console.error(e)
    console.log(parsed, errorIndex)
    console.log(parsed.substr(errorIndex - 20, 100))
    return null
  }
}

export default function MissingKeyChecker({ repo, branch }) {
  let [language, setLanguage] = useState('')
  let [languages, setLanguages] = useState([])
  let [jsons, setJsons] = useState({})

  function getJsonFilesFromTree(tree, treeName='') {
    let jsonFiles = tree.filter(node => node.path.substr(node.path.length - 4) === 'json')
    if (treeName) {
      jsonFiles = jsonFiles.map(node => {
        node.path = `${treeName}/${node.path}`
        return node
      }) 
    }
    return jsonFiles
  }

  async function check(e) {
    const recentCommit = branch.commit.sha
    const tree = await repo.getTree(recentCommit)

    // json files
    let jsonFiles = getJsonFilesFromTree(tree.data.tree)
    
    // open subdirs
    const subDirs = tree.data.tree.filter(node => node.type === 'tree')
    const subTrees = await Promise.all(subDirs.map(async (node) => [node.path, await repo.getTree(node.sha)]))
    subTrees.forEach(([root, tree]) => {
      jsonFiles = jsonFiles.concat(getJsonFilesFromTree(tree.data.tree, root))
    })

    // REAL CHECK LOGICS
    jsonFiles.forEach(async node => {
      
      if (node.path === 'genderDictionary.json') {
        return
      }
      const contents = await repo.getContents(branch.name, node.path, true)
      const jsonObject = parseJson(contents.data);
      if (jsonObject == null) {
        console.log(`Error in ${node.path}`)
        return
      } 
      setJsons({
        ...jsons,
        [node.path]: jsonObject,
      })
      addLanguages(jsonObject)
    });
  }

  function addLanguages(json) {
    for (let key in json) {
      for (let language in json[key]) {
        if (!languages.includes(language)) {
          languages.push(language)
        }
      }
    }
    setLanguages([...languages])
  }

  function getErrors(language) {
    let errors = {}
    if (language == '') {
      return errors
    }
    for (let fileName in jsons) {
      let errorInFile = []
      let keyCount = 0
      const json = jsons[fileName]
      for (let key in json) {
        if (json[key][language] == null) {
          errorInFile.push(key)
        }
        keyCount += 1
      }
      errors[fileName] = [keyCount, errorInFile]
    }
    
    return errors
  }

  const errors = getErrors(language)
  const noErrors = Object.entries(errors).every(([fileName, error]) => error.length === 0)

  return (
    <div className="runner">
      <button onClick={check}>Check!</button>
      <div className="results">
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          {languages.map(l => <option key={l}>{l}</option>)}
        </select>
        {noErrors && <p>100% translated!</p>}
        {Object.entries(errors).map(([fileName, error]) => {
          const [keyCount, errorInFile] = error
          if (errorInFile.length === 0) {
            return null
          }
          return (
            <ul key={fileName}>
              {`Missing keys in ${fileName}: ${errorInFile.length} / ${keyCount}`}
              {errorInFile.map(key => <li key={key}>{key}</li>)}
            </ul>
          )
        })}
      </div>
    </div>
  )
}