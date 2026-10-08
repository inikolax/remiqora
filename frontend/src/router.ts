import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import AceStepPage from './views/ace-step/AceStepPage.vue'
import LoraTrainingPage from './views/ace-step/LoraTrainingPage.vue'
import Yue2Page from './views/yue2/Yue2Page.vue'
import ProjectsListPage from './views/editor/ProjectsListPage.vue'
import EditorPage from './views/editor/EditorPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/ace-step', name: 'ace-step', component: AceStepPage },
    { path: '/ace-step/lora', name: 'ace-step-lora', component: LoraTrainingPage },
    { path: '/yue2', name: 'yue2', component: Yue2Page },
    { path: '/editor', name: 'editor-projects', component: ProjectsListPage },
    // A workspace: full width and one screen high on a desktop, no footer (see App.vue).
    { path: '/editor/:id', name: 'editor', component: EditorPage, props: true, meta: { workspace: true } },
  ],
})

export default router
