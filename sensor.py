from homeassistant.helpers.entity import Entity

class TaskListSensor(Entity):
    def __init__(self, name, tasks):
        self._name = name
        self._tasks = tasks

    @property
    def name(self):
        return self._name

    @property
    def state(self):
        return len(self._tasks)

    @property
    def extra_state_attributes(self):
        return {"tasks": self._tasks}