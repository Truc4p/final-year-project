# 📄 Employee Document Upload - Quick Reference

## 🎯 What's New?
Employee documents (resumes, contracts, certificates) can now be uploaded, downloaded, and managed directly in the HR system.

## ✨ Key Features

### Upload
- 📤 Support for PDF, DOC, DOCX, JPG, PNG
- 📊 Max file size: 10MB
- 🏷️ Categorize by type: Resume, Contract, ID, Certificate, Other
- ✍️ Custom naming

### Manage
- 📋 View all documents in organized list
- 📥 One-click download
- 🗑️ Delete with confirmation
- 👀 Document count badges in employee table

## 🚀 Quick Start

### Upload a Document
1. Go to **HR → Employee Directory**
2. Click **Edit** on employee
3. Scroll to **Documents** section
4. Select document type & file
5. Click **Upload**

### Download a Document
1. Open employee edit modal
2. Find document in list
3. Click **⬇️ Download** button

### Delete a Document  
1. Open employee edit modal
2. Find document in list
3. Click **🗑️ Delete** button
4. Confirm deletion

## 📍 File Locations

### Frontend
`frontend/src/pages/admin/hr/HumanResources.vue`
- Lines 58-61: State variables
- Lines 143-150: Document types
- Lines 554-664: Upload/download/delete functions
- Lines 1248-1367: Documents UI section

### Backend
`backend/controllers/hr/hrController.js`
- Lines 364-398: Upload function
- Lines 400-429: Download function
- Lines 431-461: Delete function

`backend/routes/hr/hrRoutes.js`
- Line 422: Upload route
- Line 450: Download route
- Line 479: Delete route

## 🔒 Security
- ✓ Authentication required
- ✓ Admin role only
- ✓ Protected API endpoints
- ✓ Secure file storage

## 📊 API Endpoints

```
POST   /hr/employees/:id/documents
GET    /hr/employees/:id/documents/:docId/download
DELETE /hr/employees/:id/documents/:docId
```

## 💡 Pro Tips

✅ Use descriptive names  
✅ Compress large files  
✅ Delete outdated documents  
✅ Organize by document type  
✅ Check file format before upload

## ⚠️ Important Notes

- Documents only available for **existing employees**
- Document deletion is **permanent**
- Files stored on **server filesystem**
- Upload requires **stable connection**

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Upload fails | Check file size & format |
| Can't download | Check browser popup blocker |
| File too large | Compress or split file |
| Not visible | Refresh page |

## 📞 Need Help?

- Check [User Guide](./DOCUMENT_UPLOAD_USER_GUIDE.md)
- Review [Implementation Summary](./FILE_UPLOAD_FEATURE_SUMMARY.md)
- Contact system administrator

---

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** ✅ Production Ready
