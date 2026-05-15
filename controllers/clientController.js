const Category = require('../models/Category');
const Product = require('../models/Product');
const Setting = require('../models/Setting');
const Page = require('../models/Page');
const Blog = require('../models/Blog');
const Project = require('../models/Project');

exports.getHomePage = async (req, res) => {
    try {
        const allCategories = await Category.find({ isActive: true }).sort({ createdAt: 1 });

        // 1. Lọc lấy các danh mục Cấp 2 để truyền cho 10 Card Danh mục nổi bật
        const level2Categories = allCategories.filter(c => c.level === 2);

        // 2. Xây dựng Cấu trúc Cây (Tree) cho Mega Menu
        const categoryTree = allCategories.filter(c => c.level === 1).map(parent => {
            return {
                ...parent._doc,
                children: allCategories.filter(c => c.parentCategory && c.parentCategory.toString() === parent._id.toString()).map(child => {
                    return {
                        ...child._doc,
                        subChildren: allCategories.filter(sub => sub.parentCategory && sub.parentCategory.toString() === child._id.toString())
                    }
                })
            };
        });

        // 3. Truy vấn Dữ liệu Sản phẩm (Bán chạy & Flash Sale)
        const flashSales = await Product.find({ 'flags.isFlashSale': true, isActive: true }).limit(8).sort({ createdAt: -1 });
        const bestSellers = await Product.find({ 'flags.isHot': true, isActive: true }).limit(10).sort({ createdAt: -1 });
        const newProducts = await Product.find({ 'flags.isNewProduct': true, isActive: true }).limit(10).sort({ createdAt: -1 });
        
        // 4. Lấy Cấu hình Settings
        const setting = await Setting.findOne();

        // 5. Lấy dữ liệu cho 9 khối danh mục sản phẩm
        let productGridsData = [];
        // Kiểm tra Feature Flag từ Settings: Chỉ query dữ liệu nếu cờ showCategoriesCard đang bật
        if (!setting || !setting.uiFlags || setting.uiFlags.showCategoriesCard !== false) {
            const featuredCategories = await Category.find({ level: 2, isActive: true })
                .limit(9)
                .lean();

            const productPromises = featuredCategories.map(category => {
                return Product.find({ category: category._id, isActive: true })
                    .limit(10) // Giới hạn 10 sản phẩm mỗi grid như kế hoạch
                    .select('name slug sku images retailPrice oldPrice flags') // Chỉ lấy các trường cần thiết cho card sản phẩm
                    .lean();
            });

            const productResults = await Promise.all(productPromises);

            productGridsData = featuredCategories.map((category, index) => {
                return {
                    category: category,
                    products: productResults[index]
                };
            });
        }


        res.render('client/home', {
            currentPath: '/',
            categories: level2Categories, // Vẫn giữ nguyên tên biến 'categories' để 10 Card ngoài trang chủ chạy bình thường
            categoryTree: categoryTree, // Biến mới chuyên phục vụ Mega Menu
            flashSales,
            bestSellers,
            newProducts,
            setting,
            productGridsData // Dữ liệu mới cho 9 khối sản phẩm
        });
    } catch (error) {
        console.error("Lỗi khi render trang chủ:", error);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
};

exports.getBlogList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6; // Đảm bảo limit hiển thị 6 bài viết trên 1 trang
        const skip = (page - 1) * limit;
        
        const query = { status: 'published' };
        
        // Xử lý tìm kiếm và lọc chuyên mục (nếu có)
        if (req.query.q) {
            query.title = { $regex: req.query.q, $options: 'i' };
        }
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Lấy dữ liệu cho trang chính
        const [blogs, totalBlogs] = await Promise.all([
            Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Blog.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalBlogs / limit);

        // Lấy dữ liệu cho Sidebar
        const featuredBlogs = await Blog.find({ status: 'published' }).sort({ views: -1 }).limit(3).lean();
        const categoryCounts = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        res.render('client/blog-list', {
            currentPath: '/tin-tuc',
            pageTitle: 'Tin tức & Kinh nghiệm | Nhất Linh Nhi',
            seoDescription: 'Cập nhật các tin tức, báo giá, khuyến mãi và kinh nghiệm kỹ thuật thi công vật tư điện nước mới nhất.',
            blogs,
            currentPage: page,
            totalPages,
            searchQuery: req.query.q || '',
            currentCategory: req.query.category || '',
            featuredBlogs,
            categoryCounts
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách blog:', error);
        res.status(500).render('client/404', { currentPath: '/404', message: 'Đã xảy ra lỗi hệ thống' });
    }
};

exports.getBlogDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const blog = await Blog.findOneAndUpdate(
            { slug, status: 'published' },
            { $inc: { views: 1 } }, // Tự động tăng lượt xem
            { new: true }
        ).populate('author', 'name').lean(); // Bổ sung populate để lấy tên tác giả

        if (!blog) {
            return res.status(404).render('client/404', { currentPath: '/404', message: 'Không tìm thấy bài viết' });
        }

        // Lấy dữ liệu cho Sidebar
        const featuredBlogs = await Blog.find({ status: 'published', _id: { $ne: blog._id } }).sort({ views: -1 }).limit(3).lean();

        res.render('client/blog-detail', {
            currentPath: `/tin-tuc/${slug}`,
            pageTitle: blog.seoTitle || blog.title,
            seoDescription: blog.seoDescription || blog.excerpt,
            blog,
            featuredBlogs
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết blog:', error);
        res.status(500).render('client/404', { currentPath: '/404', message: 'Đã xảy ra lỗi hệ thống' });
    }
};

exports.getStaticPage = async (req, res) => {
    try {
        const slug = req.params.slug;

        // Xử lý ngoại lệ cho trang Giới thiệu (hiển thị UI riêng biệt thay vì UI bài viết chung)
        if (slug === 'gioi-thieu') {
            return res.render('client/about', { 
                currentPath: `/trang/${slug}`,
                pageTitle: 'Giới Thiệu Về Chúng Tôi | Nhất Linh Nhi',
                seoDescription: 'Công ty TNHH Nhất Linh Nhi - Nhà phân phối sỉ lẻ thiết bị điện, vật tư nước, kim khí dụng cụ chính hãng uy tín hàng đầu miền Nam.'
            });
        }

        const page = await Page.findOne({ slug: slug, isActive: true }).lean();
        
        if (!page) {
            return res.status(404).render('client/page', { page: null, currentPath: `/trang/${slug}` });
        }
        
        res.render('client/page', { page, currentPath: `/trang/${slug}` });
    } catch (error) {
        console.error('Lỗi khi tải trang tĩnh:', error);
        res.status(500).send('Đã có lỗi xảy ra');
    }
};

exports.getContactPage = async (req, res) => {
    try {
        res.render('client/contact', {
            currentPath: '/lien-he',
            pageTitle: 'Liên Hệ | Nhất Linh Nhi',
            seoDescription: 'Liên hệ với Nhất Linh Nhi để được tư vấn, báo giá vật tư điện nước công trình nhanh chóng nhất.'
        });
    } catch (error) {
        console.error('Lỗi khi render trang liên hệ:', error);
        res.status(500).send('Đã có lỗi xảy ra');
    }
};

exports.getProfilePage = async (req, res) => {
    try {
        res.render('client/profile', {
            currentPath: '/tai-khoan',
            pageTitle: 'Tài khoản của tôi | Nhất Linh Nhi',
            seoDescription: 'Quản lý thông tin cá nhân, xem lịch sử mua hàng và yêu cầu báo giá.'
        });
    } catch (error) {
        console.error('Lỗi khi render trang tài khoản:', error);
        res.status(500).send('Đã có lỗi xảy ra');
    }
};

exports.getCartPage = async (req, res) => {
    try {
        res.render('client/cart', {
            currentPath: '/cart',
            pageTitle: 'Giỏ hàng của bạn | Nhất Linh Nhi',
            seoDescription: 'Xem và quản lý các vật tư điện nước trong giỏ hàng của bạn.'
        });
    } catch (error) {
        console.error('Lỗi khi render trang giỏ hàng:', error);
        res.status(500).send('Đã có lỗi xảy ra');
    }
};

exports.getCheckoutPage = async (req, res) => {
    try {
        res.render('client/checkout', {
            currentPath: '/checkout',
            pageTitle: 'Thanh toán đơn hàng | Nhất Linh Nhi',
            seoDescription: 'Tiến hành điền thông tin giao hàng và hoàn tất thanh toán đơn hàng.'
        });
    } catch (error) {
        console.error('Lỗi khi render trang thanh toán:', error);
        res.status(500).send('Đã có lỗi xảy ra');
    }
};

exports.getProjectList = async (req, res) => {
    try {
        // Lấy tất cả dự án từ database, sắp xếp mới nhất lên đầu
        const projects = await Project.find({}).sort({ createdAt: -1 }).lean();

        res.render('client/projects', {
            currentPath: '/du-an',
            pageTitle: 'Dự Án Công Trình Tiêu Biểu | Nhất Linh Nhi',
            seoDescription: 'Tự hào là đơn vị cung cấp vật tư thiết bị điện, nước, kim khí cho hàng trăm công trình lớn nhỏ trên toàn quốc.',
            projects
        });
    } catch (error) {
        console.error('Lỗi khi render trang danh sách dự án:', error);
        res.status(500).send('Đã có lỗi xảy ra');
    }
};

exports.getCategoryPage = async (req, res) => {
    try {
        const { cat, minPrice, maxPrice, sort, page } = req.query;

        // 1. Lấy dữ liệu Category Tree cho Sidebar (Danh mục 3 cấp)
        const allCategories = await Category.find({ isActive: true }).sort({ createdAt: 1 });
        const categoryTree = allCategories.filter(c => c.level === 1).map(parent => {
            return {
                ...parent._doc,
                children: allCategories.filter(c => c.parentCategory && c.parentCategory.toString() === parent._id.toString()).map(child => {
                    return {
                        ...child._doc,
                        subChildren: allCategories.filter(sub => sub.parentCategory && sub.parentCategory.toString() === child._id.toString())
                    }
                })
            };
        });

        // 2. Xây dựng Query Lọc Sản Phẩm
        let query = { isActive: true };
        let currentCategory = null;
        let breadcrumbs = [];

        if (cat) {
            currentCategory = allCategories.find(c => c.slug === cat);
            if (currentCategory) {
                let categoryIds = [currentCategory._id];
                
                // Đệ quy lấy tất cả danh mục con & cháu của danh mục hiện tại để truy vấn đúp
                const children = allCategories.filter(c => c.parentCategory && c.parentCategory.toString() === currentCategory._id.toString());
                categoryIds = categoryIds.concat(children.map(c => c._id));
                
                children.forEach(child => {
                    const subChildren = allCategories.filter(sub => sub.parentCategory && sub.parentCategory.toString() === child._id.toString());
                    categoryIds = categoryIds.concat(subChildren.map(c => c._id));
                });

                query.category = { $in: categoryIds };

                // Xây dựng đường dẫn Breadcrumbs (Từ cấp cao nhất xuống hiện tại)
                breadcrumbs.push({ name: currentCategory.name, slug: currentCategory.slug });
                let parent = allCategories.find(c => c._id.toString() === currentCategory.parentCategory?.toString());
                while(parent) {
                    breadcrumbs.unshift({ name: parent.name, slug: parent.slug });
                    parent = allCategories.find(c => c._id.toString() === parent.parentCategory?.toString());
                }
            }
        }

        // Lọc theo Khoảng Giá
        if (minPrice || maxPrice) {
            query.retailPrice = {};
            if (minPrice) query.retailPrice.$gte = Number(minPrice);
            if (maxPrice) query.retailPrice.$lte = Number(maxPrice);
        }

        // 3. Cấu hình Sắp xếp (Sorting)
        let sortObj = { createdAt: -1 }; // Mặc định: Mới nhất
        if (sort === 'price_asc') sortObj = { retailPrice: 1 };
        if (sort === 'price_desc') sortObj = { retailPrice: -1 };
        if (sort === 'popular') sortObj = { 'flags.isHot': -1, createdAt: -1 }; // Phổ biến (ưu tiên Hot)

        // 4. Cấu hình Phân trang (Pagination)
        const currentPage = parseInt(page) || 1;
        const limit = 12; // Mặc định 12 SP/trang (chia chẵn cho các lưới 2, 3, 4 cột)
        const skip = (currentPage - 1) * limit;

        // Thực thi Query tổng
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .populate('category', 'name slug')
            .lean();

        res.render('client/category', {
            currentPath: '/category',
            categoryTree,
            products,
            currentCategory,
            breadcrumbs,
            pagination: {
                currentPage,
                totalPages,
                totalProducts,
                limit
            },
            query: req.query
        });
    } catch (error) {
        console.error("Lỗi khi render trang danh sách sản phẩm:", error);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
};

exports.getProductDetailPage = async (req, res) => {
    try {
        const slug = req.params.slug;
        if (!slug) {
            return res.redirect('/category');
        }

        const product = await Product.findOne({ slug: slug, isActive: true }).populate('category').lean();

        if (!product) {
            // Optional: Render a 404 page
            return res.status(404).render('client/404', { currentPath: '/404' });
        }

        // Lấy các sản phẩm liên quan (cùng danh mục, trừ sản phẩm hiện tại)
        const relatedProducts = await Product.find({
            category: product.category._id,
            _id: { $ne: product._id },
            isActive: true
        }).limit(4).lean(); // Giới hạn 4 sản phẩm liên quan

        res.render('client/product-detail', {
            currentPath: '/product',
            product,
            relatedProducts,
            title: product.name + ' - Nhất Linh Nhi' // For the <head>
        });

    } catch (error) {
        console.error("Lỗi khi render trang chi tiết sản phẩm:", error);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
};