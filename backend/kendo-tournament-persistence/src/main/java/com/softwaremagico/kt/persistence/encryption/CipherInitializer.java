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

import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;

import static com.softwaremagico.kt.persistence.encryption.KeyProperty.databaseEncryptionKey;

public class CipherInitializer {

    private static final String CIPHER_INSTANCE_NAME = "AES/GCM/NoPadding";
    private static final String SECRET_KEY_ALGORITHM = "AES";
    private static final String SECRET_KEY_FACTORY_ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int AES_KEY_SIZE = 256;
    private static final String SECRET_MESSAGE_DIGEST_ALGORITHM = "SHA-256";
    private static final int TAG_LENGTH_BIT = 128;
    public static final int GCM_IV_LENGTH = 12;
    private static final int SALT_LENGTH_BYTE = 16;
    private static final SecureRandom random = new SecureRandom();
    private Cipher cipher;
    private SecretKeySpec keySpec;

    // AES-GCM needs GCMParameterSpec
    public String encrypt(String input) throws InvalidAlgorithmParameterException, InvalidKeyException,
            BadPaddingException, IllegalBlockSizeException, NoSuchAlgorithmException, InvalidKeySpecException, NoSuchPaddingException {
        return encrypt(input, databaseEncryptionKey);
    }

    public String encrypt(String input, String password) throws InvalidAlgorithmParameterException, InvalidKeyException,
            BadPaddingException, IllegalBlockSizeException, NoSuchAlgorithmException, InvalidKeySpecException, NoSuchPaddingException {
        final byte[] salt = getRandomNonce(SALT_LENGTH_BYTE);
        final byte[] iv = getRandomNonce(GCM_IV_LENGTH);
        getCipher().init(Cipher.ENCRYPT_MODE, getAESKey(password, salt), new GCMParameterSpec(TAG_LENGTH_BIT, iv));
        final byte[] encryptedText = cipher.doFinal(input.getBytes(StandardCharsets.UTF_8));
        final byte[] encryptedBytes = ByteBuffer.allocate(iv.length + salt.length + encryptedText.length)
                .put(iv)
                .put(salt)
                .put(encryptedText)
                .array();
        final String encodedValue = Base64.getEncoder().encodeToString(encryptedBytes);
        EncryptorLogger.debug(this.getClass().getName(), "Encrypted value for '{}' is '{}'.", input, encodedValue);
        return encodedValue;
    }

    public String decrypt(String encrypted) throws BadPaddingException, IllegalBlockSizeException, InvalidAlgorithmParameterException,
            InvalidKeyException, NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeySpecException {
        return decrypt(encrypted, databaseEncryptionKey);
    }


    public String decrypt(String encrypted, String password) throws BadPaddingException, IllegalBlockSizeException, InvalidAlgorithmParameterException,
            InvalidKeyException, NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeySpecException {
        final byte[] encryptedBytes = Base64.getDecoder().decode(encrypted.getBytes(StandardCharsets.UTF_8));
        final ByteBuffer byteBuffer = ByteBuffer.wrap(encryptedBytes);

        final byte[] iv = new byte[GCM_IV_LENGTH];
        byteBuffer.get(iv);
        final byte[] salt = new byte[SALT_LENGTH_BYTE];
        byteBuffer.get(salt);
        final byte[] cipherText = new byte[byteBuffer.remaining()];
        byteBuffer.get(cipherText);

        getCipher().init(Cipher.DECRYPT_MODE, getAESKey(password, salt), new GCMParameterSpec(TAG_LENGTH_BIT, iv));
        final byte[] decryptedBytes = cipher.doFinal(cipherText);
        final String decrypted = new String(decryptedBytes, StandardCharsets.UTF_8);
        EncryptorLogger.debug(this.getClass().getName(), "Decrypted value for '{}' is '{}'.", encrypted, decrypted);
        return decrypted;
    }

    private Cipher getCipher() throws NoSuchPaddingException, NoSuchAlgorithmException {
        if (cipher == null) {
            cipher = Cipher.getInstance(CIPHER_INSTANCE_NAME);
        }
        return cipher;
    }

    public static byte[] getRandomNonce(int numBytes) {
        final byte[] nonce = new byte[numBytes];
        random.nextBytes(nonce);
        return nonce;
    }

    // AES secret key
    public static SecretKeySpec getAESKey(byte[] salt) throws NoSuchAlgorithmException, InvalidKeySpecException {
        return getAESKey(databaseEncryptionKey, salt);
    }

    public static SecretKeySpec getAESKey(String password, byte[] salt) throws NoSuchAlgorithmException, InvalidKeySpecException {
        final SecretKeyFactory factory = SecretKeyFactory.getInstance(SECRET_KEY_FACTORY_ALGORITHM);
        final KeySpec spec = new PBEKeySpec(password.toCharArray(), salt,
                512, 256);
        return new SecretKeySpec(factory.generateSecret(spec).getEncoded(), SECRET_KEY_ALGORITHM);
    }
}
