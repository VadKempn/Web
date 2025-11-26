(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const wlForm  = document.getElementById("wlForm");
        const wlList  = document.getElementById("wlList");
        if (!wlForm || !wlList) return;

        const titleInput  = document.getElementById("wlTitle");
        const statusInput = document.getElementById("wlStatus");
        const scoreInput  = document.getElementById("wlScore");

        const filterBtns   = document.querySelectorAll(".wl-filter");
        const clearDoneBtn = document.getElementById("wlClearDone");

        const LS_KEY = "anime_watchlist_v1";
        let items = load();
        let currentFilter = "all";

        render();

        wlForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = titleInput.value.trim();
            if (!title) return;

            const item = {
                id: Date.now(),
                title,
                status: statusInput.value,
                score: scoreInput.value ? Number(scoreInput.value) : null
            };

            items.unshift(item);
            save();
            render();

            wlForm.reset();
            titleInput.focus();
        });

        wlList.addEventListener("click", (e) => {
            const li = e.target.closest("li[data-id]");
            if (!li) return;

            const id = Number(li.dataset.id);
            const item = items.find(x => x.id === id);
            if (!item) return;

            if (e.target.matches(".wl-done")) {
                item.status = item.status === "done" ? "watching" : "done";
                save(); render();
            }

            if (e.target.matches(".wl-del")) {
                items = items.filter(x => x.id !== id);
                save(); render();
            }

            if (e.target.matches(".wl-edit")) {
                const newTitle = prompt("Новое название:", item.title);
                if (newTitle && newTitle.trim()) {
                    item.title = newTitle.trim();
                    save(); render();
                }
            }
        });

        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.dataset.filter;
                render();
            });
        });

        // ====================================

        function render() {
            wlList.innerHTML = "";

            const filtered = items.filter(x => {
                if (currentFilter === "all") return true;
                return x.status === currentFilter;
            });

            if (!filtered.length) {
                wlList.innerHTML = `<li class="wl-empty">Пока пусто. Добавь свое первое аниме ♥️</li>`;
                return;
            }

            filtered.forEach(x => {
                const li = document.createElement("li");
                li.className = "wl-item";
                li.dataset.id = x.id;

                li.innerHTML = `
          <div class="wl-main">
            <span class="wl-title ${x.status === "done" ? "is-done" : ""}">
              ${x.title}
            </span>
            <span class="wl-badges">
              <span class="wl-status">${statusName(x.status)}</span>
              ${x.score !== null ? `<span class="wl-score">${x.score}/10</span>` : ""}
            </span>
          </div>

          <div class="wl-actions">
            <button class="btn btn--ghost wl-done" title="Просмотрено">✓</button>
            <button class="btn btn--ghost wl-edit" title="Переименовать">✎</button>
            <button class="btn btn--ghost wl-del" title="Удалить">🗑</button>
          </div>
        `;

                wlList.appendChild(li);
            });
        }

        function statusName(s) {
            if (s === "plan") return "Планирую";
            if (s === "watching") return "Смотрю";
            return "Просмотрено";
        }

        function save() {
            localStorage.setItem(LS_KEY, JSON.stringify(items));
        }

        function load() {
            try {
                const raw = localStorage.getItem(LS_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch {
                return [];
            }
        }
    });
})();
