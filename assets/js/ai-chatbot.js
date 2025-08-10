// ai-chatbot.js
document.addEventListener("DOMContentLoaded", function() {
    // Variabel state chatbot
    let isChatbotOpen = false;
    let isDragging = false;
    let offsetX, offsetY;
    let isMinimized = false;
    const chatHistory = [];

    // Elemen DOM
    const container = document.getElementById('chatbot-container');
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const minimizeBtn = document.getElementById('chatbot-minimize');
    const messagesContainer = document.getElementById('chatbot-messages');
    const inputField = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');

    // Pastikan chatbot tertutup saat pertama kali
    container.classList.remove('active');
    container.style.display = 'none';

    // Buka/tutup chatbot
    toggleBtn.addEventListener('click', () => {
        isChatbotOpen = !isChatbotOpen;
        if (isChatbotOpen) {
            container.style.display = 'flex';
            container.classList.add('active');
            inputField.focus();
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        } else {
            container.classList.remove('active');
            setTimeout(() => {
                container.style.display = 'none';
            }, 300); // Sesuaikan dengan durasi transisi CSS
        }
    });

    // Tutup chatbot - perbaikan di sini
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Mencegah event bubbling
        isChatbotOpen = false;
        container.classList.remove('active');
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
    });

    // Minimize chatbot
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMinimized = !isMinimized;
        container.classList.toggle('minimized', isMinimized);
    });

    // Drag handler untuk header
    const header = container.querySelector('.chatbot-header');
    header.addEventListener('mousedown', startDrag);

    function startDrag(e) {
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;
        
        container.style.cursor = 'grabbing';
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    function drag(e) {
        if (!isDragging) return;
        
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.top = `${e.clientY - offsetY}px`;
        container.style.right = 'auto';
        container.style.bottom = 'auto';
    }

    function stopDrag() {
        isDragging = false;
        container.style.cursor = 'default';
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // Tambahkan pesan ke chat
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        
        // Scroll ke bawah
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Tampilkan indikator typing
    // Ganti fungsi showTypingIndicator dengan ini
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator bot-message';
  typingDiv.id = 'typing-indicator';
  
  // Pilih salah satu animasi (atau buat random):
  const animationType = Math.floor(Math.random() * 3); // 0-2
  
  switch(animationType) {
    case 0: // Bouncing dots
      typingDiv.innerHTML = `
        <div class="bouncing-dots">
          <span class="dot dot1"></span>
          <span class="dot dot2"></span>
          <span class="dot dot3"></span>
        </div>
        <span class="typing-text">typing...</span>
      `;
      break;
      
    case 1: // Wave animation
      typingDiv.innerHTML = `
        <div class="wave-animation">
          <span class="wave-dot"></span>
          <span class="wave-dot"></span>
          <span class="wave-dot"></span>
          <span class="wave-dot"></span>
          <span class="wave-dot"></span>
        </div>
        <span class="typing-text">typing...</span>
      `;
      break;
      
    case 2: // Typing bar animation
      typingDiv.innerHTML = `
        <div class="typing-bars">
          <span class="bar bar1"></span>
          <span class="bar bar2"></span>
          <span class="bar bar3"></span>
          <span class="bar bar4"></span>
          <span class="bar bar5"></span>
        </div>
        <span class="typing-text">typing...</span>
      `;
      break;
  }
  
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

    // Hapus indikator typing
    function hideTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    // Kirim pesan
    function sendMessage() {
        const message = inputField.value.trim();
        if (!message) return;
        
        // Tambahkan ke history
        chatHistory.push({ role: 'user', content: message });
        
        // Tampilkan pesan user
        addMessage(message, true);
        inputField.value = '';
        
        // Tampilkan typing indicator
        showTypingIndicator();
        
        // Kirim ke OpenRouter API
        fetchOpenRouterResponse(message);
    }

    // Handle Enter key
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Handle send button
    sendBtn.addEventListener('click', sendMessage);

    // Fungsi untuk mendapatkan respons dari OpenRouter
async function fetchOpenRouterResponse(message) {
    try {
        // Gunakan model gratis dari OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // Mengambil dari .env
                'HTTP-Referer': window.location.href,
                'X-Title': 'RaihanGimank Website'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b:free', // Model gratis yang tersedia
                messages: [
                    {
                        role: 'system',
                        content: 'Anda adalah asisten AI di website RaihanGimank, seorang content creator. Berikan respons yang ramah, santai, dan sesuai dengan gaya konten RaihanGimank. Gunakan bahasa yang santai dan mudah dipahami.'
                    },
                    ...chatHistory.slice(-6), // Ambil 6 pesan terakhir sebagai konteks
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        
        // Tambahkan ke history
        chatHistory.push({ role: 'assistant', content: botResponse });
        
        // Hapus typing indicator dan tampilkan respons
        hideTypingIndicator();
        addMessage(botResponse, false);
        
    } catch (error) {
        console.error('Error fetching AI response:', error);
        hideTypingIndicator();
        addMessage('Maaf, ada masalah saat menghubungi AI. Silakan coba lagi nanti.', false);
    }
}

    const openingMessages = [
  "Hai cuy! Ada yang bisa aku bantu? 😊",
  "Yo! Gimana nih? Mau nanya apa? 😎",
  "Halo-halo! RaihanGimank assistant di sini, ada yang bisa dibantu? ✌️"
];

// Pilih pesan pembuka secara acak
setTimeout(() => {
  const randomMessage = openingMessages[Math.floor(Math.random() * openingMessages.length)];
  addMessage(randomMessage, false);
}, 1000);

});