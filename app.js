class Task {
  constructor(title, id) {
    this.title = title;
    this.id = id;
    this.complete = false;
  }
}

class userInterface {
  static showTasks() {
    const tasks = Store.fetchTasks().reverse();
    const taskCount = document.querySelector("[data-task-count]");
    userInterface.renderBadgeCount(tasks);

    tasks.forEach((task) => {
      userInterface.addNewTaskToList(task);
    });
    taskCount.textContent = tasks.filter((task) => {
      return !task.complete;
    }).length;
  }

  static addNewTaskToList(task) {
    if (task.title) {
      const tasksContainer = document.querySelector("[data-tasks-container]");
      const fragment = document.createDocumentFragment();
      const taskDiv = document.createElement("div");
      if (task.complete === true) {
        taskDiv.className = "tasks-child task-child-complete";
        taskDiv.innerHTML = `
        <div class="task-body" draggable="true">
         <div class="task-description-body">
             <h3 class="task-description task-complete-color">${task.title}</h3>
             <div class="horizontal-line task-complete"></div>
          </div>
  
        </div>
         <div class="task-button">
            <button class="delete task-complete-color" draggable="true">X</button>
         </div>
        `;
        fragment.append(taskDiv);
      } else {
        taskDiv.className = "tasks-child";
        taskDiv.innerHTML = `
      <div class="task-body" draggable="true">
       <div class="task-description-body">
           <h3 class="task-description">${task.title}</h3>
           <div class="horizontal-line"></div>
        </div>

      </div>
       <div class="task-button">
          <button class="delete" draggable="true">X</button>
       </div>
      `;
        fragment.append(taskDiv);
      }
      tasksContainer.append(fragment);
    }
  }

  static clearInput() {
    document.querySelector("[data-task]").value = "";
  }

  static updateCompleteTaskStatus(title) {
    title.classList.toggle("task-complete-color");
    title.nextElementSibling.classList.toggle("task-complete");
    title.parentElement.parentElement.parentElement.classList.toggle(
      "task-child-complete"
    );
  }

  static renderBadgeCount(tasks) {
    const completeTasksBadge = document.querySelector(
      "[data-complete-tasks-badge]"
    );

    const completeTasks = tasks.filter((task) => {
      return task.complete;
    }).length;
    if (completeTasks >= 1) {
      completeTasksBadge.textContent = completeTasks;
    } else {
      completeTasksBadge.style.display = "none";
    }
  }

  static updateBadgeCount(tasks) {
    const completeTasksBadge = document.querySelector(
      "[data-complete-tasks-badge]"
    );

    const completeTasks = [];
    tasks.forEach((task) => {
      if (task.classList.contains("task-child-complete")) {
        completeTasks.push(task);
      }
    });

    if (completeTasks.length >= 1) {
      completeTasksBadge.style.display = "grid";
      completeTasksBadge.textContent = completeTasks.length;
    } else {
      completeTasksBadge.style.display = "none";
    }
  }

  static resetBadgeCount() {
    const completeTasksBadge = document.querySelector(
      "[data-complete-tasks-badge]"
    );

    completeTasksBadge.textContent = "";
    completeTasksBadge.style.display = "none";
  }

  static updateTaskCount(tasks) {
    const incompleteTasks = [];
    tasks.forEach((task) => {
      if (!task.classList.contains("task-child-complete")) {
        incompleteTasks.push(task);
      }
    });

    const taskCount = document.querySelector("[data-task-count]");
    taskCount.textContent = incompleteTasks.length;
    userInterface.updateBadgeCount(tasks);
  }

  static removeTask(target) {
    const tasks = Store.fetchTasks();
    if (target.classList.contains("delete")) {
      target.parentElement.parentElement.remove();
      document.querySelector("[data-task-count]").textContent =
        tasks.length - 1;
    }
  }

