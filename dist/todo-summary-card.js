class TodoSummaryCard extends HTMLElement {
set hass(hass) {
  const config = this._config;
  const lists = config.entities || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = [];

  lists.forEach(entityId => {
    console.log("Requesting items for:", entityId);
    hass.callService('todo', 'get_items', { entity_id: entityId });

    const entity = hass.states[entityId];
    console.log("Entity state:", entity);

    if (!entity || !entity.attributes || !Array.isArray(entity.attributes.items)) {
      console.warn("Skipping entity due to missing items:", entityId);
      return;
    }

    entity.attributes.items.forEach(task => {
      console.log("Evaluating task:", task);

      if (!task.due || task.status === 'completed') return;

      const dueDate = new Date(task.due);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate <= today) {
        console.log("Adding task:", task.summary);
        tasks.push({
          summary: task.summary,
          due: task.due,
          list: entityId
        });
      }
    });
  });

  console.log("Final task list:", tasks);

  this.innerHTML = `
    <ha-card header="🗂️ Tasks Due Today or Overdue">
      <div class="card-content">
        ${tasks.length === 0 ? '✅ All tasks are up to date!' : `
          <ul>
            ${tasks.map(t => `<li><strong>${t.summary}</strong> (from <code>${t.list}</code>, due: ${new Date(t.due).toLocaleDateString()})</li>`).join('')}
          </ul>
        `}
      </div>
    </ha-card>
  `;
}

  setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("You need to define an array of todo list entities.");
    }
    this._config = config;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('todo-summary-card', TodoSummaryCard);