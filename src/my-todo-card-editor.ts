// my-todo-card-editor.ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

declare global {
  interface HomeAssistant {
    callWS<T>(msg: any): Promise<T>;
    states: any;
  }

  interface LovelaceCardConfig {
    type: string;
    [key: string]: any;
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

@customElement('my-todo-card-editor')
export class MyTodoCardEditor extends LitElement {
  @property({ attribute: false }) hass: HomeAssistant;
  @state() private _config: LovelaceCardConfig = {};

  setConfig(config: LovelaceCardConfig): void {
    this._config = config;
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) return;

    const target = ev.target as any;
    const value = ev.detail.value;

    if (target.configValue === 'entities') {
      this._config = {
        ...this._config,
        entities: value ? [value] : [],
      };
    }

    fireEvent(this, 'config-changed', { config: this._config });
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <ha-card header="To-Do Summary Card">
        <div class="card-content">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.entities?.[0] ?? ''}
            .configValue=${'entities'}
            .includeDomains=${['todo']}
            @value-changed=${this._valueChanged}
          ></ha-entity-picker>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    .card-content {
      padding: 16px;
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
