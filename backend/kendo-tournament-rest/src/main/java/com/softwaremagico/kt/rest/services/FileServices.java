package com.softwaremagico.kt.rest.services;

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

import com.softwaremagico.kt.core.controller.ParticipantImageController;
import com.softwaremagico.kt.core.controller.TournamentImageController;
import com.softwaremagico.kt.core.controller.models.ParticipantImageDTO;
import com.softwaremagico.kt.core.controller.models.TournamentImageDTO;
import com.softwaremagico.kt.persistence.values.ImageCompression;
import com.softwaremagico.kt.persistence.values.TournamentImageType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/files")
public class FileServices {

    private final ParticipantImageController participantImageController;
    private final TournamentImageController tournamentImageController;

    @Autowired
    public FileServices(ParticipantImageController participantImageController, TournamentImageController tournamentImageController) {
        this.participantImageController = participantImageController;
        this.tournamentImageController = tournamentImageController;
    }

    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_EDITOR', 'ROLE_ADMIN')")
    @Operation(summary = "Uploads a photo to a participant profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping(value = "/participants/{participantId}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ParticipantImageDTO upload(@RequestParam("file") MultipartFile file,
                                      @PathVariable("participantId") int participantId,
                                      Authentication authentication, HttpServletRequest request) {
        return participantImageController.add(file, participantId, authentication.getName());
    }

    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_EDITOR', 'ROLE_ADMIN')")
    @Operation(summary = "Uploads a photo to a participant profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping(value = "/participants", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ParticipantImageDTO uploadParticipantPicture(@Parameter(description = "Participant picture object", required = true)
                                                        @RequestBody ParticipantImageDTO participantImageDTO,
                                                        Authentication authentication, HttpServletRequest request) {
        return participantImageController.add(participantImageDTO, authentication.getName());
    }

    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_EDITOR', 'ROLE_ADMIN')")
    @Operation(summary = "Gets an image from a participant", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping(value = "/participants/{participantId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ParticipantImageDTO getParticipantImage(@PathVariable("participantId") int participantId, HttpServletRequest request) {
        return participantImageController.getByParticipantId(participantId);
    }

    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_EDITOR', 'ROLE_ADMIN')")
    @Operation(summary = "Deletes the image from a participant", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping(value = "/participants/{participantId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public void deleteParticipantImage(@PathVariable("participantId") int participantId, HttpServletRequest request) {
        participantImageController.deleteByParticipantId(participantId);
    }

    @PreAuthorize("hasAnyRole('ROLE_EDITOR', 'ROLE_ADMIN')")
    @Operation(summary = "Uploads an image to a tournament", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping(value = "/tournaments", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public TournamentImageDTO upload(@Parameter(description = "Tournament Image Object", required = true)
                                     @RequestBody TournamentImageDTO tournamentImageDTO,
                                     Authentication authentication, HttpServletRequest request) {
        return tournamentImageController.add(tournamentImageDTO, authentication.getName());
    }

    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_EDITOR', 'ROLE_ADMIN')")
    @Operation(summary = "Uploads a photo to a tournament profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping(value = "/tournaments/{tournamentId}/type/{imageType}/compression/{imageCompression}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TournamentImageDTO uploadTournamentImage(@RequestParam("file") MultipartFile file,
                                                    @PathVariable("tournamentId") int tournamentId,
                                                    @PathVariable("imageType") TournamentImageType tournamentImageType,
                                                    @PathVariable("imageCompression") ImageCompression imageCompression,
                                                    Authentication authentication, HttpServletRequest request) {
        return tournamentImageController.add(file, tournamentId, tournamentImageType, imageCompression, authentication.getName());
    }

    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_EDITOR', 'ROLE_ADMIN')")
    @Operation(summary = "Gets an image from a tournament", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping(value = "/tournaments/{tournamentId}/type/{imageType}", produces = MediaType.APPLICATION_JSON_VALUE)
    public TournamentImageDTO getTournamentImage(@PathVariable("tournamentId") int tournamentId,
                                                 @PathVariable("imageType") TournamentImageType tournamentImageType,
                                                 HttpServletRequest request) {
        return tournamentImageController.get(tournamentId, tournamentImageType);
    }

    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_EDITOR', 'ROLE_ADMIN')")
    @Operation(summary = "Deletes the image from a tournament", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping(value = "/tournaments/{tournamentId}/type/{imageType}", produces = MediaType.APPLICATION_JSON_VALUE)
    public void deleteTournamentImage(@PathVariable("tournamentId") int tournamentId,
                                      @PathVariable("imageType") TournamentImageType tournamentImageType,
                                      HttpServletRequest request) {
        tournamentImageController.deleteByTournamentId(tournamentId, tournamentImageType);
    }
}
