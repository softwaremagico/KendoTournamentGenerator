package com.softwaremagico.kt.core.tournaments;

/*-
 * #%L
 * Kendo Tournament Manager (Core)
 * %%
 * Copyright (C) 2021 - 2024 Softwaremagico
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

import com.softwaremagico.kt.core.exceptions.CustomTournamentFightsException;
import com.softwaremagico.kt.core.exceptions.InvalidChallengeDistanceException;
import com.softwaremagico.kt.core.exceptions.InvalidFightException;
import com.softwaremagico.kt.core.managers.TeamsOrder;
import com.softwaremagico.kt.core.providers.FightProvider;
import com.softwaremagico.kt.core.providers.GroupProvider;
import com.softwaremagico.kt.core.providers.RankingProvider;
import com.softwaremagico.kt.core.providers.TeamProvider;
import com.softwaremagico.kt.core.providers.TournamentExtraPropertyProvider;
import com.softwaremagico.kt.logger.KendoTournamentLogger;
import com.softwaremagico.kt.persistence.entities.Element;
import com.softwaremagico.kt.persistence.entities.Fight;
import com.softwaremagico.kt.persistence.entities.Group;
import com.softwaremagico.kt.persistence.entities.Team;
import com.softwaremagico.kt.persistence.entities.Tournament;
import com.softwaremagico.kt.persistence.entities.TournamentExtraProperty;
import com.softwaremagico.kt.persistence.values.TournamentExtraPropertyKey;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class SenbatsuTournamentHandler extends LeagueHandler {
    public static final int DEFAULT_CHALLENGE_DISTANCE = 3;
    private final FightProvider fightProvider;
    private final TournamentExtraPropertyProvider tournamentExtraPropertyProvider;

    public SenbatsuTournamentHandler(GroupProvider groupProvider, TeamProvider teamProvider,
                                     RankingProvider rankingProvider, TournamentExtraPropertyProvider tournamentExtraPropertyProvider,
                                     FightProvider fightProvider) {
        super(groupProvider, teamProvider, rankingProvider, tournamentExtraPropertyProvider);
        this.fightProvider = fightProvider;
        this.tournamentExtraPropertyProvider = tournamentExtraPropertyProvider;
    }

    @Override
    public List<Fight> createFights(Tournament tournament, TeamsOrder teamsOrder, Integer level, String createdBy) {
        throw new CustomTournamentFightsException(this.getClass(), "This league cannot generate fights.");
    }


    public void checkFight(Fight fight) {
        //Check if the distance is correct.
        final List<Team> teams = getNextTeamsOrderedByRanks(fight.getTournament(), fight);
        final int challengeDistance = getChallengeDistance(fight.getTournament());
        //Alwats starts the first team.
        if (!Objects.equals(fight.getTeam1(), teams.get(0))) {
            throw new InvalidFightException(this.getClass(), "Challenge must be always generated by the first team!");
        }
        if (!teams.contains(fight.getTeam1()) || !teams.contains(fight.getTeam2())) {
            throw new InvalidFightException(this.getClass(), "Fight has assigned disqualified teams!");
        }
        if (Math.abs(teams.indexOf(fight.getTeam2()) - teams.indexOf(fight.getTeam1())) > challengeDistance) {
            throw new InvalidChallengeDistanceException(this.getClass(), "Team '" + fight.getTeam1() + "' and team '" + fight.getTeam2()
                    + "' have too much challenge distance. Defined challenge distance is '" + challengeDistance + "'.");
        }
        if (fight.getLevel() != 0 || fight.getShiaijo() != 0) {
            throw new InvalidFightException(this.getClass(), "Fight has invalid level or shiaijo!");
        }
    }


    public List<Team> getNextTeamsOrderedByRanks(Tournament tournament, Fight ignoredFight) {
        final Group group = getFirstGroup(tournament);
        final List<Team> tournamentTeams = new ArrayList<>(group.getTeams());
        //Reorder the teams.
        final List<Fight> fights = group.getFights();
        for (Fight checkedFight : fights) {
            if (checkedFight.isOver() && !Objects.equals(checkedFight, ignoredFight)) {
                if (checkedFight.getWinner() == null || !Objects.equals(checkedFight.getWinner(), checkedFight.getTeam1())) {
                    tournamentTeams.remove(checkedFight.getTeam1());
                } else {
                    //Wins the challenger. Exchange position with the challenged.
                    Collections.swap(tournamentTeams, tournamentTeams.indexOf(checkedFight.getTeam1()), tournamentTeams.indexOf(checkedFight.getTeam2()));
                    //And remove the challenged.
                    tournamentTeams.remove(checkedFight.getTeam2());
                }
            }
        }
        return tournamentTeams;
    }


    public int getChallengeDistance(Tournament tournament) {
        final TournamentExtraProperty extraProperty = tournamentExtraPropertyProvider.getByTournamentAndProperty(tournament,
                TournamentExtraPropertyKey.SENBATSU_CHALLENGE_DISTANCE, DEFAULT_CHALLENGE_DISTANCE);
        try {
            return Integer.parseInt(extraProperty.getPropertyValue());
        } catch (Exception e) {
            KendoTournamentLogger.errorMessage(this.getClass(), e);
        }
        return DEFAULT_CHALLENGE_DISTANCE;
    }
}
