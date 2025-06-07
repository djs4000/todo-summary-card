from homeassistant.helpers.entity import SensorEntity
from .const import DOMAIN

class TodoSummarySensor(SensorEntity):
    def __init__(self, hass, todo_lists):
        self.hass = hass
        self._todo_lists = todo_lists
        self._attr_name = "Todo Summary"
        self._attr_native_value = 0
        self._attr_extra_state_attributes = {}

    async def async_update(self):
        total_tasks = 0
        all_tasks = {}

        for entity_id in self._todo_lists:
            try:
                response = await self.hass.services.async_call(
                    "todo",
                    "get_items",
                    {"entity_id": entity_id},
                    blocking=True,
                    return_response=True
                )

                tasks = response.get("items", [])
                pending = [t["summary"] for t in tasks if t["status"] == "needs_action"]
                total_tasks += len(pending)
                all_tasks[entity_id] = pending

            except Exception as e:
                all_tasks[entity_id] = f"Error: {str(e)}"

        self._attr_native_value = total_tasks
        self._attr_extra_state_attributes = all_tasks

async def async_setup_entry(hass, entry, async_add_entities):
    todo_lists = entry.data.get("todo_lists", [])
    async_add_entities([TodoSummarySensor(hass, todo_lists)], update_before_add=True)
