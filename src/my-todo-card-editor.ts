// my-todo-card-editor.ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { fireEvent, HomeAssistant } from 'custom-card-helpers';

class MyTodoCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config = { entities: [], title: '', show_completed: false, days_ahead: 1 };

  static styles = css`
    .input-container {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .mdc-text-field__input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      font: inherit;
    }
  `;

  public setConfig(config: any): void {
    this._config = { ...this._config, ...config };
  }

  private _valueChanged(ev: Event) {
    const target = ev.target as HTMLInputElement;
    if (!this._config || !target) return;

    const value = target.type === 'checkbox' ? target.checked : target.value;
    const key = target.dataset.field!;
    this._config = { ...this._config, [key]: key === 'days_ahead' ? Number(value) : value };
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _entityChanged(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    const entities = value.split(',').map(e => e.trim());
    this._config = { ...this._config, entities };
    fireEvent(this, 'config-changed', { config: this._config });
  }

  protected render() {
    return html`
      <div class="input-container">
        <label for="title">Title</label>
        <input id="title" class="mdc-text-field__input" type="text" .value=${this._config.title} data-field="title" @input=${this._valueChanged} />
      </div>
      <div class="input-container">
        <label for="entities">Entities (comma-separated)</label>
        <input id="entities" class="mdc-text-field__input" type="text" .value=${this._config.entities.join(', ')} @input=${this._entityChanged} />
      </div>
      <div class="input-container">
        <label for="days_ahead">Days Ahead</label>
        <input id="days_ahead" class="mdc-text-field__input" type="number" .value=${this._config.days_ahead} data-field="days_ahead" @input=${this._valueChanged} />
      </div>
      <div class="input-container">
        <label>
          <input type="checkbox" .checked=${this._config.show_completed} data-field="show_completed" @change=${this._valueChanged} />
          Show Completed
        </label>
      </div>
    `;
  }
}

customElements.define('my-todo-card-editor', MyTodoCardEditor);
