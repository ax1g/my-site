(function() {
'use strict';

const langColor = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Lua: '#000080',
  Shell: '#89e051', Python: '#3572a5', HTML: '#e34c26',
  CSS: '#563d7c', Rust: '#dea584', Go: '#00add8',
};

/* ============================================
   THEME TOGGLE
   ============================================ */
const html = document.documentElement;
const themeBtn = document.querySelector('.theme-toggle');

const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
  html.classList.add('light-theme');
}

function toggleTheme() {
  html.classList.toggle('light-theme');
  const isLight = html.classList.contains('light-theme');
  const theme = isLight ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  themeBtn.innerHTML = `<i class="fa-regular fa-${isLight ? 'sun' : 'moon'} ti"></i>`;
}

themeBtn.addEventListener('click', toggleTheme);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    toggleTheme();
  }
});

/* ============================================
   CLOCK
   ============================================ */
function updateClock() {
  const clock = document.getElementById('clock');
  if (!clock) return;
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

updateClock();
setInterval(updateClock, 10000);

/* ============================================
   WORKSPACE SWITCHING
   ============================================ */
let currentWs = 0;
const wsButtons = document.querySelectorAll('.ws-btn');
const workspaces = document.querySelectorAll('.workspace');

function switchWs(index) {
  if (index === currentWs) return;
  wsButtons.forEach((btn, i) => btn.classList.toggle('active', i === index));
  workspaces.forEach((ws, i) => ws.classList.toggle('active', i === index));
  currentWs = index;
}

wsButtons.forEach((btn) => {
  btn.addEventListener('click', () => switchWs(parseInt(btn.dataset.ws)));
});

document.addEventListener('keydown', (e) => {
  const num = parseInt(e.key);
  if (num >= 1 && num <= 2 && !e.ctrlKey && !e.metaKey) {
    if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      switchWs(num - 1);
    }
  }
});


/* ============================================
   GITHUB REPOS
   ============================================ */
(async function fetchRepos() {
  const repoList = document.getElementById('repoList');
  if (!repoList) return;

  function render(repos) {
    const loading = repoList.querySelector('.repo-loading');
    if (loading) loading.remove();

    const container = document.createElement('div');
    container.className = 'repo-list';

    repos.forEach(repo => {
      const item = document.createElement('a');
      item.href = repo.html_url;
      item.target = '_blank';
      item.className = 'repo-item';

      const color = langColor[repo.language] || '#6c7086';

      item.innerHTML = `
        <div class="repo-top">
          <span class="repo-name">${repo.name}</span>
        </div>
        ${repo.description ? `<div class="repo-desc">${repo.description}</div>` : ''}
        <div class="repo-bottom">
          ${repo.language ? `<span class="repo-lang"><span class="repo-lang-dot" style="background:${color}"></span>${repo.language}</span>` : ''}
        </div>
      `;
      container.appendChild(item);
    });

    repoList.appendChild(container);
  }

  try {
    const cached = localStorage.getItem('github_repos');
    const cacheTime = localStorage.getItem('github_repos_time');
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 300000) {
      render(JSON.parse(cached));
      return;
    }
  } catch (_) {}

  try {
    const res = await fetch('https://api.github.com/users/ax1g/repos?sort=updated&per_page=50');
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const repos = await res.json();
    localStorage.setItem('github_repos', JSON.stringify(repos));
    localStorage.setItem('github_repos_time', String(Date.now()));
    render(repos);
  } catch (err) {
    const el = repoList.querySelector('.repo-loading');
    if (el) {
      el.className = 'repo-error';
      el.textContent = '❌ Failed to fetch repos. Try again later.';
    }
  }
})();

/* ============================================
   FEATURED REPOS
   ============================================ */
