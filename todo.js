class MyTodoCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `<ha-card header="My Todo Lists">
        <div class="card-content">
          Loading...
        </div>
      </ha-card>`;
      this.content = this.querySelector('.card-content');
    }

    const todoEntities = [
      "todo.shopping_list",
      "todo.home_stuff"
    ];

    Promise.all(todoEntities.map(entity => 
      hass.callWS({
        type: "call_service",
        domain: "todo",
        service: "get_items",
        target: { entity_id: entity },
		return_response: true
      }).then(response => ({ entity, response }))
    )).then(results => {
      let html = '';
      results.forEach(({entity, response}) => {
        html += `<b>${entity.replace('todo.', '')}</b><ul>`;
        response.items.forEach(item => {
          html += `<li>${item.summary}</li>`;
        });
        html += `</ul>`;
      });

      this.content.innerHTML = html;
    }).catch(err => {
      console.error(err);
      this.content.innerHTML = "Error loading todo lists.";
    });
  }

  setConfig(config) {}

  getCardSize() {
    return 1;
  }
}

customElements.define('my-todo-card', MyTodoCard);