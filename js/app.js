import { startSync, onSyncStatus, appData } from './firebase.js';
import { initRecipesTab, refreshRecipesTab } from './recipes-tab.js';
import { initFactoriesTab, refreshFactoriesTab, initNewFactoryModal } from './factories-tab.js';
import { openFactory, closeFactory, refreshDetail } from './factory-detail.js';
import { initPhasesTab, refreshPhasesTab } from './phases-tab.js';
import { getPhase, setPhase, onPhaseChange, PHASE_DEFS } from './phase-state.js';

let currentTab = 'recipes';
const recipesPanel = document.getElementById('recipes-panel');
const factoriesPanel = document.getElementById('factories-panel');
const phasesPanel = document.getElementById('phases-panel');
const syncEl = document.getElementById('sync-status');

// Tab switching
document.querySelectorAll('#main-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'new') { newModal.open(); return; }
    switchTab(btn.dataset.tab);
  });
});

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('#main-tabs .tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab && tab !== 'new')
  );
  recipesPanel.classList.toggle('hidden', tab !== 'recipes');
  factoriesPanel.classList.toggle('hidden', tab !== 'factories');
  phasesPanel.classList.toggle('hidden', tab !== 'phases');
  if (tab === 'phases') refreshPhasesTab();
}

// Phase selector
function renderPhaseDropdown() {
  const phase = getPhase();
  const btn = document.getElementById('phase-btn');
  if (btn) btn.textContent = 'PHASE ' + phase + ' \u25be';
  const dd = document.getElementById('phase-dropdown');
  if (!dd) return;
  dd.textContent = '';
  PHASE_DEFS.forEach(p => {
    const opt = document.createElement('div');
    opt.className = 'phase-option' + (p.id === phase ? ' active' : '');
    opt.dataset.pid = p.id;
    const nameEl = document.createElement('div');
    nameEl.className = 'phase-option-name';
    nameEl.textContent = p.name;
    const subEl = document.createElement('div');
    subEl.className = 'phase-option-sub';
    subEl.textContent = p.subtitle;
    opt.appendChild(nameEl); opt.appendChild(subEl);
    opt.addEventListener('click', () => {
      setPhase(parseInt(opt.dataset.pid));
      dd.classList.add('hidden');
    });
    dd.appendChild(opt);
  });
}

const phaseBtn = document.getElementById('phase-btn');
const phaseDd = document.getElementById('phase-dropdown');
phaseBtn.addEventListener('click', e => {
  e.stopPropagation();
  renderPhaseDropdown();
  phaseDd.classList.toggle('hidden');
});
document.addEventListener('click', () => phaseDd.classList.add('hidden'));

onPhaseChange(() => {
  renderPhaseDropdown();
  refreshRecipesTab(recipesPanel);
  refreshPhasesTab();
});

renderPhaseDropdown();

// Sync status
onSyncStatus(status => {
  syncEl.textContent = status === 'ok' ? 'Synced' : 'Offline';
  syncEl.className = status === 'ok' ? 'sync-ok' : 'sync-err';
});

// Back button
document.getElementById('back-btn').addEventListener('click', () => {
  closeFactory();
  switchTab('factories');
});

// New factory modal
const newModal = initNewFactoryModal(factory => {
  switchTab('factories');
  openFactory(factory);
});

// Init tabs
initRecipesTab(recipesPanel);
initFactoriesTab(factoriesPanel, factory => openFactory(factory));
initPhasesTab(phasesPanel);

// Firebase — re-render on every remote change
startSync(() => {
  if (currentTab === 'recipes') refreshRecipesTab(recipesPanel);
  if (currentTab === 'factories') refreshFactoriesTab(factoriesPanel);
  if (currentTab === 'phases') refreshPhasesTab();
  refreshDetail();
});

switchTab('recipes');
