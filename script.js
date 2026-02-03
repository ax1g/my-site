/* ============================================
   THEME TOGGLE
   ============================================ */
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

// Load saved theme or default to dark
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
	html.classList.add('light-theme');
}

themeToggle.addEventListener('click', toggleTheme);

function toggleTheme() {
	html.classList.toggle('light-theme');
	const theme = html.classList.contains('light-theme') ? 'light' : 'dark';
	localStorage.setItem('theme', theme);
}

// Keyboard shortcut: Ctrl+D
document.addEventListener('keydown', (e) => {
	if (e.ctrlKey && e.key === 'd') {
		e.preventDefault();
		toggleTheme();
	}
});

/* ============================================
   TYPEWRITER EFFECT
   ============================================ */
function typewriter(element, text, speed = 60) {
	let i = 0;
	element.textContent = '';

	function type() {
		if (i < text.length) {
			element.textContent += text.charAt(i);
			i++;
			setTimeout(type, speed);
		}
	}

	type();
}

// Apply typewriter to hero name on page load
window.addEventListener('load', () => {
	const heroName = document.querySelector('.hero h2');
	if (heroName) {
		const nameText = heroName.textContent.trim();
		typewriter(heroName, nameText, 80);
	}
	updateTimestamp();
});

/* ============================================
   COMMAND PALETTE
   ============================================ */
const cmdPaletteModal = document.getElementById('cmdPalette');
const cmdPaletteTrigger = document.querySelector('.cmd-palette-trigger');
const cmdInput = document.querySelector('.cmd-input');
const cmdResults = document.querySelector('.cmd-results');

// Command registry
const commands = [
	{ name: 'Home', command: 'goto home', action: () => scrollToSection('home') },
	{ name: 'About', command: 'goto about', action: () => scrollToSection('about') },
	{ name: 'Skills', command: 'goto skills', action: () => scrollToSection('skills') },
	{ name: 'Experience', command: 'goto experience', action: () => scrollToSection('experience') },
	{ name: 'Projects', command: 'goto projects', action: () => scrollToSection('projects') },
	{ name: 'Education', command: 'goto education', action: () => scrollToSection('education') },
	{ name: 'Contact', command: 'goto contact', action: () => scrollToSection('contact') },
	{ name: 'Toggle Theme', command: 'theme toggle', action: toggleTheme },
	{ name: 'Copy Email', command: 'copy email', action: () => copyToClipboard('theankushgautam@gmail.com') },
	{ name: 'GitHub', command: 'visit github', action: () => window.open('https://github.com/Ankush-Gautam', '_blank') },
];

// Open command palette
function openCmdPalette() {
	cmdPaletteModal.hidden = false;
	cmdInput.focus();
	renderCommands(commands);
}

// Close command palette
function closeCmdPalette() {
	cmdPaletteModal.hidden = true;
	cmdInput.value = '';
}

// Render commands in results list
function renderCommands(cmds) {
	cmdResults.innerHTML = '';
	if (cmds.length === 0) {
		const noResults = document.createElement('li');
		noResults.className = 'cmd-result-item';
		noResults.textContent = 'No results found';
		noResults.style.color = 'var(--text-muted)';
		cmdResults.appendChild(noResults);
		return;
	}
	cmds.forEach((cmd, index) => {
		const li = document.createElement('li');
		li.className = 'cmd-result-item';
		li.textContent = `${cmd.command} - ${cmd.name}`;
		li.dataset.index = index;
		li.addEventListener('click', () => {
			cmd.action();
			closeCmdPalette();
		});
		cmdResults.appendChild(li);
	});
}

// Filter commands based on input
cmdInput.addEventListener('input', (e) => {
	const query = e.target.value.toLowerCase();
	const filtered = commands.filter(
		(cmd) => cmd.name.toLowerCase().includes(query) || cmd.command.toLowerCase().includes(query)
	);
	renderCommands(filtered);
});

// Keyboard shortcuts for command palette
cmdPaletteTrigger.addEventListener('click', openCmdPalette);

document.addEventListener('keydown', (e) => {
	// Open with / or Ctrl+K (unless typing in input)
	if (cmdPaletteModal.hidden && (e.key === '/' || (e.ctrlKey && e.key === 'k'))) {
		if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
			e.preventDefault();
			openCmdPalette();
		}
	}

	// Close with ESC
	if (e.key === 'Escape' && !cmdPaletteModal.hidden) {
		closeCmdPalette();
	}

	// Execute command with Enter
	if (e.key === 'Enter' && !cmdPaletteModal.hidden) {
		const items = cmdResults.querySelectorAll('.cmd-result-item');
		if (items.length > 0) {
			const firstItem = items[0];
			if (firstItem.style.color !== 'var(--text-muted)') {
				const index = Array.from(items).indexOf(firstItem);
				commands[index].action();
				closeCmdPalette();
			}
		}
	}

	// Arrow key navigation in command palette
	if (!cmdPaletteModal.hidden && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
		e.preventDefault();
		const items = Array.from(cmdResults.querySelectorAll('.cmd-result-item'));
		const currentItem = cmdResults.querySelector('.cmd-result-item:hover');
		let nextIndex = 0;

		if (currentItem && currentItem.style.color !== 'var(--text-muted)') {
			const currentIndex = items.indexOf(currentItem);
			nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
			nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
		}

		// Simulate hover on next item
		items.forEach((item, i) => {
			if (i === nextIndex && item.style.color !== 'var(--text-muted)') {
				item.scrollIntoView({ block: 'nearest' });
			}
		});
	}
});

