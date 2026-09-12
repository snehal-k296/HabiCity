import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToTasks, createTask, completeTask, deleteTask } from "../lib/gamedata";

const DIFFICULTIES = ["trivial", "easy", "medium", "hard", "epic"];

export default function TaskList({ uid, domainId, userDoc, onLevelUpCheck }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [error, setError] = useState("");
  const [offlineNotice, setOfflineNotice] = useState(false);
  // optimistic local overrides so a completed task shows the checkmark instantly
  const [optimisticDone, setOptimisticDone] = useState({});

  useEffect(() => {
    const unsub = subscribeToTasks(uid, domainId, setTasks);
    return unsub;
  }, [uid, domainId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Quest title can't be empty.");
      return;
    }
    try {
      await createTask(uid, domainId, { title, difficulty });
      setTitle("");
    } catch (err) {
      setError(err.message || "Couldn't add that quest — check your connection.");
    }
  }

  async function handleComplete(task) {
    if (task.completed || optimisticDone[task.id]) return; // guard against double click
    setOptimisticDone((prev) => ({ ...prev, [task.id]: true })); // feels instant
    try {
      const result = await completeTask(uid, domainId, task, userDoc);
      if (result) onLevelUpCheck?.(result);
      setOfflineNotice(false);
    } catch (err) {
      // roll back the optimistic state — the write didn't actually happen
      setOptimisticDone((prev) => {
        const copy = { ...prev };
        delete copy[task.id];
        return copy;
      });
      setOfflineNotice(true);
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(uid, domainId, taskId);
    } catch {
      setError("Couldn't delete that right now.");
    }
  }

  return (
    <div className="task-list">
      <form onSubmit={handleAdd} className="task-form">
        <input
          placeholder="New quest..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Quest title"
        />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty">
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>
      {error && <p className="inline-error">{error}</p>}
      {offlineNotice && (
        <p className="inline-error">You seem to be offline — that quest wasn't saved yet. Try again once you're back online.</p>
      )}

      <ul>
        <AnimatePresence>
          {tasks.map((task) => {
            const done = task.completed || optimisticDone[task.id];
            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={done ? "task-done" : ""}
              >
                <button
                  className="task-check"
                  onClick={() => handleComplete(task)}
                  disabled={done}
                  aria-label={done ? "Completed" : `Complete ${task.title}`}
                >
                  {done ? "✅" : "⬜"}
                </button>
                <span className="task-title">{task.title}</span>
                <span className="task-difficulty">{task.difficulty}</span>
                {!done && (
                  <button className="task-delete" onClick={() => handleDelete(task.id)} aria-label={`Delete ${task.title}`}>
                    ✕
                  </button>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
        {tasks.length === 0 && <li className="task-empty">No quests yet — add one above.</li>}
      </ul>
    </div>
  );
}
