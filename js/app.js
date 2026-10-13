(function () {
  'use strict';

  const STORAGE_KEY = 'todo-app-tasks-v1';

  const form = document.getElementById('add-form');
  const input = document.getElementById('task-input');
  const listEl = document.getElementById('task-list');
  const filtersEl = document.getElementById('filters');
  const counterEl = document.getElementById('counter');
  const clearDoneBtn = document.getElementById('clear-done');
  const todayEl = document.getElementById('today');

  let tasks = loadTasks();
  let currentFilter = 'all';

  /* ---------- 工具 ---------- */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {}
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function fmtDate(d) {
    const week = ['日', '一', '二', '三', '四', '五', '六'];
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() +
           ' 日 · 星期' + week[d.getDay()];
  }

  /* ---------- 渲染 ---------- */
  function render() {
    // 过滤
    let visible = tasks;
    if (currentFilter === 'active') visible = tasks.filter(t => !t.done);
    if (currentFilter === 'done')   visible = tasks.filter(t => t.done);

    listEl.innerHTML = '';

    if (visible.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = currentFilter === 'all'
        ? '还没有任务，添加一个吧'
        : (currentFilter === 'active' ? '没有未完成的任务 🎉' : '还没有已完成的任务');
      listEl.appendChild(empty);
    } else {
      const frag = document.createDocumentFragment();
      visible.forEach(task => frag.appendChild(createTaskEl(task)));
      listEl.appendChild(frag);
    }

    // 计数
    const remaining = tasks.filter(t => !t.done).length;
    counterEl.textContent = remaining + ' 项未完成 / 共 ' + tasks.length + ' 项';

    // 清除已完成按钮状态
    const hasDone = tasks.some(t => t.done);
    clearDoneBtn.disabled = !hasDone;
    clearDoneBtn.style.opacity = hasDone ? '1' : '.45';
    clearDoneBtn.style.cursor = hasDone ? 'pointer' : 'not-allowed';

    saveTasks();
  }

  function createTaskEl(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    // 复选框
    const box = document.createElement('div');
    box.className = 'checkbox';
    box.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    box.addEventListener('click', () => toggleTask(task.id));

    // 文本
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    // 删除
    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.type = 'button';
    del.title = '删除';
    del.textContent = '×';
    del.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(box);
    li.appendChild(text);
    li.appendChild(del);
    return li;
  }

  /* ---------- 操作 ---------- */
  function addTask(text) {
    text = text.trim();
    if (!text) return;
    tasks.unshift({
      id: uid(),
      text: text,
      done: false,
      createdAt: Date.now()
    });
    render();
  }

  function toggleTask(id) {
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    t.done = !t.done;
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    render();
  }

  function clearDone() {
    tasks = tasks.filter(t => !t.done);
    render();
  }

  /* ---------- 事件 ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    addTask(input.value);
    input.value = '';
    input.focus();
  });

  filtersEl.addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    Array.prototype.forEach.call(filtersEl.children, b => {
      b.classList.toggle('active', b === btn);
    });
    render();
  });

  clearDoneBtn.addEventListener('click', clearDone);

  /* ---------- 启动 ---------- */
  todayEl.textContent = fmtDate(new Date());
  render();
  input.focus();
})();