package com.softwaremagico.kt.core.controller;

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

import com.softwaremagico.kt.core.controller.models.TournamentDTO;
import com.softwaremagico.kt.core.controller.models.TournamentImageDTO;
import com.softwaremagico.kt.core.converters.TournamentConverter;
import com.softwaremagico.kt.core.converters.TournamentImageConverter;
import com.softwaremagico.kt.core.converters.models.TournamentConverterRequest;
import com.softwaremagico.kt.core.converters.models.TournamentImageConverterRequest;
import com.softwaremagico.kt.core.exceptions.DataInputException;
import com.softwaremagico.kt.core.exceptions.ParticipantNotFoundException;
import com.softwaremagico.kt.core.exceptions.TournamentNotFoundException;
import com.softwaremagico.kt.core.providers.TournamentImageProvider;
import com.softwaremagico.kt.core.providers.TournamentProvider;
import com.softwaremagico.kt.persistence.entities.Tournament;
import com.softwaremagico.kt.persistence.entities.TournamentImage;
import com.softwaremagico.kt.persistence.repositories.TournamentImageRepository;
import com.softwaremagico.kt.persistence.values.TournamentImageType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
public class TournamentImageController extends BasicInsertableController<TournamentImage, TournamentImageDTO, TournamentImageRepository,
        TournamentImageProvider, TournamentImageConverterRequest, TournamentImageConverter> {
    private final TournamentConverter tournamentConverter;
    private final TournamentProvider tournamentProvider;


    @Autowired
    public TournamentImageController(TournamentImageProvider provider, TournamentImageConverter converter,
                                     TournamentConverter tournamentConverter, TournamentProvider tournamentProvider) {
        super(provider, converter);
        this.tournamentConverter = tournamentConverter;
        this.tournamentProvider = tournamentProvider;
    }

    @Override
    protected TournamentImageConverterRequest createConverterRequest(TournamentImage participantImage) {
        return new TournamentImageConverterRequest(participantImage);
    }

    public int deleteByTournamentId(Integer tournamentId, TournamentImageType type) {
        final Tournament tournament = tournamentProvider.get(tournamentId)
                .orElseThrow(() -> new ParticipantNotFoundException(getClass(), "No tournaments found with id '" + tournamentId + "'."));
        return provider.delete(tournament, type);
    }

    public TournamentImageDTO get(Integer tournamentId, TournamentImageType type) {
        final Tournament tournament = tournamentProvider.get(tournamentId)
                .orElseThrow(() -> new ParticipantNotFoundException(getClass(), "No tournament found with id '" + tournamentId + "'."));
        return converter.convert(new TournamentImageConverterRequest(provider.get(tournament, type).orElse(null)));
    }

    public TournamentImageDTO get(TournamentDTO tournamentDTO, TournamentImageType type) {
        final Tournament tournament = tournamentConverter.reverse(tournamentDTO);
        return converter.convert(new TournamentImageConverterRequest(provider.get(tournament, type).orElse(null)));
    }

    public TournamentImageDTO add(MultipartFile file, Integer tournamentId, TournamentImageType type, String username) {
        final TournamentDTO tournamentDTO = tournamentConverter.convert(new TournamentConverterRequest(tournamentProvider.get(tournamentId)
                .orElseThrow(() -> new TournamentNotFoundException(getClass(), "No tournament found with id '" + tournamentId + "'."))));
        return add(file, tournamentDTO, type, username);
    }

    public TournamentImageDTO add(MultipartFile file, TournamentDTO tournamentDTO, TournamentImageType type, String username) throws DataInputException {
        try {
            delete(tournamentDTO, type);
            final TournamentImage tournamentImage = new TournamentImage();
            tournamentImage.setTournament(tournamentConverter.reverse(tournamentDTO));
            tournamentImage.setData(file.getBytes());
            tournamentImage.setCreatedBy(username);
            tournamentImage.setImageType(type);
            tournamentProvider.save(tournamentConverter.reverse(tournamentDTO));
            return converter.convert(new TournamentImageConverterRequest(provider.save(tournamentImage)));
        } catch (IOException e) {
            throw new DataInputException(this.getClass(), "File creation failed.");
        }
    }

    public TournamentImageDTO add(TournamentImageDTO tournamentImageDTO, String username) throws DataInputException {
        delete(tournamentImageDTO.getTournament(), tournamentImageDTO.getImageType());
        tournamentImageDTO.setCreatedBy(username);
        final Tournament tournament = tournamentConverter.reverse(tournamentImageDTO.getTournament());
        tournamentProvider.save(tournament);
        return converter.convert(new TournamentImageConverterRequest(provider.save(converter.reverse(tournamentImageDTO))));
    }

    public int delete(TournamentDTO tournamentDTO, TournamentImageType type) {
        final Tournament tournament = tournamentConverter.reverse(tournamentDTO);
        tournamentProvider.save(tournament);
        return provider.delete(tournament, type);
    }
}