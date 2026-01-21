export const openUploadWidget = (options, callback) => {
    window.cloudinary.openUploadWidget(
        {
            cloudName: options.cloudName,
            uploadPreset: options.uploadPreset,
            folder: options.folder,
            maxFiles: options.maxFiles || 10,
            sources: options.sources || ["local", "url", "camera"],
            resourceType: options.resourceType || "auto",
            multiple: options.multiple !== false,
            clientAllowedFormats: ["jpg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx", "zip"], // ajusta si quieres restringir
            maxFileSize: 10485760, // 10MB por archivo (ajusta)
            ...options,
        },
        callback
    );
};