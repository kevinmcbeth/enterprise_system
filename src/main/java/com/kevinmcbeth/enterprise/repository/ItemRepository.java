package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}
