/**
 * 1. Главная и Навигация
 */
function goHome() {
    // Сбрасываем поиск
    const searchInput = document.querySelector('.ks-search-input');
    if (searchInput) searchInput.value = '';
    ksSearch('');

    // Скролл вверх
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Визуальное переключение табов в навигации
    document.getElementById('nav-home').classList.add('active');
    document.getElementById('nav-issues').classList.remove('active');
}

/**
 * 2. Управление Модальным окном
 */
const ksModal = {
    get el() { return document.getElementById('ks-modal'); },
    open() { 
        this.el.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
    },
    close() { 
        this.el.style.display = 'none'; 
        document.body.style.overflow = 'auto'; 
    }
};

// Закрытие при клике на темную область
window.onclick = function(event) {
    if (event.target === ksModal.el) ksModal.close();
};

/**
 * 3. Голосование
 */
function ksVote(btn) {
    const counter = btn.querySelector('b');
    let count = parseInt(counter.innerText);
    counter.innerText = count + 1;
    btn.disabled = true;
    btn.innerHTML = `Голос учтен (${count + 1})`;
}

/**
 * 4. Комментарии
 */
function ksToggleComments(id) {
    const box = document.getElementById(id);
    box.style.display = (box.style.display === "block") ? "none" : "block";
}

function ksAddComment(boxId, btn) {
    const input = btn.previousElementSibling;
    const text = input.value.trim();
    
    if (text) {
        const list = document.getElementById(boxId).querySelector('.ks-comment-list');
        const div = document.createElement('div');
        div.className = 'ks-comment-item';
        div.innerHTML = `<b>Вы:</b> ${text}`;
        list.appendChild(div);
        input.value = "";
    }
}

/**
 * 5. Поиск и Фильтр
 */
function ksSearch(val) {
    const query = val.toLowerCase();
    const cards = document.querySelectorAll('.ks-card');
    
    cards.forEach(card => {
        const content = card.innerText.toLowerCase();
        card.style.display = content.includes(query) ? "block" : "none";
    });
}

/**
 * 6. Сортировка
 */
function ksSort(type, btn) {
    const list = document.getElementById('ks-list');
    const cards = Array.from(list.children);
    
    document.querySelectorAll('.ks-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (type === 'votes') {
        cards.sort((a, b) => b.dataset.votes - a.dataset.votes);
    }
    
    cards.forEach(card => list.appendChild(card));
}

/**
 * 7. Создание новой проблемы
 */
function ksCreateIssue() {
    const title = document.getElementById('m-title').value;
    const desc = document.getElementById('m-desc').value;

    if (!title || !desc) return alert("Заполните, пожалуйста, все поля.");

    const id = Date.now();
    const newCard = `
        <article class="ks-card" data-votes="0">
            <div class="ks-card-body">
                <div class="ks-card-content">
                    <div class="ks-meta">Новое • Только что</div>
                    <h3>${title}</h3>
                    <span class="ks-tag tag-yellow" style="background:#dcfce7; color:#166534">Опубликовано</span>
                    <p>${desc}</p>
                </div>
            </div>
            <div class="ks-card-footer">
                <button class="ks-btn-vote" onclick="ksVote(this)">Голосовать (<b>0</b>)</button>
                <button class="ks-btn-secondary" onclick="ksToggleComments('box-${id}')">Оставить комментарий</button>
            </div>
            <div id="box-${id}" class="ks-comment-section">
                <div class="ks-comment-list"></div>
                <div class="ks-comment-form">
                    <input type="text" placeholder="Ваш ответ...">
                    <button onclick="ksAddComment('box-${id}', this)">Отправить</button>
                </div>
            </div>
        </article>
    `;

    document.getElementById('ks-list').insertAdjacentHTML('afterbegin', newCard);
    
    // Чистим форму и закрываем
    document.getElementById('m-title').value = "";
    document.getElementById('m-desc').value = "";
    ksModal.close();
}