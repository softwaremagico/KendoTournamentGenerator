package com.softwaremagico.kt.core.providers;

/*-
 * #%L
 * Kendo Tournament Manager (Core)
 * %%
 * Copyright (C) 2021 - 2022 Softwaremagico
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

import com.softwaremagico.kt.persistence.entities.Group;
import com.softwaremagico.kt.persistence.entities.Tournament;
import com.softwaremagico.kt.persistence.repositories.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class GroupProvider {
    private final GroupRepository groupRepository;

    @Autowired
    public GroupProvider(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public List<Group> getGroups(Tournament tournament) {
        return groupRepository.findByTournament(tournament);
    }

    public List<Group> getGroups(Tournament tournament, Integer shiaijo) {
        return groupRepository.findByTournamentAndShiaijo(tournament, shiaijo);
    }

    public void addGroup(Tournament tournament, Group group) {
        group.setTournament(tournament);
        groupRepository.save(group);
    }

    public void delete(Tournament tournament) {
        groupRepository.deleteByTournament(tournament);
    }

    public void delete(Group group) {
        groupRepository.delete(group);
    }

    public void delete(Tournament tournament, Group group) {
        if (Objects.equals(group.getTournament(), tournament)) {
            groupRepository.delete(group);
        }
    }

    public void delete(Tournament tournament, Integer level) {
        groupRepository.deleteByTournamentAndLevel(tournament, level);
    }

    public Group save(Group group) {
        return groupRepository.save(group);
    }
}
