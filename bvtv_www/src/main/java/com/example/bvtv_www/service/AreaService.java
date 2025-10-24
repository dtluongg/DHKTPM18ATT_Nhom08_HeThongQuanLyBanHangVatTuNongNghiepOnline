package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Area;
import com.example.bvtv_www.repository.AreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaService {
    private final AreaRepository areaRepository;

    public List<Area> findAll() {
        return areaRepository.findAll();
    }

    public Area findById(Long id) {
        return areaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Area not found"));
    }

    public Area create(Area area) {
        return areaRepository.save(area);
    }

    public Area update(Long id, Area area) {
        Area existing = findById(id);
        existing.setName(area.getName());
        return areaRepository.save(existing);
    }

    public void delete(Long id) {
        areaRepository.deleteById(id);
    }
}
