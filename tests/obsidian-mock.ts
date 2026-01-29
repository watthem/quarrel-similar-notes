export class Notice {
  constructor(_message?: string) {}
}

export class Plugin {}
export class WorkspaceLeaf {}
export class App {}
export class TFile {}
export class ItemView {}
export class PluginSettingTab {}

export class Setting {
  setHeading() {
    return this;
  }

  setName(_name: string) {
    return this;
  }

  setDesc(_desc: string) {
    return this;
  }

  addSlider(_handler: (slider: any) => void) {
    return this;
  }

  addDropdown(_handler: (dropdown: any) => void) {
    return this;
  }

  addToggle(_handler: (toggle: any) => void) {
    return this;
  }

  addButton(_handler: (button: any) => void) {
    return this;
  }
}
