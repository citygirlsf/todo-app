import { useState } from "react";
import "./index.css";

const PRIORITIES = ["low", "med", "high"];

const PRIORITY_LABELS = { high: "High", med: "Medium", low: "Low" };

const defaultTasks = [
  { id: 1, text: "Eat breakfast", done: false, priority: "low" },
  { id: 2, text: "Wash face", done: false, priority: "low" },
  { id: 3, text: "Go to gym", done: false, priority: "med" },
];

function ToDoList() {
  const [tasks, setTasks] = useState(defaultTasks);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("med");
  const [filter, setFilter] = useState("all");
  const [removingIds, setRemovingIds] = useState([]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const visible = tasks.filter((t) => {
    if (filter === "done") return t.done;
    if (filter === "active") return !t.done;
    return true;
  });

  function addTask() {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: newTask.trim(), done: false, priority },
    ]);
    setNewTask("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") addTask();
  }

  function toggleDone(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTask(id) {
    setRemovingIds((prev) => [...prev, id]);
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setRemovingIds((prev) => prev.filter((rid) => rid !== id));
    }, 220);
  }

  function moveUp(index) {
    if (index === 0) return;
    setTasks((prev) => {
      const next = [...prev];
      [next[index], next[index - 1]] = [next[index - 1], next[index]];
      return next;
    });
  }

  function moveDown(index) {
    if (index === tasks.length - 1) return;
    setTasks((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function cyclePriority(id) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const i = PRIORITIES.indexOf(t.priority);
        return { ...t, priority: PRIORITIES[(i + 1) % 3] };
      })
    );
  }

  function clearDone() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="app-wrapper">
      <div className="app-card">

        {/* Header */}
        <div className="app-header">
          <div className="header-top">
            <div>
              <h1 className="header-title">Daily tasks</h1>
              <p className="header-date">{today}</p>
            </div>
            <span className="header-badge">{pct}% done</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat">
            <div className="stat-num">{total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat">
            <div className="stat-num">{done}</div>
            <div className="stat-label">Done</div>
          </div>
          <div className="stat">
            <div className="stat-num">{total - done}</div>
            <div className="stat-label">Remaining</div>
          </div>
        </div>

        {/* Input */}
        <div className="input-section">
          <div className="input-row">
            <input
              className="task-input"
              type="text"
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <select
              className="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
            <button className="add-btn" onClick={addTask}>
              + Add
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-row">
          {["all", "active", "done"].map((f) => (
            <button
              key={f}
              className={`filter-btn${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "active" ? "Active" : "Completed"}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="tasks-section">
          {visible.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✓</span>
              <p>
                {filter === "done"
                  ? "No completed tasks yet."
                  : filter === "active"
                  ? "No active tasks — all done!"
                  : "Add your first task above."}
              </p>
            </div>
          ) : (
            visible.map((task) => {
              const globalIndex = tasks.findIndex((t) => t.id === task.id);
              const isRemoving = removingIds.includes(task.id);
              return (
                <div
                  key={task.id}
                  className={`task-item${task.done ? " done-item" : ""}${
                    isRemoving ? " removing" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    className={`check-btn${task.done ? " checked" : ""}`}
                    onClick={() => toggleDone(task.id)}
                    aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.done && "✓"}
                  </button>

                  {/* Priority dot */}
                  <button
                    className={`priority-pip pip-${task.priority}`}
                    onClick={() => cyclePriority(task.id)}
                    title={`Priority: ${PRIORITY_LABELS[task.priority]}. Click to change`}
                    aria-label={`Priority ${PRIORITY_LABELS[task.priority]}`}
                  />

                  {/* Task text */}
                  <span className={`task-text${task.done ? " done-text" : ""}`}>
                    {task.text}
                  </span>

                  {/* Priority tag */}
                  <span className={`priority-tag tag-${task.priority}`}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>

                  {/* Actions */}
                  <div className="item-actions">
                    <button
                      className="icon-btn"
                      onClick={() => moveUp(globalIndex)}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => moveDown(globalIndex)}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="icon-btn del-btn"
                      onClick={() => deleteTask(task.id)}
                      aria-label="Delete task"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="app-footer">
          <span className="footer-text">
            {done} of {total} tasks completed
          </span>
          <button className="clear-btn" onClick={clearDone}>
            Clear completed
          </button>
        </div>

      </div>
    </div>
  );
}

export default ToDoList;
