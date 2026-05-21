/*
================================================================
    MAIN JAVASCRIPT FILE - WEBSITE NHẤT LINH NHI
================================================================
Tập trung toàn bộ mã JavaScript phía Client vào đây để dễ quản lý.
Cấu trúc file:
1.  Hàm Global: Các hàm được gọi trực tiếp từ HTML (onclick).
2.  Sự kiện DOMContentLoaded: Điểm khởi đầu của mọi logic.
================================================================
*/

// ================================================================
// 1. CÁC HÀM GLOBAL (Được gọi từ HTML qua onclick, onsubmit, etc.)
// ================================================================

/**
 * Mở Modal Đăng nhập / Đăng ký
 * @param {'login' | 'register'} type - Loại form cần hiển thị
 */
function openAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    const modalContent = document.getElementById('auth-modal-content');
    const loginForm = document.getElementById('modal-login-form');
    const registerForm = document.getElementById('modal-register-form');

    if (!modal || !modalContent || !loginForm || !registerForm) return;

    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');

    if (type === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else if (type === 'register') {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

/**
 * Đóng Modal Đăng nhập / Đăng ký
 */
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    const modalContent = document.getElementById('auth-modal-content');
    if (!modal || !modalContent) return;

    modal.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

/**
 * Đăng xuất người dùng
 */
async function logoutUser() {
    const token = localStorage.getItem('token');
    try {
        // Gọi API để server xóa cookie
        await fetch('/api/v1/auth/logout', { headers: { 'Authorization': `Bearer ${token}` } });
    } catch (error) {
        console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
        localStorage.removeItem('token');
        window.location.href = '/'; // Chuyển về trang chủ
    }
}

/**
 * Hiển thị Toast thông báo
 * @param {string} message - Nội dung thông báo
 * @param {'success' | 'error'} type - Loại thông báo
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';

    toast.className = `${bgColor} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-x-full opacity-0 max-w-sm`;
    toast.innerHTML = `<i class="fa-solid ${icon} text-xl"></i><p class="font-bold text-sm">${message}</p>`;

    container.appendChild(toast);

    requestAnimationFrame(() => { toast.classList.remove('translate-x-full', 'opacity-0'); });

    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Cập nhật số lượng trên icon giỏ hàng
 */
function updateCartCounter() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
        const badges = document.querySelectorAll('#cart-counter');
        badges.forEach(badge => badge.innerText = totalItems);
    } catch (error) {
        console.error("Lỗi cập nhật số lượng giỏ hàng:", error);
    }
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {HTMLElement} btn - Nút được click
 */
function addCurrentProductToCart(btn) {
    const qtyInput = document.getElementById('detail-quantity');
    const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

    const variantId = btn.getAttribute('data-variant-id') || '';
    const variantName = btn.getAttribute('data-variant-name') || '';
    const baseId = btn.getAttribute('data-id');
    const productItem = {
        id: variantId ? `${baseId}::${variantId}` : baseId,
        productId: btn.getAttribute('data-product-id') || baseId,
        variantId: variantId,
        variantName: variantName,
        name: variantName ? `${btn.getAttribute('data-name')} - ${variantName}` : btn.getAttribute('data-name'),
        sku: btn.getAttribute('data-sku'),
        price: parseInt(btn.getAttribute('data-price')) || 0,
        image: btn.getAttribute('data-image'),
        quantity: qty
    };

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!Array.isArray(cart)) cart = [];
    } catch (error) {
        cart = [];
    }

    const existingIndex = cart.findIndex(item => item.id === productItem.id);

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push(productItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    showToast('Thêm vào giỏ hàng thành công!', 'success');
}

/**
 * Cuộn slider Flash Sale
 * @param {number} direction - 1 cho phải, -1 cho trái
 */
function scrollFlashSale(direction) {
    const container = document.getElementById('flash-sale-container');
    if (!container) return;
    const scrollAmount = (container.querySelector('div').offsetWidth + 16) * 2;
    container.scrollLeft += direction * scrollAmount;
}

/**
 * Cuộn slider Sản phẩm mới
 * @param {number} direction - 1 cho phải, -1 cho trái
 */
