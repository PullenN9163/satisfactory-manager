import { startSync, onSyncStatus, appData } from './firebase.js';
import { initRecipesTab, refreshRecipesTab } from './recipes-tab.js';
import { initFactoriesTab, refreshFactoriesTab, initNewFactoryModal } from './factories-tab.js';
import { openFactory, closeFactory, refreshDetail } from './factory-detail.js';

let currentTab = 'recipes';
const recipesPanel = document.getElementById('recipes-panel');
const factoriesPanel = document.getElementById('factories-panel');
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
}

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

// Firebase — re-render on every remote change
startSync(() => {
  if (currentTab === 'recipes') refreshRecipesTab(recipesPanel);
  if (currentTab === 'factories') refreshFactoriesTab(factoriesPanel);
  refreshDetail();
});

switchTab('recipes');
