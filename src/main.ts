import { createApp } from 'vue';
import App from './App.vue';
import { createHead } from '@unhead/vue/client';
import '@/assets/sass/index.scss';
import StaticSpriteElement from './components/elements/StaticSpriteElement.vue';
import DynamicSpriteElement from './components/elements/DynamicSpriteElement.vue';

createApp(App)
  .use(createHead())
  .component('StaticSprite', StaticSpriteElement)
  .component('DynamicSprite', DynamicSpriteElement)
  .mount('#app');
