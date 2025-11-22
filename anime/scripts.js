(() => {
    window.addEventListener("load", () => {
        let loadMs = 0;

        const nav = performance.getEntriesByType("navigation")[0];
        if (nav && nav.duration && nav.duration > 0) {
            loadMs = nav.duration;
        } else {
            const t = performance.timing;

            const end = t.loadEventEnd && t.loadEventEnd > 0 ? t.loadEventEnd : Date.now();
            const start = t.navigationStart && t.navigationStart > 0 ? t.navigationStart : t.fetchStart;

            loadMs = end - start;
        }

        if (!isFinite(loadMs) || loadMs < 0) loadMs = 0;

        const loadSec = (loadMs / 1000).toFixed(3);

        const footer = document.querySelector("footer");
        if (footer) {
            let box = document.getElementById("loadTime");
            if (!box) {
                box = document.createElement("p");
                box.id = "loadTime";
                footer.appendChild(box);
            }
            box.textContent = `Время загрузки страницы: ${loadSec} сек.`;
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        const links = document.querySelectorAll("header nav a");
        const currentPath = location.pathname.replace(/\/$/, "");

        links.forEach(a => {
            const linkPath = new URL(a.href).pathname.replace(/\/$/, "");
            if (linkPath === currentPath) {
                a.classList.add("active");
            } else {
                a.classList.remove("active");
            }
        });
    });

    const openBtn  = document.getElementById("openAuth");
    const closeBtn = document.getElementById("closeAuth");
    const modal    = document.getElementById("authModal");
    const form     = document.getElementById("authForm");

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => modal.classList.add("open"));
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Заглушка: вход выполнен (без сервера).");
            modal.classList.remove("open");
            form.reset();
        });
    }
})();
