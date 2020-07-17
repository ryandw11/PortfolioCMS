/**
 * Manges the components of Portfolio CMS
 */
class ComponentManager {
    constructor() {
        this.components = [];
    }

    addComponent(component) {
        this.components.push(component);
    }

    getComponents() {
        return this.components;
    }

    getComponentFromName(name) {
        return this.components.filter((d) => name == d.getTechName())[0];
    }

    getListOfComponets() {
        let output = [];
        for (let comp of this.components) {
            output.push(
                {
                    name: comp.getName(),
                    type: comp.getTechName()
                }
            );
        }
        return output;
    }
}

module.exports = ComponentManager;