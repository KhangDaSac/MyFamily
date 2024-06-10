const { exec } = require('child_process');

// Lấy ngày và giờ hiện tại
const today = new Date();
const day = String(today.getDate()).padStart(2, '0');
const month = String(today.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
const year = today.getFullYear();
const hours = String(today.getHours()).padStart(2, '0');
const minutes = String(today.getMinutes()).padStart(2, '0');
const seconds = String(today.getSeconds()).padStart(2, '0');

// Tạo thông điệp commit với ngày và giờ hiện tại
const commitMessage = `Commit ${day}-${month}-${year}, ${hours}:${minutes}:${seconds}: `;

// Chạy các lệnh git
exec('git add .', (err, stdout, stderr) => {
    if (err) {
        console.error(`Lỗi khi chạy git add: ${stderr}`);
        return;
    }
    console.log(stdout);

    exec(`git commit -m "${commitMessage}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Lỗi khi chạy git commit: ${stderr}`);
            return;
        }
        console.log(stdout);

        exec('git push origin master', (err, stdout, stderr) => {
            if (err) {
                console.error(`Lỗi khi chạy git push: ${stderr}`);
                return;
            }
            console.log(stdout);
        });
    });
});
