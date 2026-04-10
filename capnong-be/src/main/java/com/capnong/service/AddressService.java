package com.capnong.service;

import com.capnong.dto.response.ProvinceResponse;
import com.capnong.dto.response.WardResponse;

import java.util.List;

public interface AddressService {
    List<ProvinceResponse> getAllProvinces();
    List<WardResponse> getWardsByProvince(Integer provinceCode);
    String getProvinceName(String provinceCode);
    String getWardName(String wardCode);
    void reload();
}
