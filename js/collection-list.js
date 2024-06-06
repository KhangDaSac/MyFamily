const url = '../data.json';
let dataCollection = [];
let dataCollectionCarousel = [];

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        dataCollection = data;
        let length = data.length;
        for (let i = 0; i < length; i++) {
            let title = data[i].name.split(';');

            if (title[3] == 'carousel') {
                dataCollectionCarousel.push(data[i]);
            }
            if (dataCollectionCarousel.length >= 3) break;
        }


        let collection_list = $('#collection-list');
        dataCollection.forEach(collection => {
            let title = collection.name.split(';');
            collection_list.append(`
                <div class="card col-10 col-sm-5 col-md-3 col-lg-2 m-3">
                    <img src="${collection.avata.thumbnailLink}" class="img-fluid my-3" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${title[1]}</h5>
                        <p class="card-text">${title[2]}</p>
                        <a href="collection.html?name=${title[0]}" class="btn btn-primary">Xem ảnh</a>
                    </div>
                </div>
            `)
        });

        let carousel_list = $('#carousel-list');
        let carousel_indicators_list = $('#carousel-indicators-list')
        let i = 0;
        dataCollectionCarousel.forEach(collection => {
            let title = collection.name.split(';');
            carousel_list.append(`
                <a href="collection.html?name=${title[0]}">
                    <div class="carousel-item ${!i ? 'active': ''}" data-bs-interval="4000">
                        <img src="${collection.avata.thumbnailLink}" class="d-block w-100" alt="...">
                        <div class="carousel-caption d-none d-md-block">
                            <h3>${title[1]}</h3>
                            <p>${title[2]}</p>
                        </div>
                    </div>  
                </a>
            `)

            carousel_indicators_list.append(`
                <button type="button" data-bs-target="#carouselCaptions" data-bs-slide-to="${i}" ${!i ? 'class="active"' : ''}
                 ${!i ? 'aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>
            `)
            i++;
        })
    })
    .catch(error => console.error('There was a problem with the fetch operation:', error));