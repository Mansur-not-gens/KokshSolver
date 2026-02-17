// Ждем полной загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    
    // Плавная прокрутка к секциям
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80; // Отступ, чтобы шапка не закрывала заголовок
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    console.log("KokshSolver: Скрипты подключены и готовы к работе.");
});