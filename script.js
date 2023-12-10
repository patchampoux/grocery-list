import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getDatabase, ref, push, remove, onValue, onChildAdded, onChildRemoved } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

class GroceryList {
    constructor() {
        this.appSettings = {
            databaseURL: 'https://grocery-list-6bcac-default-rtdb.firebaseio.com/',
        };
        this.app = initializeApp(this.appSettings);
        this.db = getDatabase(this.app);
        this.shoppingListInDB = ref(this.db, 'shoppingList');

        this.initDOMElements();
        this.addEventListeners();
        this.listenForListUpdates();
    }

    initDOMElements() {
        this.$inputField = this.getElement('#input-field');
        this.$addButton = this.getElement('#add-button');
        this.$shoppingListOutlet = this.getElement('#shopping-list-outlet');
        this.$shoppingList = this.createItemsList();
    }

    getElement(selector) {
        const $element = document.querySelector(selector);

        if (!$element) {
            console.error(`Element with selector "${selector}" not found.`);
        }

        return $element;
    }

    addEventListeners() {
        this.$addButton?.addEventListener('click', () => this.addItemToList());
        this.$shoppingList.addEventListener('click', e => e.target.tagName === 'LI' && this.removeItemFromList(e.target.dataset.id));
    }

    listenForListUpdates() {
        onChildAdded(this.shoppingListInDB, snapshot => {
            if (snapshot.exists()) {
                const itemKey = snapshot.key;
                const itemValue = snapshot.val();

                if (!this.$shoppingList.children.length) {
                    this.$shoppingListOutlet.textContent = '';

                    this.$shoppingListOutlet.appendChild(this.$shoppingList);
                }

                this.$shoppingList.appendChild(this.createListItem(itemValue, itemKey));
            }
        });

        onChildRemoved(this.shoppingListInDB, snapshot => {
            const itemToRemove = this.$shoppingList.querySelector(`[data-id="${snapshot.key}"]`);

            itemToRemove && this.$shoppingList.removeChild(itemToRemove);

            !this.$shoppingList.children.length && (this.$shoppingListOutlet.innerHTML = '<p>No items here... yet.</p>');
        });
    }

    createItemsList() {
        const ul = document.createElement('ul');
        ul.id = 'shopping-list';

        return ul;
    }

    createListItem(value, id) {
        if (value) {
            const li = document.createElement('li');
            li.textContent = value;
            li.dataset.id = id;

            return li;
        }
    }

    addItemToList() {
        const value = this.$inputField.value;

        if (value) {
            push(this.shoppingListInDB, value);

            this.clearInputField();
        }
    }

    removeItemFromList(itemID) {
        remove(ref(this.db, `shoppingList/${itemID}`));
    }

    clearInputField(inputField = this.$inputField) {
        inputField.value = '';
    }
}

new GroceryList();
