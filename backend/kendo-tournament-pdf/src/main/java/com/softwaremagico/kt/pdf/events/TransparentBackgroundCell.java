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

import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;

import java.awt.*;

/**
 * Event for creating a transparent cell.
 */
public class TransparentBackgroundCell implements PdfPCellEvent {

    public PdfGState documentGs = new PdfGState();

    public TransparentBackgroundCell() {
        documentGs.setFillOpacity(0.6f);
        documentGs.setStrokeOpacity(1f);
    }

    @Override
    public void cellLayout(PdfPCell cell, Rectangle rect, PdfContentByte[] canvas) {
        final PdfContentByte cb = canvas[PdfPTable.BACKGROUNDCANVAS];
        cb.saveState();
        cb.setGState(documentGs);
        cb.setColorFill(Color.WHITE);
        cb.rectangle(rect.getLeft(), rect.getBottom(), rect.getWidth(), rect.getHeight());
        cb.fill();
        cb.restoreState();
    }
}
