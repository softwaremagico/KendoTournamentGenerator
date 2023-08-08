package com.softwaremagico.kt.core.providers;

/*-
 * #%L
 * Kendo Tournament Manager (Core)
 * %%
 * Copyright (C) 2021 - 2023 Softwaremagico
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * #L%
 */

import com.softwaremagico.kt.persistence.entities.Group;
import com.softwaremagico.kt.persistence.entities.GroupLink;
import com.softwaremagico.kt.persistence.entities.Tournament;
import com.softwaremagico.kt.persistence.entities.TournamentExtraProperty;
import com.softwaremagico.kt.persistence.repositories.GroupLinkRepository;
import com.softwaremagico.kt.persistence.values.TournamentExtraPropertyKey;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class GroupLinkProvider extends CrudProvider<GroupLink, Integer, GroupLinkRepository> {

    private final TournamentExtraPropertyProvider tournamentExtraPropertyProvider;
    private final GroupProvider groupProvider;

    public GroupLinkProvider(GroupLinkRepository groupLinkRepository, TournamentExtraPropertyProvider tournamentExtraPropertyProvider,
                             GroupProvider groupProvider) {
        super(groupLinkRepository);
        this.tournamentExtraPropertyProvider = tournamentExtraPropertyProvider;
        this.groupProvider = groupProvider;
    }

    public List<GroupLink> generateLinks(Tournament tournament) {
        final TournamentExtraProperty numberOfWinners = tournamentExtraPropertyProvider.getByTournamentAndProperty(
                tournament, TournamentExtraPropertyKey.NUMBER_OF_WINNERS);
        int tournamentWinners;
        try {
            tournamentWinners = Integer.parseInt(numberOfWinners.getPropertyValue());
        } catch (Exception e) {
            tournamentWinners = 1;
        }
        final List<Group> groups = groupProvider.getGroups(tournament).stream().sorted(Comparator.comparing(Group::getLevel)
                .thenComparing(Group::getIndex)).toList();
        return generateLinks(groups, tournamentWinners, groups.stream().max(Comparator.comparing(Group::getLevel)).orElse(new Group()).getLevel());
    }

    public List<GroupLink> generateLinks(List<Group> groups, int tournamentWinners, int tournamentLevels) {
        final List<GroupLink> groupLinks = new ArrayList<>();
        groups.forEach(group -> {
            if (group.getLevel() < tournamentLevels) {
                final int numberOfWinners = getNumberOfTotalTeamsPassNextRound(group, tournamentWinners);
                for (int winner = 0; winner < numberOfWinners; winner++) {
                    final GroupLink groupLink = new GroupLink();
                    groupLink.setSource(group);
                    final Group destination = getDestination(group, numberOfWinners, winner, groups);
                    if (destination != null) {
                        groupLink.setDestination(destination);
                        groupLinks.add(groupLink);
                    }
                    groupLink.setWinner(winner);
                }
            }
        });
        return groupLinks.stream().sorted(Comparator.<GroupLink, Integer>comparing(o -> o.getSource().getLevel())
                .thenComparing(o -> o.getSource().getIndex()).thenComparing(GroupLink::getWinner)).toList();
    }

    private int getNumberOfTotalTeamsPassNextRound(Group group, int tournamentWinners) {
        if (group.getLevel() == 0) {
            return tournamentWinners;
        }
        return 1;
    }

    public Group getDestination(Group sourceGroup, int numberOfWinners, int winnerOrder, List<Group> groups) {
        final List<Group> currentLevelGroups = groups.stream().filter(group -> Objects.equals(group.getLevel(), sourceGroup.getLevel())).toList();
        final List<Group> nextLevelGroups = groups.stream().filter(group -> Objects.equals(group.getLevel(), sourceGroup.getLevel() + 1)).toList();
        try {
            return nextLevelGroups.get(obtainPositionOfWinner(sourceGroup.getIndex(), currentLevelGroups.size(), numberOfWinners, winnerOrder,
                    sourceGroup.getLevel()));
        } catch (IndexOutOfBoundsException e) {
            return null;
        }
    }

    private int obtainPositionOfWinner(int sourceGroupLevelIndex, int sourceGroupLevelSize, int numberOfWinners, int winnerOrder,
                                       int sourceLevel) {
        if (winnerOrder == 0) {
            if (sourceLevel > 0 || numberOfWinners == 1) {
                return sourceGroupLevelIndex / 2;
            } else {
                return sourceGroupLevelIndex;
            }
        } else if (winnerOrder == 1) {
            if (sourceLevel > 0) {
                //+1 for rounding, -1 as list starts in 0.
                return (sourceGroupLevelSize - sourceGroupLevelIndex + 1) / 2 - 1;
            } else {
                return (sourceGroupLevelSize - sourceGroupLevelIndex - 1);
            }
        } else {
            return -1;
        }
    }
}
