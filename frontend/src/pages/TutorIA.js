import { AIService } from '../services/aiService.js';
import { AuthUtils } from '../utils/auth.js';
import { ROUTES } from '../config/constants.js';

export const TutorIA = () => {
  const container = document.createElement('div');
  container.className = 'animate-fade-in flex h-full';
  container.style.margin = 'calc(var(--spacing-8) * -1)';
  container.style.height = 'calc(100% + var(--spacing-16))';

  let messages = [
    { 
      role: 'model', 
      content: '¡Hola! Soy tu Tutor IA de VAHARCA. Conozco tus lecciones y sé en qué temas has tenido dificultades. ¿Quieres repasar en qué te equivocaste o tienes alguna duda específica?'
    }
  ];
  let isTyping = false;
  
  const user = AuthUtils.getUser() || { nombre: 'Estudiante' };

  container.innerHTML = `
    <!-- Chat Sidebar History (Optional, could be hidden on mobile) -->
    <div style="width: 300px; border-right: 1px solid var(--color-border); background: var(--color-white); display: flex; flex-direction: column;">
      <div style="padding: var(--spacing-4);">
        <button class="btn btn-primary btn-block" style="justify-content: flex-start;" id="btn-new-chat">
          <i class="ph ph-plus"></i> Nuevo Chat
        </button>
      </div>
      
      <div style="flex: 1; overflow-y: auto; padding: 0 var(--spacing-4);">
        <div style="font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); margin: var(--spacing-4) 0 var(--spacing-2); text-transform: uppercase;">Hoy</div>
        <button class="btn btn-text btn-block" style="justify-content: flex-start; background: var(--color-border); color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <i class="ph ph-chat-circle"></i> Repaso de errores
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div style="flex: 1; display: flex; flex-direction: column; background: var(--color-background); position: relative;">
      
      <!-- Messages List -->
      <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: var(--spacing-8); display: flex; flex-direction: column; gap: var(--spacing-6);">
      </div>

      <!-- Input Area -->
      <div style="padding: var(--spacing-6) var(--spacing-8); background: linear-gradient(0deg, var(--color-background) 60%, rgba(248,248,252,0) 100%); position: sticky; bottom: 0;">
        <div style="position: relative; max-width: 800px; margin: 0 auto; box-shadow: var(--shadow-lg); border-radius: var(--radius-xl); background: var(--color-white); border: 1px solid var(--color-border);">
          <textarea id="chat-input" rows="1" placeholder="Escribe al Tutor IA..." style="width: 100%; border: none; padding: var(--spacing-4) 60px var(--spacing-4) var(--spacing-6); border-radius: var(--radius-xl); font-size: 1rem; resize: none; max-height: 200px; outline: none; line-height: 1.5; font-family: inherit; background: transparent;"></textarea>
          
          <button id="chat-send" style="position: absolute; right: 12px; bottom: 12px; width: 36px; height: 36px; background: var(--color-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: transform var(--transition-fast);">
            <i class="ph-fill ph-paper-plane-right" style="font-size: 1.2rem;"></i>
          </button>
        </div>
        <div style="text-align: center; font-size: 0.7rem; color: var(--color-text-muted); margin-top: var(--spacing-2);">
          El tutor lee tu progreso para ayudarte mejor, pero puede equivocarse.
        </div>
      </div>
    </div>
  `;

  const chatMessagesEl = container.querySelector('#chat-messages');
  const chatInput = container.querySelector('#chat-input');
  const chatSend = container.querySelector('#chat-send');
  const btnNewChat = container.querySelector('#btn-new-chat');

  // Markdown simple formatter for bold and code
  const formatText = (text) => {
    let formatted = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  };

  const renderMessages = () => {
    chatMessagesEl.innerHTML = messages.map(msg => {
      if (msg.role === 'model') {
        return `
          <div style="display: flex; gap: var(--spacing-4); max-width: 85%;">
            <div style="width: 36px; height: 36px; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
              <i class="ph ph-brain"></i>
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 4px;">Tutor IA</div>
              <div class="card" style="margin: 0; padding: var(--spacing-4) var(--spacing-6); border: 1px solid var(--color-border);">
                <p style="margin: 0;">${formatText(msg.content)}</p>
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div style="display: flex; gap: var(--spacing-4); max-width: 80%; align-self: flex-end; flex-direction: row-reverse;">
            <div class="avatar" style="flex-shrink: 0; background: var(--color-border); color: var(--color-text);">
               <img src="https://ui-avatars.com/api/?name=${user.nombre}&background=random" style="border-radius: 50%; width: 100%; height: 100%;" />
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; text-align: right;">Tú</div>
              <div style="background: var(--color-primary-light); color: white; padding: var(--spacing-4); border-radius: var(--radius-lg); border-top-right-radius: 0; line-height: 1.6;">
                ${msg.content}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    if (isTyping) {
      chatMessagesEl.innerHTML += `
        <div style="display: flex; gap: var(--spacing-4); max-width: 85%;">
          <div style="width: 36px; height: 36px; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
            <i class="ph ph-brain"></i>
          </div>
          <div style="flex: 1; display: flex; align-items: center;">
            <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 4px;">Tutor IA</div>
            <div class="card" style="margin: 0; padding: var(--spacing-2) var(--spacing-4); margin-left: 8px; border: 1px solid var(--color-border); display: flex; gap: 4px;">
              <span class="ph-spin"><i class="ph ph-spinner"></i></span> Pensando...
            </div>
          </div>
        </div>
      `;
    }

    // Scroll to bottom
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  };

  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text || isTyping) return;

    messages.push({ role: 'user', content: text });
    chatInput.value = '';
    chatInput.style.height = 'auto';
    isTyping = true;
    renderMessages();

    try {
      const res = await AIService.chatTutor(messages);
      messages.push({ role: 'model', content: res.respuesta });
    } catch (error) {
      messages.push({ role: 'model', content: 'Lo siento, tuve un problema de conexión al procesar tu solicitud.' });
    } finally {
      isTyping = false;
      renderMessages();
    }
  };

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  btnNewChat.addEventListener('click', () => {
    messages = [messages[0]]; // Reset to welcome message
    renderMessages();
  });

  // Auto-resize textarea logic
  setTimeout(() => {
    if (chatInput) {
      chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 200 ? this.scrollHeight : 200) + 'px';
      });
    }
    renderMessages();
  }, 100);

  return container;
};
