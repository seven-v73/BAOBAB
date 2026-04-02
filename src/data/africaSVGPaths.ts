// Paths SVG améliorés et ajustés pour chaque pays africain
// Coordonnées normalisées pour viewBox="0 0 1000 1200"
// Formes basées sur la géographie réelle de l'Afrique

export const africaSVGPaths: Record<string, string> = {
  // Afrique du Nord - Formes ajustées
  'MA': 'M 120 95 L 200 90 L 220 145 L 215 205 L 150 200 L 130 155 L 120 125 Z', // Maroc
  'DZ': 'M 200 90 L 490 85 L 510 250 L 500 410 L 240 405 L 200 250 Z', // Algérie - très grand rectangle
  'TN': 'M 300 115 L 360 110 L 370 155 L 350 195 L 300 190 Z', // Tunisie
  'LY': 'M 490 85 L 630 80 L 650 230 L 630 380 L 510 375 L 490 230 Z', // Libye
  'EG': 'M 630 80 L 770 75 L 790 210 L 770 310 L 650 305 Z', // Égypte
  'SD': 'M 630 230 L 770 220 L 790 400 L 770 570 L 650 560 L 630 400 Z', // Soudan
  'SS': 'M 670 400 L 740 395 L 750 500 L 730 580 L 670 570 Z', // Soudan du Sud
  'EH': 'M 150 140 L 270 135 L 280 230 L 270 310 L 180 305 L 150 230 Z', // Sahara occidental
  
  // Afrique de l'Ouest - Formes ajustées
  'MR': 'M 140 230 L 310 225 L 320 330 L 310 410 L 160 405 L 140 330 Z', // Mauritanie
  'SN': 'M 120 410 L 230 405 L 240 480 L 220 550 L 130 545 Z', // Sénégal
  'GM': 'M 140 490 L 190 488 L 195 520 L 185 540 L 145 538 Z', // Gambie - très petit
  'GW': 'M 160 550 L 230 545 L 235 590 L 225 620 L 170 615 Z', // Guinée-Bissau
  'GN': 'M 230 480 L 350 475 L 360 540 L 350 610 L 240 605 Z', // Guinée
  'SL': 'M 270 540 L 350 535 L 355 590 L 345 630 L 280 625 Z', // Sierra Leone
  'LR': 'M 350 570 L 420 565 L 430 620 L 420 660 L 360 655 Z', // Libéria
  'CI': 'M 350 610 L 450 605 L 460 670 L 450 730 L 360 725 Z', // Côte d'Ivoire
  'GH': 'M 450 650 L 550 645 L 560 710 L 550 770 L 460 765 Z', // Ghana
  'TG': 'M 550 690 L 610 685 L 620 740 L 610 780 L 560 775 Z', // Togo
  'BJ': 'M 610 690 L 670 685 L 680 740 L 670 780 L 620 775 Z', // Bénin
  'NG': 'M 510 650 L 650 645 L 670 720 L 650 790 L 520 785 Z', // Nigeria - grand pays
  'NE': 'M 510 460 L 620 455 L 630 540 L 620 600 L 520 595 Z', // Niger
  'ML': 'M 310 360 L 510 355 L 520 460 L 510 540 L 320 535 Z', // Mali
  'BF': 'M 410 510 L 510 505 L 520 580 L 510 640 L 420 635 Z', // Burkina Faso
  'TD': 'M 570 410 L 670 405 L 680 510 L 670 600 L 580 595 Z', // Tchad
  
  // Afrique Centrale - Formes ajustées
  'CM': 'M 530 690 L 630 685 L 640 750 L 630 810 L 540 805 Z', // Cameroun
  'CF': 'M 610 560 L 710 555 L 720 640 L 710 710 L 620 705 Z', // République centrafricaine
  'GQ': 'M 530 770 L 590 768 L 595 790 L 585 810 L 540 808 Z', // Guinée équatoriale - petit
  'GA': 'M 550 770 L 650 765 L 660 830 L 650 890 L 560 885 Z', // Gabon
  'CG': 'M 610 770 L 710 765 L 720 850 L 710 920 L 620 915 Z', // Congo
  'CD': 'M 610 670 L 770 665 L 790 820 L 770 970 L 620 965 Z', // RD Congo - très grand
  'AO': 'M 530 820 L 650 815 L 660 920 L 650 1020 L 540 1015 Z', // Angola
  'ST': 'M 510 820 L 550 818 L 555 840 L 545 860 L 520 858 Z', // São Tomé-et-Príncipe - île
  'CV': 'M 70 470 L 150 465 L 160 520 L 150 570 L 80 565 Z', // Cap-Vert - îles
  
  // Afrique de l'Est - Formes ajustées
  'ER': 'M 770 250 L 830 245 L 840 330 L 830 410 L 790 405 Z', // Érythrée
  'ET': 'M 770 250 L 880 245 L 900 410 L 880 570 L 790 565 Z', // Éthiopie
  'DJ': 'M 850 330 L 890 328 L 895 370 L 885 410 L 855 408 Z', // Djibouti - très petit
  'SO': 'M 870 410 L 970 405 L 990 570 L 970 720 L 880 715 Z', // Somalie
  'KE': 'M 830 570 L 930 565 L 940 670 L 930 770 L 840 765 Z', // Kenya
  'UG': 'M 810 670 L 890 665 L 900 750 L 890 810 L 820 805 Z', // Ouganda
  'RW': 'M 810 720 L 860 718 L 865 760 L 855 790 L 815 788 Z', // Rwanda - petit
  'BI': 'M 810 750 L 860 748 L 865 790 L 855 820 L 815 818 Z', // Burundi - petit
  'TZ': 'M 810 720 L 920 715 L 940 870 L 920 1020 L 820 1015 Z', // Tanzanie
  'MW': 'M 810 820 L 890 815 L 900 890 L 890 950 L 820 945 Z', // Malawi
  'ZM': 'M 710 770 L 810 765 L 820 870 L 810 970 L 720 965 Z', // Zambie
  'ZW': 'M 750 920 L 850 915 L 860 990 L 850 1050 L 760 1045 Z', // Zimbabwe
  'BW': 'M 670 920 L 770 915 L 780 990 L 770 1050 L 680 1045 Z', // Botswana
  'MZ': 'M 830 920 L 930 915 L 950 1070 L 930 1170 L 840 1165 Z', // Mozambique
  'MG': 'M 950 920 L 1030 910 L 1050 1070 L 1030 1220 L 960 1215 Z', // Madagascar - grande île
  
  // Afrique Australe - Formes ajustées
  'ZA': 'M 670 1020 L 770 1015 L 790 1120 L 770 1190 L 680 1185 Z', // Afrique du Sud
  'LS': 'M 700 1080 L 730 1078 L 735 1110 L 725 1130 L 705 1128 Z', // Lesotho - enclave
  'SZ': 'M 730 1100 L 790 1098 L 795 1130 L 785 1150 L 740 1148 Z', // Eswatini
  'NA': 'M 610 970 L 710 965 L 720 1070 L 710 1150 L 620 1145 Z', // Namibie
  
  // Îles - Formes ajustées
  'MU': 'M 990 1040 L 1010 1038 L 1015 1060 L 1005 1080 L 995 1078 Z', // Maurice
  'SC': 'M 990 790 L 1010 788 L 1015 810 L 1005 830 L 995 828 Z', // Seychelles
  'KM': 'M 950 790 L 990 788 L 995 810 L 985 830 L 955 828 Z', // Comores
}
