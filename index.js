const button = document.getElementById("submit")

button.addEventListener('click', async () => {
    const id = document.getElementById("id").value
    const pw = document.getElementById("pw").value
    const language = document.getElementById("language").value

    const gh = new GitHub({
        username: id,
        password: pw
    });
    const repo = gh.getRepo('Ponzel', 'FoundersFortuneLocalization')
    const master = await repo.getBranch("master")
    const recentCommit = master.data.commit.sha
    const tree = await repo.getTree(recentCommit)
    const files = tree.data.tree.map((node) => node.path)

    files.forEach(async file => {
        if (file.substr(file.length - 4) != 'json') {
            return
        } 
        if (file == 'genderDictionary.json') {
            return
        }
        const contents = await repo.getContents("master", file, true)
        jsonObject = parseJson(contents.data);
        errors = check(jsonObject, language);
        if (errors.length > 0) {
            console.log("Missing keys in: " + file);
            console.log(errors);
        } else {
            console.log("No Error")
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
    return errors
}
