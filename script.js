// ChatForge - Fake Chat Generator Logic
document.addEventListener('DOMContentLoaded', () => {
    const inputName = document.getElementById('input-name');
    const inputStatus = document.getElementById('input-status');
    const inputAvatar = document.getElementById('input-avatar');
    const inputAvatarFile = document.getElementById('input-avatar-file');
    const avatarFilename = document.getElementById('avatar-filename');
    const inputMessage = document.getElementById('input-message');
    const addMeBtn = document.getElementById('add-me');
    const addThemBtn = document.getElementById('add-them');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    const previewName = document.getElementById('preview-name');
    const previewStatus = document.getElementById('preview-status');
    const previewAvatar = document.getElementById('preview-avatar');
    const messagesArea = document.getElementById('messages-area');
    const chatPreview = document.getElementById('chat-preview');
    const themeLight = document.getElementById('theme-light');
    const themeDark = document.getElementById('theme-dark');
    const copyTextBtn = document.getElementById('copy-text-btn');

    // Theme Toggle
    themeLight.addEventListener('click', () => {
        chatPreview.classList.remove('dark-mode');
        themeLight.classList.add('bg-white/10', 'text-white');
        themeLight.classList.remove('text-gray-500');
        themeDark.classList.remove('bg-white/10', 'text-white');
        themeDark.classList.add('text-gray-500');
    });

    themeDark.addEventListener('click', () => {
        chatPreview.classList.add('dark-mode');
        themeDark.classList.add('bg-white/10', 'text-white');
        themeDark.classList.remove('text-gray-500');
        themeLight.classList.remove('bg-white/10', 'text-white');
        themeLight.classList.add('text-gray-500');
    });

    // Copy Text
    copyTextBtn.addEventListener('click', () => {
        const messages = Array.from(messagesArea.querySelectorAll('.message-bubble span:first-child'))
            .map(span => span.textContent)
            .join('\n');
        
        if (!messages) {
            const originalText = copyTextBtn.textContent;
            copyTextBtn.textContent = 'No messages!';
            copyTextBtn.classList.add('text-red-400');
            setTimeout(() => {
                copyTextBtn.textContent = originalText;
                copyTextBtn.classList.remove('text-red-400');
            }, 2000);
            return;
        }

        navigator.clipboard.writeText(messages).then(() => {
            const originalText = copyTextBtn.textContent;
            copyTextBtn.textContent = 'Copied!';
            copyTextBtn.classList.add('text-blue-400');
            setTimeout(() => {
                copyTextBtn.textContent = originalText;
                copyTextBtn.classList.remove('text-blue-400');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    });

    // Update Header Info
    inputName.addEventListener('input', (e) => {
        previewName.textContent = e.target.value || 'Alex Rivera';
    });

    inputStatus.addEventListener('change', (e) => {
        previewStatus.textContent = e.target.value;
        if (e.target.value === 'Online') {
            previewStatus.className = 'text-[9px] text-green-500 font-bold';
        } else {
            previewStatus.className = 'text-[9px] text-gray-400 font-medium';
        }
    });

    inputAvatar.addEventListener('input', (e) => {
        if (e.target.value.trim()) {
            previewAvatar.src = e.target.value;
        } else {
            previewAvatar.src = 'https://picsum.photos/seed/user/100';
        }
    });

    inputAvatarFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            avatarFilename.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                previewAvatar.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Add Message Function
    const addMessage = (text, type) => {
        if (!text.trim()) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${type === 'me' ? 'message-me' : 'message-them'}`;
        
        // Create text node for safety
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        messageDiv.appendChild(textSpan);
        
        // Add timestamp
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeSpan = document.createElement('span');
        timeSpan.className = 'block text-[9px] opacity-50 mt-1 text-right';
        timeSpan.textContent = timeStr;
        messageDiv.appendChild(timeSpan);
        
        // Add click to remove functionality
        messageDiv.title = "Click to remove";
        messageDiv.style.cursor = "pointer";
        messageDiv.onclick = () => {
            messageDiv.style.transform = 'scale(0.9)';
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 200);
        };

        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        inputMessage.value = '';
        inputMessage.focus();
    };

    addMeBtn.addEventListener('click', () => addMessage(inputMessage.value, 'me'));
    addThemBtn.addEventListener('click', () => addMessage(inputMessage.value, 'them'));

    // Clear All
    clearBtn.addEventListener('click', () => {
        // Removed confirm() as it's often blocked in iframes
        messagesArea.innerHTML = '';
        const originalText = clearBtn.textContent;
        clearBtn.textContent = 'Messages Cleared';
        clearBtn.classList.add('text-red-400');
        setTimeout(() => {
            clearBtn.textContent = originalText;
            clearBtn.classList.remove('text-red-400');
        }, 2000);
    });

    // Download Screenshot
    downloadBtn.addEventListener('click', async () => {
        try {
            downloadBtn.disabled = true;
            const originalText = downloadBtn.innerHTML;
            downloadBtn.textContent = 'Generating...';

            // Ensure all content is visible for capture
            const originalHeight = messagesArea.style.height;
            const originalOverflow = messagesArea.style.overflow;
            
            // We want to capture the whole chat, not just the scrollable area
            // But usually users want the "phone" look.
            // Let's stick to the current view but ensure it's high quality.

            const canvas = await html2canvas(chatPreview, {
                backgroundColor: null,
                scale: 3, // Even higher quality
                logging: false,
                useCORS: true,
                allowTaint: true,
                onclone: (clonedDoc) => {
                    // Ensure the cloned element is visible and styled correctly
                    const clonedChat = clonedDoc.getElementById('chat-preview');
                    if (clonedChat) {
                        clonedChat.style.transform = 'none';
                        clonedChat.style.animation = 'none';
                    }
                }
            });

            const link = document.createElement('a');
            link.download = `chatforge-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        } catch (err) {
            console.error('Screenshot failed:', err);
            alert('Failed to generate screenshot. Please check if your avatar URL allows cross-origin access.');
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export Chat
            `;
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.onclick = () => {
            // Placeholder for mobile menu logic
            console.log('Mobile menu clicked');
        };
    }

    // Keyboard support
    inputMessage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addMeBtn.click();
        }
    });
});
