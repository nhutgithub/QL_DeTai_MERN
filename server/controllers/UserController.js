const User = require('../models/UserModel');
const Student = require('../models/StudentModel');
const Teacher = require('../models/TeacherModel');
const bcrypt = require('bcrypt');

// Lấy thông tin người dùng bằng ID
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ UserName: username });

        if (!user) {
            return res.status(401).json({ message: 'Tên người dùng không tồn tại' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        let userProfile = null;

        const student = await Student.findOne({ UserID: user._id }).populate("YearID").populate("DepartmentID");
        if (student) {
            userProfile = student;
        } else {
            const teacher = await Teacher.findOne({ UserID: user._id }).populate("DepartmentID");
            if (teacher) {
                userProfile = teacher;
            }
        }

        res.json({
            user: user,
            student_teacher: userProfile,
            message: 'Đăng nhập thành công'
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
    }
};
