from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers import aiohttp_client

from .const import DOMAIN, PLATFORMS

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the integration via YAML (not used in UI-based config)."""
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the integration from a config entry (UI setup)."""
    hass.data.setdefault(DOMAIN, {})
    
    # Create a shared HTTP session if needed (e.g. for API calls)
    session = aiohttp_client.async_get_clientsession(hass)
    
    # Store data if needed — like coordinator, auth tokens, etc
    hass.data[DOMAIN][entry.entry_id] = {
        "lists": entry.data.get("lists", []),
        "session": session,
        # Add other data here (like a DataUpdateCoordinator, if used)
    }

    # Forward the config entry to the sensor platform
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Handle removal of a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok