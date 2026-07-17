export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export const createElement = (tag, attributes = {}, ...children) => {
  const el = document.createElement(tag);
  for (const key in attributes) {
    if (key.startsWith('on') && typeof attributes[key] === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
    } else if (key === 'className') {
      el.className = attributes[key];
    } else if (key === 'innerHTML') {
      el.innerHTML = attributes[key];
    } else {
      el.setAttribute(key, attributes[key]);
    }
  }
  
  children.forEach(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  
  return el;
};

export const mount = (selector, component) => {
  const container = typeof selector === 'string' ? $(selector) : selector;
  if (!container) return;
  container.innerHTML = '';
  if (typeof component === 'string') {
    container.innerHTML = component;
  } else if (component instanceof Node) {
    container.appendChild(component);
  }
};
