# Employee Document Upload - User Guide

## Overview
The Human Resources system now supports uploading, managing, and downloading employee documents such as resumes, contracts, certificates, and other important files.

## Accessing the Feature

1. Navigate to **Human Resources** page
2. Click on the **Employee Directory** tab
3. Click **Edit** on any existing employee (Documents feature is only available for existing employees)
4. Scroll down to the **Documents** section in the employee modal

## Uploading Documents

### Step-by-Step Instructions

1. **Select Document Type**
   - Choose from the dropdown menu:
     - Resume
     - Contract
     - ID Document
     - Certificate
     - Other

2. **Enter Document Name** (Optional)
   - Type a descriptive name for the document
   - If left empty, the original filename will be used

3. **Choose File**
   - Click the file input field
   - Select a file from your computer
   - Supported formats: PDF, DOC, DOCX, JPG, PNG
   - Maximum size: 10MB

4. **Upload**
   - Click the **Upload** button
   - Wait for the upload to complete (spinner will show)
   - A success message will confirm the upload

### Supported File Types

| Format | Extension | Description |
|--------|-----------|-------------|
| PDF | .pdf | Portable Document Format |
| Microsoft Word | .doc, .docx | Word documents |
| Images | .jpg, .jpeg, .png | Image files |

## Viewing Documents

### Document List
All uploaded documents are displayed in a list below the upload form, showing:

- **Document Icon**: Visual indicator of file type
- **Document Name**: The name given to or derived from the file
- **Document Type Badge**: Category label (Resume, Contract, etc.)
- **Upload Date**: When the document was uploaded

### Quick View in Employee Table
In the main employee directory table, employees with uploaded documents show:
- A blue badge next to their name
- Document icon with count
- Hover tooltip showing number of documents

## Downloading Documents

1. Locate the document in the list
2. Click the **Download** button (down arrow icon)
3. The file will be downloaded to your default download folder
4. The original filename will be preserved

## Deleting Documents

1. Locate the document you want to delete
2. Click the **Delete** button (trash icon)
3. Confirm the deletion in the popup dialog
4. The document will be permanently removed from:
   - The database
   - The server filesystem
   - The employee's record

⚠️ **Warning**: Document deletion is permanent and cannot be undone!

## Best Practices

### File Naming
- Use descriptive names: `John_Doe_Resume_2024.pdf` instead of `resume.pdf`
- Include dates when relevant
- Avoid special characters

### Document Organization
- Upload all relevant documents for each employee
- Use appropriate document types for easy filtering
- Keep documents up to date (delete old versions)

### File Size Optimization
- Compress large PDF files before uploading
- Optimize images to reduce file size
- Consider scanning multi-page documents as a single PDF

### Security
- Only upload documents you have permission to share
- Be mindful of sensitive personal information
- Follow your organization's data privacy policies

## Troubleshooting

### Upload Fails
**Problem**: File won't upload
**Solutions**:
- Check file size (must be under 10MB)
- Verify file format is supported
- Ensure you have a stable internet connection
- Try a different browser
- Contact your system administrator

### Cannot Download Document
**Problem**: Download button doesn't work
**Solutions**:
- Check your browser's pop-up blocker settings
- Ensure you have permission to download files
- Try right-clicking and "Save As"
- Refresh the page and try again

### Document Not Visible
**Problem**: Uploaded document doesn't appear
**Solutions**:
- Refresh the employee list
- Close and reopen the employee modal
- Check if upload was successful (look for success message)
- Verify the document wasn't accidentally deleted

### File Size Too Large
**Problem**: "File too large" error
**Solutions**:
- Compress the PDF using online tools
- Reduce image resolution/quality
- Split large documents into multiple files
- Contact administrator to increase file size limit

## Technical Details

### API Endpoints Used

```
POST   /hr/employees/:id/documents           - Upload document
GET    /hr/employees/:id/documents/:docId/download - Download document
DELETE /hr/employees/:id/documents/:docId    - Delete document
```

### Authentication
- All document operations require authentication
- Only users with admin role can manage documents
- Documents are protected and not publicly accessible

### Storage
- Documents are stored on the server filesystem
- File paths are stored in the database
- Original filenames are preserved
- Unique identifiers prevent naming conflicts

## Features Summary

✅ **Upload** - Add documents to employee records  
✅ **View** - Browse all uploaded documents  
✅ **Download** - Retrieve documents for viewing/editing  
✅ **Delete** - Remove unwanted documents  
✅ **Organize** - Categorize by document type  
✅ **Visual Indicators** - Quick identification in tables  
✅ **Secure** - Role-based access control  

## FAQ

**Q: Can I upload documents when creating a new employee?**  
A: No, documents can only be uploaded for existing employees. Create the employee first, then edit to add documents.

**Q: How many documents can I upload per employee?**  
A: There is no hard limit, but keep it reasonable for performance.

**Q: Can employees view their own documents?**  
A: Currently, only admins can view documents. Employee self-service may be added in future updates.

**Q: What happens to documents when an employee is deleted?**  
A: Documents should be archived or deleted as per your organization's data retention policy.

**Q: Can I edit/replace a document?**  
A: Delete the old document and upload a new one. Version control may be added in future updates.

**Q: Are documents backed up?**  
A: This depends on your server's backup strategy. Consult with your IT department.

## Support

For additional help or to report issues:
- Contact your system administrator
- Check the technical documentation
- Submit a support ticket through your organization's help desk
