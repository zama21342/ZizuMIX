// 🔥 ТВОЙ КОНФИГ FIREBASE 🔥
const firebaseConfig = {
    apiKey: "AIzaSyARD2aXlnk35V0gCwa_-jFdF0DXPJwl16w",
    authDomain: "zizuhookah.firebaseapp.com",
    databaseURL: "https://zizuhookah-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "zizuhookah",
    storageBucket: "zizuhookah.firebasestorage.app",
    messagingSenderId: "457838423857",
    appId: "1:457838423857:web:049554d2644ddd064a8a10",
    measurementId: "G-RKHHYEX3EN"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Глобальные переменные
let recipes = [];
let currentFilter = 'all';
let currentSearch = '';
let editingId = null;
let showOnlyFavorites = false;
let inventoryMode = false;
let inventory = {};
let allKnownFlavors = [];

// DOM элементы
const recipesGrid = document.getElementById('recipesGrid');
const searchInput = document.getElementById('searchInput');
const brandFilters = document.getElementById('brandFilters');
const totalRecipes = document.getElementById('totalRecipes');
const inventoryBtn = document.getElementById('inventoryBtn');

// ====== ВСЕ ВКУСЫ С ТВОИХ ФОТО ======
const FLAVORS_FROM_PHOTOS = {
    'Darkside': [
        'Банан', 'Манго', 'Маракуйя', 'Ананас', 'Кокос', 'Кола', 'Дыня',
        'Красная смородина', 'Вишня', 'Черника', 'Груша', 'Гуава', 'Грейпфрут',
        'Бергамот', 'Киви', 'Апельсин', 'Арбуз', 'Лимон', 'Мята', 'Клубника',
        'Персик', 'Яблоко', 'Малина', 'Ежевика', 'Ваниль', 'Мед', 'Сливочное масло',
        'Имбирь', 'Шоколад', 'Карамель', 'Йогурт', 'Ледяная мята'
    ],
    'Хулиган': [
        'Абрикос', 'Банан', 'Вишня', 'Манго', 'Маракуйя', 'Персик', 'Ананас',
        'Клубника', 'Малина', 'Ежевика', 'Шоколад', 'Карамель', 'Ваниль',
        'Сливки', 'Йогурт', 'Сливочный сыр', 'Фундук', 'Кофе', 'Молоко',
        'Мята', 'Лайм', 'Лимон', 'Чай', 'Яблоко', 'Груша'
    ],
    'Black Burn': [
        'Черная смородина', 'Мята', 'Груша', 'Имбирь', 'Шоколад', 'Клубника',
        'Лайм', 'Карамель', 'Яблоко', 'Манго', 'Ананас', 'Кокос', 'Черника',
        'Сливочное масло', 'Лимон', 'Мед', 'Банан', 'Ваниль', 'Арбуз',
        'Персик', 'Малина', 'Виноград', 'Апельсин', 'Грейпфрут'
    ],
    'Musthave': [
        'Ананас', 'Лимон', 'Мята', 'Персик', 'Апельсин', 'Манго', 'Клубника',
        'Банан', 'Йогурт', 'Грейпфрут', 'Яблоко', 'Груша', 'Малина',
        'Абрикос', 'Ваниль', 'Сливки', 'Кокос', 'Маракуйя', 'Лайм', 'Арбуз'
    ],
    'Палитра': [
        'Виноград', 'Ледяная мята', 'Яблоко', 'Корица', 'Клубника', 'Груша',
        'Ваниль', 'Лимон', 'Мед', 'Ананас', 'Кокос', 'Черника',
        'Сливочное масло', 'Мята', 'Лайм', 'Банан', 'Сливки', 'Вишня',
        'Малина', 'Апельсин', 'Арбуз', 'Персик'
    ],
    'Себеро': [
        'Лимочелло', 'Ананас', 'Черная ягода', 'Клубничная жвачка', 'Груша',
        'Черника', 'Голубика', 'Яблоко', 'Барбарис', 'Арбуз', 'Абрикосовый сок',
        'Грейпфрут', 'Лимон', 'Кола', 'Манго', 'Красные скиттлс', 'Клюква',
        'Двуша', 'Зеленая груша', 'Бомба', 'Медовое манго', 'Мишка Гамми',
        'Банан', 'Клубника', 'Малина', 'Вишня', 'Персик', 'Кокос'
    ],
    'Северный': [
        'Мята', 'Лайм', 'Имбирь', 'Клюква', 'Брусника', 'Чай',
        'Лимон', 'Малина', 'Морошка', 'Апельсин', 'Грейпфрут'
    ],
    'Сарма': [
        'Чай', 'Бергамот', 'Мед', 'Дыня', 'Инжир', 'Орех',
        'Персик', 'Вишня', 'Абрикос', 'Яблоко', 'Банан',
        'Кокос', 'Апельсин', 'Лимон', 'Грейпфрут', 'Мята',
        'Корица', 'Ваниль'
    ]
};

// ========== ЗАГРУЗКА ИНВЕНТАРЯ ==========
function loadInventory() {
    try {
        const saved = localStorage.getItem('hookahInventory');
        if (saved) {
            inventory = JSON.parse(saved);
        } else {
            inventory = {};
            Object.values(FLAVORS_FROM_PHOTOS).forEach(flavors => {
                flavors.forEach(f => {
                    if (!inventory[f]) {
                        inventory[f] = false;
                    }
                });
            });
            saveInventory();
        }
    } catch {
        inventory = {};
    }
    
    updateAllKnownFlavors();
    updateInventoryUI();
}

function saveInventory() {
    localStorage.setItem('hookahInventory', JSON.stringify(inventory));
    updateInventoryUI();
}

function updateInventoryUI() {
    const count = Object.values(inventory).filter(v => v).length;
    const total = Object.keys(inventory).length;
    if (inventoryBtn) {
        inventoryBtn.textContent = `📦 Наличие (${count}/${total})`;
        if (count > 0) {
            inventoryBtn.classList.add('active');
        } else {
            inventoryBtn.classList.remove('active');
        }
    }
}

function updateAllKnownFlavors() {
    const allFlavors = new Set();
    
    recipes.forEach(recipe => {
        if (Array.isArray(recipe.ingredients)) {
            recipe.ingredients.forEach(f => allFlavors.add(f.trim()));
        }
    });
    
    Object.values(FLAVORS_FROM_PHOTOS).forEach(flavors => {
        flavors.forEach(f => allFlavors.add(f));
    });
    
    Object.keys(inventory).forEach(f => allFlavors.add(f));
    
    allKnownFlavors = Array.from(allFlavors).sort();
    
    let changed = false;
    allKnownFlavors.forEach(f => {
        if (!(f in inventory)) {
            inventory[f] = false;
            changed = true;
        }
    });
    
    if (changed) {
        saveInventory();
    }
}

// ========== ДОБАВЛЕНИЕ НОВОГО ВКУСА ==========
function addNewFlavor() {
    const flavor = prompt('🍃 Введите название нового вкуса:');
    if (!flavor || flavor.trim() === '') return;
    
    const trimmed = flavor.trim();
    
    if (inventory[trimmed] !== undefined) {
        showToast(`⚠️ Вкус "${trimmed}" уже есть в списке`);
        return;
    }
    
    inventory[trimmed] = true;
    saveInventory();
    updateAllKnownFlavors();
    renderInventory();
    renderRecipes();
    showToast(`✅ Вкус "${trimmed}" добавлен!`);
}

function removeFlavorFromInventory(flavor) {
    if (!confirm(`Удалить вкус "${flavor}" из списка наличия?`)) return;
    
    delete inventory[flavor];
    saveInventory();
    updateAllKnownFlavors();
    renderInventory();
    renderRecipes();
    showToast(`🗑️ Вкус "${flavor}" удалён`);
}

// ========== ИЗБРАННОЕ ==========
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('hookahFavorites') || '[]');
    } catch {
        return [];
    }
}

