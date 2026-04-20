package com.capnong.service;

import com.capnong.dto.request.UserAddressRequest;
import com.capnong.dto.response.UserAddressResponse;

import java.util.List;
import java.util.UUID;

public interface UserAddressService {
    List<UserAddressResponse> getAddresses(UUID userId);
    UserAddressResponse createAddress(UUID userId, UserAddressRequest request);
    UserAddressResponse updateAddress(UUID userId, UUID addressId, UserAddressRequest request);
    void deleteAddress(UUID userId, UUID addressId);
    UserAddressResponse setDefault(UUID userId, UUID addressId);
}