// Close modal on background click
cmdPaletteModal.addEventListener('click', (e) => {
	if (e.target === cmdPaletteModal) {
		closeCmdPalette();
	}
});

/* ============================================
   SMOOTH SCROLL TO SECTION
   ============================================ */
function scrollToSection(sectionId) {
	const section = document.getElementById(sectionId);
	if (section) {
		section.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
}

/* ============================================
   HELP MODAL
   ============================================ */
const helpModal = document.getElementById('helpModal');

function openHelpModal() {
	helpModal.hidden = false;
}

function closeHelpModal() {
	helpModal.hidden = true;
}

document.addEventListener('keydown', (e) => {
	// Open help with ?
	if (e.key === '?' && helpModal.hidden) {
		e.preventDefault();
		openHelpModal();
	}

	// Close help with ESC
	if (e.key === 'Escape' && !helpModal.hidden) {
		closeHelpModal();
	}
});

helpModal.addEventListener('click', (e) => {
	if (e.target === helpModal) {
		closeHelpModal();
	}
});

/* ============================================
   EASTER EGGS
   ============================================ */

// A. VIM TRAP
const vimTrapModal = document.getElementById('vimTrap');
let keyBuffer = '';

document.addEventListener('keydown', (e) => {
	// Build key buffer
	keyBuffer += e.key.toLowerCase();
	if (keyBuffer.length > 10) {
		keyBuffer = keyBuffer.slice(-10);
	}

	// Detect "vim"
	if (keyBuffer.includes('vim') && vimTrapModal.hidden) {
		vimTrapModal.hidden = false;
		keyBuffer = '';
	}

	// Detect :q to close
	if (keyBuffer.includes(':q') && !vimTrapModal.hidden) {
		vimTrapModal.hidden = true;
		keyBuffer = '';
	}

	// Close with ESC
	if (e.key === 'Escape' && !vimTrapModal.hidden) {
		vimTrapModal.hidden = true;
		keyBuffer = '';
	}
});

// B. KONAMI CODE
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
	if (e.key === konamiCode[konamiIndex]) {
		konamiIndex++;
		if (konamiIndex === konamiCode.length) {
			triggerKonamiEasterEgg();
			konamiIndex = 0;
		}
	} else {
		konamiIndex = 0;
	}
});

function triggerKonamiEasterEgg() {
	showToast(`🎉 Konami Code Activated! You found the secret!`);
}

// C. SUDO COMMAND
document.addEventListener('keydown', (e) => {
	keyBuffer = keyBuffer.toLowerCase();
	if (keyBuffer.includes('sudomakemeasandwich')) {
		showToast('🥪 Access granted. Sandwich made!');
		keyBuffer = '';
	}
});

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Copy to clipboard
function copyToClipboard(text) {
	navigator.clipboard.writeText(text).then(() => {
		showToast(`📋 Copied: ${text}`);
	});
}

// Update timestamp in footer
function updateTimestamp() {
	const timestampEl = document.getElementById('timestamp');
	if (timestampEl) {
		const now = new Date();
		timestampEl.textContent = now.toLocaleString();
	}
}

// Update timestamp every minute
setInterval(updateTimestamp, 60000);

// Toast notification
function showToast(message) {
	const toast = document.createElement('div');
	toast.className = 'toast';
	toast.textContent = message;
	document.body.appendChild(toast);

	setTimeout(() => {
		toast.classList.add('show');
	}, 10);

	setTimeout(() => {
		toast.classList.remove('show');
		setTimeout(() => toast.remove(), 300);
	}, 3000);
}

/* ============================================
   ACCESSIBILITY: SKIP TO MAIN LINK
   ============================================ */
const skipLink = document.createElement('a');
skipLink.href = '#home';
skipLink.textContent = 'Skip to main content';
skipLink.style.position = 'absolute';
skipLink.style.top = '-40px';
skipLink.style.left = 0;
skipLink.style.backgroundColor = 'var(--accent)';
skipLink.style.padding = '8px';
skipLink.style.zIndex = '10000';
skipLink.style.textDecoration = 'none';
skipLink.style.color = 'var(--bg-primary)';

skipLink.addEventListener('focus', () => {
	skipLink.style.top = '0';
});

skipLink.addEventListener('blur', () => {
	skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

/* ============================================
   INITIAL SETUP
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
	console.log('%c🟢 Terminal Resume loaded!', 'color: #00ff00; font-size: 16px; font-weight: bold;');
	console.log('%cPress ? for keyboard shortcuts', 'color: #00ff00; font-size: 12px;');
});