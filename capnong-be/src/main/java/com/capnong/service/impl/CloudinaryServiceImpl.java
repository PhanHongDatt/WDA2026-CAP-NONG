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
