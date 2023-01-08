package com.softwaremagico.kt.pdf.events;

/*-
 * #%L
 * Kendo Tournament Manager (PDF)
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

import com.lowagie.text.BadElementException;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPTableEvent;
import com.softwaremagico.kt.logger.KendoTournamentLogger;

import java.io.IOException;
import java.io.InputStream;

public class TableBackgroundEvent implements PdfPTableEvent {
    private static Image bgImage;

    static {
        try (InputStream inputStream = TableBackgroundEvent.class.getResourceAsStream("/images/accreditation-background.png");) {
            if (inputStream != null) {
                bgImage = Image.getInstance(inputStream.readAllBytes());
            }
        } catch (NullPointerException | BadElementException | IOException ex) {
            KendoTournamentLogger.severe(TableBackgroundEvent.class.getName(), "No background image found!");
        }
    }

    @Override
    public void tableLayout(PdfPTable ppt, float[][] widths, float[] heights, int headerRows, int rowStart,
                            PdfContentByte[] pcbs) {
        try {
            if (bgImage != null) {
                final int columns = widths[0].length - 1;
                final Rectangle rect = new Rectangle(widths[0][0], heights[0], widths[0][columns], heights[1]);
                pcbs[PdfPTable.BASECANVAS].addImage(bgImage, rect.getWidth(), 0, 0, -rect.getHeight(),
                        rect.getLeft(), rect.getTop());
            }
        } catch (Exception e) {
            KendoTournamentLogger.errorMessage(this.getClass().getName(), e);
        }
    }
}