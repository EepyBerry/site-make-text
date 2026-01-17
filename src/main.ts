import { createApp } from 'vue';
import App from './App.vue';
import StaticSpriteElement from './components/elements/StaticSpriteElement.vue';
import DynamicSpriteElement from './components/elements/DynamicSpriteElement.vue';
import '@/assets/sass/index.scss';

createApp(App)
  .component('StaticSprite', StaticSpriteElement)
  .component('DynamicSprite', DynamicSpriteElement)
  .mount('#app');
