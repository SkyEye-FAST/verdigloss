<template>
  <Nav :is-dark-mode="isDarkMode" @toggle-dark-mode="toggleDarkMode" />
  <div class="page-content">
    <h1 class="page-title" :class="currentLang.toLowerCase()">
      {{ $t('table.colors.title') }}
      <span style="font-size: 75%; color: gray"> (2025/5/10)</span>
    </h1>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="key-column">Color / ID</th>
            <th v-for="lang in languages" :key="lang">{{ lang }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="color in colorData" :key="color.key">
            <td class="key-column">
              <div class="key-cell-content">
                <img :src="color.icon" width="16" height="16" style="image-rendering: pixelated" />
                <div class="color-preview" :style="{ backgroundColor: color.hex }"></div>
                <div class="color-preview" :style="{ backgroundColor: color.textHex }"></div>
                {{ color.key }}
              </div>
            </td>
            <td class="sans" v-for="lang in languages" :key="lang" :class="lang.replace(/_/, '-')">
              {{ color.translations[lang] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useDarkMode } from '@/composables/useDarkMode'
import { currentLocale } from '@/main'

import Nav from '../PageNav.vue'

const currentLang = computed(() => currentLocale.value)

const languages: Array<keyof (typeof colorData)[0]['translations']> = [
  'en_us',
  'zh_cn',
  'zh_hk',
  'zh_tw',
  'lzh',
  'ja_jp',
  'ko_kr',
  'vi_vn',
]

const dyeIcons = {
  black:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAdUlEQVQ4y2NgGAW0AwK8Iv9xYaI0Skmo/1dXs4VjC/NAMAaJ4zQEJIGsGNkAdIxhCEyzv1cJGOMyBOQCrK5gZeUASyBrQlaM7DWcmmGugCkGiSNjWLiA2BgGwJwNMwBDEVQdSA02ObAkPs3I6hjwSeJVMCgBAJsWcXLakhEJAAAAAElFTkSuQmCC',
  blue: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEUAAAB0l+paguI0XsMUSZoaPY8FJGPGuAo4AAAAAXRSTlMAQObYZgAAAEtJREFUeNpjIBKwwuiggAAwI1BRVRQsoCgkZJIAZCQLCRkbmQEZSUbKKsouCQxszm5OZiYpQLmUlGSTFDegFBtbShpbAlg/WwJWewBmzQr1F1lHlAAAAABJRU5ErkJggg==',
  brown:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEUAAADJgE2ZXTN6RiFjLARCHwWCx7G5AAAAAXRSTlMAQObYZgAAAEdJREFUeNpjIBI4O0NoFkUhBzAjSFBZBUSHOisZGrsAGaxGxkYmpgEMDMGBys6urkCBECNnk5AABhDLJNQ1lAHECg0NwGsPAGYgChRNrzuQAAAAAElFTkSuQmCC',
  cyan: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAG1BMVEUAAABLn8E8jrAtfJ0jb48cYYQXU2kNS2cNQ1rfzo9VAAAAAXRSTlMAQObYZgAAAE5JREFUeNpjwArYGqB0kgcbmJEsGpLSABIwUhZy9QAxFENDQiKAjERTIVNlCxAjSFlVBCSS5GSi6gpisDs5hYSCTepwCelgAIOODga8AADo2w4IN2D2cAAAAABJRU5ErkJggg==',
  gray: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAG1BMVEUAAACop6eXl5eEhIR2dnZpaWleXl5VVVVBQUGqq22RAAAAAXRSTlMAQObYZgAAAENJREFUeNpjIBKUl0NpZZMOEM0uZKiS2gBkFBorGbtZABlFhspGbh5ARomysZhzBkiNi5JLWgNIdYdzSgdEf0cHfnsANJIMfjPNhhkAAAAASUVORK5CYII=',
  green:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEUAAABjhi5Kaxg2UQ0sQgsiNQXVJ5zKAAAAAXRSTlMAQObYZgAAAFlJREFUeNpjQAUsMIaTC4QfIuwUAOY7iiiDGCwqQo6qIAFHIRchU5CAoIqiEEiNs5CToIoqWKugsJMokOFiJOQkaMrAwGKkpKIoBNIdGhqkHMoABqGhDNgAAPx7Cy27iddcAAAAAElFTkSuQmCC',
  light_blue:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAGFBMVEUAAAC51v+PufSCrOdvm9tQgs49ZpoeQXOXgZ4cAAAAAXRSTlMAQObYZgAAAERJREFUeNpjIA6wpbElgBmJqknuYAFVV0XVApCASpCJaziQkeSqLBQCYqQ6mYSEghjsIUKuoQUg1eWhoeUMYFBejt8iAB2lDC47htGZAAAAAElFTkSuQmCC',
  light_gray:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEUAAADZ2dnIyMi6usGfn7NYVXs9PUwmhz4fAAAAAXRSTlMAQObYZgAAAE1JREFUeNpjwApYAyBUaKApmBGoohwAYTgaq4FlhIRMVNISgKwgZSdjJTcgI9hEUcjQDMQQElRUBomwGSspmySAlKc5m6RBTE5LY8ALABsyCuTRKvcoAAAAAElFTkSuQmCC',
  lime: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAGFBMVEUAAACs5TuD1Bx2xhBlrAlamggzZyghRxpyJEKxAAAAAXRSTlMAQObYZgAAAENJREFUeNpjIBKkpUFpZZNyEM0mZKgcUgBkJBorGbuaAxlJhspGru5ARoqysahzOEiNi5JLaAFIdblzSDlEf3k5fnsA6jgLW6CVrKQAAAAASUVORK5CYII=',
  magenta:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAGFBMVEUAAADKjtGwZNikU86MObyCMLJULZZRGnHu8owBAAAAAXRSTlMAQObYZgAAAENJREFUeNpjIBKkpUFpZZNyEM0mZKgSUgBkJBorGbuaAxlJhspGru5ARoqysahzOEiNi5JLaAFIdblzSDlEf3k5fnsA6o0LXKmOh1YAAAAASUVORK5CYII=',
  orange:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEUAAAD0sz/mnjTbiyrOeyK0XA2SRgwxOXKPAAAAAXRSTlMAQObYZgAAAFBJREFUeNpjwApCAyA0q6IplCHkHJoGYoQoOxsbJQAFhF2MndWAAoHCSkImYIaSoZCJGZARrCIkYuwG0mQibOKcwAAEiSpAARBgS0tLYMAHABxlCwjRlolaAAAAAElFTkSuQmCC',
  pink: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAGFBMVEUAAAD6y9f3tNbtp8vbi7TLeKOcTJaANlxXoxLvAAAAAXRSTlMAQObYZgAAAENJREFUeNpjIBKkpUFpZZNyEM0mZKgSUgBkJBorGbuaAxlJhspGru5ARoqysahzOEiNi5JLaAFIdblzSDlEf3k5fnsA6o0LXKmOh1YAAAAASUVORK5CYII=',
  purple:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAGFBMVEUAAADKjtGwZNikU86MObyCMLJULZZRGnHu8owBAAAAAXRSTlMAQObYZgAAAENJREFUeNpjIBKkpUFpZZNyEM0mZKgSUgBkJBorGbuaAxlJhspGru5ARoqysahzOEiNi5JLaAFIdblzSDlEf3k5fnsA6o0LXKmOh1YAAAAASUVORK5CYII=',
  red: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEUAAADvbWLSRD+oLEeOJjyBKTV5HCfUIrZ6AAAAAXRSTlMAQObYZgAAAFFJREFUeNpjwA9YEyBUaJAbG4gRqCKokgQSCzJyMhFUA0k5Kjs6ioGkhFQEFc1ADCUTIScQI8jYRcnZDchgc1FyMgGblKzsnMYAAmxpaVgtBAABiQvTjKCZ5gAAAABJRU5ErkJggg==',
  white:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEUAAAD////q6uq5uctZVX9ERWV16cszAAAAAXRSTlMAQObYZgAAAFZJREFUeNpjwAVcHCBUiHIAiGYRVHEFCzgJmiqCRFyMlAOFgAwWIWdXRZAaRxVDZWVToIyzs6CwiwuQEeKkaGoEMkbISdkVJMBgYuwa7AA2zoXFBau1ADQlC/WMk2DwAAAAAElFTkSuQmCC',
  yellow:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEUAAAD28JHn5yrVsiO1kBqOaxN2XRpmvh7YAAAAAXRSTlMAQObYZgAAAFJJREFUeNpjQAWsMEZQAoQfKgRhhCo5gRmsjiYqbmAFKk4mZiABZUdlsFSgipGJshtIxsnZSQUkFexoYmICYrCZGDs7g7WnmRinMYBBWhoDNgAAiNkNQDee3X4AAAAASUVORK5CYII=',
}

const colorData = [
  {
    key: 'black',
    hex: '#1D1D21',
    textHex: '#000000',
    icon: dyeIcons.black,
    translations: {
      en_us: 'Black',
      zh_cn: '黑色',
      zh_hk: '黑色',
      zh_tw: '黑色',
      lzh: '黑',
      ja_jp: '黒色',
      ko_kr: '검은색 (검은色)',
      vi_vn: 'Đen (黰)',
    },
  },
  {
    key: 'blue',
    hex: '#3C44AA',
    textHex: '#0000FF',
    icon: dyeIcons.blue,
    translations: {
      en_us: 'Blue',
      zh_cn: '蓝色',
      zh_hk: '藍色',
      zh_tw: '藍色',
      lzh: '靛',
      ja_jp: '青色',
      ko_kr: '파란색 (파란色)',
      vi_vn: 'Xanh nước biển (青渃㴜)',
    },
  },
  {
    key: 'brown',
    hex: '#835432',
    textHex: '#8B4513',
    icon: dyeIcons.brown,
    translations: {
      en_us: 'Brown',
      zh_cn: '棕色',
      zh_hk: '啡色',
      zh_tw: '棕色',
      lzh: '褐',
      ja_jp: '茶色',
      ko_kr: '갈색 (褐色)',
      vi_vn: 'Nâu (𣘽)',
    },
  },
  {
    key: 'cyan',
    hex: '#169C9C',
    textHex: '#00FFFF',
    icon: dyeIcons.cyan,
    translations: {
      en_us: 'Cyan',
      zh_cn: '青色',
      zh_hk: '青藍色',
      zh_tw: '青色',
      lzh: '黛',
      ja_jp: '青緑色',
      ko_kr: '청록색 (靑綠色)',
      vi_vn: 'Lục lam (綠藍)',
    },
  },
  {
    key: 'gray',
    hex: '#474F52',
    textHex: '#808080',
    icon: dyeIcons.gray,
    translations: {
      en_us: 'Gray',
      zh_cn: '灰色',
      zh_hk: '灰色',
      zh_tw: '灰色',
      lzh: '灰',
      ja_jp: '灰色',
      ko_kr: '회색 (灰色)',
      vi_vn: 'Xám (繿)',
    },
  },
  {
    key: 'green',
    hex: '#5E7C16',
    textHex: '#00FF00',
    icon: dyeIcons.green,
    translations: {
      en_us: 'Green',
      zh_cn: '绿色',
      zh_hk: '綠色',
      zh_tw: '綠色',
      lzh: '綠',
      ja_jp: '緑色',
      ko_kr: '초록색 (草綠色)',
      vi_vn: 'Xanh lá cây (青蘿𣘃)',
    },
  },
  {
    key: 'light_blue',
    hex: '#3AB3DA',
    textHex: '#9AC0CD',
    icon: dyeIcons.light_blue,
    translations: {
      en_us: 'Light Blue',
      zh_cn: '淡蓝色',
      zh_hk: '淺藍色',
      zh_tw: '淺藍色',
      lzh: '縹',
      ja_jp: '空色',
      ko_kr: '하늘색 (하늘色)',
      vi_vn: 'Xanh nhạt (青溂)',
    },
  },
  {
    key: 'light_gray',
    hex: '#9D9D97',
    textHex: '#D3D3D3',
    icon: dyeIcons.light_gray,
    translations: {
      en_us: 'Light Gray',
      zh_cn: '淡灰色',
      zh_hk: '淺灰色',
      zh_tw: '淺灰色',
      lzh: '蒼',
      ja_jp: '薄灰色',
      ko_kr: '회백색 (灰白色)',
      vi_vn: 'Xám nhạt (繿溂)',
    },
  },
  {
    key: 'lime',
    hex: '#80C71F',
    textHex: '#BFFF00',
    icon: dyeIcons.lime,
    translations: {
      en_us: 'Lime',
      zh_cn: '黄绿色',
      zh_hk: '淺綠色',
      zh_tw: '淺綠色',
      lzh: '翠',
      ja_jp: '黄緑色',
      ko_kr: '연두색 (軟豆色)',
      vi_vn: 'Xanh lá mạ (青蘿𥢂)',
    },
  },
  {
    key: 'magenta',
    hex: '#C74EBD',
    textHex: '#FF00FF',
    icon: dyeIcons.magenta,
    translations: {
      en_us: 'Magenta',
      zh_cn: '品红色',
      zh_hk: '紫紅色',
      zh_tw: '洋紅色',
      lzh: '赬',
      ja_jp: '赤紫色',
      ko_kr: '자홍색 (紫紅色)',
      vi_vn: 'Đỏ sậm (𧹻湛)',
    },
  },
  {
    key: 'orange',
    hex: '#F9801D',
    textHex: '#FF681F',
    icon: dyeIcons.orange,
    translations: {
      en_us: 'Orange',
      zh_cn: '橙色',
      zh_hk: '橙色',
      zh_tw: '橙色',
      lzh: '橙',
      ja_jp: '橙色',
      ko_kr: '주황색 (朱黃色)',
      vi_vn: 'Cam (柑)',
    },
  },
  {
    key: 'pink',
    hex: '#F38BAA',
    textHex: '#FF69B4',
    icon: dyeIcons.pink,
    translations: {
      en_us: 'Pink',
      zh_cn: '粉红色',
      zh_hk: '粉紅色',
      zh_tw: '粉紅色',
      lzh: '紅',
      ja_jp: '桃色',
      ko_kr: '분홍색 (粉紅色)',
      vi_vn: 'Hồng (紅)',
    },
  },
  {
    key: 'purple',
    hex: '#8932B8',
    textHex: '#A020F0',
    icon: dyeIcons.purple,
    translations: {
      en_us: 'Purple',
      zh_cn: '紫色',
      zh_hk: '紫色',
      zh_tw: '紫色',
      lzh: '紫',
      ja_jp: '紫色',
      ko_kr: '보라색 (보라色)',
      vi_vn: 'Tím (𦻳)',
    },
  },
  {
    key: 'red',
    hex: '#B02E26',
    textHex: '#FF0000',
    icon: dyeIcons.red,
    translations: {
      en_us: 'Red',
      zh_cn: '红色',
      zh_hk: '紅色',
      zh_tw: '紅色',
      lzh: '赤',
      ja_jp: '赤色',
      ko_kr: '빨간색 (빨간色)',
      vi_vn: 'Đỏ (𧹻)',
    },
  },
  {
    key: 'white',
    hex: '#F9FFFE',
    textHex: '#FFFFFF',
    icon: dyeIcons.white,
    translations: {
      en_us: 'White',
      zh_cn: '白色',
      zh_hk: '白色',
      zh_tw: '白色',
      lzh: '白',
      ja_jp: '白色',
      ko_kr: '하얀색 (하얀色)',
      vi_vn: 'Trắng (𤽸)',
    },
  },
  {
    key: 'yellow',
    hex: '#FED83D',
    textureHex: '#DECF2A',
    textHex: '#FFFF00',
    icon: dyeIcons.yellow,
    translations: {
      en_us: 'Yellow',
      zh_cn: '黄色',
      zh_hk: '黃色',
      zh_tw: '黃色',
      lzh: '黃',
      ja_jp: '黄色',
      ko_kr: '노란색 (노란色)',
      vi_vn: 'Vàng (黃)',
    },
  },
]

const { isDarkMode, toggleDarkMode } = useDarkMode()

onMounted(() => {
  document.body.classList.toggle('dark-mode', isDarkMode.value)
})
</script>

<style scoped>
.page-content {
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-title {
  font-weight: 900;
  text-align: center;
  font-size: 2.5rem;
  margin-top: 20px;
  margin-bottom: 1rem;
  color: #333;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: max-content;
  min-width: 80%;
  max-width: 1600px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  table-layout: fixed;
  border-collapse: collapse;
  border: 2px solid #5b9bd5;
  font-size: 14px;
  font-weight: 500;
}

table td,
table th {
  border: 2px solid #5b9bd5;
  padding: 6px 8px;
  text-align: left;
  min-width: 80px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

table thead th {
  background-color: #5b9bd5;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px 8px;
  font-family: var(--monospace-font), monospace !important;
  border: 2px solid #4a8ac4;
}

.key-column {
  min-width: 100px;
  max-width: 300px;
  font-family: var(--monospace-font), monospace;
  background: inherit;
}

.key-cell-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 2px;
  flex-shrink: 0;
}

table tr:nth-child(even) {
  background-color: #5b9bd515;
}

table tr:hover {
  background-color: #5b9bd530;
}

table tr:nth-child(even) td.key-column {
  background-color: #f3f6f8;
}

table tr:hover td.key-column {
  background-color: #e9ecef;
}

/* Dark mode */
body.dark-mode table {
  background: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border-color: #555;
}

body.dark-mode table td,
body.dark-mode table th {
  border-color: #555;
}

body.dark-mode table thead th {
  background-color: #4a4a4a;
  border-color: #555;
  box-shadow:
    inset 1px 0 0 rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 2px 0 #555;
}

body.dark-mode table tr td.key-column {
  background-color: #2a2a2a;
}

body.dark-mode table tr:nth-child(even) {
  background-color: #3a3a3a;
}

body.dark-mode table tr:nth-child(even) td.key-column {
  background-color: #333;
}

body.dark-mode table tr:hover {
  background-color: #4a4a4a;
}

body.dark-mode table tr:hover td.key-column {
  background-color: #444;
}

body.dark-mode .page-title {
  color: #e0e0e0;
}

/* Responsive styles */
@media (max-width: 768px) {
  .table-wrapper {
    margin: 0 -10px;
    padding: 0 10px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  table {
    font-size: 13px;
  }

  table td,
  table th {
    padding: 4px 6px;
    min-width: 50px;
    font-size: 12px;
  }

  .key-column {
    min-width: 100px;
  }

  .color-preview {
    width: 14px;
    height: 14px;
  }
}
</style>
