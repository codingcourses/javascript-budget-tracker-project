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

  get balance() {
    return this.item.reduce((acc, curr) => (
      acc + (curr.type === 'Income' ? curr.amount : -curr.amount
    )));
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

  bindAddItem(handler) {
    this.addButton.addEventListener('click', event => {
      if (!this.amountInput.value.length || !this.descInput.value.length) {
        return event.preventDefault();
      }

      const item = {
        amount: Number(this.amountInput.value),
        desc: this.descInput.value,
        type: this.typeInput.value,
      };

      handler(item);
    });
  }

  bindOnDelete(callback) {
    this.onDelete = callback;
  }

  bindAmountInputValidation(handler) {
    this.amountInput.addEventListener('keyup', () => {
      handler(amount);
    });
  }

  renderTable(items) {
    this.itemsTable.innerHTML = '';
    for (const item of items) {
      const row = document.createElement('tr');

      const colAmount = document.createElement('td');
      colAmount.textContent = item.amount;
      row.appendChild(colAmount);

      const colDesc = document.createElement('td');
      colDesc.textContent = item.desc;
      row.appendChild(colDesc);

      const colType = document.createElement('td');
      colType.textContent = item.type;
      row.appendChild(colType);

      const colDelete = document.createElement('td');
      const deleteButton = document.createElement('a');
      deleteButton.setAttribute('class', 'uk-icon-link');
      deleteButton.setAttribute('uk-icon', 'trash');
      deleteButton.addEventListener('click', () => {
        if (this.onDelete) {
          this.onDelete(item.id);
        }
      });
      colDelete.appendChild(deleteButton);
      row.appendChild(colDelete);

      this.itemsTable.appendChild(row);
    }
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

    this.model.bindOnChange(this.onItemsChange);

    this.view.bindAddItem(this.onAddItem);
    this.view.bindOnDelete(this.onDeleteItem);
    this.view.bindAmountInputValidation(this.validateAmountInput);
  }

  onItemsChange = items => {
    console.log(items);
    this.view.renderTable(items);
  }

  onAddItem = item => {
    this.model.addItem({
      id: generateID(),
      ...item,
    });
  };

  onDeleteItem = id => {
    this.model.deleteItem(id);
  };

  validateAmountInput = amount => {
    if (!isValidAmount(amount.value)) {
      amount.value = amount.value.slice(0, -1);
    }
  };
}

const app = new Controller(new Model(), new View());

function isValidAmount(num) {
  return isFinite(num) && /^\d+((\.\d{1,2})?$)|(\.$)/.test(num);
}

function generateID() {
  return Math.random().toString(36).substr(2, 9);
}
