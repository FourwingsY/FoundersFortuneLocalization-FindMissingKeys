import React, { useState } from 'react';
import strip from 'strip-json-comments';

/**
 * Localization json files are comments-with-json and also having a multiline-strings
 * It is invalid for javascript json parser, so treat it first.
 */
function parseJson(jsonString) {
  const traillingComma = /,(\s*?[}]])/g;
  let parsed = jsonString.replace(traillingComma, "$1");
  parsed = strip(parsed);
  parsed = parsed.replace(/[\n\t]*\s*/g, "");
  parsed = parsed.trim();
  const jsonObject = JSON.parse(parsed);
  return jsonObject
}

export default function MissingKeyChecker({ repo, branch }) {
  let [languages, setLanguages] = useState([])

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
      checkMissingKeys(node.path, jsonObject)
    });

  }

  function checkMissingKeys(fileName, json) {
    // count and show missing keys and progress by languages
  }

  return (
    <div className="runner">
      <button onClick={check}>Check!</button>
      <div className="results">
        <select>
          {languages.map(l => <option>{l}</option>)}
        </select>
      </div>
    </div>
  )
}