function setFavorites(favorites) {
    localStorage.setItem('hookahFavorites', JSON.stringify(favorites));
}

function toggleFavorite(id) {
    let favorites = getFavorites();
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('⭐ Удалено из избранного');
    } else {
        favorites.push(id);
        showToast('⭐ Добавлено в избранное');
    }
    setFavorites(favorites);
    renderRecipes();
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

function showFavorites() {
    const btn = document.getElementById('favFilterBtn');
    showOnlyFavorites = !showOnlyFavorites;
    
    if (showOnlyFavorites) {
        btn.classList.add('active');
        btn.textContent = '⭐ Все рецепты';
    } else {
        btn.classList.remove('active');
        btn.textContent = '⭐ Избранное';
        currentFilter = 'all';
        document.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.brand-btn[data-brand="all"]')?.classList.add('active');
    }
    renderRecipes();
}

// ========== ИНВЕНТАРЬ ==========
function toggleInventory() {
    const panel = document.getElementById('inventoryPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        renderInventory();
        document.getElementById('inventoryPanel').scrollIntoView({ behavior: 'smooth' });
    } else {
        panel.style.display = 'none';
    }
}

function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    const search = document.getElementById('inventorySearch').value.toLowerCase().trim();
    
    updateAllKnownFlavors();
    
    const sortedFlavors = allKnownFlavors.sort();
    const filtered = sortedFlavors.filter(f => f.toLowerCase().includes(search));
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="color:#555;text-align:center;padding:20px;grid-column:1/-1;">
                Нет вкусов. 
                <button onclick="addNewFlavor()" style="background:#6a3093;color:white;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;margin-left:8px;">
                    ➕ Добавить
                </button>
            </div>
        `;
        updateInventoryStats();
        return;
    }
    
    let html = '';
    filtered.forEach(flavor => {
        const checked = inventory[flavor] || false;
        let brand = '';
        for (const [b, flavors] of Object.entries(FLAVORS_FROM_PHOTOS)) {
            if (flavors.includes(flavor)) {
                brand = b;
                break;
            }
        }
        if (!brand) {
            for (const recipe of recipes) {
                if (Array.isArray(recipe.ingredients) && recipe.ingredients.includes(flavor)) {
                    brand = recipe.brand || '';
                    break;
                }
            }
        }
        
        html += `
            <div class="inventory-item ${checked ? 'checked' : ''}" onclick="toggleFlavor('${flavor.replace(/'/g, "\\'")}')">
                <input type="checkbox" ${checked ? 'checked' : ''} onclick="event.stopPropagation(); toggleFlavor('${flavor.replace(/'/g, "\\'")}')">
                <label>${flavor}</label>
                ${brand ? `<span class="brand-tag-small">${brand}</span>` : ''}
                <button onclick="event.stopPropagation(); removeFlavorFromInventory('${flavor.replace(/'/g, "\\'")}')" 
                        style="background:none;border:none;color:#666;cursor:pointer;font-size:12px;padding:0 4px;">✖</button>
            </div>
        `;
    });
    
    html += `
        <div class="inventory-item add-new" onclick="addNewFlavor()" style="border-color:#6a3093;border-style:dashed;cursor:pointer;justify-content:center;grid-column:1/-1;">
            <span style="color:#6a3093;font-weight:bold;">➕ Добавить вкус</span>
        </div>
    `;
    
    grid.innerHTML = html;
    updateInventoryStats();
}

function toggleFlavor(flavor) {
    inventory[flavor] = !inventory[flavor];
    saveInventory();
    renderInventory();
    renderRecipes();
}

function selectAllFlavors() {
    Object.keys(inventory).forEach(key => inventory[key] = true);
    saveInventory();
    renderInventory();
    renderRecipes();
    showToast('✅ Все вкусы отмечены');
}

function deselectAllFlavors() {
    Object.keys(inventory).forEach(key => inventory[key] = false);
    saveInventory();
    renderInventory();
    renderRecipes();
    showToast('❌ Все вкусы сняты');
}

function updateInventoryStats() {
    const count = Object.values(inventory).filter(v => v).length;
    const total = Object.keys(inventory).length;
    document.getElementById('inventoryCount').textContent = `Выбрано: ${count}/${total}`;
    
    const available = recipes.filter(recipe => isRecipeAvailable(recipe));
    document.getElementById('availableRecipes').textContent = `Доступно рецептов: ${available.length}`;
}

function isRecipeAvailable(recipe) {
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) return false;
    const hasInventory = Object.values(inventory).some(v => v);
    if (!hasInventory) return true;
    return recipe.ingredients.every(f => inventory[f.trim()] === true);
}

function getMissingIngredients(recipe) {
    if (!Array.isArray(recipe.ingredients)) return [];
    return recipe.ingredients.filter(f => inventory[f.trim()] !== true);
}

// ========== ЗАГРУЗКА РЕЦЕПТОВ ==========
function loadRecipes() {
    recipesGrid.innerHTML = '<div class="loading"><span>⏳ Загрузка рецептов...</span></div>';
    
    database.ref('recipes').on('value', (snapshot) => {
        const data = snapshot.val();
        recipes = [];
        
        if (data) {
            Object.keys(data).forEach(key => {
                recipes.push({
                    id: key,
                    ...data[key]
                });
            });
        }
        
        recipes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        loadInventory();
        
        updateStats();
        renderBrandFilters();
        renderTopFlavors();
        renderRecipes();
    }, (error) => {
        recipesGrid.innerHTML = `<div class="no-results"><span>❌</span><p>Ошибка загрузки: ${error.message}</p></div>`;
    });
}

function updateStats() {
    totalRecipes.textContent = `📊 ${recipes.length} рецептов`;
}

function renderTopFlavors() {
    const container = document.getElementById('flavorsList');
    const flavors = {};
    
    recipes.forEach(r => {
        if (Array.isArray(r.ingredients)) {
            r.ingredients.forEach(f => {
                const key = f.trim();
                flavors[key] = (flavors[key] || 0) + 1;
            });
        }
    });
    
    const sorted = Object.entries(flavors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    if (sorted.length === 0) {
        container.innerHTML = '<span style="color:#555;">Нет данных</span>';
        return;
    }
    
    container.innerHTML = sorted.map(([flavor, count]) => 
        `<span class="flavor-tag">${flavor} <span class="count">${count}</span></span>`
    ).join('');
}

function renderBrandFilters() {
    const brands = [...new Set(recipes.map(r => r.brand))];
    const favoriteBrands = ['Darkside', 'Хулиган', 'Black Burn', 'Musthave', 'Палитра', 'Себеро', 'Северный', 'Сарма'];
    
    const sortedBrands = [
        ...favoriteBrands.filter(b => brands.includes(b)),
        ...brands.filter(b => !favoriteBrands.includes(b))
    ];

    let html = `<button class="brand-btn active" data-brand="all">🔥 Все (${recipes.length})</button>`;
    sortedBrands.forEach(brand => {
        const count = recipes.filter(r => r.brand === brand).length;
        html += `<button class="brand-btn" data-brand="${brand}">${brand} (${count})</button>`;
    });
    brandFilters.innerHTML = html;

    document.querySelectorAll('.brand-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.brand;
            if (showOnlyFavorites) {
                showOnlyFavorites = false;
                document.getElementById('favFilterBtn').classList.remove('active');
                document.getElementById('favFilterBtn').textContent = '⭐ Избранное';
            }
            renderRecipes();
        });
    });
}

function renderRecipes() {
    let filtered = [...recipes];

    if (showOnlyFavorites) {
        const favorites = getFavorites();
        filtered = filtered.filter(r => favorites.includes(r.id));
    }

    if (currentFilter !== 'all' && !showOnlyFavorites) {
        filtered = filtered.filter(r => r.brand === currentFilter);
    }

    if (currentSearch.trim()) {
        const search = currentSearch.toLowerCase().trim();
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(search) ||
            r.brand.toLowerCase().includes(search) ||
            (Array.isArray(r.ingredients) && r.ingredients.some(i => i.toLowerCase().includes(search))) ||
            (r.description && r.description.toLowerCase().includes(search)) ||
            (Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(search)))
        );
    }

    if (filtered.length === 0) {
        recipesGrid.innerHTML = `
            <div class="no-results">
                <span>🔍</span>
                <p>Ничего не найдено</p>
                <p style="font-size: 0.8rem; color: #444; margin-top: 6px;">Попробуй изменить поиск или фильтр</p>
            </div>
        `;
        return;
    }

    const hasInventory = Object.values(inventory).some(v => v);

    let html = '';
    filtered.forEach(recipe => {
        const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(' + ') : recipe.ingredients;
        const brandClass = (recipe.brand || '').replace(/\s/g, '-');
        const views = recipe.views || 0;
        const isFav = isFavorite(recipe.id);
        
        const available = !hasInventory || isRecipeAvailable(recipe);
        const missing = hasInventory ? getMissingIngredients(recipe) : [];
        const missingText = missing.length > 0 ? `❌ Нет: ${missing.join(', ')}` : '';
        
        html += `
            <div class="recipe-card ${available ? 'available' : 'unavailable'}" data-id="${recipe.id}">
                <h3>
                    ${recipe.name}
                    ${!available ? `<span class="missing-badge">❌</span>` : ''}
                </h3>
                <div class="brand-tag brand-tag-${brandClass}">${recipe.brand || 'Без бренда'}</div>
                
                ${recipe.tags && recipe.tags.length > 0 ? `
                    <div class="recipe-tags">
                        ${recipe.tags.map(tag => `<span class="recipe-tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="ingredients">
                    <span>🧪 Состав:</span> ${ingredients}
                </div>
                ${!available && missingText ? `<div style="color:#f87171;font-size:0.85rem;margin:6px 0;">${missingText}</div>` : ''}
                <div class="ratio">
                    <strong>⚖️ Пропорции:</strong> ${recipe.ratio || 'Не указаны'}
                </div>
                ${recipe.description ? `<div class="description">📝 ${recipe.description}</div>` : ''}
                <div class="recipe-views">👁️ ${views} просмотров</div>
                
                <div class="actions">
                    <button class="btn-fav ${isFav ? 'fav-active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${recipe.id}')">
                        ${isFav ? '⭐' : '☆'}
                    </button>
                    <button class="btn-edit" onclick="editRecipe('${recipe.id}')">✏️</button>
                    <button class="btn-copy" onclick="copyRecipe('${recipe.id}')">📋</button>
                    <button class="btn-print" onclick="printRecipe('${recipe.id}')">🖨️</button>
                    <button class="btn-delete" onclick="deleteRecipe('${recipe.id}')">🗑️</button>
                </div>
            </div>
        `;
    });
    recipesGrid.innerHTML = html;
}

function incrementViews(id) {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
        const views = (recipe.views || 0) + 1;
        database.ref('recipes/' + id + '/views').set(views);
    }
}

document.addEventListener('click', function(e) {
    const card = e.target.closest('.recipe-card');
    if (card && !e.target.closest('button') && !card.classList.contains('unavailable')) {
        incrementViews(card.dataset.id);
    }
});

function randomRecipe() {
    let available = recipes;
    const hasInventory = Object.values(inventory).some(v => v);
    if (hasInventory) {
        available = recipes.filter(r => isRecipeAvailable(r));
    }
    
    if (available.length === 0) {
        showToast(hasInventory ? 'Нет доступных рецептов с текущим наличием' : 'Нет рецептов :(');
        return;
    }
    
    const random = available[Math.floor(Math.random() * available.length)];
    
    document.querySelectorAll('.recipe-card').forEach(c => c.classList.remove('highlight'));
    
    const cards = document.querySelectorAll('.recipe-card');
    cards.forEach(card => {
        if (card.dataset.id === random.id) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('highlight');
            incrementViews(random.id);
        }
    });
    
    setTimeout(() => {
        document.querySelectorAll('.recipe-card').forEach(c => c.classList.remove('highlight'));
    }, 3000);
}

function copyRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients;
    const text = `🧪 ${recipe.name}\n📦 Бренд: ${recipe.brand}\n📋 Состав: ${ingredients}\n⚖️ Пропорции: ${recipe.ratio || 'Не указаны'}\n📝 ${recipe.description || ''}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ Рецепт скопирован!');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('✅ Рецепт скопирован!');
}

function printRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    
    const printWindow = window.open('', '_blank');
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>${recipe.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                    h1 { color: #6a3093; }
                    .brand { color: #888; margin-bottom: 20px; }
                    .section { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 8px; }
                    .label { font-weight: bold; }
                    .footer { margin-top: 30px; color: #ccc; font-size: 12px; text-align: center; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <h1>${recipe.name}</h1>
                <div class="brand">📦 ${recipe.brand}</div>
                <div class="section"><span class="label">🧪 Состав:</span> ${ingredients}</div>
                <div class="section"><span class="label">⚖️ Пропорции:</span> ${recipe.ratio || 'Не указаны'}</div>
                ${recipe.description ? `<div class="section"><span class="label">📝 Описание:</span> ${recipe.description}</div>` : ''}
                ${recipe.tags && recipe.tags.length > 0 ? `<div class="section"><span class="label">🏷️ Теги:</span> ${recipe.tags.join(', ')}</div>` : ''}
                <div class="footer">Hookah Mix PRO — ${new Date().toLocaleDateString()}</div>
                <button onclick="window.print()" class="no-print" style="padding:10px 20px;background:#6a3093;color:white;border:none;border-radius:8px;cursor:pointer;margin-top:20px;">🖨️ Печать</button>
            </body>
        </html>
    `);
    printWindow.document.close();
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function saveRecipe() {
    const name = document.getElementById('recipeName').value.trim();
    const brand = document.getElementById('recipeBrand').value;
    const ingredientsRaw = document.getElementById('recipeIngredients').value.trim();
    const ratio = document.getElementById('recipeRatio').value.trim();
    const tagsRaw = document.getElementById('recipeTags').value.trim();
    const description = document.getElementById('recipeDescription').value.trim();

    if (!name || !ingredientsRaw || !ratio) {
        showToast('⚠️ Заполни все поля с *');
        return;
    }

    const ingredients = ingredientsRaw.split(',').map(i => i.trim()).filter(i => i);
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const recipeData = {
        name,
        brand,
        ingredients,
        ratio,
        tags,
        description: description || 'Без описания',
        updatedAt: Date.now()
    };

    if (editingId) {
        database.ref('recipes/' + editingId).update(recipeData)
            .then(() => {
                resetForm();
                showToast('✅ Рецепт обновлён!');
                updateAllKnownFlavors();
            })
            .catch(err => showToast('❌ Ошибка: ' + err.message));
    } else {
        recipeData.createdAt = Date.now();
        recipeData.views = 0;
        database.ref('recipes').push(recipeData)
            .then(() => {
                resetForm();
                showToast('✅ Рецепт добавлен!');
                updateAllKnownFlavors();
            })
            .catch(err => showToast('❌ Ошибка: ' + err.message));
    }
}

function editRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    editingId = id;
    document.getElementById('recipeName').value = recipe.name;
    document.getElementById('recipeBrand').value = recipe.brand || 'Darkside';
    document.getElementById('recipeIngredients').value = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients;
    document.getElementById('recipeRatio').value = recipe.ratio || '';
    document.getElementById('recipeTags').value = Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '';
    document.getElementById('recipeDescription').value = recipe.description || '';
    
    document.getElementById('addForm').style.display = 'block';
    document.querySelector('.btn-success').textContent = '🔄 Обновить';
    document.getElementById('addForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    
    const userInput = prompt(`⚠️ Для удаления рецепта "${recipe.name}" введите его название:`);
    if (userInput === recipe.name) {
        database.ref('recipes/' + id).remove()
            .then(() => showToast('🗑️ Рецепт удалён'))
            .catch(err => showToast('❌ Ошибка: ' + err.message));
    } else if (userInput !== null) {
        showToast('❌ Удаление отменено');
    }
}

function toggleAddForm() {
    const form = document.getElementById('addForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
    } else {
        resetForm();
    }
}

function resetForm() {
    document.getElementById('addForm').style.display = 'none';
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeBrand').value = 'Darkside';
    document.getElementById('recipeIngredients').value = '';
    document.getElementById('recipeRatio').value = '';
    document.getElementById('recipeTags').value = '';
    document.getElementById('recipeDescription').value = '';
    document.querySelector('.btn-success').textContent = '💾 Сохранить';
    editingId = null;
}

function exportRecipes() {
    if (recipes.length === 0) {
        showToast('Нет рецептов для экспорта');
        return;
    }
    
    const dataStr = JSON.stringify(recipes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hookah_recipes_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Экспорт завершён!');
}

function importFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) throw new Error('Файл должен содержать массив рецептов');
            
            let count = 0;
            let errors = 0;
            
            data.forEach(recipe => {
                if (recipe.name && recipe.brand && recipe.ingredients) {
                    const newRef = database.ref('recipes').push();
                    newRef.set({
                        name: recipe.name,
                        brand: recipe.brand,
                        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients],
                        ratio: recipe.ratio || 'Не указаны',
                        tags: Array.isArray(recipe.tags) ? recipe.tags : [],
                        description: recipe.description || 'Без описания',
                        views: recipe.views || 0,
                        createdAt: Date.now()
                    });
                    count++;
                } else {
                    errors++;
                }
            });
            
            showToast(`✅ Импортировано ${count} рецептов${errors ? `, ${errors} пропущено` : ''}`);
            updateAllKnownFlavors();
        } catch(err) {
            showToast('❌ Ошибка: ' + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

searchInput.addEventListener('input', function() {
    currentSearch = this.value;
    renderRecipes();
});

loadRecipes();

window.saveRecipe = saveRecipe;
window.editRecipe = editRecipe;
window.deleteRecipe = deleteRecipe;
window.toggleAddForm = toggleAddForm;
window.exportRecipes = exportRecipes;
window.importFromFile = importFromFile;
window.randomRecipe = randomRecipe;
window.copyRecipe = copyRecipe;
window.printRecipe = printRecipe;
window.toggleFavorite = toggleFavorite;
window.showFavorites = showFavorites;
window.toggleInventory = toggleInventory;
window.toggleFlavor = toggleFlavor;
window.selectAllFlavors = selectAllFlavors;
window.deselectAllFlavors = deselectAllFlavors;
window.renderInventory = renderInventory;
window.addNewFlavor = addNewFlavor;
window.removeFlavorFromInventory = removeFlavorFromInventory;