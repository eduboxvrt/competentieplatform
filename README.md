# competentieplatform

UPDATE: Getting files ready for Heroku

Links
-----

frontend admin: https://competentieplatform-frontend.herokuapp.com
wachtwoord: eduboxAdmin4463

(vb: Cultuur)
frontend: https://competentieplatform-frontend.herokuapp.com/EDUbox.html?title=EDUbox%20Cultuur

backend: https://competentieplatform-backend.herokuapp.com/


Endpoints
---------

/				--> Geeft de server status en back-end versie terug
/api/getData 		--> Geeft alle competenties terug
/api/getLinks 		--> Geeft alle links naar de pagina's terug
/api/getEdubox/:title	--> Geeft data terug op basis van een bepaalde EDUbox titel
/api/deleteEdubox		--> Verwijderd een bepaalde EDUbox op basis van titel
/api/addEdubox		--> Voegt een Nieuwe EDUbox toe met titel, link & selectedData