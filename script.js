/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
    this.onChange(this.items);
  }

  deleteItem(id) {
    const index = this.items.find(item => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.onChange(this.items);
    }
  }

  bindOnChange(callback) {
    this.onChange = callback;
  }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.balance = this.getElement('#balance');
    this.amountInput = this.getElement('#amount');
    this.descInput = this.getElement('#description');
    this.typeInput = this.getElement('#type');
    this.addButton = this.getElement('#add');
    this.itemsTable = this.getElement('#items');
  }

  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  }
}

/**
 * @class Controller
 *
 * Links the model and the view.
 *
 * @param model
 * @param view
 */
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
}

const app = new Controller(new Model(), new View());
