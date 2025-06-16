// my-todo-card-editor.ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { fireEvent, HomeAssistant } from 'custom-card-helpers';
import '@material/mwc-textfield';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import '@material/mwc-button';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
import "custom-card-helpers/lib/components/ha-entity-picker.js";

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
      <mwc-textfield
        label="Title"
        .value=${this._config.title || ''}
        data-field="title"
        @input=${this._valueChanged}
      ></mwc-textfield>

      <ha-entity-picker
        .hass=${this.hass}
        .value=${this._config.entities}
        .includeDomains=${['todo']}
        .multiple=${true}
        label="Todo Entities"
        @value-changed=${this._entitiesChanged}
      ></ha-entity-picker>

      <mwc-textfield
        label="Days Ahead"
        type="number"
        .value=${String(this._config.days_ahead)}
        data-field="days_ahead"
        @input=${this._valueChanged}
      ></mwc-textfield>

      <mwc-formfield label="Show Completed">
        <mwc-checkbox
          .checked=${this._config.show_completed}
          data-field="show_completed"
          @change=${this._valueChanged}
        ></mwc-checkbox>
      </mwc-formfield>
    `;
  }
}

customElements.define('my-todo-card-editor', MyTodoCardEditor);