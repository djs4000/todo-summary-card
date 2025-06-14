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
    const entities = this.config.entities;

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
        return { entity, items };
      });

      const results = await Promise.all(promises);

      let html = '';
      results.forEach(({ entity, items }) => {
        if (items.length) {
          html += `<b>${entity.replace('todo.', '')}</b><ul>`;
          items.forEach(item => {
            html += `<li>${item.summary}</li>`;
          });
          html += '</ul>';
        } else {
          html += `<b>${entity.replace('todo.', '')}</b>: No items found.<br>`;
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
}

customElements.define('my-todo-card', MyTodoCard);
