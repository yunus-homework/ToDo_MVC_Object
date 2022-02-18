"use strict";

//находит по Id, форме, берёт форму, собирает все инпуты

const view = {
  formId: "todoForm",
  todosContainerId: "todoItems",
  form: null,
  todoContainer: null,
  controller: null,
  removeAllBtn: null,

  // Создаем id текущего айтема, чтобы в следствии сделать его уникальным
  currentItemId: 0,

  getForm() {
    const form = document.getElementById(this.formId);
    form ? (this.form = form) : null;
  },

  // Создаем метод для поиска элемента внутрь которого нам нужно помещать
  // элементы TodoList
  getTodosContainer() {
    const container = document.getElementById(this.todosContainerId);
    container ? (this.todoContainer = container) : null;
  },

  getRemoveAllBtn() {
    this.removeAllBtn = this.form.querySelector(".remove-all");
  },

  setEvents() {
    this.form.addEventListener("submit", this.submitHandler.bind(this));

    document.addEventListener("DOMContentLoaded", this.prefillData.bind(this));

    // Вешаем событие на контейнер с элементами TodoList для того чтобы
    // отмечать завершенные TodoItems
    // Отслеживаем событие change так как оно будет всплывать к родителю
    this.todoContainer.addEventListener(
      "change",
      this.checkTodoItem.bind(this)
    );

    // Вешаем событие на контейнер с элементами TodoList для того чтобы
    // удалять элементы
    this.todoContainer.addEventListener("click", this.removeElement.bind(this));

    // Вешаем событие на кнопку удаления всех элементов
    this.removeAllBtn.addEventListener(
      "click",
      this.removerAllTodos.bind(this)
    );
  },

  prefillData() {
    const data = this.controller.getData(this.formId);
    if (!data || !data.length) return;

    // Устанавливаем id текущего item, как id последнего item если
    // они есть в localStorage
    this.currentItemId = data[data.length - 1].itemId;
    // заканчиваем

    const todoContainer = document.getElementById(this.todosContainerId);

    for (const item of data) {
      const template = this.createTemplate(item);
      todoContainer.prepend(template);
    }
  },

  submitHandler(event) {
    event.preventDefault();

    // Увеличиваем id текущего item чтобы он был уникальным
    this.currentItemId += 1;
    // заканчиваем

    let data = {
      id: this.formId,
      // Добавляем поля в объект который будет хранится в localStorage
      completed: false,
      itemId: this.currentItemId,
      // заканчиваем
      ...this.findInputsData(),
    };

    this.controller.setData(data);

    // Используем найденный ранее TodoContainer
    this.todoContainer.prepend(this.createTemplate(data));

    event.target.reset();
  },

  checkTodoItem({ target }) {
    const itemId = target.getAttribute("data-item-id");
    const status = target.checked;

    this.controller.changeCompleted(itemId, this.formId, status);
  },

  removeElement({ target }) {
    // Проверяем что нажали именно на кнопку удаления
    if (!target.classList.contains("delete-btn")) return;

    // Удаляем элемент из localStorage
    this.controller.removeItem(
      this.formId,
      target.getAttribute("data-item-id")
    );

    // Удаляем элемент из DOM
    // Функция findParentElByClass описана в файле app.js
    const todoItemContainer = findParentElByClass(target, "taskWrapper");

    // Удаляем колонку которая генерируется при создании элемента
    todoItemContainer.parentElement.remove();
  },

  removerAllTodos() {
    this.controller.removeAll(this.formId);
    this.todoContainer.innerHTML = "";
  },

  // находит данные и возвращает объект записанный в методе submitHandler
  findInputsData() {
    return Array.from(
      this.form.querySelectorAll("input[type=text], textarea")
    ).reduce((acc, item) => {
      acc[item.name] = item.value;
      return acc;
    }, {});
  },

  // создаём div, class, добавляем и вставляем, принимает данные
  createTemplate({ title, description, itemId, completed }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("col-4");

    let wrapInnerContent = '<div class="taskWrapper">';
    wrapInnerContent += `<div class="taskHeading">${title}</div>`;
    wrapInnerContent += `<div class="taskDescription">${description}</div>`;
    // Добавляем элемент checkbox в функцию генерации темплейта
    wrapInnerContent += `<hr>`;
    wrapInnerContent += `<label class="completed form-check">`;
    // Создаем внутри инпута кастовмный аттрибут в которы ложим id текущего todoItem
    wrapInnerContent += `<input data-item-id="${itemId}" type="checkbox" class="form-check-input" >`;
    wrapInnerContent += `<span>Завершено ?</span>`;
    wrapInnerContent += `</label>`;
    // Заканчиваем добавлять checkbox
    // Добавляем кнопку удаления и id текущего todoItem в качестве аттрибута
    wrapInnerContent += `<hr>`;
    wrapInnerContent += `<button class="btn btn-danger delete-btn" data-item-id="${itemId}">Удалить</button>`;
    // Заканчиваем с кнопкой удаления
    wrapInnerContent += "</div>";

    wrapper.innerHTML = wrapInnerContent;

    // Если задача была завершена отображаем это на элементе
    wrapper.querySelector("input[type=checkbox]").checked = completed;

    return wrapper;
  },

  init(controllerInstance) {
    this.getForm();

    // поиск контейнера
    this.getTodosContainer();

    // поиск кнопки удаления всех элементов
    this.getRemoveAllBtn();

    this.setEvents();
    this.controller = controllerInstance;
  },
};
