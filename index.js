let components = [];
let currentComponents = [];
let COMPONENT_ID = 0;
let attributeNameID = 'data-c-id';
let noop = () => {};

export function c(name, create) {
    let l = components.push({ name, create });

    return components[l-1];
}

export async function watch(element = document) {
    await mount(element);

    async function onChange(mutationList) {
        for (let i = 0; i < mutationList.length; i++) {
            let { addedNodes, removedNodes } = mutationList[i];

            for (let i = 0; i < addedNodes.length; i++) {
                await mount(addedNodes[i].parentNode);
            }

            for (let i = 0; i < removedNodes.length; i++) {
                unmount(removedNodes[i]);
            }
        }
    }

    let observer = new MutationObserver(onChange);
    observer.observe(element, { subtree: true, childList: true });

    return () => {
        observer.disconnect();
        observer = null;

        unmount(element);
    };
}

function check(element) {
    let elements = element.querySelectorAll('*');
    let names = components.map( component => component.name );

    let missingComponents = [];

    for (let i = 0; i < elements.length; i++) {
        let attributes = Array.from(elements[i].attributes);

        for (let j = 0; j < attributes.length; j++) {
            let attribute = attributes[j];
            if (attribute.name.startsWith('data-component')) {
                let name = attribute.name.split('-').splice(2).join('-');

                if (names.indexOf(name) < 0 && missingComponents.indexOf(name) < 0) {
                    missingComponents.push(name);
                }
            }
        }
    }

    for (let i = 0; i < missingComponents.length; i++) {
        console.warn(`Component ${missingComponents[i]} found but it doesn't exist.`);
    }
}

export async function mount(element, list = components, depth = 0) {
    let scopedComponents = [];

    if (depth === 0) {
        check(element);
    }

    for (let i = 0; i < list.length; i++) {
        let { name, create } = list[i];
        let attributeName = `component-${name}`;
        let query = `[data-${attributeName}]:not([data-c-id])`;
        
        let results = Array.from(element.querySelectorAll(query)).filter( (el) => el.dataset['cId'] === undefined);
        
        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            if (!result.dataset[`cId`]) {
                let childComponents = await mount(result, list, depth + 1);
                let children = childComponents.map(child => child.instance);

                let id = COMPONENT_ID++;
                let c = await mountComponent(id, result, create, children);
                currentComponents[id] = c;
                scopedComponents[scopedComponents.length] = c;
            }
        }
    }

    return scopedComponents;
}

export function unmount(element) {
    let query = `[${attributeNameID}]`;
    let results = element.querySelectorAll(query);
    
    let id = parseInt(element.dataset['cId']);
    let component = currentComponents[id];

    if (component) {
        component.destroy();
        currentComponents[id] = null;
    }

    for (let i = 0; i < results.length; i++) {
        unmount(results[i]);
    }
}

async function mountComponent(id, element, create, children) {
    element.setAttribute(attributeNameID, id);

    const component = {
        id,
        destroy: (fn = noop) => {
            fn();

            element.removeAttribute(attributeNameID, id);
        },
    };

    let instance = await create({ element, children, onDestroy: c.destroy });
    c.name = create.name;
    c.instance = instance;

    return c;
}

export { default as Component } from "./Component";

export default {
    mount,
    unmount,
    c,
    watch,
};