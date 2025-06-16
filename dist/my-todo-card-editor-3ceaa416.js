import{n as e,i as t,_ as a,a as i,x as n}from"./my-todo-card-7a6be54b.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var o,s,c;(c=o||(o={})).language="language",c.system="system",c.comma_decimal="comma_decimal",c.decimal_comma="decimal_comma",c.space_comma="space_comma",c.none="none",function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(s||(s={}));var d=function(e,t,a,i){i=i||{},a=null==a?{}:a;var n=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return n.detail=a,e.dispatchEvent(n),n};class l extends i{constructor(){super(...arguments),this._config={entities:[],title:"",show_completed:!1,days_ahead:1}}setConfig(e){this._config={...this._config,...e}}_valueChanged(e){const t=e.target;if(!this._config||!t)return;const a="checkbox"===t.type?t.checked:t.value,i=t.dataset.field;this._config={...this._config,[i]:"days_ahead"===i?Number(a):a},d(this,"config-changed",{config:this._config})}_entityChanged(e){const t=e.target.value.split(",").map((e=>e.trim()));this._config={...this._config,entities:t},d(this,"config-changed",{config:this._config})}render(){return n`
      <div>
        <label>Title</label>
        <input type="text" .value=${this._config.title} data-field="title" @input=${this._valueChanged} />
      </div>
      <div>
        <label>Entities (comma-separated)</label>
        <input type="text" .value=${this._config.entities.join(", ")} @input=${this._entityChanged} />
      </div>
      <div>
        <label>Days Ahead</label>
        <input type="number" .value=${this._config.days_ahead} data-field="days_ahead" @input=${this._valueChanged} />
      </div>
      <div>
        <label><input type="checkbox" .checked=${this._config.show_completed} data-field="show_completed" @change=${this._valueChanged} /> Show Completed</label>
      </div>
    `}}l.styles=t`
    div {
      margin-bottom: 16px;
    }
  `,a([e({attribute:!1})],l.prototype,"hass",void 0),a([function(t){return e({...t,state:!0,attribute:!1})}()],l.prototype,"_config",void 0),customElements.define("my-todo-card-editor",l);
//# sourceMappingURL=my-todo-card-editor-3ceaa416.js.map
