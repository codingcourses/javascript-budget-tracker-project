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
    return this.items.reduce((acc, curr) => (
      acc + (curr.type === 'Income' ? curr.amount : -curr.amount
    )), 0);
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
    this.balanceSection = this.getElement('#section-balance');
    this.amountInput = this.getElement('#amount');
    this.descInput = this.getElement('#description');
    this.typeInput = this.getElement('#type');
    this.addButton = this.getElement('#add');
    this.itemsTable = this.getElement('#items-table');
    this.itemsTableBody = this.getElement('#items');
    this.emptyState = this.getElement('#empty-state');
  }

  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  }

  bindAddItem(handler) {
    this.addButton.addEventListener('click', event => {
      if (!this.amountInput.value.length || !this.descInput.value.length) {
        UIkit.notification({
          message: '<span uk-icon=\'icon: close\'></span> Incomplete item information.',
          status: 'danger',
          pos: 'top-left',
        });
        return event.preventDefault();
      }

      const item = {
        amount: Number(this.amountInput.value),
        desc: this.descInput.value,
        type: this.typeInput.value,
      };

      handler(item);

      UIkit.notification({
        message: '<span uk-icon=\'icon: check\'></span> Added new item!',
        status: 'success',
        pos: 'top-left',
      });
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

  updateView(items, balance) {
    // Update balance
    this.balance.textContent = formatBalance(balance);
    if (balance === 0) {
      this.balanceSection.style.backgroundColor = '#616161';
    } else if (balance > 0) {
      this.balanceSection.style.backgroundColor = '#388E3C';
    } else {
      this.balanceSection.style.backgroundColor = '#D32F2F';
    }

    // Display empty state
    if (!items.length) {
      this.emptyState.style.display = 'block';
      this.itemsTable.style.display = 'none';
      return;
    }

    // Update items table
    this.itemsTableBody.innerHTML = '';
    this.itemsTable.style.display = 'table';
    this.emptyState.style.display = 'none';

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
          UIkit.notification({
            message: '<span uk-icon=\'icon: trash\'></span> Deleted item!',
            status: 'primary',
            pos: 'top-left',
          });
        }
      });
      colDelete.appendChild(deleteButton);
      row.appendChild(colDelete);

      this.itemsTableBody.appendChild(row);
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

    // Initialize
    this.onItemsChange(this.model.items);
  }

  onItemsChange = items => {
    this.view.updateView(items, this.model.balance);
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

function formatBalance(balance) {
  return `${balance >= 0 ? '' : '-'}$${Math.abs(balance).toFixed(2)}`;
}
