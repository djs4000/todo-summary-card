lass MyTodoCard extends HTMLElement {

  setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("You need to define 'entities' as an array");
    }
    this.config = config;
    this._fetched = false;  // reset fetch flag when config changes
  }

  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `<ha-card header="${this.config.title || 'My Todo Lists'}">
        <div class="card-content">Loading...</div>
      </ha-card>`;
      this.content = this.querySelector('.card-content');
    }

    // Only fetch once per load
    if (!this._fetched) {
      this._fetched = true;
      this.fetchTodos(hass);
    }
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