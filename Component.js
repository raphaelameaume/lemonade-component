class Component {
    constructor({ element, children, onDestroy }) {
        this.element = element;
        this.children = children;

        onDestroy(() => {
            this.onDestroy();
        });
    }

    onDestroy() { }
}

export default Component;