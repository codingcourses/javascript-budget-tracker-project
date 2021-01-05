class Model {
  #data;
  #onChange;

  constructor() {
    // { id, amount, desc, type, dateAdded }
    this.#data = localStorage.getItem(LOCAL_STORAGE_KEY)
      ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
      : [];
    this.#onChange = () => {};
  }

  addItem(item) {
    this.#data.push({
      id: uuidv4(),
      dateAdded: Date.now(),
      ...item,
    });
    this.#onChange(this.#data);
  }

  deleteItem(id) {
    const index = this.#data.find(item => item.id === id);
    if (index === -1) {
      return;
    }
    this.#data.splice(index, 1);
    this.#onChange(this.#data);
  }

  save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#data));
  }

  bindOnChange(handler) {
    this.#onChange = handler;
  }

  get balance() {
    return this.#data.reduce((acc, curr) => (
      acc + (curr.type === 'Income' ? curr.amount : -curr.amount)
    ), 0);
  }

  initialize() {
    this.#onChange(this.#data);
  }
}

class View {
  #balance;
  #sectionBalance;
  #amountInput;
  #descInput;
  #typeInput;
  #addButton;
  #itemsTable;
  #itemsTableBody;
  #emptyState;
  #onDelete;

  constructor() {
    this.#balance = View.getElement('#balance');
    this.#sectionBalance = View.getElement('#section-balance');
    this.#amountInput = View.getElement('#amount');
    this.#descInput = View.getElement('#description');
    this.#typeInput = View.getElement('#type');
    this.#addButton = View.getElement('#add');
    this.#itemsTable = View.getElement('#items-table');
    this.#itemsTableBody = View.getElement('#items');
    this.#emptyState = View.getElement('#empty-state');
    this.#onDelete = () => {};

    this.handleAmountValidation();
  }

  static getElement(selector) {
    const elem = document.querySelector(selector);
    return elem;
  }

  bindAddItem(handler) {
    this.#addButton.addEventListener('click', () => {
      if (!this.#amountInput.value || !this.#descInput.value || !this.#typeInput.value) {
        UIkit.notification({
          message: '<span uk-icon="icon: close"></span> Incomplete item information.',
          status: 'warning',
          pos: 'top-left',
          timeout: 2000,
        });
        return;
      }

      const item = {
        amount: Number(this.#amountInput.value) * 100,
        desc: this.#descInput.value,
        type: this.#typeInput.value,
      };

      handler(item);

      this.#amountInput.value = '';
      this.#descInput.value = '';
      this.#typeInput.selectedIndex = 0;

      UIkit.notification({
        message: '<span uk-icon="icon: check"></span> Added new item!',
        status: 'success',
        pos: 'top-left',
        timeout: 2000,
      });
    });
  }

  updateBalance(balance) {
    this.#balance.textContent = formatMoney(balance);
    if (balance > 0) {
      this.#sectionBalance.style.background = 'linear-gradient(to bottom right, #1b5e20, #81c784)';
    } else if (balance < 0) {
      this.#sectionBalance.style.background = 'linear-gradient(to bottom right, #b71c1c, #e57373)';
    } else {
      this.#sectionBalance.style.background = 'linear-gradient(to bottom right, #263238, #78909c)';
    }
  }

  updateItems(items) {
    if (!items.length) {
      this.#emptyState.style.display = 'block';
      this.#itemsTable.style.display = 'none';
      return;
    }

    this.#emptyState.style.display = 'none';
    this.#itemsTable.style.display = 'table';

    this.#itemsTableBody.innerHTML = '';

    for (const item of items) {
      const row = document.createElement('tr');

      const colAmount = document.createElement('td');
      colAmount.textContent = formatMoney(item.amount);

      const colDesc = document.createElement('td');
      colDesc.textContent = item.desc;

      const colDateAdded = document.createElement('td');
      colDateAdded.textContent = formatDate(item.dateAdded);

      const colType = document.createElement('td');
      colType.textContent = item.type;

      const colDelete = document.createElement('td');
      colDelete.setAttribute('class', 'col-delete');

      const deleteButton = document.createElement('span');
      deleteButton.setAttribute('class', 'uk-icon-link');
      deleteButton.setAttribute('uk-icon', 'trash');
      deleteButton.addEventListener('click', () => {
        if (this.#onDelete) {
          this.#onDelete(item.id);
          UIkit.notification({
            message: '<span uk-icon="icon: trash"></span> Deleted item!',
            status: 'danger',
            pos: 'top-left',
            timeout: 2000,
          });
        }
      });

      colDelete.append(deleteButton);
      row.append(colAmount, colDesc, colDateAdded, colType, colDelete);
      this.#itemsTableBody.append(row);
    }
  }

  bindOnDelete(handler) {
    this.#onDelete = handler;
  }

  handleAmountValidation() {
    this.#amountInput.addEventListener('keyup', event => {
      if (!isValidAmount(event.target.value)) {
        event.target.value = event.target.value.slice(0, -1);
      }
    });
  }
}

class Controller {
  #model;
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;

    this.#view.bindAddItem(this.onAddItem);
    this.#view.bindOnDelete(this.onDeleteItem);

    this.#model.bindOnChange(this.onItemsChange);

    // Initialize
    this.#model.initialize();
  }

  onAddItem = item => {
    this.#model.addItem(item);
  };

  onItemsChange = items => {
    this.#view.updateItems(items);
    this.#view.updateBalance(this.#model.balance);
    this.#model.save();
  };

  onDeleteItem = id => this.#model.deleteItem(id);
}

const LOCAL_STORAGE_KEY = 'BudgetTrackerProject';

const app = new Controller(new Model(), new View());

function formatMoney(amount) {
  return `${amount < 0 ? '-' : ''}$${Math.abs(amount / 100).toFixed(2)}`;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function isValidAmount(amountString) {
  return isFinite(amountString) && /^\d+((\.\d{1,2})?$)|(\.$)/.test(amountString);
}
