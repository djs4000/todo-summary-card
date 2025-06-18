// my-todo-card-editor.ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

declare global {
  interface HomeAssistant {
    callWS<T>(msg: any): Promise<T>;
    states: any;
  }

  interface Window {
    customCards: any[];
  }

  interface HTMLElementTagNameMap {
    'ha-card': HTMLElement;
    'ha-entity-picker': HTMLElement;
    'ha-textfield': HTMLElement;
    'ha-checkbox': HTMLElement;
    'ha-formfield': HTMLElement;
  }
}


declare global {
  interface HomeAssistant {
    states: any;
  }

  function fireEvent(node: HTMLElement, type: string, detail: any): void;
}

class MyTodoCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config: LovelaceCardConfig = {
      type: ''
  };

  setConfig(config: LovelaceCardConfig): void {
    this._config = config;
  }

  private _updateEntity(index: number, ev: CustomEvent): void {
    const value = ev.detail.value;
    const newEntities = [...(this._config.entities || [])];
    newEntities[index] = value;
    this._updateConfig(newEntities);
  }

  private _addEntity(): void {
    const newEntities = [...(this._config.entities || []), ''];
    this._updateConfig(newEntities);
  }

  private _removeEntity(index: number): void {
    const newEntities = [...(this._config.entities || [])];
    newEntities.splice(index, 1);
    this._updateConfig(newEntities);
  }

  private _updateConfig(entities: string[]): void {
    this._config = { ...this._config, entities };
    fireEvent(this, 'config-changed', { config: this._config });
  }

  render(): ReturnType<LitElement['render']> {
    if (!this.hass || !this._config) return html``;

    return html`
      <ha-card header="To-Do Summary Card">
        <div class="card-content">
          ${(this._config.entities || []).map((entity: string, index: number) => html`
            <div class="entity-row">
              <ha-entity-picker
                .hass=${this.hass}
                .value=${entity}
                .includeDomains=${['todo']}
                @value-changed=${(ev: CustomEvent) => this._updateEntity(index, ev)}
              ></ha-entity-picker>
              <mwc-icon-button
                icon="delete"
                @click=${() => this._removeEntity(index)}
                title="Remove"
              ></mwc-icon-button>
            </div>
          `)}
          <mwc-button @click=${this._addEntity} icon="add">Add To-Do Entity</mwc-button>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    .card-content {
      padding: 16px;
    }
    .entity-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      gap: 8px;
    }
  `;
}

function fireEvent(node: HTMLElement, type: string, detail: any): void {
  node.dispatchEvent(new CustomEvent(type, {
    detail,
    bubbles: true,
    composed: true,
  }));
}

declare global {
  interface HTMLElementTagNameMap {
    'my-todo-card-editor': MyTodoCardEditor;
  }
}
