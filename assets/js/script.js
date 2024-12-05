// Bắt sự kiện khi submit form FCFS
document.getElementById('fcfsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    processForm('fcfs');
    processTimeTable('fcfs');
});

// Bắt sự kiện khi submit form SJF
document.getElementById('sjfForm').addEventListener('submit', function (e) {
    e.preventDefault();
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
            remainingTime: parseInt(burstTimes[i].value), // Thời gian còn lại
            completionTime: 0,
            turnaroundTime: 0,
            waitingTime: 0,
            isCompleted: false,
        });
    }

    let currentTime = 0;
    let completedProcesses = 0;
    const totalProcesses = processes.length;
    let totalWaitTime = 0;
    const executionOrder = [];
    const detailedTimeTable = [];

    while (completedProcesses < totalProcesses) {
        let shortestProcessIndex = -1;
        let minBurstTime = Infinity;

        // Tìm tiến trình có thời gian bùng nổ ngắn nhất đã sẵn sàng
        for (let i = 0; i < totalProcesses; i++) {
            if (
                processes[i].arrivalTime <= currentTime &&
                !processes[i].isCompleted &&
                processes[i].burstTime < minBurstTime
            ) {
                minBurstTime = processes[i].burstTime;
                shortestProcessIndex = i;
            }
        }

        if (shortestProcessIndex === -1) {
            // Không có tiến trình sẵn sàng, CPU nhàn rỗi
            // Ghi lại trạng thái CPU nhàn rỗi
            const row = { time: currentTime, processes: Array(totalProcesses).fill('') };
            detailedTimeTable.push(row);
            currentTime++;
            continue;
        }

        const process = processes[shortestProcessIndex];
        process.startTime = currentTime;
        executionOrder.push({
            id: process.id,
            startTime: process.startTime,
            endTime: process.startTime + process.burstTime
        });

        // Tiến trình chạy trong thời gian burstTime
        for (let t = 0; t < process.burstTime; t++) {
            const row = { time: currentTime, processes: Array(totalProcesses).fill('') };

            // Giảm thời gian còn lại của tiến trình đang chạy
            process.remainingTime--;

            // Ghi lại trạng thái của tất cả các tiến trình
            for (let i = 0; i < totalProcesses; i++) {
                if (processes[i].arrivalTime <= currentTime && !processes[i].isCompleted) {
                    if (i === shortestProcessIndex) {
                        // Tiến trình đang chạy
                        row.processes[i] = `<td style="background-color: yellow;">${process.remainingTime}</td>`;
                    } else {
                        // Tiến trình đang chờ
                        row.processes[i] = `${processes[i].remainingTime}`;
                    }
                }
            }

            detailedTimeTable.push(row);
            currentTime++;
        }

        // Cập nhật thông tin tiến trình sau khi hoàn thành
        process.endTime = currentTime;
        process.completionTime = process.endTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
        totalWaitTime += process.waitingTime;
        process.isCompleted = true;
        completedProcesses++;
    }

    // Tính thời gian chờ trung bình
    let avgWaitTime = totalWaitTime / totalProcesses;
    document.getElementById('sjfAvgWaitTime').innerText = `Thời gian chờ trung bình: ${avgWaitTime.toFixed(2)} ms`;

    // Hiển thị bảng tiến trình
    displayProcessTable('sjf', processes);

    // Hiển thị biểu đồ Gantt sử dụng danh sách thực thi
    displayGanttChart('sjf', executionOrder);

    // Hiển thị bảng thời gian chạy chi tiết
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
        let rowHTML = `<td>${row.time}</td>`;

        row.processes.forEach(cell => {
            if (cell.includes('background-color')) {
                rowHTML += cell; // Ô được highlight
            } else if (cell !== '') {
                rowHTML += `<td>${cell}</td>`;
            } else {
                rowHTML += `<td></td>`;
            }
        });

        rowElement.innerHTML = rowHTML;
        table.appendChild(rowElement);
    });
}

// Hàm xử lý form để tính toán các giá trị liên quan đến tiến trình
function processForm(type) {
    if (type !== 'fcfs') {
        return; // Chỉ xử lý cho FCFS
    }

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
            waitingTime: 0,
            startTime: 0,
            endTime: 0
        });
    }

    // Xử lý FCFS: Sắp xếp theo thời điểm đến
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    let currentTime = 0;
    let totalWaitTime = 0;
    const executionOrder = []; // Danh sách lưu trữ thứ tự thực thi

    // Tính toán thời gian hoàn thành, quay vòng và chờ đợi cho mỗi tiến trình
    processes.forEach((process) => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }

        process.startTime = currentTime;
        currentTime += process.burstTime;
        process.endTime = currentTime;

        process.completionTime = process.endTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.startTime - process.arrivalTime;
        totalWaitTime += process.waitingTime; // Cộng thời gian chờ của từng tiến trình

        // Thêm tiến trình vào danh sách thực thi
        executionOrder.push({
            id: process.id,
            startTime: process.startTime,
            endTime: process.endTime
        });
    });

    // Tính toán thời gian chờ trung bình
    let avgWaitTime = totalWaitTime / processes.length;

    // Hiển thị thời gian chờ trung bình
    document.getElementById('fcfsAvgWaitTime').innerText = `Thời gian chờ trung bình: ${avgWaitTime.toFixed(2)} ms`;

    // Hiển thị biểu đồ Gantt và bảng tiến trình
    displayGanttChart(type, executionOrder);
    displayProcessTable(type, processes);
}

// Hàm hiển thị biểu đồ Gantt
function displayGanttChart(type, executionOrder) {
    const ganttChart = document.getElementById(type + 'GanttChart');
    ganttChart.innerHTML = '';

    // Duyệt qua danh sách thực thi để tạo biểu đồ Gantt
    executionOrder.forEach(item => {
        const ganttBar = document.createElement('div');
        ganttBar.classList.add('gantt-bar');
        ganttBar.style.width = `${(item.endTime - item.startTime) * 20}px`;
        ganttBar.textContent = item.id;

        const ganttTime = document.createElement('div');
        ganttTime.classList.add('gantt-time');
        ganttTime.textContent = item.startTime;
        ganttChart.appendChild(ganttTime); // Thêm thời gian bắt đầu
        ganttChart.appendChild(ganttBar);  // Thêm tiến trình vào biểu đồ
    });

    // Thêm thời gian kết thúc cuối cùng
    if (executionOrder.length > 0) {
        const finalTime = document.createElement('div');
        finalTime.classList.add('gantt-time');
        finalTime.textContent = executionOrder[executionOrder.length - 1].endTime;
        ganttChart.appendChild(finalTime);
    }
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