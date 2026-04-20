const API_URL = 'http://localhost:8080/api';

async function fetchApi(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${endpoint}`, config);
    const data = await res.json().catch(() => null);
    
    return {
        status: res.status,
        data: data
    };
}

// Bắt đầu test
async function testBundleFlow() {
    console.log("=== BẮT ĐẦU CHẠY API TESTS (BUNDLE) ===");
    let state = {};

    console.log("\n--- PHASE 1: LOGIN ---");
    
    // Login HTX Manager
    let res = await fetchApi('/auth/login', 'POST', { identifier: "htx_manager_1", password: "password" });
    if (res.status === 200) {
        state.managerToken = res.data.data.access_token;
        console.log("✅ [Manager 1] Login thành công");
    } else {
        console.log("❌ [Manager 1] Login fail:", res.status, res.data);
        return;
    }

    // Login Manager 2
    res = await fetchApi('/auth/login', 'POST', { identifier: "htx_manager_2", password: "password" });
    state.manager2Token = res.data?.data?.access_token;

    // Login Farmer 1
    res = await fetchApi('/auth/login', 'POST', { identifier: "farmer_lehoa", password: "password" });
    state.farmerToken = res.data?.data?.access_token;

    // Login Farmer 2
    res = await fetchApi('/auth/login', 'POST', { identifier: "farmer_trannong", password: "password" });
    state.farmer2Token = res.data?.data?.access_token;

    // Login Buyer
    res = await fetchApi('/auth/login', 'POST', { identifier: "buyer_minh", password: "password" });
    state.buyerToken = res.data?.data?.access_token;

    console.log("\n--- PHASE 2: HTX MANAGER ---");
    
    // 1. Tạo Bundle
    const payload = {
        product_category: "FRUIT",
        product_name: "Xoài Cát Hòa Lộc - Gom sỉ " + Date.now(),
        unit_code: "KG",
        target_quantity: 500,
        price_per_unit: 65000,
        deadline: "2026-05-15",
        description: "Gom xoài loại 1",
        min_pledge_quantity: 50
    };
    res = await fetchApi('/v1/cooperatives/bundles', 'POST', payload, state.managerToken);
    if (res.status === 201) {
        state.bundleId = res.data.data.id;
        console.log(`✅ [Tạo Bundle] OK, ID: ${state.bundleId}`);
    } else {
        console.log("❌ [Tạo Bundle] Fail:", res.status, res.data);
        return;
    }

    // 2. Không auth / Public GET
    res = await fetchApi('/v1/cooperatives/bundles', 'GET');
    if (res.status === 200 && res.data.data.find(b => b.id === state.bundleId)) {
        console.log(`✅ [GET Bundles (Public)] OK, tìm thấy Bundle.`);
    } else {
        console.log(`❌ [GET Bundles (Public)] Fail:`, res.status);
    }

    // 3. Manager khác thử cancel
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/cancel`, 'PUT', null, state.manager2Token);
    if (res.status === 403 || res.data?.message?.includes('không phải quản lý')) {
        console.log(`✅ [Cross-HTX Cancel] Chặn thành công (403/Error)`);
    } else {
        console.log(`❌ [Cross-HTX Cancel] Lỗi hổng!`, res.status, res.data);
    }

    // 4. Confirm bundle rỗng
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/confirm`, 'PUT', null, state.managerToken);
    if (res.status === 400 || res.status === 403) {
        console.log(`✅ [Confirm rỗng] Bị chặn đúng (${res.status})`);
    } else {
        console.log(`❌ [Confirm rỗng] Không chặn!`, res.status, res.data);
    }

    console.log("\n--- PHASE 3: FARMER PLEDGE ---");
    
    // 5. Farmer 1 pledge 200kg
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/pledges`, 'POST', { quantity: 200, note: "Pha 1" }, state.farmerToken);
    if (res.status === 201) {
        state.pledgeId = res.data.data.id;
        console.log(`✅ [Pledge 1 (200kg)] OK, ID: ${state.pledgeId}`);
    } else {
        console.log(`❌ [Pledge 1 (200kg)] Fail:`, res.status, res.data);
    }

    // 6. Farmer 1 duplicate pledge
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/pledges`, 'POST', { quantity: 100 }, state.farmerToken);
    if (res.status === 409) {
        console.log(`✅ [Duplicate Pledge] Chặn thành công (409)`);
    } else {
        console.log(`❌ [Duplicate Pledge] Lỗi!`, res.status, res.data);
    }

    // 7. Farmer 2 pledge dưới min (min 50)
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/pledges`, 'POST', { quantity: 10 }, state.farmer2Token);
    if (res.status === 400 && res.data?.message?.includes('tối thiểu')) {
        console.log(`✅ [Pledge < Min] Chặn thành công (400)`);
    } else {
        console.log(`❌ [Pledge < Min] Lỗi!`, res.status, res.data);
    }

    // 8. Farmer 2 pledge vượt capacity (còn 300, pledge 400)
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/pledges`, 'POST', { quantity: 400 }, state.farmer2Token);
    if (res.status === 400 && res.data?.message?.includes('vượt quá')) {
        console.log(`✅ [Pledge > Capacity] Chặn thành công (400)`);
    } else {
        console.log(`❌ [Pledge > Capacity] Lỗi!`, res.status, res.data);
    }

    // 9. Buyer thử pledge
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/pledges`, 'POST', { quantity: 100 }, state.buyerToken);
    if (res.status === 403) {
        console.log(`✅ [Buyer Pledge] Bị chặn đúng (403)`);
    } else {
        console.log(`❌ [Buyer Pledge] Lỗi hổng!`, res.status, res.data);
    }

    console.log("\n--- PHASE 4: RÚT PLEDGE ---");

    // 10. Farmer 2 thử rút của Farmer 1
    res = await fetchApi(`/v1/cooperatives/pledges/${state.pledgeId}`, 'DELETE', null, state.farmer2Token);
    if (res.status === 403 || res.data?.message?.includes('quyền')) {
        console.log(`✅ [Cross-Farmer Withdraw] Bị chặn đúng (403)`);
    } else {
        console.log(`❌ [Cross-Farmer Withdraw] Lỗi hổng!`, res.status, res.data);
    }

    // 11. Farmer 1 rút pledge
    res = await fetchApi(`/v1/cooperatives/pledges/${state.pledgeId}`, 'DELETE', null, state.farmerToken);
    if (res.status === 200) {
        console.log(`✅ [Withdraw Pledge] OK`);
    } else {
        console.log(`❌ [Withdraw Pledge] Fail:`, res.status, res.data);
    }

    // 12. Check bundle lại (phải là 0)
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}`, 'GET');
    if (res.data?.data?.current_pledged_quantity === 0) {
        console.log(`✅ [Withdraw Rollback] Bundle current_pledged_quantity = 0 hợp lý.`);
    }

    console.log("\n--- PHASE 5: HOÀN THÀNH PLEDGE & CONFIRM ---");

    // Lần này đủ
    await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/pledges`, 'POST', { quantity: 200 }, state.farmerToken);
    await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/pledges`, 'POST', { quantity: 300 }, state.farmer2Token);
    
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}`, 'GET');
    console.log(`ℹ️ [Bundle Status sau pledge đủ]:`, res.data?.data?.status, `(Pledged: ${res.data?.data?.current_pledged_quantity})`);

    // Confirm
    res = await fetchApi(`/v1/cooperatives/bundles/${state.bundleId}/confirm`, 'PUT', null, state.managerToken);
    if (res.status === 200 && res.data.data.status === 'CONFIRMED') {
        console.log(`✅ [Confirm Bundle] OK`);
    } else {
        console.log(`❌ [Confirm Bundle] Fail:`, res.status, res.data);
    }

    console.log("\n=== HOÀN TẤT BÀI TEST ===");
}

testBundleFlow();
