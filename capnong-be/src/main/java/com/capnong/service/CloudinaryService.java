package com.capnong.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadImage(MultipartFile file, String folder);
    String uploadBase64Image(String base64, String folder);
    void deleteImage(String publicId);
}
