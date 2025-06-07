class TodoSummaryCard extends HTMLElement {
  setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("You need to define an array of todo list entities.");
    }
    this._config = config;
  }

  set hass(hass) {
    if (!this._hasRendered) {
      this._hasRendered = true;
      this.refreshTasks(hass);
    }
  }

  async refreshTasks(hass) {
    const lists = this._config.entities || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = [];

    for (const entityId of lists) {
      console.log("Calling get_items for", entityId);
      try {
        await hass.callService('todo', 'get_items', {
          entity_id: entityId,
          return_response: true
        });
      } catch (e) {
        console.warn("Service call failed for", entityId, e);
      }
    }

    // Wait for Home Assistant to refresh state
    setTimeout(() => {
      lists.forEach(entityId => {
        const entity = hass.states[entityId];
        console.log("Checking entity state:", entityId, entity);

        if (!entity || !entity.attributes || !Array.isArray(entity.attributes.items)) return;

        entity.attributes.items.forEach(task => {
          if (!task.due || task.status === 'completed') return;

          const dueDate = new Date(task.due);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate <= today) {
            tasks.push({
              summary: task.summary,
              due: task.due,
              list: entityId
            });
          }
        });
      });

      this.render(tasks);
    }, 500);
  }

  render(tasks) {
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

  getCardSize() {
    return 3;
  }
}

customElements.define('todo-summary-card', TodoSummaryCard);
