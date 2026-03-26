package com.kevinmcbeth.enterprise.repository;

import com.kevinmcbeth.enterprise.entity.User;
import com.kevinmcbeth.enterprise.entity.User.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindByEmail() {
        User user = new User("test@example.com", "hashedpw", "Test User", Role.MEMBER);
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("test@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getDisplayName()).isEqualTo("Test User");
        assertThat(found.get().getRole()).isEqualTo(Role.MEMBER);
        assertThat(found.get().getCreatedAt()).isNotNull();
    }

    @Test
    void shouldReturnEmptyForUnknownEmail() {
        Optional<User> found = userRepository.findByEmail("unknown@example.com");
        assertThat(found).isEmpty();
    }

    @Test
    void shouldCheckExistsByEmail() {
        User user = new User("exists@example.com", "hashedpw", "Exists", Role.MEMBER);
        userRepository.save(user);

        assertThat(userRepository.existsByEmail("exists@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("nope@example.com")).isFalse();
    }
}