(async function fetchFeaturedRepos() {
  const container = document.getElementById('featuredRepos');
  if (!container) return;

  const featuredRepos = ['neco', 'pin', 'cms'];
  const icons = { neco: 'fa-coins', pin: 'fa-link', cms: 'fa-database' };

  function render(repos) {
    container.innerHTML = '';
    repos.forEach(repo => {
      const item = document.createElement('a');
      item.href = repo.html_url;
      item.target = '_blank';
      item.className = 'featured-item';
      const color = langColor[repo.language] || '#6c7086';
      item.innerHTML = `
        <div class="featured-icon"><i class="fa-solid ${icons[repo.name] || 'fa-code'}"></i></div>
        <div class="featured-info">
          <span class="featured-name">${repo.name}</span>
          ${repo.description ? `<span class="featured-desc">${repo.description}</span>` : ''}
          <span class="featured-lang"><span class="repo-lang-dot" style="background:${color}"></span>${repo.language || 'N/A'}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  try {
    const cached = localStorage.getItem('github_featured');
    const cacheTime = localStorage.getItem('github_featured_time');
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 300000) {
      render(JSON.parse(cached));
      return;
    }
  } catch (_) {}

  try {
    const settled = await Promise.allSettled(
      featuredRepos.map(id =>
        fetch(`https://api.github.com/repos/ax1g/${id}`).then(r => {
          if (!r.ok) throw new Error(`${id}: ${r.status}`);
          return r.json();
        })
      )
    );
    const results = settled.filter(r => r.status === 'fulfilled').map(r => r.value);
    if (results.length === 0) throw new Error('no repos');
    localStorage.setItem('github_featured', JSON.stringify(results));
    localStorage.setItem('github_featured_time', String(Date.now()));
    render(results);
  } catch (_) {
    container.innerHTML = '';
  }
})();

/* ============================================
   COMMAND PALETTE
   ============================================ */
const cmdPalette = document.getElementById('cmdPalette');
const cmdInput = document.querySelector('.cmd-input');
const cmdResults = document.querySelector('.cmd-results');

const commands = [
  { name: 'Profile', desc: 'About, experience, education, tech stack', action: () => switchWs(0) },
  { name: 'Projects & Contact', desc: 'Featured work, GitHub repos, contact', action: () => switchWs(1) },
  { name: 'Toggle Theme', desc: 'Switch dark/light', action: toggleTheme },
  { name: 'Copy Email', desc: 'theankushgautam@gmail.com', action: () => copyToClipboard('theankushgautam@gmail.com') },
  { name: 'Open GitHub', desc: 'github.com/ax1g', action: () => window.open('https://github.com/ax1g', '_blank') },
  { name: 'Open Monkeytype', desc: 'monkeytype.com/profile/ax1g_', action: () => window.open('https://monkeytype.com/profile/ax1g_', '_blank') },
];

let cmdActiveIdx = -1;

function openCmdPalette() {
  cmdPalette.hidden = false;
  cmdInput.value = '';
  cmdActiveIdx = -1;
  cmdInput.focus();
  renderCommands(commands);
}

function closeCmdPalette() {
  cmdPalette.hidden = true;
  cmdInput.value = '';
}

function renderCommands(cmds) {
  cmdResults.innerHTML = '';
  if (cmds.length === 0) {
    const li = document.createElement('li');
    li.className = 'cmd-result-item';
    li.textContent = 'No results found.';
    li.style.color = 'var(--overlay1)';
    cmdResults.appendChild(li);
    return;
  }

  cmds.forEach((cmd, index) => {
    const li = document.createElement('li');
    li.className = 'cmd-result-item';
    li.dataset.index = index;
    li.innerHTML = `${cmd.name} <span class="cmd-desc">${cmd.desc}</span>`;
    li.addEventListener('click', () => {
      cmd.action();
      closeCmdPalette();
    });
    cmdResults.appendChild(li);
  });
}

cmdInput.addEventListener('input', (e) => {
  cmdActiveIdx = -1;
  const q = e.target.value.toLowerCase();
  const filtered = commands.filter(c =>
    c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
  );
  renderCommands(filtered);
});

function updateActiveItem() {
  const items = cmdResults.querySelectorAll('.cmd-result-item');
  items.forEach((item, i) => item.classList.toggle('active', i === cmdActiveIdx));
  if (cmdActiveIdx >= 0 && cmdActiveIdx < items.length) {
    items[cmdActiveIdx].scrollIntoView({ block: 'nearest' });
  }
}

