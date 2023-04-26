package com.softwaremagico.kt.persistence.entities;

/*
 * #%L
 * KendoTournamentManager
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

import com.softwaremagico.kt.persistence.encryption.BooleanCryptoConverter;
import com.softwaremagico.kt.persistence.encryption.StringCryptoConverter;
import com.softwaremagico.kt.utils.IParticipantName;
import com.softwaremagico.kt.utils.NameUtils;
import com.softwaremagico.kt.utils.StringUtils;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.text.Collator;
import java.util.Locale;

/**
 * A registered person is any person that is in a tournament. Can be a
 * competitor, referee, public, etc.
 */
@Entity
@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@Table(name = "participants",
        indexes = {
                @Index(name = "ind_club", columnList = "club"),
        })
public class Participant extends Element implements Comparable<Participant>, IParticipantName {

    @Column(name = "id_card", unique = true)
    @Convert(converter = StringCryptoConverter.class)
    private String idCard;

    @Column(name = "name", nullable = false)
    @Convert(converter = StringCryptoConverter.class)
    private String name = "";

    @Column(name = "lastname", nullable = false)
    @Convert(converter = StringCryptoConverter.class)
    private String lastname = "";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "club", nullable = false)
    private Club club;

    @Column(name = "has_avatar")
    @Convert(converter = BooleanCryptoConverter.class)
    private Boolean hasAvatar = false;

    public Participant() {
        super();
    }


    public Participant(String idCard, String name, String lastname, Club club) {
        setName(name);
        setLastname(lastname);
        setIdCard(idCard);
        setClub(club);
    }

    public void setIdCard(String value) {
        idCard = value.replaceAll("-", "").replaceAll(" ", "").trim().toUpperCase();
    }

    public String getIdCard() {
        return idCard;
    }

    public boolean isValid() {
        return getName().length() > 0 && getIdCard() != null && getIdCard().length() > 0;
    }

    public void setName(String value) {
        name = StringUtils.setCase(value);
    }


    public void setLastname(String value) {
        lastname = StringUtils.setCase(value);
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getLastname() {
        return lastname;
    }


    public void setClub(Club club) {
        this.club = club;
    }

    public Club getClub() {
        return club;
    }

    public Boolean getHasAvatar() {
        return hasAvatar;
    }

    public void setHasAvatar(Boolean hasAvatar) {
        this.hasAvatar = hasAvatar;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }
        if (!(object instanceof Participant)) {
            return false;
        }
        final Participant otherParticipant = (Participant) object;
        return this.idCard.equals(otherParticipant.idCard);
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 31 * hash + (this.idCard != null ? this.idCard.hashCode() : 0);
        return hash;
    }

    /**
     * Compare participants avoiding accent problems.
     *
     * @param otherParticipant
     * @return
     */
    @Override
    public int compareTo(Participant otherParticipant) {
        final String string1 = this.lastname + " " + this.name;
        final String string2 = otherParticipant.lastname + " " + otherParticipant.name;

        // Ignore accents
        final Collator collator = Collator.getInstance(new Locale("es"));
        collator.setStrength(Collator.SECONDARY);
        collator.setDecomposition(Collator.FULL_DECOMPOSITION);

        return collator.compare(string1, string2);
    }

    @Override
    public String toString() {
        return NameUtils.getLastnameName(getLastname(), getName());
    }
}
