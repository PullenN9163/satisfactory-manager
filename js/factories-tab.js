import { appData, saveFactory, deleteFactory, newId } from './firebase.js';
import { getAllOutputItems } from './data/recipes.js';

let _onOpen = null;

export function initFactoriesTab(container, onOpenFactory) {
  _onOpen = onOpenFactory;
  renderFactories(container);
}

export function refreshFactoriesTab(container) {
  renderFactories(container);
}

function renderFactories(container) {
  const factories = Object.values(appData.factories).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (factories.length === 0) {
    container.innerHTML = '<div class="factory-new-hint"><p>No factories yet.</p><p class="hint">Tap + NEW in the tab bar to create your first factory guide.</p></div>';
    return;
  }
  container.innerHTML = factories.map(f => {
    const done = (f.todos || []).filter(t => t.done).length;
    const total = (f.todos || []).length;
    return '<div class="factory-card" data-id="' + f.id + '">'
      + '<div class="factory-name">' + esc(f.name) + '</div>'
      + '<div class="factory-meta">' + esc(f.outputItem) + ' - ' + f.outputRate + '/min - ' + done + '/' + total + ' tasks done</div>'
      + '<div class="factory-actions"><button class="delete-btn" data-del="' + f.id + '">DELETE</button></div>'
      + '</div>';
  }).join('');

  container.querySelectorAll('.factory-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.delete-btn')) return;
      const f = appData.factories[card.dataset.id];
      if (f && _onOpen) _onOpen(f);
    });
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const f = appData.factories[btn.dataset.del];
      if (f && confirm('Delete "' + f.name + '"? Cannot be undone.')) deleteFactory(f.id);
    });
  });
}

export function initNewFactoryModal(onCreated) {
  const modal = document.getElementById('new-modal');
  const nameInput = document.getElementById('new-name');
  const itemSearch = document.getElementById('new-item-search');
  const itemResults = document.getElementById('new-item-results');
  const itemValue = document.getElementById('new-item-value');
  const rateInput = document.getElementById('new-rate');
  const allItems = getAllOutputItems();

  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  itemSearch.addEventListener('input', () => {
    const q = itemSearch.value.toLowerCase();
    if (!q) { itemResults.classList.add('hidden'); return; }
    const matches = allItems.filter(i => i.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) { itemResults.classList.add('hidden'); return; }
    itemResults.innerHTML = matches.map(i => '<div class="item-result" data-item="' + esc(i) + '">' + esc(i) + '</div>').join('');
    itemResults.classList.remove('hidden');
    itemResults.querySelectorAll('.item-result').forEach(el => {
      el.addEventListener('click', () => {
        itemSearch.value = el.dataset.item;
        itemValue.value = el.dataset.item;
        itemResults.classList.add('hidden');
      });
    });
  });

  document.getElementById('new-submit').addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const outputItem = itemValue.value || itemSearch.value.trim();
    const outputRate = parseFloat(rateInput.value);
    if (!name || !outputItem || !outputRate || outputRate <= 0) return;
    const id = newId();
    const factory = { id, name, outputItem, outputRate, recipeSelections: {}, todos: [], createdAt: Date.now() };
    await saveFactory(factory);
    closeModal();
    if (onCreated) onCreated(factory);
  });

  function closeModal() {
    modal.classList.add('hidden');
    nameInput.value = ''; itemSearch.value = ''; itemValue.value = ''; rateInput.value = '';
    itemResults.classList.add('hidden');
  }

  return { open: () => modal.classList.remove('hidden') };
}

function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
