package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.CustomerReturn;
import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerReturnRepository extends JpaRepository<CustomerReturn, Long> {
    Optional<CustomerReturn> findByReturnNo(String returnNo);
    List<CustomerReturn> findByStatus(DocumentStatus status);
    List<CustomerReturn> findByCustomer(Profile customer);
}
