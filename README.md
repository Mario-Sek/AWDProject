- Modeli:
	User (name, surname, username, email, password, (threads*, comments*, cars*,) points)
	Car (user*, make, model, image, reg_plate, logs*)
	LOG (car*, km_stand, date_on, fuel_liters, average_fuel, road_condition, ac, 	fuel_price)
	THREAD (user*, title, description, image, upvotes, downvotes, comments*)
	COMMENT (user*, thread*, description, image, upvotes, downvotes)
	REPLY (user*, comment*, description, upvotes, downvotes)
	
	- Pojasnuvanje -> Poeni(user) se za sekoe kontribuiranje a post, odnosno ima 	komentar/reply na nekoj thread)


- Stranici:
	
	MainPage - Home page so prikazani momentalni aktivni threads, opcija da ides da 	sporeduvas koli
	UserPage - pregled na site threads, comments, aktivnost na user (last online ...); pregled na koli po 	user i drugi negovi aktivnosti
	ComparisonPage - sporedba megju dve koli
	CarSpecsPage - pregled na edna kola bez sporedba
	
	+ drugi
	
	- Vlecenje od API postoecki informacii za kolive
	

- Momentalno TODO:
	- Baza Firebase

	- pocnuvanje react app, pravenje dobra apstrakcija (components, axiost, repositories 	etc.)
	- UserPage (dodavanje koli, contribs...)

	- test faza thredovi, komentari, replies

	- vlecenje apinja za sporedba

	- iscrtuvanje konturi za sporedba (OpenCV.js)
	
	- AI mislenje, skenira cel page, na kraj dava zaklucok shto e najdobro

	- ulepsavanje na stranica bootstrap, css, animacii ...
	
	-Logiranja security itn

