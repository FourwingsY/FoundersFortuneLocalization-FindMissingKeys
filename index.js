const button = document.getElementById("submit")

button.addEventListener('click', async () => {
    const id = document.getElementById("id").value
    const pw = document.getElementById("pw").value
    const repoName = document.getElementById("repo").value
    const branchName = document.getElementById("branch").value
    const language = document.getElementById("language").value
    const output = document.getElementById("results")

    output.innerText = ""

    const gh = new GitHub({
        username: id,
        password: pw
    });
    const [user, repo] = repoName.split("/")
    const repository = gh.getRepo(user, repo)
    let branch = undefined
    try {
        branch = await repository.getBranch(branchName)
    }
    catch (e) {
        output.innerText = e.message
        return
    }
    const recentCommit = branch.data.commit.sha
    const tree = await repository.getTree(recentCommit)
    const files = tree.data.tree.map((node) => node.path)

    files.forEach(async file => {
        if (file.substr(file.length - 4) != 'json') {
            return
        } 
        if (file == 'genderDictionary.json') {
            return
        }
        const contents = await repository.getContents(branchName, file, true)
        jsonObject = parseJson(contents.data);
        let [errors, ratio] = check(jsonObject, language);
        if (errors.length > 0) {
            const errorDesc = document.createElement("p");

            const errorFile = document.createElement("span");
            errorFile.classList.add("error-title")
            errorFile.innerText = `Missing keys in: ${file} (${(ratio * 100).toFixed(1)}%)`;
            errorDesc.appendChild(errorFile)

            const errorList = document.createElement("ul");
            for (k in errors) {
                let missingKey = document.createElement("li");
                missingKey.classList.add("missing-key");
                missingKey.innerText = errors[k];
                errorList.appendChild(missingKey)
            }
            errorDesc.appendChild(errorList);

            output.appendChild(errorDesc);
        }
    });
})

/**
 * before parse, have to treat some invalid json formats 
 */
function parseJson(jsonString) {
    const traillingComma = /\,(\s*?[\}\]])/g;
    parsed = jsonString.replace(traillingComma, "$1");
    parsed = strip(parsed);
    parsed = parsed.replace(/[\n\t]*\s*/g, "");
    parsed = parsed.trim();
    jsonObject = JSON.parse(parsed);
    return jsonObject
}

function check(json, language) {
    errors = []
    for (key in json) {
        if (json[key][language] == null) {
            errors.push(key)
        }
    }
    const ratio = errors.length / Object.keys(json).length
    return [errors, ratio]
}
