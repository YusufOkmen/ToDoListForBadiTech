document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");
    const emptyImage = document.querySelector(".emptyImg");
    const todosContainer = document.querySelector(".todosContainer");

    const toggleEmptyState = () => {
        // Makes empty image display and disappear
        emptyImage.style.display = taskList.children.length === 0 ? "block" : "none";
        // Controls the width of the todosContainer based on the listed tasks
        todosContainer.style.width = taskList.children.length > 0 ? "100%" : "50%";
    }

    const addTask = (event) => {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (!taskText) {
            return;
        }

        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" class="checkbox">
            <span>${taskText}</span>
            <div class="taskButtons">
                <button class="editBtn">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="deleteBtn">
                    <i class="fa-solid fa-trash"></i>
                </button>
                
            </div>
        `;

        const checkbox = li.querySelector(".checkbox");
        const editBtn = li.querySelector(".editBtn");

        if (completed) {
            li.classList.add("completed");
            editBtn.disabled = true;
            editBtn.style.opacity = "0.5";
            editBtn.style.pointerEvents = "none";
        }

        checkbox.addEventListener("change", () => {
            const isChecked = checkbox.checked;
            li.classList.toggle("completed", isChecked)
            editBtn.disabled = isChecked;
            editBtn.style.opacity = isChecked ? "0.5" : "1";
            editBtn.style.pointerEvents = isChecked ? "none" : "auto";
        })

        editBtn.addEventListener("click", () => {
            if(!checkbox.checked) {
                taskInput.value = li.querySelector
                ("span").textContent;
                li.remove();
            }
        })

        const deleteBtn = li.querySelector(".deleteBtn");

        deleteBtn.addEventListener("click", () => {
            li.remove();
            toggleEmptyState();
        })

        taskList.appendChild(li)
        taskInput.value = " ";
        toggleEmptyState();
    };

    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            addTask(e);
        }
    })


})