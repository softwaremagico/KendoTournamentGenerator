package com.softwaremagico.kt.pdf.controller;

/*-
 * #%L
 * Kendo Tournament Manager (PDF)
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

import com.softwaremagico.kt.core.controller.GroupController;
import com.softwaremagico.kt.core.controller.RoleController;
import com.softwaremagico.kt.core.controller.models.ClubDTO;
import com.softwaremagico.kt.core.controller.models.RoleDTO;
import com.softwaremagico.kt.core.controller.models.TournamentDTO;
import com.softwaremagico.kt.core.score.ScoreOfCompetitor;
import com.softwaremagico.kt.core.score.ScoreOfTeam;
import com.softwaremagico.kt.pdf.accreditations.TournamentAccreditationCards;
import com.softwaremagico.kt.pdf.lists.*;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Controller
public class PdfController {
    private final MessageSource messageSource;

    private final RoleController roleController;

    private final GroupController groupController;

    public PdfController(MessageSource messageSource, RoleController roleController, GroupController groupController) {
        this.messageSource = messageSource;
        this.roleController = roleController;
        this.groupController = groupController;
    }

    public CompetitorsScoreList generateCompetitorsScoreList(Locale locale, TournamentDTO tournament, List<ScoreOfCompetitor> competitorTopTen) {
        return new CompetitorsScoreList(messageSource, locale, tournament, competitorTopTen);
    }

    public TeamsScoreList generateTeamsScoreList(Locale locale, TournamentDTO tournament, List<ScoreOfTeam> teamsTopTen) {
        return new TeamsScoreList(messageSource, locale, tournament, teamsTopTen);
    }

    public RoleList generateClubList(Locale locale, TournamentDTO tournamentDTO) {
        final List<RoleDTO> roles = roleController.get(tournamentDTO);
        final Map<ClubDTO, List<RoleDTO>> rolesByClub = roles.stream().collect(
                Collectors.groupingBy(roleDTO -> roleDTO.getParticipant().getClub())
        );
        return new RoleList(messageSource, locale, tournamentDTO, rolesByClub);
    }

    public FightsList generateFightsList(Locale locale, TournamentDTO tournamentDTO) {
        return new FightsList(messageSource, locale, tournamentDTO, groupController.get(tournamentDTO));
    }

    public FightSummaryPDF generateFightsSummaryList(Locale locale, TournamentDTO tournamentDTO) {
        return new FightSummaryPDF(messageSource, locale, tournamentDTO, groupController.get(tournamentDTO), null);
    }

    public TournamentAccreditationCards generateTournamentAccreditations(Locale locale, TournamentDTO tournamentDTO) {
        final List<RoleDTO> roleDTOS = roleController.get(tournamentDTO);
        return new TournamentAccreditationCards(messageSource, locale, tournamentDTO, roleDTOS.stream()
                .collect(Collectors.toMap(RoleDTO::getParticipant, Function.identity())));
    }
}
