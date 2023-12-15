const AcademicYear = require('../models/AcademicYearModel');
const ProjectRegistrationPeriod = require('../models/ProjectRegistrationPeriodModel');
const Student = require('../models/StudentModel');
const ThesisRegistrations = require('../models/ThesisRegistrationModel');
const User = require('../models/UserModel');

// Lấy tất cả niên khóa
exports.getAllAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find();
    res.json(academicYears);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy niên khóa' });
  }
};
// Thêm mới niên khóa
exports.addAcademicYear = async (req, res) => {
  try {
    const { YearName, StartDate, EndDate } = req.body;

    const existingAcademicYear = await AcademicYear.findOne({ YearName: YearName });

    if (existingAcademicYear) {
      res.status(401).json({ message: 'Niên khóa đã tồn tại!' });
    } else {
      const newAcademicYear = new AcademicYear({
        YearName,
        StartDate,
        EndDate
      });

      await newAcademicYear.save();
      res.status(200).json({ message: 'Niên khóa đã được thêm thành công!' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thêm niên khóa: ' + error.message });
  }
};

// Lấy thông tin niên khóa bằng ID
exports.getAcademicYearById = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.academicyearId);
    if (!academicYear) {
      return res.status(404).json({ message: 'Niên khóa không tồn tại' });
    }
    res.json({
      academicyear: academicYear,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin niên khóa' });
  }
};

// Cập nhật thông tin niên khóa bằng ID
exports.editAcademicYear = async (req, res) => {
  try {
    const { YearName, StartDate, EndDate } = req.body;

    // Kiểm tra xem niên khóa có tồn tại không
    const academicYear = await AcademicYear.findById(req.params.academicyearId);

    if (!academicYear) {
      res.status(404).json({ message: 'Niên khóa không tồn tại!' });
      return;
    }

    // Cập nhật thông tin niên khóa
    academicYear.YearName = YearName;
    academicYear.StartDate = StartDate;
    academicYear.EndDate = EndDate;

    // Lưu các thay đổi
    await academicYear.save();

    res.status(200).json({ message: 'Thông tin niên khóa đã được cập nhật thành công!' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thông tin niên khóa: ' + error.message });
  }
};

// Xóa niên khóa bằng ID
exports.deleteAcademicYear = async (req, res) => {
  try {
    const academicId = req.params.academicyearId;
    const academicYear = await AcademicYear.findById(academicId);
    
    if (!academicYear) {
      return res.status(404).json({ message: 'Niên khóa không tồn tại' });
    }

    // Delete ProjectRegistrationPeriod
    await ProjectRegistrationPeriod.deleteMany({ YearID: academicId });

    // Delete Students
    const students = await Student.find({ YearID: academicId });
    await Promise.all(
      students.map(async (student) => {
        await ThesisRegistrations.deleteMany({ StudentID: student._id });
        await User.findByIdAndDelete(student.UserID);
        await Student.findByIdAndDelete(student._id);
      })
    );

    // Delete AcademicYear
    await AcademicYear.findByIdAndDelete(academicId);

    res.json({ message: 'Niên khóa đã bị xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa niên khóa' });
  }
};
