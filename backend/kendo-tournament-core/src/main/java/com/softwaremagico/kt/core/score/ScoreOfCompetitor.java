package com.softwaremagico.kt.core.score;

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


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.softwaremagico.kt.core.controller.models.FightDTO;
import com.softwaremagico.kt.core.controller.models.ParticipantDTO;
import com.softwaremagico.kt.utils.NameUtils;

import java.util.List;

public class ScoreOfCompetitor {

    private ParticipantDTO competitor;

    @JsonIgnore
    protected List<FightDTO> fights;
    private Integer wonDuels = null;
    private Integer drawDuels = null;
    private Integer hits = null;
    private Integer duelsDone = null;
    private Integer wonFights = null;
    private Integer drawFights = null;

    public ScoreOfCompetitor() {

    }

    public ScoreOfCompetitor(ParticipantDTO competitor, List<FightDTO> fights) {
        this.competitor = competitor;
        this.fights = fights;
        update();
    }

    public void update() {
        wonFights = null;
        drawFights = null;
        wonDuels = null;
        drawDuels = null;
        hits = null;
        setDuelsWon();
        setDuelsDraw();
        setDuelsDone();
        setFightsWon();
        setFightsDraw();
        setHits();
    }

    public ParticipantDTO getCompetitor() {
        return competitor;
    }

    public void setDuelsDone() {
        duelsDone = 0;
        fights.forEach(fight -> duelsDone += fight.getDuels(competitor).size());
    }

    public void setDuelsWon() {
        wonDuels = 0;
        fights.forEach(fight -> wonDuels += fight.getDuelsWon(competitor));
    }

    public void setFightsWon() {
        wonFights = 0;
        for (final FightDTO fight : fights) {
            if (fight.isWon(competitor)) {
                wonFights++;
            }
        }
    }

    public void setFightsDraw() {
        drawFights = 0;
        for (final FightDTO fight : fights) {
            if (fight.isOver()) {
                if (fight.getWinner() == null && (fight.getTeam1().isMember(competitor)
                        || fight.getTeam2().isMember(competitor))) {
                    drawFights++;
                }
            }
        }
    }

    public void setDuelsDraw() {
        drawDuels = 0;
        for (final FightDTO fight : fights) {
            if (fight.isOver()) {
                drawDuels += fight.getDrawDuels(competitor);
            }
        }
    }

    public void setHits() {
        hits = 0;
        for (final FightDTO fight : fights) {
            hits += fight.getScore(competitor);
        }
    }

    public Integer getWonDuels() {
        return wonDuels;
    }

    public Integer getDrawDuels() {
        return drawDuels;
    }

    public Integer getHits() {
        return hits;
    }

    public Integer getDuelsDone() {
        return duelsDone;
    }

    public Integer getWonFights() {
        return wonFights;
    }

    public Integer getDrawFights() {
        return drawFights;
    }

    @Override
    public String toString() {
        return NameUtils.getLastnameName(competitor) + " D:" + getWonDuels() + "/" + getDrawDuels() + ", H:" + getHits();
    }

}
