package com.capnong.service.impl;

import com.capnong.dto.request.*;
import com.capnong.dto.response.HtxJoinRequestResponse;
import com.capnong.dto.response.HtxResponse;
import com.capnong.dto.response.UserResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.mapper.HtxMapper;
import com.capnong.mapper.UserMapper;
import com.capnong.model.Htx;
import com.capnong.model.HtxJoinRequest;
import com.capnong.model.User;
import com.capnong.model.enums.HtxStatus;
import com.capnong.model.enums.JoinRequestStatus;
import com.capnong.model.enums.Role;
import com.capnong.repository.HtxJoinRequestRepository;
import com.capnong.repository.HtxRepository;
import com.capnong.repository.UserRepository;
import com.capnong.service.HtxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HtxServiceImpl implements HtxService {

    private final HtxRepository htxRepository;
    private final HtxJoinRequestRepository joinRequestRepository;
    private final UserRepository userRepository;
    private final HtxMapper htxMapper;
    private final UserMapper userMapper;

    // ═══════════════════════════════════════════════════════════════
    // 1. TẠO HTX (FARMER)
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public HtxResponse createHtx(HtxCreateRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (creator.getRole() != Role.FARMER) {
            throw new AppException("Chỉ FARMER mới được tạo đơn thành lập HTX", HttpStatus.FORBIDDEN);
        }

        if (htxRepository.existsByCreatedByUser_Id(creator.getId())) {
            throw new AppException("Bạn đã gửi đơn thành lập HTX rồi", HttpStatus.CONFLICT);
        }

        if (htxRepository.existsByOfficialCode(request.getOfficialCode())) {
            throw new AppException("Mã HTX đã tồn tại trong hệ thống", HttpStatus.CONFLICT);
        }

        Htx htx = Htx.builder()
                .name(request.getName())
                .officialCode(request.getOfficialCode())
                .province(request.getProvince())
                .district(request.getDistrict())
                .description(request.getDescription())
                .documentUrl(request.getDocumentUrl())
                .status(HtxStatus.PENDING)
                .createdByUser(creator)
                .build();

        return htxMapper.toHtxResponse(htxRepository.save(htx));
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. ADMIN XÉT DUYỆT HTX
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<HtxResponse> getPendingHtxRequests() {
        return htxRepository.findByStatus(HtxStatus.PENDING).stream()
                .map(htxMapper::toHtxResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HtxResponse> getAllHtx() {
        return htxRepository.findAll().stream()
                .map(htxMapper::toHtxResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HtxResponse reviewHtx(UUID htxId, HtxReviewRequest request) {
        Htx htx = htxRepository.findById(htxId)
                .orElseThrow(() -> new ResourceNotFoundException("HTX", "id", htxId.toString()));

        if (htx.getStatus() != HtxStatus.PENDING) {
            throw new AppException("HTX này đã được xử lý (status: " + htx.getStatus() + ")", HttpStatus.BAD_REQUEST);
        }

        String action = request.getAction().toUpperCase();

        if ("APPROVE".equals(action)) {
            htx.setStatus(HtxStatus.ACTIVE);
            htx.setAdminNote(request.getAdminNote());

            User creator = htx.getCreatedByUser();
            creator.setRole(Role.HTX_MANAGER);
            creator.setHtx(htx);
            userRepository.save(creator);

            htx.setManager(creator);

        } else if ("REJECT".equals(action)) {
            htx.setStatus(HtxStatus.REJECTED);
            htx.setAdminNote(request.getAdminNote());

        } else {
            throw new AppException("Action phải là APPROVE hoặc REJECT", HttpStatus.BAD_REQUEST);
        }

        return htxMapper.toHtxResponse(htxRepository.save(htx));
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. GIA NHẬP HTX (FARMER → HTX_MEMBER)
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public HtxJoinRequestResponse requestToJoin(UUID htxId, HtxJoinRequestDto request, String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (farmer.getRole() != Role.FARMER) {
            throw new AppException("Chỉ FARMER mới có thể gửi yêu cầu gia nhập HTX", HttpStatus.FORBIDDEN);
        }

        if (farmer.getHtx() != null) {
            throw new AppException("Bạn đang là thành viên của một HTX khác. Hãy rời HTX trước.", HttpStatus.CONFLICT);
        }

        if (joinRequestRepository.existsByFarmer_IdAndStatus(farmer.getId(), JoinRequestStatus.PENDING)) {
            throw new AppException("Bạn đã có đơn gia nhập đang chờ duyệt", HttpStatus.CONFLICT);
        }

        Htx htx = htxRepository.findById(htxId)
                .orElseThrow(() -> new ResourceNotFoundException("HTX", "id", htxId.toString()));

        if (htx.getStatus() != HtxStatus.ACTIVE) {
            throw new AppException("HTX chưa được kích hoạt, không thể gia nhập", HttpStatus.BAD_REQUEST);
        }

        HtxJoinRequest joinRequest = HtxJoinRequest.builder()
                .htx(htx)
                .farmer(farmer)
                .message(request.getMessage())
                .status(JoinRequestStatus.PENDING)
                .build();

        return htxMapper.toJoinRequestResponse(joinRequestRepository.save(joinRequest));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HtxJoinRequestResponse> getPendingJoinRequests(String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", managerUsername));

        Htx htx = htxRepository.findByManager_Id(manager.getId())
                .orElseThrow(() -> new AppException("Bạn chưa quản lý HTX nào", HttpStatus.NOT_FOUND));

        return joinRequestRepository.findByHtx_IdAndStatus(htx.getId(), JoinRequestStatus.PENDING).stream()
                .map(htxMapper::toJoinRequestResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HtxJoinRequestResponse reviewJoinRequest(UUID requestId, JoinRequestReviewDto review, String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", managerUsername));

        HtxJoinRequest joinRequest = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("JoinRequest", "id", requestId.toString()));

        if (!joinRequest.getHtx().getManager().getId().equals(manager.getId())) {
            throw new AppException("Bạn không có quyền duyệt đơn gia nhập của HTX này", HttpStatus.FORBIDDEN);
        }

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new AppException("Đơn này đã được xử lý", HttpStatus.BAD_REQUEST);
        }

        String action = review.getAction().toUpperCase();

        if ("APPROVE".equals(action)) {
            joinRequest.setStatus(JoinRequestStatus.APPROVED);
            joinRequest.setNote(review.getNote());

            User farmer = joinRequest.getFarmer();
            farmer.setRole(Role.HTX_MEMBER);
            farmer.setHtx(joinRequest.getHtx());
            userRepository.save(farmer);

        } else if ("REJECT".equals(action)) {
            joinRequest.setStatus(JoinRequestStatus.REJECTED);
            joinRequest.setNote(review.getNote());

        } else {
            throw new AppException("Action phải là APPROVE hoặc REJECT", HttpStatus.BAD_REQUEST);
        }

        return htxMapper.toJoinRequestResponse(joinRequestRepository.save(joinRequest));
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. RỜI / XÓA THÀNH VIÊN KHỎI HTX
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public void leaveHtx(String username) {
        User member = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (member.getHtx() == null || member.getRole() != Role.HTX_MEMBER) {
            throw new AppException("Bạn không phải thành viên HTX nào", HttpStatus.BAD_REQUEST);
        }

        // TODO: Kiểm tra pledge trong Bundle OPEN/CONFIRMED khi implement Bundle module

        member.setHtx(null);
        member.setRole(Role.FARMER);
        userRepository.save(member);
    }

    @Override
    @Transactional
    public void removeMember(UUID memberId, String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", managerUsername));

        Htx htx = htxRepository.findByManager_Id(manager.getId())
                .orElseThrow(() -> new AppException("Bạn chưa quản lý HTX nào", HttpStatus.NOT_FOUND));

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId.toString()));

        if (member.getHtx() == null || !member.getHtx().getId().equals(htx.getId())) {
            throw new AppException("Người dùng này không phải thành viên HTX của bạn", HttpStatus.BAD_REQUEST);
        }

        if (member.getId().equals(manager.getId())) {
            throw new AppException("Bạn không thể xóa chính mình khỏi HTX", HttpStatus.BAD_REQUEST);
        }

        // TODO: Kiểm tra pledge trong Bundle khi implement Bundle module

        member.setHtx(null);
        member.setRole(Role.FARMER);
        userRepository.save(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getMyHtxMembers(String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", managerUsername));

        Htx htx = htxRepository.findByManager_Id(manager.getId())
                .orElseThrow(() -> new AppException("Bạn chưa quản lý HTX nào", HttpStatus.NOT_FOUND));

        return userRepository.findByHtx_Id(htx.getId()).stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HtxResponse getMyHtx(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (user.getHtx() == null) {
            throw new AppException("Bạn chưa thuộc HTX nào", HttpStatus.NOT_FOUND);
        }

        return htxMapper.toHtxResponse(user.getHtx());
    }

    @Override
    @Transactional(readOnly = true)
    public HtxResponse getHtxById(UUID htxId) {
        Htx htx = htxRepository.findById(htxId)
                .orElseThrow(() -> new ResourceNotFoundException("HTX", "id", htxId.toString()));
        return htxMapper.toHtxResponse(htx);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HtxResponse> getActiveHtxList() {
        return htxRepository.findByStatus(HtxStatus.ACTIVE).stream()
                .map(htxMapper::toHtxResponse)
                .collect(Collectors.toList());
    }
}
