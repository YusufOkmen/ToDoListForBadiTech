document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");
    const emptyImage = document.querySelector(".emptyImg");
    const todosContainer = document.querySelector(".todosContainer");

    const goBackBtn = document.getElementById("goBackBtn");

    if (goBackBtn) {
        goBackBtn.addEventListener("click", () => {
            // This mimics the browser's "Back" button
            window.history.back();
        });
    }

    //Button variables for filtering the tasks
    const filterAllBtn = document.getElementById("filterAll");
    const filterActiveBtn = document.getElementById("filterActive");
    const filterCompletedBtn = document.getElementById("filterCompleted");

    // 1. Get the logged-in user from the session
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // 2. Security Check: If no user is found, kick them back to login
    if (!currentUser) {
        window.location.href = "login.html";
    }

    // 3. Create a unique "Key" for this specific user
    // Example result: "tasks_yusuf@gmail.com"
    const userTasksKey = `tasks_${currentUser.email}`;

    const toggleEmptyState = () => {
        // Makes empty image display and disappear
        emptyImage.style.display = taskList.children.length === 0 ? "block" : "none";
        // Controls the width of the todosContainer based on the listed tasks
    }

    const loadTaskFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem(userTasksKey)) || [];
        savedTasks.forEach(({ text, completed }) => addTask(text, completed));
        toggleEmptyState();
    }

    const saveTaskLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll("li")).map(li => ({
            text: li.querySelector("span").textContent,
            completed: li.querySelector(".checkbox").checked
        }))
        localStorage.setItem(userTasksKey, JSON.stringify(tasks));
    };

    const addTask = (text, completed = false) => {
        const taskText = text || taskInput.value.trim();
        if (!taskText) {
            return;
        }

        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${completed ? "checked" : " "}>
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
        const deleteBtn = li.querySelector(".deleteBtn");

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
            saveTaskLocalStorage();
        })

        editBtn.addEventListener("click", () => {
            if (!checkbox.checked) {
                taskInput.value = li.querySelector("span").textContent;
                li.remove();
                saveTaskLocalStorage();
            }
        })

        deleteBtn.addEventListener("click", () => {
            li.remove();
            toggleEmptyState();
            saveTaskLocalStorage();
        });

        taskList.appendChild(li)
        taskInput.value = " ";
        toggleEmptyState();
        saveTaskLocalStorage();
    };

    addTaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        addTask();
    });

    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTask();
        }
    });

    loadTaskFromLocalStorage();

    //Filtering the tasks (All, Active and Completed)

    const filterTasks = (filterType, clickedButton) => {

        //Active filter highlighting
        //Grab all three buttons
        const allFilterButtons = document.querySelectorAll(".taskManagerButton");

        //Remove activeFilter class from every button
        allFilterButtons.forEach(btn => btn.classList.remove("activeFilter"));

        //Add activeFilter class only to recently clicked button
        clickedButton.classList.add("activeFilter");


        //Getting every tasks on the screen
        const allTasks = document.querySelectorAll(".todosContainer li");

        //Starting the loop
        allTasks.forEach(task => {
            //Asking if the task is completed
            const isCompleted = task.classList.contains("completed");

            //Loop Logic
            switch (filterType) {
                case "all":
                    task.style.display = "flex"; //Show every task
                    break;
                case "active":
                    if (isCompleted) {
                        task.style.display = "none"; //Hide completed tasks
                    } else {
                        task.style.display = "flex" //Show active tasks
                    }
                    break;
                case "completed":
                    if (isCompleted) {
                        task.style.display = "flex" //Show completed tasks
                    } else {
                        task.style.display = "none" //Hde active tasks
                    }
                    break;
            }
        });
    };

    if (filterAllBtn && filterActiveBtn && filterCompletedBtn) {
        filterAllBtn.addEventListener("click", () => filterTasks("all", filterAllBtn));
        filterActiveBtn.addEventListener("click", () => filterTasks("active", filterActiveBtn));
        filterCompletedBtn.addEventListener("click", () => filterTasks("completed", filterCompletedBtn));
    }


});

