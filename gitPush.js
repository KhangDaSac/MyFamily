const { exec } = require('child_process');

// Lấy ngày hiện tại
const today = new Date();
const day = String(today.getDate()).padStart(2, '0');
const month = String(today.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
const year = today.getFullYear();

// Tạo thông điệp commit với ngày hiện tại
const commitMessage = `Commit ngày ${day}-${month}-${year}`;

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
