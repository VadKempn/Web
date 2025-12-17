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
            if (!isFinite(loadMs) || loadMs < 0) loadMs = 0;
        }

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
        const links = document.querySelectorAll("header nav a, header nav ul li a");
        const currentPath = location.pathname.replace(/\/$/, "");

        links.forEach(a => {
            const linkPath = new URL(a.href).pathname.replace(/\/$/, "");
            if (linkPath === currentPath) {
                a.classList.add("active");
            } else {
                a.classList.remove("active");
            }
        });

        const openBtn = document.getElementById("openAuth");
        const closeBtn = document.getElementById("closeAuth");
        const closeAuthBtn = document.getElementById("closeAuthBtn");
        const modal = document.getElementById("authModal");
        const form = document.getElementById("authForm");

        if (openBtn && modal) {
            openBtn.addEventListener("click", () => modal.classList.add("open"));
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", () => modal.classList.remove("open"));
        }

        if (closeAuthBtn) {
            closeAuthBtn.addEventListener("click", () => modal.classList.remove("open"));
        }

        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) modal.classList.remove("open");
            });
        }

        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                alert("✅ Вход выполнен (демо-версия)");
                modal.classList.remove("open");
                form.reset();
            });
        }
    });
})();

(() => {
    const loadNewsBtn = document.getElementById("loadNews");
    const loadRandomBtn = document.getElementById("loadRandomNews");
    const loader = document.getElementById("newsLoader");
    const container = document.getElementById("newsFeed");
    const errorDiv = document.getElementById("newsError");
    const filterBadge = document.getElementById("filterBadge");
    const postTemplate = document.getElementById("postTemplate");
    const commentTemplate = document.getElementById("commentTemplate");

    let allPosts = [];
    let allComments = [];

    function showLoader() {
        loader.classList.remove("hidden");
        container.innerHTML = "";
        errorDiv.classList.add("hidden");
    }

    function hideLoader() {
        loader.classList.add("hidden");
    }

    function showError(message) {
        hideLoader();
        errorDiv.textContent = message;
        errorDiv.classList.remove("hidden");
    }

    async function loadAllData() {
        showLoader();

        try {
            const [postsRes, commentsRes] = await Promise.all([
                fetch("https://jsonplaceholder.typicode.com/posts"),
                fetch("https://jsonplaceholder.typicode.com/comments")
            ]);

            if (!postsRes.ok) {
                throw new Error(`Ошибка загрузки постов (${postsRes.status})`);
            }

            if (!commentsRes.ok) {
                throw new Error(`Ошибка загрузки комментариев (${commentsRes.status})`);
            }

            const posts = await postsRes.json();
            const comments = await commentsRes.json();

            if (!posts || posts.length === 0) {
                throw new Error("Не получены посты");
            }

            allPosts = posts;
            allComments = comments;

            hideLoader();
            return true;
        } catch (error) {
            handleError(error);
            return false;
        }
    }

    function handleError(error) {
        console.error("API ошибка:", error);

        if (error.message.includes("Failed to fetch")) {
            showError("⚠️ Ошибка сети: проверьте подключение к интернету");
        } else if (error.message.includes("404")) {
            showError("⚠️ Ресурс не найден (404)");
        } else if (error.message.includes("50")) {
            showError("⚠️ Ошибка сервера API");
        } else {
            showError(`⚠️ Произошла ошибка: ${error.message}`);
        }
    }

    function getFilteredPosts(filter = null) {
        if (!filter) {
            const randomUserId = Math.floor(Math.random() * 10) + 1;
            filter = { userId: randomUserId };
        }

        return allPosts.filter(post => {
            if (filter.userId) {
                return post.userId === filter.userId;
            }
            if (filter.id) {
                return post.id === filter.id;
            }
            return true;
        });
    }

    function getPostComments(postId) {
        return allComments.filter(comment => comment.postId === postId);
    }

    function displayPosts(posts, filterInfo = "") {
        container.innerHTML = "";

        if (filterInfo) {
            filterBadge.textContent = filterInfo;
            filterBadge.classList.remove("hidden");
        } else {
            filterBadge.classList.add("hidden");
        }

        posts.forEach(post => {
            const clone = postTemplate.content.cloneNode(true);

            clone.querySelector(".post-title").textContent = post.title;
            clone.querySelector(".post-body").textContent = post.body;
            clone.querySelector(".post-id").textContent = `#${post.id}`;
            clone.querySelector(".post-author").textContent = `Пользователь #${post.userId}`;

            const toggleBtn = clone.querySelector(".toggle-comments");
            const commentsSection = clone.querySelector(".comments-section");
            const commentsList = clone.querySelector(".comments-list");

            const comments = getPostComments(post.id);
            toggleBtn.textContent = `Комментарии (${comments.length})`;

            toggleBtn.addEventListener("click", (e) => {
                e.preventDefault();

                if (commentsSection.classList.contains("show")) {
                    commentsSection.classList.remove("show");
                    toggleBtn.classList.remove("active");
                } else {
                    if (commentsList.children.length === 0 && comments.length > 0) {
                        comments.forEach(comment => {
                            const commentClone = commentTemplate.content.cloneNode(true);
                            commentClone.querySelector(".comment-author").textContent = comment.name;
                            commentClone.querySelector(".comment-email").textContent = comment.email;
                            commentClone.querySelector(".comment-body").textContent = comment.body;
                            commentsList.appendChild(commentClone);
                        });
                    }

                    commentsSection.classList.add("show");
                    toggleBtn.classList.add("active");
                }
            });

            container.appendChild(clone);
        });
    }

    async function loadNews() {
        const loaded = await loadAllData();
        if (!loaded) return;

        const firstFivePosts = allPosts.slice(0, 5);
        displayPosts(firstFivePosts, "📌 Первые 5 новостей");
    }

    async function loadRandomNews() {
        const loaded = await loadAllData();
        if (!loaded) return;

        const randomUserId = Math.floor(Math.random() * 10) + 1;
        const filtered = getFilteredPosts({ userId: randomUserId });

        if (filtered.length === 0) {
            showError("⚠️ Нет постов для этого пользователя");
            return;
        }

        displayPosts(filtered, `👤 Новости пользователя #${randomUserId} (${filtered.length} постов)`);
    }

    if (loadNewsBtn) {
        loadNewsBtn.addEventListener("click", loadNews);
    }

    if (loadRandomBtn) {
        loadRandomBtn.addEventListener("click", loadRandomNews);
    }
})();
