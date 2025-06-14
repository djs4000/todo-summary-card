class MyTodoCard extends HTMLElement {

  setConfig(config) {
    this.config = config;
    if (!config.entities) {
      throw new Error("You need to define todo entities");
    }
  }

  async set hass(hass) {
    if (!this.content) {
      this.innerHTML = `<ha-card header="${this.config.title || 'My Todo Lists'}">
        <div class="card-content">Loading...</div>
      </ha-card>`;
      this.content = this.querySelector('.card-content');
    }

    const entities = this.config.entities;

    try {
      const promises = entities.map(async (entity) => {
        const response = await hass.callWS({
          type: "call_service",
          domain: "todo",
          service: "get_items",
          target: { entity_id: entity }
		  return_response: true  // <-- explicitly required
        });
        return { entity, response };
      });

      const results = await Promise.all(promises);

      let html = '';
      results.forEach(({ entity, response }) => {
        html += `<b>${entity.replace('todo.', '')}</b><ul>`;
        response.items.forEach(item => {
          html += `<li>${item.summary}</li>`;
        });
        html += '</ul>';
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
