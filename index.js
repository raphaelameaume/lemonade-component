let components = [];
let currentComponents = new Map();
let COMPONENT_ID = 0;

export function add(name, create) {
    let c = {
        name,
        create,
    };

    components.push(c);

    return c;
}

export async function watch(element = document, { onMount = noop } = {}) {
    await mount(element);

    async function onChange(mutationList) {
        for (let i = 0; i < mutationList.length; i++) {
            let { addedNodes, removedNodes } = mutationList[i];

            for (let i = 0; i < addedNodes.length; i++) {
                let { parentNode } = addedNodes[i];

                await mount(addedNodes[i]);
                onMount();
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
            let element = results[i];

            if (!element.dataset[`mId`]) {
                let childComponents = await mount(element, list);
                let children = childComponents.map(child => child.instance);

                let id = COMPONENT_ID++;
                let m = await createComponent(id, element, create, children);
                currentComponents.set(`${m.id}`, m);
                scopedComponents.push(m);
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

        m = null;
    }

    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        unmount(result);
    }
}

async function createComponent(id, element, create, children) {
    element.setAttribute('data-m-id', id);

    const m = {
        id,
        destroy: noop,
    };

    function destroy(cb = noop) {
        m.destroy = cb;
    }

    let c = await create({ element, children, onDestroy: destroy });
    m.name = create.name;
    m.instance = c;

    return m;
}

export default {
    mount,
    unmount,
    add,
    watch,
};