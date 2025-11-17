package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {
    List<Area> findByIsActive(Boolean isActive);
}