function scrollNewProducts(direction) {
    const container = document.getElementById('new-products-container');
    if (!container) return;
    const scrollAmount = container.clientWidth;
    container.scrollLeft += direction * scrollAmount;
}

// Global variable to store compare list (client-side only)
let compareList = [];
const MAX_COMPARE_ITEMS = 4; // Max items to compare

/**
 * Update wishlist counter in header
 */
async function updateWishlistCounter() {
    const wishlistCountEl = document.getElementById('wishlist-count');
    if (!wishlistCountEl) return;

    const token = localStorage.getItem('token');
    if (!token) {
        wishlistCountEl.classList.add('hidden');
        return;
    }

    try {
        const res = await fetch('/api/v1/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
            const count = data.data.length;
            wishlistCountEl.textContent = count;
            if (count > 0) {
                wishlistCountEl.classList.remove('hidden');
            } else {
                wishlistCountEl.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Lỗi cập nhật số lượng yêu thích:', error);
        wishlistCountEl.classList.add('hidden');
    }
}

/**
 * Toggle product in wishlist
 * @param {HTMLElement} btn - The wishlist button element
 * @param {string} productId - ID of the product
 */
async function toggleWishlist(btn, productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.', 'error');
        openAuthModal('login');
        return;
    }

    try {
        btn.disabled = true; // Disable button to prevent multiple clicks
        const res = await fetch('/api/v1/wishlist/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            if (data.isInWishlist) {
                btn.querySelector('i').classList.remove('fa-regular');
                btn.querySelector('i').classList.add('fa-solid');
                showToast('Đã thêm vào yêu thích!', 'success');
            } else {
                btn.querySelector('i').classList.remove('fa-solid');
                btn.querySelector('i').classList.add('fa-regular');
                showToast('Đã xóa khỏi yêu thích!', 'success');

                // Nếu đang ở trong tab yêu thích của trang tài khoản, hãy ẩn card đi
                const wishlistTabContainer = btn.closest('#profile-wishlist');
                if (wishlistTabContainer) {
                    const productCard = btn.closest('.h-full'); // Card có class h-full
                    if (productCard) {
                        productCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        productCard.style.opacity = '0';
                        productCard.style.transform = 'scale(0.9)';
                        setTimeout(() => productCard.remove(), 300);
                    }
                }
            }
            updateWishlistCounter();
        } else {
            showToast(data.message || 'Lỗi khi cập nhật yêu thích.', 'error');
        }
    } catch (error) {
        console.error('Lỗi khi toggle wishlist:', error);
        showToast('Lỗi kết nối server.', 'error');
    } finally {
        btn.disabled = false; // Re-enable button
    }
}

/**
 * Update compare counter in header
 */
function updateCompareCounter() {
    const compareCountEl = document.getElementById('compare-count');
    if (!compareCountEl) return;

    compareList = JSON.parse(localStorage.getItem('compareList')) || [];
    const count = compareList.length;
    compareCountEl.textContent = count;
    if (count > 0) {
        compareCountEl.classList.remove('hidden');
    } else {
        compareCountEl.classList.add('hidden');
    }
}

/**
 * Toggle product in compare list
 * @param {HTMLElement} btn - The compare button element
 * @param {string} productId - ID of the product
 */
function toggleCompare(btn, productId) {
    if (!btn) return;

    const icon = btn.querySelector('i');
    compareList = JSON.parse(localStorage.getItem('compareList')) || [];
    const productIndex = compareList.indexOf(productId);

    if (productIndex > -1) {
        compareList.splice(productIndex, 1);
        showToast('Đã xóa sản phẩm khỏi danh sách so sánh.', 'success');

        btn.classList.remove('text-secondary');
        btn.classList.add('text-gray-600', 'hover:text-primary');
        if (icon) {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
        }
    } else {
        if (compareList.length >= MAX_COMPARE_ITEMS) {
            showToast(`Chỉ có thể so sánh tối đa ${MAX_COMPARE_ITEMS} sản phẩm.`, 'error');
            return;
        }
        compareList.push(productId);
        showToast('Đã thêm sản phẩm vào danh sách so sánh.', 'success');

        btn.classList.add('text-secondary');
        btn.classList.remove('text-gray-600', 'hover:text-primary');
        if (icon) {
            icon.classList.add('fa-solid');
            icon.classList.remove('fa-regular');
        }
    }
    localStorage.setItem('compareList', JSON.stringify(compareList));
    updateCompareCounter();
}

