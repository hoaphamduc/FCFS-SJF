// Bắt sự kiện khi submit form FCFS
document.getElementById('fcfsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    processForm('fcfs');
});

// Bắt sự kiện khi submit form SJF
document.getElementById('sjfForm').addEventListener('submit', function (e) {
    e.preventDefault();
    processForm('sjf');
});

// Hàm thêm tiến trình mới cho cả FCFS và SJF
function addProcess(type) {
    const processesDiv = document.getElementById(type + 'Processes');
    const newProcessDiv = document.createElement('div');
    newProcessDiv.classList.add(type + '-process', 'form-row', 'd-inline-flex', 'align-items-center', 'mb-3');
    newProcessDiv.innerHTML = `
        <label for="arrivalTime" class="me-2">Thời điểm đến:</label>
        <input type="number" class="arrivalTime form-control me-2" required>
        <label for="burstTime" class="me-2">Thời gian bùng nổ:</label>
        <input type="number" class="burstTime form-control me-2" required>
        <button type="button" class="btn btn-danger" onclick="removeProcess(this)">Xóa</button>
    `;
    processesDiv.appendChild(newProcessDiv);
}

// Hàm xóa tiến trình
function removeProcess(button) {
    button.parentElement.remove();
}

// Hàm xử lý form để tính toán các giá trị liên quan đến tiến trình
function processForm(type) {
    const processes = [];
    const arrivalTimes = document.querySelectorAll(`#${type}Processes .arrivalTime`);
    const burstTimes = document.querySelectorAll(`#${type}Processes .burstTime`);

    // Duyệt qua các tiến trình và lấy dữ liệu
    for (let i = 0; i < arrivalTimes.length; i++) {
        processes.push({
            id: `P${i + 1}`, // Đặt tên cho từng tiến trình (P1, P2, ...)
            arrivalTime: parseInt(arrivalTimes[i].value),
            burstTime: parseInt(burstTimes[i].value),
            completionTime: 0,
            turnaroundTime: 0,
            waitingTime: 0
        });
    }

    // Xử lý FCFS: Sắp xếp theo thời điểm đến
    if (type === 'fcfs') {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }
    // Xử lý SJF: Sắp xếp theo thời gian bùng nổ
    else if (type === 'sjf') {
        processes.sort((a, b) => a.burstTime - b.burstTime);
    }

    let currentTime = 0;

    // Tính toán thời gian hoàn thành, quay vòng và chờ đợi cho mỗi tiến trình
    processes.forEach((process) => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        process.completionTime = currentTime + process.burstTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
        currentTime = process.completionTime;
    });

    // Hiển thị biểu đồ Gantt và bảng tiến trình
    displayGanttChart(type, processes);
    displayProcessTable(type, processes);
}

// Hàm hiển thị biểu đồ Gantt
function displayGanttChart(type, processes) {
    const ganttChart = document.getElementById(type + 'GanttChart');
    ganttChart.innerHTML = '';
    let currentTime = 0;

    // Duyệt qua các tiến trình để tạo biểu đồ Gantt
    processes.forEach(process => {
        const ganttBar = document.createElement('div');
        ganttBar.classList.add('gantt-bar');
        ganttBar.style.width = `${process.burstTime * 20}px`; // Kích thước tỉ lệ với burst time
        ganttBar.textContent = process.id;

        const ganttTime = document.createElement('div');
        ganttTime.classList.add('gantt-time');
        ganttTime.textContent = currentTime;
        ganttChart.appendChild(ganttTime); // Thêm thời gian bắt đầu
        ganttChart.appendChild(ganttBar);  // Thêm tiến trình vào biểu đồ

        currentTime += process.burstTime;
    });

    const finalTime = document.createElement('div');
    finalTime.classList.add('gantt-time');
    finalTime.textContent = currentTime;
    ganttChart.appendChild(finalTime);
}

// Hàm hiển thị bảng tiến trình
function displayProcessTable(type, processes) {
    const tableBody = document.getElementById(type + 'Table');
    tableBody.innerHTML = '';

    // Duyệt qua các tiến trình và hiển thị thông tin trong bảng
    processes.forEach(process => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.completionTime}</td>
            <td>${process.turnaroundTime}</td>
            <td>${process.waitingTime}</td>
        `;
        tableBody.appendChild(row);
    });
}
