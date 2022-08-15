package com.softwaremagico.kt.pdf.lists;

/*
 * #%L
 * KendoTournamentGenerator
 * %%
 * Copyright (C) 2008 - 2012 Softwaremagico
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

import com.softwaremagico.kt.core.controller.models.FightDTO;
import com.softwaremagico.kt.core.controller.models.GroupDTO;
import com.softwaremagico.kt.core.controller.models.TournamentDTO;
import org.springframework.context.MessageSource;

import java.util.List;
import java.util.Locale;

/**
 * Creates a Fight Sheet to be used by hand. All fights are empty.
 */
public class EmptyFightsListPDF extends FightSummaryPDF {

    protected EmptyFightsListPDF(MessageSource messageSource, Locale locale, TournamentDTO tournament, List<GroupDTO> groups, Integer shiaijo) {
        super(messageSource, locale, tournament, groups, shiaijo);
    }

    @Override
    protected String getDrawFight(FightDTO fightDTO, int duel) {
        return "";
    }

    @Override
    protected String getFaults(FightDTO fightDTO, int duel, boolean leftTeam) {
        return "";
    }

    @Override
    protected String getScore(FightDTO fightDTO, int duel, int score, boolean leftTeam) {
        return "";
    }
}
