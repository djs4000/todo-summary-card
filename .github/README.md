# Todo Summary Card

This custom Lovelace card displays all tasks that are due today or overdue across multiple Home Assistant todo lists.

## Installation via HACS

1. Go to **HACS → Frontend → Custom Repositories**
2. Add this repo: `https://github.com/your-github-username/todo-summary-card`
3. Select category: **Lovelace**
4. Install `Todo Summary Card`

## Manual Usage

```yaml
type: custom:todo-summary-card
entities:
  - todo.home_stuff
  - todo.work_stuff
  - todo.personal_tasks