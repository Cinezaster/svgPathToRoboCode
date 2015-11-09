TODO’s voor finale:

Perf plaat maken:
	- attiny integreren 
	- reset knop naar buiten werken
	- homing ir interrupters inbouwen OK
	- koeling toevoegen
	- 20V stepdown voor de arduino wordt nogal HEET	
Script painter:
	- kabel connector maken er niet altijd een kabel aan moet hangen 
Onderzoeken:
	- pulley oppervlak bewerken met soort van rubberachtige iets
	- snelheid vs detail?


BUGS 


Nice To Haves:
- lussen verwijderen en de arduino laten detecteren wanneer er te hard gestopt moet worden om per as tijdelijk een negatieve acceleratie toe te passen tot stilstand om dan terug te accelereer tot het laatste punt.

Snelheid optimalisatie:
- Vast stellen wat max acceleratie is (of decceleratie) voor beide armen. (test script dat de armen van de robot laat alterneren en dat serieel de snelheid print telkens de robot van richting veranderd. Via een potentiemeter kunnen we de snelheid opdrijven.)
- Vast stellen wat max snelheid is voor beide armen.(test script dat via een potentie meter de snelheid van de armen regelt en deze serieel print).
- Combinatie van max-acceleratie en max-snelheid staven via script
- Script ontwikkelen dat met max acceleratie rekening houd en de snelheid van beide armen schaalt en altijd naar max snelheid wil gaan.
	•	Elke lijn of curve die aan een stuk door loopt als een lijnobject zien. 
	•	Een eindpunt van een lijnobject kan ook een begin punt zijn.
	•	Script bepaald na elke lijn welk lijnobject het snelste is te bereiken voor de twee assen. Snelste betekend niet het kortste :-) (hoe berekenen? via simulatie of zijn er ander manier om dit te berekenen.
	•	Eerste lijn wordt ook bepaald door snelst vanaf punt 0
	•	Kan zijn dat voor arm 2 doorswingen sneller is als hij al een snelheid heeft in die richting (geen idee hoe dit zich gaat vertalen in het script)
	