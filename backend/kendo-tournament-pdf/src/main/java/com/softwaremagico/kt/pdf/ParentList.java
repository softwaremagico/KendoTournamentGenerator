package com.softwaremagico.kt.pdf;

/*-
 * #%L
 * Kendo Tournament Manager (PDF)
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

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.*;

public abstract class ParentList extends PdfDocument {
    protected static final int FOOTER_BORDER = 0;
    protected static final int HEADER_BORDER = 0;
    protected static final int CELL_BORDER = 0;

    protected static final int BORDER_WIDTH = 0;

    protected static final int TABLE_BORDER = 0;
    private static final float HEADER_SEPARATOR = 20f;


    /**
     * Creates the header of the document.
     *
     * @param document
     * @param mainTable
     * @param width
     * @param height
     * @param writer
     * @param font
     * @param fontSize
     */
    protected abstract void createHeaderRow(Document document, PdfPTable mainTable, float width, float height, PdfWriter writer, BaseFont font, int fontSize);

    protected void createRowSeparator(PdfPTable mainTable) {
        final PdfPCell cell = new PdfPCell();
        cell.setFixedHeight(HEADER_SEPARATOR);
        cell.setBorder(0);
        cell.setColspan(getTableWidths().length);
        mainTable.addCell(cell);
    }

    /**
     * Creates the body of the document.
     *
     * @param document
     * @param mainTable
     * @param width
     * @param height
     * @param writer
     * @param font
     * @param fontSize
     */
    protected abstract void createBodyRows(Document document, PdfPTable mainTable, float width, float height, PdfWriter writer, BaseFont font, int fontSize)
            throws EmptyPdfBodyException;

    /**
     * Creates the footer of the document.
     *
     * @param document
     * @param mainTable
     * @param width
     * @param height
     * @param writer
     * @param font
     * @param fontSize
     */
    protected abstract void createFooterRow(Document document, PdfPTable mainTable, float width, float height, PdfWriter writer, BaseFont font, int fontSize);

    /**
     * Obtain the width of the main table of the document.
     *
     * @return
     */
    public abstract float[] getTableWidths();

    /**
     * Creates an empty row. It is formed by as many cells as the width of the
     * table.
     *
     * @return
     */
    protected PdfPCell getEmptyRow() {
        return getEmptyCell(getTableWidths().length);
    }

    protected PdfPCell getEmptyRow(float height) {
        final PdfPCell cell = getEmptyCell(getTableWidths().length);
        cell.setMinimumHeight(height);
        return cell;
    }

    protected PdfPCell getEmptyCell(int colspan) {
        final Paragraph p = new Paragraph(" ", new Font(PdfTheme.getBasicFont(), PdfTheme.FONT_SIZE));
        final PdfPCell cell = new PdfPCell(p);
        cell.setColspan(colspan);
        cell.setBorder(0);
        return cell;
    }

    public PdfPCell getCell(String text, int colspan, int align) {
        return getCell(text, PdfTheme.getBasicFont(), colspan, align);
    }

    public PdfPCell getCell(String text, BaseFont font, int colspan, int align) {
        return getCell(text, CELL_BORDER, colspan, align, BaseColor.WHITE, font, PdfTheme.FONT_SIZE, Font.NORMAL);
    }

    public PdfPCell getCell(String text, BaseFont font, int colspan, int align, int fontType) {
        return getCell(text, CELL_BORDER, colspan, align, BaseColor.WHITE, font, PdfTheme.FONT_SIZE, fontType);
    }

    public PdfPCell getCell(String text, int border, int colspan, int align, Color color,
                            BaseFont font, int fontSize, int fontType) {
        final Paragraph p = new Paragraph(text, new Font(font, fontSize, fontType));
        final PdfPCell cell = new PdfPCell(p);
        cell.setColspan(colspan);
        cell.setBorderWidth(border);
        cell.setHorizontalAlignment(align);
        cell.setBackgroundColor(color);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        return cell;
    }

    /**
     * Creates a cell with a header (similar to html headers).
     *
     * @param text     Text to be putted in the cell.
     * @param border   Number of pixels of the border width.
     * @param align    Text alignment.
     * @param fontSize Size of the font.
     * @return
     */
    public PdfPCell getHeader(String text, int border, int align, int fontSize) {
        return getCell(text, border, getTableWidths().length, align, new Color(255, 255, 255), PdfTheme.getTitleFont(), fontSize, Font.BOLD);
    }

    /**
     * Section header.
     *
     * @param text   Text to be putted in the cell.
     * @param border Number of pixels of the border width.
     * @return
     */
    public PdfPCell getHeader1(String text, int border) {
        return getHeader(text, border, Element.ALIGN_CENTER, PdfTheme.FONT_SIZE + 10);
    }

    /**
     * The bigger header.
     *
     * @param text   Text to be putted in the cell.
     * @param border Number of pixels of the border width.
     * @param align  Text alignment.
     * @return
     */
    public PdfPCell getHeader1(String text, int border, int align) {
        return getHeader(text, border, align, PdfTheme.FONT_SIZE + 10);
    }

    /**
     * Subsection header.
     *
     * @param text   Text to be putted in the cell.
     * @param border Number of pixels of the border width.
     * @return
     */
    public PdfPCell getHeader2(String text, int border) {
        return getHeader(text, border, Element.ALIGN_CENTER, PdfTheme.FONT_SIZE + 6);
    }

    /**
     * Subsection header
     *
     * @param text   Text to be putted in the cell.
     * @param border Number of pixels of the border width.
     * @param align  Text alignment.
     * @return
     */
    public PdfPCell getHeader2(String text, int border, int align) {
        return getHeader(text, border, align, PdfTheme.FONT_SIZE + 6);
    }

    /**
     * Subsubsection header.
     *
     * @param text   Text to be putted in the cell.
     * @param border Number of pixels of the border width.
     * @return
     */
    public PdfPCell getHeader3(String text, int border) {
        return getHeader(text, border, Element.ALIGN_CENTER, PdfTheme.FONT_SIZE + 4);
    }

    /**
     * Subsubsection header.
     *
     * @param text   Text to be putted in the cell.
     * @param border Number of pixels of the border width.
     * @return
     */
    public PdfPCell getHeader4(String text, int border) {
        return getHeader(text, border, Element.ALIGN_CENTER, PdfTheme.FONT_SIZE + 2);
    }

    /**
     * Defines the properties of the main table of the document.
     *
     * @param mainTable
     */
    public abstract void setTableProperties(PdfPTable mainTable);

    /**
     * Creates the main table of the document.
     *
     * @param document
     */
    public void createContent(Document document, PdfWriter writer) throws EmptyPdfBodyException {
        final PdfPCell cellHeader;
        final PdfPCell cellFooter;
        final PdfPTable mainTable = new PdfPTable(getTableWidths());
        setTableProperties(mainTable);

        cellHeader = new PdfPCell();
        cellHeader.setColspan(getTableWidths().length);

        cellFooter = new PdfPCell();
        cellFooter.setColspan(getTableWidths().length);

        mainTable.setHeaderRows(2);
        mainTable.setFooterRows(1);


        createHeaderRow(document, mainTable, document.getPageSize().getWidth(), document.getPageSize().getHeight(), writer, PdfTheme.getBasicFont(),
                PdfTheme.HEADER_FONT_SIZE);
        createFooterRow(document, mainTable, document.getPageSize().getWidth(), document.getPageSize().getHeight(), writer, PdfTheme.getBasicFont(),
                PdfTheme.FOOTER_FONT_SIZE);
        createRowSeparator(mainTable);
        createBodyRows(document, mainTable, document.getPageSize().getWidth(), document.getPageSize().getHeight(), writer, PdfTheme.getBasicFont(),
                PdfTheme.FONT_SIZE);
        createRowSeparator(mainTable);

        document.add(mainTable);
    }

}
