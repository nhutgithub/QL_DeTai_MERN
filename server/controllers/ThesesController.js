const Theses = require('../models/ThesesModel');
const bcrypt = require('bcrypt');

// Thêm mới đề tài
exports.addTheses = async (req, res) => {
    try {
        const { Title, Description, DepartmentID, AdvisorID, ReviewerID1, ReviewerID2, ReviewerID3, Status, StartDate, EndDate } = req.body;

        const newTheses = new Theses({
            DepartmentID,
            AdvisorID,
            ReviewerID1,
            ReviewerID2,
            ReviewerID3,
            Title,
            Description,
            Status,
            StartDate,
            EndDate
        });

        await newTheses.save();

        res.status(200).json({ message: 'Đề tài đã được thêm thành công!' });

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm đề tài: ' + error.message });
    }
};

// Lấy tất cả đề tài
exports.getAllTheses = async (req, res) => {
    try {
        try {
            // Sử dụng Mongoose để truy vấn tất cả đề tài
            const allTheses = await Theses.find().populate('AdvisorID').populate('ReviewerID1').populate('ReviewerID2').populate('ReviewerID3').populate('DepartmentID');
            res.json(allTheses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đề tài' });
    }
};

// Lấy thông tin đề tài bằng ID
exports.getThesesById = async (req, res) => {
    try {
        const theses = await Theses.findById(req.params.thesesId);
        if (!theses) {
            return res.status(404).json({ message: 'Đề tài không tồn tại' });
        }
        res.json({
            theses: theses,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin đề tài' });
    }
};

// Cập nhật thông tin đề tài bằng ID
exports.editTheses = async (req, res) => {
    try {
        const { thesesId } = req.params;
        const { Title, Description, DepartmentID, AdvisorID, ReviewerID1, ReviewerID2, ReviewerID3, Status, StartDate, EndDate } = req.body;

        // Kiểm tra xem đề tài có tồn tại không
        const existingTheses = await Theses.findById(thesesId);

        if (!existingTheses) {
            res.status(404).json({ message: 'Đề tài không tồn tại!' });
            return;
        }

        // Cập nhật thông tin đề tài
        existingTheses.Title = Title;
        existingTheses.Description = Description;
        existingTheses.DepartmentID = DepartmentID;
        existingTheses.AdvisorID = AdvisorID;
        existingTheses.ReviewerID1 = ReviewerID1;
        existingTheses.ReviewerID2 = ReviewerID2;
        existingTheses.ReviewerID3 = ReviewerID3;
        existingTheses.Status = Status;
        existingTheses.StartDate = StartDate;
        existingTheses.EndDate = EndDate;

        // Lưu các thay đổi
        await existingTheses.save();

        res.status(200).json({ message: 'Thông tin đề tài đã được cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin đề tài' });
    }
};

// Xóa đề tài bằng ID
exports.deleteTheses = async (req, res) => {
    try {
        const thesesId = req.params.thesesId;
        const teacher = await Theses.findById(thesesId);
        if (!teacher) {
            return res.status(404).json({ message: 'Đề tài không tồn tại' });
        }

        // Delete Theses
        const theses = await Theses.find(thesesId);

        await Promise.all(
            theses.map(async (thesis) => {
                const requests = await RequestsProgress.find({ ThesisID: thesis._id });
                if (requests && requests.length > 0) {
                    await Document.deleteMany({ RequestID: { $in: requests.map((r) => r._id) } });

                    await RequestsProgress.deleteMany({ ThesisID: thesis._id });
                }

                await Theses.findByIdAndDelete(thesis._id);
            })
        );

        res.json({ message: 'Đề tài đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa đề tài' });
    }
};

exports.changeThesisStatus = async (req, res) => {
    try {
        const thesisID = req.params.thesesId;
        const newStatus = req.params.status;
        // Tìm đề tài theo ThesisID
        const thesis = await Theses.findOne({ _id: thesisID });

        // Nếu không tìm thấy đề tài
        if (!thesis) {
            return { success: false, message: 'Không tìm thấy đề tài' };
        }

        // Thay đổi trường Status
        thesis.Status = newStatus;

        // Lưu thay đổi vào cơ sở dữ liệu
        await thesis.save();

        res.json({ message: 'Đã cập nhật trạng thái đề tài' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đề tài', error: error.message });
    }
};

// Lấy thông tin đề tài bằng DepartmentID
exports.getThesesByDepartmentID = async (req, res) => {
    try {
        const theses = await Theses.find({ DepartmentID: req.params.departmentId, Status: "Kế hoạch" })
            .populate('AdvisorID')
            .populate('DepartmentID')
            .populate('ReviewerID1')
            .populate('ReviewerID2')
            .populate('ReviewerID3');
        if (!theses) {
            return res.status(404).json({ message: 'Đề tài không tồn tại' });
        }
        res.json({
            theses: theses,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin đề tài' });
    }
};
// Lấy thông tin đề tài bằng DepartmentID
exports.getThesesByAdvisorID = async (req, res) => {
    try {
        const theses = await Theses.find({ AdvisorID: req.params.advisorID })
            .populate('AdvisorID')
            .populate('DepartmentID')
            .populate('ReviewerID1')
            .populate('ReviewerID2')
            .populate('ReviewerID3');
        if (!theses) {
            return res.status(404).json({ message: 'Đề tài không tồn tại' });
        }
        res.json({
            theses: theses,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin đề tài' });
    }
};