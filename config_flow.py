from __future__ import annotations

from typing import Any

from homeassistant import config_entries
import voluptuous as vol
from homeassistant.helpers.entity_registry import async_get as async_get_entity_registry

from .const import DOMAIN


class TodoSummaryConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for Todo Summary Card."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        """Handle the initial step where the user selects todo entities."""
        if user_input is not None:
            return self.async_create_entry(
                title="Todo Summary",
                data={"todo_lists": user_input["todo_lists"]}
            )

        # Get the entity registry
        entity_registry = async_get_entity_registry(self.hass)

        # Filter for todo entities
        todo_entities = [
            entry.entity_id
            for entry in entity_registry.entities.values()
            if entry.domain == "todo"
        ]

        if not todo_entities:
            return self.async_abort(reason="no_todo_entities_found")

        # Build the form schema
        schema = vol.Schema({
            vol.Required("todo_lists"): vol.Multiselect(todo_entities)
        })

        return self.async_show_form(
            step_id="user",
            data_schema=schema
        )
