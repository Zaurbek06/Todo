const addListElement = document.querySelector(".todo__sidebar-addlist");
const formElement = document.querySelector(".todo__sidebar-form");
const closeFormElement = document.querySelector(".todo__sidebar-form-close");

const colorsElement = document.querySelector(".todo__sidebar-form-colors");
const listsElement = document.querySelector(".todo__sidebar-lists");

const addListInput = document.querySelector(".todo__sidebar-form-input");
const addListBtn = document.querySelector(".todo__sidebar-form-btn");
const mainElement = document.querySelector(".todo__main");
// const tasksElement = document.querySelector(".todo__main-tasks");
const allTasksElement = document.querySelector(".todo__sidebar-alltasks");

const state = {
  colors: [],
  lists: [],
  selectedColorId: null,
  addListValue: "",
};

addListElement.addEventListener("click", function () {
  formElement.classList.toggle("active");
  state.selectedColorId = 1;
  state.addListValue = "";
});

closeFormElement.addEventListener("click", function () {
  formElement.classList.remove("active");
});

addListInput.addEventListener("change", function (e) {
  state.addListValue = e.target.value;
});

addListBtn.addEventListener("click", function () {
  addList();
});

allTasksElement.addEventListener("click", async function () {
  mainElement.innerHTML = null;
  allTasksElement.classList.add("active");
  const activeList = document.querySelector(".todo__sidebar-list_active");
  if (activeList) {
    activeList.classList.remove("todo__sidebar-list_active");
  }
  const { data } = await axios.get(
    "http://localhost:3001/lists/?_expand=color&_embed=tasks"
  );
  data.forEach((item) => {
    const mainTitle = document.createElement("h2");
    const tasksElement = document.createElement("div");
    item.tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      const taskElementCheckbox = document.createElement("div");
      const taskElementName = document.createElement("div");

      taskElement.classList.add("todo__main-task");
      taskElementCheckbox.classList.add("todo__main-task-checkbox");
      taskElementName.classList.add("todo__main-task-name");

      taskElementName.textContent = task.text;

      taskElement.appendChild(taskElementCheckbox);
      taskElement.appendChild(taskElementName);

      tasksElement.appendChild(taskElement);
    });

    mainTitle.textContent = item.name;
    mainTitle.style.color = item.color.hex;

    mainTitle.classList.add("todo__main-title");
    tasksElement.classList.add("todo__main-tasks");

    mainElement.appendChild(mainTitle);
    mainElement.appendChild(tasksElement);
  });
});

async function addList() {
  if (!state.addListValue.length || state.selectedColorId === null) {
    alert("Введите значение и выберите цвет");
    return;
  }

  const color = await axios.get(
    `http://localhost:3001/colors/${state.selectedColorId}`
  );

  const listElement = document.createElement("div");
  const listElementColor = document.createElement("div");
  const listElementTitle = document.createElement("div");

  listElement.classList.add("todo__sidebar-list");
  listElementColor.classList.add("todo__sidebar-list-color");
  listElementTitle.classList.add("todo__sidebar-list-title");

  listElementTitle.textContent = state.addListValue;
  listElementColor.style.backgroundColor = color.data.hex;

  listElement.appendChild(listElementColor);
  listElement.appendChild(listElementTitle);
  listsElement.appendChild(listElement);

  axios.post("http://localhost:3001/lists", {
    name: state.addListValue,
    colorId: state.selectedColorId,
  });
  formElement.classList.remove("active");
}

function renderLists() {}

axios.get("http://localhost:3001/lists?_expand=color").then((res) => {
  state.lists = res.data;

  state.lists.forEach((list) => {
    const listElement = document.createElement("div");
    const listElementColor = document.createElement("div");
    const listElementTitle = document.createElement("div");
    const listElementDelete = document.createElement("img");
    const tasksElement = document.createElement("div");

    listElement.classList.add("todo__sidebar-list");
    listElement.id = list.id;
    listElementColor.classList.add("todo__sidebar-list-color");
    listElementTitle.classList.add("todo__sidebar-list-title");
    listElementDelete.classList.add("todo__sidebar-list-delete");

    listElementTitle.textContent = list.name;
    listElementColor.style.backgroundColor = list.color.hex;
    listElementDelete.src = "./assets/img/delete-list.svg";

    listElement.appendChild(listElementColor);
    listElement.appendChild(listElementTitle);
    listElement.appendChild(listElementDelete);
    listsElement.appendChild(listElement);

    listElement.addEventListener("click", async function () {
      mainElement.innerHTML = "";
      const activeList = document.querySelector(".todo__sidebar-list_active");
      if (activeList) {
        activeList.classList.remove("todo__sidebar-list_active");
      }
      listElement.classList.add("todo__sidebar-list_active");
      allTasksElement.classList.remove("active");

      const { data } = await axios.get(
        `http://localhost:3001/lists/${list.id}?_expand=color`
      );

      const mainTitle = document.createElement("h2");
      const taskElement = document.createElement("div");
      const taskElementCheckbox = document.createElement("div");
      const taskElementName = document.createElement("div");

      mainTitle.classList.add("todo__main-title");
      taskElement.classList.add("todo__main-task");
      taskElementCheckbox.classList.add("todo__main-task-checkbox");
      taskElementName.classList.add("todo__main-task-name");

      mainTitle.style.color = data.color.hex;

      mainTitle.textContent = data.name;
      taskElementName.textContent = "Изучить JS";

      taskElement.appendChild(taskElementCheckbox);
      taskElement.appendChild(taskElementName);
      tasksElement.appendChild(taskElement);
      mainElement.appendChild(mainTitle);
    });

    listElementDelete.addEventListener("click", async function () {
      const confirm = window.confirm("Вы действительно хотите удалить список?");
      const listById = document.getElementById(`${list.id}`);
      if (confirm) {
        listsElement.removeChild(listById);
        await axios.delete(`http://localhost:3001/lists/${list.id}`);
      }
    });
  });
});

axios.get("http://localhost:3001/colors").then((res) => {
  state.colors = res.data;
  state.colors.forEach((color) => {
    const colorElement = document.createElement("div");

    colorElement.classList.add("todo__sidebar-form-color");
    colorElement.style.backgroundColor = color.hex;
    colorsElement.appendChild(colorElement);

    colorElement.addEventListener("click", function () {
      state.selectedColorId = color.id;
      const activeColor = document.querySelector(
        ".todo__sidebar-form-color_active"
      );

      if (activeColor) {
        activeColor.classList.remove("todo__sidebar-form-color_active");
      }
      colorElement.classList.add("todo__sidebar-form-color_active");
    });
  });
});