// ================================================================
// 2. LOGIC KHỞI TẠO KHI DOM ĐÃ SẴN SÀNG
// ================================================================
document.addEventListener('DOMContentLoaded', function() {

    /**
     * Kiểm tra trạng thái đăng nhập và cập nhật UI
     */
    async function initAuthStatus() {
        const token = localStorage.getItem('token');
        const authLinks = document.getElementById('auth-links');
        if (!authLinks) return;

        if (token) {
            try {
                const response = await fetch('/api/v1/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) {
                    const resData = await response.json();
                    const user = resData.data || resData;
                    authLinks.innerHTML = `
                        <a href="/tai-khoan" class="hover:text-yellow-300 transition-colors font-semibold"><i class="fa-regular fa-user mr-1"></i> Xin chào, ${user.name}</a>
                        <span class="border-l border-gray-400"></span>
                        <a href="javascript:void(0)" onclick="logoutUser()" class="hover:text-red-300 transition-colors text-red-200">Đăng xuất</a>
                    `;
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Lỗi xác thực:', error);
                localStorage.removeItem('token');
            }
        }
    }

    /**
     * Khởi tạo hiệu ứng gõ chữ cho ô tìm kiếm
     */
    function initTypewriter() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        const phrases = ["Tìm kiếm thiết bị điện...", "Tìm kiếm ống nước, van vòi...", "Tìm kiếm vật tư kim khí...", "Nhập tên sản phẩm, mã SKU..."];
        let phraseIndex = 0, charIndex = 0, isDeleting = false, isFocused = false, typingTimeout;

        searchInput.addEventListener('focus', () => {
            isFocused = true;
            clearTimeout(typingTimeout);
            searchInput.setAttribute('placeholder', 'Nhập từ khóa tìm kiếm...');
        });

        searchInput.addEventListener('blur', () => {
            isFocused = false;
            if (searchInput.value === '') {
                clearTimeout(typingTimeout);
                typeWriter();
            }
        });

        function typeWriter() {
            if (isFocused) return;
            const currentPhrase = phrases[phraseIndex];
            if (isDeleting) {
                searchInput.setAttribute('placeholder', currentPhrase.substring(0, charIndex - 1));
                charIndex--;
            } else {
                searchInput.setAttribute('placeholder', currentPhrase.substring(0, charIndex + 1));
                charIndex++;
            }
            let typingSpeed = isDeleting ? 30 : 80;
            if (!isDeleting && charIndex === currentPhrase.length) {
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 500;
            }
            typingTimeout = setTimeout(typeWriter, typingSpeed);
        }
        typeWriter();
    }

    /**
     * Khởi tạo chức năng Live Search
     */
    function initLiveSearch() {
        const searchInput = document.getElementById('search-input');
        const searchSuggestions = document.getElementById('search-suggestions');
        const searchForm = searchInput ? searchInput.closest('form') : null;

        if (!searchInput || !searchSuggestions || !searchForm) return;

        // Ngăn không cho form submit nếu ô tìm kiếm trống
        searchForm.addEventListener('submit', function(e) {
            if (searchInput.value.trim() === '') {
                e.preventDefault(); // Dừng hành động submit
                // Hiển thị thông báo và focus lại vào ô tìm kiếm
                showToast('Vui lòng nhập từ khóa để tìm kiếm.', 'error');
                searchInput.focus();
            }
        });

        let searchTimeout;

        // Helper to fetch results. Handles both search and default suggestions.
        async function fetchSearchResults(query) {
            try {
                // If query is empty, fetch newest products as suggestions. Otherwise, search.
                let url;
                if (query) {
                    url = `/api/v1/products?search=${encodeURIComponent(query)}&limit=5`;
                } else {
                    const suggestionType = window.APP_SETTINGS?.uiFlags?.searchSuggestionType || 'newest';
                    let suggestionParam = 'sort=newest'; // Default
                    if (suggestionType === 'hot') suggestionParam = 'flag=hot';
                    else if (suggestionType === 'flash_sale') suggestionParam = 'flag=flash_sale';
                    
                    url = `/api/v1/products?${suggestionParam}&limit=5`;
                }
                
                const res = await fetch(url);
                const data = await res.json();
                return data.data || [];
            } catch (error) {
                console.error('Lỗi khi Live Search:', error);
                return [];
            }
        }

        // Helper to render the suggestion box content.
        function renderSuggestions(results, query) {
            searchSuggestions.classList.remove('hidden');
            
            if (results && results.length > 0) {
                const ul = document.createElement('ul');

                // Add a title if it's for default suggestions (no query)
                if (!query) {
                    const titleLi = document.createElement('li');
                    titleLi.className = 'p-3 text-sm font-semibold text-gray-500 border-b';
                    
                    const suggestionType = window.APP_SETTINGS?.uiFlags?.searchSuggestionType || 'newest';
                    let titleText = 'Gợi ý sản phẩm mới nhất';
                    if (suggestionType === 'hot') titleText = 'Gợi ý sản phẩm bán chạy';
                    else if (suggestionType === 'flash_sale') titleText = 'Gợi ý sản phẩm Flash Sale';

                    titleLi.textContent = titleText;
                    ul.appendChild(titleLi);
                }

                results.forEach(p => {
                    const li = document.createElement('li');
                    li.className = 'border-b last:border-b-0 hover:bg-gray-50 transition-colors';
                    const price = p.retailPrice ? p.retailPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
                    const imgUrl = p.images && p.images.length > 0 ? p.images[0] : '/img/placeholder.png';
                    const sku = p.sku || 'Đang cập nhật';
                    li.innerHTML = `<a href="/product/${p.slug}" class="flex items-center p-3 gap-3"><img src="${imgUrl}" alt="${p.name}" class="w-10 h-10 object-cover rounded border border-gray-200 flex-shrink-0"><div class="flex-1 min-w-0"><h4 class="text-sm font-semibold text-gray-800 truncate">${p.name}</h4><p class="text-xs text-gray-500 font-mono">SKU: ${sku}</p></div><div class="text-red-600 font-bold text-sm flex-shrink-0 ml-2">${price}</div></a>`;
                    ul.appendChild(li);
                });

                // Add "View All" link only for actual search queries
                if (query) {
                    const viewAllLi = document.createElement('li');
                    // Corrected link to match form action
                    viewAllLi.innerHTML = `<a href="/category?search=${encodeURIComponent(query)}" class="block text-center py-3 text-sm text-secondary font-semibold hover:bg-gray-50 transition-colors">Xem tất cả kết quả <i class="fa-solid fa-angle-right text-xs ml-1"></i></a>`;
                    ul.appendChild(viewAllLi);
                }
                
                searchSuggestions.innerHTML = '';
                searchSuggestions.appendChild(ul);
            } else {
                // Show different messages for search vs. no suggestions
                if (query) {
                    searchSuggestions.innerHTML = `<div class="p-6 text-center text-sm text-gray-500">Không tìm thấy sản phẩm nào phù hợp với "<b>${query}</b>".</div>`;
                } else {
                    searchSuggestions.innerHTML = `<div class="p-6 text-center text-sm text-gray-500">Không có sản phẩm gợi ý.</div>`;
                }
            }
        }

        // Event listener for typing in the search box
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchSuggestions.classList.add('hidden');
                return;
            }
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const results = await fetchSearchResults(query);
                renderSuggestions(results, query);
            }, 300);
        });

        // Event listener for clicking/focusing on the search box
        searchInput.addEventListener('focus', async function(e) {
            const query = e.target.value.trim();
            // If the input is empty, show default suggestions
            if (query === '') {
                const results = await fetchSearchResults('');
                renderSuggestions(results, '');
            } else if (query.length >= 2) {
                // If there's already a valid query, re-fetch and show results
                const results = await fetchSearchResults(query);
                renderSuggestions(results, query);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.add('hidden');
            }
        });
    }

    /**
     * Khởi tạo Banner Carousel
     */
    function initBannerCarousel() {
        const slidesContainer = document.getElementById('carousel-slides');
        if (!slidesContainer) return;
        let currentSlide = 0;
        const totalSlides = slidesContainer.children.length;
        if (totalSlides <= 1) return;
        const indicators = document.querySelectorAll('.indicator-btn');

        function updateSlide() {
            slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            indicators.forEach((btn, index) => btn.classList.toggle('opacity-50', index !== currentSlide));
        }
        window.nextSlide = () => { currentSlide = (currentSlide + 1) % totalSlides; updateSlide(); };
        window.prevSlide = () => { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateSlide(); };
        window.goToSlide = (index) => { currentSlide = index; updateSlide(); };
        setInterval(window.nextSlide, 5000);
    }

    /**
     * Khởi tạo nút Back to Top
     */
    function handleBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top-btn'); // Giả định nút có ID này
        const footer = document.getElementById('main-footer'); // Giả định footer có ID này

        // Thoát nếu không tìm thấy nút hoặc footer trên trang
        if (!backToTopBtn || !footer) {
            return;
        }

        // Hàm xử lý chính cho sự kiện cuộn trang
        const scrollHandler = () => {
            // 1. Logic hiển thị/ẩn nút "Về đầu trang"
            // Đồng thời bật/tắt pointer-events để nút có thể click được
            if (window.scrollY > 400) {
                backToTopBtn.classList.remove('opacity-0', 'invisible', 'pointer-events-none', 'translate-y-10');
            } else {
                // Thêm lại pointer-events-none khi nút ẩn để tránh tương tác không mong muốn
                backToTopBtn.classList.add('opacity-0', 'invisible', 'pointer-events-none', 'translate-y-10');
            }

            // 2. Logic đổi màu khi cuộn vào footer (Fix C-BUG-06)
            const scrollBottom = window.scrollY + window.innerHeight;
            const footerTop = footer.offsetTop;

            // Khi phần đáy của màn hình đã cuộn vào trong footer (thêm một khoảng đệm 50px)
            if (scrollBottom > footerTop - 50) {
                // Đổi sang màu phụ (secondary - màu cam) để nổi bật trên nền footer
                backToTopBtn.classList.remove('bg-primary', 'hover:bg-blue-700');
                backToTopBtn.classList.add('bg-secondary', 'hover:bg-orange-600');
            } else {
                // Trở lại màu chính (primary - màu xanh) khi ở ngoài footer
                backToTopBtn.classList.add('bg-primary', 'hover:bg-blue-700');
                backToTopBtn.classList.remove('bg-secondary', 'hover:bg-orange-600');
            }
        };

        // Gán sự kiện cuộn trang cho cửa sổ trình duyệt
        window.addEventListener('scroll', scrollHandler);
        // Chạy lần đầu để thiết lập trạng thái ban đầu
        scrollHandler();

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Khởi tạo đồng hồ đếm ngược Flash Sale
     */
    function initFlashSaleCountdown() {
        const countdownContainer = document.getElementById('flash-sale-countdown');
        if (!countdownContainer) return;

        const endDateString = countdownContainer.getAttribute('data-end-date');
        if (!endDateString || new Date(endDateString) < new Date()) {
            countdownContainer.innerHTML = '<p class="text-white font-semibold text-lg">Chương trình đã kết thúc.</p>';
            return;
        }

        const endDate = new Date(endDateString).getTime();

        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        const countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endDate - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownContainer.innerHTML = '<p class="text-white font-semibold text-lg">Chương trình đã kết thúc.</p>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const format = (num) => num < 10 ? '0' + num : num;

            daysEl.textContent = format(days);
            hoursEl.textContent = format(hours);
            minutesEl.textContent = format(minutes);
            secondsEl.textContent = format(seconds);
        }, 1000);
    }

    /**
     * Khởi tạo các nút điều hướng cho slider, chỉ hiển thị khi có overflow
     * @param {string} containerId - ID của container cuộn
     * @param {string} prevBtnId - ID của nút "trước"
     * @param {string} nextBtnId - ID của nút "sau"
     */
    function initSliderButtons(containerId, prevBtnId, nextBtnId) {
        const container = document.getElementById(containerId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (!container || !prevBtn || !nextBtn) return;

        const checkOverflow = () => {
            // Thêm một khoảng nhỏ (1px) để xử lý sai số làm tròn của trình duyệt
            const hasOverflow = container.scrollWidth > container.clientWidth + 1;
            if (hasOverflow) {
                prevBtn.classList.remove('hidden');
                nextBtn.classList.remove('hidden');
            } else {
                prevBtn.classList.add('hidden');
                nextBtn.classList.add('hidden');
            }
        };
        checkOverflow();
        let resizeTimeout;
        window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(checkOverflow, 200); });
    }

    /**
     * Intercepts clicks on the header wishlist icon when the user is logged out.
     */
    function initProtectedHeaderLinks() {
        // The wishlist link is the parent `a` tag of the counter element.
        const wishlistCounter = document.getElementById('wishlist-count');
        const wishlistLink = wishlistCounter ? wishlistCounter.closest('a') : null;

        if (wishlistLink) {
            wishlistLink.addEventListener('click', function(e) {
                const token = localStorage.getItem('token');
                if (!token) {
                    e.preventDefault(); // Stop the default link navigation
                    // Show a toast message and open the login modal
                    showToast('Vui lòng đăng nhập để xem danh sách yêu thích!', 'error');
                    openAuthModal('login');
                }
            });
        }
    }

    // ================================================================
    // 3. GỌI CÁC HÀM KHỞI TẠO
    // ================================================================
    initAuthStatus();
    initTypewriter();
    initLiveSearch();
    updateCartCounter();
    updateWishlistCounter(); // Call new function
    updateCompareCounter(); // Call new function
    initBannerCarousel();
    handleBackToTopButton(); // Gọi hàm mới
    initFlashSaleCountdown();
    initSliderButtons('flash-sale-container', 'flash-sale-prev-btn', 'flash-sale-next-btn');
    initSliderButtons('new-products-container', 'new-products-prev-btn', 'new-products-next-btn');

    /**
     * Khởi tạo trạng thái icon yêu thích trên các card sản phẩm
     * (Kiểm tra xem sản phẩm đã có trong wishlist của người dùng chưa)
     */
    async function initProductCardWishlistStatus() {
        const token = localStorage.getItem('token');
        if (!token) return;

        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        if (wishlistButtons.length === 0) return;

        try {
            const res = await fetch('/api/v1/wishlist', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok && data.success) {
                const userWishlistIds = data.data.map(p => p._id.toString());
                wishlistButtons.forEach(btn => {
                    const productId = btn.dataset.productId;
                    if (userWishlistIds.includes(productId)) {
                        btn.querySelector('i').classList.remove('fa-regular');
                        btn.querySelector('i').classList.add('fa-solid');
                    }
                });
            }
        } catch (error) {
            console.error('Lỗi khi khởi tạo trạng thái yêu thích cho sản phẩm:', error);
        }
    }
    initProductCardWishlistStatus(); // Call this function on DOMContentLoaded

    /**
     * Khởi tạo trạng thái icon so sánh trên các card sản phẩm
     */
    function initProductCardCompareStatus() {
        const compareButtons = document.querySelectorAll('.compare-btn');
        if (compareButtons.length === 0) return;

        const currentCompareList = JSON.parse(localStorage.getItem('compareList')) || [];

        compareButtons.forEach(btn => {
            const productId = btn.dataset.productId;
            const icon = btn.querySelector('i');

            if (currentCompareList.includes(productId)) {
                btn.classList.add('text-secondary');
                btn.classList.remove('text-gray-600', 'hover:text-primary');
                if (icon) {
                    icon.classList.add('fa-solid');
                    icon.classList.remove('fa-regular');
                }
            } else {
                btn.classList.remove('text-secondary');
                btn.classList.add('text-gray-600', 'hover:text-primary');
                if (icon) {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                }
            }
        });
    }
    initProductCardCompareStatus();

    // Initialize protected links after all other initializations
    initProtectedHeaderLinks();
});