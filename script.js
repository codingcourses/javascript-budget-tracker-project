/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
  constructor() {}
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {}
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
