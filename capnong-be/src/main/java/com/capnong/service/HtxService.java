package com.capnong.service;

import com.capnong.dto.request.*;
import com.capnong.dto.response.HtxJoinRequestResponse;
import com.capnong.dto.response.HtxResponse;
import com.capnong.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

public interface HtxService {

    // Document Upload
    String uploadDocument(MultipartFile file, String username);

    // Tạo HTX (FARMER)
    HtxResponse createHtx(HtxCreateRequest request, String username);

    // ADMIN xét duyệt
    List<HtxResponse> getPendingHtxRequests();
    List<HtxResponse> getAllHtx();
    HtxResponse reviewHtx(UUID htxId, HtxReviewRequest request);

    // Gia nhập HTX (FARMER → HTX_MEMBER)
    HtxJoinRequestResponse requestToJoin(UUID htxId, HtxJoinRequestDto request, String username);
    List<HtxJoinRequestResponse> getMyJoinRequests(String username);
    List<HtxJoinRequestResponse> getPendingJoinRequests(String managerUsername);
    HtxJoinRequestResponse reviewJoinRequest(UUID requestId, JoinRequestReviewDto review, String managerUsername);

    // Rời / Xóa thành viên
    void leaveHtx(String username);
    void removeMember(UUID memberId, String managerUsername);

    // Chuyển quyền / Giải tán
    void transferOwnership(UUID newManagerId, String currentManagerUsername);
    void dissolveHtx(String managerUsername);

    // Query
    List<UserResponse> getMyHtxMembers(String managerUsername);
    HtxResponse getMyHtx(String username);
    HtxResponse getHtxById(UUID htxId);
    List<HtxResponse> getActiveHtxList();
}
