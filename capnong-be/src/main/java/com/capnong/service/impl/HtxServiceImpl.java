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
import com.capnong.repository.BundlePledgeRepository;
import com.capnong.model.enums.PledgeStatus;
import com.capnong.service.HtxService;
import com.capnong.service.CloudinaryService;

import com.capnong.service.TelegramNotificationService;
import com.capnong.model.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HtxServiceImpl implements HtxService {

    private final HtxRepository htxRepository;
    private final HtxJoinRequestRepository joinRequestRepository;
    private final UserRepository userRepository;
    private final BundlePledgeRepository pledgeRepository;
    private final HtxMapper htxMapper;
    private final UserMapper userMapper;
    private final CloudinaryService cloudinaryService;

    private final TelegramNotificationService telegramNotificationService;

    // ═══════════════════════════════════════════════════════════════
    // 0. UPLOAD GIẤY TỜ
    // ═══════════════════════════════════════════════════════════════

    @Override
    public String uploadDocument(MultipartFile file, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (user.getRole() != Role.FARMER && user.getRole() != Role.HTX_MANAGER) {
            throw new AppException("Không có quyền tải lên giấy tờ HTX", HttpStatus.FORBIDDEN);
        }

        return cloudinaryService.uploadFile(file, "capnong/htx-docs");
    }

    // ═══════════════════════════════════════════════════════════════
    // 1. TẠO HTX (FARMER)
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    @CacheEvict(value = {"htx_all", "htx_active"}, allEntries = true)
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
                .ward(request.getWard())
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
    @Cacheable("htx_all")
    public List<HtxResponse> getAllHtx() {
        return htxRepository.findAll().stream()
                .map(htxMapper::toHtxResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"htx_all", "htx_active", "htx_detail"}, allEntries = true)
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
        
        joinRequest = joinRequestRepository.save(joinRequest);

        // Notify HTX Manager
        if (htx.getManager() != null) {
            String title = "📩 Đơn gia nhập mới";
            String body = "Nông dân " + farmer.getFullName() + " vừa gửi đơn xin gia nhập HTX. Lời nhắn: " + (request.getMessage() != null ? request.getMessage() : "Không có");
            // Notify HTX Manager — telegramNotificationService.notify() creates in-app + sends Telegram
            telegramNotificationService.notify(htx.getManager().getId(), NotificationType.HTX_JOIN_REQUEST, title, body);
        }

        return htxMapper.toJoinRequestResponse(joinRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HtxJoinRequestResponse> getMyJoinRequests(String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return joinRequestRepository.findByFarmer_Id(farmer.getId()).stream()
                .map(htxMapper::toJoinRequestResponse)
                .collect(Collectors.toList());
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

            // Notify farmer
            String title = "✅ Đơn gia nhập HTX được duyệt";
            String body = "Đơn gia nhập HTX " + joinRequest.getHtx().getName() + " của bạn đã được duyệt. Bạn hiện là thành viên HTX.";
            // Notify farmer — telegramNotificationService.notify() already creates in-app notification
            telegramNotificationService.notify(farmer.getId(), NotificationType.HTX_APPROVED, title, body);

        } else if ("REJECT".equals(action)) {
            joinRequest.setStatus(JoinRequestStatus.REJECTED);
            joinRequest.setNote(review.getNote());

            // Notify farmer
            String title = "❌ Đơn gia nhập HTX bị từ chối";
            String note = review.getNote() != null ? " Lý do: " + review.getNote() : "";
            String body = "Đơn gia nhập HTX " + joinRequest.getHtx().getName() + " của bạn đã bị từ chối." + note;
            
            // Notify farmer — telegramNotificationService.notify() already creates in-app notification
            telegramNotificationService.notify(joinRequest.getFarmer().getId(), NotificationType.HTX_REJECTED, title, body);

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

        // Kiểm tra pledge trong Bundle OPEN/CONFIRMED
        long activePledges = pledgeRepository.countByFarmer_IdAndStatus(member.getId(), PledgeStatus.ACTIVE);
        if (activePledges > 0) {
            throw new AppException("Bạn đang có cam kết (pledge) đang hoạt động trong Bundle. "
                    + "Hãy rút cam kết trước khi rời HTX.", HttpStatus.BAD_REQUEST);
        }

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

        // Kiểm tra pledge trong Bundle
        long activePledges = pledgeRepository.countByFarmer_IdAndStatus(member.getId(), PledgeStatus.ACTIVE);
        if (activePledges > 0) {
            throw new AppException("Thành viên này đang có cam kết (pledge) đang hoạt động trong Bundle. "
                    + "Không thể xóa khỏi HTX lưu lượng chưa giải quyết.", HttpStatus.BAD_REQUEST);
        }

        member.setHtx(null);
        member.setRole(Role.FARMER);
        userRepository.save(member);
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. CHUYỂN QUYỀN CHỦ HTX
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    @CacheEvict(value = {"htx_all", "htx_active", "htx_detail"}, allEntries = true)
    public void transferOwnership(UUID newManagerId, String currentManagerUsername) {
        User currentManager = userRepository.findByUsername(currentManagerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentManagerUsername));

        if (currentManager.getRole() != Role.HTX_MANAGER) {
            throw new AppException("Bạn không phải chủ HTX", HttpStatus.FORBIDDEN);
        }

        Htx htx = htxRepository.findByManager_Id(currentManager.getId())
                .orElseThrow(() -> new AppException("Bạn chưa quản lý HTX nào", HttpStatus.NOT_FOUND));

        User newManager = userRepository.findById(newManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", newManagerId.toString()));

        // Phải là HTX_MEMBER trong cùng HTX
        if (newManager.getRole() != Role.HTX_MEMBER || newManager.getHtx() == null
                || !newManager.getHtx().getId().equals(htx.getId())) {
            throw new AppException("Người được chọn phải là thành viên (HTX_MEMBER) trong HTX của bạn",
                    HttpStatus.BAD_REQUEST);
        }

        // Chủ cũ → HTX_MEMBER
        currentManager.setRole(Role.HTX_MEMBER);
        userRepository.save(currentManager);

        // Chủ mới → HTX_MANAGER
        newManager.setRole(Role.HTX_MANAGER);
        userRepository.save(newManager);

        // Cập nhật HTX
        htx.setManager(newManager);
        htxRepository.save(htx);
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. GIẢI TÁN HTX
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    @CacheEvict(value = {"htx_all", "htx_active", "htx_detail"}, allEntries = true)
    public void dissolveHtx(String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", managerUsername));

        if (manager.getRole() != Role.HTX_MANAGER) {
            throw new AppException("Bạn không phải chủ HTX", HttpStatus.FORBIDDEN);
        }

        Htx htx = htxRepository.findByManager_Id(manager.getId())
                .orElseThrow(() -> new AppException("Bạn chưa quản lý HTX nào", HttpStatus.NOT_FOUND));

        // Chuyển tất cả members (bao gồm manager) về FARMER
        List<User> allMembers = userRepository.findByHtx_Id(htx.getId());
        for (User member : allMembers) {
            member.setHtx(null);
            member.setRole(Role.FARMER);
        }
        userRepository.saveAll(allMembers);

        // Từ chối tất cả join requests đang PENDING
        List<HtxJoinRequest> pendingRequests = joinRequestRepository.findByHtx_IdAndStatus(
                htx.getId(), JoinRequestStatus.PENDING);
        for (HtxJoinRequest req : pendingRequests) {
            req.setStatus(JoinRequestStatus.REJECTED);
            req.setNote("HTX đã giải tán");
        }
        joinRequestRepository.saveAll(pendingRequests);

        // Giải tán HTX
        htx.setManager(null);
        htx.setStatus(HtxStatus.DISSOLVED);
        htxRepository.save(htx);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getMyHtxMembers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // HTX_MANAGER: lookup via manager relationship
        // HTX_MEMBER: lookup via user.htx
        Htx htx;
        if (user.getRole() == Role.HTX_MANAGER) {
            htx = htxRepository.findByManager_Id(user.getId())
                    .orElseThrow(() -> new AppException("Bạn chưa quản lý HTX nào", HttpStatus.NOT_FOUND));
        } else {
            htx = user.getHtx();
            if (htx == null) {
                throw new AppException("Bạn chưa thuộc HTX nào", HttpStatus.NOT_FOUND);
            }
        }

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
    @Cacheable(value = "htx_detail", key = "#htxId")
    public HtxResponse getHtxById(UUID htxId) {
        Htx htx = htxRepository.findById(htxId)
                .orElseThrow(() -> new ResourceNotFoundException("HTX", "id", htxId.toString()));
        return htxMapper.toHtxResponse(htx);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable("htx_active")
    public List<HtxResponse> getActiveHtxList() {
        return htxRepository.findByStatus(HtxStatus.ACTIVE).stream()
                .map(htxMapper::toHtxResponse)
                .collect(Collectors.toList());
    }
}
