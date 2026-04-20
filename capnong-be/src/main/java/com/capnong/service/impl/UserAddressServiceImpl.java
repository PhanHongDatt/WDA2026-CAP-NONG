package com.capnong.service.impl;

import com.capnong.dto.request.UserAddressRequest;
import com.capnong.dto.response.UserAddressResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.UserAddress;
import com.capnong.repository.UserAddressRepository;
import com.capnong.service.UserAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAddressServiceImpl implements UserAddressService {

    private final UserAddressRepository addressRepository;

    private static final int MAX_ADDRESSES = 10;

    @Override
    public List<UserAddressResponse> getAddresses(UUID userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserAddressResponse createAddress(UUID userId, UserAddressRequest request) {
        List<UserAddress> existing = addressRepository.findByUserIdOrderByIsDefaultDesc(userId);

        if (existing.size() >= MAX_ADDRESSES) {
            throw new AppException("Tối đa " + MAX_ADDRESSES + " địa chỉ", HttpStatus.BAD_REQUEST);
        }

        // If this is the first address or marked as default, handle default flag
        boolean setDefault = existing.isEmpty() || Boolean.TRUE.equals(request.getIsDefault());

        if (setDefault) {
            clearDefaultFlag(userId);
        }

        UserAddress address = UserAddress.builder()
                .userId(userId)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .street(request.getStreet())
                .district(request.getDistrict())
                .province(request.getProvince())
                .isDefault(setDefault)
                .build();

        return toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public UserAddressResponse updateAddress(UUID userId, UUID addressId, UserAddressRequest request) {
        UserAddress address = findByIdAndUserId(addressId, userId);

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());

        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.getIsDefault()) {
            clearDefaultFlag(userId);
            address.setIsDefault(true);
        }

        return toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        UserAddress address = findByIdAndUserId(addressId, userId);

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        // If deleted the default, promote the first remaining address
        if (wasDefault) {
            List<UserAddress> remaining = addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsDefault(true);
                addressRepository.save(remaining.get(0));
            }
        }
    }

    @Override
    @Transactional
    public UserAddressResponse setDefault(UUID userId, UUID addressId) {
        UserAddress address = findByIdAndUserId(addressId, userId);

        clearDefaultFlag(userId);
        address.setIsDefault(true);

        return toResponse(addressRepository.save(address));
    }

    // ─── Helpers ───

    private UserAddress findByIdAndUserId(UUID addressId, UUID userId) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));
        if (!address.getUserId().equals(userId)) {
            throw new AppException("Bạn không có quyền truy cập địa chỉ này", HttpStatus.FORBIDDEN);
        }
        return address;
    }

    private void clearDefaultFlag(UUID userId) {
        addressRepository.clearDefaultByUserId(userId);
    }

    private UserAddressResponse toResponse(UserAddress address) {
        return UserAddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .street(address.getStreet())
                .district(address.getDistrict())
                .province(address.getProvince())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
