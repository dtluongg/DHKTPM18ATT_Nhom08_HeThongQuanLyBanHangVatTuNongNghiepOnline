package com.example.bvtv_www.enums;

/**
 * Enum cho trạng thái của các phiếu kho
 * Áp dụng cho: PNH, PTH, PTHNCC, PKK, PCK, PCD
 */
public enum DocumentStatus {
    DRAFT,        // Nháp - chưa hoàn thành
    PENDING,      // Chờ duyệt
    CONFIRMED,    // Đã xác nhận (cho PNH)
    APPROVED,     // Đã duyệt (cho PTH, PTHNCC, PKK, PCD)
    IN_TRANSIT,   // Đang vận chuyển (cho PCK)
    COMPLETED,    // Hoàn thành
    REJECTED,     // Từ chối
    CANCELLED     // Hủy bỏ
}
