let components = [];
let currentComponents = new Map();
let COMPONENT_ID = 0;
let noop = () => {};

export function add(name, create) {
    let l = components.push({ name, create });

    return components[l-1];
}

export async function watch(element = document) {
    await mount(element);

    async function onChange(mutationList) {
        for (let i = 0; i < mutationList.length; i++) {
            let { addedNodes, removedNodes } = mutationList[i];

            for (let i = 0; i < addedNodes.length; i++) {
                await mount(addedNodes[i]);
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

export async function mount(element, list = components) {
    let scopedComponents = [];

    for (let i = 0; i < list.length; i++) {
        let { name, create } = list[i];
        let query = `[data-module-${name}]`;
        let results = element.querySelectorAll(query);

        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            if (!result.dataset[`mId`]) {
                let childComponents = await mount(result, list);
                let children = childComponents.map(child => child.instance);

                let id = COMPONENT_ID++;
                let c = await createComponent(id, result, create, children);
                currentComponents.set(`${c.id}`, c);
                scopedComponents.push(c);
            }
        }
    }

    return scopedComponents;
}

export function unmount(element) {
    let query = `[data-m-id]`;
    let results = element.querySelectorAll(query);

    let id = element.dataset['mId'];

    if (currentComponents.has(id)) {
        let m = currentComponents.get(id);

        m.destroy();
        element.removeAttribute('data-m-id');
        currentComponents.delete(id);
    }

    for (let i = 0; i < results.length; i++) {
        unmount(results[i]);
    }
}

async function createComponent(id, element, create, children) {
    element.setAttribute('data-m-id', id);

    const c = {
        id,
        destroy: noop,
    };

    function destroy(cb = noop) {
        c.destroy = cb;
    }

    let instance = await create({ element, children, onDestroy: destroy });
    c.name = create.name;
    c.instance = instance;

    return c;
}

export { default as Component } from "./Component";

export default {
    mount,
    unmount,
    add,
    watch,
};