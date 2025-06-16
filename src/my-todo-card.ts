// my-todo-card.ts
import { LitElement, html, css, property } from 'lit';
import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';

interface TodoCardConfig extends LovelaceCardConfig {
  title: string;
  entities: string[];
  show_completed: boolean;
  days_ahead: number;
}

class MyTodoCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() private config!: TodoCardConfig;
  private _fetched = false;
  private _content = '';

  static styles = css`
    ha-card {
      padding: 16px;
    }
  `;

  public setConfig(config: TodoCardConfig): void {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("You need to define 'entities' as an array");
    }
    this.config = config;
    this._fetched = false;
    this._content = 'Loading...';
    this.fetchTodos();
  }

  protected render() {
    return html`
      <ha-card header="${this.config.title || 'My Todo Lists'}">
        <div class="card-content">${html([this._content])}</div>
      </ha-card>
    `;
  }

  private async fetchTodos() {
    const { entities, show_completed, days_ahead } = this.config;
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + (days_ahead || 1) - 1);
    today.setHours(0, 0, 0, 0);

    try {
      const promises = entities.map(async (entity) => {
        const response = await this.hass.callWS({
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

      let htmlContent = '';
      results.forEach(({ entity, items }) => {
        const title = this.hass.states[entity]?.attributes.friendly_name || entity;
        if (items.length) {
          htmlContent += `<b>${title}</b><ul>`;
          items.forEach(item => {
            htmlContent += `<li>${item.summary}</li>`;
          });
          htmlContent += '</ul>';
        } else {
          htmlContent += `<b>${title}</b>: No items found.<br>`;
        }
      });

      this._content = htmlContent;
      this.requestUpdate();

    } catch (error) {
      console.error("Error fetching todo items:", error);
      this._content = "Error loading todo lists.";
      this.requestUpdate();
    }
  }

  public static getStubConfig(): TodoCardConfig {
    return {
      type: 'custom:my-todo-card',
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
  description: 'A custom card built with Lit and TypeScript'
});
