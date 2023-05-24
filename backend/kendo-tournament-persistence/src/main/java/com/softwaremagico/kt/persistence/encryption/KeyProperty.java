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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class KeyProperty {

    private static String databaseEncryptionKey;
    private static String databasePublicKey;
    private static String databasePrivateKey;

    public KeyProperty(@Value("${database.encryption.key:#{null}}") String databaseEncryptionKey,
                       @Value("${database.public.key:#{null}}") String databasePublicKey,
                       @Value("${database.private.key:#{null}}") String databasePrivateKey) {
        setDatabaseEncryptionKey(databaseEncryptionKey);
        setDatabasePublicKey(databasePublicKey);
        setDatabasePrivateKey(databasePrivateKey);
    }

    private static synchronized void setDatabaseEncryptionKey(String databaseEncryptionKey) {
        KeyProperty.databaseEncryptionKey = databaseEncryptionKey;
    }

    private static synchronized void setDatabasePublicKey(String databasePublicKey) {
        KeyProperty.databasePublicKey = databasePublicKey;
    }

    private static synchronized void setDatabasePrivateKey(String databasePrivateKey) {
        KeyProperty.databasePrivateKey = databasePrivateKey;
    }

    public static String getDatabaseEncryptionKey() {
        return databaseEncryptionKey;
    }

    public static String getDatabasePublicKey() {
        return databasePublicKey;
    }

    public static String getDatabasePrivateKey() {
        return databasePrivateKey;
    }
}
