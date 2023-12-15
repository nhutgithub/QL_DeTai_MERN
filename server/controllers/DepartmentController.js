const Department = require('../models/DepartmentModel');
const Theses = require('../models/ThesesModel');
const RequestsProgress = require('../models/RequestsProgressModel');
const Student = require('../models/StudentModel');
const Document = require('../models/DocumentModel');
const ThesisRegistrations = require('../models/ThesisRegistrationModel');
const Teacher = require('../models/TeacherModel');
const User = require('../models/UserModel');

// Lấy tất cả chuyên ngành
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy chuyên ngành' });
  }
};
// Thêm mới chuyên ngành
exports.addDepartment = async (req, res) => {
  try {
    const { DepartmentName, Description } = req.body;

    const existingDepartment = await Department.findOne({ DepartmentName: DepartmentName });

    if (existingDepartment) {
      res.status(401).json({ message: 'Chuyên ngành đã tồn tại!' });
    } else {
      const newDepartment = new Department({
        DepartmentName,
        Description,
      });

      await newDepartment.save();
      res.status(200).json({ message: 'Chuyên ngành đã được thêm thành công!' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thêm chuyên ngành: ' + error.message });
  }
};

// Lấy thông tin chuyên ngành bằng ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Chuyên ngành không tồn tại' });
    }
    res.json({
      department: department,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin chuyên ngành' });
  }
};

// Cập nhật thông tin chuyên ngành bằng ID
exports.editDepartment = async (req, res) => {
  try {
    const { DepartmentName, Description } = req.body;

    // Kiểm tra xem chuyên ngành có tồn tại không
    const department = await Department.findById(req.params.departmentId);

    if (!department) {
      res.status(404).json({ message: 'Chuyên ngành không tồn tại!' });
      return;
    }

    // Cập nhật thông tin chuyên ngành
    department.DepartmentName = DepartmentName;
    department.Description = Description;

    // Lưu các thay đổi
    await department.save();

    res.status(200).json({ message: 'Thông tin chuyên ngành đã được cập nhật thành công!' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thông tin chuyên ngành: ' + error.message });
  }
};

// Xóa chuyên ngành bằng ID
exports.deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({ message: 'Chuyên ngành không tồn tại' });
    }

    // Delete Students
    const students = await Student.find({ DepartmentID: departmentId });
    await Promise.all(
      students.map(async (student) => {
        await ThesisRegistrations.deleteMany({ StudentID: student._id });
        await User.findByIdAndDelete(student.UserID);
        await Student.findByIdAndDelete(student._id);
      })
    );

    // Delete Teachers
    const teachers = await Teacher.find({ DepartmentID: departmentId });
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
    // Delete Theses
    const theses = await Theses.find({ DepartmentID: departmentId });

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
    // Delete Department
    await Department.findByIdAndDelete(departmentId);

    res.json({ message: 'Chuyên ngành đã bị xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa chuyên ngành' });
  }
};
