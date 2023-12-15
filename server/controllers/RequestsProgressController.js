const RequestsProgress = require('../models/RequestsProgressModel');
const Document = require('../models/DocumentModel');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/file/document');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Lấy tất cả yêu cầu
exports.getRequestsProgresssByThesisId = async (req, res) => {
  try {
    const requestsProgressList = await RequestsProgress
      .find({ ThesisID: req.params.thesesId })
      .exec();

    if (requestsProgressList.length === 0) {
      return res.status(404).json({ message: 'Không có RequestsProgress nào tương ứng với ThesisID' });
    }

    const result = [];

    // Lặp qua danh sách các RequestsProgress
    for (const requestsProgress of requestsProgressList) {
      const documents = await Document
        .find({ RequestID: requestsProgress._id })
        .exec();

      // Thêm thông tin về Documents vào mỗi RequestsProgress
      const requestsProgressWithDocuments = { ...requestsProgress.toObject(), Documents: documents };
      result.push(requestsProgressWithDocuments);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy yêu cầu' });
  }
};

// Thêm mới yêu cầu
exports.addRequestsProgress = async (req, res) => {
  try {
    upload.array('files', 5)(req, res, async (err) => {
      if (err) {
        // Xử lý lỗi nếu có
        console.error('Lỗi' + err);
        return res.status(500).json({ message: 'Lỗi khi xử lý tệp tải lên' + err });
      }

      const { ThesisID, AdvisorID, RequestDescription } = req.body;

      const newRequestsProgress = new RequestsProgress({
        ThesisID,
        AdvisorID,
        RequestDescription,
        Progress: 0,
      });

      await newRequestsProgress.save();

      if (req.files && req.files.length > 0) {
        const fileUrls = req.files.map((file) => file.filename);
        for (const fileUrl of fileUrls) {
          const document = new Document({
            RequestID: newRequestsProgress._id,
            DocumentPath: `/file/document/${fileUrl}`,
            Type: 'request'
          });
          await document.save();
        }
      }

      res.status(200).json({ message: 'Yêu cầu đã được thêm thành công!' });
    })
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thêm yêu cầu: ' + error.message });
  }
};

// Lấy thông tin yêu cầu bằng ID
exports.getRequestsProgressById = async (req, res) => {
  try {
    const requestsProgress = await RequestsProgress.findById(req.params.requestsProgressId);

    if (!requestsProgress) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }

    const documents = await Document
      .find({ RequestID: requestsProgress._id, Type: req.params.type });

    res.json({
      requestsProgress: requestsProgress,
      documents: documents
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin yêu cầu' });
  }
};

// Cập nhật thông tin yêu cầu bằng ID
exports.editRequestsProgress = async (req, res) => {
  try {
    upload.array('files', 5)(req, res, async (err) => {
      if (err) {
        // Xử lý lỗi nếu có
        console.error('Lỗi' + err);
        return res.status(500).json({ message: 'Lỗi khi xử lý tệp tải lên' + err });
      }
      const { ThesisID, AdvisorID, RequestDescription, Progress, Type } = req.body;

      // Kiểm tra xem yêu cầu có tồn tại không
      const requestsProgress = await RequestsProgress.findById(req.params.requestsProgressId);

      if (!requestsProgress) {
        res.status(404).json({ message: 'Yêu cầu không tồn tại!' });
        return;
      }

      // Cập nhật thông tin yêu cầu
      if (ThesisID && AdvisorID && RequestDescription) {
        requestsProgress.ThesisID = ThesisID;
        requestsProgress.AdvisorID = AdvisorID;
        requestsProgress.RequestDescription = RequestDescription;
      }
      if (Progress) {
        requestsProgress.Progress = Progress;
      }

      // Lưu các thay đổi
      await requestsProgress.save();
      var type = 'request';
      if (Type) {
        type = Type;
      }
      if (req.files && req.files.length > 0) {
        const fileUrls = req.files.map((file) => file.filename);
        for (const fileUrl of fileUrls) {

          const document = new Document({
            RequestID: requestsProgress._id,
            DocumentPath: `/file/document/${fileUrl}`,
            Type: type
          });
          await document.save();
        }
      }

      res.status(200).json({ message: 'Thông tin yêu cầu đã được cập nhật thành công!' });
    })
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thông tin yêu cầu: ' + error.message });
  }
};

// Xóa yêu cầu bằng ID
exports.deleteRequestsProgress = async (req, res) => {
  try {
    const requestsProgressId = req.params.requestsProgressId;
    const requestsProgress = await RequestsProgress.findById(requestsProgressId);
    if (!requestsProgress) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }
    await Document.deleteMany({RequestID: requestsProgressId});

    await RequestsProgress.findByIdAndDelete(requestsProgressId);

    res.json({ message: 'Yêu cầu đã bị xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa yêu cầu' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Tài liệu không tồn tại' });
    }
    const filePath = path.join(__dirname, '..', 'public', document.DocumentPath);
    fs.unlinkSync(filePath);

    await Document.findByIdAndDelete(req.params.documentId);

    res.json({ message: 'Tài liệu đã bị xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa tài liệu' });
  }
};
