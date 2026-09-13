# Vectoren REM

Adaptieve remediëringssite voor **H1 Vectoren – 3SO**.

## Wat zit erin?
- pagina-per-pagina navigatie (geen lange scrollleerlijn)
- drie remediëringsmodules:
  1. vectoren vergelijken
  2. vectoren tekenen
  3. vectoruitdrukkingen vereenvoudigen
- korte diagnose per module
- fout antwoord → gerichte uitleg → basisoefeningen
- voldoende basis → complexere oefeningen
- onvoldoende basis → extra uitleg + nieuwe poging
- voortgang lokaal bewaard met `localStorage`
- geen externe libraries nodig

## Publiceren op GitHub Pages
1. Maak een nieuwe repository, bv. `vectoren-rem`.
2. Upload `index.html`, `style.css`, `app.js` en deze `README.md` in de root van de repository.
3. Ga naar **Settings → Pages**.
4. Kies **Deploy from a branch**.
5. Selecteer branch `main` en map `/ (root)`.
6. Klik **Save**.

Na enkele minuten staat de site online via de GitHub Pages-link.

## Later adaptiever maken
Deze versie werkt volledig lokaal en is dus ideaal als eerste REM-prototype. Een volgende versie kan via Supabase per leerling opslaan:
- fouttype per vraag
- aantal pogingen
- tijd per onderdeel
- beheersingsniveau per leerdoel
- aanbevolen volgende oefenroute

Daarvoor kan dezelfde frontend behouden blijven en enkel de opslag/adaptiviteitslaag uitgebreid worden.
