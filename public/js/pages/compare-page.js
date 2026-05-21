/*
================================================================
    LOGIC FOR PRODUCT COMPARE PAGE (/compare)
================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    const compareContainer = document.getElementById('compare-container');
    const emptyTemplate = document.getElementById('empty-compare-template');
    const loadingTemplate = document.getElementById('loading-compare-template');
    const tableTemplate = document.getElementById('compare-table-template');

    /**
     * Renders a specific template into the main container.
     * @param {HTMLTemplateElement} template - The template element to render.
     */
    const renderTemplate = (template) => {
        if (template && compareContainer) {
            compareContainer.innerHTML = template.innerHTML;
        }
    };

    /**
     * Fetches product data from the server based on IDs from localStorage
     * and renders the comparison table.
     */
    const loadCompareData = async () => {
        renderTemplate(loadingTemplate);

        let productIds = [];
        try {
            productIds = JSON.parse(localStorage.getItem('compareList')) || [];
        } catch (e) {
            console.error("Lỗi khi đọc danh sách so sánh từ localStorage:", e);
            productIds = [];
        }

        if (productIds.length === 0) {
            renderTemplate(emptyTemplate);
            return;
        }

        try {
            // NOTE: This requires a backend API endpoint to fetch multiple products by their IDs.
            // Example: POST /api/v1/products/by-ids with body { ids: [...] }
            const response = await fetch('/api/v1/products/by-ids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: productIds }),
            });

            if (!response.ok) {
                throw new Error(`Lỗi server: ${response.statusText}`);
            }

            const result = await response.json();
            // The backend should return products in the same order as the requested IDs
            const products = result.data;

            if (!products || products.length === 0) {
                renderTemplate(emptyTemplate);
                return;
            }

            renderCompareTable(products);

        } catch (error) {
            console.error('Lỗi khi tải dữ liệu so sánh:', error);
            compareContainer.innerHTML = `<div class="text-center py-12 text-red-500">
                <i class="fa-solid fa-circle-exclamation text-4xl mb-4"></i>
                <p class="font-semibold">Đã có lỗi xảy ra khi tải dữ liệu.</p>
                <p class="text-sm text-gray-600">Vui lòng thử lại sau.</p>
            </div>`;
        }
    };

    /**
     * Renders the HTML table with product comparison data.
     * @param {Array<Object>} products - An array of product objects from the API.
     */
    const renderCompareTable = (products) => {
        renderTemplate(tableTemplate);

        const tableHeader = document.getElementById('compare-table-header');
        const tableBody = document.getElementById('compare-table-body');

        if (!tableHeader || !tableBody) return;

        // 1. Build Header Row
        let headerHTML = '<tr><th class="p-4 font-semibold text-gray-700 bg-gray-50 border-b border-r w-1/5 sticky left-0 z-10">Tính năng</th>';
        products.forEach(product => {
            const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/img/placeholder.png';
            headerHTML += `
                <th class="p-4 border-b text-center min-w-[200px]">
                    <div class="relative group">
                        <button onclick="removeProductFromCompare('${product._id}')" class="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600" title="Xóa khỏi so sánh">
                            <i class="fa-solid fa-times text-sm"></i>
                        </button>
                        <a href="/product/${product.slug}" class="block">
                            <img src="${imageUrl}" alt="${product.name}" class="w-32 h-32 object-contain mx-auto mb-3 border rounded">
                            <h3 class="font-semibold text-primary hover:text-secondary text-sm line-clamp-2">${product.name}</h3>
                        </a>
                    </div>
                </th>
            `;
        });
        headerHTML += '</tr>';
        tableHeader.innerHTML = headerHTML;

        // 2. Define attributes to compare
        const attributes = [
            { key: 'retailPrice', label: 'Giá bán lẻ' },
            { key: 'sku', label: 'Mã SKU' },
            { key: 'category', label: 'Danh mục' },
            { key: 'brand', label: 'Thương hiệu' },
            { key: 'description', label: 'Mô tả ngắn' },
            { key: 'actions', label: 'Thao tác' }
        ];

        // 3. Build Body Rows
        let bodyHTML = '';
        attributes.forEach(attr => {
            bodyHTML += `<tr><td class="p-4 font-medium text-gray-600 bg-gray-50 border-r sticky left-0 z-10">${attr.label}</td>`;

            products.forEach(product => {
                bodyHTML += '<td class="p-4 text-center align-top border-b">';
                let value = '<span class="text-gray-400">-</span>';
                if (attr.key === 'retailPrice') {
                    value = product.retailPrice ? `<strong class="text-red-600">${product.retailPrice.toLocaleString('vi-VN')}đ</strong>` : 'Liên hệ';
                } else if (attr.key === 'sku') {
                    value = product.sku || '<span class="text-gray-400">-</span>';
                } else if (attr.key === 'category') {
                    value = product.category ? product.category.name : '<span class="text-gray-400">-</span>';
                } else if (attr.key === 'brand') {
                    value = product.brand || 'Đang cập nhật';
                } else if (attr.key === 'description') {
                    value = product.description ? `<div class="text-left text-xs leading-relaxed max-h-24 overflow-y-auto">${product.description}</div>` : '<span class="text-gray-400">-</span>';
                } else if (attr.key === 'actions') {
                    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
                    value = `<button class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
                                onclick="addCurrentProductToCart(this)"
                                data-id="${product._id}" data-product-id="${product._id}" data-name="${product.name}" data-sku="${product.sku}" data-price="${product.retailPrice || 0}" data-image="${imageUrl}">
                                <i class="fa-solid fa-cart-plus mr-2"></i>Thêm vào giỏ
                            </button>`;
                }
                bodyHTML += value + '</td>';
            });
            bodyHTML += '</tr>';
        });
        tableBody.innerHTML = bodyHTML;
    };

    // Make remove function available globally to be called from onclick
    window.removeProductFromCompare = (productId) => {
        let productIds = JSON.parse(localStorage.getItem('compareList')) || [];
        productIds = productIds.filter(id => id !== productId);
        localStorage.setItem('compareList', JSON.stringify(productIds));
        updateCompareCounter(); // This function is in main.js
        loadCompareData(); // Re-render the table
        showToast('Đã xóa sản phẩm khỏi danh sách so sánh.', 'success'); // This function is in main.js
    };

    // Initial load
    loadCompareData();
});