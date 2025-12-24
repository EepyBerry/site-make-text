import { createApp } from 'vue';
import App from './App.vue';
import '@/assets/sass/index.scss';
import StaticSpriteElement from './components/elements/StaticSpriteElement.vue';
import DynamicSpriteElement from './components/elements/DynamicSpriteElement.vue';

createApp(App)
  .component('StaticSprite', StaticSpriteElement)
  .component('DynamicSprite', DynamicSpriteElement)
  .mount('#app');
