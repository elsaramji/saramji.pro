let data = null;

const elements = {
    container: document.getElementById('editor-container'),
    saveBtn: document.getElementById('save-btn'),
    loadBtn: document.getElementById('load-btn')
};

async function loadData() {
    try {
        const response = await fetch('../data.json');
        if (!response.ok) throw new Error('Failed to load');
        data = await response.json();
        renderEditor();
    } catch (err) {
        console.error(err);
        alert('Could not load ../data.json. Please ensure it exists.');
    }
}

function renderEditor() {
    elements.container.innerHTML = '';

    // Iterate over top-level keys (profile, hero, about...)
    for (const [key, value] of Object.entries(data)) {
        const section = document.createElement('div');
        section.className = 'section-block';
        section.innerHTML = `<h2>${key.toUpperCase()}</h2>`;

        const content = generateFields(value, [key]);
        section.appendChild(content);
        elements.container.appendChild(section);
    }
}

function generateFields(obj, path) {
    const container = document.createElement('div');

    // Check if it's a "Language Object" (contains 'en' and 'ar' keys only or primarily)
    if (isLangObject(obj)) {
        return createLangInputs(obj, path);
    }

    // Check if Array
    if (Array.isArray(obj)) {
        return createArrayInput(obj, path);
    }

    // Check if Object (recursive)
    if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-group';

            // If the value is a string, number, or lang object, show a label
            if (typeof value !== 'object' || isLangObject(value)) {
                wrapper.innerHTML = `<label>${key}</label>`;
            } else {
                wrapper.innerHTML = `<h3>${key}</h3>`;
            }

            wrapper.appendChild(generateFields(value, [...path, key]));
            container.appendChild(wrapper);
        }
        return container;
    }

    // Warning: Primitive values at this level should have been handled by parent call usually, 
    // unless the top level object has primitives.
    return createPrimitiveInput(obj, path);
}

function isLangObject(obj) {
    return typeof obj === 'object' && obj !== null && 'en' in obj && 'ar' in obj;
}

function createLangInputs(obj, path) {
    const wrapper = document.createElement('div');
    wrapper.className = 'lang-group';

    // EN
    const enDiv = document.createElement('div');
    enDiv.className = 'lang-field';
    enDiv.innerHTML = `<label>English</label>`;
    const enInput = createInput(obj.en, [...path, 'en']);
    enDiv.appendChild(enInput);

    // AR
    const arDiv = document.createElement('div');
    arDiv.className = 'lang-field';
    arDiv.innerHTML = `<label>Arabic</label>`;
    const arInput = createInput(obj.ar, [...path, 'ar']);
    arDiv.appendChild(arInput);

    wrapper.appendChild(enDiv);
    wrapper.appendChild(arDiv);
    return wrapper;
}

function createInput(value, path) {
    const isLong = typeof value === 'string' && value.length > 50;
    const input = document.createElement(isLong ? 'textarea' : 'input');

    if (!isLong) input.type = 'text';
    input.value = value || '';

    input.addEventListener('input', (e) => {
        updateData(path, e.target.value);
    });

    return input;
}

function createPrimitiveInput(value, path) {
    // Fallback for simple strings not in lang objects
    return createInput(value, path);
}

function createArrayInput(arr, path) {
    const container = document.createElement('div');
    container.className = 'array-container';

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-list';

    arr.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'array-item';

        const header = document.createElement('div');
        header.className = 'array-item-header';
        header.innerHTML = `<span>Item ${index + 1}</span> <button class="btn-remove" onclick="removeArrayItem('${path.join(',')}', ${index})"><i class="fas fa-trash"></i></button>`;

        itemDiv.appendChild(header);
        itemDiv.appendChild(generateFields(item, [...path, index]));
        itemsContainer.appendChild(itemDiv);
    });

    container.appendChild(itemsContainer);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.innerHTML = '+ Add Item';
    addBtn.onclick = () => addArrayItem(path);
    container.appendChild(addBtn);

    return container;
}

// Helpers for Data Mutation
function updateData(path, value) {
    let current = data;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
}

// Global scope hacks for onclick events in generated HTML
window.removeArrayItem = (pathStr, index) => {
    const path = pathStr.split(',');
    let current = data;
    for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
    }
    if (Array.isArray(current)) {
        current.splice(index, 1);
        renderEditor(); // Re-render
    }
};

window.addArrayItem = (path) => {
    let current = data;
    for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
    }
    if (Array.isArray(current) && current.length > 0) {
        // Clone the structure of the last item, but empty the strings
        const template = JSON.parse(JSON.stringify(current[0]));
        clearValues(template);
        current.push(template);
    } else {
        // Fallback for empty array (simplistic)
        // If empty, we can't easily guess schema. 
        // For this portfolio, arrays are usually objects.
        current.push({});
    }
    renderEditor();
};

function clearValues(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') obj[key] = '';
        else if (typeof obj[key] === 'object') clearValues(obj[key]);
    }
}

// Export
elements.saveBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
});

elements.loadBtn.addEventListener('click', loadData);

// Init
loadData();