cmdInput.addEventListener('keydown', (e) => {
  const items = cmdResults.querySelectorAll('.cmd-result-item:not([style*="color"])');
  if (e.key === 'Enter') {
    const selected = cmdResults.querySelector('.cmd-result-item.active');
    if (selected && selected.dataset.index !== undefined) {
      commands[parseInt(selected.dataset.index)].action();
      closeCmdPalette();
    } else if (items.length > 0 && items[0].dataset.index !== undefined) {
      commands[parseInt(items[0].dataset.index)].action();
      closeCmdPalette();
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    cmdActiveIdx = Math.min(cmdActiveIdx + 1, items.length - 1);
    updateActiveItem();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    cmdActiveIdx = Math.max(cmdActiveIdx - 1, 0);
    updateActiveItem();
  } else if (e.key === 'Escape') {
    closeCmdPalette();
  }
});

cmdPalette.addEventListener('click', (e) => {
  if (e.target === cmdPalette || e.target.classList.contains('modal-overlay')) closeCmdPalette();
});

/* / and Ctrl+K */
document.addEventListener('keydown', (e) => {
  if (cmdPalette.hidden && (e.key === '/' || (e.ctrlKey && e.key === 'k'))) {
    if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      openCmdPalette();
    }
  }
});

/* ============================================
   HELP MODAL
   ============================================ */
const helpModal = document.getElementById('helpModal');

function openHelp() {
  helpModal.hidden = false;
}

function closeHelp() {
  helpModal.hidden = true;
}

document.addEventListener('keydown', (e) => {
  if (e.key === '?' && helpModal.hidden && cmdPalette.hidden) {
    e.preventDefault();
    openHelp();
  }
  if (e.key === 'Escape') {
    if (!helpModal.hidden) closeHelp();
    else if (!cmdPalette.hidden) closeCmdPalette();
  }
});

helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal || e.target.classList.contains('modal-overlay')) closeHelp();
});

document.querySelector('.close-help')?.addEventListener('click', closeHelp);

/* ============================================
   EASTER EGGS
   ============================================ */
const vimTrap = document.getElementById('vimTrap');
let keyBuffer = '';
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIdx = 0;

document.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-25);

  // Vim trap
  if (keyBuffer.match(/(?:^|\W)(vim)$/) && vimTrap.hidden) {
    vimTrap.hidden = false;
    keyBuffer = '';
  }

  // :q to escape vim
  if (keyBuffer.includes(':q') && !vimTrap.hidden) {
    vimTrap.hidden = true;
    keyBuffer = '';
  }

  // Escape vim
  if (e.key === 'Escape' && !vimTrap.hidden) {
    vimTrap.hidden = true;
    keyBuffer = '';
  }

  // Sudo sandwich
  if (keyBuffer.includes('sudomakemeasandwich')) {
    showToast('🥪 Access granted. Sandwich made!');
    keyBuffer = '';
  }

  // Konami code
  if (e.key === konamiCode[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konamiCode.length) {
      showToast('🎉 Konami Code Activated! You found the secret!');
      konamiIdx = 0;
    }
  } else {
    konamiIdx = 0;
  }
});

/* Close vim trap on overlay click */
vimTrap.addEventListener('click', (e) => {
  if (e.target === vimTrap || e.target.classList.contains('modal-overlay')) {
    vimTrap.hidden = true;
  }
});

/* ============================================
   UTILITY: COPY TO CLIPBOARD
   ============================================ */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`📋 Copied: ${text}`);
  }).catch(() => {
    showToast('❌ Failed to copy');
  });
}

/* ============================================
   UTILITY: TOAST
   ============================================ */
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ============================================
   SKIP LINK
   ============================================ */
const skipLink = document.createElement('a');
skipLink.href = '#desktop';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
document.body.insertBefore(skipLink, document.body.firstChild);

/* ============================================
   CONSOLE EASTER EGG
   ============================================ */
console.log('%c🟢 ax1g — desktop portfolio', 'color: #cba6f7; font-size: 16px; font-weight: bold;');
console.log('%c[1-2] workspaces  [?] help  [/] palette  [Ctrl+D] theme', 'color: #a6adc8; font-size: 12px;');
console.log('%cTry "vim", Konami ↑↑↓↓←→←→BA, or "sudo make me a sandwich"', 'color: #a6adc8; font-size: 12px;');

})();
