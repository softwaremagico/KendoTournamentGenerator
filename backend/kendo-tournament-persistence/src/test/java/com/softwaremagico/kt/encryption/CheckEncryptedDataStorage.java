package com.softwaremagico.kt.encryption;

/*-
 * #%L
 * Kendo Tournament Manager (Persistence)
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.testng.AbstractTransactionalTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.HashSet;
import java.util.Set;

@SpringBootTest
@Test(groups = "encryptedData")
public class CheckEncryptedDataStorage extends AbstractTransactionalTestNGSpringContextTests {
    private static final int NUMBER_OF_ENTITIES = 1000;

    private Set<TestEntity> entities = new HashSet<>();

    @Autowired
    private TestEntityRepository testEntityRepository;


    public Set<TestEntity> createEntities() {
        Set<TestEntity> entities = new HashSet<>();
        for (int i = 0; i < NUMBER_OF_ENTITIES; i++) {
            entities.add(TestEntity.newEntity());
        }
        return entities;
    }

    @Test
    public void storeAndCheck() {
        Set<TestEntity> originalEntities = createEntities();
        entities = new HashSet<>(testEntityRepository.saveAll(originalEntities));
        Assert.assertEquals(testEntityRepository.count(), NUMBER_OF_ENTITIES);
        Assert.assertEquals(new HashSet<>(entities), originalEntities);
        Assert.assertEquals(new HashSet<>(testEntityRepository.findAll()), entities);

    }
}