const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect('mongodb://0.0.0.0:27017/MERNDatabase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Kết nối cơ sở dữ liệu thành công");
    return connection.connection.db;
  } catch (error) {
    console.error("Lỗi kết nối cơ sở dữ liệu:", error);
    throw error;
  }
};

module.exports = {
  async up(db) {
    const database = await connectDB();

    const usersCollection = database.collection("users");
    const academicyearsCollection = database.collection("academicyears");
    const departmentsCollection = database.collection("departments");
    const teacherCollection = database.collection("teachers");

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('12345678', saltRounds);

    const usersData = [
      {
        UserName: 'admin',
        Password: hashedPassword,
        Role: 'admin'
      },
      {
        UserName: 'teacher',
        Password: hashedPassword,
        Role: 'teacher'
      },
      {
        UserName: 'departmentHead',
        Password: hashedPassword,
        Role: 'departmentHead'
      }
    ];

    await usersCollection.insertMany(usersData);

    await academicyearsCollection.insertMany([
      {
        YearName: '2018-2022'
      },
      {
        YearName: '2019-2023'
      },
      {
        YearName: '2020-2024'
      }
    ]);

    await departmentsCollection.insertMany([
      {
        DepartmentName: "Tin học ứng dụng",
        Description: 'Tin học ứng dụng'
      },
      {
        DepartmentName: "Công nghệ thông tin",
        Description: "Công nghệ thông tin"
      },
      {
        DepartmentName: "Khoa học máy tính",
        Description: "Khoa học máy tính"
      }
    ]);

    const department = await departmentsCollection.findOne({ DepartmentName: "Tin học ứng dụng" });
    const admin = await usersCollection.findOne({ Role: "admin" });
    const teacher = await usersCollection.findOne({ Role: "teacher" });
    const departmentHead = await usersCollection.findOne({ Role: "departmentHead" });

    const teachersData = [
      {
        UserID: admin._id,
        DepartmentID: department._id,
        FullName: 'Nguyen Admin',
        DateOfBirth: new Date('1990-01-01'),
        Email: 'teacher1@example.com',
        Phone: '123456789',
        Address: '123 Main Street',
        Position: "Quản trị viên",
      },
      {
        UserID: teacher._id,
        DepartmentID: department._id,
        FullName: 'Tran Teacher',
        DateOfBirth: new Date('1985-05-15'),
        Email: 'teacher2@example.com',
        Phone: '987654321',
        Address: '456 Second Street',
        Position: "Giảng viên",
      },
      {
        UserID: departmentHead._id,
        DepartmentID: department._id,
        FullName: "Le DepartmentHead",
        DateOfBirth: new Date('1985-05-15'),
        Email: 'teacher2@example.com',
        Phone: '987654321',
        Address: '456 Second Street',
        Position: "Trưởng bộ môn",
      },
    ];

    await teacherCollection.insertMany(teachersData);

  },

  async down(db) {
    const database = await connectDB();

    const usersCollection = database.collection("users");
    const academicyearsCollection = database.collection("academicyears");
    const departmentsCollection = database.collection("departments");
    const teacherCollection = database.collection("teachers");

    await departmentsCollection.deleteMany({});

    await usersCollection.deleteMany({});

    await academicyearsCollection.deleteMany({});
    await teacherCollection.deleteMany({});

  }
};