# lemonade-component 🏷

⚠️ ALPHA: This code has not been fully tested and the API might have some breaking changes in the future

`lemonade-component` is a minimal component library inspired by [modularjs](https://github.com/modularorg/modularjs/). Its only purpose is to look for registered DOM components and execute a function when it finds one. It supports dynamic imports and can watch for DOM changes. It is not a v-dom library.
 

## Installation

```
npm install lemonade-component
```

## Usage

Let's suppose our HTML looks like this:

```html
<body>
    <div id="root">
        <ul data-component-slider>
            <li data-component-slider-item></li>
            <li data-component-slider-item></li>
            <li data-component-slider-item></li>
        </ul>
    </div>
</body>
```

### Mount a component

```js
import { c, mount } from "lemonade-component"

function Slider({ element }) {
    // Slider is mounted
    console.log(element); // <ul data-component-slider></ul>
}

c('slider', Slider);

mount(document.body);
```

### Unmount components

```js
import { unmount } from "lemonade-component";

function Slider({ onDestroy }) {
    onDestroy(() => {
        console.log('Slider :: unmounted');
    })
}

unmount(document.body);
// Slider :: unmounted
```

### Access children components

```js
function Slider({ children }) {
    console.log(children); // [SliderItem, SliderItem, SliderItem]
}

function SliderItem() {}

c('slider', SliderItem);
c('slider-item', SliderItem);

mount(document.body);
```

### Dynamic imports

```js
import { c } from "lemonade-component";

c('slider', () => import('./Slider.js'));
```

### Watch for DOM changes

Use `watch` instead of `mount`

```js
import { watch } from "lemonade-component";

function Slider({ onDestroy }) {
    console.log('Slider :: mounted');
    onDestroy(() => {
        console.log('Slider :: unmounted');
    });
}

c('slider', Slider);

watch(document.body);
// Slider :: mounted

document.getElementById('root').innerHTML = '';
// Slider :: unmounted
```

### Mount only certains components

```js
import { mount } from "lemonade-component";

const SliderComponent = c('slider', Slider);
const SliderItemComponent = c('slider-item', SliderItem);

mount(document.body, [SliderComponent]);
// SliderItemComponent will not be mounted if found
```

## Credits
- [modularjs](https://github.com/modularorg/modularjs/)

## License

MIT License, see [LICENSE](https://github.com/raphaelameaume/lemonade-component/tree/master/LICENSE) for details