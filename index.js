const API_URL = "https://script.google.com/macros/s/AKfycbxAAJxPNDKmZalaw7KiP0eIFpHRmGySIaqtKPED_S8EEL9Xdv-PiTmQZOSc88TglRsa/exec";
let allTasks = [];

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

async function loadTasks() {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "get" })
    });
    allTasks = await res.json();
    renderTasks();
}

function renderTasks() {
    const filterVal = document.getElementById("filterPlatform").value;
    const sortVal = document.getElementById("sortDeadline").value;
    let tasks = [...allTasks];

    if (filterVal !== "all") {
        tasks = tasks.filter(t => t.platform === filterVal);
    }

    tasks.sort((a, b) => {
        const da = new Date(a.deadline);
        const db = new Date(b.deadline);
        return sortVal === "asc" ? da - db : db - da;
    });

    const list = document.getElementById("taskList");
    list.innerHTML = "";
    tasks.forEach(t => {
        const div = document.createElement("div");
        let platformClass = "platform-lain";
        if (t.platform === "Ethol") platformClass = "platform-ethol";
        else if (t.platform === "Classroom") platformClass = "platform-classroom";

        div.className = `task-card ${platformClass}`;
        div.innerHTML = `
          <div class="task-info">
            <div class="task-title">${t.matkul} (${t.platform})</div>
            <div class="deadline">Deadline: ${formatDate(t.deadline)}</div>
          </div>
          <button class="delete-btn" onclick="deleteTask(${t.id})">Hapus</button>
        `;
        list.appendChild(div);
    });
}

async function deleteTask(id) {
    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: id })
    });
    loadTasks();
}

document.getElementById("taskForm").addEventListener("submit", async e => {
    e.preventDefault();
    const matkul = document.getElementById("taskMatkul").value;
    const platform = document.getElementById("taskPlatform").value;
    const deadline = document.getElementById("taskDeadline").value;

    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "add",
            matkul: matkul,
            platform: platform,
            deadline: deadline
        })
    });

    e.target.reset();
    loadTasks();
});

document.getElementById("filterPlatform").addEventListener("change", renderTasks);
document.getElementById("sortDeadline").addEventListener("change", renderTasks);

loadTasks();