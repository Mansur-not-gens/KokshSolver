// --- Лента постов ---
const feedContainer = document.querySelector('.problems-feed');

// Получаем все посты с сервера
fetch("/api/posts")
  .then(res => res.json())
  .then(posts => {
    feedContainer.innerHTML = ''; // очищаем ленту

    posts.forEach(post => {
      // Получаем комментарии для каждого поста
      fetch(`/api/posts/${post.id}/comments`)
        .then(res => res.json())
        .then(comments => {
          const commentsHTML = comments.map(c =>
            `<div class="comment"><strong>${c.author || 'Пользователь'}:</strong> ${c.text}</div>`
          ).join('');

          const badgeColor = post.status === 'important' ? 'red' :
                             post.status === 'in_progress' ? 'yellow' : 'green';
          const statusText = post.status === 'important' ? 'Важное' :
                             post.status === 'in_progress' ? 'В работе' : 'Решено';
          const imgHTML = post.image_url ? `<img src="${post.image_url}" alt="${post.title}" class="feed-img">` : '';

          const postHTML = `
            <div class="problem-item ${post.status === 'solved' ? 'solved' : ''}">
              ${imgHTML}
              <div class="feed-content">
                <div class="feed-header">
                  <span class="badge ${badgeColor}">${statusText}</span>
                  <span class="date">${new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.content}</p>

                <div class="comments-block">
                  ${commentsHTML}
                  <form class="comment-form">
                    <input type="text" placeholder="Ваш комментарий...">
                    <button type="submit">Отправить</button>
                  </form>
                </div>

                <div class="feed-footer">
                  <span class="votes-count"><b>${post.votes}</b> голосов</span>
                  <button class="btn-vote">Голосовать</button>
                </div>
              </div>
            </div>
          `;

          feedContainer.insertAdjacentHTML('beforeend', postHTML);

          // Назначаем обработчики после вставки
          const currentPost = feedContainer.lastElementChild;

          // Голосование
          currentPost.querySelector('.btn-vote').addEventListener('click', () => {
            fetch(`/api/posts/${post.id}/vote`, { method: 'POST' })
              .then(res => res.json())
              .then(updated => {
                currentPost.querySelector('.votes-count b').textContent = updated.votes;
              });
          });

          // Комментарий
          const form = currentPost.querySelector('.comment-form');
          form.addEventListener('submit', e => {
            e.preventDefault();
            const input = form.querySelector('input');
            const text = input.value.trim();
            if(!text) return;

            fetch(`/api/posts/${post.id}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text })
            })
            .then(res => res.json())
            .then(newComment => {
              const commentsBlock = currentPost.querySelector('.comments-block');
              const div = document.createElement('div');
              div.className = 'comment';
              div.innerHTML = `<strong>${newComment.author || 'Пользователь'}:</strong> ${newComment.text}`;
              commentsBlock.insertBefore(div, form);
              input.value = '';
            });
          });
        });
    });
  })
  .catch(err => console.error('Ошибка загрузки постов:', err));


// --- Модальное окно создания поста ---
const modal = document.getElementById("postModal");
const openBtn = document.getElementById("openModal");
const closeBtn = modal.querySelector(".close");
const form = document.getElementById("newPostForm");
const message = document.getElementById("message");

// Открытие модалки
openBtn.onclick = () => modal.style.display = "block";

// Закрытие модалки
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if(e.target == modal) modal.style.display = "none"; }

// Отправка новой проблемы
form.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  // Картинка не обязательна
  if(!data.image_url) delete data.image_url;

  fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(post => {
    message.textContent = "Проблема успешно создана!";
    form.reset();
    setTimeout(() => modal.style.display = "none", 1000);

    // Добавляем новый пост в ленту
    addPostToFeed(post);
  })
  .catch(err => {
    message.textContent = "Ошибка при создании проблемы.";
    console.error(err);
  });
});

// --- Функция добавления нового поста в ленту ---
function addPostToFeed(post) {
  const feedContainer = document.querySelector('.problems-feed');
  const badgeColor = post.status === 'important' ? 'red' :
                     post.status === 'in_progress' ? 'yellow' : 'green';
  const statusText = post.status === 'important' ? 'Важное' :
                     post.status === 'in_progress' ? 'В работе' : 'Решено';
  const imgHTML = post.image_url ? `<img src="${post.image_url}" alt="${post.title}" class="feed-img">` : '';

  const postHTML = `
    <div class="problem-item ${post.status === 'solved' ? 'solved' : ''}">
      ${imgHTML}
      <div class="feed-content">
        <div class="feed-header">
          <span class="badge ${badgeColor}">${statusText}</span>
          <span class="date">${new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="comments-block">
          <form class="comment-form">
            <input type="text" placeholder="Ваш комментарий...">
            <button type="submit">Отправить</button>
          </form>
        </div>
        <div class="feed-footer">
          <span class="votes-count"><b>${post.votes}</b> голосов</span>
          <button class="btn-vote">Голосовать</button>
        </div>
      </div>
    </div>
  `;
  feedContainer.insertAdjacentHTML('afterbegin', postHTML);
    }
