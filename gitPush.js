const { exec } = require('child_process');


const today = new Date();
const day = String(today.getDate()).padStart(2, '0');
const month = String(today.getMonth() + 1).padStart(2, '0');
const year = today.getFullYear();
const hours = String(today.getHours()).padStart(2, '0');
const minutes = String(today.getMinutes()).padStart(2, '0');
const seconds = String(today.getSeconds()).padStart(2, '0');


const commitMessage = `Commit ${day}-${month}-${year}, ${hours}:${minutes}:${seconds} `;


exec('git add .', (err, stdout, stderr) => {
    if (err) {
        return;
    }

    exec(`git commit -m "${commitMessage}"`, (err, stdout, stderr) => {
        if (err) {
            return;
        }

        exec('git push origin master', (err, stdout, stderr) => {
            if (err) {
                return;
            }
        });
    });
});
