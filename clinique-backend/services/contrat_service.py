"""
Service for generating Contract PDFs.
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from io import BytesIO
from datetime import datetime

class ContratService:
    @staticmethod
    def generate_pdf(contrat) -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            alignment=1,  # Center
            spaceAfter=30,
            textColor=colors.black
        )
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=11,
            spaceAfter=10,
            textColor=colors.black,
            fontName='Helvetica-Bold'
        )
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            alignment=4  # Justified
        )

        elements = []

        # Custom styles
        subtitle_italic = ParagraphStyle(
            'SubtitleItalic',
            parent=styles['Normal'],
            fontSize=10,
            alignment=1,
            textColor=colors.grey,
            fontName='Helvetica-Oblique'
        )

        # Title Logic
        type_text = "À DURÉE INDÉTERMINÉE" if contrat.type_contrat == "CDI" else f"DE TYPE {contrat.type_contrat.upper()}"
        if contrat.type_contrat == "CDD":
             type_text = "À DURÉE DÉTERMINÉE"
        
        title_text = f"CONTRAT DE TRAVAIL {type_text}"

        # Header Logo/Name (Simulated)
        elements.append(Paragraph("<b>CLINIQUE GESTION MÉDICALE</b>", subtitle_style))
        elements.append(Spacer(1, 20))

        # Title Section
        elements.append(Paragraph(title_text, title_style))
        elements.append(Paragraph("Soumis aux dispositions de la Convention Collective de l'Hospitalisation Privée", subtitle_italic))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("_" * 60, title_style)) # Horizontal line separator
        elements.append(Spacer(1, 20))

        # Parties
        elements.append(Paragraph("<b>ENTRE LES SOUSSIGNÉS :</b>", subtitle_style))
        elements.append(Spacer(1, 10))

        # Employer Details (Detailed)
        employer_details = [
            "<b>La Clinique Gestion Médicale</b>",
            "Dont le siège social est situé à 15 Avenue de la Liberté, 1002 Tunis",
            "Immatriculée au Registre National des Entreprises sous le numéro 123456789",
            "Représentée par <b>M. Le Directeur Général</b>, agissant en cette qualité,"
        ]
        
        for line in employer_details:
            elements.append(Paragraph(line, normal_style))
        
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("D'une part,", ParagraphStyle('RightAlign', parent=normal_style, alignment=2)))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"<b>ET : M./Mme {contrat.nom_employe}</b>,", normal_style))
        elements.append(Paragraph("Ci-après dénommé(e) « Le Salarié »,"))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("D'autre part,", ParagraphStyle('RightAlign', parent=normal_style, alignment=2)))
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("<b>IL A ÉTÉ CONVENU CE QUI SUIT :</b>", subtitle_style))
        elements.append(Spacer(1, 15))

        # Article 1: Engagement
        elements.append(Paragraph("ARTICLE 1 – ENGAGEMENT", subtitle_style))
        text_engagement = f"""
        Le Salarié est engagé au sein de la Clinique Gestion Médicale en qualité de <b>{contrat.poste}</b>, 
        dans le cadre d'un contrat de type <b>{contrat.type_contrat}</b>.
        """
        elements.append(Paragraph(text_engagement, normal_style))
        elements.append(Spacer(1, 10))

        # Article 2: Durée
        elements.append(Paragraph("ARTICLE 2 – DURÉE", subtitle_style))
        date_fin_str = contrat.date_fin.strftime('%d/%m/%Y') if contrat.date_fin else "indéterminée"
        text_duree = f"""
        Le présent contrat prend effet à compter du <b>{contrat.date_debut.strftime('%d/%m/%Y')}</b> 
        et prendra fin le <b>{date_fin_str}</b>, sauf renouvellement ou résiliation anticipée conformément à la législation en vigueur.
        """
        elements.append(Paragraph(text_duree, normal_style))
        elements.append(Spacer(1, 10))

        # Article 3: Rémunération
        elements.append(Paragraph("ARTICLE 3 – RÉMUNÉRATION", subtitle_style))
        text_remuneration = f"""
        En contrepartie de ses services, le Salarié percevra une rémunération brute mensuelle de <b>{contrat.salaire:,.2f} dinars tunisiens (DT)</b>.
        """
        elements.append(Paragraph(text_remuneration, normal_style))
        elements.append(Spacer(1, 10))

        # Article 4: Horaires
        elements.append(Paragraph("ARTICLE 4 – HORAIRES DE TRAVAIL", subtitle_style))
        text_horaires = f"""
        Le temps de travail est fixé selon les modalités suivantes : {contrat.horaires}, sous réserve des nécessités de service définies par l'Employeur.
        """
        elements.append(Paragraph(text_horaires, normal_style))
        elements.append(Spacer(1, 10))

        # Article 5: Missions
        elements.append(Paragraph("ARTICLE 5 – MISSIONS", subtitle_style))
        text_missions = f"""
        Le Salarié exercera les fonctions suivantes : {contrat.missions}. 
        Il s'engage à accomplir sa mission avec loyauté et diligence, dans le respect des normes professionnelles en vigueur.
        """
        elements.append(Paragraph(text_missions, normal_style))
        elements.append(Spacer(1, 10))

        # Article 6: Confidentialité (New)
        elements.append(Paragraph("ARTICLE 6 – CONFIDENTIALITÉ ET DONNÉES MÉDICALES", subtitle_style))
        text_confidentialite = """
        Compte tenu de la nature de l'activité de la Clinique, le Salarié s'engage expressément à respecter le secret professionnel le plus absolu. 
        Il s'interdit de divulguer, directement ou indirectement, toute information concernant les patients, les dossiers médicaux, 
        ainsi que toute donnée confidentielle relative à l'organisation ou au fonctionnement de la Clinique dont il pourrait avoir connaissance 
        dans l'exercice de ses fonctions. Tout manquement à cette obligation pourra constituer une faute grave justifiant la rupture immédiate du présent contrat.
        """
        elements.append(Paragraph(text_confidentialite, normal_style))
        elements.append(Spacer(1, 30))

        # Signatures Section
        date_creation = datetime.now().strftime('%d/%m/%Y')
        elements.append(Paragraph(f"Fait à Tunis, le {date_creation}, en deux exemplaires originaux.", normal_style))
        elements.append(Spacer(1, 30))

        # Signature Table
        data = [
            ["POUR L'EMPLOYEUR", "POUR LE SALARIÉ"],
            ["(Lu et approuvé)", "(Lu et approuvé)"],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            [
                f"Signé le : {contrat.signature_employeur.strftime('%d/%m/%Y') if contrat.signature_employeur else '....................'}",
                f"Signé le : {contrat.signature_employe.strftime('%d/%m/%Y') if contrat.signature_employe else '....................'}"
            ]
        ]
        
        table = Table(data, colWidths=[9*cm, 9*cm])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ]))
        
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)
        return buffer
