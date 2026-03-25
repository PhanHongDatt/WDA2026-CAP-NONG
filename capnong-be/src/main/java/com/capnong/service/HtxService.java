package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.Htx;
import com.capnong.model.HtxJoinRequest;
import com.capnong.model.Shop;
import com.capnong.model.User;
import com.capnong.model.enums.HtxStatus;
import com.capnong.model.enums.JoinRequestStatus;
import com.capnong.model.enums.Role;
import com.capnong.repository.HtxJoinRequestRepository;
import com.capnong.repository.HtxRepository;
import com.capnong.repository.ShopRepository;
import com.capnong.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class HtxService {

    private final HtxRepository htxRepository;
    private final HtxJoinRequestRepository joinRequestRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    public HtxService(HtxRepository htxRepository,
                      HtxJoinRequestRepository joinRequestRepository,
                      UserRepository userRepository,
                      ShopRepository shopRepository) {
        this.htxRepository = htxRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
    }

    public Htx getById(UUID id) {
        return htxRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy HTX", HttpStatus.NOT_FOUND));
    }

    public List<User> getMembers(UUID htxId) {
        return userRepository.findByHtxId(htxId);
    }

    @Transactional
    public Htx createHtx(UUID managerId, Htx htx) {
        if (htxRepository.existsByOfficialCode(htx.getOfficialCode())) {
            throw new AppException("Mã HTX đã tồn tại", HttpStatus.CONFLICT);
        }

        User user = userRepository.findById(managerId)
                .orElseThrow(() -> new AppException("User không tồn tại", HttpStatus.NOT_FOUND));

        if (user.getHtxId() != null) {
            throw new AppException("Bạn đã thuộc một HTX khác", HttpStatus.CONFLICT);
        }

        htx.setManagerId(managerId);
        htx.setStatus(HtxStatus.PENDING);
        Htx saved = htxRepository.save(htx);

        // Upgrade role + assign HTX
        user.setRole(Role.HTX_MANAGER);
        user.setHtxId(saved.getId());
        userRepository.save(user);

        return saved;
    }

    @Transactional
    public HtxJoinRequest requestJoin(UUID htxId, UUID farmerId, String message) {
        getById(htxId); // validate exists

        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new AppException("User không tồn tại", HttpStatus.NOT_FOUND));

        if (farmer.getHtxId() != null) {
            throw new AppException("Bạn đã thuộc một HTX khác", HttpStatus.CONFLICT);
        }

        if (joinRequestRepository.existsByHtxIdAndFarmerIdAndStatus(htxId, farmerId, JoinRequestStatus.PENDING)) {
            throw new AppException("Bạn đã gửi yêu cầu gia nhập rồi", HttpStatus.CONFLICT);
        }

        return joinRequestRepository.save(HtxJoinRequest.builder()
                .htxId(htxId)
                .farmerId(farmerId)
                .message(message)
                .build());
    }

    public List<HtxJoinRequest> getPendingRequests(UUID htxId) {
        return joinRequestRepository.findByHtxIdAndStatus(htxId, JoinRequestStatus.PENDING);
    }

    @Transactional
    public HtxJoinRequest processJoinRequest(UUID requestId, JoinRequestStatus status, String note) {
        HtxJoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException("Không tìm thấy yêu cầu", HttpStatus.NOT_FOUND));

        if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw new AppException("Yêu cầu đã được xử lý", HttpStatus.BAD_REQUEST);
        }

        request.setStatus(status);
        request.setNote(note);
        joinRequestRepository.save(request);

        if (status == JoinRequestStatus.APPROVED) {
            User farmer = userRepository.findById(request.getFarmerId()).get();
            farmer.setRole(Role.HTX_MEMBER);
            farmer.setHtxId(request.getHtxId());
            userRepository.save(farmer);
        }

        return request;
    }

    @Transactional
    public void leaveHtx(UUID userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User không tồn tại", HttpStatus.NOT_FOUND));

        if (user.getHtxId() == null) {
            throw new AppException("Bạn chưa thuộc HTX nào", HttpStatus.BAD_REQUEST);
        }

        Htx htx = getById(user.getHtxId());
        if (htx.getManagerId().equals(userId)) {
            throw new AppException("Quản lý HTX không thể rời HTX. Hãy chuyển quyền trước.", HttpStatus.BAD_REQUEST);
        }

        user.setHtxId(null);
        user.setRole(Role.FARMER);
        userRepository.save(user);
    }

    @Transactional
    public void removeMember(UUID managerId, UUID memberId, String reason) {
        User manager = userRepository.findById(managerId).get();
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new AppException("Thành viên không tồn tại", HttpStatus.NOT_FOUND));

        if (!member.getHtxId().equals(manager.getHtxId())) {
            throw new AppException("Thành viên không thuộc HTX của bạn", HttpStatus.FORBIDDEN);
        }

        member.setHtxId(null);
        member.setRole(Role.FARMER);
        userRepository.save(member);
    }
}
