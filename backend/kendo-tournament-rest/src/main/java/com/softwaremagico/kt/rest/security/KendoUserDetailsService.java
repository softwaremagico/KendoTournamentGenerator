package com.softwaremagico.kt.rest.security;

/*-
 * #%L
 * Kendo Tournament Manager (Rest)
 * %%
 * Copyright (C) 2021 - 2023 Softwaremagico
 * %%
 * This software is designed by Jorge Hortelano Otero. Jorge Hortelano Otero
 * <softwaremagico@gmail.com> Valencia (Spain).
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; If not, see <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */

import com.softwaremagico.kt.core.providers.AuthenticatedUserProvider;
import com.softwaremagico.kt.persistence.entities.AuthenticatedUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Component
public class KendoUserDetailsService implements UserDetailsService {

    private final AuthenticatedUserProvider authenticatedUserProvider;

    public KendoUserDetailsService(AuthenticatedUserProvider authenticatedUserProvider) {
        this.authenticatedUserProvider = authenticatedUserProvider;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        final AuthenticatedUser authenticatedUser = authenticatedUserProvider.findByUsername(username).orElseThrow(() ->
                new UsernameNotFoundException(String.format("User '%s' not found!", username)));

        return new UserDetails() {
            @Override
            public Collection<? extends GrantedAuthority> getAuthorities() {
                return null;
            }

            @Override
            public String getPassword() {
                return authenticatedUser.getPassword();
            }

            @Override
            public String getUsername() {
                return authenticatedUser.getUsername();
            }

            @Override
            public boolean isAccountNonExpired() {
                return authenticatedUser.isAccountNonExpired();
            }

            @Override
            public boolean isAccountNonLocked() {
                return authenticatedUser.isAccountNonLocked();
            }

            @Override
            public boolean isCredentialsNonExpired() {
                return authenticatedUser.isCredentialsNonExpired();
            }

            @Override
            public boolean isEnabled() {
                return authenticatedUser.isEnabled();
            }

            public Integer getId() {
                return authenticatedUser.getId();
            }
        };
    }
}
