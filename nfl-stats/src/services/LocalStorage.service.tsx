// Handles local storage to the browser.

class LocalStorageItem {
    key: string;
    value: any = null;
    last_updated: Date|null = null;

    constructor(key: string) {
        this.key = key;
        
        // if key exists in local storage, set value to that
        if (localStorage.getItem(key)) {
            const storedInfo = JSON.parse(localStorage.getItem(key) as string);

            this.value = storedInfo.value;
            this.last_updated = new Date(storedInfo.last_updated);
        }
    }

    set(value: any) {
        this.value = value;
        this.last_updated = new Date();
        localStorage.setItem(this.key, JSON.stringify({value: this.value, last_updated: this.last_updated}));
    }

    remove() {
        this.value = null;
        this.last_updated = null;
        localStorage.removeItem(this.key);
    }
}

export default LocalStorageItem;