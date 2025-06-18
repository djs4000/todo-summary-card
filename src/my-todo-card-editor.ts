// my-todo-card-editor.ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import 'custom-card-helpers/lib/components/ha-textfield.js';
import 'custom-card-helpers/lib/components/ha-checkbox.js';
import 'custom-card-helpers/lib/components/ha-formfield.js';
import 'custom-card-helpers/lib/components/ha-entity-picker.js';

declare global {
  interface HomeAssistant {
    states: any;
  }

  function fireEvent(node: HTMLElement, type: string, detail: any): void;
}

class MyTodoCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config = { entities: [], title: '', show_completed: false, days_ahead: 1 };

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

  private _entitiesChanged(ev: CustomEvent) {
    const value = ev.detail.value;
    this._config = { ...this._config, entities: value };
    fireEvent(this, 'config-changed', { config: this._config });
  }

  protected render() {
    return html`
      <ha-textfield
        label="Title"
        .value=${this._config.title || ''}
        data-field="title"
        @input=${this._valueChanged}
      ></ha-textfield>

      <ha-entity-picker
        .hass=${this.hass}
        .value=${this._config.entities}
        .includeDomains=${['todo']}
        .multiple=${true}
        label="Todo Entities"
        @value-changed=${this._entitiesChanged}
      ></ha-entity-picker>

      <ha-textfield
        label="Days Ahead"
        type="number"
        .value=${String(this._config.days_ahead)}
        data-field="days_ahead"
        @input=${this._valueChanged}
      ></ha-textfield>

      <ha-formfield label="Show Completed">
        <ha-checkbox
          .checked=${this._config.show_completed}
          data-field="show_completed"
          @change=${this._valueChanged}
        ></ha-checkbox>
      </ha-formfield>
    `;
  }
}

function fireEvent(node: HTMLElement, type: string, detail: any) {
  node.dispatchEvent(new CustomEvent(type, {
    detail,
    bubbles: true,
    composed: true,
  }));
}

customElements.define('my-todo-card-editor', MyTodoCardEditor);