import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import CreatePage from './views/create/CreatePage.vue'
import LibraryPage from './views/library/LibraryPage.vue'
import ProjectsListPage from './views/editor/ProjectsListPage.vue'
import EditorPage from './views/editor/EditorPage.vue'
import ModelsPage from './views/models/ModelsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { wide: true } },
    // One page for the three engines; the engine is chosen on it (and carried in the address). Wide: the engine
    // rail, the form and the session use the whole window (see App.vue).
    { path: '/create', name: 'create', component: CreatePage, meta: { wide: true } },
    // Every saved track, whatever made it.
    { path: '/library', name: 'library', component: LibraryPage, meta: { wide: true } },
    // The engines' old addresses open Create with that engine.
    { path: '/ace-step', name: 'ace-step', redirect: { name: 'create', query: { engine: 'ace_step' } } },
    // LoRA training is ACE-Step's second mode on Create, so the engine rail stays beside it.
    { path: '/ace-step/lora', name: 'ace-step-lora', redirect: { name: 'create', query: { engine: 'ace_step', ace: 'lora' } } },
    { path: '/yue2', name: 'yue2', redirect: { name: 'create', query: { engine: 'yue2' } } },
    { path: '/stable-audio', name: 'stable-audio', redirect: { name: 'create', query: { engine: 'stable_audio' } } },
    // wide like Home, Create and Library: the same container and left edge on every page
    { path: '/editor', name: 'editor-projects', component: ProjectsListPage, meta: { wide: true } },
    // Weights and settings of every engine: a settings page, reached from the gear in the header.
    { path: '/models', name: 'models', component: ModelsPage, meta: { wide: true } },
    // "From an idea" lives on the home page now; the old address and name lead there.
    { path: '/idea', name: 'idea', redirect: { name: 'home' } },
    // A workspace: full width and one screen high on a desktop, no footer (see App.vue).
    { path: '/editor/:id', name: 'editor', component: EditorPage, props: true, meta: { workspace: true } },
  ],
})

export default router