  static clearAllCompletedTasks(tasks) {
    let completeTasksMonitor = 0;
    tasks.forEach((task) => {
      if (task.classList.contains("task-child-complete")) {
        completeTasksMonitor++;
        task.remove();
        Store.deleteTaskFromLocalStorage(
          task.children[0].children[0].children[0].textContent
        );
      }
    });
    if (completeTasksMonitor) {
      const taskPrefix = completeTasksMonitor === 1 ? "task" : "tasks";
      userInterface.showALertMessage(
        `Congratulations! You have completed  ${completeTasksMonitor} ${taskPrefix} .`,
        "removed"
      );
    }
    userInterface.resetBadgeCount();
  }

  static showALertMessage(message, className) {
    const newDiv = document.createElement("div");
    newDiv.className = `alert ${className}`;
    newDiv.appendChild(document.createTextNode(message));
    const container = document.querySelector(".container");
    const inputForm = document.querySelector(".task-input");
    container.insertBefore(newDiv, inputForm);

    setTimeout(() => {
      document.querySelector(".alert").remove();
    }, 3000);
  }
}

class Store {
  static fetchTasks() {
    let tasks;
    if (localStorage.getItem("tasks") === null) {
      tasks = [];
    } else {
      tasks = JSON.parse(localStorage.getItem("tasks"));
    }
    return tasks;
  }

  static toggleComplete(title) {
    const tasks = Store.fetchTasks();
    tasks.forEach((task) => {
      if (task.title === title.innerText) {
        task.complete = task.complete === true ? false : true;
        userInterface.updateCompleteTaskStatus(title);
      }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  static addTaskToLocalStorage(task) {
    if (task.title !== "") {
      const tasks = Store.fetchTasks();
      tasks.push(task);
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }

  static deleteTaskFromLocalStorage(title) {
    const tasks = Store.fetchTasks();
    tasks.forEach((task, index) => {
      if (task.title === title) {
        tasks.splice(index, 1);
      }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

//SHOW TASKS

document.addEventListener("DOMContentLoaded", userInterface.showTasks());
const addTaskButton = document.querySelector("[data-add-task]");
const inputForm = document.querySelector("[data-form]");

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // get dom values
  const title = document.querySelector("[data-task]").value;
  //create an instance of a Task using the Task class.
  const task = new Task(title, Date.now().toString());

  //add the task to the DOM and localStorage.
  if (task.title !== "") {
    userInterface.addNewTaskToList(task);
    Store.addTaskToLocalStorage(task);
    userInterface.showALertMessage(
      `'${title}' has been sucessfully added to the to-do list.`,
      "successful"
    );
    userInterface.clearInput();
  }
});

//EVENT 3: REMOVE TASK
document.querySelector(".tasks").addEventListener("click", (e) => {
  if (e.target.classList.contains("task-description")) {
    Store.toggleComplete(e.target);
    const allTasks = document.querySelectorAll(".tasks-child");
    userInterface.updateTaskCount(allTasks);
  }

  if (
    e.target.classList.contains("delete") &&
    e.target.parentElement.previousElementSibling.children[0].children[1].classList.contains(
      "task-complete"
    )
  ) {
    const completeTasksBadge = document.querySelector(
      "[data-complete-tasks-badge]"
    );

    const taskTitle =
      e.target.parentElement.previousElementSibling.children[0].children[0]
        .textContent;
    userInterface.removeTask(e.target);
    Store.deleteTaskFromLocalStorage(taskTitle);
    userInterface.showALertMessage(
      `Congratulations! You have completed the task, '${taskTitle}'.`,
      "removed"
    );

    if (parseInt(completeTasksBadge.textContent) === 1) {
      completeTasksBadge.textContent =
        parseInt(completeTasksBadge.textContent) - 1;
      completeTasksBadge.style.display = "none";
    } else {
      completeTasksBadge.textContent =
        parseInt(completeTasksBadge.textContent) - 1;
    }
  }
});

const clearCompletedTasks = document.querySelector(
  "[data-clear-completed-tasks]"
);

clearCompletedTasks.addEventListener("click", () => {
  const allTasks = document.querySelectorAll(".tasks-child");
  userInterface.clearAllCompletedTasks(allTasks);
});
