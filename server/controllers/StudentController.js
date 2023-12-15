const Student = require('../models/StudentModel');
const User = require('../models/UserModel');
const ThesisRegistrations = require('../models/ThesisRegistrationModel');
const bcrypt = require('bcrypt');

// Thêm mới sinh viên
exports.addStudent = async (req, res) => {
    try {
        const { UserName, Password, YearID, DepartmentID, FullName, DateOfBirth, Email, Phone, Address } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);
        const existingUser = await User.findOne({ UserName: UserName });

        if (existingUser) {
            res.status(401).json({ message: 'Người dùng đã tồn tại!' });
        } else {
            const newUser = new User({
                UserName,
                Password: hashedPassword,
                Role: 'student'
            });

            await newUser.save();
            const newStudent = new Student({
                UserID: newUser._id,
                YearID,
                DepartmentID,
                FullName,
                DateOfBirth,
                Email,
                Phone,
                Address
            });

            await newStudent.save();

            res.status(200).json({ message: 'Sinh viên đã được thêm thành công!' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm sinh viên: ' + error.message });
    }
};
// Lấy tất cả sinh viên
exports.getAllStudents = async (req, res) => {
    try {
        // Lấy giá trị của tham số department từ request
        const { department, academicyear } = req.params;

        // Tạo một đối tượng chứa các điều kiện tìm kiếm
        const conditions = {};
        if (department) {
            if (department !== 'All') {
                conditions.DepartmentID = department;
            }
        }
        if (academicyear) {
            if (academicyear !== 'All') {
                conditions.YearID = academicyear;
            }
        }
        const students = await Student.find(conditions).populate('UserID').populate('YearID').populate('DepartmentID');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sinh viên' });
    }
};

// Lấy thông tin sinh viên bằng ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate('UserID').populate('YearID').populate('DepartmentID');
        if (!student) {
            return res.status(404).json({ message: 'Sinh viên không tồn tại' });
        }
        res.json({
            student: student,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin sinh viên' });
    }
};

// Cập nhật thông tin sinh viên bằng ID
exports.editStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { UserName, Password, YearID, DepartmentID, FullName, DateOfBirth, Email, Phone, Address } = req.body;

        // Kiểm tra xem sinh viên có tồn tại không
        const existingStudent = await Student.findById(studentId).populate('UserID');

        if (!existingStudent) {
            res.status(404).json({ message: 'Sinh viên không tồn tại!' });
            return;
        }

        // Kiểm tra xem có cập nhật mật khẩu không
        let updatedPassword = existingStudent.UserID.Password;
        if (Password) {
            const saltRounds = 10;
            updatedPassword = await bcrypt.hash(Password, saltRounds);
        }

        // Cập nhật thông tin sinh viên
        existingStudent.UserID.UserName = UserName;
        existingStudent.UserID.Password = updatedPassword;
        existingStudent.YearID = YearID;
        existingStudent.DepartmentID = DepartmentID;
        existingStudent.FullName = FullName;
        existingStudent.DateOfBirth = DateOfBirth;
        existingStudent.Email = Email;
        existingStudent.Phone = Phone;
        existingStudent.Address = Address;

        // Lưu các thay đổi
        await existingStudent.save();
        await existingStudent.UserID.save();

        res.status(200).json({ message: 'Thông tin sinh viên đã được cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi cập nhật thông tin sinh viên: ' + error.message });
    }
};

// Xóa sinh viên bằng ID
exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.studentId
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Sinh viên không tồn tại' });
        }

        const students = await Student.find(studentId);
        await Promise.all(
            students.map(async (student) => {
                await ThesisRegistrations.deleteMany({ StudentID: student._id });
                await User.findByIdAndDelete(student.UserID);
                await Student.findByIdAndDelete(student._id);
            })
        );
        res.json({ message: 'Sinh viên đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sinh viên' });
    }
};
