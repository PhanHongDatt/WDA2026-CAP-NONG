package com.capnong.mapper;

import com.capnong.dto.response.HtxJoinRequestResponse;
import com.capnong.dto.response.HtxResponse;
import com.capnong.model.Htx;
import com.capnong.model.HtxJoinRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HtxMapper {

    @Mapping(target = "status", expression = "java(htx.getStatus().name())")
    @Mapping(target = "managerId", source = "manager.id")
    @Mapping(target = "managerUsername", source = "manager.username")
    @Mapping(target = "managerFullName", source = "manager.fullName")
    @Mapping(target = "createdByUserId", source = "createdByUser.id")
    @Mapping(target = "createdByUsername", source = "createdByUser.username")
    HtxResponse toHtxResponse(Htx htx);

    @Mapping(target = "htxId", source = "htx.id")
    @Mapping(target = "htxName", source = "htx.name")
    @Mapping(target = "farmerId", source = "farmer.id")
    @Mapping(target = "farmerUsername", source = "farmer.username")
    @Mapping(target = "farmerFullName", source = "farmer.fullName")
    @Mapping(target = "status", expression = "java(joinRequest.getStatus().name())")
    HtxJoinRequestResponse toJoinRequestResponse(HtxJoinRequest joinRequest);
}
