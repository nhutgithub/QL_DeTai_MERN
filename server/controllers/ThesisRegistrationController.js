const ThesisRegistration = require('../models/ThesisRegistrationModel');
const ProjectRegistrationPeriod = require('../models/ProjectRegistrationPeriodModel');
const Theses = require('../models/ThesesModel');

// Lấy danh sách đăng kí đề tài
exports.getThesisRegistrationsByThesisID = async (req, res) => {
    try {
        const theses = await ThesisRegistration.find({ ThesisID: req.params.thesisID }).populate("StudentID");
        res.json(theses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đăng kí đề tài' + error });
    }
};
// Thêm mới đăng kí đề tài
exports.addThesisRegistration = async (req, res) => {
    try {
        let responseSent = false; // Flag to track whether a response has been sent

        const { thesisIDValue, studentIDValue } = req.body;

        // Kiểm tra số lượng bản ghi với ThesisID và Status "Đã duyệt"
        ThesisRegistration.countDocuments({ ThesisID: thesisIDValue, Status: 'Đã duyệt' })
            .then(count => {
                if (count === 0) {
                    // Chưa có bản ghi nào với ThesisID, đăng ký với status "Đã duyệt"
                    const newThesisRegistrationData = {
                        ThesisID: thesisIDValue,
                        StudentID: studentIDValue,
                        GroupLeader: true,
                        Status: 'Đã duyệt',
                    };

                    // Thực hiện tạo mới bản ghi
                    return ThesisRegistration.create(newThesisRegistrationData);
                } else if (count === 1) {
                    // Có một bản ghi với ThesisID và Status "Đã duyệt", đăng ký với status "Chờ duyệt"
                    const newThesisRegistrationData = {
                        ThesisID: thesisIDValue,
                        StudentID: studentIDValue,
                        GroupLeader: false,
                        Status: 'Chờ duyệt',
                    };

                    // Thực hiện tạo mới bản ghi
                    return ThesisRegistration.create(newThesisRegistrationData);
                } else {
                    // Có nhiều hơn một bản ghi với ThesisID và Status "Đã duyệt", thông báo "Đã đủ thành viên"
                    responseSent = true;
                    res.status(201).json({ message: 'Đã đủ thành viên' });
                    return;
                }
            })
            .then(createdThesisRegistration => {
                if (!responseSent) {
                    // Only send response if it hasn't been sent before
                    res.status(200).json({ message: 'Đề tài đã được thêm thành công!' });
                }
            })
            .catch(error => {
                if (!responseSent) {
                    // Only send response if it hasn't been sent before
                    res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình xử lý!' });
                }
            });

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm đề tài: ' + error.message });
    }
};
// Lấy danh sách đăng kí đề tài
exports.getThesisRegistrationsByStudentID = async (req, res) => {
    try {
        const studentID = req.params.studentID;

        const allowedStatus = ["Đã duyệt", "Đang thực hiện", "Chờ duyệt"];
        const theses = await ThesisRegistration.find({ StudentID: studentID, Status: { $in: allowedStatus } })
            .populate({
                path: 'ThesisID',
                populate: [
                    {
                        path: 'DepartmentID',
                        model: 'Department',
                    },
                    {
                        path: 'AdvisorID',
                        model: 'Teacher',
                    },
                    {
                        path: 'ReviewerID1',
                        model: 'Teacher',
                    },
                    {
                        path: 'ReviewerID2',
                        model: 'Teacher',
                    },
                    {
                        path: 'ReviewerID3',
                        model: 'Teacher',
                    },
                ],
            })
            .exec();

        res.json(theses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đăng kí đề tài' + error });
    }
};

exports.acceptThesisRegistration = async (req, res) => {
    try {
        const thesisRegistrationId = req.params.thesisRegistrationId;

        // Thay đổi bản ghi có _id = thesisRegistrationId thành Status = "Đã duyệt"
        const item = await ThesisRegistration.findByIdAndUpdate(
            thesisRegistrationId,
            { $set: { Status: 'Đã duyệt' } },
            { new: true }
        );
        const thesis = await Theses.findOne({ _id: item.ThesisID });

        // Nếu không tìm thấy đề tài
        if (!thesis) {
            return { success: false, message: 'Không tìm thấy đề tài' };
        }

        // Thay đổi trường Status
        thesis.Status = newStatus;

        // Lưu thay đổi vào cơ sở dữ liệu
        await thesis.save();

        // Thay đổi các bản ghi còn lại thành Status = "Từ chối"
        await ThesisRegistration.updateMany(
            { _id: { $ne: thesisRegistrationId }, Status: 'Chờ duyệt' },
            { $set: { Status: 'Từ chối' } }
        );

        res.json({ message: 'Đã cập nhật trạng thái yêu cầu đăng kí đề tài' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái yêu cầu đăng kí đề tài', error: error.message });
    }
};

exports.checkDateWithinRange = async (req, res) => {
    try {
        const { yearId } = req.body;

        // Thực hiện kiểm tra ngày trong khoảng thời gian
        const isWithinRange = await isDateWithinRange(yearId, Date.now());

        // Trả về kết quả cho frontend
        res.json({ isWithinRange });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái yêu cầu đăng kí đề tài', error: error.message });
    }
};
// Hàm kiểm tra xem ngày có nằm trong khoảng StartDate và EndDate hay không
async function isDateWithinRange(yearId, dateToCheck) {
    try {
        // Kiểm tra nếu có ít nhất một bản ghi thỏa điều kiện
        const exists = await ProjectRegistrationPeriod.exists({
            YearID: yearId,
            StartDate: { $lte: dateToCheck },
            EndDate: { $gte: dateToCheck },
        });

        return exists;
    } catch (error) {
        console.error('Lỗi khi kiểm tra ngày trong khoảng thời gian:', error);
        return false;
    }
}
// Xóa đăng kí đề tài bằng ID
exports.deleteThesisRegistration = async (req, res) => {
    try {
        const item = await ThesisRegistration.findById(req.params.thesisRegistrationId);
        if (!item) {
            return res.status(404).json({ message: 'Yêu cầu đăng kí đề tài không tồn tại' });
        }

        const deleteItem = await ThesisRegistration.findByIdAndDelete(req.params.thesisRegistrationId);
        if (!deleteItem) {
            return res.status(500).json({ message: 'Lỗi khi xóa yêu cầu đăng kí đề tài' });
        }

        res.json({ message: 'Yêu cầu đăng kí đề tài đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa yêu cầu đăng kí đề tài' });
    }
};
