package com.softwaremagico.kt.persistence.encryption;

/*-
 * #%L
 * Kendo Tournament Manager (Persistence)
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

import com.softwaremagico.kt.logger.EncryptorLogger;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Converter(autoApply = true)
public class LocalDateCryptoConverter extends AbstractCryptoConverter<LocalDate> implements AttributeConverter<LocalDate, String> {

    public LocalDateCryptoConverter() {
        this(new CipherInitializer());
    }

    public LocalDateCryptoConverter(CipherInitializer cipherInitializer) {
        super(cipherInitializer);
    }

    @Override
    protected boolean isNotNullOrEmpty(LocalDate attribute) {
        return attribute != null;
    }

    @Override
    protected LocalDate stringToEntityAttribute(String dbData) {
        try {
            return (dbData == null || dbData.isEmpty()) ? null : LocalDate.parse(dbData);
        } catch (DateTimeParseException nfe) {
            EncryptorLogger.errorMessage(this.getClass().getName(), "Invalid date value '{}' in database.", dbData);
            return null;
        }
    }

    @Override
    protected String entityAttributeToString(LocalDate attribute) {
        return attribute == null ? null : attribute.toString() + "";
    }
}
