(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const input = $('#new-task');
  const addBtn = $('#add-btn');
  const list = $('#todo-list');
  const error = $('#error');
  const counts = $('#counts');
  const filters = $$('input[name="filter"]');

  const STORAGE_KEY = 'todo-items-v1';

  /** @typedef {{id:string,text:string,completed:boolean}} Todo */
  /** @type {Todo[]} */
  let todos = load();
  let currentFilter = 'all';

  // Init
  render();

  // Add via button
  addBtn.addEventListener('click', onAdd);
  // Add via Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') onAdd();
  });

  // Delegated events for list
  list.addEventListener('click', (e) => {
    const target = e.target;
    const li = target.closest('li.todo');
    if (!li) return;
    const id = li.dataset.id;
    if (target.matches('input[type="checkbox"]')) {
      toggle(id, target.checked);
    } else if (target.matches('button.delete')) {
      remove(id);
    }
  });

  // Filters
  filters.forEach(r => r.addEventListener('change', () => {
    currentFilter = document.querySelector('input[name="filter"]:checked').value;
    render();
  }));

  function onAdd() {
    const text = input.value.trim();
    if (!text) {
      showError('Please enter a task');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    hideError();
    const todo = { id: crypto.randomUUID(), text, completed: false };
    todos.unshift(todo);
    input.value = '';
    save();
    render();
  }

  function toggle(id, completed) {
    const t = todos.find(t => t.id === id);
    if (t) {
      t.completed = completed;
      save();
      render();
    }
  }

  function remove(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function showError(msg) { error.textContent = msg; }
  function hideError() { error.textContent = ''; }

  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function filtered() {
    if (currentFilter === 'active') return todos.filter(t => !t.completed);
    if (currentFilter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function render() {
    const items = filtered();
    list.innerHTML = '';
    for (const t of items) {
      const li = document.createElement('li');
      li.className = `todo${t.completed ? ' completed' : ''}`;
      li.dataset.id = t.id;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = t.completed;
      cb.setAttribute('aria-label', `Mark \"${t.text}\" as ${t.completed ? 'active' : 'completed'}`);

      const span = document.createElement('span');
      span.className = 'text';
      span.textContent = t.text;

      const del = document.createElement('button');
      del.className = 'delete';
      del.type = 'button';
      del.setAttribute('aria-label', `Delete task: ${t.text}`);
      del.textContent = 'Delete';

      li.append(cb, span, del);
      list.append(li);
    }
    const activeCount = todos.filter(t => !t.completed).length;
    const total = todos.length;
    counts.textContent = `${activeCount} active • ${total} total`;
  }
})();
