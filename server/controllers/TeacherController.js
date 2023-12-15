const Teacher = require('../models/TeacherModel');
const bcrypt = require('bcrypt');
const Theses = require('../models/ThesesModel');
const RequestsProgress = require('../models/RequestsProgressModel');
const Document = require('../models/DocumentModel');
const User = require('../models/UserModel');

// Thêm mới giảng viên
exports.addTeacher = async (req, res) => {
    try {
        const { UserName, Password, DepartmentID, FullName, DateOfBirth, Email, Phone, Address, Position } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const existingUser = await User.findOne({ UserName });

        if (existingUser) {
            res.status(401).json({ message: 'Người dùng đã tồn tại!' });
        } else {
            var role = 'teacher';
            if (Position == "Trưởng bộ môn") {
                // Kiểm tra xem đã có Trưởng bộ môn cho DepartmentID hay chưa
                const existingDepartmentHead = await Teacher.findOne({ Position: "Trưởng bộ môn", DepartmentID });

                if (existingDepartmentHead) {
                    return res.status(400).json({ message: 'Trưởng bộ môn đã tồn tại cho bộ môn này!' });
                }

                role = "departmentHead";
            }
            const newUser = new User({
                UserName,
                Password: hashedPassword,
                Role: role
            });

            await newUser.save();
            const newTeacher = new Teacher({
                UserID: newUser._id,
                DepartmentID,
                FullName,
                DateOfBirth,
                Email,
                Phone,
                Address,
                Position
            });

            await newTeacher.save();

            res.status(200).json({ message: 'Giảng viên đã được thêm thành công!' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm giảng viên: ' + error.message });
    }
};

// Lấy tất cả giảng viên
exports.getAllTeachers = async (req, res) => {
    try {
        // Lấy giá trị của tham số department từ request
        const { departmentId } = req.params;

        // Tạo một đối tượng chứa các điều kiện tìm kiếm
        const conditions = {};
        if (departmentId) {
            if (departmentId !== 'All') {
                conditions.DepartmentID = departmentId;
            }
        }

        // Sử dụng các điều kiện tìm kiếm khi truy vấn dữ liệu
        const teachers = await Teacher.find(conditions).populate('UserID').populate('DepartmentID');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách giảng viên' });
    }
};

// Lấy thông tin giảng viên bằng ID
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.teacherId).populate('UserID').populate('DepartmentID');
        if (!teacher) {
            return res.status(404).json({ message: 'Giảng viên không tồn tại' });
        }
        res.json({
            teacher: teacher,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin giảng viên' });
    }
};

// Cập nhật thông tin giảng viên bằng ID
exports.editTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { UserName, Password, DepartmentID, FullName, DateOfBirth, Email, Phone, Address, Position, flashHead } = req.body;

        // Kiểm tra xem giảng viên có tồn tại không
        const existingTeacher = await Teacher.findById(teacherId).populate('UserID');

        if (!existingTeacher) {
            res.status(404).json({ message: 'Giảng viên không tồn tại!' });
            return;
        }
        var role = 'teacher';
        if (Position == "Trưởng bộ môn" && !flashHead) {
            // Kiểm tra xem đã có Trưởng bộ môn cho DepartmentID hay chưa
            const existingDepartmentHead = await Teacher.findOne({ Position: "Trưởng bộ môn", DepartmentID });

            if (existingDepartmentHead) {
                res.status(404).json({ message: 'Trưởng bộ môn đã tồn tại cho bộ môn này!' });
                return;
            }

            role = "departmentHead";
        }
        // Kiểm tra xem có cập nhật mật khẩu không
        let updatedPassword = existingTeacher.UserID.Password;
        if (Password) {
            const saltRounds = 10;
            updatedPassword = await bcrypt.hash(Password, saltRounds);
        }

        // Cập nhật thông tin sinh viên
        existingTeacher.UserID.UserName = UserName;
        existingTeacher.UserID.Role = role;
        existingTeacher.UserID.Password = updatedPassword;
        existingTeacher.DepartmentID = DepartmentID;
        existingTeacher.FullName = FullName;
        existingTeacher.DateOfBirth = DateOfBirth;
        existingTeacher.Email = Email;
        existingTeacher.Phone = Phone;
        existingTeacher.Address = Address;
        existingTeacher.Position = Position;

        // Lưu các thay đổi
        await existingTeacher.save();
        await existingTeacher.UserID.save();

        res.status(200).json({ message: 'Thông tin giảng viên đã được cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin giảng viên' });
    }
};

// Xóa giảng viên bằng ID
exports.deleteTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Giảng viên không tồn tại' });
        }

        const teachers = await Teacher.find(teacherId);
        await Promise.all(
            teachers.map(async (teacher) => {
                if (teacher.UserID) {
                    await User.findByIdAndDelete(teacher.UserID);
                }

                // Delete Theses
                const theses = await Theses.find({ AdvisorID: teacher._id });

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

                // Delete RequestsProgress and associated Documents for teacher
                const requests = await RequestsProgress.find({ AdvisorID: teacher._id });

                if (requests && requests.length > 0) {
                    await Document.deleteMany({ RequestID: { $in: requests.map((r) => r._id) } });
                    await RequestsProgress.deleteMany({ AdvisorID: teacher._id });
                }

                await Teacher.findByIdAndDelete(teacher._id);
            })
        );
        res.json({ message: 'Giảng viên đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa giảng viên' });
    }
};
