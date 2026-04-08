package com.capnong.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload ảnh lên Cloudinary.
     *
     * @param file   file ảnh (MultipartFile)
     * @param folder thư mục trên Cloudinary (vd: "capnong/avatars")
     * @return URL công khai của ảnh đã upload
     */
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

    /**
     * Xóa ảnh trên Cloudinary theo public ID.
     */
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            logger.info("Deleted image from Cloudinary: {}", publicId);
        } catch (IOException e) {
            logger.warn("Failed to delete image from Cloudinary: {}", publicId, e);
        }
    }
}
