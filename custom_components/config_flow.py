from homeassistant import config_entries
import voluptuous as vol
from .const import DOMAIN, AVAILABLE_LISTS

class TaskSensorConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    async def async_step_user(self, user_input=None):
        if user_input:
            return self.async_create_entry(title="Task Sensor", data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required("lists"): vol.Multiselect(AVAILABLE_LISTS)
            })
        )