package com.capnong.service;

import com.capnong.dto.response.ProvinceResponse;
import com.capnong.dto.response.WardResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service quản lý danh mục địa chỉ Việt Nam (Tỉnh/TP → Xã/Phường).
 * Dữ liệu được tải từ provinces.open-api.vn (chuẩn 2025, đã bỏ cấp Huyện/Quận)
 * và cache trong bộ nhớ để phục vụ select box cho FE.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {

    private static final String PROVINCES_API = "https://provinces.open-api.vn/api/v2/";

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    // Cache: provinceCode → ProvinceResponse (with nested wards)
    private final Map<Integer, ProvinceResponse> provinceCache = new ConcurrentHashMap<>();
    // Quick lookup: wardCode → WardResponse
    private final Map<Integer, WardResponse> wardLookup = new ConcurrentHashMap<>();
    // Quick lookup: wardCode → provinceCode (for reverse mapping)
    private final Map<Integer, Integer> wardToProvinceMap = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        loadProvinces();
    }

    /**
     * Tải toàn bộ danh sách tỉnh/TP kèm xã/phường từ API bên ngoài.
     * Gọi 1 lần khi khởi động, kết quả cache trong RAM.
     */
    private void loadProvinces() {
        try {
            WebClient client = webClientBuilder
                    .baseUrl(PROVINCES_API)
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(10 * 1024 * 1024)) // 10MB buffer cho dữ liệu tỉnh/xã
                    .build();
            String json = client.get()
                    .uri("?depth=2")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (json == null || json.isBlank()) {
                log.warn("Không thể tải dữ liệu từ provinces API, sẽ trả về danh sách rỗng");
                return;
            }

            List<JsonNode> provinces = objectMapper.readValue(json, new TypeReference<>() {});

            for (JsonNode pNode : provinces) {
                int pCode = pNode.get("code").asInt();
                String pName = pNode.get("name").asText();
                String pCodename = pNode.has("codename") ? pNode.get("codename").asText() : "";
                String pDivisionType = pNode.has("division_type") ? pNode.get("division_type").asText() : "";

                List<WardResponse> wards = new ArrayList<>();
                if (pNode.has("wards") && pNode.get("wards").isArray()) {
                    for (JsonNode wNode : pNode.get("wards")) {
                        int wCode = wNode.get("code").asInt();
                        String wName = wNode.get("name").asText();
                        String wCodename = wNode.has("codename") ? wNode.get("codename").asText() : "";
                        String wDivisionType = wNode.has("division_type") ? wNode.get("division_type").asText() : "";

                        WardResponse ward = WardResponse.builder()
                                .code(wCode)
                                .name(wName)
                                .codename(wCodename)
                                .divisionType(wDivisionType)
                                .build();
                        wards.add(ward);
                        wardLookup.put(wCode, ward);
                        wardToProvinceMap.put(wCode, pCode);
                    }
                }

                ProvinceResponse province = ProvinceResponse.builder()
                        .code(pCode)
                        .name(pName)
                        .codename(pCodename)
                        .divisionType(pDivisionType)
                        .wards(wards)
                        .build();

                provinceCache.put(pCode, province);
            }

            log.info("Đã tải {} tỉnh/TP với {} xã/phường", provinceCache.size(), wardLookup.size());

        } catch (Exception e) {
            log.error("Lỗi tải dữ liệu địa chỉ: {}", e.getMessage(), e);
        }
    }

    // ─── Public API ────────────────────────────────────────

    /**
     * Trả về danh sách tất cả tỉnh/TP (không kèm wards) cho select box.
     */
    public List<ProvinceResponse> getAllProvinces() {
        return provinceCache.values().stream()
                .map(p -> ProvinceResponse.builder()
                        .code(p.getCode())
                        .name(p.getName())
                        .codename(p.getCodename())
                        .divisionType(p.getDivisionType())
                        .wards(null) // không gửi wards ở danh sách tổng
                        .build())
                .sorted(Comparator.comparing(ProvinceResponse::getName))
                .collect(Collectors.toList());
    }

    /**
     * Trả về danh sách xã/phường của 1 tỉnh/TP cho select box bước 2.
     */
    public List<WardResponse> getWardsByProvince(Integer provinceCode) {
        ProvinceResponse province = provinceCache.get(provinceCode);
        if (province == null || province.getWards() == null) {
            return Collections.emptyList();
        }
        return province.getWards().stream()
                .sorted(Comparator.comparing(WardResponse::getName))
                .collect(Collectors.toList());
    }

    /**
     * Tra tên tỉnh/TP từ mã. Trả về mã nếu không tìm thấy.
     */
    public String getProvinceName(String provinceCode) {
        if (provinceCode == null || provinceCode.isBlank()) return "";
        try {
            int code = Integer.parseInt(provinceCode);
            ProvinceResponse p = provinceCache.get(code);
            return p != null ? p.getName() : provinceCode;
        } catch (NumberFormatException e) {
            return provinceCode;
        }
    }

    /**
     * Tra tên xã/phường từ mã. Trả về mã nếu không tìm thấy.
     */
    public String getWardName(String wardCode) {
        if (wardCode == null || wardCode.isBlank()) return "";
        try {
            int code = Integer.parseInt(wardCode);
            WardResponse w = wardLookup.get(code);
            return w != null ? w.getName() : wardCode;
        } catch (NumberFormatException e) {
            return wardCode;
        }
    }

    /**
     * Buộc tải lại dữ liệu (ví dụ: khi admin cần refresh).
     */
    public void reload() {
        provinceCache.clear();
        wardLookup.clear();
        wardToProvinceMap.clear();
        loadProvinces();
    }
}
