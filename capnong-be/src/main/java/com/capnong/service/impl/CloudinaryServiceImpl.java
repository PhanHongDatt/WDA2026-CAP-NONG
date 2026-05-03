package com.capnong.service.impl;

import com.capnong.service.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryServiceImpl.class);

    private final Cloudinary cloudinary;

    public CloudinaryServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    @SuppressWarnings("unchecked")
    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "transformation", "c_fill,w_400,h_400,q_auto"
                    ));
            String url = (String) uploadResult.get("secure_url");
            logger.info("Uploaded image to Cloudinary: {}", url);
            return url;
        } catch (IOException e) {
            logger.error("Failed to upload image to Cloudinary", e);
            throw new RuntimeException("Upload ảnh thất bại: " + e.getMessage());
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public String uploadFile(MultipartFile file, String folder) {
        try {
            String contentType = file.getContentType();
            String publicId = java.util.UUID.randomUUID().toString();
            String resourceType;

            if (contentType != null && contentType.startsWith("image/")) {
                // Ảnh → resource_type = "image"
                // Không thêm extension vào public_id — Cloudinary tự detect format
                resourceType = "image";
            } else if ("application/pdf".equals(contentType)) {
                // PDF → resource_type = "raw", PHẢI có .pdf extension
                resourceType = "raw";
                publicId = publicId + ".pdf";
            } else {
                // Các file khác → resource_type = "raw", giữ extension gốc
                resourceType = "raw";
                String ext = getFileExtension(file.getOriginalFilename());
                if (!ext.isEmpty()) {
                    publicId = publicId + "." + ext;
                }
            }

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", resourceType,
                            "public_id", publicId
                    ));

            // Account có strict delivery → phải dùng signed URL
            String fullPublicId = (String) uploadResult.get("public_id");
            String version = String.valueOf(uploadResult.get("version"));

            com.cloudinary.Url urlBuilder = cloudinary.url()
                    .signed(true)
                    .secure(true)
                    .resourceType(resourceType)
                    .type("upload")
                    .version(version);

            // Với image resource, Cloudinary tách format ra khỏi public_id
            // → cần set format riêng để URL đúng (public_id.format)
            if (!"raw".equals(resourceType)) {
                String format = (String) uploadResult.get("format");
                if (format != null) {
                    urlBuilder.format(format);
                }
            }

            String signedUrl = urlBuilder.generate(fullPublicId);
            logger.info("Uploaded file to Cloudinary (type={}, signed): {}", resourceType, signedUrl);
            return signedUrl;
        } catch (IOException e) {
            logger.error("Failed to upload file to Cloudinary", e);
            throw new RuntimeException("Upload tệp thất bại: " + e.getMessage());
        }
    }

    /**
     * Trích xuất extension từ tên file gốc
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) return "";
        int dot = filename.lastIndexOf('.');
        if (dot > 0 && dot < filename.length() - 1) {
            return filename.substring(dot + 1).toLowerCase();
        }
        return "";
    }

    @Override
    @SuppressWarnings("unchecked")
    public String uploadBase64Image(String base64, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(base64,
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "transformation", "c_fill,w_800,h_800,c_limit,q_auto"
                    ));
            String url = (String) uploadResult.get("secure_url");
            logger.info("Uploaded base64 image to Cloudinary: {}", url);
            return url;
        } catch (IOException e) {
            logger.error("Failed to upload base64 image to Cloudinary", e);
            throw new RuntimeException("Upload ảnh thất bại: " + e.getMessage());
        }
    }

    @Override
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            logger.info("Deleted image from Cloudinary: {}", publicId);
        } catch (IOException e) {
            logger.warn("Failed to delete image from Cloudinary: {}", publicId, e);
        }
    }
}
