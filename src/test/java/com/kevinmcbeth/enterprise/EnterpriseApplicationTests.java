package com.kevinmcbeth.enterprise;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/enterprise_test",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class EnterpriseApplicationTests {

    @Test
    void contextLoads() {
    }
}
