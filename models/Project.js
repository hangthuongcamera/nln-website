const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { 
        type: String, 
        required: true,
        // Ví dụ phân loại: 'Dân dụng', 'Công nghiệp', 'Nghỉ dưỡng', 'Hạ tầng'
    }, 
    description: { type: String }, // Đoạn mô tả ngắn hiển thị ở dạng Card
    content: { type: String }, // Nội dung bài viết chi tiết của dự án (Lưu HTML từ Rich Text Editor)
    thumbnail: { type: String }, // Ảnh đại diện chính
    images: [{ type: String }], // Thư viện ảnh thực tế công trình (Gallery)
    client: { type: String }, // Tên chủ đầu tư / Đối tác
    scale: { type: String }, // Quy mô dự án (VD: 50.000 m2, 1000 căn hộ...)
    suppliedMaterials: [{ type: String }], // Các hạng mục vật tư đã cung cấp (VD: Ống nhựa Bình Minh, Dây cáp Cadivi)
    status: {
        type: String,
        enum: ['planning', 'ongoing', 'completed'], // Đang lên kế hoạch, Đang thi công, Đã hoàn thành
        default: 'completed'
    },
    completionDate: { type: Date }, // Ngày hoàn thành
    isFeatured: { type: Boolean, default: false } // Đánh dấu dự án tiêu biểu để đưa ra Trang chủ
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);