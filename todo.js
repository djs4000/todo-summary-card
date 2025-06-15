// Removed bare module imports and switched to native browser-compatible approach

// Define a custom HTML element for the Lovelace card editor
class MyTodoCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  getConfig() {
    const entityPickers = this.shadowRoot.querySelectorAll("ha-entity-picker");
    const entities = Array.from(entityPickers).map(picker => picker.value).filter(Boolean);

    return {
      type: 'custom:my-todo-card',
      title: this.shadowRoot.getElementById('title').value,
      entities,
      show_completed: this.shadowRoot.getElementById('showCompleted').checked,
      days_ahead: parseInt(this.shadowRoot.getElementById('daysAhead').value) || 1,
    };
  }

  render() {
    const entities = this.config?.entities || [];
    const title = this.config?.title || '';
    const showCompleted = this.config?.show_completed || false;
    const daysAhead = this.config?.days_ahead || 1;

    this.shadowRoot.innerHTML = `
      <style>
        .card-config {
          padding: 12px;
        }
        ha-entity-picker {
          display: block;
          margin-bottom: 10px;
        }
        input {
          width: 100%;
          margin-top: 4px;
          margin-bottom: 10px;
        }
      </style>
      <div class="card-config">
        <label>Title:</label><br />
        <input id="title" value="${title}" /><br /><br />

        <label>Todo Entities:</label><br />
        ${entities.map(entity => `
          <ha-entity-picker
            hass=""
            value="${entity}"
            include-domains="todo"
            allow-custom
          ></ha-entity-picker>
        `).join('')}
        <button id="addEntity">Add Entity</button><br /><br />

        <label>Show Completed Items:
          <input type="checkbox" id="showCompleted" ${showCompleted ? 'checked' : ''} />
        </label><br /><br />

        <label>Days Ahead to Show (1 = today only):</label><br />
        <input type="number" id="daysAhead" min="1" max="30" value="${daysAhead}" />
      </div>
    `;

    this.shadowRoot.getElementById('addEntity')?.addEventListener('click', () => this._addEntity());
  }

  _addEntity() {
    const newEntities = [...(this.config?.entities || []), 'todo.new_item'];
    this.setConfig({ ...this.config, entities: newEntities });
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('my-todo-card-editor', MyTodoCardEditor);
