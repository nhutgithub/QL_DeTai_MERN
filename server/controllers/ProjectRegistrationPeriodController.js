const ProjectRegistrationPeriod = require('../models/ProjectRegistrationPeriodModel');

// Thêm mới đợt đăng kí đề tài
exports.addProjectRegistrationPeriod = async (req, res) => {
    try {
        const { YearID, Title, StartDate, EndDate } = req.body;

        const existingProjectRegistrationPeriod = await ProjectRegistrationPeriod.findOne({ Title: Title });

        if (existingProjectRegistrationPeriod) {
            res.status(401).json({ message: 'Đợt đăng kí đã tồn tại!' });
        } else {

            const newProjectRegistrationPeriod = new ProjectRegistrationPeriod({
                YearID,
                Title,
                StartDate,
                EndDate
            });

            await newProjectRegistrationPeriod.save();

            res.status(200).json({ message: 'Đợt đăng kí đã được thêm thành công!' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm đợt đăng kí: ' + error.message });
    }
};
// Lấy tất cả đợt đăng kí
exports.getAllProjectRegistrationPeriods = async (req, res) => {
    try {
        // Lấy giá trị của tham số department từ request
        const { academicyear } = req.params;

        // Tạo một đối tượng chứa các điều kiện tìm kiếm
        const conditions = {};
        if (academicyear) {
            if (academicyear !== 'All') {
                conditions.YearID = academicyear;
            }
        }
        const students = await ProjectRegistrationPeriod.find(conditions).populate('YearID');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đợt đăng kí' });
    }
};

// Lấy thông tin đợt đăng kí bằng ID
exports.getProjectRegistrationPeriodById = async (req, res) => {
    try {
        const projectRegistrationPeriod = await ProjectRegistrationPeriod.findById(req.params.projectRegistrationPeriodId).populate('YearID');
        if (!projectRegistrationPeriod) {
            return res.status(404).json({ message: 'Đợt đăng kí không tồn tại' });
        }
        res.json({
            projectRegistrationPeriod: projectRegistrationPeriod,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin đợt đăng kí' });
    }
};

// Cập nhật thông tin đợt đăng kí bằng ID
exports.editProjectRegistrationPeriod = async (req, res) => {
    try {
        const { projectRegistrationPeriodId } = req.params;
        const { YearID, Title, StartDate, EndDate } = req.body;

        // Kiểm tra xem sinh viên có tồn tại không
        const existingProjectRegistrationPeriod = await ProjectRegistrationPeriod.findById(projectRegistrationPeriodId).populate('YearID');

        if (!existingProjectRegistrationPeriod) {
            res.status(404).json({ message: 'Đợt đăng kí không tồn tại!' });
            return;
        }

        // Cập nhật thông tin sinh viên
        existingProjectRegistrationPeriod.YearID = YearID;
        existingProjectRegistrationPeriod.Title = Title;
        existingProjectRegistrationPeriod.StartDate = StartDate;
        existingProjectRegistrationPeriod.EndDate = EndDate;

        // Lưu các thay đổi
        await existingProjectRegistrationPeriod.save();

        res.status(200).json({ message: 'Thông tin đợt đăng đã được cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi cập nhật thông tin đợt đăng kí: ' + error.message });
    }
};

// Xóa đợt đăng kí bằng ID
exports.deleteProjectRegistrationPeriod = async (req, res) => {
    try {
        const projectRegistrationPeriodId = await ProjectRegistrationPeriod.findById(req.params.projectRegistrationPeriodId);
        if (!projectRegistrationPeriodId) {
            return res.status(404).json({ message: 'Đợt đăng kí không tồn tại' });
        }

        await ProjectRegistrationPeriod.findByIdAndDelete(req.params.projectRegistrationPeriodId);

        res.json({ message: 'Đợt đăng kí đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa đợt đăng kí' });
    }
};
