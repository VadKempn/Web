document.addEventListener('DOMContentLoaded', () => {
    const open = document.getElementById('openAuth');
    const close = document.getElementById('closeAuth');
    const modal = document.getElementById('authModal');

    if (open && close && modal) {
        open.addEventListener('click', () => modal.classList.add('open'));
        close.addEventListener('click', () => modal.classList.remove('open'));
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }
});
