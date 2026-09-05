let students = [];
const modal = document.getElementById("studentModal");
const form = document.getElementById("student-form");
const searchInput = document.getElementById("searchInput");

async function loadStudents() {
  const response = await fetch("/api/students");
  students = await response.json();
  render();
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(s =>
    `${s.name} ${s.roll_no} ${s.course}`.toLowerCase().includes(query)
  );

  document.getElementById("studentTable").innerHTML = filtered.map(s => `
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.roll_no)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td><span class="cgpa-badge">${Number(s.cgpa).toFixed(2)}</span></td>
      <td>
        <div class="actions">
          <button class="action-btn" onclick="editStudent(${s.id})">Edit</button>
          <button class="action-btn delete" onclick="deleteStudent(${s.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  document.getElementById("emptyState").style.display = filtered.length ? "none" : "block";
  document.getElementById("totalStudents").textContent = students.length;

  const avg = students.length ? students.reduce((sum, s) => sum + Number(s.cgpa), 0) / students.length : 0;
  const high = students.length ? Math.max(...students.map(s => Number(s.cgpa))) : 0;
  document.getElementById("averageCgpa").textContent = avg.toFixed(2);
  document.getElementById("highestCgpa").textContent = high.toFixed(2);
}

function openAddForm() {
  form.reset();
  document.getElementById("studentId").value = "";
  document.getElementById("formTitle").textContent = "Add Student";
  modal.classList.add("show");
  document.getElementById("name").focus();
}

function closeForm() { modal.classList.remove("show"); }

function editStudent(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  document.getElementById("studentId").value = s.id;
  document.getElementById("name").value = s.name;
  document.getElementById("rollNo").value = s.roll_no;
  document.getElementById("course").value = s.course;
  document.getElementById("cgpa").value = s.cgpa;
  document.getElementById("formTitle").textContent = "Edit Student";
  modal.classList.add("show");
}

async function deleteStudent(id) {
  const s = students.find(x => x.id === id);
  if (!s || !confirm(`Delete ${s.name}?`)) return;

  const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
  const data = await response.json();
  if (!response.ok) return showToast(data.error || "Delete failed.");
  showToast("Student deleted.");
  loadStudents();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("studentId").value;
  const payload = {
    name: document.getElementById("name").value,
    roll_no: document.getElementById("rollNo").value,
    course: document.getElementById("course").value,
    cgpa: document.getElementById("cgpa").value
  };

  const response = await fetch(id ? `/api/students/${id}` : "/api/students", {
    method: id ? "PUT" : "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!response.ok) return showToast(data.error || "Something went wrong.");
  closeForm();
  showToast(id ? "Student updated." : "Student added.");
  loadStudents();
});

searchInput.addEventListener("input", render);
modal.addEventListener("click", e => { if (e.target === modal) closeForm(); });

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

loadStudents();
