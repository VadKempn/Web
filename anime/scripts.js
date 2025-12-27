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
                box.style.fontSize = "0.85rem";
                box.style.color = "#999";
                box.style.marginTop = "10px";
                footer.appendChild(box);
            }
            box.textContent = `⏱️ Время загрузки: ${loadSec} сек.`;
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
    const closeBtns = document.querySelectorAll("#closeAuth, #closeAuthBtn");
    const modal     = document.getElementById("authModal");
    const form      = document.getElementById("authForm");

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => modal.classList.add("open"));
    }

    closeBtns.forEach(btn => {
        if (btn && modal) {
            btn.addEventListener("click", () => modal.classList.remove("open"));
        }
    });

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("✅ Вход выполнен (демо-режим).");
            modal.classList.remove("open");
            form.reset();
        });
    }

    if (document.getElementById('newsFeed')) {
        initNewsPage();
    }

    function initNewsPage() {
        const loadNewsBtn = document.getElementById('loadNews');
        const loadRandomNewsBtn = document.getElementById('loadRandomNews');
        const newsLoader = document.getElementById('newsLoader');
        const newsError = document.getElementById('newsError');
        const filterBadge = document.getElementById('filterBadge');
        const newsFeed = document.getElementById('newsFeed');
        const postTemplate = document.getElementById('postTemplate');
        const commentTemplate = document.getElementById('commentTemplate');

        if (!loadNewsBtn || !loadRandomNewsBtn) return;

        loadNewsBtn.addEventListener('click', () => loadNews(false));
        loadRandomNewsBtn.addEventListener('click', () => loadNews(true));

        async function loadNews(randomFilter = false) {
            showLoader();
            hideError();

            try {
                let url = 'https://jsonplaceholder.typicode.com/posts?_limit=6';

                if (randomFilter) {
                    const userId = Math.floor(Math.random() * 10) + 1;
                    url = `https://jsonplaceholder.typicode.com/posts?userId=${userId}&_limit=6`;
                    showFilterBadge(`🎲 Фильтр: автор #${userId}`);
                }

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const posts = await response.json();
                if (posts.length === 0) {
                    throw new Error('Новости не найдены');
                }

                renderPosts(posts);

            } catch (error) {
                handleError(error);
            }
        }

        function renderPosts(posts) {
            hideLoader();
            newsFeed.innerHTML = '';

            posts.forEach(post => {
                const clone = postTemplate.content.cloneNode(true);
                const article = clone.querySelector('.post-card');

                clone.querySelector('.post-title').textContent = post.title;
                clone.querySelector('.post-body').textContent = post.body.substring(0, 150) + '...';
                clone.querySelector('.post-id').textContent = `#${post.id}`;
                clone.querySelector('.post-author').textContent = `User ${post.userId}`;

                const toggleBtn = clone.querySelector('.toggle-comments');
                const commentsSection = clone.querySelector('.comments-section');

                toggleBtn.addEventListener('click', () => {
                    if (commentsSection.classList.contains('hidden')) {
                        loadComments(post.id, clone.querySelector('.comments-list'));
                    }
                    commentsSection.classList.toggle('hidden');
                });

                newsFeed.appendChild(clone);
            });
        }

        async function loadComments(postId, container) {
            try {
                const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}&_limit=3`);
                const comments = await response.json();

                container.innerHTML = '';
                comments.forEach(comment => {
                    const clone = commentTemplate.content.cloneNode(true);
                    clone.querySelector('.comment-author').textContent = comment.name;
                    clone.querySelector('.comment-email').textContent = comment.email;
                    clone.querySelector('.comment-body').textContent = comment.body.substring(0, 100) + '...';
                    container.appendChild(clone);
                });

                const toggleBtn = container.closest('.post-card').querySelector('.toggle-comments');
                toggleBtn.textContent = `Комментарии (${comments.length})`;

            } catch (error) {
                container.innerHTML = '<div style="color: #999; font-style: italic;">Ошибка загрузки комментариев</div>';
            }
        }

        // ЛР6: UI состояния
        function showLoader() {
            newsLoader.classList.remove('hidden');
            newsFeed.classList.add('hidden');
            loadNewsBtn.disabled = true;
            loadRandomNewsBtn.disabled = true;
        }

        function hideLoader() {
            newsLoader.classList.add('hidden');
            newsFeed.classList.remove('hidden');
            loadNewsBtn.disabled = false;
            loadRandomNewsBtn.disabled = false;
        }

        function showFilterBadge(text) {
            filterBadge.textContent = text;
            filterBadge.classList.remove('hidden');
        }

        function hideError() {
            newsError.classList.add('hidden');
            filterBadge.classList.add('hidden');
        }

        function handleError(error) {
            hideLoader();
            console.error('🚫 Ошибка API:', error);

            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                showError('Ошибка сети.');
            } else if (error.message.startsWith('HTTP')) {
                showError(`Серверная ошибка: ${error.message}`);
            } else {
                showError(`ошибка: ${error.message}`);
            }
        }

        function showError(message) {
            newsError.textContent = message;
            newsError.classList.remove('hidden');
        }
    }
})();
