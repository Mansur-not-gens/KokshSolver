const feedContainer = document.querySelector('.problems-feed');

// Получаем все посты
fetch("/api/posts")
  .then(res => res.json())
  .then(posts => {
    feedContainer.innerHTML = '';

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

          const postHTML = `
            <div class="problem-item ${post.status === 'solved' ? 'solved' : ''}">
              <img src="${post.image_url}" alt="${post.title}" class="feed-img">
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

          // Голосовать
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
