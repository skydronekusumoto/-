document.addEventListener('DOMContentLoaded', () => {
    const chatModal = document.getElementById('chatModal');
    const openChatBtn = document.getElementById('openChat');
    const closeChatBtn = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    openChatBtn?.addEventListener('click', () => {
        chatModal.classList.add('active');
        chatInput.focus();
    });

    closeChatBtn?.addEventListener('click', () => {
        chatModal.classList.remove('active');
    });

    chatModal?.addEventListener('click', (e) => {
        if (e.target === chatModal) {
            chatModal.classList.remove('active');
        }
    });

    navToggle?.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                if (window.innerWidth <= 968) {
                    navMenu.style.display = 'none';
                }
            }
        });
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.ok) {
                addMessage(data.message, 'bot');
                
                if (data.human) {
                    setTimeout(() => {
                        addMessage(
                            'より詳しいご相談は、スタッフまでお電話またはメールでお問い合わせください。',
                            'bot'
                        );
                    }, 1000);
                }
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage(
                '申し訳ございません。接続エラーが発生しました。しばらく経ってから再度お試しください。',
                'bot'
            );
        } finally {
            sendBtn.disabled = false;
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = text.replace(/\n/g, '<br>');
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn?.addEventListener('click', sendMessage);

    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        }
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.course-card, .gallery-item, .feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
