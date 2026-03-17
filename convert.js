const fs = require('fs');

function poToJson(poPath, jsonPath) {
    const content = fs.readFileSync(poPath, 'utf8');
    const lines = content.split('\n');
    const messages = {};
    let currentId = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('msgid "')) {
            currentId = line.substring(7, line.length - 1);
        } else if (line.startsWith('msgstr "') && currentId !== null) {
            const msgstr = line.substring(8, line.length - 1);
            if (currentId) { // Skip empty msgid (header)
                messages[currentId] = msgstr || currentId; // Fallback to id for source
            }
            currentId = null;
        }
    }

    fs.writeFileSync(jsonPath, JSON.stringify(messages, null, 2));
    console.log(`Converted ${poPath} to ${jsonPath}. Found ${Object.keys(messages).length} keys.`);
}

poToJson('src/locales/en/messages.po', 'src/locales/en/messages.json');
poToJson('src/locales/id/messages.po', 'src/locales/id/messages.json');
