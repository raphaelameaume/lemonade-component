# lemonade-component

`lemonade-component` is a minimal component library. Its only purpose is to look for registered DOM components and execute a function when found. It is not a v-dom library.
It supports dynamic imports and can watch for DOM changes.

## Installation

```
npm install lemonade-component
```

## Usage

### Mount component

```html
<body>
    <ul data-component-slider>
        <li data-component-slider-item></li>
        <li data-component-slider-item></li>
        <li data-component-slider-item></li>
    </ul>
</body>
```

main.js
```
import { c, mount } from "lemonade-component"

function Slider({ element, children, onDestroy }) {
    // Slider is mounted
    console.log(children); // [SliderItem, SliderItem, SliderItem];
}

function Slider({ element }) {
    // SliderItem is mounted
    console.log(element) // <li data-component-slider-item></li>
}

c('slider', Slider);
c('slider-item', SliderItem);

mount(document.body);
```

### Dynamic imports

```js
import { c } from "lemonade-component";

c('slider', () => import('./Slider.js'));
```

### Watch for DOM changes

```html
<body>
    <div id="root">
        <ul data-component-slider></ul>
    </ul>
</body>
```

```js
import { watch } from "lemonade-component

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
const NavigationComponent = c('navigation', Navigation);

mount(document.body, [NavigationComponent]);
// SliderComponent will not be mounted if found
```




