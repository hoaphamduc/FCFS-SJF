// Bắt sự kiện khi submit form FCFS
document.getElementById('fcfsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    processForm('fcfs');
    processTimeTable('fcfs'); // Gọi thêm hàm hiển thị bảng thời gian chi tiết
});

// Bắt sự kiện khi submit form SJF
document.getElementById('sjfForm').addEventListener('submit', function (e) {
    e.preventDefault();
    processForm('sjf');
    processSJFNonPreemptive();
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

function processTimeTable(type) {
    const processes = [];
    const arrivalTimes = document.querySelectorAll(`#${type}Processes .arrivalTime`);
    const burstTimes = document.querySelectorAll(`#${type}Processes .burstTime`);

    for (let i = 0; i < arrivalTimes.length; i++) {
        processes.push({
            id: `P${i + 1}`,
            arrivalTime: parseInt(arrivalTimes[i].value),
            burstTime: parseInt(burstTimes[i].value),
            remainingBurstTime: parseInt(burstTimes[i].value) // Thời gian chạy còn lại
        });
    }

    // FCFS xử lý theo thời gian đến
    if (type === 'fcfs') {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }

    let currentTime = 0;
    const detailedTimeTable = [];
    let runningProcessIndex = -1;

    while (processes.some(p => p.remainingBurstTime > 0)) {
        const row = { time: currentTime, processes: Array(processes.length).fill('') };

        // Hiển thị burst time của tất cả các tiến trình nhưng không highlight
        processes.forEach((process, index) => {
            if (process.arrivalTime <= currentTime && process.remainingBurstTime > 0) {
                row.processes[index] = process.remainingBurstTime; // Hiển thị burst time nhưng không highlight
            }
        });

        // Tìm tiến trình đang chạy
        if (runningProcessIndex === -1 || processes[runningProcessIndex].remainingBurstTime === 0) {
            runningProcessIndex = processes.findIndex(
                process => process.arrivalTime <= currentTime && process.remainingBurstTime > 0
            );
        }

        // Chỉ highlight tiến trình đang thực sự chạy
        if (runningProcessIndex !== -1 && processes[runningProcessIndex].remainingBurstTime > 0) {
            row.processes[runningProcessIndex] = processes[runningProcessIndex].remainingBurstTime; // Hiển thị burst time
            processes[runningProcessIndex].remainingBurstTime--; // Giảm burst time
        }

        // Đảm bảo rằng chỉ có một ô được highlight
        row.processes = row.processes.map((p, index) => {
            if (index === runningProcessIndex) {
                return `<td style="background-color: yellow;">${p}</td>`;
            } else if (p !== '') {
                return `<td>${p}</td>`;
            } else {
                return `<td></td>`;
            }
        });

        detailedTimeTable.push(row);
        currentTime++;
    }

    // Gọi hàm hiển thị bảng thời gian chi tiết
    displayTimeTable(detailedTimeTable, processes);
}

// Hiển thị bảng thời gian chi tiết
function displayTimeTable(detailedTimeTable, processes) {
    const table = document.getElementById('timeTable');
    table.innerHTML = '';

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Thời gian</th>` + processes.map(p => `<th>${p.id}</th>`).join('');
    table.appendChild(headerRow);

    detailedTimeTable.forEach(row => {
        const rowElement = document.createElement('tr');
        rowElement.innerHTML = `<td>${row.time}</td>` + row.processes.join('');
        table.appendChild(rowElement);
    });
}

function processSJFNonPreemptive() {
    const processes = [];
    const arrivalTimes = document.querySelectorAll(`#sjfProcesses .arrivalTime`);
    const burstTimes = document.querySelectorAll(`#sjfProcesses .burstTime`);

    for (let i = 0; i < arrivalTimes.length; i++) {
        processes.push({
            id: `P${i + 1}`,
            arrivalTime: parseInt(arrivalTimes[i].value),
            burstTime: parseInt(burstTimes[i].value),
            remainingBurstTime: parseInt(burstTimes[i].value),
            isCompleted: false,
            completionTime: 0,
            startTime: -1,
        });
    }

    let currentTime = 0;
    let completedProcesses = 0;
    const totalProcesses = processes.length;
    const detailedTimeTable = [];

    while (completedProcesses < totalProcesses) {
        let shortestProcessIndex = -1;
        let minBurstTime = Infinity;

        for (let i = 0; i < totalProcesses; i++) {
            if (
                processes[i].arrivalTime <= currentTime &&
                !processes[i].isCompleted &&
                processes[i].remainingBurstTime > 0
            ) {
                if (processes[i].remainingBurstTime < minBurstTime) {
                    minBurstTime = processes[i].remainingBurstTime;
                    shortestProcessIndex = i;
                }
            }
        }

        if (shortestProcessIndex === -1) {
            currentTime++;
            continue;
        }

        const row = { time: currentTime, processes: Array(totalProcesses).fill('') };
        const runningProcess = processes[shortestProcessIndex];

        if (runningProcess.startTime === -1) {
            runningProcess.startTime = currentTime;
        }

        row.processes[shortestProcessIndex] = `<td style="background-color: yellow;">${runningProcess.remainingBurstTime}</td>`;
        runningProcess.remainingBurstTime--;

        if (runningProcess.remainingBurstTime === 0) {
            runningProcess.isCompleted = true;
            runningProcess.completionTime = currentTime + 1;
            completedProcesses++;
        }

        processes.forEach((process, index) => {
            if (process.arrivalTime <= currentTime && !process.isCompleted && row.processes[index] === '') {
                row.processes[index] = `<td>${process.remainingBurstTime}</td>`;
            }
        });

        detailedTimeTable.push(row);
        currentTime++;
    }

    displayTimeTableForSJF(detailedTimeTable, processes);
}

function displayTimeTableForSJF(detailedTimeTable, processes) {
    const table = document.getElementById('sjfTimeTable');
    table.innerHTML = '';

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Thời gian</th>` + processes.map(p => `<th>${p.id}</th>`).join('');
    table.appendChild(headerRow);

    detailedTimeTable.forEach(row => {
        const rowElement = document.createElement('tr');
        rowElement.innerHTML = `<td>${row.time}</td>` + row.processes.join('');
        table.appendChild(rowElement);
    });
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

    let currentTime = processes[0].arrivalTime;
    let totalWaitTime = 0;

    // Tính toán thời gian hoàn thành, quay vòng và chờ đợi cho mỗi tiến trình
    processes.forEach((process) => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        process.completionTime = currentTime + process.burstTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
        totalWaitTime += process.waitingTime; // Cộng thời gian chờ của từng tiến trình
        currentTime = process.completionTime;
    });

    // Tính toán thời gian chờ trung bình
    let avgWaitTime = totalWaitTime / processes.length;

    // Hiển thị thời gian chờ trung bình
    if (type === 'fcfs') {
        document.getElementById('fcfsAvgWaitTime').innerText = `Thời gian chờ trung bình: ${avgWaitTime.toFixed(2)} ms`;
    } else if (type === 'sjf') {
        document.getElementById('sjfAvgWaitTime').innerText = `Thời gian chờ trung bình: ${avgWaitTime.toFixed(2)} ms`;
    }

    // Hiển thị biểu đồ Gantt và bảng tiến trình
    displayGanttChart(type, processes);
    displayProcessTable(type, processes);
}

// Hàm hiển thị biểu đồ Gantt
function displayGanttChart(type, processes) {
    const ganttChart = document.getElementById(type + 'GanttChart');
    ganttChart.innerHTML = '';
    let currentTime = processes[0].arrivalTime; // Start Gantt chart from first arrival time

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
