// my-todo-card.ts
import { LitElement, html, css, PropertyValues } from 'lit';
import type { TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './my-todo-card-editor';

// Declare global types instead of importing custom-card-helpers
declare global {
  interface Window {
    customCards: any[];
  }

  interface HomeAssistant {
    callWS<T>(msg: any): Promise<T>;
    states: any;
  }

  interface LovelaceCardConfig {
    type: string;
    [key: string]: any;
  }
}

interface TodoItem {
  summary: string;
  status: string;
  due?: string;
  uid: string;
}

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
  private _content: TemplateResult = html`<p>Loading...</p>`;

  static styles = css`
    ha-card {
      padding: 16px;
    }
    .error {
      color: var(--error-color, red);
    }
  `;

  public setConfig(config: TodoCardConfig): void {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("You need to define 'entities' as an array");
    }
    this.config = config;
    this._fetched = false;
    this._content = html`<p>Loading...</p>`;
  }

  protected updated(changedProps: PropertyValues) {
    if (changedProps.has('hass') && !this._fetched && this.config) {
      this._fetched = true;
      this.fetchTodos();
    }
  }

  protected render() {
    return html`
      <ha-card header="${this.config.title || 'My Todo Lists'}">
        <div class="card-content">
          ${this._content}
        </div>
      </ha-card>
    `;
  }

  private async fetchTodos() {
    const { entities, show_completed, days_ahead } = this.config;
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + (days_ahead || 1) - 1);
    today.setHours(0, 0, 0, 0);

    const results: TemplateResult[] = [];

    for (const entity of entities) {
      try {
        const response = await this.hass.callWS<{ response: Record<string, { items: TodoItem[] }> }>({
          type: "call_service",
          domain: "todo",
          service: "get_items",
          target: { entity_id: entity },
          return_response: true
        });

        const items = response.response[entity]?.items || [];
        const filteredItems = items.filter((item: TodoItem) => {
          if (!show_completed && item.status !== 'needs_action') return false;
          if (item.due) {
            const dueDate = new Date(item.due);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate <= maxDate;
          }
          return true;
        });

        const title = this.hass.states[entity]?.attributes.friendly_name || entity;
        results.push(html`
          <div>
            <b>${title}</b>
            ${filteredItems.length
              ? html`<ul>${filteredItems.map((item: TodoItem) => html`<li>${item.summary}</li>`)}</ul>`
              : html`<p>No items found.</p>`}
          </div>
        `);
      } catch (error) {
        console.warn(`Error fetching todo entity '${entity}':`, error);
        results.push(html`
          <div class="error">
            <b>Error loading ${entity}</b>: Invalid or unavailable entity.
          </div>
        `);
      }
    }

    this._content = html`${results}`;
    this.requestUpdate();
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

  public static async getConfigElement() {
    await import('./my-todo-card-editor');
    return document.createElement('my-todo-card-editor');
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
