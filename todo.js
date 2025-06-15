import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit-element@latest/+esm?module';

// Define a custom HTML element for the Lovelace card
class MyTodoCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._fetched = false;
    this._hass = null;
  }

  setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("You need to define 'entities' as an array");
    }
    this.config = config;
    this._fetched = false;
  }

  set hass(hass) {
    this._hass = hass;
  }

  connectedCallback() {
    if (!this._fetched && this._hass && this.config) {
      this._fetched = true;
      this.renderCardSkeleton();
      this.fetchTodos(this._hass);
    }
  }

  renderCardSkeleton() {
    this.shadowRoot.innerHTML = `
      <ha-card header="${this.config.title || 'My Todo Lists'}">
        <div class="card-content">Loading...</div>
      </ha-card>
    `;
    this.content = this.shadowRoot.querySelector('.card-content');
  }

  async fetchTodos(hass) {
    const { entities, show_completed, days_ahead } = this.config;
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + days_ahead - 1);

    try {
      const promises = entities.map(async (entity) => {
        const response = await hass.callWS({
          type: "call_service",
          domain: "todo",
          service: "get_items",
          target: { entity_id: entity },
          return_response: true
        });

        const items = response.response[entity]?.items || [];
        const filteredItems = items.filter(item => {
          if (!show_completed && item.status !== 'needs_action') return false;
          if (item.due) {
            const dueDate = new Date(item.due);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate <= maxDate;
          }
          return true;
        });

        return { entity, items: filteredItems };
      });

      const results = await Promise.all(promises);

      let html = '';
      results.forEach(({ entity, items }) => {
        const title = hass.states[entity]?.attributes.friendly_name || entity;
        if (items.length) {
          html += `<b>${title}</b><ul>`;
          items.forEach(item => {
            html += `<li>${item.summary}</li>`;
          });
          html += '</ul>';
        } else {
          html += `<b>${title}</b>: No items found.<br>`;
        }
      });

      this.content.innerHTML = html;

    } catch (error) {
      console.error("Error fetching todo items:", error);
      this.content.innerHTML = "Error loading todo lists.";
    }
  }

  getCardSize() {
    return 1;
  }

  static getConfigElement() {
    return document.createElement('my-todo-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'My Todo Lists',
      entities: ['todo.shopping_list'],
      show_completed: false,
      days_ahead: 1
    };
  }
}

customElements.define('my-todo-card', MyTodoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'my-todo-card',
  name: 'My Todo Card',
  preview: true,
  description: 'A custom card made by me!'
});

class MyTodoCardEditor extends LitElement {
  static properties = {
    hass: {},
    config: {},
  };

  setConfig(config) {
    this.config = config;
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
    const entities = this.config.entities || [];

    return html`
      <div class="card-config">
        <label>Title:</label><br />
        <input id="title" .value=${this.config.title || ''} /><br /><br />

        <label>Todo Entities:</label><br />
        ${entities.map(entity => html`
          <ha-entity-picker
            .hass=${this.hass}
            .value=${entity}
            .includeDomains=${['todo']}
            allow-custom
          ></ha-entity-picker>
        `)}
        <button @click=${this._addEntity}>Add Entity</button><br /><br />

        <label>Show Completed Items:
          <input type="checkbox" id="showCompleted" ?checked=${this.config.show_completed || false} />
        </label><br /><br />

        <label>Days Ahead to Show (1 = today only):</label><br />
        <input type="number" id="daysAhead" min="1" max="30" .value=${this.config.days_ahead || 1} />
      </div>
    `;
  }

  _addEntity() {
    const newEntities = [...(this.config.entities || []), 'todo.new_item'];
    this.setConfig({ ...this.config, entities: newEntities });
    window.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
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
  `;
}
customElements.define('my-todo-card-editor', MyTodoCardEditor);