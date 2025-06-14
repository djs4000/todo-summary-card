// Define a custom HTML element for the Lovelace card
class MyTodoCard extends HTMLElement {

  constructor() {
    super();

    // Attach a shadow DOM to isolate styles and structure
    this.attachShadow({ mode: 'open' });

    // Internal flags and state
    this._fetched = false;  // used to prevent repeated fetches
    this._hass = null;      // stores the Home Assistant instance
  }

  // Called when the card is configured in Lovelace
  setConfig(config) {
    // Validate that 'entities' is provided and is an array
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("You need to define 'entities' as an array");
    }

    // Store configuration
    this.config = config;
  }

  // This is called every time Home Assistant updates its state
  set hass(hass) {
    // Save the hass instance for later use
    this._hass = hass;
  }

  // Called once when the card is first added to the DOM
  connectedCallback() {
    // Only fetch data if we haven't already and we have config and hass
    if (!this._fetched && this._hass && this.config) {
      this._fetched = true;

      // Render an initial "Loading..." card
      this.renderCardSkeleton();

      // Begin fetching todo list data
      this.fetchTodos(this._hass);
    }
  }

  // Draw the card skeleton structure
  renderCardSkeleton() {
    // Setup the basic card layout with a header and placeholder
    this.shadowRoot.innerHTML = `
      <ha-card header="${this.config.title || 'My Todo Lists'}">
        <div class="card-content">Loading...</div>
      </ha-card>
    `;

    // Save a reference to the card content container for later updates
    this.content = this.shadowRoot.querySelector('.card-content');
  }

  // Fetch todo items from each configured entity using WebSocket API
  async fetchTodos(hass) {
    const entities = this.config.entities;

    try {
      // Prepare a list of WebSocket requests, one for each entity
      const promises = entities.map(async (entity) => {
        const response = await hass.callWS({
          type: "call_service",            // Call a service
          domain: "todo",                  // Domain is 'todo'
          service: "get_items",            // We want to get items
          target: { entity_id: entity },   // Specify which todo entity
          return_response: true            // REQUIRED to get results back
        });

        // The items are nested in response.response[entity]
        const items = response.response[entity]?.items || [];

        // Return both the entity name and its items
        return { entity, items };
      });

      // Wait for all todo lists to be fetched in parallel
      const results = await Promise.all(promises);

      // Build HTML output for the card
      let html = '';
      results.forEach(({ entity, items }) => {
        const title = entity.replace('todo.', ''); // Clean up display title

        // If items exist, show them as a list
        if (items.length) {
          html += `<b>${title}</b><ul>`;
          items.forEach(item => {
            html += `<li>${item.summary}</li>`;
          });
          html += '</ul>';
        } else {
          // Otherwise just say there are no items
          html += `<b>${title}</b>: No items found.<br>`;
        }
      });

      // Inject the resulting HTML into the card
      this.content.innerHTML = html;

    } catch (error) {
      // Show an error in the card if something goes wrong
      console.error("Error fetching todo items:", error);
      this.content.innerHTML = "Error loading todo lists.";
    }
  }

  // This tells Home Assistant how tall the card is
  getCardSize() {
    return 1; // Small card, 1 row
  }
}

// Register the custom element so Lovelace can use it
customElements.define('my-todo-card', MyTodoCard);